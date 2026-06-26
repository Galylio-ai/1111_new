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
    const SHOPS = {
      aziza: "Aziza", carrefour: "Carrefour", geant: "Geant",
      monoprix: "Monoprix", carrefour_market: "Carrefour Market",
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

    const topRes = await client.query(
      `INSERT INTO top_categories (name, slug, status) VALUES ('Alimentation','alimentation','active')
       ON CONFLICT DO NOTHING RETURNING id`
    );
    const topId = topRes.rows[0]?.id ?? (await client.query("SELECT id FROM top_categories WHERE slug='alimentation'")).rows[0].id;

    const { rows: lowCols } = await client.query(
      "SELECT column_name FROM information_schema.columns WHERE table_name='low_categories'"
    );
    const hasTopCatCol = lowCols.map(r => r.column_name).includes("top_category_id");

    let lowId;
    if (hasTopCatCol) {
      const lr = await client.query(
        `INSERT INTO low_categories (name, slug, status, top_category_id) VALUES ('Général','general','active',$1)
         ON CONFLICT DO NOTHING RETURNING id`, [topId]);
      lowId = lr.rows[0]?.id ?? (await client.query("SELECT id FROM low_categories WHERE slug='general'")).rows[0].id;
    } else {
      const lr = await client.query(
        `INSERT INTO low_categories (name, slug, status) VALUES ('Général','general','active')
         ON CONFLICT DO NOTHING RETURNING id`);
      lowId = lr.rows[0]?.id ?? (await client.query("SELECT id FROM low_categories WHERE slug='general'")).rows[0].id;
    }

    const sr = await client.query(
      `INSERT INTO subcategories (name, slug, status, low_category_id) VALUES ('Général','general','active',$1)
       ON CONFLICT DO NOTHING RETURNING id`, [lowId]);
    const subId = sr.rows[0]?.id ?? (await client.query("SELECT id FROM subcategories WHERE slug='general'")).rows[0].id;

    console.log(`Categories ready (top=${topId}, low=${lowId}, sub=${subId}). Shops=${Object.keys(shopIds).length}`);

    // Preload existing source_product_ids for dedup
    const existing = new Set();
    const ex = await client.query("SELECT source_product_id FROM products WHERE source_product_id IS NOT NULL");
    for (const r of ex.rows) existing.add(r.source_product_id);
    console.log(`Existing products in DB: ${existing.size}`);

    // Preload existing slugs so we don't collide
    const slugsSeen = new Set();
    const sl = await client.query("SELECT slug FROM products");
    for (const r of sl.rows) slugsSeen.add(r.slug);

    const brandCache = new Map();
    const br0 = await client.query("SELECT id, name FROM brands");
    for (const r of br0.rows) brandCache.set(r.name, r.id);

    const rl = createInterface({ input: createReadStream(JSONL_PATH), crlfDelay: Infinity });

    let inserted = 0, skippedDup = 0, skippedBad = 0, pricesUpdated = 0;

    for await (const line of rl) {
      if (!line.trim()) continue;
      let p;
      try { p = JSON.parse(line); } catch { skippedBad++; continue; }
      if (!p.name || !p.prices?.length) { skippedBad++; continue; }

      const sourceId = p.id;
      if (sourceId && existing.has(sourceId)) {
        // Already imported — refresh prices, log changes to price_history
        const pr = await client.query("SELECT id FROM products WHERE source_product_id=$1", [sourceId]);
        if (pr.rows.length) {
          const productId = pr.rows[0].id;
          for (const pp of p.prices) {
            const sid = shopIds[pp.shop_key];
            if (!sid) continue;
            const newPrice = pp.price ?? null;
            const newRegular = pp.regular_price ?? pp.old_price ?? null;
            const prev = await client.query(
              "SELECT current_price, regular_price FROM shop_prices WHERE product_id=$1 AND shop_id=$2",
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
              [productId, sid, newPrice, newRegular, pp.url ?? ""]
            );
            if (changed) {
              await client.query(
                `INSERT INTO price_history (product_id, shop_id, price, regular_price, recorded_at)
                 VALUES ($1,$2,$3,$4, NOW())`,
                [productId, sid, newPrice, newRegular]
              );
            }
            pricesUpdated++;
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

      const productSlug = uniqueSlug(slug(p.name), slugsSeen);
      let productId;
      try {
        const pr = await client.query(
          `INSERT INTO products (name, slug, brand_id, source_product_id, status)
           VALUES ($1,$2,$3,$4,'active') RETURNING id`,
          [p.name, productSlug, brandId, sourceId]
        );
        productId = pr.rows[0].id;
        if (sourceId) existing.add(sourceId);
      } catch (e) {
        skippedBad++;
        continue;
      }

      await client.query(
        `INSERT INTO product_subcategories (product_id, subcategory_id) VALUES ($1,$2) ON CONFLICT DO NOTHING`,
        [productId, subId]
      );

      let imgUrl = (p.image && p.image.startsWith("http")) ? p.image : null;
      if (!imgUrl) {
        const aziza = p.prices.find(x => x.shop_key === "aziza" && x.url);
        if (aziza) {
          const m = aziza.url.match(/details-article\/(\d+)\.html/);
          if (m) imgUrl = `https://clusteraz.flesk.fr/images/${m[1]}1.jpg`;
        }
      }
      if (!imgUrl) {
        const geant = p.prices.find(x => x.shop_key === "geant" && x.url);
        if (geant) {
          const m = geant.url.match(/\/(\d+)-([^/]+)\.html$/);
          if (m) imgUrl = `https://www.geantdrive.tn/tunis-city/${m[1]}-home_default/${m[2]}.jpg`;
        }
      }
      if (!imgUrl) {
        const mono = p.prices.find(x => x.shop_key === "monoprix" && x.url);
        if (mono) {
          const m = mono.url.match(/\/(\d+)-([^/]+)\.html$/);
          if (m) imgUrl = `https://cdn.monoprix.tn/ennasr/${m[1]}-home_default/${m[2]}.jpg`;
        }
      }
      if (imgUrl) {
        await client.query(
          `INSERT INTO product_images (product_id, image_url) VALUES ($1,$2) ON CONFLICT DO NOTHING`,
          [productId, imgUrl]
        );
      }

      for (const pp of p.prices) {
        const sid = shopIds[pp.shop_key];
        if (!sid) continue;
        await client.query(
          `INSERT INTO shop_prices (product_id, shop_id, current_price, regular_price, shop_product_url)
           VALUES ($1,$2,$3,$4,$5)
           ON CONFLICT (product_id, shop_id) DO UPDATE
           SET current_price=EXCLUDED.current_price, regular_price=EXCLUDED.regular_price,
               shop_product_url=EXCLUDED.shop_product_url`,
          [productId, sid, pp.price ?? null, pp.regular_price ?? pp.old_price ?? null, pp.url ?? ""]
        );
      }
      inserted++;
      if (inserted % 1000 === 0) console.log(`  inserted ${inserted}, skipped-dup ${skippedDup}`);
    }

    console.log(`\nDone. inserted=${inserted}  skipped-dup=${skippedDup}  skipped-bad=${skippedBad}  prices-refreshed=${pricesUpdated}`);
    const ct = await client.query("SELECT COUNT(*) FROM products");
    console.log("Total products in alimentation_db:", ct.rows[0].count);
  } finally {
    client.release();
    await pool.end();
  }
}

main().catch(e => { console.error(e); process.exit(1); });
