#!/usr/bin/env node
/**
 * Report product_specs coverage across retail / para / alimentation DBs.
 *
 * Usage (VPS or local):
 *   node scripts/check-product-specs.mjs
 *
 * Requires RETAIL_DB_URL, PARA_DB_URL, ALIMENTATION_DB_URL in env or .env.local
 */
import { readFileSync, existsSync } from "fs";
import path from "path";
import { fileURLToPath } from "url";
import pg from "pg";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const envPath = path.join(__dirname, "..", ".env.local");
if (existsSync(envPath)) {
  for (const line of readFileSync(envPath, "utf8").split("\n")) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
    if (m && !process.env[m[1]]) process.env[m[1]] = m[2].replace(/^["']|["']$/g, "");
  }
}

const CATALOGS = [
  { name: "Retail", env: "RETAIL_DB_URL" },
  { name: "Parapharmacie", env: "PARA_DB_URL" },
  { name: "Alimentation", env: "ALIMENTATION_DB_URL" },
];

const STATS_SQL = `
  SELECT
    (SELECT COUNT(*)::int FROM products) AS products,
    (SELECT COUNT(*)::int FROM product_specs) AS spec_rows,
    (SELECT COUNT(DISTINCT product_id)::int FROM product_specs) AS products_with_specs,
    (SELECT COUNT(*)::int FROM products p
     WHERE NOT EXISTS (SELECT 1 FROM product_specs ps WHERE ps.product_id = p.id)
    ) AS products_without_specs
`;

const TOP_KEYS_SQL = `
  SELECT spec_key, COUNT(*)::int AS n
  FROM product_specs
  GROUP BY spec_key
  ORDER BY n DESC
  LIMIT 12
`;

const SAMPLE_SQL = `
  SELECT p.slug, p.name, ps.spec_key, ps.spec_value
  FROM product_specs ps
  JOIN products p ON p.id = ps.product_id
  WHERE ps.spec_key NOT IN ('data_quality_score', 'shop_count')
  ORDER BY ps.id DESC
  LIMIT 5
`;

async function auditCatalog(label, url) {
  if (!url) {
    console.log(`\n=== ${label} ===`);
    console.log("  SKIP — env var not set");
    return null;
  }

  const pool = new pg.Pool({ connectionString: url, max: 2 });
  try {
    const stats = (await pool.query(STATS_SQL)).rows[0];
    const pct =
      stats.products > 0
        ? Math.round((stats.products_with_specs / stats.products) * 1000) / 10
        : 0;

    console.log(`\n=== ${label} ===`);
    console.log(`  products total          : ${stats.products.toLocaleString("fr-FR")}`);
    console.log(`  product_specs rows      : ${stats.spec_rows.toLocaleString("fr-FR")}`);
    console.log(`  products WITH specs     : ${stats.products_with_specs.toLocaleString("fr-FR")} (${pct}%)`);
    console.log(`  products WITHOUT specs  : ${stats.products_without_specs.toLocaleString("fr-FR")}`);

    if (stats.spec_rows > 0) {
      const keys = (await pool.query(TOP_KEYS_SQL)).rows;
      console.log("  top spec_key values:");
      for (const k of keys) {
        console.log(`    · ${k.spec_key}: ${k.n.toLocaleString("fr-FR")}`);
      }
      const sample = (await pool.query(SAMPLE_SQL)).rows;
      if (sample.length) {
        console.log("  sample (latest):");
        for (const r of sample) {
          const val = String(r.spec_value).slice(0, 60);
          console.log(`    · ${r.slug} → ${r.spec_key}: ${val}`);
        }
      }
    } else {
      console.log("  ⚠ product_specs table is EMPTY");
    }

    return stats;
  } catch (err) {
    console.log(`\n=== ${label} ===`);
    console.log(`  ERROR: ${err.message}`);
    return null;
  } finally {
    await pool.end();
  }
}

async function auditCatalogDb(url) {
  if (!url) {
    console.log("\n=== catalog_db (Mongo / Boutiques) ===");
    console.log("  SKIP — CATALOG_DB_URL not set");
    return null;
  }

  const pool = new pg.Pool({ connectionString: url, max: 2 });
  try {
    const stats = (
      await pool.query(`
        SELECT
          (SELECT COUNT(*)::int FROM products) AS products,
          (SELECT COUNT(*)::int FROM product_details) AS detail_rows,
          (SELECT COUNT(*)::int FROM product_details pd
           WHERE pd.specifications IS NOT NULL
             AND pd.specifications::text NOT IN ('null', '{}', '[]')
          ) AS details_with_specs
      `)
    ).rows[0];

    console.log("\n=== catalog_db (Mongo / Boutiques) ===");
    console.log(`  products total              : ${stats.products.toLocaleString("fr-FR")}`);
    console.log(`  product_details rows        : ${stats.detail_rows.toLocaleString("fr-FR")}`);
    console.log(`  details WITH specifications : ${stats.details_with_specs.toLocaleString("fr-FR")}`);

    if (stats.details_with_specs === 0) {
      console.log("  ⚠ specifications column is empty — run migrate-mongo-catalog.mjs");
    } else {
      const sample = (
        await pool.query(`
          SELECT p.slug, jsonb_object_keys(pd.specifications) AS spec_key
          FROM product_details pd
          JOIN products p ON p.id = pd.product_id
          WHERE pd.specifications IS NOT NULL
            AND pd.specifications::text NOT IN ('null', '{}', '[]')
          LIMIT 8
        `)
      ).rows;
      if (sample.length) {
        console.log("  sample spec keys:");
        for (const r of sample) console.log(`    · ${r.slug} → ${r.spec_key}`);
      }
    }

    return stats;
  } catch (err) {
    console.log("\n=== catalog_db (Mongo / Boutiques) ===");
    console.log(`  ERROR: ${err.message}`);
    return null;
  } finally {
    await pool.end();
  }
}

console.log("Product specs audit\n");

for (const c of CATALOGS) {
  await auditCatalog(c.name, process.env[c.env]);
}

await auditCatalogDb(process.env.CATALOG_DB_URL);

console.log("\n--- If retail product_specs is empty ---");
console.log("  1. Check catalog_db above — if it has specs:");
console.log("       node scripts/sync-retail-specs-from-catalog.mjs");
console.log("  2. If matched.jsonl has specifications:");
console.log("       node scripts/backfill-retail-specs.mjs <matched.jsonl>");
console.log("  3. If scraper products_detailed.json exists on disk:");
console.log("       node backend/scripts/importDetailedSpecs.js retail");
