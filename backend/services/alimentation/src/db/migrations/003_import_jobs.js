/**
 * @param {import('knex').Knex} knex
 */
exports.up = async function up(knex) {
  await knex.raw(`
    CREATE EXTENSION IF NOT EXISTS pgcrypto;

    CREATE TABLE IF NOT EXISTS import_jobs (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      source_type TEXT NOT NULL CHECK (source_type IN ('json', 'csv')),
      status TEXT NOT NULL CHECK (
        status IN ('previewed', 'running', 'completed', 'completed_with_errors', 'failed')
      ),
      total_rows INTEGER NOT NULL DEFAULT 0,
      valid_rows INTEGER NOT NULL DEFAULT 0,
      created_count INTEGER NOT NULL DEFAULT 0,
      updated_count INTEGER NOT NULL DEFAULT 0,
      failed_count INTEGER NOT NULL DEFAULT 0,
      archived_count INTEGER NOT NULL DEFAULT 0,
      mapping JSONB NOT NULL DEFAULT '{}',
      summary JSONB NOT NULL DEFAULT '{}',
      created_at TIMESTAMPTZ DEFAULT now(),
      finished_at TIMESTAMPTZ NULL
    );

    CREATE TABLE IF NOT EXISTS import_errors (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      import_job_id UUID NOT NULL REFERENCES import_jobs(id) ON DELETE CASCADE,
      row_number INTEGER NOT NULL,
      source_row JSONB NOT NULL DEFAULT '{}',
      error_code TEXT NOT NULL,
      error_message TEXT NOT NULL,
      created_at TIMESTAMPTZ DEFAULT now()
    );

    CREATE INDEX IF NOT EXISTS idx_import_jobs_status ON import_jobs(status);
    CREATE INDEX IF NOT EXISTS idx_import_jobs_created_at ON import_jobs(created_at DESC);
    CREATE INDEX IF NOT EXISTS idx_import_errors_import_job_id ON import_errors(import_job_id);
  `);
};

/**
 * @param {import('knex').Knex} knex
 */
exports.down = async function down(knex) {
  await knex.raw(`
    DROP TABLE IF EXISTS import_errors CASCADE;
    DROP TABLE IF EXISTS import_jobs CASCADE;
  `);
};
