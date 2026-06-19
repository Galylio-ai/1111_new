/**
 * Migration 003 — auth.purge_expired_tokens() stored procedure
 *
 * Deletes rows that are safe to remove:
 *   - Naturally expired tokens older than 1 day (grace period lets any
 *     in-flight refresh that was issued just before expiry still complete)
 *   - Explicitly revoked tokens older than 7 days (enough time for any
 *     audit log or anomaly-detection query to have processed them)
 *
 * Called nightly by the cleanup service defined in docker-compose.yml.
 *
 * @param {import('knex').Knex} knex
 */
exports.up = async function (knex) {
  await knex.raw(`
    CREATE OR REPLACE FUNCTION auth.purge_expired_tokens()
    RETURNS void
    LANGUAGE plpgsql
    AS $$
    BEGIN
      DELETE FROM auth.refresh_tokens
      WHERE
        expires_at < NOW() - INTERVAL '1 day'
        OR (revoked = TRUE AND created_at < NOW() - INTERVAL '7 days');
    END;
    $$;
  `);
};

/**
 * @param {import('knex').Knex} knex
 */
exports.down = async function (knex) {
  await knex.raw('DROP FUNCTION IF EXISTS auth.purge_expired_tokens()');
};
