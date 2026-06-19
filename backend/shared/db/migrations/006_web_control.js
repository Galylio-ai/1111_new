exports.up = async function up(knex) {
  await knex.raw(`
    CREATE TABLE IF NOT EXISTS web_banners (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      title TEXT NOT NULL,
      subtitle TEXT NULL,
      image_url TEXT NULL,
      cta_label TEXT NULL,
      cta_url TEXT NULL,
      placement TEXT NOT NULL,
      display_order INT NOT NULL DEFAULT 0,
      catalog_domain TEXT NULL CHECK (catalog_domain IN ('retail', 'para', 'alimentation', 'fashion')),
      category_level TEXT NULL CHECK (category_level IN ('top', 'low', 'sub')),
      category_id BIGINT NULL,
      product_id BIGINT NULL,
      status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'archived', 'hidden')),
      metadata JSONB NOT NULL DEFAULT '{}',
      created_at TIMESTAMPTZ DEFAULT now(),
      updated_at TIMESTAMPTZ DEFAULT now()
    );

    CREATE TABLE IF NOT EXISTS web_sections (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      section_key TEXT NOT NULL UNIQUE,
      title TEXT NOT NULL,
      subtitle TEXT NULL,
      section_type TEXT NOT NULL DEFAULT 'manual',
      display_order INT NOT NULL DEFAULT 0,
      status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'archived', 'hidden')),
      metadata JSONB NOT NULL DEFAULT '{}',
      created_at TIMESTAMPTZ DEFAULT now(),
      updated_at TIMESTAMPTZ DEFAULT now()
    );

    CREATE TABLE IF NOT EXISTS web_section_items (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      section_id UUID NOT NULL REFERENCES web_sections(id) ON DELETE CASCADE,
      item_type TEXT NOT NULL DEFAULT 'manual',
      catalog_domain TEXT NULL CHECK (catalog_domain IN ('retail', 'para', 'alimentation', 'fashion')),
      category_level TEXT NULL CHECK (category_level IN ('top', 'low', 'sub')),
      category_id BIGINT NULL,
      product_id BIGINT NULL,
      title TEXT NULL,
      image_url TEXT NULL,
      cta_url TEXT NULL,
      display_order INT NOT NULL DEFAULT 0,
      metadata JSONB NOT NULL DEFAULT '{}',
      created_at TIMESTAMPTZ DEFAULT now(),
      updated_at TIMESTAMPTZ DEFAULT now()
    );

    CREATE TABLE IF NOT EXISTS web_footer_groups (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      title TEXT NOT NULL,
      display_order INT NOT NULL DEFAULT 0,
      status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'archived', 'hidden')),
      created_at TIMESTAMPTZ DEFAULT now(),
      updated_at TIMESTAMPTZ DEFAULT now()
    );

    CREATE TABLE IF NOT EXISTS web_footer_links (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      group_id UUID NOT NULL REFERENCES web_footer_groups(id) ON DELETE CASCADE,
      label TEXT NOT NULL,
      href TEXT NOT NULL,
      display_order INT NOT NULL DEFAULT 0,
      status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'archived', 'hidden')),
      created_at TIMESTAMPTZ DEFAULT now(),
      updated_at TIMESTAMPTZ DEFAULT now()
    );

    CREATE TABLE IF NOT EXISTS web_settings (
      key TEXT PRIMARY KEY,
      value JSONB NOT NULL DEFAULT '{}',
      updated_at TIMESTAMPTZ DEFAULT now()
    );

    CREATE INDEX IF NOT EXISTS idx_web_banners_status_order ON web_banners(status, display_order);
    CREATE INDEX IF NOT EXISTS idx_web_banners_catalog_ref ON web_banners(catalog_domain, category_level, category_id, product_id);
    CREATE INDEX IF NOT EXISTS idx_web_sections_status_order ON web_sections(status, display_order);
    CREATE INDEX IF NOT EXISTS idx_web_section_items_section_order ON web_section_items(section_id, display_order);
    CREATE INDEX IF NOT EXISTS idx_web_section_items_catalog_ref ON web_section_items(catalog_domain, category_level, category_id, product_id);
    CREATE INDEX IF NOT EXISTS idx_web_footer_groups_status_order ON web_footer_groups(status, display_order);
    CREATE INDEX IF NOT EXISTS idx_web_footer_links_group_order ON web_footer_links(group_id, display_order);
  `);
};

exports.down = async function down(knex) {
  await knex.raw(`
    DROP TABLE IF EXISTS web_footer_links CASCADE;
    DROP TABLE IF EXISTS web_footer_groups CASCADE;
    DROP TABLE IF EXISTS web_section_items CASCADE;
    DROP TABLE IF EXISTS web_sections CASCADE;
    DROP TABLE IF EXISTS web_banners CASCADE;
    DROP TABLE IF EXISTS web_settings CASCADE;
  `);
};
