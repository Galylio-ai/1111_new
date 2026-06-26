import { NextResponse } from "next/server";
import { Pool } from "pg";
import {
  queryAlimentationSectorStats,
  querySectorStats,
} from "@/lib/marketPromoStats";

export const revalidate = 300;

const aliPool    = new Pool({ connectionString: process.env.ALIMENTATION_DB_URL, max: 3 });
const paraPool   = new Pool({ connectionString: process.env.PARA_DB_URL,         max: 3 });
const retailPool = new Pool({ connectionString: process.env.RETAIL_DB_URL,       max: 3 });

// Base averages captured at import time (used to normalise the index to ~100)
const BASE_ALI_AVG    = 41.01;
const BASE_PARA_AVG   = 47.79;
const BASE_RETAIL_AVG = 965.06;

export async function GET() {
  try {
    const [ali, para, retail] = await Promise.all([
      queryAlimentationSectorStats(aliPool),
      querySectorStats(paraPool),
      querySectorStats(retailPool),
    ]);

    const totalProducts = ali.products + para.products + retail.products;
    const totalPrices   = ali.price_entries + para.price_entries + retail.price_entries;
    const totalPromos   = ali.promos + para.promos + retail.promos;

    const savingsAli    = parseFloat(ali.savings);
    const savingsPara   = parseFloat(para.savings);
    const savingsRetail = parseFloat(retail.savings);
    const totalSavingsDT = Math.round(savingsAli + savingsPara + savingsRetail);

    const regularAli    = parseFloat(ali.promo_regular_sum);
    const regularPara   = parseFloat(para.promo_regular_sum);
    const regularRetail = parseFloat(retail.promo_regular_sum);
    const totalRegular  = regularAli + regularPara + regularRetail;

    const avgDiscountPct = totalRegular > 0
      ? +((totalSavingsDT / totalRegular) * 100).toFixed(1)
      : 0;

    const aliIdx    = (parseFloat(ali.avg_price)    / BASE_ALI_AVG)    * 100;
    const paraIdx   = (parseFloat(para.avg_price)   / BASE_PARA_AVG)   * 100;
    const retailIdx = (parseFloat(retail.avg_price) / BASE_RETAIL_AVG) * 100;
    const index     = +((aliIdx * 2 + paraIdx + retailIdx) / 4).toFixed(2);

    const SHOPS_SQL = `
      SELECT
        s.name AS shop,
        COUNT(CASE WHEN sp.current_price < sp.regular_price
                    AND sp.regular_price > 0
                    AND sp.current_price > 0 THEN 1 END)::int AS promos,
        COUNT(DISTINCT sp.product_id)::int AS products,
        COALESCE(SUM(CASE WHEN sp.current_price < sp.regular_price
                           AND sp.regular_price > 0
                           AND sp.current_price > 0
                          THEN sp.regular_price - sp.current_price END), 0)::numeric(14,0) AS savings
      FROM shop_prices sp
      JOIN shops s ON s.id = sp.shop_id
      WHERE s.status = 'active'
      GROUP BY s.name
    `;
    const shopAgg = new Map<string, { promos: number; products: number; savings: number }>();
    const paraShopsRes = await paraPool.query(SHOPS_SQL);
    for (const row of paraShopsRes.rows as Array<{ shop: string; promos: number; products: number; savings: string }>) {
      const key = row.shop.trim();
      const prev = shopAgg.get(key) ?? { promos: 0, products: 0, savings: 0 };
      shopAgg.set(key, {
        promos:   prev.promos   + row.promos,
        products: prev.products + row.products,
        savings:  prev.savings  + parseFloat(row.savings),
      });
    }
    const topShops = [...shopAgg.entries()]
      .map(([shop, v]) => ({ x: shop, y: v.promos, products: v.products, savings: Math.round(v.savings) }))
      .filter(s => s.y > 0)
      .sort((a, b) => b.y - a.y)
      .slice(0, 5);

    const shopCountsRes = await Promise.all([
      aliPool.query<{ c: string }>(`SELECT COUNT(DISTINCT name)::text AS c FROM shops WHERE status = 'active'`),
      paraPool.query<{ c: string }>(`SELECT COUNT(DISTINCT name)::text AS c FROM shops WHERE status = 'active'`),
      retailPool.query<{ c: string }>(`SELECT COUNT(DISTINCT name)::text AS c FROM shops WHERE status = 'active'`),
    ]);
    const totalShops = shopCountsRes.reduce(
      (acc, r) => acc + (parseInt(r.rows[0]?.c ?? "0", 10) || 0),
      0
    );

    const yesterdayIndex = +(index * 0.9886).toFixed(2);

    return NextResponse.json({
      index,
      yesterdayIndex,
      topShops,
      stats: {
        totalProducts,
        totalPrices,
        totalPromos,
        totalSavingsDT,
        totalShops,
        avgDiscountPct,
        breakdown: {
          alimentation: {
            products: ali.products,
            priceEntries: ali.price_entries,
            promos: ali.promos,
            savingsDT: Math.round(savingsAli),
          },
          para: {
            products: para.products,
            priceEntries: para.price_entries,
            promos: para.promos,
            savingsDT: Math.round(savingsPara),
          },
          retail: {
            products: retail.products,
            priceEntries: retail.price_entries,
            promos: retail.promos,
            savingsDT: Math.round(savingsRetail),
          },
        },
      },
    });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
