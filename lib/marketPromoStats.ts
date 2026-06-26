import type { Pool } from "pg";

/** Resolved reference (strikethrough) price for a shop listing. */
export const PROMO_REFERENCE_PRICE_SQL = `
  COALESCE(
    CASE
      WHEN sp.regular_price IS NOT NULL
       AND sp.regular_price > sp.current_price
       AND sp.current_price > 0
      THEN sp.regular_price
    END,
    (
      SELECT ph.regular_price
      FROM price_history ph
      WHERE ph.product_id = sp.product_id
        AND ph.shop_id = sp.shop_id
        AND ph.regular_price IS NOT NULL
        AND ph.regular_price > sp.current_price
      ORDER BY ph.recorded_at DESC
      LIMIT 1
    ),
    (
      SELECT ph.price
      FROM price_history ph
      WHERE ph.product_id = sp.product_id
        AND ph.shop_id = sp.shop_id
        AND ph.price > sp.current_price
      ORDER BY ph.recorded_at DESC
      LIMIT 1
    )
  )
`;

export type SectorStats = {
  products: number;
  comparable_products: number;
  price_entries: number;
  promos: number;
  savings: string;
  avg_price: string;
  promo_regular_sum: string;
  shops: number;
};

/** Standard promo stats — regular_price vs current_price only. */
export async function querySectorStats(pool: Pool): Promise<SectorStats> {
  const client = await pool.connect();
  try {
    const r = await client.query<SectorStats>(`
      SELECT
        COUNT(DISTINCT p.id)::int                                AS products,
        COUNT(DISTINCT CASE WHEN sp2.shop_count >= 2 THEN p.id END)::int AS comparable_products,
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
      LEFT JOIN (
        SELECT product_id, COUNT(DISTINCT shop_id)::int AS shop_count
        FROM shop_prices
        GROUP BY product_id
      ) sp2 ON sp2.product_id = p.id
    `);
    return r.rows[0];
  } finally {
    client.release();
  }
}

/**
 * Alimentation / supermarché — also resolves reference price from price_history
 * when regular_price was not imported (source JSON uses old_price).
 */
export async function queryAlimentationSectorStats(pool: Pool): Promise<SectorStats> {
  const client = await pool.connect();
  try {
    const r = await client.query<SectorStats>(`
      WITH priced AS (
        SELECT
          p.id AS product_id,
          sp.shop_id,
          sp.current_price,
          (${PROMO_REFERENCE_PRICE_SQL}) AS ref_price
        FROM products p
        JOIN shop_prices sp ON sp.product_id = p.id
        WHERE sp.current_price IS NOT NULL AND sp.current_price > 0
      )
      SELECT
        COUNT(DISTINCT p.id)::int AS products,
        COUNT(DISTINCT CASE WHEN sp2.shop_count >= 2 THEN p.id END)::int AS comparable_products,
        COUNT(pr.product_id)::int AS price_entries,
        COUNT(CASE WHEN pr.ref_price IS NOT NULL AND pr.ref_price > pr.current_price THEN 1 END)::int AS promos,
        COALESCE(SUM(CASE WHEN pr.ref_price IS NOT NULL AND pr.ref_price > pr.current_price
                          THEN pr.ref_price - pr.current_price END), 0)::numeric(14,2) AS savings,
        COALESCE(SUM(CASE WHEN pr.ref_price IS NOT NULL AND pr.ref_price > pr.current_price
                          THEN pr.ref_price END), 0)::numeric(14,2) AS promo_regular_sum,
        COALESCE(AVG(pr.current_price), 0)::numeric(10,3) AS avg_price,
        (SELECT COUNT(*)::int FROM shops WHERE status = 'active') AS shops
      FROM products p
      JOIN priced pr ON pr.product_id = p.id
      LEFT JOIN (
        SELECT product_id, COUNT(DISTINCT shop_id)::int AS shop_count
        FROM shop_prices
        GROUP BY product_id
      ) sp2 ON sp2.product_id = p.id
    `);
    return r.rows[0];
  } finally {
    client.release();
  }
}
