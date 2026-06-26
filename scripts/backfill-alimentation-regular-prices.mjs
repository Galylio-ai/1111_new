#!/usr/bin/env node
/**
 * Backfill shop_prices.regular_price from price_history when the import
 * stored strikethrough prices only in history (old_price not mapped).
 *
 * Usage:
 *   ALIMENTATION_DB_URL=... node scripts/backfill-alimentation-regular-prices.mjs [--dry-run]
 */
import pg from "pg";

const DRY_RUN = process.argv.includes("--dry-run");
const url = process.env.ALIMENTATION_DB_URL;
if (!url) {
  console.error("Missing ALIMENTATION_DB_URL");
  process.exit(1);
}

const pool = new pg.Pool({ connectionString: url, max: 3 });

const SQL = `
  UPDATE shop_prices sp
  SET regular_price = ref.ref_price,
      updated_at = NOW()
  FROM (
    SELECT
      sp2.product_id,
      sp2.shop_id,
      COALESCE(
        (
          SELECT ph.regular_price
          FROM price_history ph
          WHERE ph.product_id = sp2.product_id
            AND ph.shop_id = sp2.shop_id
            AND ph.regular_price IS NOT NULL
            AND ph.regular_price > sp2.current_price
          ORDER BY ph.recorded_at DESC
          LIMIT 1
        ),
        (
          SELECT ph.price
          FROM price_history ph
          WHERE ph.product_id = sp2.product_id
            AND ph.shop_id = sp2.shop_id
            AND ph.price > sp2.current_price
          ORDER BY ph.recorded_at DESC
          LIMIT 1
        )
      ) AS ref_price
    FROM shop_prices sp2
    WHERE sp2.current_price > 0
      AND (sp2.regular_price IS NULL OR sp2.regular_price <= sp2.current_price)
  ) ref
  WHERE sp.product_id = ref.product_id
    AND sp.shop_id = ref.shop_id
    AND ref.ref_price IS NOT NULL
    AND ref.ref_price > sp.current_price
`;

async function main() {
  if (DRY_RUN) {
    const preview = await pool.query(`
      SELECT COUNT(*)::int AS rows
      FROM shop_prices sp
      JOIN (
        SELECT sp2.product_id, sp2.shop_id,
          COALESCE(
            (SELECT ph.regular_price FROM price_history ph
             WHERE ph.product_id = sp2.product_id AND ph.shop_id = sp2.shop_id
               AND ph.regular_price IS NOT NULL AND ph.regular_price > sp2.current_price
             ORDER BY ph.recorded_at DESC LIMIT 1),
            (SELECT ph.price FROM price_history ph
             WHERE ph.product_id = sp2.product_id AND ph.shop_id = sp2.shop_id
               AND ph.price > sp2.current_price
             ORDER BY ph.recorded_at DESC LIMIT 1)
          ) AS ref_price
        FROM shop_prices sp2
        WHERE sp2.current_price > 0
          AND (sp2.regular_price IS NULL OR sp2.regular_price <= sp2.current_price)
      ) ref ON ref.product_id = sp.product_id AND ref.shop_id = sp.shop_id
      WHERE ref.ref_price IS NOT NULL AND ref.ref_price > sp.current_price
    `);
    console.log(`Would update ${preview.rows[0]?.rows ?? 0} shop_prices rows`);
    return;
  }
  const r = await pool.query(SQL);
  console.log(`Updated ${r.rowCount ?? 0} shop_prices rows with reference prices`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => pool.end());
