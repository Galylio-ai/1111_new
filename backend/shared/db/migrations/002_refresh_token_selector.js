/**
 * Migration 002 — refresh_token selector column + google_id index
 *
 * Problem solved
 * ──────────────
 * Previously every /auth/refresh call loaded ALL non-revoked tokens and
 * ran bcrypt.compare() on each one: O(N × ~100 ms).  A single user with
 * 1 000 active sessions made every refresh call take ~100 s.
 *
 * Fix
 * ───
 * The raw refresh token is now split into two parts:
 *   selector (16 hex chars) — stored in plain text, used as a DB lookup key
 *   secret   (64 hex chars) — bcrypt-hashed and stored as token_hash
 *
 * Lookup is now: WHERE selector = ? (O(1) via unique index), then a single
 * bcrypt.compare() on the secret portion of the matching row.
 *
 * Existing rows
 * ─────────────
 * Rows created before this migration have selector = NULL.  The partial
 * unique index (WHERE selector IS NOT NULL) excludes them, so no uniqueness
 * violation occurs.  Those tokens can no longer be looked up by the new code
 * and are effectively invalidated — users will need to log in again once.
 *
 * @param {import('knex').Knex} knex
 */
exports.up = async function (knex) {
  // 1. Add selector column (nullable so pre-existing rows are unaffected)
  await knex.raw(`
    ALTER TABLE auth.refresh_tokens
      ADD COLUMN IF NOT EXISTS selector VARCHAR(16)
  `);

  // 2. Unique index on selector, excluding NULLs (pre-migration rows)
  await knex.raw(`
    CREATE UNIQUE INDEX IF NOT EXISTS idx_rt_selector
      ON auth.refresh_tokens (selector)
      WHERE selector IS NOT NULL
  `);

  // 3. Index for Google OAuth lookup (was missing from migration 001)
  await knex.raw(`
    CREATE INDEX IF NOT EXISTS idx_users_google_id
      ON auth.users (google_id)
  `);
};

/**
 * @param {import('knex').Knex} knex
 */
exports.down = async function (knex) {
  await knex.raw('DROP INDEX IF EXISTS idx_rt_selector');
  await knex.raw('DROP INDEX IF EXISTS idx_users_google_id');
  await knex.raw(`
    ALTER TABLE auth.refresh_tokens
      DROP COLUMN IF EXISTS selector
  `);
};
