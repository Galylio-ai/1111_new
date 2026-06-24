import { NextResponse } from "next/server";
import { Pool } from "pg";

export const revalidate = 300;

const aliPool    = new Pool({ connectionString: process.env.ALIMENTATION_DB_URL, max: 3 });
const paraPool   = new Pool({ connectionString: process.env.PARA_DB_URL,         max: 3 });
const retailPool = new Pool({ connectionString: process.env.RETAIL_DB_URL,       max: 3 });

// Base averages captured at import time (used to normalise the index to ~100)
const BASE_ALI_AVG    = 41.01;
const BASE_PARA_AVG   = 47.79;
const BASE_RETAIL_AVG = 965.06;

type Stats = {
  products: number;
  price_entries: number;
  promos: number;
  savings: string;
  avg_price: string;
  promo_regular_sum: string;
  shops: number;
};

async function queryStats(pool: Pool): Promise<Stats> {
  const client = await pool.connect();
  try {
    const r = await client.query<Stats>(`
      SELECT
        COUNT(DISTINCT p.id)::int                                AS products,
        COUNT(*)::int                                            AS price_entries,
        COUNT(CASE WHEN sp.current_price < sp.regular_price
                    AND sp.regular_price > 0
                    AND sp.current_price  > 0 THEN 1 END)::int  AS promos,
        COALESCE(SUM(CASE WHEN sp.current_price < sp.regular_price
                           AND sp.regular_price > 0
                           AND sp.current_price  > 0
                          THEN sp.regular_price - sp.current_price END), 0)::numeric(14,2) AS savings,
        COALESCE(SUM(CASE WHEN sp.current_price < sp.regular_price
                           AND sp.regular_price > 0
                           AND sp.current_price  > 0
                          THEN sp.regular_price END), 0)::numeric(14,2)                    AS promo_regular_sum,
        COALESCE(AVG(sp.current_price), 0)::numeric(10,3)        AS avg_price,
        (SELECT COUNT(*)::int FROM shops WHERE status = 'active')                          AS shops
      FROM products p
      JOIN shop_prices sp ON sp.product_id = p.id
    `);
    return r.rows[0];
  } finally {
    client.release();
  }
}

export async function GET() {
  try {
    const [ali, para, retail] = await Promise.all([
      queryStats(aliPool),
      queryStats(paraPool),
      queryStats(retailPool),
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

    // Real weighted average: total savings / total regular price of promo rows.
    // Equivalent to the mean discount % across all currently-on-sale entries,
    // weighted by item price.
    const avgDiscountPct = totalRegular > 0
      ? +((totalSavingsDT / totalRegular) * 100).toFixed(1)
      : 0;

    // Index: weighted avg of 3 normalised sub-indices (alimentation weighted ×2 for daily relevance)
    const aliIdx    = (parseFloat(ali.avg_price)    / BASE_ALI_AVG)    * 100;
    const paraIdx   = (parseFloat(para.avg_price)   / BASE_PARA_AVG)   * 100;
    const retailIdx = (parseFloat(retail.avg_price) / BASE_RETAIL_AVG) * 100;
    const index     = +((aliIdx * 2 + paraIdx + retailIdx) / 4).toFixed(2);

    // Real chart payload: top 5 shops by current promotion count (merged across the 3 DBs).
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
    // "Top boutiques en promo" — restrict to parapharmacies only (Mapara,
    // ParaShop, Parafendri, etc.) so the chart isn't dominated by retail
    // tech sites that happen to have huge discount counts.
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

    // Total shop count across all 3 catalogs (independent of the para-only top chart).
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
          alimentation: { products: ali.products,    promos: ali.promos,    savingsDT: Math.round(savingsAli) },
          para:         { products: para.products,   promos: para.promos,   savingsDT: Math.round(savingsPara) },
          retail:       { products: retail.products, promos: retail.promos, savingsDT: Math.round(savingsRetail) },
        },
      },
    });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
