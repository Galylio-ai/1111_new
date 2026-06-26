#!/usr/bin/env node
/**
 * Backfill product_specs for retail_db from a matched catalog JSONL.
 *
 * Supports:
 *   · matched_products.jsonl (1111.tn ynaan z) — id, normalized_sku, specs[{key,value}], prices[]
 *   · legacy matched.jsonl — reference, specifications/specs, offers[]
 *
 * Matches retail products by (in order):
 *   1. products.source_product_id = id | catalog_id | reference | normalized_sku
 *   2. shop_prices.shop_product_url = prices[].url (or offers[].source_url)
 *
 * Usage (VPS):
 *   export RETAIL_DB_URL='postgresql://retail_user:PASS@localhost:5433/retail_db'
 *   node scripts/backfill-retail-specs.mjs /path/to/matched_products.jsonl
 *   node scripts/backfill-retail-specs.mjs /path/to/matched_products.jsonl --dry-run
 */
import { createReadStream, existsSync, readFileSync } from "fs";
import { createInterface } from "readline";
import path from "path";
import { fileURLToPath } from "url";
import pg from "pg";
import { extractProductSpecs, normalizeProductUrl } from "./lib/extractProductSpecs.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const envPath = path.join(__dirname, "..", ".env.local");
if (existsSync(envPath)) {
  for (const line of readFileSync(envPath, "utf8").split("\n")) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
    if (m && !process.env[m[1]]) process.env[m[1]] = m[2].replace(/^["']|["']$/g, "");
  }
}

const DRY = process.argv.includes("--dry-run");
const fileArg = process.argv.find((a) => !a.startsWith("-") && a.endsWith(".jsonl"));
const JSONL = fileArg ?? path.join(__dirname, "../data_matching/prepared_retail_catalog/matched.jsonl");

const DB_URL = process.env.RETAIL_DB_URL;
if (!DB_URL) {
  console.error("RETAIL_DB_URL is required");
  process.exit(1);
}
if (!existsSync(JSONL)) {
  console.error(`JSONL not found: ${JSONL}`);
  process.exit(1);
}

const pool = new pg.Pool({ connectionString: DB_URL, max: 4 });

/** @param {Record<string, unknown>} rec */
function catalogMatchKeys(rec) {
  const keys = new Set();
  const add = (v) => {
    if (v == null || v === "") return;
    const s = String(v).trim();
    if (!s) return;
    keys.add(s);
    keys.add(s.toLowerCase());
  };

  add(rec.id);
  add(rec.catalog_id);
  add(rec.reference);
  add(rec.normalized_sku);
  add(rec.match_key);

  const specList = Array.isArray(rec.specs) ? rec.specs : [];
  for (const s of specList) {
    if (s && typeof s === "object" && /** @type {{ key?: string }} */ (s).key === "gtin") {
      add(/** @type {{ value?: string }} */ (s).value);
    }
  }

  const priceRows = [
    ...(Array.isArray(rec.prices) ? rec.prices : []),
    ...(Array.isArray(rec.offers) ? rec.offers : []),
  ];
  for (const row of priceRows) {
    if (!row || typeof row !== "object") continue;
    const url = /** @type {{ url?: string; source_url?: string }} */ (row).url
      ?? /** @type {{ source_url?: string }} */ (row).source_url;
    if (url) keys.add(normalizeProductUrl(url));
  }

  return keys;
}

/** @param {string} label */
function recordLabel(rec, label) {
  return rec.title ?? rec.name ?? label;
}

async function insertSpecs(client, productId, specs) {
  if (!specs.length) return 0;
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

/** @returns {Promise<Map<string, { spec_key: string; spec_value: string }[]>>} */
async function indexCatalogSpecs() {
  /** @type {Map<string, { spec_key: string; spec_value: string }[]>} */
  const byKey = new Map();

  const rl = createInterface({
    input: createReadStream(JSONL, { encoding: "utf8" }),
    crlfDelay: Infinity,
  });

  let lines = 0;
  let withSpecsInFile = 0;

  for await (const line of rl) {
    if (!line.trim()) continue;
    lines++;
    let rec;
    try {
      rec = JSON.parse(line);
    } catch {
      continue;
    }

    const specs = extractProductSpecs(rec);
    if (!specs.length) continue;
    withSpecsInFile++;

    for (const key of catalogMatchKeys(rec)) {
      if (!byKey.has(key)) byKey.set(key, specs);
    }
  }

  console.log(`  JSONL lines scanned       : ${lines.toLocaleString("fr-FR")}`);
  console.log(`  Records with specs in file: ${withSpecsInFile.toLocaleString("fr-FR")}`);
  console.log(`  Catalog lookup keys       : ${byKey.size.toLocaleString("fr-FR")}`);

  return byKey;
}

/** @param {Map<string, { spec_key: string; spec_value: string }[]>} specsByKey */
function findSpecsForProduct(product, specsByKey) {
  if (product.source_product_id) {
    const ref = String(product.source_product_id);
    const hit = specsByKey.get(ref) ?? specsByKey.get(ref.toLowerCase());
    if (hit) return { specs: hit, via: "source_product_id" };
  }

  for (const url of product.shop_urls ?? []) {
    const key = normalizeProductUrl(url);
    if (key && specsByKey.has(key)) {
      return { specs: specsByKey.get(key), via: "shop_url" };
    }
  }

  return null;
}

async function main() {
  console.log(`Backfill retail specs${DRY ? " (dry-run)" : ""}`);
  console.log(`  JSONL: ${JSONL}`);
  console.log(`  DB:    ${DB_URL.replace(/:[^:@]+@/, ":***@")}\n`);

  const specsByKey = await indexCatalogSpecs();
  if (!specsByKey.size) {
    console.error("\nNo specs found in JSONL — check the file path and format.");
    process.exit(1);
  }

  const client = await pool.connect();
  try {
    const { rows: products } = await client.query(`
      SELECT p.id, p.name, p.slug, p.source_product_id,
             array_remove(array_agg(DISTINCT sp.shop_product_url), NULL) AS shop_urls
      FROM products p
      LEFT JOIN shop_prices sp ON sp.product_id = p.id
      GROUP BY p.id, p.name, p.slug, p.source_product_id
    `);

    console.log(`  Retail products in DB     : ${products.length.toLocaleString("fr-FR")}`);

    let matched = 0;
    let unmatched = 0;
    let specRowsWritten = 0;
    const via = { source_product_id: 0, shop_url: 0 };
    const unmatchedSamples = [];

    if (!DRY) await client.query("BEGIN");

    for (const product of products) {
      const hit = findSpecsForProduct(product, specsByKey);
      if (!hit) {
        unmatched++;
        if (unmatchedSamples.length < 5) {
          unmatchedSamples.push(`${product.slug} (ref=${product.source_product_id ?? "—"})`);
        }
        continue;
      }

      matched++;
      via[hit.via]++;
      if (!DRY) {
        specRowsWritten += await insertSpecs(client, product.id, hit.specs);
      } else {
        specRowsWritten += hit.specs.length;
      }
    }

    if (!DRY) await client.query("COMMIT");

    const stats = (
      await pool.query(`
        SELECT
          (SELECT COUNT(*)::int FROM product_specs) AS spec_rows,
          (SELECT COUNT(DISTINCT product_id)::int FROM product_specs) AS products_with_specs
      `)
    ).rows[0];

    console.log("\nDone.");
    console.log(`  Products matched          : ${matched.toLocaleString("fr-FR")}`);
    console.log(`    via source_product_id   : ${via.source_product_id.toLocaleString("fr-FR")}`);
    console.log(`    via shop URL            : ${via.shop_url.toLocaleString("fr-FR")}`);
    console.log(`  Products unmatched        : ${unmatched.toLocaleString("fr-FR")}`);
    console.log(`  Spec rows ${DRY ? "would write" : "inserted"}     : ${specRowsWritten.toLocaleString("fr-FR")}`);
    console.log(`  product_specs total now   : ${stats.spec_rows.toLocaleString("fr-FR")} rows / ${stats.products_with_specs.toLocaleString("fr-FR")} products`);

    if (unmatchedSamples.length) {
      console.log("\n  Unmatched samples:");
      for (const s of unmatchedSamples) console.log(`    · ${s}`);
    }
  } catch (err) {
    if (!DRY) await client.query("ROLLBACK").catch(() => {});
    throw err;
  } finally {
    client.release();
    await pool.end();
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
