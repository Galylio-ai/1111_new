import { NextResponse } from "next/server";
import { catalogPool } from "@/lib/db";

export const revalidate = 300;

// GET /api/catalog/shops → all shops with product counts, for the Boutiques grid
export async function GET() {
  try {
    const { rows } = await catalogPool().query<{
      slug: string; shop_key: string; name: string;
      logo_url: string | null; product_count: number;
      top_categories: string[];
    }>(
      `SELECT s.slug, s.shop_key, s.name, s.logo_url, s.product_count,
              COALESCE(
                (SELECT array_agg(DISTINCT tc) FROM (
                  SELECT top_category AS tc FROM products
                  WHERE shop_id = s.id AND top_category IS NOT NULL
                  LIMIT 200
                ) t), '{}'
              ) AS top_categories
       FROM shops s
       WHERE s.product_count > 0
       ORDER BY s.product_count DESC, s.name`
    );

    const shops = rows.map(r => ({
      slug: r.slug,
      key: r.shop_key,
      name: r.name,
      logo: r.logo_url,
      count: r.product_count,
      categories: (r.top_categories ?? []).slice(0, 4),
    }));

    return NextResponse.json({ shops, total: shops.length });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
