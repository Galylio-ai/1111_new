-- ============================================================================
-- catalog_db schema — unified "Boutiques" catalog migrated from the 2 Mongo
-- Atlas clusters (Retails). One DB holding every scraped shop's full catalog
-- plus details, price/availability history, and scrape deltas/summaries.
-- Idempotent: safe to run repeatedly.
-- ============================================================================

CREATE TABLE IF NOT EXISTS shops (
  id              BIGSERIAL PRIMARY KEY,
  shop_key        TEXT NOT NULL UNIQUE,         -- e.g. "tunisianet"
  name            TEXT NOT NULL,                -- display name
  slug            TEXT NOT NULL UNIQUE,         -- url-safe
  website_url     TEXT NULL,
  logo_url        TEXT NULL,
  source_clusters TEXT[] NOT NULL DEFAULT '{}', -- which Mongo clusters this shop came from
  product_count   INTEGER NOT NULL DEFAULT 0,
  created_at      TIMESTAMPTZ DEFAULT now(),
  updated_at      TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS products (
  id              BIGSERIAL PRIMARY KEY,
  shop_id         BIGINT NOT NULL REFERENCES shops(id) ON DELETE CASCADE,
  source_cluster  TEXT NOT NULL,               -- "c1" | "c2" (which Atlas cluster)
  source_product_id TEXT NULL,                  -- Mongo doc "id" within the shop
  name            TEXT NOT NULL,
  slug            TEXT NOT NULL,
  brand           TEXT NULL,
  image           TEXT NULL,
  url             TEXT NULL,
  top_category    TEXT NULL,
  low_category    TEXT NULL,
  subcategory     TEXT NULL,
  price           NUMERIC(14,3) NULL,
  old_price       NUMERIC(14,3) NULL,
  available       BOOLEAN NULL,
  availability    TEXT NULL,                    -- raw label ("En stock", "IN_STOCK", ...)
  scraped_at      TIMESTAMPTZ NULL,             -- Mongo _updated_at (used to keep newest)
  updated_at      TIMESTAMPTZ DEFAULT now(),
  -- A product is unique per (shop, source product id) REGARDLESS of which Mongo
  -- cluster it came from — the same shop is scraped into both clusters, so we
  -- dedup across them and keep the newest by scraped_at.
  UNIQUE(shop_id, source_product_id)
);

CREATE TABLE IF NOT EXISTS product_details (
  product_id      BIGINT PRIMARY KEY REFERENCES products(id) ON DELETE CASCADE,
  title           TEXT NULL,
  brand           TEXT NULL,
  sku             TEXT NULL,
  barcode         TEXT NULL,
  overview        TEXT NULL,
  description     TEXT NULL,
  specifications  JSONB NULL,                   -- spec_key -> value object
  images          JSONB NULL,                   -- array of image urls
  store_availability JSONB NULL,                -- per-store stock array
  updated_at      TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS price_history (
  id              BIGSERIAL PRIMARY KEY,
  product_id      BIGINT NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  price           NUMERIC(14,3) NULL,
  recorded_at     TIMESTAMPTZ NOT NULL,
  UNIQUE(product_id, recorded_at)
);

CREATE TABLE IF NOT EXISTS availability_history (
  id              BIGSERIAL PRIMARY KEY,
  product_id      BIGINT NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  available       BOOLEAN NULL,
  status          TEXT NULL,
  recorded_at     TIMESTAMPTZ NOT NULL,
  UNIQUE(product_id, recorded_at)
);

CREATE TABLE IF NOT EXISTS products_added (
  id              BIGSERIAL PRIMARY KEY,
  shop_id         BIGINT NOT NULL REFERENCES shops(id) ON DELETE CASCADE,
  source_cluster  TEXT NOT NULL,
  source_product_id TEXT NULL,
  detected_at     TIMESTAMPTZ NULL,
  snapshot        JSONB NOT NULL                -- full mongo doc preserved
);

CREATE TABLE IF NOT EXISTS products_removed (
  id              BIGSERIAL PRIMARY KEY,
  shop_id         BIGINT NOT NULL REFERENCES shops(id) ON DELETE CASCADE,
  source_cluster  TEXT NOT NULL,
  source_product_id TEXT NULL,
  detected_at     TIMESTAMPTZ NULL,
  snapshot        JSONB NOT NULL
);

CREATE TABLE IF NOT EXISTS scrape_summaries (
  id              BIGSERIAL PRIMARY KEY,
  shop_id         BIGINT NULL REFERENCES shops(id) ON DELETE CASCADE,
  source_cluster  TEXT NOT NULL,
  kind            TEXT NOT NULL,                -- "summary" | "summary_products" | "summary_details" | "other"
  scraped_at      TIMESTAMPTZ NULL,
  payload         JSONB NOT NULL
);

-- ── Indexes (catalog browse + joins) ──────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_products_shop_id        ON products(shop_id);
CREATE INDEX IF NOT EXISTS idx_products_shop_slug      ON products(shop_id, slug);
CREATE INDEX IF NOT EXISTS idx_products_top_category   ON products(shop_id, top_category);
CREATE INDEX IF NOT EXISTS idx_products_name_trgm      ON products USING gin (lower(name) gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_price_history_product   ON price_history(product_id, recorded_at DESC);
CREATE INDEX IF NOT EXISTS idx_avail_history_product   ON availability_history(product_id, recorded_at DESC);
CREATE INDEX IF NOT EXISTS idx_products_added_shop     ON products_added(shop_id);
CREATE INDEX IF NOT EXISTS idx_products_removed_shop   ON products_removed(shop_id);

-- pg_trgm powers fast ILIKE/substring search on product names
CREATE EXTENSION IF NOT EXISTS pg_trgm;
