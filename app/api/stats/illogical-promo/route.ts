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
  shopName: string;
  oldPrice: number;       // suspicious regular_price (the lie)
  currentPrice: number;   // current price at the offender shop
  honestMin: number;      // min price across other shops (what the product really costs)
  effectiveDiscountPct: number; // honestMin → currentPrice diff (often near 0 or negative)
  claimedDiscountPct: number;   // (regular_price → current_price) -- inflated
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

// Detect fake "ancien prix" claims from current data (no history needed):
//   - At least 3 distinct shops sell the product (so we have a market floor)
//   - Shop's regular_price > 1.4 * min(current_price) across all shops
//   - regular_price > current_price (must look like a discount)
//   - Product MUST have at least one whitelisted image so the card renders cleanly
//
// Picks the most flagrant lie (largest gap between claimed regular and honest market min).
const SQL = `
  WITH per_product AS (
    SELECT
      sp.product_id,
      MIN(sp.current_price) AS min_current,
      COUNT(DISTINCT sp.shop_id) AS shop_count
    FROM shop_prices sp
    WHERE sp.current_price IS NOT NULL
    GROUP BY sp.product_id
  ),
  suspicious AS (
    SELECT
      sp.product_id,
      sp.shop_id,
      sp.current_price,
      sp.regular_price,
      sp.updated_at,
      pp.min_current AS honest_min
    FROM shop_prices sp
    JOIN per_product pp ON pp.product_id = sp.product_id
    WHERE sp.regular_price IS NOT NULL
      AND sp.current_price IS NOT NULL
      AND pp.shop_count >= 3
      AND sp.regular_price > pp.min_current * 1.6
      AND sp.regular_price > sp.current_price
      AND sp.current_price <= pp.min_current * 1.15  -- offender's price must also be near the market floor
      AND (1.0 - (sp.current_price / sp.regular_price)) >= 0.25  -- claimed discount must be at least 25%
  )
  SELECT
    p.name,
    b.name AS brand,
    p.slug,
    s.name AS shop_name,
    su.regular_price AS old_price,
    su.current_price AS current_price,
    su.honest_min,
    su.updated_at,
    (
      SELECT image_url FROM product_images
      WHERE product_id = p.id AND ${IMAGE_WHITELIST}
      ORDER BY id ASC
      LIMIT 1
    ) AS image
  FROM suspicious su
  JOIN products p ON p.id = su.product_id
  JOIN shops    s ON s.id = su.shop_id
  LEFT JOIN brands b ON b.id = p.brand_id
  WHERE EXISTS (
    SELECT 1 FROM product_images
    WHERE product_id = p.id AND ${IMAGE_WHITELIST}
  )
  ORDER BY (su.regular_price - su.honest_min) DESC, su.updated_at DESC
  LIMIT 1
`;

export async function GET() {
  try {
    const rows = await Promise.all(
      CATALOGS.map(async (cat) => {
        try {
          const r = await cat.getPool().query(SQL);
          const row = r.rows[0];
          if (!row) return null;
          const oldPrice = parseFloat(row.old_price);
          const currentPrice = parseFloat(row.current_price);
          const honestMin = parseFloat(row.honest_min);
          const claimedDiscountPct = oldPrice > 0
            ? Math.round((1 - currentPrice / oldPrice) * 100)
            : 0;
          const effectiveDiscountPct = honestMin > 0
            ? Math.round((1 - currentPrice / honestMin) * 100)
            : 0;
          return {
            catalog: cat.label,
            catalogPath: cat.path,
            name: row.name,
            brand: row.brand,
            slug: row.slug,
            image: row.image,
            shopName: row.shop_name,
            oldPrice,
            currentPrice,
            honestMin,
            effectiveDiscountPct,
            claimedDiscountPct,
            changedAt: row.updated_at,
          } as Row;
        } catch {
          return null;
        }
      }),
    );

    const valid = rows.filter((r): r is Row => r !== null);
    if (valid.length === 0) {
      return NextResponse.json({ item: null });
    }

    valid.sort((a, b) => (b.oldPrice - b.honestMin) - (a.oldPrice - a.honestMin));
    return NextResponse.json({ item: valid[0] });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
