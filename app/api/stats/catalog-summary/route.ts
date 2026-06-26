import { NextResponse } from "next/server";
import { alimentPool, paraPool, retailPool } from "@/lib/db";
import { queryAlimentationSectorStats, querySectorStats } from "@/lib/marketPromoStats";

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
  catalogPath: CatalogStats["catalogPath"],
  alimentation = false,
): Promise<CatalogStats | null> {
  try {
    const row = alimentation
      ? await queryAlimentationSectorStats(pool)
      : await querySectorStats(pool);
    return {
      catalog,
      catalogPath,
      products: row.products,
      shops: row.shops,
      activePromos: row.promos,
      avgDiscountPct: row.promos > 0
        ? Math.round((parseFloat(row.savings) / parseFloat(row.promo_regular_sum)) * 100)
        : 0,
      totalSavingsDT: Math.round(parseFloat(row.savings) || 0),
    };
  } catch {
    return null;
  }
}

export async function GET() {
  const results = await Promise.all([
    queryStats(alimentPool(), "Supermarché", "/supermarche", true),
    queryStats(paraPool(), "Parapharmacie", "/parapharmacie"),
    queryStats(retailPool(), "Retail", "/retail"),
  ]);
  const catalogs = results.filter((c): c is CatalogStats => c !== null);
  return NextResponse.json({ catalogs });
}
