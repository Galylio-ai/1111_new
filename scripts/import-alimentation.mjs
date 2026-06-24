#!/usr/bin/env node
/* eslint-disable no-console */
/**
 * Import clean alimentation products into Postgres.
 *
 * Usage:
 *   ALIMENTATION_DB_URL=postgres://user:pass@host:port/db \
 *     node scripts/import-alimentation.mjs ./products-clean-alimentation.jsonl
 *
 * What it does:
 *  1. TRUNCATEs every product/price/category/brand/shop table (CASCADE).
 *  2. Streams the JSONL file line by line (no full in-memory load).
 *  3. Caches shop/brand/category lookups so we hit the DB only on misses.
 *  4. Batches product inserts (1 000 rows / batch) inside a single transaction.
 *
 * Designed for the schema in:
 *   backend/services/alimentation/src/db/migrations/001_catalog_schema.js
 */

import { createReadStream } from "node:fs";
import { createInterface } from "node:readline";
import { Pool } from "pg";

const DB_URL = process.env.ALIMENTATION_DB_URL;
if (!DB_URL) {
  console.error("ALIMENTATION_DB_URL env var is required");
  process.exit(1);
}

const FILE = process.argv[2];
if (!FILE) {
  console.error("Usage: node scripts/import-alimentation.mjs <path-to-jsonl>");
  process.exit(1);
}

const BATCH_SIZE = 1000;

function slugify(input) {
  return String(input ?? "")
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 200) || "n-a";
}

const pool = new Pool({ connectionString: DB_URL, max: 4 });

async function withClient(fn) {
  const client = await pool.connect();
  try { return await fn(client); } finally { client.release(); }
}

// In-memory caches keyed on canonical strings to avoid roundtripping
const cache = {
  shops: new Map(),       // shop_key -> id
  brands: new Map(),      // slug -> id
  topCats: new Map(),     // slug -> id
  lowCats: new Map(),     // top_id|slug -> id
  subCats: new Map(),     // low_id|slug -> id
  productSlugs: new Set(), // used to ensure UNIQUE
};

async function getOrInsertShop(client, shopKey, shopName) {
  if (!shopKey) return null;
  if (cache.shops.has(shopKey)) return cache.shops.get(shopKey);
  const slug = slugify(shopKey);
  const r = await client.query(
    `INSERT INTO shops (shop_key, name, slug)
     VALUES ($1, $2, $3)
     ON CONFLICT (shop_key) DO UPDATE SET name = EXCLUDED.name
     RETURNING id`,
    [shopKey, shopName || shopKey, slug]
  );
  const id = r.rows[0].id;
  cache.shops.set(shopKey, id);
  return id;
}

async function getOrInsertBrand(client, name) {
  if (!name) return null;
  const slug = slugify(name);
  if (cache.brands.has(slug)) return cache.brands.get(slug);
  const r = await client.query(
    `INSERT INTO brands (name, slug)
     VALUES ($1, $2)
     ON CONFLICT (slug) DO UPDATE SET name = EXCLUDED.name
     RETURNING id`,
    [name, slug]
  );
  const id = r.rows[0].id;
  cache.brands.set(slug, id);
  return id;
}

async function getOrInsertTopCat(client, name) {
  if (!name) return null;
  const slug = slugify(name);
  if (cache.topCats.has(slug)) return cache.topCats.get(slug);
  const r = await client.query(
    `INSERT INTO top_categories (name, slug)
     VALUES ($1, $2)
     ON CONFLICT (slug) DO UPDATE SET name = EXCLUDED.name
     RETURNING id`,
    [name, slug]
  );
  const id = r.rows[0].id;
  cache.topCats.set(slug, id);
  return id;
}

async function getOrInsertLowCat(client, topId, name) {
  if (!topId || !name) return null;
  const slug = slugify(name);
  const k = `${topId}|${slug}`;
  if (cache.lowCats.has(k)) return cache.lowCats.get(k);
  const r = await client.query(
    `INSERT INTO low_categories (top_category_id, name, slug)
     VALUES ($1, $2, $3)
     ON CONFLICT (top_category_id, slug) DO UPDATE SET name = EXCLUDED.name
     RETURNING id`,
    [topId, name, slug]
  );
  const id = r.rows[0].id;
  cache.lowCats.set(k, id);
  return id;
}

async function getOrInsertSubCat(client, lowId, name) {
  if (!lowId || !name) return null;
  const slug = slugify(name);
  const k = `${lowId}|${slug}`;
  if (cache.subCats.has(k)) return cache.subCats.get(k);
  const r = await client.query(
    `INSERT INTO subcategories (low_category_id, name, slug)
     VALUES ($1, $2, $3)
     ON CONFLICT (low_category_id, slug) DO UPDATE SET name = EXCLUDED.name
     RETURNING id`,
    [lowId, name, slug]
  );
  const id = r.rows[0].id;
  cache.subCats.set(k, id);
  return id;
}

function pickProductSlug(name, sourceId) {
  let base = slugify(name);
  if (!base) base = "produit";
  // Disambiguate against earlier rows using source_id suffix
  let slug = base;
  let i = 0;
  while (cache.productSlugs.has(slug)) {
    i += 1;
    slug = `${base}-${(sourceId || "x").slice(-6)}-${i}`;
  }
  cache.productSlugs.add(slug);
  return slug;
}

async function insertProductBatch(client, batch) {
  if (batch.length === 0) return;

  // Bulk INSERT products and return the new ids in the same order as the batch
  // so we can hang images / prices / categories off them.
  const productValues = [];
  const productParams = [];
  batch.forEach((p, i) => {
    const base = i * 6;
    productValues.push(`($${base + 1}, $${base + 2}, $${base + 3}, $${base + 4}, $${base + 5}, $${base + 6})`);
    productParams.push(p.brandId, p.sourceId, p.name, p.slug, p.description, p.sourceUrl);
  });

  const insertedRes = await client.query(
    `INSERT INTO products (brand_id, source_product_id, name, slug, description, source_url)
     VALUES ${productValues.join(", ")}
     RETURNING id`,
    productParams
  );
  const ids = insertedRes.rows.map((r) => r.id);

  // Build per-table value arrays
  const imageRows = [];
  const priceRows = [];
  const subcatRows = [];

  batch.forEach((p, i) => {
    const productId = ids[i];

    if (p.image) imageRows.push([productId, p.image]);

    for (const pr of p.prices) {
      // shop_prices PK is (product_id, shop_id) — keep first occurrence only
      priceRows.push([
        productId,
        pr.shopId,
        pr.current,
        pr.regular,
        pr.url,
      ]);
    }

    for (const sId of p.subCategoryIds) {
      subcatRows.push([productId, sId]);
    }
  });

  // product_images
  if (imageRows.length > 0) {
    const vals = imageRows
      .map((_, idx) => `($${idx * 2 + 1}, $${idx * 2 + 2})`).join(", ");
    await client.query(
      `INSERT INTO product_images (product_id, image_url) VALUES ${vals}
       ON CONFLICT (product_id, image_url) DO NOTHING`,
      imageRows.flat()
    );
  }

  // shop_prices
  if (priceRows.length > 0) {
    const vals = priceRows
      .map((_, idx) => `($${idx * 5 + 1}, $${idx * 5 + 2}, $${idx * 5 + 3}, $${idx * 5 + 4}, $${idx * 5 + 5})`)
      .join(", ");
    await client.query(
      `INSERT INTO shop_prices (product_id, shop_id, current_price, regular_price, shop_product_url)
       VALUES ${vals}
       ON CONFLICT (product_id, shop_id) DO UPDATE
         SET current_price = EXCLUDED.current_price,
             regular_price = EXCLUDED.regular_price,
             shop_product_url = EXCLUDED.shop_product_url,
             updated_at = now()`,
      priceRows.flat()
    );
  }

  // product_subcategories
  if (subcatRows.length > 0) {
    const vals = subcatRows
      .map((_, idx) => `($${idx * 2 + 1}, $${idx * 2 + 2})`).join(", ");
    await client.query(
      `INSERT INTO product_subcategories (product_id, subcategory_id) VALUES ${vals}
       ON CONFLICT DO NOTHING`,
      subcatRows.flat()
    );
  }
}

async function main() {
  console.log(`Importing from ${FILE}`);
  console.log(`Target DB: ${DB_URL.replace(/:[^:@]+@/, ":***@")}`);

  await withClient(async (client) => {
    console.log("→ Truncating existing data…");
    await client.query(`
      TRUNCATE TABLE
        price_history,
        shop_prices,
        product_specs,
        product_images,
        product_subcategories,
        products,
        subcategories,
        low_categories,
        top_categories,
        brands,
        shops
      RESTART IDENTITY CASCADE
    `);
    console.log("✓ Truncated.");
  });

  const client = await pool.connect();
  let batch = [];
  let total = 0;
  let skipped = 0;

  try {
    await client.query("BEGIN");

    const rl = createInterface({
      input: createReadStream(FILE, { encoding: "utf8" }),
      crlfDelay: Infinity,
    });

    for await (const line of rl) {
      const trimmed = line.trim();
      if (!trimmed) continue;

      let raw;
      try { raw = JSON.parse(trimmed); } catch {
        skipped += 1;
        continue;
      }

      const name = String(raw.name ?? "").trim();
      if (!name) { skipped += 1; continue; }

      const primary = Array.isArray(raw.prices) ? raw.prices.filter((p) => p && p.url) : [];
      if (primary.length === 0) { skipped += 1; continue; }

      // Fallback URL for delivery_prices entries that have an empty url.
      const fallbackUrl = primary[0].url;

      // Merge primary prices + delivery_prices so every shop that carries
      // the product (incl. Carrefour Market, Carrefour Express, Monoprix Glovo)
      // ends up in shop_prices. shop_product_url is NOT NULL, so we fall back
      // to the parent shop's URL when delivery_prices has none.
      const allPriceEntries = [
        ...primary,
        ...(Array.isArray(raw.delivery_prices) ? raw.delivery_prices : []),
      ];

      const shopPrices = [];
      const seenShopIds = new Set();
      for (const p of allPriceEntries) {
        if (!p || !p.shop_key) continue;
        const sid = await getOrInsertShop(client, p.shop_key, p.shop);
        if (!sid || seenShopIds.has(sid)) continue;
        seenShopIds.add(sid);
        const cur = Number.isFinite(p.price) ? p.price : null;
        const reg = Number.isFinite(p.regular_price) ? p.regular_price : null;
        if (!(cur && cur > 0)) continue; // skip rows with no usable price
        shopPrices.push({
          shopId: sid,
          current: cur,
          regular: reg && reg > 0 ? reg : null,
          url: String(p.url || fallbackUrl),
        });
      }
      if (shopPrices.length === 0) { skipped += 1; continue; }

      const brandId = await getOrInsertBrand(client, raw.brand);

      const subCategoryIds = [];
      const cats = Array.isArray(raw.categories) ? raw.categories : [];
      for (const c of cats) {
        const topId = await getOrInsertTopCat(client, c?.top_category);
        if (!topId) continue;
        const lowName = c?.low_category || c?.top_category;
        const lowId = await getOrInsertLowCat(client, topId, lowName);
        if (!lowId) continue;
        const subName = c?.subcategory || lowName || c?.top_category;
        const sId = await getOrInsertSubCat(client, lowId, subName);
        if (sId) subCategoryIds.push(sId);
      }

      const slug = pickProductSlug(name, raw.id);

      batch.push({
        brandId,
        sourceId: raw.id ?? null,
        name,
        slug,
        description: raw.description ?? null,
        sourceUrl: shopPrices[0]?.url ?? null,
        image: raw.image && /^https?:\/\//.test(raw.image) ? raw.image : null,
        prices: shopPrices,
        subCategoryIds,
      });

      if (batch.length >= BATCH_SIZE) {
        await insertProductBatch(client, batch);
        total += batch.length;
        process.stdout.write(`\r  imported ${total}…`);
        batch = [];
      }
    }

    if (batch.length > 0) {
      await insertProductBatch(client, batch);
      total += batch.length;
    }

    await client.query("COMMIT");
    process.stdout.write("\n");
    console.log(`✓ Imported ${total} products (skipped ${skipped} invalid lines)`);
  } catch (err) {
    await client.query("ROLLBACK").catch(() => {});
    throw err;
  } finally {
    client.release();
    await pool.end();
  }
}

main().catch((err) => {
  console.error("\nImport failed:", err);
  process.exit(1);
});
