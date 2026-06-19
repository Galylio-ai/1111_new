import type { Knex } from 'knex';
import { db } from '../db';
import { AppError } from '../middleware/errorHandler';
import { buildCategoryTree } from '../utils/categoryTree';
import {
  CategoryTreeNode,
  LowCategory,
  Status,
  Subcategory,
  TopCategory,
} from '../entities/catalog.entities';

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

async function listTable<T>(
  table: string,
  options: ListOptions = {},
  conn?: DbConnection,
): Promise<{ items: T[]; total: number; page: number; limit: number }> {
  const cx = connection(conn);
  const { page, limit, offset } = pageOptions(options);
  const base = cx(table);
  if (options.status) base.where({ status: options.status });
  const countQuery = base.clone().count<{ count: string }[]>('id as count');
  const itemsQuery = base
    .clone()
    .select('*')
    .orderBy(sortColumn(options), options.sortDir ?? 'desc')
    .limit(limit)
    .offset(offset);
  const [[{ count }], items] = await Promise.all([countQuery, itemsQuery]);
  return { items: items as T[], total: Number(count), page, limit };
}

async function findByIds<T>(table: string, ids: number[], conn?: DbConnection): Promise<T[]> {
  const uniqueIds = [...new Set(ids.map(Number))];
  if (uniqueIds.length === 0) return [];
  return (await connection(conn)(table).whereIn('id', uniqueIds).select('*')) as T[];
}

async function findBySlug<T>(
  table: string,
  slug: string,
  parentColumn?: string,
  parentId?: number,
  conn?: DbConnection,
): Promise<T | null> {
  const query = connection(conn)(table).where({ slug });
  if (parentColumn && parentId) query.where({ [parentColumn]: parentId });
  const row = await query.first();
  return (row as T | undefined) ?? null;
}

async function existsById(table: string, id: number, conn?: DbConnection): Promise<boolean> {
  return Boolean(await connection(conn)(table).where({ id }).first('id'));
}

async function countByStatus(table: string, status?: Status, conn?: DbConnection): Promise<number> {
  const query = connection(conn)(table);
  if (status) query.where({ status });
  const [{ count }] = await query.count<{ count: string }[]>('id as count');
  return Number(count);
}

export async function topCategorySlugExists(
  slug: string,
  excludeId?: number,
  conn?: DbConnection,
): Promise<boolean> {
  const query = connection(conn)('top_categories').where({ slug });
  if (excludeId) query.whereNot({ id: excludeId });
  return Boolean(await query.first('id'));
}

export async function lowCategorySlugExists(
  topCategoryId: number,
  slug: string,
  excludeId?: number,
  conn?: DbConnection,
): Promise<boolean> {
  const query = connection(conn)('low_categories').where({ top_category_id: topCategoryId, slug });
  if (excludeId) query.whereNot({ id: excludeId });
  return Boolean(await query.first('id'));
}

export async function subcategorySlugExists(
  lowCategoryId: number,
  slug: string,
  excludeId?: number,
  conn?: DbConnection,
): Promise<boolean> {
  const query = connection(conn)('subcategories').where({ low_category_id: lowCategoryId, slug });
  if (excludeId) query.whereNot({ id: excludeId });
  return Boolean(await query.first('id'));
}

export async function createTopCategory(
  input: Partial<TopCategory>,
  conn?: DbConnection,
): Promise<TopCategory> {
  const [row] = await connection(conn)('top_categories').insert(input).returning('*');
  return row as TopCategory;
}

export function listTopCategories(options?: ListOptions, conn?: DbConnection) {
  return listTable<TopCategory>('top_categories', options, conn);
}

export async function getTopCategoryById(id: number, conn?: DbConnection): Promise<TopCategory | null> {
  const row = await connection(conn)('top_categories').where({ id }).first();
  return (row as TopCategory | undefined) ?? null;
}

export function findTopCategoryById(id: number, conn?: DbConnection): Promise<TopCategory | null> {
  return getTopCategoryById(id, conn);
}

export function findTopCategoriesByIds(ids: number[], conn?: DbConnection): Promise<TopCategory[]> {
  return findByIds<TopCategory>('top_categories', ids, conn);
}

export function findTopCategoryBySlug(slug: string, conn?: DbConnection): Promise<TopCategory | null> {
  return findBySlug<TopCategory>('top_categories', slug, undefined, undefined, conn);
}

export function findTopCategoriesByStatus(
  status: Status,
  options?: Omit<ListOptions, 'status'>,
  conn?: DbConnection,
) {
  return listTopCategories({ ...options, status }, conn);
}

export function topCategoryExistsById(id: number, conn?: DbConnection): Promise<boolean> {
  return existsById('top_categories', id, conn);
}

export function countTopCategoriesByStatus(status?: Status, conn?: DbConnection): Promise<number> {
  return countByStatus('top_categories', status, conn);
}

export async function updateTopCategory(
  id: number,
  input: Partial<TopCategory>,
  conn?: DbConnection,
): Promise<TopCategory | null> {
  const [row] = await connection(conn)('top_categories')
    .where({ id })
    .update({ ...input, updated_at: new Date() })
    .returning('*');
  return (row as TopCategory | undefined) ?? null;
}

export async function archiveTopCategory(id: number, conn?: DbConnection): Promise<TopCategory> {
  const row = await updateTopCategory(id, { status: 'archived' }, conn);
  if (!row) throw new AppError(404, 'Top category not found');
  return row;
}

export async function reactivateTopCategory(id: number, conn?: DbConnection): Promise<TopCategory> {
  const row = await updateTopCategory(id, { status: 'active' }, conn);
  if (!row) throw new AppError(404, 'Top category not found');
  return row;
}

export async function createLowCategory(
  input: Partial<LowCategory>,
  conn?: DbConnection,
): Promise<LowCategory> {
  const [row] = await connection(conn)('low_categories').insert(input).returning('*');
  return row as LowCategory;
}

export function listLowCategories(options?: ListOptions, conn?: DbConnection) {
  return listTable<LowCategory>('low_categories', options, conn);
}

export async function getLowCategoryById(id: number, conn?: DbConnection): Promise<LowCategory | null> {
  const row = await connection(conn)('low_categories').where({ id }).first();
  return (row as LowCategory | undefined) ?? null;
}

export function findLowCategoryById(id: number, conn?: DbConnection): Promise<LowCategory | null> {
  return getLowCategoryById(id, conn);
}

export function findLowCategoriesByIds(ids: number[], conn?: DbConnection): Promise<LowCategory[]> {
  return findByIds<LowCategory>('low_categories', ids, conn);
}

export function findLowCategoryBySlug(
  topCategoryId: number,
  slug: string,
  conn?: DbConnection,
): Promise<LowCategory | null> {
  return findBySlug<LowCategory>('low_categories', slug, 'top_category_id', topCategoryId, conn);
}

export function findLowCategoriesByStatus(
  status: Status,
  options?: Omit<ListOptions, 'status'>,
  conn?: DbConnection,
) {
  return listLowCategories({ ...options, status }, conn);
}

export function lowCategoryExistsById(id: number, conn?: DbConnection): Promise<boolean> {
  return existsById('low_categories', id, conn);
}

export function countLowCategoriesByStatus(status?: Status, conn?: DbConnection): Promise<number> {
  return countByStatus('low_categories', status, conn);
}

export async function updateLowCategory(
  id: number,
  input: Partial<LowCategory>,
  conn?: DbConnection,
): Promise<LowCategory | null> {
  const [row] = await connection(conn)('low_categories')
    .where({ id })
    .update({ ...input, updated_at: new Date() })
    .returning('*');
  return (row as LowCategory | undefined) ?? null;
}

export async function archiveLowCategory(id: number, conn?: DbConnection): Promise<LowCategory> {
  const row = await updateLowCategory(id, { status: 'archived' }, conn);
  if (!row) throw new AppError(404, 'Low category not found');
  return row;
}

export async function reactivateLowCategory(id: number, conn?: DbConnection): Promise<LowCategory> {
  const row = await updateLowCategory(id, { status: 'active' }, conn);
  if (!row) throw new AppError(404, 'Low category not found');
  return row;
}

export async function moveLowCategory(id: number, topCategoryId: number, conn?: DbConnection) {
  const row = await updateLowCategory(id, { top_category_id: topCategoryId }, conn);
  if (!row) throw new AppError(404, 'Low category not found');
  return row;
}

export async function createSubcategory(
  input: Partial<Subcategory>,
  conn?: DbConnection,
): Promise<Subcategory> {
  const [row] = await connection(conn)('subcategories').insert(input).returning('*');
  return row as Subcategory;
}

export function listSubcategories(options?: ListOptions, conn?: DbConnection) {
  return listTable<Subcategory>('subcategories', options, conn);
}

export async function getSubcategoryById(id: number, conn?: DbConnection): Promise<Subcategory | null> {
  const row = await connection(conn)('subcategories').where({ id }).first();
  return (row as Subcategory | undefined) ?? null;
}

export function findSubcategoryById(id: number, conn?: DbConnection): Promise<Subcategory | null> {
  return getSubcategoryById(id, conn);
}

export function findSubcategoriesByIds(ids: number[], conn?: DbConnection): Promise<Subcategory[]> {
  return findByIds<Subcategory>('subcategories', ids, conn);
}

export function findSubcategoryBySlug(
  lowCategoryId: number,
  slug: string,
  conn?: DbConnection,
): Promise<Subcategory | null> {
  return findBySlug<Subcategory>('subcategories', slug, 'low_category_id', lowCategoryId, conn);
}

export function findSubcategoriesByStatus(
  status: Status,
  options?: Omit<ListOptions, 'status'>,
  conn?: DbConnection,
) {
  return listSubcategories({ ...options, status }, conn);
}

export function subcategoryExistsById(id: number, conn?: DbConnection): Promise<boolean> {
  return existsById('subcategories', id, conn);
}

export function countSubcategoriesByStatus(status?: Status, conn?: DbConnection): Promise<number> {
  return countByStatus('subcategories', status, conn);
}

export async function updateSubcategory(
  id: number,
  input: Partial<Subcategory>,
  conn?: DbConnection,
): Promise<Subcategory | null> {
  const [row] = await connection(conn)('subcategories')
    .where({ id })
    .update({ ...input, updated_at: new Date() })
    .returning('*');
  return (row as Subcategory | undefined) ?? null;
}

export async function archiveSubcategory(id: number, conn?: DbConnection): Promise<Subcategory> {
  const row = await updateSubcategory(id, { status: 'archived' }, conn);
  if (!row) throw new AppError(404, 'Subcategory not found');
  return row;
}

export async function reactivateSubcategory(id: number, conn?: DbConnection): Promise<Subcategory> {
  const row = await updateSubcategory(id, { status: 'active' }, conn);
  if (!row) throw new AppError(404, 'Subcategory not found');
  return row;
}

export async function moveSubcategory(id: number, lowCategoryId: number, conn?: DbConnection) {
  const row = await updateSubcategory(id, { low_category_id: lowCategoryId }, conn);
  if (!row) throw new AppError(404, 'Subcategory not found');
  return row;
}

export async function ensureTopCategoryExists(id: number, conn?: DbConnection): Promise<void> {
  if (!(await getTopCategoryById(id, conn))) throw new AppError(404, 'Top category not found');
}

export async function ensureLowCategoryExists(id: number, conn?: DbConnection): Promise<void> {
  if (!(await getLowCategoryById(id, conn))) throw new AppError(404, 'Low category not found');
}

export async function ensureSubcategoryExists(id: number, conn?: DbConnection): Promise<void> {
  if (!(await getSubcategoryById(id, conn))) throw new AppError(404, 'Subcategory not found');
}

export async function ensureSubcategoriesExist(ids: number[], conn?: DbConnection): Promise<void> {
  const uniqueIds = [...new Set(ids)];
  if (uniqueIds.length === 0) return;
  const rows = await connection(conn)('subcategories').whereIn('id', uniqueIds).select('id');
  if (rows.length !== uniqueIds.length) throw new AppError(404, 'One or more subcategories not found');
}

export async function getCategoryTree(conn?: DbConnection): Promise<CategoryTreeNode[]> {
  const cx = connection(conn);
  const [topCategories, lowCategories, subcategories] = await Promise.all([
    cx('top_categories').select('*').orderBy('id', 'asc'),
    cx('low_categories').select('*').orderBy('id', 'asc'),
    cx('subcategories').select('*').orderBy('id', 'asc'),
  ]);

  return buildCategoryTree({
    topCategories: topCategories as TopCategory[],
    lowCategories: lowCategories as LowCategory[],
    subcategories: subcategories as Subcategory[],
  });
}

export async function getCategoryAnalytics(
  options: { level?: 'top' | 'low' | 'sub'; staleDays?: number; limit?: number } = {},
  conn?: DbConnection,
) {
  const staleDays = options.staleDays ?? 7;
  const limit = options.limit ?? 50;
  const level = options.level ?? 'top';
  const selectByLevel = {
    top: 'tc.id AS top_category_id, tc.name AS top_category_name',
    low: 'tc.id AS top_category_id, tc.name AS top_category_name, lc.id AS low_category_id, lc.name AS low_category_name',
    sub: 'tc.id AS top_category_id, tc.name AS top_category_name, lc.id AS low_category_id, lc.name AS low_category_name, s.id AS subcategory_id, s.name AS subcategory_name',
  }[level];
  const groupByLevel = {
    top: 'tc.id, tc.name',
    low: 'tc.id, tc.name, lc.id, lc.name',
    sub: 'tc.id, tc.name, lc.id, lc.name, s.id, s.name',
  }[level];

  const result = await connection(conn).raw(
    `
    SELECT
      ${selectByLevel},
      COUNT(DISTINCT p.id)::int AS product_count,
      COUNT(DISTINCT sp.shop_id)::int AS shop_count,
      COUNT(DISTINCT p.brand_id)::int AS brand_count,
      AVG(sp.current_price)::numeric(14,3) AS average_price,
      MIN(sp.current_price)::numeric(14,3) AS min_price,
      MAX(sp.current_price)::numeric(14,3) AS max_price,
      COUNT(DISTINCT CASE WHEN sp.regular_price > sp.current_price THEN p.id END)::int AS discounted_product_count,
      COUNT(DISTINCT CASE WHEN sp.updated_at < now() - (? * interval '1 day') THEN p.id END)::int AS stale_product_count
    FROM top_categories tc
    JOIN low_categories lc ON lc.top_category_id = tc.id
    JOIN subcategories s ON s.low_category_id = lc.id
    LEFT JOIN product_subcategories psc ON psc.subcategory_id = s.id
    LEFT JOIN products p ON p.id = psc.product_id
    LEFT JOIN shop_prices sp ON sp.product_id = p.id
    GROUP BY ${groupByLevel}
    ORDER BY product_count DESC
    LIMIT ?
    `,
    [staleDays, limit],
  );
  return result.rows;
}
