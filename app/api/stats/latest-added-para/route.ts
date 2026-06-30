import { NextResponse } from "next/server";
import { CATALOGS } from "@/lib/db";
import { productCoverImageFilterSql, productCoverImageOrderSql } from "@/lib/productImages";

export const revalidate = 300; // 5 minutes

// Latest product added to the parapharmacie catalog only. Same shape and image
// eligibility rules as /api/stats/latest-added, but scoped to the para pool.
const SQL = `
  WITH eligible AS (
    SELECT p.id, p.name, p.slug, p.created_at, p.brand_id,
           (
             SELECT image_url FROM product_images
             WHERE product_id = p.id
               AND ${productCoverImageFilterSql()}
               AND image_url NOT ILIKE '%pharmashop.tn%'
               AND image_url NOT ILIKE '%pharma-shop.tn%'
             ORDER BY ${productCoverImageOrderSql()}
             LIMIT 1
           ) AS image
    FROM products p
    WHERE p.created_at IS NOT NULL
      AND p.name NOT ILIKE 'anthelios%'
      AND p.name NOT ILIKE 'uriage eau thermale gelee d''eau 40ml%'
    ORDER BY p.created_at DESC
    LIMIT 1000
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
    AND e.image ~* '^https?://'
    AND length(e.image) > 20
    AND EXISTS (
      SELECT 1 FROM shop_prices sp
      JOIN shops s ON s.id = sp.shop_id
      WHERE sp.product_id = e.id
        AND s.slug NOT IN ('pharmashop', 'pharma-shop')
    )
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
