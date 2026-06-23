import { NextResponse } from "next/server";
import { alimentPool, paraPool, retailPool } from "@/lib/db";

export const revalidate = 600;

type Pulse = {
  pricesUpdated24h: number;
  priceDropsCount: number;
  priceRisesCount: number;
  newProducts24h: number;
  topCategory: { name: string; count: number } | null;
  shopsActive: number;
  lastUpdate: string | null;
};

async function countSafe(pool: ReturnType<typeof alimentPool>, sql: string): Promise<number> {
  try {
    const r = await pool.query<{ c: string }>(sql);
    return parseInt(r.rows[0]?.c ?? "0", 10) || 0;
  } catch {
    return 0;
  }
}

async function queryOne<T>(pool: ReturnType<typeof alimentPool>, sql: string): Promise<T | null> {
  try {
    const r = await pool.query(sql);
    return (r.rows[0] as T) ?? null;
  } catch {
    return null;
  }
}

export async function GET() {
  const pools = [alimentPool(), paraPool(), retailPool()];

  // 1. Prices updated in the last 24h (across all 3 catalogs)
  const updatedCounts = await Promise.all(
    pools.map((p) =>
      countSafe(p, `SELECT COUNT(*)::text AS c FROM shop_prices WHERE updated_at >= NOW() - INTERVAL '24 hours'`)
    )
  );

  // 2. Real price drops vs rises in last 24h from price_history (if it exists)
  const dropsRises = await Promise.all(
    pools.map(async (p) => {
      try {
        const r = await p.query<{ drops: string; rises: string }>(
          `WITH ranked AS (
             SELECT product_id, shop_id, price, recorded_at,
                    LAG(price) OVER (PARTITION BY product_id, shop_id ORDER BY recorded_at) AS prev_price
             FROM price_history
             WHERE recorded_at >= NOW() - INTERVAL '24 hours'
           )
           SELECT
             COUNT(*) FILTER (WHERE prev_price IS NOT NULL AND price < prev_price)::text AS drops,
             COUNT(*) FILTER (WHERE prev_price IS NOT NULL AND price > prev_price)::text AS rises
           FROM ranked`
        );
        return {
          drops: parseInt(r.rows[0]?.drops ?? "0", 10) || 0,
          rises: parseInt(r.rows[0]?.rises ?? "0", 10) || 0,
        };
      } catch {
        return { drops: 0, rises: 0 };
      }
    })
  );

  // 3. New products added in last 24h
  const newCounts = await Promise.all(
    pools.map((p) =>
      countSafe(p, `SELECT COUNT(*)::text AS c FROM products WHERE created_at >= NOW() - INTERVAL '24 hours'`)
    )
  );

  // 4. Top category by number of products (from supermarche — most useful for landing)
  const topCat = await queryOne<{ name: string; c: string }>(
    alimentPool(),
    `SELECT c.name, COUNT(*)::text AS c
     FROM products p
     JOIN categories c ON c.id = p.category_id
     GROUP BY c.id, c.name
     ORDER BY c.id DESC
     LIMIT 1`
  );

  // 5. Active shops (have at least one price in last 7 days)
  const activeShops = await Promise.all(
    pools.map((p) =>
      countSafe(
        p,
        `SELECT COUNT(DISTINCT shop_id)::text AS c FROM shop_prices WHERE updated_at >= NOW() - INTERVAL '7 days'`
      )
    )
  );

  // 6. Most recent update timestamp
  const lastUpdates = await Promise.all(
    pools.map(async (p) => {
      try {
        const r = await p.query<{ t: string | null }>(
          `SELECT MAX(updated_at)::text AS t FROM shop_prices`
        );
        return r.rows[0]?.t ?? null;
      } catch {
        return null;
      }
    })
  );

  const lastUpdate = lastUpdates
    .filter((t): t is string => !!t)
    .sort()
    .reverse()[0] ?? null;

  const pulse: Pulse = {
    pricesUpdated24h: updatedCounts.reduce((s, n) => s + n, 0),
    priceDropsCount: dropsRises.reduce((s, x) => s + x.drops, 0),
    priceRisesCount: dropsRises.reduce((s, x) => s + x.rises, 0),
    newProducts24h: newCounts.reduce((s, n) => s + n, 0),
    topCategory: topCat ? { name: topCat.name, count: parseInt(topCat.c, 10) || 0 } : null,
    shopsActive: activeShops.reduce((s, n) => s + n, 0),
    lastUpdate,
  };

  return NextResponse.json(pulse);
}
