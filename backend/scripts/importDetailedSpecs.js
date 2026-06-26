/**
 * importDetailedSpecs.js
 *
 * Backfills technical product characteristics into product_specs for retail/para
 * products by reading the scraper's products_detailed.json files directly.
 *
 * These files contain a rich `specifications` dict per product (Marque, Processeur,
 * Mémoire, Taille Ecran, etc.) that the original matched.jsonl pipeline strips out.
 *
 * Strategy:
 *  1. For each shop folder in OLD--SCRAPPING/data/<shop>, locate the most recent
 *     run that has products_detailed.json.
 *  2. For each detailed record, compute slug(name).
 *  3. UPSERT each {spec_key, spec_value} into product_specs for the matching
 *     products.id (joined via products.slug).
 *
 * Usage:
 *   node backend/scripts/importDetailedSpecs.js retail
 *   node backend/scripts/importDetailedSpecs.js para
 *   node backend/scripts/importDetailedSpecs.js retail --shop=mytek    # only one shop
 *   node backend/scripts/importDetailedSpecs.js retail --dry           # print, no writes
 *
 * Requires env (loaded from .env):
 *   RETAIL_DB_HOST RETAIL_DB_PORT RETAIL_DB_NAME RETAIL_DB_USER RETAIL_DB_PASSWORD
 *   (or PARA_DB_* for para)
 *
 * Skipped keys (not useful as user-facing characteristics):
 *   gtin, sku, reference, data_quality_score, shop_count
 */

require('dotenv').config();
const fs = require('fs');
const path = require('path');
const knexFactory = require('knex');

const DOMAIN = (process.argv[2] || '').toLowerCase();
if (!['para', 'retail'].includes(DOMAIN)) {
  console.error('Usage: node importDetailedSpecs.js <para|retail> [--shop=name] [--dry]');
  process.exit(1);
}

const DRY = process.argv.includes('--dry');
const SHOP_FILTER = (() => {
  const arg = process.argv.find((a) => a.startsWith('--shop='));
  return arg ? arg.slice('--shop='.length).toLowerCase() : null;
})();

// ── DB config ──────────────────────────────────────────────────────────────
const PREFIX = DOMAIN.toUpperCase();
function env(name, fallback = '') {
  return process.env[`${PREFIX}_${name}`] ?? process.env[name] ?? fallback;
}

const connectionString = env('DB_URL');
const db = knexFactory({
  client: 'pg',
  connection: connectionString
    ? connectionString
    : {
        host: env('DB_HOST', 'localhost'),
        port: parseInt(env('DB_PORT', '5432'), 10),
        database: env('DB_NAME', `${DOMAIN}_db`),
        user: env('DB_USER', `${DOMAIN}_user`),
        password: env('DB_PASSWORD', ''),
      },
  pool: { min: 1, max: 5 },
});

// ── Scraper data root ──────────────────────────────────────────────────────
const SCRAPER_DATA = path.resolve(
  process.env.SCRAPER_DATA_DIR ||
    'C:/Users/stage.td/Desktop/current_scrapping/OLD--SCRAPPING/data'
);

if (!fs.existsSync(SCRAPER_DATA)) {
  console.error(`Scraper data dir not found: ${SCRAPER_DATA}`);
  console.error('Set SCRAPER_DATA_DIR env var to point at OLD--SCRAPPING/data');
  process.exit(1);
}

// ── Helpers ────────────────────────────────────────────────────────────────
function slugify(str) {
  return String(str || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

// Keys we never want to surface as user-facing characteristics
const SKIP_KEYS = new Set([
  'gtin',
  'sku',
  'reference',
  'data_quality_score',
  'shop_count',
  'product_id',
  'id',
]);

function cleanKey(k) {
  return String(k || '').trim();
}

function cleanValue(v) {
  if (v === null || v === undefined) return '';
  if (typeof v === 'object') return ''; // never store nested objects as specs
  return String(v).trim().replace(/\s+/g, ' ');
}

function findLatestDetailedJson(shopDir) {
  if (!fs.statSync(shopDir).isDirectory()) return null;
  const runs = fs
    .readdirSync(shopDir)
    .filter((d) => /^2\d{3}-\d{2}-\d{2}_\d{2}-\d{2}-\d{2}$/.test(d))
    .sort()
    .reverse();
  for (const r of runs) {
    const fp = path.join(shopDir, r, 'products_detailed.json');
    if (fs.existsSync(fp) && fs.statSync(fp).size > 10) return fp;
  }
  return null;
}

function readJson(fp) {
  try {
    return JSON.parse(fs.readFileSync(fp, 'utf8'));
  } catch (e) {
    console.error(`  ! failed to read ${fp}: ${e.message}`);
    return null;
  }
}

// ── Slug index for fast lookup ─────────────────────────────────────────────
async function loadSlugIndex() {
  console.log('Loading product slug index from DB…');
  const rows = await db('products').select('id', 'slug', 'name');
  const bySlug = new Map();
  for (const r of rows) {
    bySlug.set(r.slug, { id: r.id, name: r.name });
  }
  console.log(`  ${rows.length} products indexed`);
  return bySlug;
}

// ── Main ───────────────────────────────────────────────────────────────────
(async () => {
  const slugIndex = await loadSlugIndex();

  const shops = fs
    .readdirSync(SCRAPER_DATA, { withFileTypes: true })
    .filter((d) => d.isDirectory())
    .map((d) => d.name)
    .filter((name) => (SHOP_FILTER ? name.toLowerCase() === SHOP_FILTER : true))
    .sort();

  let totalRecords = 0;
  let totalMatched = 0;
  let totalUnmatched = 0;
  let totalSpecsWritten = 0;
  const unmatchedSamples = [];

  for (const shop of shops) {
    const shopDir = path.join(SCRAPER_DATA, shop);
    const fp = findLatestDetailedJson(shopDir);
    if (!fp) continue;

    const data = readJson(fp);
    if (!Array.isArray(data) || data.length === 0) continue;

    // Quick scan: how many of these even have specifications?
    const withSpecs = data.filter(
      (r) =>
        r &&
        typeof r === 'object' &&
        r.specifications &&
        typeof r.specifications === 'object' &&
        Object.keys(r.specifications).length > 0
    );
    if (withSpecs.length === 0) {
      console.log(`${shop}: ${data.length} products, 0 with specs → skip`);
      continue;
    }

    console.log(`${shop}: ${withSpecs.length} of ${data.length} products have specs`);

    let matched = 0;
    let writtenForShop = 0;
    for (const rec of withSpecs) {
      totalRecords += 1;
      const name = rec.title || rec.name;
      if (!name) continue;
      const slug = slugify(name);
      const target = slugIndex.get(slug);
      if (!target) {
        totalUnmatched += 1;
        if (unmatchedSamples.length < 5) unmatchedSamples.push(`${shop}: ${name}`);
        continue;
      }
      matched += 1;
      totalMatched += 1;

      const rows = [];
      for (const [rawKey, rawValue] of Object.entries(rec.specifications)) {
        const key = cleanKey(rawKey);
        const value = cleanValue(rawValue);
        if (!key || !value) continue;
        if (SKIP_KEYS.has(key.toLowerCase())) continue;
        if (value.length > 500) continue; // sanity cap
        rows.push({ product_id: target.id, spec_key: key, spec_value: value });
      }
      if (rows.length === 0) continue;

      if (DRY) {
        console.log(`  [DRY] ${name} → ${rows.length} specs`);
      } else {
        // Batch insert with conflict-ignore (existing rows remain)
        try {
          await db('product_specs')
            .insert(rows)
            .onConflict(['product_id', 'spec_key', 'spec_value'])
            .ignore();
          writtenForShop += rows.length;
          totalSpecsWritten += rows.length;
        } catch (e) {
          console.error(`  ! insert failed for product ${target.id}: ${e.message}`);
        }
      }
    }
    console.log(`  ${shop} → matched ${matched}, wrote ${writtenForShop} spec rows`);
  }

  console.log('');
  console.log('───────────────────────────────────────');
  console.log(`Records considered:   ${totalRecords}`);
  console.log(`Products matched:     ${totalMatched}`);
  console.log(`Products unmatched:   ${totalUnmatched}`);
  console.log(`Spec rows written:    ${totalSpecsWritten}${DRY ? ' (dry-run)' : ''}`);
  if (unmatchedSamples.length > 0) {
    console.log('');
    console.log('Sample unmatched (no product row in DB with this slug):');
    for (const s of unmatchedSamples) console.log(`  - ${s}`);
  }

  await db.destroy();
})().catch((err) => {
  console.error('Fatal:', err);
  process.exit(1);
});
