import type { Knex } from 'knex';
import { db } from '../db';
import { MailLog, MailTemplate, MailLogStatus, TemplateStatus } from '../entities/mailer.entities';

type DbConnection = Knex | Knex.Transaction;

function connection(conn?: DbConnection): DbConnection {
  return conn ?? db;
}

export async function createTemplate(input: Partial<MailTemplate>, conn?: DbConnection): Promise<MailTemplate> {
  const [row] = await connection(conn)('mail_templates').insert(input).returning('*');
  return row as MailTemplate;
}

export async function listTemplates(
  filters: { page?: number; limit?: number; status?: TemplateStatus } = {},
  conn?: DbConnection,
) {
  const page = filters.page ?? 1;
  const limit = filters.limit ?? 20;
  const base = connection(conn)('mail_templates');
  if (filters.status) base.where({ status: filters.status });
  const [[{ count }], items] = await Promise.all([
    base.clone().count<{ count: string }[]>('id as count'),
    base.clone().select('*').orderBy('created_at', 'desc').limit(limit).offset((page - 1) * limit),
  ]);
  return { items: items as MailTemplate[], total: Number(count), page, limit };
}

export async function getTemplateById(id: string, conn?: DbConnection): Promise<MailTemplate | null> {
  const row = await connection(conn)('mail_templates').where({ id }).first();
  return (row as MailTemplate | undefined) ?? null;
}

export async function updateTemplate(
  id: string,
  input: Partial<MailTemplate>,
  conn?: DbConnection,
): Promise<MailTemplate | null> {
  const [row] = await connection(conn)('mail_templates')
    .where({ id })
    .update({ ...input, updated_at: new Date() })
    .returning('*');
  return (row as MailTemplate | undefined) ?? null;
}

export async function archiveTemplate(id: string, conn?: DbConnection): Promise<MailTemplate | null> {
  return updateTemplate(id, { status: 'archived' }, conn);
}

export async function createLog(input: Partial<MailLog>, conn?: DbConnection): Promise<MailLog> {
  const [row] = await connection(conn)('mail_logs').insert(input).returning('*');
  return row as MailLog;
}

export async function listLogs(
  filters: { page?: number; limit?: number; status?: MailLogStatus } = {},
  conn?: DbConnection,
) {
  const page = filters.page ?? 1;
  const limit = filters.limit ?? 20;
  const base = connection(conn)('mail_logs');
  if (filters.status) base.where({ status: filters.status });
  const [[{ count }], items] = await Promise.all([
    base.clone().count<{ count: string }[]>('id as count'),
    base.clone().select('*').orderBy('created_at', 'desc').limit(limit).offset((page - 1) * limit),
  ]);
  return { items: items as MailLog[], total: Number(count), page, limit };
}

export async function getLogById(id: string, conn?: DbConnection): Promise<MailLog | null> {
  const row = await connection(conn)('mail_logs').where({ id }).first();
  return (row as MailLog | undefined) ?? null;
}

export async function updateLog(id: string, input: Partial<MailLog>, conn?: DbConnection): Promise<MailLog | null> {
  const [row] = await connection(conn)('mail_logs').where({ id }).update(input).returning('*');
  return (row as MailLog | undefined) ?? null;
}
