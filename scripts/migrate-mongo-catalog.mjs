/**
 * One-pass migration: 2 Mongo Atlas clusters (Retails) → Postgres catalog_db.
 *
 * Imports, for every shop in both clusters:
 *   - <shop>_products              → products
 *   - <shop>_details               → product_details (joined by url)
 *   - <shop>_history_price         → price_history
 *   - <shop>_history_availability  → availability_history
 *   - <shop>_products_added        → products_added (raw snapshot)
 *   - <shop>_products_removed      → products_removed (raw snapshot)
 *   - <shop>_summary* / _other     → scrape_summaries (raw payload)
 *
 * Idempotent: re-running upserts (ON CONFLICT). Safe to resume.
 *
 * Run on the VPS (only the VPS can reach Atlas):
 *   cd /home/ubuntu/project
 *   node scripts/migrate-mongo-catalog.mjs
 *
 * Requires env (reads .env.local automatically if present):
 *   CATALOG_DB_URL=postgres://catalog_user:pass@localhost:5437/catalog_db
 *   MONGO_URI_C1=mongodb+srv://.../   (cluster 1, Retails)
 *   MONGO_URI_C2=mongodb+srv://.../   (cluster 2)
 */
import { MongoClient } from "mongodb";
import pg from "pg";
import { readFileSync, existsSync } from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/* ── load .env.local (simple parser, no dotenv dep) ───────────────────────── */
const envPath = path.join(__dirname, "..", ".env.local");
if (existsSync(envPath)) {
  for (const line of readFileSync(envPath, "utf8").split("\n")) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
    if (m && !process.env[m[1]]) process.env[m[1]] = m[2].replace(/^["']|["']$/g, "");
  }
}

const CATALOG_DB_URL = process.env.CATALOG_DB_URL;
const CLUSTERS = [
  { tag: "c1", uri: process.env.MONGO_URI_C1, db: process.env.MONGO_DB_C1 || "Retails" },
  { tag: "c2", uri: process.env.MONGO_URI_C2, db: process.env.MONGO_DB_C2 || "Retails" },
].filter(c => c.uri);

if (!CATALOG_DB_URL) { console.error("Missing CATALOG_DB_URL"); process.exit(1); }
if (!CLUSTERS.length) { console.error("Missing MONGO_URI_C1 / MONGO_URI_C2"); process.exit(1); }

const { Pool } = pg;
const pool = new Pool({ connectionString: CATALOG_DB_URL, max: 8 });

/* ── helpers ──────────────────────────────────────────────────────────────── */
function slugify(str) {
  return String(str || "")
    .toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 180);
}
function toNum(v) {
  if (v == null || v === "") return null;
  const n = typeof v === "number" ? v : parseFloat(String(v).replace(/[^\d.,-]/g, "").replace(",", "."));
  return Number.isFinite(n) ? n : null;
}
function toBool(p) {
  if (typeof p.available === "boolean") return p.available;
  const s = (p.availability || p.stock_status || "").toString().toUpperCase();
  if (!s) return null;
  if (/IN_?STOCK|EN STOCK|DISPONIBLE/.test(s)) return true;
  if (/OUT|RUPTURE|INDISPONIBLE/.test(s)) return false;
  return null;
}
function toDate(v) {
  if (!v) return null;
  const d = new Date(v);
  return isNaN(d.getTime()) ? null : d;
}
const nameOf  = p => p.name || p.title || null;
const imageOf = p => p.image || (Array.isArray(p.images) && p.images[0]) || null;
const isProductCol = n => /_products$/.test(n) && !/_summary_products$/.test(n);
const shopOf = colName => colName.replace(/_products$/, "");

/* ── per-shop upsert ──────────────────────────────────────────────────────── */
async function upsertShop(client, shopKey, clusterTag) {
  const name = shopKey.replace(/[_-]+/g, " ").replace(/\b\w/g, c => c.toUpperCase());
  const r = await client.query(
    `INSERT INTO shops (shop_key, name, slug, source_clusters)
     VALUES ($1,$2,$3, ARRAY[$4])
     ON CONFLICT (shop_key) DO UPDATE
       SET source_clusters =
         (SELECT ARRAY(SELECT DISTINCT unnest(shops.source_clusters || ARRAY[$4])))
     RETURNING id`,
    [shopKey, name, slugify(shopKey), clusterTag]
  );
  return r.rows[0].id;
}

async function migrateShop(mongoDb, client, shopKey, clusterTag) {
  const shopId = await upsertShop(client, shopKey, clusterTag);
  const cols = new Set((await mongoDb.listCollections().toArray()).map(c => c.name));

  // ── products ──
  let nProd = 0;
  const slugSeen = new Set();
  if (cols.has(`${shopKey}_products`)) {
    const cur = mongoDb.collection(`${shopKey}_products`).find({}, { batchSize: 1000 });
    let batch = [];
    const flush = async () => {
      if (!batch.length) return;
      const vals = [];
      const ph = [];
      batch.forEach((p, i) => {
        const b = i * 14;
        ph.push(`($${b+1},$${b+2},$${b+3},$${b+4},$${b+5},$${b+6},$${b+7},$${b+8},$${b+9},$${b+10},$${b+11},$${b+12},$${b+13},$${b+14})`);
        const nm = nameOf(p) || "(sans nom)";
        let sl = slugify(nm) || `p-${p.id || p._id}`;
        while (slugSeen.has(sl)) sl = `${sl}-${(Math.random()*1e4|0)}`;
        slugSeen.add(sl);
        vals.push(
          shopId, clusterTag, String(p.id ?? p.product_id ?? p._id), nm, sl,
          p.brand ?? null, imageOf(p), p.url ?? null,
          p.top_category ?? null, p.low_category ?? null, p.subcategory ?? null,
          toNum(p.price), toNum(p.old_price), toBool(p)
        );
      });
      await client.query(
        `INSERT INTO products
           (shop_id, source_cluster, source_product_id, name, slug, brand, image, url,
            top_category, low_category, subcategory, price, old_price, available)
         VALUES ${ph.join(",")}
         ON CONFLICT (shop_id, source_cluster, source_product_id) DO UPDATE SET
           name=EXCLUDED.name, brand=EXCLUDED.brand, image=EXCLUDED.image, url=EXCLUDED.url,
           top_category=EXCLUDED.top_category, low_category=EXCLUDED.low_category,
           subcategory=EXCLUDED.subcategory, price=EXCLUDED.price, old_price=EXCLUDED.old_price,
           available=EXCLUDED.available, updated_at=now()`,
        vals
      );
      nProd += batch.length;
      batch = [];
    };
    for await (const p of cur) { batch.push(p); if (batch.length >= 500) await flush(); }
    await flush();
  }

  // url → product_id map for this shop+cluster (for details/history joins)
  const { rows: idRows } = await client.query(
    `SELECT id, url, source_product_id FROM products WHERE shop_id=$1 AND source_cluster=$2`,
    [shopId, clusterTag]
  );
  const byUrl = new Map(), bySrc = new Map();
  for (const r of idRows) { if (r.url) byUrl.set(r.url, r.id); if (r.source_product_id) bySrc.set(r.source_product_id, r.id); }
  const resolve = (d) => byUrl.get(d.url) ?? bySrc.get(String(d.product_id ?? d.id)) ?? null;

  // ── details ──
  let nDet = 0;
  if (cols.has(`${shopKey}_details`)) {
    for await (const d of mongoDb.collection(`${shopKey}_details`).find({}, { batchSize: 500 })) {
      const pid = resolve(d);
      if (!pid) continue;
      await client.query(
        `INSERT INTO product_details
           (product_id, title, brand, sku, barcode, overview, description, specifications, images, store_availability)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)
         ON CONFLICT (product_id) DO UPDATE SET
           title=EXCLUDED.title, brand=EXCLUDED.brand, sku=EXCLUDED.sku, barcode=EXCLUDED.barcode,
           overview=EXCLUDED.overview, description=EXCLUDED.description,
           specifications=EXCLUDED.specifications, images=EXCLUDED.images,
           store_availability=EXCLUDED.store_availability, updated_at=now()`,
        [pid, d.title ?? null, d.brand ?? null, d.sku ?? null, d.barcode ?? null,
         d.overview ?? null, d.description ?? null,
         d.specifications ? JSON.stringify(d.specifications) : null,
         d.images ? JSON.stringify(d.images) : null,
         d.store_availability ? JSON.stringify(d.store_availability) : null]
      );
      nDet++;
    }
  }

  // ── price history ──
  let nPh = 0;
  if (cols.has(`${shopKey}_history_price`)) {
    for await (const h of mongoDb.collection(`${shopKey}_history_price`).find({}, { batchSize: 500 })) {
      const pid = bySrc.get(String(h.product_id));
      if (!pid || !Array.isArray(h.history)) continue;
      for (const pt of h.history) {
        const at = toDate(pt.date); if (!at) continue;
        await client.query(
          `INSERT INTO price_history (product_id, price, recorded_at)
           VALUES ($1,$2,$3) ON CONFLICT (product_id, recorded_at) DO NOTHING`,
          [pid, toNum(pt.price), at]
        );
        nPh++;
      }
    }
  }

  // ── availability history ──
  if (cols.has(`${shopKey}_history_availability`)) {
    for await (const h of mongoDb.collection(`${shopKey}_history_availability`).find({}, { batchSize: 500 })) {
      const pid = bySrc.get(String(h.product_id));
      if (!pid || !Array.isArray(h.history)) continue;
      for (const pt of h.history) {
        const at = toDate(pt.date); if (!at) continue;
        await client.query(
          `INSERT INTO availability_history (product_id, available, status, recorded_at)
           VALUES ($1,$2,$3,$4) ON CONFLICT (product_id, recorded_at) DO NOTHING`,
          [pid, typeof pt.available === "boolean" ? pt.available : null, pt.status ?? null, at]
        );
      }
    }
  }

  // ── added / removed snapshots ──
  for (const [suffix, table] of [["_products_added","products_added"],["_products_removed","products_removed"]]) {
    if (!cols.has(`${shopKey}${suffix}`)) continue;
    for await (const d of mongoDb.collection(`${shopKey}${suffix}`).find({}, { batchSize: 500 })) {
      await client.query(
        `INSERT INTO ${table} (shop_id, source_cluster, source_product_id, detected_at, snapshot)
         VALUES ($1,$2,$3,$4,$5)`,
        [shopId, clusterTag, String(d.product_id ?? d.id ?? ""), toDate(d.detected_at), JSON.stringify(d)]
      );
    }
  }

  // ── scrape summaries / other ──
  for (const suffix of ["_summary","_summary_products","_summary_details","_other"]) {
    if (!cols.has(`${shopKey}${suffix}`)) continue;
    for await (const d of mongoDb.collection(`${shopKey}${suffix}`).find({}, { batchSize: 200 })) {
      await client.query(
        `INSERT INTO scrape_summaries (shop_id, source_cluster, kind, scraped_at, payload)
         VALUES ($1,$2,$3,$4,$5)`,
        [shopId, clusterTag, suffix.slice(1), toDate(d.scraped_at), JSON.stringify(d)]
      );
    }
  }

  // refresh product_count
  await client.query(
    `UPDATE shops SET product_count = (SELECT COUNT(*) FROM products WHERE shop_id=$1), updated_at=now() WHERE id=$1`,
    [shopId]
  );

  console.log(`    ${shopKey.padEnd(26)} products=${String(nProd).padStart(6)} details=${String(nDet).padStart(6)} priceHist=${nPh}`);
  return nProd;
}

/* ── main ─────────────────────────────────────────────────────────────────── */
async function main() {
  console.log("Applying schema...");
  await pool.query(`CREATE EXTENSION IF NOT EXISTS pg_trgm;`);
  await pool.query(readFileSync(path.join(__dirname, "catalog-schema.sql"), "utf8"));

  let grand = 0;
  for (const cl of CLUSTERS) {
    console.log(`\n###### CLUSTER ${cl.tag} (${cl.db}) ######`);
    const mongo = new MongoClient(cl.uri, { serverSelectionTimeoutMS: 30000 });
    await mongo.connect();
    const mdb = mongo.db(cl.db);
    const cols = (await mdb.listCollections().toArray()).map(c => c.name);
    const shops = [...new Set(cols.filter(isProductCol).map(shopOf))]
      .filter(s => !s.endsWith("_summary")).sort();
    console.log(`  ${shops.length} shops`);

    for (const shop of shops) {
      const client = await pool.connect();
      try {
        await client.query("BEGIN");
        grand += await migrateShop(mdb, client, shop, cl.tag);
        await client.query("COMMIT");
      } catch (e) {
        await client.query("ROLLBACK");
        console.error(`    !! ${shop}: ${e.message}`);
      } finally {
        client.release();
      }
    }
    await mongo.close();
  }

  const { rows } = await pool.query(`SELECT COUNT(*) products, (SELECT COUNT(*) FROM shops) shops FROM products`);
  console.log(`\nDONE. shops=${rows[0].shops} products=${rows[0].products} (this run inserted ~${grand})`);
  await pool.end();
}

main().catch(e => { console.error(e); process.exit(1); });
