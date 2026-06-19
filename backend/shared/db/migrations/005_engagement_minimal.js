exports.up = async function up(knex) {
  await knex.raw(`
    CREATE TABLE IF NOT EXISTS favorites (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id UUID NOT NULL,
      catalog_domain TEXT NOT NULL CHECK (catalog_domain IN ('retail', 'para', 'alimentation', 'fashion')),
      product_id BIGINT NOT NULL,
      created_at TIMESTAMPTZ DEFAULT now(),
      UNIQUE(user_id, catalog_domain, product_id)
    );

    CREATE TABLE IF NOT EXISTS alerts (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id UUID NOT NULL,
      catalog_domain TEXT NOT NULL CHECK (catalog_domain IN ('retail', 'para', 'alimentation', 'fashion')),
      product_id BIGINT NOT NULL,
      alert_type TEXT NOT NULL CHECK (alert_type IN ('price_drop', 'price_below', 'back_in_stock', 'promotion')),
      created_at TIMESTAMPTZ DEFAULT now(),
      UNIQUE(user_id, catalog_domain, product_id, alert_type)
    );

    CREATE INDEX IF NOT EXISTS idx_favorites_user_id ON favorites(user_id);
    CREATE INDEX IF NOT EXISTS idx_favorites_product_ref ON favorites(catalog_domain, product_id);
    CREATE INDEX IF NOT EXISTS idx_alerts_user_id ON alerts(user_id);
    CREATE INDEX IF NOT EXISTS idx_alerts_product_ref ON alerts(catalog_domain, product_id);
  `);
};

exports.down = async function down(knex) {
  await knex.raw(`
    DROP TABLE IF EXISTS alerts CASCADE;
    DROP TABLE IF EXISTS favorites CASCADE;
  `);
};
