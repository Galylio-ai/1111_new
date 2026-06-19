/**
 * @param {import('knex').Knex} knex
 */
exports.up = async function (knex) {
  await knex.raw('CREATE SCHEMA IF NOT EXISTS auth');
  await knex.raw('CREATE EXTENSION IF NOT EXISTS "pgcrypto"');

  await knex.raw(`
    DO $$ BEGIN
      CREATE TYPE auth.user_role AS ENUM ('user', 'admin', 'super_admin');
    EXCEPTION WHEN duplicate_object THEN NULL; END $$;

    DO $$ BEGIN
      CREATE TYPE auth.otp_type AS ENUM ('email_verification', 'password_reset');
    EXCEPTION WHEN duplicate_object THEN NULL; END $$;
  `);

  await knex.raw(`
    CREATE TABLE IF NOT EXISTS auth.users (
      id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      full_name     VARCHAR(255),
      email         VARCHAR(255) UNIQUE,
      phone         VARCHAR(20) UNIQUE,
      password_hash VARCHAR(255),
      google_id     VARCHAR(255) UNIQUE,
      avatar_url    VARCHAR(500),
      role          auth.user_role NOT NULL DEFAULT 'user',
      state         VARCHAR(100),
      is_email_verified BOOLEAN NOT NULL DEFAULT FALSE,
      is_active     BOOLEAN NOT NULL DEFAULT TRUE,
      created_at    TIMESTAMP NOT NULL DEFAULT NOW(),
      updated_at    TIMESTAMP NOT NULL DEFAULT NOW()
    )
  `);

  await knex.raw(`
    CREATE TABLE IF NOT EXISTS auth.otp_codes (
      id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id    UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
      code       VARCHAR(6) NOT NULL,
      type       auth.otp_type NOT NULL,
      attempts   INT NOT NULL DEFAULT 0,
      expires_at TIMESTAMP NOT NULL,
      used       BOOLEAN NOT NULL DEFAULT FALSE,
      created_at TIMESTAMP NOT NULL DEFAULT NOW()
    )
  `);

  await knex.raw(`
    CREATE TABLE IF NOT EXISTS auth.refresh_tokens (
      id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id    UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
      token_hash VARCHAR(255) NOT NULL,
      expires_at TIMESTAMP NOT NULL,
      revoked    BOOLEAN NOT NULL DEFAULT FALSE,
      created_at TIMESTAMP NOT NULL DEFAULT NOW()
    )
  `);

  await knex.raw(`
    CREATE INDEX IF NOT EXISTS idx_users_email    ON auth.users(email);
    CREATE INDEX IF NOT EXISTS idx_users_phone    ON auth.users(phone);
    CREATE INDEX IF NOT EXISTS idx_otp_user_type  ON auth.otp_codes(user_id, type);
    CREATE INDEX IF NOT EXISTS idx_rt_user        ON auth.refresh_tokens(user_id);
  `);
};

/**
 * @param {import('knex').Knex} knex
 */
exports.down = async function (knex) {
  await knex.raw('DROP TABLE IF EXISTS auth.refresh_tokens CASCADE');
  await knex.raw('DROP TABLE IF EXISTS auth.otp_codes CASCADE');
  await knex.raw('DROP TABLE IF EXISTS auth.users CASCADE');
  await knex.raw('DROP TYPE IF EXISTS auth.otp_type');
  await knex.raw('DROP TYPE IF EXISTS auth.user_role');
  await knex.raw('DROP SCHEMA IF EXISTS auth CASCADE');
};
