import { NextResponse } from "next/server";
import { alimentPool } from "@/lib/db";

export const dynamic = "force-dynamic";

type Champion = {
  shop: string;
  cheapestCount: number;
  totalProducts: number;
  winRate: number;
};

export async function GET() {
  try {
    const pool = alimentPool();

    // For each comparable product (sold by at least 2 shops), find the market
    // floor, then count how often each shop is tied for the lowest price.
    const res = await pool.query<{ shop: string; wins: string; total: string }>(
      `WITH comparable_products AS (
         SELECT
           product_id,
           MIN(current_price) AS min_price,
           COUNT(DISTINCT shop_id) AS shop_count
         FROM shop_prices
         WHERE current_price IS NOT NULL
           AND current_price > 0
         GROUP BY product_id
         HAVING COUNT(DISTINCT shop_id) >= 2
       ),
       per_shop_prices AS (
         SELECT sp.shop_id, sp.product_id, MIN(sp.current_price) AS shop_price
         FROM shop_prices sp
         JOIN comparable_products cp ON cp.product_id = sp.product_id
         WHERE sp.current_price IS NOT NULL
           AND sp.current_price > 0
         GROUP BY sp.shop_id, sp.product_id
       ),
       per_shop AS (
         SELECT psp.shop_id,
                COUNT(*) FILTER (WHERE psp.shop_price = cp.min_price) AS wins,
                COUNT(*) AS total
         FROM per_shop_prices psp
         JOIN comparable_products cp ON cp.product_id = psp.product_id
         GROUP BY psp.shop_id
         HAVING COUNT(*) >= 30
            AND COUNT(*) FILTER (WHERE psp.shop_price = cp.min_price) > 0
       )
       SELECT s.name AS shop,
              ps.wins::text,
              ps.total::text
       FROM per_shop ps
       JOIN shops s ON s.id = ps.shop_id
       ORDER BY ps.wins DESC, (ps.wins::numeric / NULLIF(ps.total, 0)) DESC, s.name ASC
       LIMIT 5`
    );

    const champions: Champion[] = res.rows.map((r) => {
      const wins = parseInt(r.wins, 10) || 0;
      const total = parseInt(r.total, 10) || 1;
      return {
        shop: r.shop,
        cheapestCount: wins,
        totalProducts: total,
        winRate: Math.round((wins / total) * 100),
      };
    });

    return NextResponse.json(
      { champions, source: "alimentation-db", comparableOnly: true },
      { headers: { "Cache-Control": "no-store" } }
    );
  } catch (err) {
    return NextResponse.json(
      { champions: [], error: String(err) },
      { status: 500, headers: { "Cache-Control": "no-store" } }
    );
  }
}
