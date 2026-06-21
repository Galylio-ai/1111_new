import { NextRequest, NextResponse } from "next/server";
import { catalogPool } from "@/lib/db";

// GET /api/catalog/products?shop=tunisianet&page=0&limit=24&q=...&cat=...
// Per-shop catalog browse with search + top_category filter + pagination.
export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const shop  = (searchParams.get("shop") ?? "").trim().toLowerCase();
  const page  = Math.max(0, parseInt(searchParams.get("page")  ?? "0", 10));
  const limit = Math.min(48, Math.max(1, parseInt(searchParams.get("limit") ?? "24", 10)));
  const q     = (searchParams.get("q")   ?? "").trim().toLowerCase();
  const cat   = (searchParams.get("cat") ?? "").trim();

  if (!shop) return NextResponse.json({ error: "shop required" }, { status: 400 });

  try {
    const pool = catalogPool();
    const shopRes = await pool.query<{ id: number; name: string }>(
      `SELECT id, name FROM shops WHERE slug = $1 OR shop_key = $1 LIMIT 1`,
      [shop]
    );
    if (!shopRes.rows.length) return NextResponse.json({ error: "shop not found" }, { status: 404 });
    const shopId = shopRes.rows[0].id;

    const where: string[] = ["p.shop_id = $1"];
    const params: (string | number)[] = [shopId];
    let i = 2;
    if (q)   { where.push(`lower(p.name) LIKE $${i++}`); params.push(`%${q}%`); }
    if (cat) { where.push(`p.top_category = $${i++}`);   params.push(cat); }
    const whereSql = `WHERE ${where.join(" AND ")}`;

    const [countRes, itemsRes, catsRes] = await Promise.all([
      pool.query<{ total: string }>(`SELECT COUNT(*) AS total FROM products p ${whereSql}`, params),
      pool.query(
        `SELECT p.slug, p.name, p.brand, p.image, p.price, p.old_price, p.available,
                p.top_category, p.low_category
         FROM products p ${whereSql}
         ORDER BY (p.image IS NOT NULL) DESC, p.id
         LIMIT $${i} OFFSET $${i + 1}`,
        [...params, limit, page * limit]
      ),
      pool.query<{ top_category: string; n: string }>(
        `SELECT top_category, COUNT(*) n FROM products
         WHERE shop_id = $1 AND top_category IS NOT NULL
         GROUP BY top_category ORDER BY n DESC LIMIT 40`,
        [shopId]
      ),
    ]);

    const items = itemsRes.rows.map(r => {
      const price = r.price != null ? parseFloat(r.price) : null;
      const old   = r.old_price != null ? parseFloat(r.old_price) : null;
      return {
        slug: r.slug,
        name: r.name,
        brand: r.brand ?? "",
        img: r.image ?? "",
        price,
        oldPrice: old,
        available: r.available,
        category: r.top_category,
        discount: old && price && old > price ? Math.round((1 - price / old) * 100) : null,
      };
    });

    return NextResponse.json({
      shop: shopRes.rows[0].name,
      total: parseInt(countRes.rows[0].total, 10),
      page, limit, items,
      categories: catsRes.rows.map(c => ({ name: c.top_category, count: parseInt(c.n, 10) })),
    });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
