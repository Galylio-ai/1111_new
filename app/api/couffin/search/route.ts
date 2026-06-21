import { NextRequest, NextResponse } from "next/server";
import { Pool } from "pg";

// Search supermarché products to add to the couffin. Returns the stable product
// id (needed for basket cost computation), name, image, brand and price range.
const pool = new Pool({ connectionString: process.env.ALIMENTATION_DB_URL, max: 5 });

export async function GET(req: NextRequest) {
  const q = (req.nextUrl.searchParams.get("q") ?? "").trim().toLowerCase();
  const limit = Math.min(20, Math.max(1, parseInt(req.nextUrl.searchParams.get("limit") ?? "10", 10)));
  if (q.length < 2) return NextResponse.json({ items: [] });

  try {
    const { rows } = await pool.query<{
      id: number; name: string; brand: string; img: string | null;
      min_price: string; max_price: string; shop_count: string;
    }>(
      `SELECT p.id, p.name, COALESCE(b.name,'') AS brand,
              (SELECT image_url FROM product_images WHERE product_id = p.id LIMIT 1) AS img,
              MIN(sp.current_price) AS min_price,
              MAX(sp.current_price) AS max_price,
              COUNT(DISTINCT sp.shop_id) AS shop_count
       FROM products p
       LEFT JOIN brands b ON b.id = p.brand_id
       JOIN shop_prices sp ON sp.product_id = p.id
       WHERE lower(p.name) LIKE $1
       GROUP BY p.id, p.name, b.name
       ORDER BY COUNT(DISTINCT sp.shop_id) DESC, p.id
       LIMIT $2`,
      [`%${q}%`, limit]
    );

    const items = rows.map((r) => ({
      id: r.id,
      name: r.name,
      brand: r.brand,
      img: r.img ?? "",
      minPrice: parseFloat(r.min_price) || 0,
      maxPrice: parseFloat(r.max_price) || 0,
      shopCount: parseInt(r.shop_count, 10) || 0,
    }));
    return NextResponse.json({ items });
  } catch (err) {
    return NextResponse.json({ error: String(err), items: [] }, { status: 500 });
  }
}
