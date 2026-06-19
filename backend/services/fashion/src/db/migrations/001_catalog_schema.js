/**
 * @param {import('knex').Knex} knex
 */
exports.up = async function (knex) {
  await knex.raw(`
    CREATE TABLE IF NOT EXISTS top_categories (
      id BIGSERIAL PRIMARY KEY,
      name TEXT NOT NULL,
      slug TEXT NOT NULL UNIQUE,
      status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'archived', 'hidden')),
      created_at TIMESTAMPTZ DEFAULT now(),
      updated_at TIMESTAMPTZ DEFAULT now()
    );

    CREATE TABLE IF NOT EXISTS low_categories (
      id BIGSERIAL PRIMARY KEY,
      top_category_id BIGINT NOT NULL REFERENCES top_categories(id) ON DELETE RESTRICT,
      name TEXT NOT NULL,
      slug TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'archived', 'hidden')),
      created_at TIMESTAMPTZ DEFAULT now(),
      updated_at TIMESTAMPTZ DEFAULT now(),
      UNIQUE(top_category_id, slug)
    );

    CREATE TABLE IF NOT EXISTS subcategories (
      id BIGSERIAL PRIMARY KEY,
      low_category_id BIGINT NOT NULL REFERENCES low_categories(id) ON DELETE RESTRICT,
      name TEXT NOT NULL,
      slug TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'archived', 'hidden')),
      created_at TIMESTAMPTZ DEFAULT now(),
      updated_at TIMESTAMPTZ DEFAULT now(),
      UNIQUE(low_category_id, slug)
    );

    CREATE TABLE IF NOT EXISTS brands (
      id BIGSERIAL PRIMARY KEY,
      name TEXT NOT NULL,
      slug TEXT NOT NULL UNIQUE,
      status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'archived', 'hidden')),
      created_at TIMESTAMPTZ DEFAULT now(),
      updated_at TIMESTAMPTZ DEFAULT now()
    );

    CREATE TABLE IF NOT EXISTS products (
      id BIGSERIAL PRIMARY KEY,
      brand_id BIGINT NULL REFERENCES brands(id) ON DELETE SET NULL,
      source_product_id TEXT NULL,
      name TEXT NOT NULL,
      slug TEXT NOT NULL UNIQUE,
      description TEXT NULL,
      source_url TEXT NULL,
      status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'archived', 'hidden')),
      created_at TIMESTAMPTZ DEFAULT now(),
      updated_at TIMESTAMPTZ DEFAULT now()
    );

    CREATE TABLE IF NOT EXISTS product_subcategories (
      product_id BIGINT NOT NULL REFERENCES products(id) ON DELETE CASCADE,
      subcategory_id BIGINT NOT NULL REFERENCES subcategories(id) ON DELETE RESTRICT,
      created_at TIMESTAMPTZ DEFAULT now(),
      PRIMARY KEY(product_id, subcategory_id)
    );

    CREATE TABLE IF NOT EXISTS product_images (
      id BIGSERIAL PRIMARY KEY,
      product_id BIGINT NOT NULL REFERENCES products(id) ON DELETE CASCADE,
      image_url TEXT NOT NULL,
      created_at TIMESTAMPTZ DEFAULT now(),
      UNIQUE(product_id, image_url)
    );

    CREATE TABLE IF NOT EXISTS product_specs (
      id BIGSERIAL PRIMARY KEY,
      product_id BIGINT NOT NULL REFERENCES products(id) ON DELETE CASCADE,
      spec_key TEXT NOT NULL,
      spec_value TEXT NOT NULL,
      created_at TIMESTAMPTZ DEFAULT now(),
      UNIQUE(product_id, spec_key, spec_value)
    );

    CREATE TABLE IF NOT EXISTS shops (
      id BIGSERIAL PRIMARY KEY,
      shop_key TEXT NOT NULL UNIQUE,
      name TEXT NOT NULL,
      slug TEXT NOT NULL UNIQUE,
      website_url TEXT NULL,
      logo_url TEXT NULL,
      status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'archived', 'hidden')),
      created_at TIMESTAMPTZ DEFAULT now(),
      updated_at TIMESTAMPTZ DEFAULT now()
    );

    CREATE TABLE IF NOT EXISTS shop_prices (
      product_id BIGINT NOT NULL REFERENCES products(id) ON DELETE CASCADE,
      shop_id BIGINT NOT NULL REFERENCES shops(id) ON DELETE RESTRICT,
      current_price NUMERIC(14,3) NULL,
      regular_price NUMERIC(14,3) NULL,
      shop_product_url TEXT NOT NULL,
      updated_at TIMESTAMPTZ DEFAULT now(),
      PRIMARY KEY(product_id, shop_id)
    );

    CREATE TABLE IF NOT EXISTS price_history (
      id BIGSERIAL PRIMARY KEY,
      product_id BIGINT NOT NULL REFERENCES products(id) ON DELETE CASCADE,
      shop_id BIGINT NOT NULL REFERENCES shops(id) ON DELETE RESTRICT,
      price NUMERIC(14,3) NULL,
      regular_price NUMERIC(14,3) NULL,
      recorded_at TIMESTAMPTZ NOT NULL,
      created_at TIMESTAMPTZ DEFAULT now()
    );

    CREATE INDEX IF NOT EXISTS idx_low_categories_top_category_id ON low_categories(top_category_id);
    CREATE INDEX IF NOT EXISTS idx_subcategories_low_category_id ON subcategories(low_category_id);
    CREATE INDEX IF NOT EXISTS idx_product_subcategories_subcategory_id ON product_subcategories(subcategory_id);
    CREATE INDEX IF NOT EXISTS idx_products_brand_id ON products(brand_id);
    CREATE INDEX IF NOT EXISTS idx_product_images_product_id ON product_images(product_id);
    CREATE INDEX IF NOT EXISTS idx_product_specs_product_id ON product_specs(product_id);
    CREATE INDEX IF NOT EXISTS idx_shop_prices_shop_id ON shop_prices(shop_id);
    CREATE INDEX IF NOT EXISTS idx_price_history_product_shop_recorded_at ON price_history(product_id, shop_id, recorded_at DESC);
  `);
};

/**
 * @param {import('knex').Knex} knex
 */
exports.down = async function (knex) {
  await knex.raw(`
    DROP TABLE IF EXISTS price_history CASCADE;
    DROP TABLE IF EXISTS shop_prices CASCADE;
    DROP TABLE IF EXISTS shops CASCADE;
    DROP TABLE IF EXISTS product_specs CASCADE;
    DROP TABLE IF EXISTS product_images CASCADE;
    DROP TABLE IF EXISTS product_subcategories CASCADE;
    DROP TABLE IF EXISTS products CASCADE;
    DROP TABLE IF EXISTS brands CASCADE;
    DROP TABLE IF EXISTS subcategories CASCADE;
    DROP TABLE IF EXISTS low_categories CASCADE;
    DROP TABLE IF EXISTS top_categories CASCADE;
  `);
};
