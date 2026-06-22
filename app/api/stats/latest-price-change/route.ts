import { NextResponse } from "next/server";
import { CATALOGS } from "@/lib/db";

export const revalidate = 300;

type Row = {
  catalog: string;
  catalogPath: string;
  name: string;
  brand: string | null;
  slug: string;
  image: string | null;
  shopName: string | null;
  oldPrice: number;
  newPrice: number;
  changedAt: string;
};

const IMAGE_WHITELIST = `
  image_url ~ '^https?://'
  AND (
    image_url ILIKE 'https://clusteraz.flesk.fr/%'
    OR image_url ILIKE 'https://cdn.monoprix.tn/%'
    OR image_url ILIKE 'https://beautystore.tn/%'
    OR image_url ILIKE 'https://parashop.tn/%'
    OR image_url ILIKE 'https://www.parashop.tn/%'
    OR image_url ILIKE 'https://pharma-shop.tn/%'
    OR image_url ILIKE 'https://pharmashop.tn/%'
    OR image_url ILIKE 'https://www.tunisianet.com.tn/%'
    OR image_url ILIKE 'https://www.mytek.tn/%'
    OR image_url ILIKE 'https://spacenet.tn/%'
    OR image_url ILIKE 'https://agora.tn/%'
    OR image_url ILIKE 'https://www.sbsinformatique.com/%'
    OR image_url ILIKE 'https://www.carrefour.tn/%'
    OR image_url ILIKE 'https://www.mapara.tn/%'
    OR image_url ILIKE 'https://www.paraexpert.tn/%'
    OR image_url ILIKE 'https://parafendri.tn/%'
    OR image_url ILIKE 'https://www.cosmetique.tn/%'
    OR image_url ILIKE 'https://www.pharmacie-elfarabi.tn/%'
    OR image_url ILIKE 'https://parahouse.tn/%'
    OR image_url ILIKE 'https://paraland.tn/%'
  )
`;

// FALLBACK when price_history is empty: pull the most recently-updated row in
// shop_prices that *currently* shows a discount (current_price < regular_price).
// This treats the active discount as a "recent price change" using only data we
// have today. It's honest: the timestamp comes from shop_prices.updated_at.
const SQL_FALLBACK = `
  SELECT
    p.name,
    b.name AS brand,
    p.slug,
    s.name AS shop_name,
    sp.regular_price AS old_price,
    sp.current_price AS new_price,
    sp.updated_at AS changed_at,
    (
      SELECT image_url FROM product_images
      WHERE product_id = p.id
        AND ${IMAGE_WHITELIST}
      ORDER BY id ASC
      LIMIT 1
    ) AS image
  FROM shop_prices sp
  JOIN products p ON p.id = sp.product_id
  JOIN shops    s ON s.id = sp.shop_id
  LEFT JOIN brands b ON b.id = p.brand_id
  WHERE sp.current_price IS NOT NULL
    AND sp.regular_price IS NOT NULL
    AND sp.current_price < sp.regular_price
    AND sp.current_price > 0
    AND EXISTS (
      SELECT 1 FROM product_images
      WHERE product_id = p.id AND ${IMAGE_WHITELIST}
    )
  ORDER BY sp.updated_at DESC NULLS LAST
  LIMIT 1
`;

// Primary path: real history from price_history.
const SQL = `
  WITH ranked AS (
    SELECT
      ph.id,
      ph.product_id,
      ph.shop_id,
      ph.price,
      ph.recorded_at,
      LAG(ph.price)       OVER (PARTITION BY ph.product_id, ph.shop_id ORDER BY ph.recorded_at) AS prev_price,
      LAG(ph.recorded_at) OVER (PARTITION BY ph.product_id, ph.shop_id ORDER BY ph.recorded_at) AS prev_recorded
    FROM price_history ph
  ),
  changes AS (
    SELECT *
    FROM ranked
    WHERE prev_price IS NOT NULL
      AND prev_price <> price
  )
  SELECT
    p.name,
    b.name AS brand,
    p.slug,
    s.name AS shop_name,
    c.prev_price AS old_price,
    c.price     AS new_price,
    c.recorded_at AS changed_at,
    (
      SELECT image_url FROM product_images
      WHERE product_id = p.id
        AND image_url ~ '^https?://'
        AND (
          image_url ILIKE 'https://clusteraz.flesk.fr/%'
          OR image_url ILIKE 'https://cdn.monoprix.tn/%'
          OR image_url ILIKE 'https://beautystore.tn/%'
          OR image_url ILIKE 'https://parashop.tn/%'
          OR image_url ILIKE 'https://www.parashop.tn/%'
          OR image_url ILIKE 'https://pharma-shop.tn/%'
          OR image_url ILIKE 'https://pharmashop.tn/%'
          OR image_url ILIKE 'https://www.tunisianet.com.tn/%'
          OR image_url ILIKE 'https://www.mytek.tn/%'
          OR image_url ILIKE 'https://spacenet.tn/%'
          OR image_url ILIKE 'https://agora.tn/%'
          OR image_url ILIKE 'https://www.sbsinformatique.com/%'
          OR image_url ILIKE 'https://www.carrefour.tn/%'
          OR image_url ILIKE 'https://www.mapara.tn/%'
          OR image_url ILIKE 'https://www.paraexpert.tn/%'
          OR image_url ILIKE 'https://parafendri.tn/%'
          OR image_url ILIKE 'https://www.cosmetique.tn/%'
          OR image_url ILIKE 'https://www.pharmacie-elfarabi.tn/%'
          OR image_url ILIKE 'https://parahouse.tn/%'
          OR image_url ILIKE 'https://paraland.tn/%'
        )
      ORDER BY id ASC
      LIMIT 1
    ) AS image
  FROM changes c
  JOIN products p ON p.id = c.product_id
  JOIN shops    s ON s.id = c.shop_id
  LEFT JOIN brands b ON b.id = p.brand_id
  ORDER BY c.recorded_at DESC
  LIMIT 1
`;

async function fetchOne(cat: typeof CATALOGS[number], sql: string): Promise<Row | null> {
  try {
    const r = await cat.getPool().query(sql);
    const row = r.rows[0];
    if (!row) return null;
    return {
      catalog: cat.label,
      catalogPath: cat.path,
      name: row.name,
      brand: row.brand,
      slug: row.slug,
      image: row.image,
      shopName: row.shop_name,
      oldPrice: parseFloat(row.old_price),
      newPrice: parseFloat(row.new_price),
      changedAt: row.changed_at,
    } as Row;
  } catch {
    return null;
  }
}

export async function GET() {
  try {
    // First try real price_history.
    let rows = await Promise.all(CATALOGS.map((c) => fetchOne(c, SQL)));
    let valid = rows.filter((r): r is Row => r !== null);

    // If no history yet, fall back to "most recent active discount".
    if (valid.length === 0) {
      rows = await Promise.all(CATALOGS.map((c) => fetchOne(c, SQL_FALLBACK)));
      valid = rows.filter((r): r is Row => r !== null);
    }

    if (valid.length === 0) {
      return NextResponse.json({ item: null });
    }

    valid.sort((a, b) => new Date(b.changedAt).getTime() - new Date(a.changedAt).getTime());
    return NextResponse.json({ item: valid[0] });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
