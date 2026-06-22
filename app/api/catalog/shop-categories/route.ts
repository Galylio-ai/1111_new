import { NextResponse } from "next/server";
import { catalogPool } from "@/lib/db";

export const revalidate = 300;

// GET /api/catalog/shop-categories
// Every shop with its OWN list of top_categories (and per-category product
// counts), so the /categories page can show each boutique independently.
export async function GET() {
  try {
    const { rows } = await catalogPool().query<{
      shop_id: number;
      shop_slug: string;
      shop_key: string;
      shop_name: string;
      logo_url: string | null;
      product_count: number;
      categories: { name: string; count: number }[] | null;
    }>(
      `SELECT s.id   AS shop_id,
              s.slug AS shop_slug,
              s.shop_key,
              s.name AS shop_name,
              s.logo_url,
              s.product_count,
              cat.categories
       FROM shops s
       JOIN LATERAL (
         SELECT json_agg(
                  json_build_object('name', c.top_category, 'count', c.n)
                  ORDER BY c.n DESC
                ) AS categories
         FROM (
           SELECT top_category, COUNT(*) AS n
           FROM products
           WHERE shop_id = s.id AND top_category IS NOT NULL AND top_category <> ''
           GROUP BY top_category
         ) c
       ) cat ON TRUE
       WHERE s.product_count > 0
       ORDER BY s.product_count DESC, s.name`
    );

    const shops = rows
      .map((r) => ({
        slug: r.shop_slug,
        key: r.shop_key,
        name: r.shop_name,
        logo: r.logo_url,
        count: r.product_count,
        categories: (r.categories ?? []).filter((c) => c.name),
      }))
      .filter((s) => s.categories.length > 0);

    const totalCategories = shops.reduce((n, s) => n + s.categories.length, 0);

    return NextResponse.json({ shops, totalShops: shops.length, totalCategories });
  } catch (err) {
    return NextResponse.json({ error: String(err), shops: [] }, { status: 500 });
  }
}
