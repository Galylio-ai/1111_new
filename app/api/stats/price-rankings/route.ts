import { NextResponse } from "next/server";
import { Pool } from "pg";

const pool = new Pool({ connectionString: process.env.RETAIL_DB_URL, max: 2 });

export const revalidate = 3600;

export async function GET() {
  const client = await pool.connect();
  try {
    const scopesRes = await client.query(`
      SELECT scope_id, scope_name, level1_id, level2_id, matched_products, distinct_shops
      FROM price_ranking_scopes
      ORDER BY scope_id
    `);

    const shopsRes = await client.query(`
      SELECT scope_id, rank, shop_key, products_compared, fair_win_rate,
             cheapest_score, median_price_index, avg_extra_cost_vs_cheapest, confidence
      FROM price_ranking_shops
      ORDER BY scope_id, rank
    `);

    const shopsByScope = new Map<string, typeof shopsRes.rows>();
    for (const row of shopsRes.rows) {
      if (!shopsByScope.has(row.scope_id)) shopsByScope.set(row.scope_id, []);
      shopsByScope.get(row.scope_id)!.push(row);
    }

    const scopes = scopesRes.rows.map(s => ({
      ...s,
      shops: shopsByScope.get(s.scope_id) ?? [],
    }));

    return NextResponse.json({ scopes });
  } finally {
    client.release();
  }
}
