import type { Knex } from 'knex';
import { db } from '../db';
import { ImportErrorRecord, ImportJob } from '../entities/import.entities';

type DbConnection = Knex | Knex.Transaction;

function connection(conn?: DbConnection): DbConnection {
  return conn ?? db;
}

export async function createImportJob(input: Partial<ImportJob>, conn?: DbConnection): Promise<ImportJob> {
  const [row] = await connection(conn)('import_jobs').insert(input).returning('*');
  return row as ImportJob;
}

export async function updateImportJob(
  id: string,
  input: Partial<ImportJob>,
  conn?: DbConnection,
): Promise<ImportJob | null> {
  const [row] = await connection(conn)('import_jobs').where({ id }).update(input).returning('*');
  return (row as ImportJob | undefined) ?? null;
}

export async function getImportJobById(id: string, conn?: DbConnection): Promise<ImportJob | null> {
  const row = await connection(conn)('import_jobs').where({ id }).first();
  return (row as ImportJob | undefined) ?? null;
}

export async function createImportErrors(
  importJobId: string,
  errors: ImportErrorRecord[],
  conn?: DbConnection,
): Promise<void> {
  if (errors.length === 0) return;
  await connection(conn)('import_errors').insert(
    errors.map((error) => ({
      import_job_id: importJobId,
      row_number: error.row_number,
      source_row: error.source_row,
      error_code: error.error_code,
      error_message: error.error_message,
    })),
  );
}

export async function listImportErrors(
  importJobId: string,
  options: { page?: number; limit?: number } = {},
  conn?: DbConnection,
) {
  const page = options.page ?? 1;
  const limit = options.limit ?? 20;
  const base = connection(conn)('import_errors').where({ import_job_id: importJobId });
  const [[{ count }], items] = await Promise.all([
    base.clone().count<{ count: string }[]>('id as count'),
    base.clone().select('*').orderBy('row_number', 'asc').limit(limit).offset((page - 1) * limit),
  ]);
  return { items: items as ImportErrorRecord[], total: Number(count), page, limit };
}

export async function findProductIdByShopProductUrl(
  shopProductUrl: string,
  conn?: DbConnection,
): Promise<number | null> {
  const row = await connection(conn)('shop_prices').where({ shop_product_url: shopProductUrl }).first('product_id');
  return row ? Number(row.product_id) : null;
}
