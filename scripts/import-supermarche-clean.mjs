#!/usr/bin/env node
/* eslint-disable no-console */
/**
 * Import the CLEAN canonical supermarché catalog (products-all-shops-clean.jsonl)
 * into the alimentation Postgres DB.
 *
 * This file's shape (one canonical product per line). Two layouts supported:
 *   v1 (canonical merge): { canonical_product_id, name, brand, size[], category,
 *                           image_url, offers: [{ shop_key, price, regular_price, url, ... }] }
 *   v2 (clean per-product): { id, name, brand, size, category, image_url,
 *                             offers: [{ shop_name, price, url }] }
 *   For v2, shop_key is derived from shop_name via slugify().
 *
 * Target schema (authoritative):
 *   backend/services/alimentation/src/db/migrations/001_catalog_schema.js
 *
 * Usage:
 *   ALIMENTATION_DB_URL=postgres://user:pass@host:port/db \
 *     node scripts/import-supermarche-clean.mjs ./products-all-shops-clean.jsonl
 *
 *   # Dry run — parse + report, NO writes, NO truncate:
 *   ALIMENTATION_DB_URL=... node scripts/import-supermarche-clean.mjs ./file.jsonl --dry-run
 *
 * Safety:
 *  - Wrapped in a single transaction; any error => full ROLLBACK (TRUNCATE included),
 *    so a failure leaves the existing catalog untouched.
 *  - --dry-run does zero writes and never truncates.
 */

import { createReadStream } from "node:fs";
import { createInterface } from "node:readline";
import { Pool } from "pg";

const DB_URL = process.env.ALIMENTATION_DB_URL;
if (!DB_URL) {
  console.error("ALIMENTATION_DB_URL env var is required");
  process.exit(1);
}

const args = process.argv.slice(2);
const DRY_RUN = args.includes("--dry-run");
const FILE = args.find((a) => !a.startsWith("--"));
if (!FILE) {
  console.error("Usage: node scripts/import-supermarche-clean.mjs <path-to-jsonl> [--dry-run]");
  process.exit(1);
}

const BATCH_SIZE = 1000;

// Clean display names for the shop_keys we know about. Anything else falls back
// to a title-cased version of the key.
const SHOP_DISPLAY = {
  carrefour: "Carrefour",
  carrefour_market: "Carrefour Market",
  carrefour_express: "Carrefour Express",
  monoprix: "Monoprix",
  monoprix_glovo: "Monoprix (Glovo)",
  geant: "Géant",
  aziza: "Aziza",
};

function shopDisplayName(key) {
  if (SHOP_DISPLAY[key]) return SHOP_DISPLAY[key];
  return String(key)
    .replace(/[_-]+/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

function slugify(input) {
  return (
    String(input ?? "")
      .normalize("NFD")
      .replace(/[̀-ͯ]/g, "")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 200) || "n-a"
  );
}

const pool = new Pool({ connectionString: DB_URL, max: 4 });

async function withClient(fn) {
  const client = await pool.connect();
  try {
    return await fn(client);
  } finally {
    client.release();
  }
}

// In-memory caches keyed on canonical strings to avoid roundtripping
const cache = {
  shops: new Map(), // shop_key -> id
  brands: new Map(), // slug -> id
  topCats: new Map(), // slug -> id
  productSlugs: new Set(), // ensure UNIQUE(products.slug)
};

async function getOrInsertShop(client, shopKey) {
  if (!shopKey) return null;
  if (cache.shops.has(shopKey)) return cache.shops.get(shopKey);
  const slug = slugify(shopKey);
  const r = await client.query(
    `INSERT INTO shops (shop_key, name, slug)
     VALUES ($1, $2, $3)
     ON CONFLICT (shop_key) DO UPDATE SET name = EXCLUDED.name
     RETURNING id`,
    [shopKey, shopDisplayName(shopKey), slug]
  );
  const id = r.rows[0].id;
  cache.shops.set(shopKey, id);
  return id;
}

async function getOrInsertBrand(client, name) {
  const clean = String(name ?? "").trim();
  if (!clean) return null;
  const slug = slugify(clean);
  if (cache.brands.has(slug)) return cache.brands.get(slug);
  const r = await client.query(
    `INSERT INTO brands (name, slug)
     VALUES ($1, $2)
     ON CONFLICT (slug) DO UPDATE SET name = EXCLUDED.name
     RETURNING id`,
    [clean, slug]
  );
  const id = r.rows[0].id;
  cache.brands.set(slug, id);
  return id;
}

// This file only carries a single category string per product, so we map it to a
// top_category and a mirror low_category + subcategory (the schema requires a
// subcategory leaf to attach a product to a category). All three share the name.
async function getOrInsertCategoryChain(client, name) {
  const clean = String(name ?? "").trim();
  if (!clean) return null;
  const slug = slugify(clean);

  let topId = cache.topCats.get(slug);
  if (!topId) {
    const r = await client.query(
      `INSERT INTO top_categories (name, slug)
       VALUES ($1, $2)
       ON CONFLICT (slug) DO UPDATE SET name = EXCLUDED.name
       RETURNING id`,
      [clean, slug]
    );
    topId = r.rows[0].id;
    cache.topCats.set(slug, topId);
  }

  // low_category mirrors the top (UNIQUE(top_category_id, slug))
  const lowRes = await client.query(
    `INSERT INTO low_categories (top_category_id, name, slug)
     VALUES ($1, $2, $3)
     ON CONFLICT (top_category_id, slug) DO UPDATE SET name = EXCLUDED.name
     RETURNING id`,
    [topId, clean, slug]
  );
  const lowId = lowRes.rows[0].id;

  // subcategory leaf mirrors the low (UNIQUE(low_category_id, slug))
  const subRes = await client.query(
    `INSERT INTO subcategories (low_category_id, name, slug)
     VALUES ($1, $2, $3)
     ON CONFLICT (low_category_id, slug) DO UPDATE SET name = EXCLUDED.name
     RETURNING id`,
    [lowId, clean, slug]
  );
  return subRes.rows[0].id;
}

function pickProductSlug(name, sourceId) {
  let base = slugify(name);
  if (!base || base === "n-a") base = "produit";
  let slug = base;
  let i = 0;
  while (cache.productSlugs.has(slug)) {
    i += 1;
    slug = `${base}-${String(sourceId || "x").slice(-6)}-${i}`;
  }
  cache.productSlugs.add(slug);
  return slug;
}

const isHttp = (u) => typeof u === "string" && /^https?:\/\//.test(u);
const num = (v) => (Number.isFinite(v) ? v : null);

async function insertProductBatch(client, batch) {
  if (batch.length === 0) return;

  const productValues = [];
  const productParams = [];
  batch.forEach((p, i) => {
    const base = i * 5;
    productValues.push(
      `($${base + 1}, $${base + 2}, $${base + 3}, $${base + 4}, $${base + 5})`
    );
    productParams.push(p.brandId, p.sourceId, p.name, p.slug, p.sourceUrl);
  });

  const insertedRes = await client.query(
    `INSERT INTO products (brand_id, source_product_id, name, slug, source_url)
     VALUES ${productValues.join(", ")}
     RETURNING id`,
    productParams
  );
  const ids = insertedRes.rows.map((r) => r.id);

  const imageRows = [];
  const priceRows = [];
  const subcatRows = [];

  batch.forEach((p, i) => {
    const productId = ids[i];
    for (const img of p.images) imageRows.push([productId, img]);
    for (const pr of p.prices) {
      priceRows.push([productId, pr.shopId, pr.current, pr.regular, pr.url]);
    }
    if (p.subCategoryId) subcatRows.push([productId, p.subCategoryId]);
  });

  if (imageRows.length > 0) {
    const vals = imageRows
      .map((_, idx) => `($${idx * 2 + 1}, $${idx * 2 + 2})`)
      .join(", ");
    await client.query(
      `INSERT INTO product_images (product_id, image_url) VALUES ${vals}
       ON CONFLICT (product_id, image_url) DO NOTHING`,
      imageRows.flat()
    );
  }

  if (priceRows.length > 0) {
    const vals = priceRows
      .map(
        (_, idx) =>
          `($${idx * 5 + 1}, $${idx * 5 + 2}, $${idx * 5 + 3}, $${idx * 5 + 4}, $${idx * 5 + 5})`
      )
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

  if (subcatRows.length > 0) {
    const vals = subcatRows
      .map((_, idx) => `($${idx * 2 + 1}, $${idx * 2 + 2})`)
      .join(", ");
    await client.query(
      `INSERT INTO product_subcategories (product_id, subcategory_id) VALUES ${vals}
       ON CONFLICT DO NOTHING`,
      subcatRows.flat()
    );
  }
}

function buildRecord(raw) {
  // Support both `title` (matched_retail format) and `name` (alimentation format)
  const name = String(raw.title ?? raw.name ?? "").trim();
  if (!name) return null;

  // Support both `offers` (alimentation) and `prices` (matched_retail)
  const offerList = Array.isArray(raw.offers) ? raw.offers
    : Array.isArray(raw.prices) ? raw.prices
    : [];
  if (offerList.length === 0) return null;

  const fallbackUrl = offerList.find((o) => o && o.url)?.url || raw.url || null;

  const prices = [];
  const seenShopKeys = new Set();
  for (const o of offerList) {
    if (!o) continue;
    // matched_retail uses `shop` (key directly); alimentation uses `shop_key` or `shop_name`
    const shopKey = o.shop_key || o.shop
      || (o.shop_name ? slugify(o.shop_name).replace(/-/g, "_") : null);
    if (!shopKey) continue;
    if (seenShopKeys.has(shopKey)) continue;
    // matched_retail uses `regular_price` as the current price; alimentation uses `price`
    const cur = num(o.price ?? o.regular_price);
    if (!(cur && cur > 0)) continue;
    const url = o.url || fallbackUrl;
    if (!url) continue;
    seenShopKeys.add(shopKey);
    const reg = num(o.old_price ?? o.regular_price_orig ?? null);
    prices.push({
      shopKey,
      current: cur,
      regular: reg && reg > cur ? reg : null,
      url: String(url),
    });
  }
  if (prices.length === 0) return null;

  // Images: product-level array (matched_retail) or image_url string (alimentation)
  const imgSet = new Set();
  if (Array.isArray(raw.images)) raw.images.filter(isHttp).forEach((u) => imgSet.add(u));
  if (isHttp(raw.image_url)) imgSet.add(raw.image_url);
  for (const o of offerList) if (isHttp(o?.image_url)) imgSet.add(o.image_url);

  // Brand: from specs array (matched_retail) or brand field (alimentation)
  const brand = raw.brand
    ?? raw.specs?.find((s) => s.key === "brand")?.value
    ?? null;

  // Category: from category_level_2 or category_level_1 (matched_retail) or category (alimentation)
  const category = raw.category
    ?? raw.category_level_2?.name
    ?? raw.category_level_1?.name
    ?? null;

  return {
    name,
    brand,
    category,
    sourceId: raw.id ?? raw.canonical_product_id ?? null,
    images: [...imgSet],
    prices,
  };
}

async function main() {
  console.log(`Importing from ${FILE}`);
  console.log(`Target DB: ${DB_URL.replace(/:[^:@]+@/, ":***@")}`);
  if (DRY_RUN) console.log("** DRY RUN — no writes, no truncate **");

  if (!DRY_RUN) {
    await withClient(async (client) => {
      console.log("→ Truncating existing alimentation data…");
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
  }

  const client = await pool.connect();
  let batch = [];
  let total = 0;
  let skipped = 0;
  let parseErrors = 0;

  try {
    if (!DRY_RUN) await client.query("BEGIN");

    const rl = createInterface({
      input: createReadStream(FILE, { encoding: "utf8" }),
      crlfDelay: Infinity,
    });

    for await (const line of rl) {
      const trimmed = line.trim();
      if (!trimmed) continue;

      let raw;
      try {
        raw = JSON.parse(trimmed);
      } catch {
        parseErrors += 1;
        continue;
      }

      const rec = buildRecord(raw);
      if (!rec) {
        skipped += 1;
        continue;
      }

      if (DRY_RUN) {
        total += 1;
        if (total % 5000 === 0) process.stdout.write(`\r  parsed ${total}…`);
        continue;
      }

      // Resolve FK ids (cached)
      const brandId = await getOrInsertBrand(client, rec.brand);
      const subCategoryId = await getOrInsertCategoryChain(client, rec.category);
      const resolvedPrices = [];
      for (const pr of rec.prices) {
        const shopId = await getOrInsertShop(client, pr.shopKey);
        if (!shopId) continue;
        resolvedPrices.push({
          shopId,
          current: pr.current,
          regular: pr.regular,
          url: pr.url,
        });
      }
      if (resolvedPrices.length === 0) {
        skipped += 1;
        continue;
      }

      const slug = pickProductSlug(rec.name, rec.sourceId);

      batch.push({
        brandId,
        sourceId: rec.sourceId,
        name: rec.name,
        slug,
        sourceUrl: resolvedPrices[0]?.url ?? null,
        images: rec.images,
        prices: resolvedPrices,
        subCategoryId,
      });

      if (batch.length >= BATCH_SIZE) {
        await insertProductBatch(client, batch);
        total += batch.length;
        process.stdout.write(`\r  imported ${total}…`);
        batch = [];
      }
    }

    if (!DRY_RUN && batch.length > 0) {
      await insertProductBatch(client, batch);
      total += batch.length;
    }

    if (!DRY_RUN) await client.query("COMMIT");
    process.stdout.write("\n");
    console.log(
      `✓ ${DRY_RUN ? "Would import" : "Imported"} ${total} products ` +
        `(skipped ${skipped} with no usable offer/price, ${parseErrors} bad JSON lines)`
    );
  } catch (err) {
    if (!DRY_RUN) await client.query("ROLLBACK").catch(() => {});
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
