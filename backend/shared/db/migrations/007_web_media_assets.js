exports.up = async function up(knex) {
  await knex.raw(`
    CREATE TABLE IF NOT EXISTS web_media_assets (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      filename TEXT NOT NULL UNIQUE,
      original_name TEXT NOT NULL,
      mime_type TEXT NOT NULL CHECK (mime_type IN ('image/jpeg', 'image/png', 'image/webp')),
      size_bytes BIGINT NOT NULL,
      url TEXT NOT NULL UNIQUE,
      uploaded_by UUID NULL REFERENCES auth.users(id) ON DELETE SET NULL,
      status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'archived', 'hidden')),
      created_at TIMESTAMPTZ DEFAULT now(),
      updated_at TIMESTAMPTZ DEFAULT now()
    );

    CREATE INDEX IF NOT EXISTS idx_web_media_assets_status_created ON web_media_assets(status, created_at DESC);
    CREATE INDEX IF NOT EXISTS idx_web_media_assets_uploaded_by ON web_media_assets(uploaded_by);
  `);
};

exports.down = async function down(knex) {
  await knex.raw('DROP TABLE IF EXISTS web_media_assets CASCADE;');
};
