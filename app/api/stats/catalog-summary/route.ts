import { NextResponse } from "next/server";
import { alimentPool, paraPool, retailPool } from "@/lib/db";

export const revalidate = 600;

type CatalogStats = {
  catalog: "Supermarché" | "Parapharmacie" | "Retail";
  catalogPath: "/supermarche" | "/parapharmacie" | "/retail";
  products: number;
  shops: number;
  activePromos: number;
  avgDiscountPct: number;
  totalSavingsDT: number;
};

async function queryStats(
  pool: ReturnType<typeof alimentPool>,
  catalog: CatalogStats["catalog"],
  catalogPath: CatalogStats["catalogPath"]
): Promise<CatalogStats | null> {
  try {
    const r = await pool.query<{
      products: string; shops: string; promos: string;
      avg_pct: string; savings: string;
    }>(
      `SELECT
         COUNT(DISTINCT p.id)::text AS products,
         COUNT(DISTINCT sp.shop_id)::text AS shops,
         COUNT(*) FILTER (WHERE sp.current_price < sp.regular_price AND sp.regular_price > 0 AND sp.current_price > 0)::text AS promos,
         COALESCE(AVG(CASE WHEN sp.current_price < sp.regular_price AND sp.regular_price > 0 AND sp.current_price > 0
                           THEN ((sp.regular_price - sp.current_price) / sp.regular_price) * 100 END), 0)::text AS avg_pct,
         COALESCE(SUM(CASE WHEN sp.current_price < sp.regular_price AND sp.regular_price > 0 AND sp.current_price > 0
                           THEN sp.regular_price - sp.current_price END), 0)::text AS savings
       FROM products p
       JOIN shop_prices sp ON sp.product_id = p.id`
    );
    const row = r.rows[0];
    if (!row) return null;
    return {
      catalog,
      catalogPath,
      products: parseInt(row.products, 10) || 0,
      shops: parseInt(row.shops, 10) || 0,
      activePromos: parseInt(row.promos, 10) || 0,
      avgDiscountPct: Math.round(parseFloat(row.avg_pct) || 0),
      totalSavingsDT: Math.round(parseFloat(row.savings) || 0),
    };
  } catch {
    return null;
  }
}

export async function GET() {
  const results = await Promise.all([
    queryStats(alimentPool(), "Supermarché", "/supermarche"),
    queryStats(paraPool(), "Parapharmacie", "/parapharmacie"),
    queryStats(retailPool(), "Retail", "/retail"),
  ]);
  const catalogs = results.filter((c): c is CatalogStats => c !== null);
  return NextResponse.json({ catalogs });
}
