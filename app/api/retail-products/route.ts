import { NextRequest, NextResponse } from "next/server";
import { Pool } from "pg";

const pool = new Pool({ connectionString: process.env.RETAIL_DB_URL, max: 4 });

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const page  = Math.max(0, parseInt(searchParams.get("page")  ?? "0", 10));
  const limit = Math.min(48, Math.max(1, parseInt(searchParams.get("limit") ?? "24", 10)));
  const cat   = (searchParams.get("cat")  ?? "").trim().toLowerCase();
  const q     = (searchParams.get("q")    ?? "").trim().toLowerCase();
  const shop  = (searchParams.get("shop") ?? "").trim().toLowerCase();

  const conditions: string[] = [];
  const params: (string | number)[] = [];

  if (cat) {
    params.push(`%${cat}%`);
    conditions.push(`(lower(tc.name) LIKE $${params.length} OR lower(lc.name) LIKE $${params.length} OR lower(sc.name) LIKE $${params.length})`);
  }
  if (q) {
    params.push(`%${q}%`);
    conditions.push(`(lower(p.name) LIKE $${params.length} OR lower(b.name) LIKE $${params.length})`);
  }
  if (shop) {
    params.push(`%${shop}%`);
    conditions.push(`p.id IN (
      SELECT sp2.product_id FROM shop_prices sp2
      JOIN shops s2 ON s2.id = sp2.shop_id
      WHERE lower(s2.shop_key) LIKE $${params.length} OR lower(s2.name) LIKE $${params.length}
    )`);
  }

  const where = conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";

  const client = await pool.connect();
  try {
    const countRes = await client.query(
      `SELECT COUNT(DISTINCT p.id) AS total
       FROM products p
       LEFT JOIN brands b ON b.id = p.brand_id
       LEFT JOIN product_subcategories psc ON psc.product_id = p.id
       LEFT JOIN subcategories sc ON sc.id = psc.subcategory_id
       LEFT JOIN low_categories lc ON lc.id = sc.low_category_id
       LEFT JOIN top_categories tc ON tc.id = lc.top_category_id
       ${where}`,
      params
    );
    const total = parseInt(countRes.rows[0].total, 10);

    const shopCountRes = await client.query(`SELECT COUNT(*) AS cnt FROM shops`);
    const shopCount = parseInt(shopCountRes.rows[0].cnt, 10);

    params.push(limit, page * limit);
    const dataRes = await client.query(
      `SELECT
         p.id, p.name, p.slug,
         b.name AS brand,
         tc.name AS category,
         MIN(sp.current_price) AS min_price,
         MAX(sp.current_price) AS max_price,
         array_agg(DISTINCT s.shop_key ORDER BY s.shop_key) AS shop_keys,
         (SELECT pi.image_url FROM product_images pi WHERE pi.product_id = p.id ORDER BY pi.id ASC LIMIT 1) AS img
       FROM products p
       LEFT JOIN brands b ON b.id = p.brand_id
       LEFT JOIN product_subcategories psc ON psc.product_id = p.id
       LEFT JOIN subcategories sc ON sc.id = psc.subcategory_id
       LEFT JOIN low_categories lc ON lc.id = sc.low_category_id
       LEFT JOIN top_categories tc ON tc.id = lc.top_category_id
       LEFT JOIN shop_prices sp ON sp.product_id = p.id
       LEFT JOIN shops s ON s.id = sp.shop_id
       ${where}
       GROUP BY p.id, p.name, p.slug, b.name, tc.name
       ORDER BY p.id ASC
       LIMIT $${params.length - 1} OFFSET $${params.length}`,
      params
    );

    const items = dataRes.rows.map((r) => ({
      name: r.name,
      slug: r.slug,
      brand: r.brand ?? "",
      category: r.category ?? "",
      img: r.img ?? null,
      minPrice: r.min_price ? parseFloat(r.min_price) : null,
      maxPrice: r.max_price ? parseFloat(r.max_price) : null,
      shopNames: r.shop_keys ?? [],
      discount: null,
    }));

    return NextResponse.json({ total, page, limit, items, shopCount });
  } finally {
    client.release();
  }
}
