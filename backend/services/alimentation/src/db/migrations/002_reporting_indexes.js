/**
 * @param {import('knex').Knex} knex
 */
exports.up = async function (knex) {
  await knex.raw(`
    CREATE INDEX IF NOT EXISTS idx_products_source_product_id
      ON products(source_product_id)
      WHERE source_product_id IS NOT NULL;

    CREATE INDEX IF NOT EXISTS idx_products_name_lower
      ON products(lower(name));

    CREATE INDEX IF NOT EXISTS idx_products_slug_lower
      ON products(lower(slug));

    CREATE INDEX IF NOT EXISTS idx_products_status_created_at
      ON products(status, created_at DESC);

    CREATE INDEX IF NOT EXISTS idx_shops_status_created_at
      ON shops(status, created_at DESC);

    CREATE INDEX IF NOT EXISTS idx_brands_status_created_at
      ON brands(status, created_at DESC);

    CREATE INDEX IF NOT EXISTS idx_shop_prices_shop_updated_at
      ON shop_prices(shop_id, updated_at DESC);

    CREATE INDEX IF NOT EXISTS idx_shop_prices_product_current_price
      ON shop_prices(product_id, current_price);

    CREATE INDEX IF NOT EXISTS idx_shop_prices_current_price
      ON shop_prices(current_price)
      WHERE current_price IS NOT NULL;

    CREATE INDEX IF NOT EXISTS idx_product_specs_key_value
      ON product_specs(spec_key, spec_value);

    CREATE INDEX IF NOT EXISTS idx_product_specs_key
      ON product_specs(spec_key);

    CREATE INDEX IF NOT EXISTS idx_price_history_shop_recorded_at
      ON price_history(shop_id, recorded_at DESC);

    CREATE INDEX IF NOT EXISTS idx_price_history_recorded_at
      ON price_history(recorded_at DESC);
  `);
};

/**
 * @param {import('knex').Knex} knex
 */
exports.down = async function (knex) {
  await knex.raw(`
    DROP INDEX IF EXISTS idx_price_history_recorded_at;
    DROP INDEX IF EXISTS idx_price_history_shop_recorded_at;
    DROP INDEX IF EXISTS idx_product_specs_key;
    DROP INDEX IF EXISTS idx_product_specs_key_value;
    DROP INDEX IF EXISTS idx_shop_prices_current_price;
    DROP INDEX IF EXISTS idx_shop_prices_product_current_price;
    DROP INDEX IF EXISTS idx_shop_prices_shop_updated_at;
    DROP INDEX IF EXISTS idx_brands_status_created_at;
    DROP INDEX IF EXISTS idx_shops_status_created_at;
    DROP INDEX IF EXISTS idx_products_status_created_at;
    DROP INDEX IF EXISTS idx_products_slug_lower;
    DROP INDEX IF EXISTS idx_products_name_lower;
    DROP INDEX IF EXISTS idx_products_source_product_id;
  `);
};
