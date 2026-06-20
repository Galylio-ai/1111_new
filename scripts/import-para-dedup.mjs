import { createReadStream } from "fs";
import { createInterface } from "readline";
import pg from "pg";
import { fileURLToPath } from "url";
import path from "path";

const { Pool } = pg;

const pool = new Pool({
  host: "localhost",
  port: 5434,
  user: "para_user",
  password: "galylio-ai",
  database: "para_db",
});

const JSONL_PATH = path.join(
  path.dirname(fileURLToPath(import.meta.url)),
  "../data_matching/prepared_para_catalog/matched.jsonl"
);

const TOP_NAME = "Parapharmacie";
const TOP_SLUG = "parapharmacie";

function slug(str) {
  return (str || "")
    .toLowerCase()
    .normalize("NFD").replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 200);
}

function uniqueSlug(base, seen) {
  let s = base || "item", i = 2;
  while (seen.has(s)) s = `${base}-${i++}`;
  seen.add(s);
  return s;
}

async function ensureCat(client, table, parentCol, parentId, name) {
  const sl = slug(name);
  if (parentCol) {
    const r = await client.query(
      `INSERT INTO ${table} (name, slug, status, ${parentCol}) VALUES ($1,$2,'active',$3)
       ON CONFLICT (slug) DO UPDATE SET name=EXCLUDED.name RETURNING id`,
      [name, sl, parentId]
    );
    return r.rows[0].id;
  } else {
    const r = await client.query(
      `INSERT INTO ${table} (name, slug, status) VALUES ($1,$2,'active')
       ON CONFLICT (slug) DO UPDATE SET name=EXCLUDED.name RETURNING id`,
      [name, sl]
    );
    return r.rows[0].id;
  }
}

async function main() {
  const client = await pool.connect();
  try {
    // Detect schema
    const { rows: lowCols } = await client.query(
      "SELECT column_name FROM information_schema.columns WHERE table_name='low_categories'"
    );
    const hasTopCatCol = lowCols.map(r => r.column_name).includes("top_category_id");

    const topId = await ensureCat(client, "top_categories", null, null, TOP_NAME);

    // Cache existing
    const existing = new Set();
    const ex = await client.query("SELECT source_product_id FROM products WHERE source_product_id IS NOT NULL");
    for (const r of ex.rows) existing.add(r.source_product_id);
    console.log(`Existing para products: ${existing.size}`);

    const slugsSeen = new Set();
    const sl = await client.query("SELECT slug FROM products");
    for (const r of sl.rows) slugsSeen.add(r.slug);

    const brandCache = new Map();
    const br0 = await client.query("SELECT id, name FROM brands");
    for (const r of br0.rows) brandCache.set(r.name, r.id);

    const shopCache = new Map();
    const sh0 = await client.query("SELECT id, shop_key FROM shops");
    for (const r of sh0.rows) shopCache.set(r.shop_key, r.id);

    const lowCache = new Map();   // name -> id
    const subCache = new Map();   // `${lowId}|${name}` -> id

    const rl = createInterface({ input: createReadStream(JSONL_PATH), crlfDelay: Infinity });

    let inserted = 0, skippedDup = 0, skippedBad = 0;

    for await (const line of rl) {
      if (!line.trim()) continue;
      let p;
      try { p = JSON.parse(line); } catch { skippedBad++; continue; }
      if (!p.name || !p.reference || !p.offers?.length) { skippedBad++; continue; }

      const sourceId = String(p.reference);
      if (existing.has(sourceId)) {
        // Refresh prices, log changes to price_history
        const pr = await client.query("SELECT id FROM products WHERE source_product_id=$1", [sourceId]);
        if (pr.rows.length) {
          const productId = pr.rows[0].id;
          for (const off of p.offers) {
            let sid = shopCache.get(off.shop);
            if (!sid) {
              const sr = await client.query(
                `INSERT INTO shops (shop_key, name, slug, status) VALUES ($1,$2,$3,'active')
                 ON CONFLICT (shop_key) DO UPDATE SET name=EXCLUDED.name RETURNING id`,
                [off.shop, off.shop, off.shop]
              );
              sid = sr.rows[0].id;
              shopCache.set(off.shop, sid);
            }
            const newPrice = off.price ?? null;
            const newRegular = off.old_price ?? null;
            const prev = await client.query(
              "SELECT current_price FROM shop_prices WHERE product_id=$1 AND shop_id=$2",
              [productId, sid]
            );
            const prevPrice = prev.rows[0]?.current_price != null ? parseFloat(prev.rows[0].current_price) : null;
            const changed = prev.rows.length > 0 && newPrice != null && prevPrice !== newPrice;
            await client.query(
              `INSERT INTO shop_prices (product_id, shop_id, current_price, regular_price, shop_product_url)
               VALUES ($1,$2,$3,$4,$5)
               ON CONFLICT (product_id, shop_id) DO UPDATE
               SET current_price=EXCLUDED.current_price, regular_price=EXCLUDED.regular_price,
                   shop_product_url=EXCLUDED.shop_product_url`,
              [productId, sid, newPrice, newRegular, off.source_url ?? ""]
            );
            if (changed) {
              await client.query(
                `INSERT INTO price_history (product_id, shop_id, price, regular_price, recorded_at)
                 VALUES ($1,$2,$3,$4, NOW())`,
                [productId, sid, newPrice, newRegular]
              );
            }
          }
        }
        skippedDup++;
        continue;
      }

      // brand
      let brandId = null;
      if (p.brand) {
        if (!brandCache.has(p.brand)) {
          const bs = uniqueSlug(slug(p.brand), new Set());
          const br = await client.query(
            `INSERT INTO brands (name, slug, status) VALUES ($1,$2,'active')
             ON CONFLICT (slug) DO UPDATE SET name=EXCLUDED.name RETURNING id`,
            [p.brand, bs]
          );
          brandCache.set(p.brand, br.rows[0].id);
        }
        brandId = brandCache.get(p.brand);
      }

      // categories
      const lowName = p.category || "Général";
      let lowId = lowCache.get(lowName);
      if (!lowId) {
        if (hasTopCatCol) {
          const r = await client.query(
            `INSERT INTO low_categories (name, slug, status, top_category_id) VALUES ($1,$2,'active',$3)
             ON CONFLICT (top_category_id, slug) DO UPDATE SET name=EXCLUDED.name RETURNING id`,
            [lowName, slug(lowName), topId]
          );
          lowId = r.rows[0].id;
        } else {
          const r = await client.query(
            `INSERT INTO low_categories (name, slug, status) VALUES ($1,$2,'active')
             ON CONFLICT DO NOTHING RETURNING id`,
            [lowName, slug(lowName)]
          );
          lowId = r.rows[0]?.id ?? (await client.query("SELECT id FROM low_categories WHERE slug=$1", [slug(lowName)])).rows[0].id;
        }
        lowCache.set(lowName, lowId);
      }

      const subName = p.subcategory || "Général";
      const subKey = `${lowId}|${subName}`;
      let subId = subCache.get(subKey);
      if (!subId) {
        const r = await client.query(
          `INSERT INTO subcategories (name, slug, status, low_category_id) VALUES ($1,$2,'active',$3)
           ON CONFLICT (low_category_id, slug) DO UPDATE SET name=EXCLUDED.name RETURNING id`,
          [subName, slug(subName), lowId]
        );
        subId = r.rows[0].id;
        subCache.set(subKey, subId);
      }

      const productSlug = uniqueSlug(slug(p.name), slugsSeen);
      let productId;
      try {
        const pr = await client.query(
          `INSERT INTO products (name, slug, brand_id, source_product_id, description, status)
           VALUES ($1,$2,$3,$4,$5,'active') RETURNING id`,
          [p.name, productSlug, brandId, sourceId, p.description ?? null]
        );
        productId = pr.rows[0].id;
        existing.add(sourceId);
      } catch {
        skippedBad++;
        continue;
      }

      await client.query(
        `INSERT INTO product_subcategories (product_id, subcategory_id) VALUES ($1,$2) ON CONFLICT DO NOTHING`,
        [productId, subId]
      );

      for (const img of [p.primary_image, p.secondary_image]) {
        if (img && img.startsWith("http")) {
          await client.query(
            `INSERT INTO product_images (product_id, image_url) VALUES ($1,$2) ON CONFLICT DO NOTHING`,
            [productId, img]
          );
        }
      }

      for (const off of p.offers) {
        let sid = shopCache.get(off.shop);
        if (!sid) {
          const sr = await client.query(
            `INSERT INTO shops (shop_key, name, slug, status) VALUES ($1,$2,$3,'active')
             ON CONFLICT (shop_key) DO UPDATE SET name=EXCLUDED.name RETURNING id`,
            [off.shop, off.shop, off.shop]
          );
          sid = sr.rows[0].id;
          shopCache.set(off.shop, sid);
        }
        await client.query(
          `INSERT INTO shop_prices (product_id, shop_id, current_price, regular_price, shop_product_url)
           VALUES ($1,$2,$3,$4,$5)
           ON CONFLICT (product_id, shop_id) DO UPDATE
           SET current_price=EXCLUDED.current_price, regular_price=EXCLUDED.regular_price,
               shop_product_url=EXCLUDED.shop_product_url`,
          [productId, sid, off.price ?? null, off.old_price ?? null, off.source_url ?? ""]
        );
      }
      inserted++;
      if (inserted % 1000 === 0) console.log(`  inserted ${inserted}, skipped-dup ${skippedDup}`);
    }

    console.log(`\nDone. inserted=${inserted}  skipped-dup=${skippedDup}  skipped-bad=${skippedBad}`);
    const ct = await client.query("SELECT COUNT(*) FROM products");
    console.log("Total products in para_db:", ct.rows[0].count);
  } finally {
    client.release();
    await pool.end();
  }
}

main().catch(e => { console.error(e); process.exit(1); });
