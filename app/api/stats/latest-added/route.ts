import { NextResponse } from "next/server";
import { CATALOGS } from "@/lib/db";

export const revalidate = 300; // 5 minutes

type Row = {
  catalog: string;
  catalogPath: string;
  name: string;
  brand: string | null;
  slug: string;
  image: string | null;
  price: number | null;
  shopName: string | null;
  createdAt: string;
};

// Keep only products whose first image comes from a known-working CDN.
// Excludes hosts that block hotlinking (geantdrive) and images we already saw fail.
const SQL = `
  WITH eligible AS (
    SELECT p.id, p.name, p.slug, p.created_at, p.brand_id,
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
    FROM products p
    WHERE p.created_at IS NOT NULL
      AND p.name NOT ILIKE 'anthelios%'
    ORDER BY p.created_at DESC
    LIMIT 100
  )
  SELECT
    e.name,
    b.name AS brand,
    e.slug,
    e.created_at,
    e.image,
    (SELECT MIN(sp.current_price) FROM shop_prices sp WHERE sp.product_id = e.id) AS price,
    (
      SELECT s.name
      FROM shop_prices sp JOIN shops s ON s.id = sp.shop_id
      WHERE sp.product_id = e.id
      ORDER BY sp.current_price ASC NULLS LAST
      LIMIT 1
    ) AS shop_name
  FROM eligible e
  LEFT JOIN brands b ON b.id = e.brand_id
  WHERE e.image IS NOT NULL
  ORDER BY e.created_at DESC
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
          return {
            catalog: cat.label,
            catalogPath: cat.path,
            name: row.name,
            brand: row.brand,
            slug: row.slug,
            image: row.image,
            price: row.price != null ? parseFloat(row.price) : null,
            shopName: row.shop_name,
            createdAt: row.created_at,
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

    valid.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    return NextResponse.json({ item: valid[0] });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
