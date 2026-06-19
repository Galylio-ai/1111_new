import type { Knex } from 'knex';
import { db } from '../db';
import { Shop, ShopPrice, Status } from '../entities/catalog.entities';
import { AppError } from '../middleware/errorHandler';

type DbConnection = Knex | Knex.Transaction;
type SortDirection = 'asc' | 'desc';
type ListOptions = {
  page?: number;
  limit?: number;
  status?: Status;
  sortBy?: 'id' | 'name' | 'shop_key' | 'created_at' | 'updated_at';
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
  const allowed = new Set(['id', 'name', 'shop_key', 'created_at', 'updated_at']);
  return allowed.has(options.sortBy ?? '') ? options.sortBy as string : 'id';
}

export async function shopSlugExists(
  slug: string,
  excludeId?: number,
  conn?: DbConnection,
): Promise<boolean> {
  const query = connection(conn)('shops').where({ slug });
  if (excludeId) query.whereNot({ id: excludeId });
  return Boolean(await query.first('id'));
}

export async function shopKeyExists(
  shopKey: string,
  excludeId?: number,
  conn?: DbConnection,
): Promise<boolean> {
  const query = connection(conn)('shops').where({ shop_key: shopKey });
  if (excludeId) query.whereNot({ id: excludeId });
  return Boolean(await query.first('id'));
}

export async function createShop(input: Partial<Shop>, conn?: DbConnection): Promise<Shop> {
  const [row] = await connection(conn)('shops').insert(input).returning('*');
  return row as Shop;
}

export async function listShops(options: ListOptions = {}, conn?: DbConnection) {
  const { page, limit, offset } = pageOptions(options);
  const base = connection(conn)('shops');
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
  return { items: items as Shop[], total: Number(count), page, limit };
}

export async function getShopById(id: number, conn?: DbConnection): Promise<Shop | null> {
  const row = await connection(conn)('shops').where({ id }).first();
  return (row as Shop | undefined) ?? null;
}

export function findShopById(id: number, conn?: DbConnection): Promise<Shop | null> {
  return getShopById(id, conn);
}

export async function findShopsByIds(ids: number[], conn?: DbConnection): Promise<Shop[]> {
  const uniqueIds = [...new Set(ids.map(Number))];
  if (uniqueIds.length === 0) return [];
  return (await connection(conn)('shops').whereIn('id', uniqueIds).select('*')) as Shop[];
}

export async function findShopBySlug(slug: string, conn?: DbConnection): Promise<Shop | null> {
  const row = await connection(conn)('shops').where({ slug }).first();
  return (row as Shop | undefined) ?? null;
}

export async function findShopByShopKey(shopKey: string, conn?: DbConnection): Promise<Shop | null> {
  const row = await connection(conn)('shops').where({ shop_key: shopKey }).first();
  return (row as Shop | undefined) ?? null;
}

export async function findShopsByStatus(
  status: Status,
  options: Omit<ListOptions, 'status'> = {},
  conn?: DbConnection,
) {
  return listShops({ ...options, status }, conn);
}

export async function shopExistsById(id: number, conn?: DbConnection): Promise<boolean> {
  return Boolean(await connection(conn)('shops').where({ id }).first('id'));
}

export async function countShopsByStatus(status?: Status, conn?: DbConnection): Promise<number> {
  const query = connection(conn)('shops');
  if (status) query.where({ status });
  const [{ count }] = await query.count<{ count: string }[]>('id as count');
  return Number(count);
}

export async function updateShop(
  id: number,
  input: Partial<Shop>,
  conn?: DbConnection,
): Promise<Shop | null> {
  const [row] = await connection(conn)('shops')
    .where({ id })
    .update({ ...input, updated_at: new Date() })
    .returning('*');
  return (row as Shop | undefined) ?? null;
}

export async function archiveShop(id: number, conn?: DbConnection): Promise<Shop> {
  const row = await updateShop(id, { status: 'archived' }, conn);
  if (!row) throw new AppError(404, 'Shop not found');
  return row;
}

export async function reactivateShop(id: number, conn?: DbConnection): Promise<Shop> {
  const row = await updateShop(id, { status: 'active' }, conn);
  if (!row) throw new AppError(404, 'Shop not found');
  return row;
}

export async function ensureShopsExist(ids: number[], conn?: DbConnection): Promise<void> {
  const uniqueIds = [...new Set(ids)];
  if (uniqueIds.length === 0) return;
  const rows = await connection(conn)('shops').whereIn('id', uniqueIds).select('id');
  if (rows.length !== uniqueIds.length) throw new AppError(404, 'One or more shops not found');
}

export async function getPricesByShopId(shopId: number, conn?: DbConnection): Promise<ShopPrice[]> {
  return (await connection(conn)('shop_prices')
    .where({ shop_id: shopId })
    .select('*')
    .orderBy('updated_at', 'desc')) as ShopPrice[];
}

export async function getShopInsights(
  shopId: number,
  options: { staleDays?: number } = {},
  conn?: DbConnection,
) {
  const staleDays = options.staleDays ?? 7;
  const result = await connection(conn).raw(
    `
    SELECT
      s.id AS shop_id,
      s.name AS shop_name,
      COUNT(DISTINCT p.id)::int AS product_count,
      COUNT(DISTINCT CASE WHEN p.status = 'active' THEN p.id END)::int AS active_product_count,
      COUNT(DISTINCT CASE WHEN p.status = 'archived' THEN p.id END)::int AS archived_product_count,
      COUNT(DISTINCT CASE WHEN sp.updated_at < now() - (? * interval '1 day') THEN p.id END)::int AS stale_price_count,
      COUNT(DISTINCT CASE WHEN pi.id IS NULL THEN p.id END)::int AS missing_image_count,
      COUNT(DISTINCT CASE WHEN ps.id IS NULL THEN p.id END)::int AS missing_spec_count,
      COUNT(DISTINCT CASE WHEN psc.product_id IS NULL THEN p.id END)::int AS missing_category_count,
      AVG(sp.current_price)::numeric(14,3) AS average_price,
      MIN(sp.current_price)::numeric(14,3) AS min_price,
      MAX(sp.current_price)::numeric(14,3) AS max_price,
      COUNT(DISTINCT CASE WHEN sp.regular_price > sp.current_price THEN p.id END)::int AS discount_count,
      AVG(
        CASE
          WHEN sp.regular_price > 0 AND sp.regular_price > sp.current_price
          THEN ((sp.regular_price - sp.current_price) / sp.regular_price) * 100
          ELSE NULL
        END
      )::numeric(8,2) AS average_discount_percentage,
      COUNT(DISTINCT p.brand_id)::int AS brand_coverage_count,
      COUNT(DISTINCT sub.id)::int AS category_coverage_count
    FROM shops s
    LEFT JOIN shop_prices sp ON sp.shop_id = s.id
    LEFT JOIN products p ON p.id = sp.product_id
    LEFT JOIN product_images pi ON pi.product_id = p.id
    LEFT JOIN product_specs ps ON ps.product_id = p.id
    LEFT JOIN product_subcategories psc ON psc.product_id = p.id
    LEFT JOIN subcategories sub ON sub.id = psc.subcategory_id
    WHERE s.id = ?
    GROUP BY s.id, s.name
    `,
    [staleDays, shopId],
  );
  return result.rows[0] ?? null;
}

export async function getShopCategoryCoverage(shopId: number, conn?: DbConnection) {
  const result = await connection(conn).raw(
    `
    SELECT
      tc.id AS top_category_id,
      tc.name AS top_category_name,
      lc.id AS low_category_id,
      lc.name AS low_category_name,
      sub.id AS subcategory_id,
      sub.name AS subcategory_name,
      COUNT(DISTINCT p.id)::int AS product_count,
      AVG(sp.current_price)::numeric(14,3) AS average_price
    FROM shop_prices sp
    JOIN products p ON p.id = sp.product_id
    JOIN product_subcategories psc ON psc.product_id = p.id
    JOIN subcategories sub ON sub.id = psc.subcategory_id
    JOIN low_categories lc ON lc.id = sub.low_category_id
    JOIN top_categories tc ON tc.id = lc.top_category_id
    WHERE sp.shop_id = ?
    GROUP BY tc.id, tc.name, lc.id, lc.name, sub.id, sub.name
    ORDER BY product_count DESC
    `,
    [shopId],
  );
  return result.rows;
}

export async function getShopBrandCoverage(shopId: number, conn?: DbConnection) {
  const result = await connection(conn).raw(
    `
    SELECT
      b.id AS brand_id,
      b.name AS brand_name,
      COUNT(DISTINCT p.id)::int AS product_count,
      AVG(sp.current_price)::numeric(14,3) AS average_price,
      MIN(sp.current_price)::numeric(14,3) AS min_price,
      MAX(sp.current_price)::numeric(14,3) AS max_price
    FROM shop_prices sp
    JOIN products p ON p.id = sp.product_id
    LEFT JOIN brands b ON b.id = p.brand_id
    WHERE sp.shop_id = ?
    GROUP BY b.id, b.name
    ORDER BY product_count DESC
    `,
    [shopId],
  );
  return result.rows;
}
