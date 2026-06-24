import { NextResponse } from "next/server";
import { retailPool } from "@/lib/db";

export const revalidate = 300;

type Observatoire = {
  pricesModifiedToday: number;
  activePromos: number;
  fakePromos: number;
  newProductsToday: number;
};

// Real-data observatoire for the Magasins (retail) catalog only.
//
// "Fake promo" heuristic: a current discount that beats the market floor by
// >30% AND is announced as ≥40% off — these are nearly always overstated
// "regular_price" values inflated to make the deal look bigger than it is.
export async function GET() {
  try {
    const pool = retailPool();

    const [pricesRes, promosRes, fakeRes, newRes] = await Promise.all([
      // Prices modified today: any shop_prices row touched since 00:00.
      pool.query<{ c: string }>(`
        SELECT COUNT(*)::text AS c
        FROM shop_prices
        WHERE updated_at >= date_trunc('day', now())
      `),

      // Active promos: current_price < regular_price right now.
      pool.query<{ c: string }>(`
        SELECT COUNT(*)::text AS c
        FROM shop_prices
        WHERE current_price > 0
          AND regular_price > 0
          AND current_price < regular_price
      `),

      // Fake promos: shop's announced discount is much larger than the real
      // market discount (current_price vs the market floor for that product).
      pool.query<{ c: string }>(`
        WITH market AS (
          SELECT product_id, MIN(current_price) AS market_min
          FROM shop_prices
          WHERE current_price > 0
          GROUP BY product_id
          HAVING COUNT(DISTINCT shop_id) >= 2
        )
        SELECT COUNT(*)::text AS c
        FROM shop_prices sp
        JOIN market m ON m.product_id = sp.product_id
        WHERE sp.regular_price > 0
          AND sp.current_price > 0
          AND sp.regular_price > sp.current_price
          AND (sp.regular_price - sp.current_price) / sp.regular_price >= 0.40
          AND sp.current_price > m.market_min * 1.30
      `),

      // New products created today.
      pool.query<{ c: string }>(`
        SELECT COUNT(*)::text AS c
        FROM products
        WHERE created_at >= date_trunc('day', now())
      `),
    ]);

    const result: Observatoire = {
      pricesModifiedToday: parseInt(pricesRes.rows[0]?.c ?? "0", 10) || 0,
      activePromos: parseInt(promosRes.rows[0]?.c ?? "0", 10) || 0,
      fakePromos: parseInt(fakeRes.rows[0]?.c ?? "0", 10) || 0,
      newProductsToday: parseInt(newRes.rows[0]?.c ?? "0", 10) || 0,
    };

    return NextResponse.json(result);
  } catch (err) {
    return NextResponse.json(
      { pricesModifiedToday: 0, activePromos: 0, fakePromos: 0, newProductsToday: 0, error: String(err) },
      { status: 200 }
    );
  }
}
