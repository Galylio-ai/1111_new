#!/usr/bin/env node
/**
 * Import flat alimentation JSONL (one row per shop per product) into alimentation_db.
 * Format: { product_id, name, brand, size, category, image_url, shop_name, price, url }
 *
 * Groups rows by product_id, builds offers array, then imports via the same DB schema.
 *
 * Usage:
 *   ALIMENTATION_DB_URL=postgres://... \
 *     node scripts/import-alimentation-flat.mjs ./products-all-shops-alimentation.jsonl [--dry-run]
 */
import { createReadStream } from "node:fs";
import { createInterface } from "node:readline";
import { Pool } from "pg";

const DB_URL = process.env.ALIMENTATION_DB_URL;
if (!DB_URL) { console.error("ALIMENTATION_DB_URL is required"); process.exit(1); }

const args    = process.argv.slice(2);
const DRY_RUN = args.includes("--dry-run");
const FILE    = args.find(a => !a.startsWith("--"));
if (!FILE) { console.error("Usage: node scripts/import-alimentation-flat.mjs <file.jsonl> [--dry-run]"); process.exit(1); }

const BATCH_SIZE = 500;
const pool = new Pool({ connectionString: DB_URL, max: 4 });

function slugify(s) {
  return String(s ?? "").normalize("NFD").replace(/[̀-ͯ]/g, "")
    .toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 200) || "n-a";
}
const num = v => { const n = Number(v); return Number.isFinite(n) && n > 0 ? n : null; };
const isHttp = u => typeof u === "string" && /^https?:\/\//.test(u);

const shopCache  = new Map();
const brandCache = new Map();
const catCache   = new Map();
const slugSet    = new Set();

async function getOrInsertShop(client, shopName) {
  const key = slugify(shopName).replace(/-/g, "_");
  if (shopCache.has(key)) return shopCache.get(key);
  const r = await client.query(
    `INSERT INTO shops (shop_key, name, slug) VALUES ($1,$2,$3)
     ON CONFLICT (shop_key) DO UPDATE SET name=EXCLUDED.name RETURNING id`,
    [key, shopName, slugify(shopName)]
  );
  shopCache.set(key, r.rows[0].id);
  return r.rows[0].id;
}

async function getOrInsertBrand(client, name) {
  if (!name) return null;
  const slug = slugify(name);
  if (brandCache.has(slug)) return brandCache.get(slug);
  const r = await client.query(
    `INSERT INTO brands (name, slug) VALUES ($1,$2)
     ON CONFLICT (slug) DO UPDATE SET name=EXCLUDED.name RETURNING id`,
    [name, slug]
  );
  brandCache.set(slug, r.rows[0].id);
  return r.rows[0].id;
}

async function getOrInsertCat(client, name) {
  if (!name) return null;
  const slug = slugify(name);
  if (catCache.has(slug)) return catCache.get(slug);
  const topR = await client.query(
    `INSERT INTO top_categories (name,slug) VALUES ($1,$2)
     ON CONFLICT (slug) DO UPDATE SET name=EXCLUDED.name RETURNING id`,
    [name, slug]
  );
  const topId = topR.rows[0].id;
  const lowR = await client.query(
    `INSERT INTO low_categories (top_category_id,name,slug) VALUES ($1,$2,$3)
     ON CONFLICT (top_category_id,slug) DO UPDATE SET name=EXCLUDED.name RETURNING id`,
    [topId, name, slug]
  );
  const lowId = lowR.rows[0].id;
  const subR = await client.query(
    `INSERT INTO subcategories (low_category_id,name,slug) VALUES ($1,$2,$3)
     ON CONFLICT (low_category_id,slug) DO UPDATE SET name=EXCLUDED.name RETURNING id`,
    [lowId, name, slug]
  );
  catCache.set(slug, subR.rows[0].id);
  return subR.rows[0].id;
}

function pickSlug(name, id) {
  let base = slugify(name) || "produit";
  let slug = base; let i = 0;
  while (slugSet.has(slug)) { i++; slug = `${base}-${String(id||"x").slice(-6)}-${i}`; }
  slugSet.add(slug);
  return slug;
}

async function insertBatch(client, batch) {
  if (!batch.length) return;
  const pVals = [], pParams = [];
  batch.forEach((p, i) => {
    const b = i * 6;
    pVals.push(`($${b+1},$${b+2},$${b+3},$${b+4},$${b+5},$${b+6})`);
    pParams.push(p.brandId, p.sourceId, p.name, p.slug, p.sourceUrl, false);
  });
  const ins = await client.query(
    `INSERT INTO products (brand_id,source_product_id,name,slug,source_url,is_matched) VALUES ${pVals.join(",")} RETURNING id`,
    pParams
  );
  const ids = ins.rows.map(r => r.id);

  const imgRows = [], priceRows = [], subcatRows = [];
  batch.forEach((p, i) => {
    const pid = ids[i];
    for (const img of p.images) imgRows.push([pid, img]);
    for (const pr of p.prices) priceRows.push([pid, pr.shopId, pr.price, pr.url]);
    if (p.subCatId) subcatRows.push([pid, p.subCatId]);
  });

  if (imgRows.length) {
    const v = imgRows.map((_,i) => `($${i*2+1},$${i*2+2})`).join(",");
    await client.query(`INSERT INTO product_images (product_id,image_url) VALUES ${v} ON CONFLICT DO NOTHING`, imgRows.flat());
  }
  if (priceRows.length) {
    const v = priceRows.map((_,i) => `($${i*4+1},$${i*4+2},$${i*4+3},$${i*4+4})`).join(",");
    await client.query(
      `INSERT INTO shop_prices (product_id,shop_id,current_price,shop_product_url) VALUES ${v}
       ON CONFLICT (product_id,shop_id) DO UPDATE SET current_price=EXCLUDED.current_price, shop_product_url=EXCLUDED.shop_product_url`,
      priceRows.flat()
    );
  }
  if (subcatRows.length) {
    const v = subcatRows.map((_,i) => `($${i*2+1},$${i*2+2})`).join(",");
    await client.query(`INSERT INTO product_subcategories (product_id,subcategory_id) VALUES ${v} ON CONFLICT DO NOTHING`, subcatRows.flat());
  }
}

async function main() {
  console.log(`Importing flat alimentation file: ${FILE}`);
  if (DRY_RUN) console.log("** DRY RUN **");

  // Read all rows and group by product_id
  console.log("→ Reading and grouping rows...");
  const groups = new Map(); // product_id -> { meta, shops: [{shop_name, price, url}] }
  let lineCount = 0, parseErrors = 0;

  const rl = createInterface({ input: createReadStream(FILE, { encoding: "utf8" }), crlfDelay: Infinity });
  for await (const line of rl) {
    const t = line.trim(); if (!t) continue;
    let row;
    try { row = JSON.parse(t); } catch { parseErrors++; continue; }
    lineCount++;

    const pid = row.product_id || row.id || slugify(row.name || "");
    if (!groups.has(pid)) {
      groups.set(pid, {
        name: String(row.name ?? "").trim(),
        brand: row.brand || null,
        category: row.category || null,
        imageUrl: isHttp(row.image_url) ? row.image_url : null,
        sourceId: pid,
        shops: [],
      });
    }
    const g = groups.get(pid);
    const price = num(row.price);
    if (price && row.shop_name) {
      g.shops.push({ shop_name: row.shop_name, price, url: row.url || null });
    }
    if (lineCount % 10000 === 0) process.stdout.write(`\r  read ${lineCount} rows, ${groups.size} products...`);
  }
  process.stdout.write("\n");
  console.log(`✓ Grouped ${lineCount} rows into ${groups.size} products (${parseErrors} parse errors)`);

  if (DRY_RUN) {
    const valid = [...groups.values()].filter(g => g.name && g.shops.length > 0);
    console.log(`✓ Would import ${valid.length} products (skipped ${groups.size - valid.length} with no name/price)`);
    return;
  }

  // Pre-load existing slugs
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    console.log("→ Loading existing slugs...");
    const existing = await client.query("SELECT slug FROM products");
    for (const r of existing.rows) slugSet.add(r.slug);
    console.log(`  cached ${slugSet.size} existing slugs`);

    let batch = [], total = 0, skipped = 0;
    const entries = [...groups.values()];

    for (const g of entries) {
      if (!g.name || g.shops.length === 0) { skipped++; continue; }

      const brandId  = await getOrInsertBrand(client, g.brand);
      const subCatId = await getOrInsertCat(client, g.category);
      const resolvedPrices = [];
      for (const s of g.shops) {
        const shopId = await getOrInsertShop(client, s.shop_name);
        resolvedPrices.push({ shopId, price: s.price, url: s.url });
      }

      batch.push({
        brandId, sourceId: g.sourceId, name: g.name,
        slug: pickSlug(g.name, g.sourceId),
        sourceUrl: resolvedPrices[0]?.url ?? null,
        images: g.imageUrl ? [g.imageUrl] : [],
        prices: resolvedPrices,
        subCatId,
      });

      if (batch.length >= BATCH_SIZE) {
        await insertBatch(client, batch);
        total += batch.length;
        process.stdout.write(`\r  imported ${total}...`);
        batch = [];
      }
    }
    if (batch.length) { await insertBatch(client, batch); total += batch.length; }
    await client.query("COMMIT");
    process.stdout.write("\n");
    console.log(`✓ Imported ${total} products (skipped ${skipped})`);
  } catch (e) {
    await client.query("ROLLBACK");
    throw e;
  } finally {
    client.release();
    await pool.end();
  }
}

main().catch(e => { console.error("\nFailed:", e); process.exit(1); });
