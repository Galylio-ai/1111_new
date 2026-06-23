import { NextResponse } from "next/server";
import { alimentPool } from "@/lib/db";

export const revalidate = 600;

type Champion = {
  shop: string;
  cheapestCount: number;
  totalProducts: number;
  winRate: number;
};

export async function GET() {
  try {
    const pool = alimentPool();

    // For each product, find the min price across shops, then for each shop
    // count how many products it holds the min for. "Win rate" = wins / catalog.
    const res = await pool.query<{ shop: string; wins: string; total: string }>(
      `WITH product_min AS (
         SELECT product_id, MIN(current_price) AS min_price
         FROM shop_prices
         WHERE current_price > 0
         GROUP BY product_id
       ),
       per_shop_prices AS (
         SELECT sp.shop_id, sp.product_id, MIN(sp.current_price) AS shop_price
         FROM shop_prices sp
         WHERE sp.current_price > 0
         GROUP BY sp.shop_id, sp.product_id
       ),
       per_shop AS (
         SELECT psp.shop_id,
                COUNT(*) FILTER (WHERE psp.shop_price = pm.min_price) AS wins,
                COUNT(*) AS total
         FROM per_shop_prices psp
         JOIN product_min pm ON pm.product_id = psp.product_id
         GROUP BY psp.shop_id
         HAVING COUNT(*) >= 30
       )
       SELECT s.name AS shop,
              ps.wins::text,
              ps.total::text
       FROM per_shop ps
       JOIN shops s ON s.id = ps.shop_id
       ORDER BY ps.wins DESC
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

    return NextResponse.json({ champions });
  } catch (err) {
    return NextResponse.json({ champions: [], error: String(err) }, { status: 200 });
  }
}
