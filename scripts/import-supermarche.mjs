import { createReadStream } from "fs";
import { createInterface } from "readline";
import pg from "pg";
import { fileURLToPath } from "url";
import path from "path";

const { Pool } = pg;

const pool = new Pool({
  host: "localhost",
  port: 5435,
  user: "alimentation_user",
  password: "galylio-ai",
  database: "alimentation_db",
});

const JSONL_PATH = path.join(
  path.dirname(fileURLToPath(import.meta.url)),
  "../supermarché/products.jsonl"
);

// slugify helper
function slug(str) {
  return str
    .toLowerCase()
    .normalize("NFD").replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 200);
}

function uniqueSlug(base, seen) {
  let s = base, i = 2;
  while (seen.has(s)) s = `${base}-${i++}`;
  seen.add(s);
  return s;
}

async function main() {
  const client = await pool.connect();
  try {
    console.log("Clearing old data...");
    await client.query("TRUNCATE product_images, product_specs, product_subcategories, shop_prices, products, brands, shops RESTART IDENTITY CASCADE");

    // ── Shops ────────────────────────────────────────────────────────────────
    const SHOPS = {
      aziza:             "Aziza",
      carrefour:         "Carrefour",
      geant:             "Geant",
      monoprix:          "Monoprix",
      carrefour_market:  "Carrefour Market",
      carrefour_express: "Carrefour Express",
    };
    const shopIds = {};
    for (const [key, name] of Object.entries(SHOPS)) {
      const r = await client.query(
        `INSERT INTO shops (shop_key, name, slug, status) VALUES ($1,$2,$3,'active')
         ON CONFLICT (shop_key) DO UPDATE SET name=EXCLUDED.name RETURNING id`,
        [key, name, key]
      );
      shopIds[key] = r.rows[0].id;
    }
    console.log("Shops inserted:", Object.keys(shopIds).length);

    // ── Category tree ────────────────────────────────────────────────────────
    const topRes = await client.query(
      `INSERT INTO top_categories (name, slug, status) VALUES ('Alimentation','alimentation','active')
       ON CONFLICT DO NOTHING RETURNING id`
    );
    const topId = topRes.rows[0]?.id ?? (await client.query("SELECT id FROM top_categories WHERE slug='alimentation'")).rows[0].id;

    // low_categories table
    const { rows: lowCols } = await client.query(
      "SELECT column_name FROM information_schema.columns WHERE table_name='low_categories'"
    );
    const lowColNames = lowCols.map(r => r.column_name);
    const hasTopCatCol = lowColNames.includes("top_category_id");

    let lowId;
    if (hasTopCatCol) {
      const lr = await client.query(
        `INSERT INTO low_categories (name, slug, status, top_category_id) VALUES ('Général','general','active',$1)
         ON CONFLICT DO NOTHING RETURNING id`,
        [topId]
      );
      lowId = lr.rows[0]?.id ?? (await client.query("SELECT id FROM low_categories WHERE slug='general'")).rows[0].id;
    } else {
      const lr = await client.query(
        `INSERT INTO low_categories (name, slug, status) VALUES ('Général','general','active')
         ON CONFLICT DO NOTHING RETURNING id`
      );
      lowId = lr.rows[0]?.id ?? (await client.query("SELECT id FROM low_categories WHERE slug='general'")).rows[0].id;
    }

    const sr = await client.query(
      `INSERT INTO subcategories (name, slug, status, low_category_id) VALUES ('Général','general','active',$1)
       ON CONFLICT DO NOTHING RETURNING id`,
      [lowId]
    );
    const subId = sr.rows[0]?.id ?? (await client.query("SELECT id FROM subcategories WHERE slug='general'")).rows[0].id;

    console.log("Category tree ready. top:", topId, "low:", lowId, "sub:", subId);

    // ── Stream & insert products ─────────────────────────────────────────────
    const rl = createInterface({ input: createReadStream(JSONL_PATH), crlfDelay: Infinity });

    let total = 0, skipped = 0;
    const brandCache = new Map();   // name → id
    const slugsSeen  = new Set();
    const BATCH = 500;
    let batch = [];

    async function flushBatch() {
      if (!batch.length) return;
      await client.query("BEGIN");
      try {
        for (const item of batch) {
          const { name, brand, image, prices, sourceId } = item;

          // brand
          let brandId = null;
          if (brand) {
            if (!brandCache.has(brand)) {
              const bs = uniqueSlug(slug(brand), new Set());
              const br = await client.query(
                `INSERT INTO brands (name, slug, status) VALUES ($1,$2,'active')
                 ON CONFLICT (slug) DO UPDATE SET name=EXCLUDED.name RETURNING id`,
                [brand, bs]
              );
              brandCache.set(brand, br.rows[0].id);
            }
            brandId = brandCache.get(brand);
          }

          // product
          const productSlug = uniqueSlug(slug(name), slugsSeen);
          const pr = await client.query(
            `INSERT INTO products (name, slug, brand_id, source_product_id, status)
             VALUES ($1,$2,$3,$4,'active') RETURNING id`,
            [name, productSlug, brandId, sourceId]
          );
          const productId = pr.rows[0].id;

          // subcategory link
          await client.query(
            `INSERT INTO product_subcategories (product_id, subcategory_id) VALUES ($1,$2) ON CONFLICT DO NOTHING`,
            [productId, subId]
          );

          // image: use HTTP URLs directly, or reconstruct from shop product URLs
          let imgUrl = (image && image.startsWith("http")) ? image : null;
          if (!imgUrl) {
            // Aziza: https://www.aziza.tn/details-article/ARTICLEID.html → https://clusteraz.flesk.fr/images/ARTICLEID1.jpg
            const azizaPrice = prices.find(p => p.shop_key === "aziza" && p.url);
            if (azizaPrice) {
              const m = azizaPrice.url.match(/details-article\/(\d+)\.html/);
              if (m) imgUrl = `https://clusteraz.flesk.fr/images/${m[1]}1.jpg`;
            }
          }
          if (!imgUrl) {
            // Geant: https://www.geantdrive.tn/tunis-city/CATEGORY/ID-slug.html → https://www.geantdrive.tn/tunis-city/ID-home_default/slug.jpg
            const geantPrice = prices.find(p => p.shop_key === "geant" && p.url);
            if (geantPrice) {
              const m = geantPrice.url.match(/\/(\d+)-([^/]+)\.html$/);
              if (m) imgUrl = `https://www.geantdrive.tn/tunis-city/${m[1]}-home_default/${m[2]}.jpg`;
            }
          }
          if (!imgUrl) {
            // Monoprix: https://courses.monoprix.tn/ennasr/CATEGORY/ID-slug.html → https://cdn.monoprix.tn/ennasr/ID-home_default/slug.jpg
            const monoPrice = prices.find(p => p.shop_key === "monoprix" && p.url);
            if (monoPrice) {
              const m = monoPrice.url.match(/\/(\d+)-([^/]+)\.html$/);
              if (m) imgUrl = `https://cdn.monoprix.tn/ennasr/${m[1]}-home_default/${m[2]}.jpg`;
            }
          }
          if (imgUrl) {
            await client.query(
              `INSERT INTO product_images (product_id, image_url) VALUES ($1,$2) ON CONFLICT DO NOTHING`,
              [productId, imgUrl]
            );
          }

          // shop prices
          for (const p of prices) {
            const sid = shopIds[p.shop_key];
            if (!sid) continue;
            await client.query(
              `INSERT INTO shop_prices (product_id, shop_id, current_price, regular_price, shop_product_url)
               VALUES ($1,$2,$3,$4,$5) ON CONFLICT (product_id, shop_id) DO UPDATE
               SET current_price=EXCLUDED.current_price, regular_price=EXCLUDED.regular_price`,
              [productId, sid, p.price ?? null, p.regular_price ?? p.old_price ?? null, p.url ?? ""]
            );
          }
        }
        await client.query("COMMIT");
        total += batch.length;
        if (total % 5000 === 0) console.log(`  inserted ${total}...`);
      } catch (e) {
        await client.query("ROLLBACK");
        skipped += batch.length;
        console.error("Batch error:", e.message);
      }
      batch = [];
    }

    for await (const line of rl) {
      if (!line.trim()) continue;
      let p;
      try { p = JSON.parse(line); } catch { skipped++; continue; }
      if (!p.name || !p.prices?.length) { skipped++; continue; }
      batch.push({ name: p.name, brand: p.brand || null, image: p.image || null, prices: p.prices, sourceId: p.id });
      if (batch.length >= BATCH) await flushBatch();
    }
    await flushBatch();

    console.log(`\nDone! Inserted: ${total}, Skipped: ${skipped}`);
    const ct = await client.query("SELECT COUNT(*) FROM products");
    console.log("Products in DB:", ct.rows[0].count);

  } finally {
    client.release();
    await pool.end();
  }
}

main().catch(e => { console.error(e); process.exit(1); });
