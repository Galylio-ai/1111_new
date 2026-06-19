/**
 * importCatalog.js
 *
 * Imports matched.jsonl data into PostgreSQL for a given domain (para | retail).
 *
 * JSON → DB field mapping (matched.jsonl):
 * ─────────────────────────────────────────────────────────────────────────────
 *  JSON field               DB table / column
 * ─────────────────────────────────────────────────────────────────────────────
 *  .category                top_categories.name  (+ .slug)
 *  .subcategory             low_categories.name  (parent = top_category)
 *  (derived "General")      subcategories.name   (leaf level, one per low_cat)
 *  .brand                   brands.name          (+ .slug)
 *  .reference               products.source_product_id
 *  .name                    products.name  (+ .slug, deduplicated)
 *  .description             products.description
 *  .primary_image           products.source_url  (first URL for source ref)
 *                           product_images.image_url  (primary + secondary)
 *  .secondary_image         product_images.image_url  (second image)
 *  .offers[].shop           shops.shop_key / shops.name
 *  .offers[].source_url     shops.website_url (base) + shop_prices.shop_product_url
 *  .offers[].price          shop_prices.current_price
 *  .offers[].old_price      shop_prices.regular_price
 *  .data_quality_score      product_specs (key="data_quality_score")
 *  .shop_count              product_specs (key="shop_count")
 * ─────────────────────────────────────────────────────────────────────────────
 *
 * Usage (run inside Docker backend network):
 *   node scripts/importCatalog.js para
 *   node scripts/importCatalog.js retail
 */

require('dotenv').config();
const fs   = require('fs');
const path = require('path');
const readline = require('readline');
const knexFactory = require('knex');

// ── CLI arg ────────────────────────────────────────────────────────────────
const DOMAIN = (process.argv[2] || '').toLowerCase();
if (!['para', 'retail'].includes(DOMAIN)) {
  console.error('Usage: node importCatalog.js <para|retail>');
  process.exit(1);
}

// ── DB config (reads PARA_DB_* or RETAIL_DB_* from .env) ──────────────────
const PREFIX = DOMAIN.toUpperCase();
function env(name, fallback = '') {
  return process.env[`${PREFIX}_${name}`] ?? process.env[name] ?? fallback;
}
const db = knexFactory({
  client: 'pg',
  connection: {
    host:     env('DB_HOST', 'localhost'),
    port:     parseInt(env('DB_PORT', '5432'), 10),
    database: env('DB_NAME', `${DOMAIN}_db`),
    user:     env('DB_USER', `${DOMAIN}_user`),
    password: env('DB_PASSWORD', ''),
  },
  pool: { min: 1, max: 5 },
});

// ── Path to matched.jsonl ──────────────────────────────────────────────────
const DATA_DIR  = path.resolve(__dirname, '../../data_matching');
const JSONL_FILE = path.join(DATA_DIR, `prepared_${DOMAIN}_catalog`, 'matched.jsonl');

if (!fs.existsSync(JSONL_FILE)) {
  console.error(`File not found: ${JSONL_FILE}`);
  process.exit(1);
}

// ── Slug helper ────────────────────────────────────────────────────────────
function slugify(str) {
  return String(str || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
    || 'unknown';
}

// Make a slug unique by appending a suffix if it already exists in a set
function uniqueSlug(base, seen) {
  let slug = base;
  let i = 2;
  while (seen.has(slug)) slug = `${base}-${i++}`;
  seen.add(slug);
  return slug;
}

// Extract base URL from a product URL (scheme + host)
function baseUrl(url) {
  try { return new URL(url).origin; } catch { return null; }
}

// ── In-memory caches (avoid redundant DB round-trips) ─────────────────────
const topCatCache  = new Map();   // name → id
const lowCatCache  = new Map();   // `${topId}:${name}` → id
const subCatCache  = new Map();   // `${lowId}:General` → id
const brandCache   = new Map();   // name → id
const shopCache    = new Map();   // shop_key → id
const productSlugsSeen = new Set(); // to deduplicate slugs

// ── Upsert helpers ─────────────────────────────────────────────────────────
async function upsertTopCategory(name) {
  if (topCatCache.has(name)) return topCatCache.get(name);
  const slug = slugify(name);
  const [row] = await db('top_categories')
    .insert({ name, slug, status: 'active' })
    .onConflict('slug').merge({ name, updated_at: db.fn.now() })
    .returning('id');
  const id = row?.id ?? (await db('top_categories').where({ slug }).first()).id;
  topCatCache.set(name, id);
  return id;
}

async function upsertLowCategory(topId, name) {
  const key = `${topId}:${name}`;
  if (lowCatCache.has(key)) return lowCatCache.get(key);
  const slug = slugify(name);
  const [row] = await db('low_categories')
    .insert({ top_category_id: topId, name, slug, status: 'active' })
    .onConflict(['top_category_id', 'slug']).merge({ name, updated_at: db.fn.now() })
    .returning('id');
  const id = row?.id ?? (await db('low_categories').where({ top_category_id: topId, slug }).first()).id;
  lowCatCache.set(key, id);
  return id;
}

async function upsertSubcategory(lowId, name) {
  const key = `${lowId}:${name}`;
  if (subCatCache.has(key)) return subCatCache.get(key);
  const slug = slugify(name);
  const [row] = await db('subcategories')
    .insert({ low_category_id: lowId, name, slug, status: 'active' })
    .onConflict(['low_category_id', 'slug']).merge({ name, updated_at: db.fn.now() })
    .returning('id');
  const id = row?.id ?? (await db('subcategories').where({ low_category_id: lowId, slug }).first()).id;
  subCatCache.set(key, id);
  return id;
}

async function upsertBrand(name) {
  if (!name) return null;
  if (brandCache.has(name)) return brandCache.get(name);
  const slug = slugify(name);
  const [row] = await db('brands')
    .insert({ name, slug, status: 'active' })
    .onConflict('slug').merge({ name, updated_at: db.fn.now() })
    .returning('id');
  const id = row?.id ?? (await db('brands').where({ slug }).first()).id;
  brandCache.set(name, id);
  return id;
}

async function upsertShop(shopKey, firstOfferUrl) {
  if (shopCache.has(shopKey)) return shopCache.get(shopKey);
  const name       = shopKey.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
  const slug       = slugify(shopKey);
  const websiteUrl = firstOfferUrl ? baseUrl(firstOfferUrl) : null;
  const [row] = await db('shops')
    .insert({ shop_key: shopKey, name, slug, website_url: websiteUrl, status: 'active' })
    .onConflict('shop_key').merge({ name, website_url: websiteUrl, updated_at: db.fn.now() })
    .returning('id');
  const id = row?.id ?? (await db('shops').where({ shop_key: shopKey }).first()).id;
  shopCache.set(shopKey, id);
  return id;
}

// ── Main import logic ──────────────────────────────────────────────────────
async function importRecord(rec) {
  // 1. top_categories ← rec.category
  const topName = (rec.category || 'Divers').trim();
  const topId   = await upsertTopCategory(topName);

  // 2. low_categories ← rec.subcategory (fallback: "Général")
  const lowName = (rec.subcategory || 'Général').trim();
  const lowId   = await upsertLowCategory(topId, lowName);

  // 3. subcategories ← always "Général" leaf (schema requires 3 levels)
  const subId = await upsertSubcategory(lowId, 'Général');

  // 4. brands ← rec.brand
  const brandId = await upsertBrand(rec.brand || null);

  // 5. products — deduplicate slug
  const baseSlug = slugify(rec.name);
  const slug     = uniqueSlug(baseSlug, productSlugsSeen);

  const [productRow] = await db('products')
    .insert({
      brand_id:          brandId,
      source_product_id: rec.reference || null,
      name:              rec.name,
      slug,
      description:       rec.description || null,
      source_url:        rec.primary_image || null,
      status:            'active',
    })
    .onConflict('slug').merge({
      brand_id:          brandId,
      source_product_id: rec.reference || null,
      name:              rec.name,
      description:       rec.description || null,
      source_url:        rec.primary_image || null,
      updated_at:        db.fn.now(),
    })
    .returning('id');
  const productId = productRow?.id ?? (await db('products').where({ slug }).first()).id;

  // 6. product_subcategories (junction)
  await db('product_subcategories')
    .insert({ product_id: productId, subcategory_id: subId })
    .onConflict(['product_id', 'subcategory_id']).ignore();

  // 7. product_images ← primary_image + secondary_image
  const images = [rec.primary_image, rec.secondary_image].filter(Boolean);
  for (const url of images) {
    await db('product_images')
      .insert({ product_id: productId, image_url: url })
      .onConflict(['product_id', 'image_url']).ignore();
  }

  // 8. product_specs ← data_quality_score, shop_count, + every key/value pair from rec.specifications (or rec.specs)
  const specs = [
    { key: 'data_quality_score', value: String(rec.data_quality_score ?? '') },
    { key: 'shop_count',         value: String(rec.shop_count ?? '') },
  ];
  // Add technical specs from the scraper (mytek/tunisianet/spacenet/expert_gaming all populate this dict)
  const techSpecs = rec.specifications || rec.specs || {};
  if (techSpecs && typeof techSpecs === 'object') {
    for (const [k, v] of Object.entries(techSpecs)) {
      if (v === null || v === undefined) continue;
      const value = String(v).trim();
      if (!value) continue;
      // Skip metadata-ish keys that aren't useful technical characteristics
      if (k === 'gtin' || k === 'sku' || k === 'reference') continue;
      specs.push({ key: k, value });
    }
  }
  const filtered = specs.filter(s => s.value);
  for (const s of filtered) {
    await db('product_specs')
      .insert({ product_id: productId, spec_key: s.key, spec_value: s.value })
      .onConflict(['product_id', 'spec_key', 'spec_value']).ignore();
  }

  // 9. shops + shop_prices ← rec.offers[]
  for (const offer of (rec.offers || [])) {
    const shopId = await upsertShop(offer.shop, offer.source_url);

    await db('shop_prices')
      .insert({
        product_id:       productId,
        shop_id:          shopId,
        current_price:    offer.price   ?? null,
        regular_price:    offer.old_price ?? null,
        shop_product_url: offer.source_url,
        updated_at:       db.fn.now(),
      })
      .onConflict(['product_id', 'shop_id']).merge({
        current_price:    offer.price   ?? null,
        regular_price:    offer.old_price ?? null,
        shop_product_url: offer.source_url,
        updated_at:       db.fn.now(),
      });

    // 10. price_history — one snapshot per import run
    await db('price_history').insert({
      product_id:   productId,
      shop_id:      shopId,
      price:        offer.price     ?? null,
      regular_price: offer.old_price ?? null,
      recorded_at:  new Date().toISOString(),
    });
  }
}

// ── Stream the JSONL file line by line ─────────────────────────────────────
async function run() {
  console.log(`\n[importCatalog] domain=${DOMAIN}  file=${JSONL_FILE}`);

  const rl = readline.createInterface({
    input:     fs.createReadStream(JSONL_FILE, { encoding: 'utf8' }),
    crlfDelay: Infinity,
  });

  let total = 0, ok = 0, errors = 0;

  for await (const line of rl) {
    const trimmed = line.trim();
    if (!trimmed) continue;
    total++;

    let rec;
    try {
      rec = JSON.parse(trimmed);
    } catch {
      console.warn(`  [line ${total}] JSON parse error — skipped`);
      errors++;
      continue;
    }

    try {
      await importRecord(rec);
      ok++;
    } catch (err) {
      errors++;
      console.warn(`  [line ${total}] "${rec.name}" → ${err.message}`);
    }

    if (total % 500 === 0) {
      console.log(`  … ${total} processed  (ok=${ok}  errors=${errors})`);
    }
  }

  console.log(`\n✅  Done. total=${total}  imported=${ok}  errors=${errors}`);
  await db.destroy();
}

run().catch(err => {
  console.error('Fatal error:', err.message);
  db.destroy();
  process.exit(1);
});
