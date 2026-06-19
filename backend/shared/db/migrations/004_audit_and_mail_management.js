/**
 * @param {import('knex').Knex} knex
 */
exports.up = async function (knex) {
  await knex.raw('CREATE SCHEMA IF NOT EXISTS auth');
  await knex.raw('CREATE EXTENSION IF NOT EXISTS "pgcrypto"');

  await knex.raw(`
    CREATE TABLE IF NOT EXISTS auth.audit_logs (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      actor_user_id UUID NULL REFERENCES auth.users(id) ON DELETE SET NULL,
      actor_role TEXT NULL,
      action TEXT NOT NULL,
      entity_type TEXT NOT NULL,
      entity_id TEXT NULL,
      metadata JSONB NOT NULL DEFAULT '{}',
      created_at TIMESTAMPTZ DEFAULT now()
    );

    CREATE TABLE IF NOT EXISTS mail_templates (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      template_key TEXT NOT NULL UNIQUE,
      subject TEXT NOT NULL,
      html_body TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'archived', 'hidden')),
      created_at TIMESTAMPTZ DEFAULT now(),
      updated_at TIMESTAMPTZ DEFAULT now()
    );

    CREATE TABLE IF NOT EXISTS mail_logs (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      template_key TEXT NULL,
      to_email TEXT NOT NULL,
      subject TEXT NOT NULL,
      status TEXT NOT NULL CHECK (status IN ('queued', 'sent', 'failed')),
      error_message TEXT NULL,
      sent_at TIMESTAMPTZ NULL,
      created_at TIMESTAMPTZ DEFAULT now()
    );

    CREATE INDEX IF NOT EXISTS idx_audit_logs_actor_user_id ON auth.audit_logs(actor_user_id);
    CREATE INDEX IF NOT EXISTS idx_audit_logs_action ON auth.audit_logs(action);
    CREATE INDEX IF NOT EXISTS idx_audit_logs_entity ON auth.audit_logs(entity_type, entity_id);
    CREATE INDEX IF NOT EXISTS idx_mail_templates_status ON mail_templates(status);
    CREATE INDEX IF NOT EXISTS idx_mail_logs_status ON mail_logs(status);
    CREATE INDEX IF NOT EXISTS idx_mail_logs_template_key ON mail_logs(template_key);
  `);
};

/**
 * @param {import('knex').Knex} knex
 */
exports.down = async function (knex) {
  await knex.raw(`
    DROP TABLE IF EXISTS mail_logs CASCADE;
    DROP TABLE IF EXISTS mail_templates CASCADE;
    DROP TABLE IF EXISTS auth.audit_logs CASCADE;
  `);
};
