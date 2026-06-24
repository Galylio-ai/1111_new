import { NextResponse } from "next/server";
import { CATALOGS } from "@/lib/db";

export const revalidate = 300; // 5 minutes

// Latest product added to the parapharmacie catalog only. Same shape and image
// eligibility rules as /api/stats/latest-added, but scoped to the para pool.
const SQL = `
  WITH eligible AS (
    SELECT p.id, p.name, p.slug, p.created_at, p.brand_id,
           (
             SELECT image_url FROM product_images
             WHERE product_id = p.id
               AND image_url ~ '^https?://'
               AND (
                 image_url ILIKE 'https://clusteraz.flesk.fr/%'
                 OR image_url ILIKE 'https://beautystore.tn/%'
                 OR image_url ILIKE 'https://parashop.tn/%'
                 OR image_url ILIKE 'https://www.parashop.tn/%'
                 OR image_url ILIKE 'https://pharma-shop.tn/%'
                 OR image_url ILIKE 'https://pharmashop.tn/%'
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
  const cat = CATALOGS.find((c) => c.key === "para");
  if (!cat) return NextResponse.json({ item: null });
  try {
    const r = await cat.getPool().query(SQL);
    const row = r.rows[0];
    if (!row) return NextResponse.json({ item: null });
    return NextResponse.json({
      item: {
        catalog: cat.label,
        catalogPath: cat.path,
        name: row.name,
        brand: row.brand,
        slug: row.slug,
        image: row.image,
        price: row.price != null ? parseFloat(row.price) : null,
        shopName: row.shop_name,
        createdAt: row.created_at,
      },
    });
  } catch (err) {
    return NextResponse.json({ error: String(err), item: null }, { status: 500 });
  }
}
