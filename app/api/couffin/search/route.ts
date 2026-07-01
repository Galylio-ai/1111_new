import { NextRequest, NextResponse } from "next/server";
import { alimentPool } from "@/lib/db";
import { appendProductSearch, normalizeSearchText } from "@/lib/productSearch";
import { productCoverImageSql } from "@/lib/productImages";
import { isFoodProduct } from "@/lib/couffinFoodFilter";

// Search supermarché products to add to the couffin.
export async function GET(req: NextRequest) {
  const q = normalizeSearchText(req.nextUrl.searchParams.get("q") ?? "");
  const limit = Math.min(20, Math.max(1, parseInt(req.nextUrl.searchParams.get("limit") ?? "10", 10)));
  if (q.length < 2) return NextResponse.json({ items: [] });

  try {
    const pool = alimentPool();
    const conditions: string[] = [];
    const params: (string | number)[] = [];
    const relevanceOrder = appendProductSearch(q, conditions, params);
    const where = conditions.length ? `WHERE ${conditions.join(" AND ")}` : "";
    const orderBy = relevanceOrder ?? "COUNT(DISTINCT sp.shop_id) DESC, p.id";

    const { rows } = await pool.query<{
      id: number;
      name: string;
      brand: string;
      img: string | null;
      min_price: string;
      max_price: string;
      shop_count: string;
    }>(
      `SELECT p.id, p.name, COALESCE(b.name,'') AS brand,
              ${productCoverImageSql("p.id")} AS img,
              MIN(sp.current_price) AS min_price,
              MAX(sp.current_price) AS max_price,
              COUNT(DISTINCT sp.shop_id) AS shop_count
       FROM products p
       LEFT JOIN brands b ON b.id = p.brand_id
       JOIN shop_prices sp ON sp.product_id = p.id
       ${where}
       GROUP BY p.id, p.name, b.name
       ORDER BY ${orderBy}
       LIMIT $${params.length + 1}`,
      [...params, limit],
    );

    const items = rows
      .filter((r) => isFoodProduct(r.name))
      .map((r) => ({
        id: Number(r.id),
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
