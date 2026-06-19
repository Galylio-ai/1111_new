import type { Knex } from 'knex';
import { db } from '../db';
import { Brand, Status } from '../entities/catalog.entities';
import { AppError } from '../middleware/errorHandler';

type DbConnection = Knex | Knex.Transaction;
type SortDirection = 'asc' | 'desc';
type ListOptions = {
  page?: number;
  limit?: number;
  status?: Status;
  sortBy?: 'id' | 'name' | 'created_at' | 'updated_at';
  sortDir?: SortDirection;
};

function connection(conn?: DbConnection): DbConnection {
  return conn ?? db;
}

function pageOptions(options: ListOptions = {}) {
  const page = options.page ?? 1;
  const limit = options.limit ?? 20;
  return { page, limit, offset: (page - 1) * limit };
}

function sortColumn(options: ListOptions = {}) {
  const allowed = new Set(['id', 'name', 'created_at', 'updated_at']);
  return allowed.has(options.sortBy ?? '') ? options.sortBy as string : 'id';
}

export async function brandSlugExists(
  slug: string,
  excludeId?: number,
  conn?: DbConnection,
): Promise<boolean> {
  const query = connection(conn)('brands').where({ slug });
  if (excludeId) query.whereNot({ id: excludeId });
  return Boolean(await query.first('id'));
}

export async function createBrand(input: Partial<Brand>, conn?: DbConnection): Promise<Brand> {
  const [row] = await connection(conn)('brands').insert(input).returning('*');
  return row as Brand;
}

export async function listBrands(options: ListOptions = {}, conn?: DbConnection) {
  const { page, limit, offset } = pageOptions(options);
  const base = connection(conn)('brands');
  if (options.status) base.where({ status: options.status });
  const [[{ count }], items] = await Promise.all([
    base.clone().count<{ count: string }[]>('id as count'),
    base
      .clone()
      .select('*')
      .orderBy(sortColumn(options), options.sortDir ?? 'desc')
      .limit(limit)
      .offset(offset),
  ]);
  return { items: items as Brand[], total: Number(count), page, limit };
}

export async function getBrandById(id: number, conn?: DbConnection): Promise<Brand | null> {
  const row = await connection(conn)('brands').where({ id }).first();
  return (row as Brand | undefined) ?? null;
}

export function findBrandById(id: number, conn?: DbConnection): Promise<Brand | null> {
  return getBrandById(id, conn);
}

export async function findBrandsByIds(ids: number[], conn?: DbConnection): Promise<Brand[]> {
  const uniqueIds = [...new Set(ids.map(Number))];
  if (uniqueIds.length === 0) return [];
  return (await connection(conn)('brands').whereIn('id', uniqueIds).select('*')) as Brand[];
}

export async function findBrandBySlug(slug: string, conn?: DbConnection): Promise<Brand | null> {
  const row = await connection(conn)('brands').where({ slug }).first();
  return (row as Brand | undefined) ?? null;
}

export async function findBrandsByStatus(
  status: Status,
  options: Omit<ListOptions, 'status'> = {},
  conn?: DbConnection,
) {
  return listBrands({ ...options, status }, conn);
}

export async function brandExistsById(id: number, conn?: DbConnection): Promise<boolean> {
  return Boolean(await connection(conn)('brands').where({ id }).first('id'));
}

export async function countBrandsByStatus(status?: Status, conn?: DbConnection): Promise<number> {
  const query = connection(conn)('brands');
  if (status) query.where({ status });
  const [{ count }] = await query.count<{ count: string }[]>('id as count');
  return Number(count);
}

export async function updateBrand(
  id: number,
  input: Partial<Brand>,
  conn?: DbConnection,
): Promise<Brand | null> {
  const [row] = await connection(conn)('brands')
    .where({ id })
    .update({ ...input, updated_at: new Date() })
    .returning('*');
  return (row as Brand | undefined) ?? null;
}

export async function archiveBrand(id: number, conn?: DbConnection): Promise<Brand> {
  const row = await updateBrand(id, { status: 'archived' }, conn);
  if (!row) throw new AppError(404, 'Brand not found');
  return row;
}

export async function reactivateBrand(id: number, conn?: DbConnection): Promise<Brand> {
  const row = await updateBrand(id, { status: 'active' }, conn);
  if (!row) throw new AppError(404, 'Brand not found');
  return row;
}

export async function ensureBrandExists(id: number, conn?: DbConnection): Promise<void> {
  if (!(await getBrandById(id, conn))) throw new AppError(404, 'Brand not found');
}

export async function getBrandAnalytics(
  options: { status?: Status; staleDays?: number; limit?: number } = {},
  conn?: DbConnection,
) {
  const staleDays = options.staleDays ?? 7;
  const limit = options.limit ?? 50;
  const result = await connection(conn).raw(
    `
    SELECT
      b.id,
      b.name,
      b.slug,
      b.status,
      COUNT(DISTINCT p.id)::int AS product_count,
      COUNT(DISTINCT sp.shop_id)::int AS shop_count,
      AVG(sp.current_price)::numeric(14,3) AS average_price,
      MIN(sp.current_price)::numeric(14,3) AS min_price,
      MAX(sp.current_price)::numeric(14,3) AS max_price,
      COUNT(DISTINCT CASE WHEN sp.regular_price > sp.current_price THEN p.id END)::int AS discounted_product_count,
      COUNT(DISTINCT CASE WHEN sp.updated_at < now() - (? * interval '1 day') THEN p.id END)::int AS stale_product_count
    FROM brands b
    LEFT JOIN products p ON p.brand_id = b.id
    LEFT JOIN shop_prices sp ON sp.product_id = p.id
    WHERE (?::text IS NULL OR b.status = ?::text)
    GROUP BY b.id, b.name, b.slug, b.status
    ORDER BY product_count DESC, b.id DESC
    LIMIT ?
    `,
    [staleDays, options.status ?? null, options.status ?? null, limit],
  );
  return result.rows;
}
