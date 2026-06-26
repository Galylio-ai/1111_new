#!/usr/bin/env node
/* eslint-disable no-console */
/**
 * Import full_products_catalog.jsonl into catalog_db (port 5437).
 * Only touches retail shops — never deletes para/supermarché data.
 *
 * Usage:
 *   CATALOG_DB_URL=postgres://catalog_user:galylio-ai@localhost:5437/catalog_db \
 *     node scripts/import-catalog-retail.mjs ./full_products_catalog.jsonl [--dry-run]
 */

import { createReadStream } from "node:fs";
import { createInterface } from "node:readline";
import { Pool } from "pg";

const DB_URL = process.env.CATALOG_DB_URL;
if (!DB_URL) { console.error("CATALOG_DB_URL is required"); process.exit(1); }

const args    = process.argv.slice(2);
const DRY_RUN = args.includes("--dry-run");
const FILE    = args.find(a => !a.startsWith("--"));
if (!FILE) { console.error("Usage: node scripts/import-catalog-retail.mjs <file.jsonl> [--dry-run]"); process.exit(1); }

const BATCH_SIZE = 500;
const SOURCE_CLUSTER = "retail";

const pool = new Pool({ connectionString: DB_URL, max: 4 });

function slugify(s) {
  return String(s ?? "").normalize("NFD").replace(/[̀-ͯ]/g, "")
    .toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 200) || "n-a";
}

const num = v => (Number.isFinite(Number(v)) && Number(v) > 0 ? Number(v) : null);
const isHttp = u => typeof u === "string" && /^https?:\/\//.test(u);

// in-memory caches
const shopCache = new Map();   // shop_key -> shop_id
const slugCache = new Set();   // product slugs already used this run

async function getOrInsertShop(client, shopKey, shopName) {
  if (shopCache.has(shopKey)) return shopCache.get(shopKey);
  const display = shopName || shopKey.replace(/_/g, " ").replace(/\b\w/g, c => c.toUpperCase());
  const slug    = slugify(shopKey);
  const r = await client.query(
    `INSERT INTO shops (shop_key, name, slug)
     VALUES ($1, $2, $3)
     ON CONFLICT (shop_key) DO UPDATE SET name = EXCLUDED.name
     RETURNING id`,
    [shopKey, display, slug]
  );
  const id = r.rows[0].id;
  shopCache.set(shopKey, id);
  return id;
}

function pickSlug(base, sourceId) {
  let slug = base || "produit";
  let i = 0;
  while (slugCache.has(slug)) {
    i++;
    slug = `${base}-${String(sourceId ?? "x").slice(-6)}-${i}`;
  }
  slugCache.add(slug);
  return slug;
}

function parse(raw) {
  const name = String(raw.title ?? raw.name ?? "").trim();
  if (!name) return null;

  const prices = Array.isArray(raw.prices) ? raw.prices : Array.isArray(raw.offers) ? raw.offers : [];
  if (prices.length === 0) return null;

  const results = [];
  for (const o of prices) {
    if (!o) continue;
    const shopKey = o.shop || o.shop_key || (o.shop_name ? slugify(o.shop_name).replace(/-/g, "_") : null);
    if (!shopKey) continue;
    const price    = num(o.regular_price ?? o.price);
    if (!price) continue;
    const oldPrice = num(o.old_price ?? null);
    const url      = o.url || raw.url || null;
    if (!url) continue;

    const image = Array.isArray(raw.images) ? raw.images.find(isHttp) : (isHttp(raw.image_url) ? raw.image_url : null);
    const brand = raw.brand ?? raw.specs?.find(s => s.key === "brand")?.value ?? null;
    const topCat = raw.category_level_1?.name ?? raw.category ?? null;
    const lowCat = raw.category_level_2?.name ?? null;
    const subCat = raw.category_level_3?.name ?? lowCat ?? null;

    results.push({
      shopKey,
      shopName: null,
      sourceId: raw.id ?? null,
      name,
      slug: slugify(name),
      brand: brand ? String(brand).slice(0, 200) : null,
      image: image ?? null,
      url: String(url).slice(0, 2000),
      topCat, lowCat, subCat,
      price,
      oldPrice: oldPrice && oldPrice > price ? oldPrice : null,
    });
  }
  return results.length > 0 ? results : null;
}

async function flushBatch(client, batch) {
  if (batch.length === 0) return;

  const vals   = [];
  const params = [];
  for (const r of batch) {
    const base = params.length;
    vals.push(`($${base+1},$${base+2},$${base+3},$${base+4},$${base+5},$${base+6},$${base+7},$${base+8},$${base+9},$${base+10},$${base+11},$${base+12},$${base+13})`);
    params.push(
      r.shopId, SOURCE_CLUSTER, r.sourceId, r.name, r.slug,
      r.brand, r.image, r.url,
      r.topCat, r.lowCat, r.subCat,
      r.price, r.oldPrice
    );
  }

  await client.query(
    `INSERT INTO products
       (shop_id, source_cluster, source_product_id, name, slug, brand, image, url,
        top_category, low_category, subcategory, price, old_price)
     VALUES ${vals.join(",")}
     ON CONFLICT (shop_id, source_product_id) DO UPDATE SET
       name       = EXCLUDED.name,
       brand      = EXCLUDED.brand,
       image      = EXCLUDED.image,
       url        = EXCLUDED.url,
       top_category = EXCLUDED.top_category,
       low_category = EXCLUDED.low_category,
       subcategory  = EXCLUDED.subcategory,
       price      = EXCLUDED.price,
       old_price  = EXCLUDED.old_price,
       updated_at = now()`,
    params
  );
}

async function main() {
  console.log(`Importing ${FILE} → catalog_db`);
  if (DRY_RUN) console.log("** DRY RUN **");

  const client = await pool.connect();
  let batch = [], total = 0, skipped = 0, parseErrors = 0;

  try {
    if (!DRY_RUN) {
      await client.query("BEGIN");

      // Pre-load existing slugs and shops into cache
      console.log("→ Loading existing data into cache…");
      const [existingSlugs, existingShops] = await Promise.all([
        client.query(`SELECT slug FROM products WHERE source_cluster = $1`, [SOURCE_CLUSTER]),
        client.query(`SELECT shop_key, id FROM shops`),
      ]);
      for (const r of existingSlugs.rows) slugCache.add(r.slug);
      for (const r of existingShops.rows) shopCache.set(r.shop_key, r.id);
      console.log(`  cached ${slugCache.size} slugs, ${shopCache.size} shops.`);
    }

    const rl = createInterface({ input: createReadStream(FILE, { encoding: "utf8" }), crlfDelay: Infinity });

    for await (const line of rl) {
      const trimmed = line.trim();
      if (!trimmed) continue;
      let raw;
      try { raw = JSON.parse(trimmed); } catch { parseErrors++; continue; }

      const records = parse(raw);
      if (!records) { skipped++; continue; }

      if (DRY_RUN) {
        total += records.length;
        if (total % 10000 === 0) process.stdout.write(`\r  parsed ${total}…`);
        continue;
      }

      for (const rec of records) {
        const shopId = await getOrInsertShop(client, rec.shopKey, rec.shopName);
        const slug   = pickSlug(rec.slug, rec.sourceId);
        batch.push({ ...rec, shopId, slug });

        if (batch.length >= BATCH_SIZE) {
          await flushBatch(client, batch);
          total += batch.length;
          process.stdout.write(`\r  imported ${total}…`);
          batch = [];
        }
      }
    }

    if (!DRY_RUN && batch.length > 0) {
      await flushBatch(client, batch);
      total += batch.length;
    }

    if (!DRY_RUN) {
      // Update product_count on shops
      console.log("\n→ Updating shop product counts…");
      await client.query(`
        UPDATE shops s SET product_count = (
          SELECT COUNT(*) FROM products p WHERE p.shop_id = s.id
        )
      `);
      await client.query("COMMIT");
    }

    process.stdout.write("\n");
    console.log(`✓ ${DRY_RUN ? "Would import" : "Imported"} ${total} product-rows (skipped ${skipped}, ${parseErrors} bad JSON)`);
  } catch (err) {
    if (!DRY_RUN) await client.query("ROLLBACK").catch(() => {});
    throw err;
  } finally {
    client.release();
    await pool.end();
  }
}

main().catch(err => { console.error("Import failed:", err); process.exit(1); });
