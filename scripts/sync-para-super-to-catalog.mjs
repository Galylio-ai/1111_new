#!/usr/bin/env node
/* eslint-disable no-console */
/**
 * Syncs para + supermarché products from their own DBs into catalog_db.
 * Safe to re-run — uses ON CONFLICT upsert, never touches retail products.
 *
 * Usage:
 *   CATALOG_DB_URL=... ALIMENTATION_DB_URL=... PARA_DB_URL=... \
 *     node scripts/sync-para-super-to-catalog.mjs [--dry-run]
 */

import { Pool } from "pg";

const CATALOG_URL = process.env.CATALOG_DB_URL;
const ALIMENT_URL = process.env.ALIMENTATION_DB_URL;
const PARA_URL    = process.env.PARA_DB_URL;

if (!CATALOG_URL || !ALIMENT_URL || !PARA_URL) {
  console.error("Required: CATALOG_DB_URL, ALIMENTATION_DB_URL, PARA_DB_URL");
  process.exit(1);
}

const DRY_RUN = process.argv.includes("--dry-run");
const BATCH   = 500;

const catalogPool = new Pool({ connectionString: CATALOG_URL, max: 3 });
const alimentPool = new Pool({ connectionString: ALIMENT_URL, max: 3 });
const paraPool    = new Pool({ connectionString: PARA_URL,    max: 3 });

function slugify(s) {
  return String(s ?? "").normalize("NFD").replace(/[̀-ͯ]/g, "")
    .toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 200) || "n-a";
}

async function getOrInsertShop(catalogClient, shopKey, shopName, cluster) {
  const slug = slugify(shopKey);
  const display = shopName || shopKey.replace(/_/g, " ").replace(/\b\w/g, c => c.toUpperCase());
  const r = await catalogClient.query(
    `INSERT INTO shops (shop_key, name, slug, source_clusters)
     VALUES ($1, $2, $3, ARRAY[$4])
     ON CONFLICT (shop_key) DO UPDATE
       SET name = EXCLUDED.name,
           source_clusters = array(SELECT DISTINCT unnest(shops.source_clusters || ARRAY[$4::text]))
     RETURNING id`,
    [shopKey, display, slug, cluster]
  );
  return r.rows[0].id;
}

async function syncFromNormalizedDB(sourcePool, cluster, catalogClient) {
  const sourceClient = await sourcePool.connect();
  let total = 0;
  try {
    // Fetch all shops from source
    const shopsRes = await sourceClient.query(`SELECT id, shop_key, name FROM shops`);
    console.log(`  [${cluster}] ${shopsRes.rows.length} shops found`);

    for (const shop of shopsRes.rows) {
      const catalogShopId = await getOrInsertShop(catalogClient, shop.shop_key, shop.name, cluster);

      // Fetch products for this shop in batches
      let offset = 0;
      while (true) {
        const prodRes = await sourceClient.query(
          `SELECT
             p.source_product_id, p.name, p.slug, p.source_url AS url,
             b.name AS brand,
             tc.name AS top_category,
             lc.name AS low_category,
             sc.name AS subcategory,
             sp.current_price AS price,
             sp.regular_price AS old_price,
             (SELECT pi.image_url FROM product_images pi WHERE pi.product_id = p.id ORDER BY pi.id LIMIT 1) AS image
           FROM products p
           LEFT JOIN brands b ON b.id = p.brand_id
           LEFT JOIN shop_prices sp ON sp.product_id = p.id AND sp.shop_id = $1
           LEFT JOIN product_subcategories psc ON psc.product_id = p.id
           LEFT JOIN subcategories sc ON sc.id = psc.subcategory_id
           LEFT JOIN low_categories lc ON lc.id = sc.low_category_id
           LEFT JOIN top_categories tc ON tc.id = lc.top_category_id
           WHERE sp.shop_id = $1
           LIMIT $2 OFFSET $3`,
          [shop.id, BATCH, offset]
        );

        if (prodRes.rows.length === 0) break;

        if (!DRY_RUN) {
          const vals = [], params = [];
          for (const p of prodRes.rows) {
            const base = params.length;
            vals.push(`($${base+1},$${base+2},$${base+3},$${base+4},$${base+5},$${base+6},$${base+7},$${base+8},$${base+9},$${base+10},$${base+11})`);
            params.push(
              catalogShopId, cluster, p.source_product_id ?? null,
              p.name, p.slug, p.brand ?? null, p.image ?? null, p.url ?? null,
              p.top_category ?? null, p.low_category ?? null, p.subcategory ?? null
            );
          }
          await catalogClient.query(
            `INSERT INTO products (shop_id, source_cluster, source_product_id, name, slug, brand, image, url, top_category, low_category, subcategory)
             VALUES ${vals.join(",")}
             ON CONFLICT (shop_id, source_product_id) WHERE source_product_id IS NOT NULL DO UPDATE SET
               name = EXCLUDED.name, brand = EXCLUDED.brand, image = EXCLUDED.image,
               url = EXCLUDED.url, top_category = EXCLUDED.top_category,
               low_category = EXCLUDED.low_category, subcategory = EXCLUDED.subcategory,
               updated_at = now()`,
            params
          );
        }

        total += prodRes.rows.length;
        offset += BATCH;
        process.stdout.write(`\r  [${cluster}] ${shop.name}: ${total} products…`);
      }
    }
    process.stdout.write("\n");
  } finally {
    sourceClient.release();
  }
  return total;
}

async function main() {
  if (DRY_RUN) console.log("** DRY RUN **");
  const catalogClient = await catalogPool.connect();
  try {
    if (!DRY_RUN) await catalogClient.query("BEGIN");

    console.log("→ Syncing supermarché (alimentation_db)…");
    const alimentTotal = await syncFromNormalizedDB(alimentPool, "supermarche", catalogClient);

    console.log("→ Syncing parapharmacie (para_db)…");
    const paraTotal = await syncFromNormalizedDB(paraPool, "parapharmacie", catalogClient);

    if (!DRY_RUN) {
      console.log("→ Updating shop product counts…");
      await catalogClient.query(`
        UPDATE shops s SET product_count = (SELECT COUNT(*) FROM products p WHERE p.shop_id = s.id)
      `);
      await catalogClient.query("COMMIT");
    }

    console.log(`✓ Synced ${alimentTotal} supermarché + ${paraTotal} para products into catalog_db`);
  } catch (err) {
    if (!DRY_RUN) await catalogClient.query("ROLLBACK").catch(() => {});
    throw err;
  } finally {
    catalogClient.release();
    await catalogPool.end();
    await alimentPool.end();
    await paraPool.end();
  }
}

main().catch(err => { console.error("Sync failed:", err); process.exit(1); });
