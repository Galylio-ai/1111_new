import { Pool } from "pg";
import { catalogBySlug, catalogByScopeId } from "@/lib/priceRankings";

const pool = new Pool({ connectionString: process.env.RETAIL_DB_URL, max: 2 });

export type RankedShopRow = {
  rank: number;
  shop_key: string;
  products_compared: number;
  fair_win_rate: number;
  cheapest_score: number;
  median_price_index: number;
  avg_extra_cost_vs_cheapest: number;
  confidence: string;
  pairwise_comparisons?: number;
  wins?: number;
  losses?: number;
  ties?: number;
};

export type ScopeRanking = {
  scope_id: string;
  scope_name: string;
  level1_id: string | null;
  level2_id: string | null;
  matched_products: number;
  distinct_shops: number;
  generated_at: string | null;
  shops: RankedShopRow[];
};

async function queryScope(scopeId: string, shopLimit = 50): Promise<ScopeRanking | null> {
  const client = await pool.connect();
  try {
    const scopeRes = await client.query(
      `SELECT scope_id, scope_name, level1_id, level2_id, matched_products, distinct_shops, generated_at
       FROM price_ranking_scopes WHERE scope_id = $1`,
      [scopeId]
    );
    if (!scopeRes.rows[0]) return null;

    const shopsRes = await client.query(
      `SELECT rank, shop_key, products_compared, fair_win_rate, cheapest_score,
              median_price_index, avg_extra_cost_vs_cheapest, confidence,
              pairwise_comparisons, wins, losses, ties
       FROM price_ranking_shops
       WHERE scope_id = $1
       ORDER BY rank ASC
       LIMIT $2`,
      [scopeId, shopLimit]
    );

    return { ...scopeRes.rows[0], shops: shopsRes.rows };
  } finally {
    client.release();
  }
}

export async function getRankingBySlug(slug: string, shopLimit = 15) {
  const catalog = catalogBySlug(slug);
  if (!catalog) return null;
  const scope = await queryScope(catalog.scopeId, shopLimit);
  if (!scope) return null;
  return { catalog, scope };
}

export async function getFeaturedRankings(shopLimit = 3) {
  const client = await pool.connect();
  try {
    const scopesRes = await client.query(
      `SELECT scope_id, scope_name, level1_id, level2_id, matched_products, distinct_shops
       FROM price_ranking_scopes
       ORDER BY scope_id`
    );
    const shopsRes = await client.query(
      `SELECT scope_id, rank, shop_key, products_compared, fair_win_rate,
              cheapest_score, median_price_index, confidence
       FROM price_ranking_shops
       WHERE rank <= $1
       ORDER BY scope_id, rank`,
      [shopLimit]
    );

    const byScope = new Map<string, RankedShopRow[]>();
    for (const row of shopsRes.rows) {
      if (!byScope.has(row.scope_id)) byScope.set(row.scope_id, []);
      byScope.get(row.scope_id)!.push(row);
    }

    return scopesRes.rows.map((s) => ({
      ...s,
      shops: byScope.get(s.scope_id) ?? [],
    }));
  } finally {
    client.release();
  }
}

export function attachCatalog<T extends { scope_id: string }>(scopes: T[]) {
  return scopes
    .map((s) => ({ ...s, catalog: catalogByScopeId(s.scope_id) }))
    .filter((s) => s.catalog);
}
