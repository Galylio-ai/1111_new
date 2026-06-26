#!/usr/bin/env node
/**
 * Copy specifications from catalog_db.product_details → retail_db.product_specs.
 *
 * catalog_db (Mongo migration) often has rich specs while retail_db does not.
 * Matches retail products by:
 *   1. source_product_id = catalog.source_product_id
 *   2. source_product_id = catalog product_details.sku
    3. shop_prices.shop_product_url = catalog.products.url
 *
 * Usage (VPS):
 *   export RETAIL_DB_URL='postgresql://retail_user:PASS@localhost:5433/retail_db'
 *   export CATALOG_DB_URL='postgresql://catalog_user:PASS@localhost:5437/catalog_db'
 *   node scripts/sync-retail-specs-from-catalog.mjs
 *   node scripts/sync-retail-specs-from-catalog.mjs --dry-run
 */
import { existsSync, readFileSync } from "fs";
import path from "path";
import { fileURLToPath } from "url";
import pg from "pg";
import { normalizeProductUrl, specificationsToRows } from "./lib/extractProductSpecs.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const envPath = path.join(__dirname, "..", ".env.local");
if (existsSync(envPath)) {
  for (const line of readFileSync(envPath, "utf8").split("\n")) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
    if (m && !process.env[m[1]]) process.env[m[1]] = m[2].replace(/^["']|["']$/g, "");
  }
}

const DRY = process.argv.includes("--dry-run");
const RETAIL_URL = process.env.RETAIL_DB_URL;
const CATALOG_URL = process.env.CATALOG_DB_URL;

if (!RETAIL_URL || !CATALOG_URL) {
  console.error("RETAIL_DB_URL and CATALOG_DB_URL are required");
  process.exit(1);
}

async function insertSpecs(client, productId, specs) {
  let n = 0;
  for (const s of specs) {
    const r = await client.query(
      `INSERT INTO product_specs (product_id, spec_key, spec_value)
       VALUES ($1, $2, $3)
       ON CONFLICT (product_id, spec_key, spec_value) DO NOTHING`,
      [productId, s.spec_key, s.spec_value]
    );
    n += r.rowCount ?? 0;
  }
  return n;
}

async function main() {
  console.log(`Sync retail specs from catalog_db${DRY ? " (dry-run)" : ""}`);

  const catalogPool = new pg.Pool({ connectionString: CATALOG_URL, max: 4 });
  const retailPool = new pg.Pool({ connectionString: RETAIL_URL, max: 4 });

  try {
    const { rows: catalogRows } = await catalogPool.query(`
      SELECT p.url, p.source_product_id, pd.sku, pd.specifications
      FROM products p
      JOIN product_details pd ON pd.product_id = p.id
      WHERE pd.specifications IS NOT NULL
        AND pd.specifications::text NOT IN ('null', '{}', '[]')
    `);

    console.log(`  Catalog rows with specifications: ${catalogRows.length.toLocaleString("fr-FR")}`);

    if (!catalogRows.length) {
      console.log("\n  No specifications in catalog_db either.");
      console.log("  Run migrate-mongo-catalog.mjs or importDetailedSpecs.js to populate source data.");
      return;
    }

    /** @type {Map<string, unknown>} */
    const bySourceId = new Map();
    /** @type {Map<string, unknown>} */
    const bySku = new Map();
    /** @type {Map<string, unknown>} */
    const byUrl = new Map();

    for (const row of catalogRows) {
      const specs = row.specifications;
      if (row.source_product_id) bySourceId.set(String(row.source_product_id), specs);
      if (row.sku) bySku.set(String(row.sku), specs);
      if (row.url) byUrl.set(normalizeProductUrl(row.url), specs);
    }

    const { rows: retailProducts } = await retailPool.query(`
      SELECT p.id, p.name, p.source_product_id,
             array_remove(array_agg(DISTINCT sp.shop_product_url), NULL) AS shop_urls
      FROM products p
      LEFT JOIN shop_prices sp ON sp.product_id = p.id
      GROUP BY p.id, p.name, p.source_product_id
    `);

    console.log(`  Retail products to match: ${retailProducts.length.toLocaleString("fr-FR")}`);

    const retailClient = await retailPool.connect();
    let matched = 0;
    let specRowsWritten = 0;
    let noMatch = 0;

    try {
      if (!DRY) await retailClient.query("BEGIN");

      for (const p of retailProducts) {
        let rawSpecs = null;
        const ref = p.source_product_id ? String(p.source_product_id) : "";

        if (ref && bySourceId.has(ref)) rawSpecs = bySourceId.get(ref);
        else if (ref && bySku.has(ref)) rawSpecs = bySku.get(ref);
        else {
          for (const url of p.shop_urls ?? []) {
            const key = normalizeProductUrl(url);
            if (key && byUrl.has(key)) {
              rawSpecs = byUrl.get(key);
              break;
            }
          }
        }

        if (!rawSpecs) {
          noMatch++;
          continue;
        }

        const specs = specificationsToRows(rawSpecs);
        if (!specs.length) continue;

        matched++;
        if (!DRY) specRowsWritten += await insertSpecs(retailClient, p.id, specs);
        else specRowsWritten += specs.length;
      }

      if (!DRY) await retailClient.query("COMMIT");
    } catch (err) {
      if (!DRY) await retailClient.query("ROLLBACK").catch(() => {});
      throw err;
    } finally {
      retailClient.release();
    }

    const stats = (
      await retailPool.query(`
        SELECT
          (SELECT COUNT(*)::int FROM product_specs) AS spec_rows,
          (SELECT COUNT(DISTINCT product_id)::int FROM product_specs) AS products_with_specs
      `)
    ).rows[0];

    console.log("\nDone.");
    console.log(`  Retail products matched     : ${matched.toLocaleString("fr-FR")}`);
    console.log(`  Retail products unmatched   : ${noMatch.toLocaleString("fr-FR")}`);
    console.log(`  Spec rows ${DRY ? "would write" : "inserted"}       : ${specRowsWritten.toLocaleString("fr-FR")}`);
    console.log(`  product_specs total now     : ${stats.spec_rows.toLocaleString("fr-FR")} rows / ${stats.products_with_specs.toLocaleString("fr-FR")} products`);
  } finally {
    await catalogPool.end();
    await retailPool.end();
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
