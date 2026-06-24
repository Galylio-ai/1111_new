import { NextRequest, NextResponse } from "next/server";
import { Pool } from "pg";
import { productCoverImageSql } from "@/lib/productImages";

const pool = new Pool({
  connectionString: process.env.ALIMENTATION_DB_URL,
  max: 5,
});

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const page  = Math.max(0, parseInt(searchParams.get("page")  ?? "0", 10));
  const limit = Math.min(48, Math.max(1, parseInt(searchParams.get("limit") ?? "24", 10)));
  const q     = (searchParams.get("q")    ?? "").trim();
  const shop  = (searchParams.get("shop") ?? "").trim().toLowerCase();

  const conditions: string[] = [];
  const params: (string | number)[] = [];
  let idx = 1;

  if (q) {
    conditions.push(`(lower(p.name) LIKE $${idx} OR lower(b.name) LIKE $${idx})`);
    params.push(`%${q.toLowerCase()}%`);
    idx++;
  }
  if (shop) {
    conditions.push(`lower(s.name) LIKE $${idx}`);
    params.push(`%${shop}%`);
    idx++;
  }

  const where = conditions.length ? `WHERE ${conditions.join(" AND ")}` : "";

  const countSql = `
    SELECT COUNT(DISTINCT p.id) AS total
    FROM products p
    LEFT JOIN brands b ON b.id = p.brand_id
    JOIN shop_prices sp ON sp.product_id = p.id
    JOIN shops s ON s.id = sp.shop_id
    ${where}
  `;

  const itemsSql = `
    SELECT
      p.id,
      p.name,
      COALESCE(b.name, '') AS brand,
      MIN(sp.current_price) AS min_price,
      MAX(sp.current_price) AS max_price,
      ${productCoverImageSql("p.id")} AS img,
      array_agg(DISTINCT s.name ORDER BY s.name) AS shop_names
    FROM products p
    LEFT JOIN brands b ON b.id = p.brand_id
    JOIN shop_prices sp ON sp.product_id = p.id
    JOIN shops s ON s.id = sp.shop_id
    ${where}
    GROUP BY p.id, p.name, b.name
    ORDER BY COUNT(DISTINCT s.id) DESC, p.id
    LIMIT $${idx} OFFSET $${idx + 1}
  `;

  try {
    const [countRes, itemsRes] = await Promise.all([
      pool.query(countSql, params),
      pool.query(itemsSql, [...params, limit, page * limit]),
    ]);

    const total = parseInt(countRes.rows[0].total, 10);
    const items = itemsRes.rows.map(r => ({
      name:      r.name,
      brand:     r.brand,
      img:       r.img ?? "",
      minPrice:  parseFloat(r.min_price) || 0,
      maxPrice:  parseFloat(r.max_price) || 0,
      shopNames: r.shop_names ?? [],
      discount:  r.max_price > r.min_price
        ? Math.round((1 - r.min_price / r.max_price) * 100)
        : null,
    }));

    return NextResponse.json({ total, page, limit, items });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
