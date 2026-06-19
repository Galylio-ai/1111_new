import type { Knex } from 'knex';
import { db } from '../db';
import {
  Brand,
  PriceHistory,
  Product,
  ProductDetails,
  ProductImage,
  ProductSpec,
  Shop,
  ShopPrice,
  Status,
  Subcategory,
} from '../entities/catalog.entities';
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

type ProductFilterOptions = ListOptions & {
  search?: string;
  brand_id?: number;
  brand_ids?: number[];
  top_category_id?: number;
  low_category_id?: number;
  subcategory_id?: number;
  subcategory_ids?: number[];
  shop_id?: number;
  shop_ids?: number[];
  spec_key?: string;
  spec_value?: string;
  specs?: Array<{ spec_key: string; spec_value?: string }>;
  min_price?: number;
  max_price?: number;
};

type TrendBucket = 'day' | 'week' | 'month';

function connection(conn?: DbConnection): DbConnection {
  return conn ?? db;
}

function uniqueBy<T>(items: T[], key: (item: T) => string): T[] {
  return [...new Map(items.map((item) => [key(item), item])).values()];
}

function pageOptions(options: ListOptions = {}) {
  const page = options.page ?? 1;
  const limit = options.limit ?? 20;
  return { page, limit, offset: (page - 1) * limit };
}

function sortColumn(options: ListOptions = {}) {
  const allowed = new Set(['id', 'name', 'created_at', 'updated_at']);
  return allowed.has(options.sortBy ?? '') ? `p.${options.sortBy}` : 'p.id';
}

function uniqueNumbers(values?: number[]): number[] {
  return [...new Set((values ?? []).map(Number).filter(Number.isFinite))];
}

function trendBucket(bucket: TrendBucket = 'day'): TrendBucket {
  return ['day', 'week', 'month'].includes(bucket) ? bucket : 'day';
}

export async function productSlugExists(
  slug: string,
  excludeId?: number,
  conn?: DbConnection,
): Promise<boolean> {
  const query = connection(conn)('products').where({ slug });
  if (excludeId) query.whereNot({ id: excludeId });
  return Boolean(await query.first('id'));
}

export async function createProduct(input: Partial<Product>, conn?: DbConnection): Promise<Product> {
  const [row] = await connection(conn)('products').insert(input).returning('*');
  return row as Product;
}

export async function listProducts(options: ListOptions = {}, conn?: DbConnection) {
  const { page, limit, offset } = pageOptions(options);
  const base = connection(conn)('products as p');
  if (options.status) base.where({ 'p.status': options.status });
  const [[{ count }], items] = await Promise.all([
    base.clone().count<{ count: string }[]>('p.id as count'),
    base
      .clone()
      .select('p.*')
      .orderBy(sortColumn(options), options.sortDir ?? 'desc')
      .limit(limit)
      .offset(offset),
  ]);
  return { items: items as Product[], total: Number(count), page, limit };
}

export async function getProductById(id: number, conn?: DbConnection): Promise<Product | null> {
  const row = await connection(conn)('products').where({ id }).first();
  return (row as Product | undefined) ?? null;
}

export function findProductById(id: number, conn?: DbConnection): Promise<Product | null> {
  return getProductById(id, conn);
}

export async function findProductsByIds(ids: number[], conn?: DbConnection): Promise<Product[]> {
  const uniqueIds = uniqueNumbers(ids);
  if (uniqueIds.length === 0) return [];
  return (await connection(conn)('products').whereIn('id', uniqueIds).select('*')) as Product[];
}

export async function findProductBySlug(slug: string, conn?: DbConnection): Promise<Product | null> {
  const row = await connection(conn)('products').where({ slug }).first();
  return (row as Product | undefined) ?? null;
}

export async function findProductBySourceProductId(
  sourceProductId: string,
  conn?: DbConnection,
): Promise<Product | null> {
  const row = await connection(conn)('products')
    .where({ source_product_id: sourceProductId })
    .first();
  return (row as Product | undefined) ?? null;
}

export async function findProductsByStatus(
  status: Status,
  options: Omit<ListOptions, 'status'> = {},
  conn?: DbConnection,
) {
  return listProducts({ ...options, status }, conn);
}

export async function productExistsById(id: number, conn?: DbConnection): Promise<boolean> {
  return Boolean(await connection(conn)('products').where({ id }).first('id'));
}

export async function countProductsByStatus(status?: Status, conn?: DbConnection): Promise<number> {
  const query = connection(conn)('products');
  if (status) query.where({ status });
  const [{ count }] = await query.count<{ count: string }[]>('id as count');
  return Number(count);
}

export async function updateProduct(
  id: number,
  input: Partial<Product>,
  conn?: DbConnection,
): Promise<Product | null> {
  const [row] = await connection(conn)('products')
    .where({ id })
    .update({ ...input, updated_at: new Date() })
    .returning('*');
  return (row as Product | undefined) ?? null;
}

export async function archiveProduct(id: number, conn?: DbConnection): Promise<Product> {
  const row = await updateProduct(id, { status: 'archived' }, conn);
  if (!row) throw new AppError(404, 'Product not found');
  return row;
}

export async function reactivateProduct(id: number, conn?: DbConnection): Promise<Product> {
  const row = await updateProduct(id, { status: 'active' }, conn);
  if (!row) throw new AppError(404, 'Product not found');
  return row;
}

export async function syncProductSubcategories(
  productId: number,
  subcategoryIds: number[],
  conn?: DbConnection,
): Promise<void> {
  const cx = connection(conn);
  await cx('product_subcategories').where({ product_id: productId }).del();
  const rows = [...new Set(subcategoryIds)].map((subcategoryId) => ({
    product_id: productId,
    subcategory_id: subcategoryId,
  }));
  if (rows.length > 0) await cx('product_subcategories').insert(rows);
}

export async function syncProductImages(
  productId: number,
  images: ProductImage[],
  conn?: DbConnection,
): Promise<void> {
  const cx = connection(conn);
  await cx('product_images').where({ product_id: productId }).del();
  const rows = uniqueBy(images, (image) => image.image_url).map((image) => ({
    product_id: productId,
    image_url: image.image_url,
  }));
  if (rows.length > 0) await cx('product_images').insert(rows);
}

export async function syncProductSpecs(
  productId: number,
  specs: ProductSpec[],
  conn?: DbConnection,
): Promise<void> {
  const cx = connection(conn);
  await cx('product_specs').where({ product_id: productId }).del();
  const rows = uniqueBy(specs, (spec) => `${spec.spec_key}\u0000${spec.spec_value}`).map((spec) => ({
    product_id: productId,
    spec_key: spec.spec_key,
    spec_value: spec.spec_value,
  }));
  if (rows.length > 0) await cx('product_specs').insert(rows);
}

export async function getShopPrice(
  productId: number,
  shopId: number,
  conn?: DbConnection,
): Promise<ShopPrice | null> {
  const row = await connection(conn)('shop_prices')
    .where({ product_id: productId, shop_id: shopId })
    .first();
  return (row as ShopPrice | undefined) ?? null;
}

export async function upsertShopPrice(
  productId: number,
  input: Omit<ShopPrice, 'product_id'>,
  conn?: DbConnection,
): Promise<void> {
  const cx = connection(conn);
  await cx('shop_prices')
    .insert({
      product_id: productId,
      shop_id: input.shop_id,
      current_price: input.current_price,
      regular_price: input.regular_price,
      shop_product_url: input.shop_product_url,
      updated_at: new Date(),
    })
    .onConflict(['product_id', 'shop_id'])
    .merge({
      current_price: input.current_price,
      regular_price: input.regular_price,
      shop_product_url: input.shop_product_url,
      updated_at: new Date(),
    });
}

export async function insertPriceHistory(
  productId: number,
  input: Omit<PriceHistory, 'id' | 'product_id' | 'created_at'>,
  conn?: DbConnection,
): Promise<void> {
  await connection(conn)('price_history').insert({
    product_id: productId,
    shop_id: input.shop_id,
    price: input.price,
    regular_price: input.regular_price,
    recorded_at: input.recorded_at,
  });
}

export async function getProductDetails(id: number, conn?: DbConnection): Promise<ProductDetails | null> {
  const [details] = await getProductDetailsByIds([id], conn);
  return details ?? null;
}

export async function getProductDetailsByIds(ids: number[], conn?: DbConnection): Promise<ProductDetails[]> {
  const uniqueIds = [...new Set(ids.map(Number))];
  if (uniqueIds.length === 0) return [];
  const cx = connection(conn);
  const products = (await cx('products').whereIn('id', uniqueIds).select('*')) as Product[];
  if (products.length === 0) return [];

  const productIds = products.map((product) => Number(product.id));
  const brandIds = products
    .map((product) => product.brand_id)
    .filter((brandId): brandId is number => brandId !== null && brandId !== undefined);

  const [brands, categories, images, specs, shopPrices, priceHistory] = await Promise.all([
    brandIds.length > 0 ? cx('brands').whereIn('id', brandIds).select('*') : Promise.resolve([]),
    cx('product_subcategories as ps')
      .join('subcategories as s', 's.id', 'ps.subcategory_id')
      .join('low_categories as lc', 'lc.id', 's.low_category_id')
      .join('top_categories as tc', 'tc.id', 'lc.top_category_id')
      .whereIn('ps.product_id', productIds)
      .select(
        'ps.product_id',
        's.id',
        's.low_category_id',
        's.name',
        's.slug',
        's.status',
        'lc.id as parent_low_category_id',
        'lc.name as low_category_name',
        'lc.slug as low_category_slug',
        'tc.id as top_category_id',
        'tc.name as top_category_name',
        'tc.slug as top_category_slug',
      )
      .orderBy('s.id', 'asc'),
    cx('product_images').whereIn('product_id', productIds).select('*').orderBy('id', 'asc'),
    cx('product_specs').whereIn('product_id', productIds).select('*').orderBy('id', 'asc'),
    cx('shop_prices').whereIn('product_id', productIds).select('*').orderBy('updated_at', 'desc'),
    cx('price_history').whereIn('product_id', productIds).select('*').orderBy('recorded_at', 'desc'),
  ]);

  const brandsById = new Map((brands as Brand[]).map((brand) => [Number(brand.id), brand]));
  const byProduct = <T extends { product_id?: number }>(rows: T[]) => {
    const map = new Map<number, T[]>();
    for (const row of rows) {
      const productId = Number(row.product_id);
      const current = map.get(productId) ?? [];
      current.push(row);
      map.set(productId, current);
    }
    return map;
  };

  const categoriesByProduct = byProduct(
    categories as Array<Partial<Subcategory> & { product_id: number }>,
  );
  const imagesByProduct = byProduct(images as ProductImage[]);
  const specsByProduct = byProduct(specs as ProductSpec[]);
  const pricesByProduct = byProduct(shopPrices as ShopPrice[]);
  const historyByProduct = byProduct(priceHistory as PriceHistory[]);

  return products.map((product) => ({
    product,
    brand: product.brand_id ? brandsById.get(Number(product.brand_id)) ?? null : null,
    categories: (categoriesByProduct.get(Number(product.id)) ?? []).map(
      ({ product_id: _productId, ...category }) => category,
    ),
    images: imagesByProduct.get(Number(product.id)) ?? [],
    specs: specsByProduct.get(Number(product.id)) ?? [],
    shop_prices: pricesByProduct.get(Number(product.id)) ?? [],
    price_history: historyByProduct.get(Number(product.id)) ?? [],
  }));
}

export async function getProductIdsByShopId(shopId: number, conn?: DbConnection): Promise<number[]> {
  const rows = await connection(conn)('shop_prices').where({ shop_id: shopId }).select('product_id');
  return rows.map((row: Pick<ShopPrice, 'product_id'>) => Number(row.product_id));
}

export function searchProducts(query: string, options: Omit<ProductFilterOptions, 'search'> = {}, conn?: DbConnection) {
  return filterProducts({ ...options, search: query }, conn);
}

export async function filterProducts(options: ProductFilterOptions = {}, conn?: DbConnection) {
  const { page, limit, offset } = pageOptions(options);
  const cx = connection(conn);
  const base = cx('products as p');
  let joinedCategories = false;
  let joinedPrices = false;
  let joinedSpecs = false;

  const joinCategories = () => {
    if (joinedCategories) return;
    base
      .leftJoin('product_subcategories as psc', 'psc.product_id', 'p.id')
      .leftJoin('subcategories as s', 's.id', 'psc.subcategory_id')
      .leftJoin('low_categories as lc', 'lc.id', 's.low_category_id')
      .leftJoin('top_categories as tc', 'tc.id', 'lc.top_category_id');
    joinedCategories = true;
  };
  const joinPrices = () => {
    if (joinedPrices) return;
    base.leftJoin('shop_prices as sp', 'sp.product_id', 'p.id');
    joinedPrices = true;
  };
  const joinSpecs = () => {
    if (joinedSpecs) return;
    base.leftJoin('product_specs as ps', 'ps.product_id', 'p.id');
    joinedSpecs = true;
  };

  if (options.status) base.where({ 'p.status': options.status });
  if (options.brand_id) base.where({ 'p.brand_id': options.brand_id });
  if (options.brand_ids?.length) base.whereIn('p.brand_id', uniqueNumbers(options.brand_ids));
  if (options.search) {
    const search = `%${options.search.toLowerCase()}%`;
    base.where((builder) => {
      builder
        .whereRaw('lower(p.name) LIKE ?', [search])
        .orWhereRaw('lower(p.slug) LIKE ?', [search])
        .orWhereRaw('lower(coalesce(p.source_product_id, ?)) LIKE ?', ['', search]);
    });
  }
  if (options.top_category_id || options.low_category_id || options.subcategory_id || options.subcategory_ids?.length) {
    joinCategories();
    if (options.top_category_id) base.where({ 'tc.id': options.top_category_id });
    if (options.low_category_id) base.where({ 'lc.id': options.low_category_id });
    if (options.subcategory_id) base.where({ 's.id': options.subcategory_id });
    if (options.subcategory_ids?.length) base.whereIn('s.id', uniqueNumbers(options.subcategory_ids));
  }
  if (options.shop_id || options.shop_ids?.length || options.min_price !== undefined || options.max_price !== undefined) {
    joinPrices();
    if (options.shop_id) base.where({ 'sp.shop_id': options.shop_id });
    if (options.shop_ids?.length) base.whereIn('sp.shop_id', uniqueNumbers(options.shop_ids));
    if (options.min_price !== undefined) base.where('sp.current_price', '>=', options.min_price);
    if (options.max_price !== undefined) base.where('sp.current_price', '<=', options.max_price);
  }
  if (options.spec_key || options.spec_value || options.specs?.length) {
    joinSpecs();
    if (options.spec_key) base.where({ 'ps.spec_key': options.spec_key });
    if (options.spec_value) base.where({ 'ps.spec_value': options.spec_value });
    for (const spec of options.specs ?? []) {
      base.whereExists(function specExists() {
        this.select(cx.raw('1'))
          .from('product_specs as required_specs')
          .whereRaw('required_specs.product_id = p.id')
          .where('required_specs.spec_key', spec.spec_key);
        if (spec.spec_value) this.where('required_specs.spec_value', spec.spec_value);
      });
    }
  }

  const [[{ count }], items] = await Promise.all([
    base.clone().countDistinct<{ count: string }[]>('p.id as count'),
    base
      .clone()
      .distinct('p.*')
      .orderBy(sortColumn(options), options.sortDir ?? 'desc')
      .limit(limit)
      .offset(offset),
  ]);

  return { items: items as Product[], total: Number(count), page, limit };
}

export async function getProductsMissingImages(options: ListOptions = {}, conn?: DbConnection) {
  const { page, limit, offset } = pageOptions(options);
  const result = await connection(conn).raw(
    `
    SELECT p.*
    FROM products p
    LEFT JOIN product_images pi ON pi.product_id = p.id
    WHERE pi.id IS NULL
      AND (?::text IS NULL OR p.status = ?::text)
    ORDER BY p.id DESC
    LIMIT ? OFFSET ?
    `,
    [options.status ?? null, options.status ?? null, limit, offset],
  );
  return { items: result.rows as Product[], page, limit };
}

export async function getProductsMissingSpecs(options: ListOptions = {}, conn?: DbConnection) {
  const { page, limit, offset } = pageOptions(options);
  const result = await connection(conn).raw(
    `
    SELECT p.*
    FROM products p
    LEFT JOIN product_specs ps ON ps.product_id = p.id
    WHERE ps.id IS NULL
      AND (?::text IS NULL OR p.status = ?::text)
    ORDER BY p.id DESC
    LIMIT ? OFFSET ?
    `,
    [options.status ?? null, options.status ?? null, limit, offset],
  );
  return { items: result.rows as Product[], page, limit };
}

export async function getProductsMissingCategories(options: ListOptions = {}, conn?: DbConnection) {
  const { page, limit, offset } = pageOptions(options);
  const result = await connection(conn).raw(
    `
    SELECT p.*
    FROM products p
    LEFT JOIN product_subcategories psc ON psc.product_id = p.id
    WHERE psc.product_id IS NULL
      AND (?::text IS NULL OR p.status = ?::text)
    ORDER BY p.id DESC
    LIMIT ? OFFSET ?
    `,
    [options.status ?? null, options.status ?? null, limit, offset],
  );
  return { items: result.rows as Product[], page, limit };
}

export async function getProductsMissingShopPrices(options: ListOptions = {}, conn?: DbConnection) {
  const { page, limit, offset } = pageOptions(options);
  const result = await connection(conn).raw(
    `
    SELECT p.*
    FROM products p
    LEFT JOIN shop_prices sp ON sp.product_id = p.id
    WHERE sp.product_id IS NULL
      AND (?::text IS NULL OR p.status = ?::text)
    ORDER BY p.id DESC
    LIMIT ? OFFSET ?
    `,
    [options.status ?? null, options.status ?? null, limit, offset],
  );
  return { items: result.rows as Product[], page, limit };
}

export async function getProductsWithNullCurrentPrice(options: ListOptions = {}, conn?: DbConnection) {
  const { page, limit, offset } = pageOptions(options);
  const result = await connection(conn).raw(
    `
    SELECT DISTINCT p.*
    FROM products p
    JOIN shop_prices sp ON sp.product_id = p.id
    WHERE sp.current_price IS NULL
      AND (?::text IS NULL OR p.status = ?::text)
    ORDER BY p.id DESC
    LIMIT ? OFFSET ?
    `,
    [options.status ?? null, options.status ?? null, limit, offset],
  );
  return { items: result.rows as Product[], page, limit };
}

export async function getDuplicateSourceProductIds(conn?: DbConnection) {
  const result = await connection(conn).raw(
    `
    SELECT source_product_id, COUNT(*)::int AS duplicate_count, array_agg(id ORDER BY id) AS product_ids
    FROM products
    WHERE source_product_id IS NOT NULL AND source_product_id <> ''
    GROUP BY source_product_id
    HAVING COUNT(*) > 1
    ORDER BY duplicate_count DESC, source_product_id ASC
    `,
  );
  return result.rows;
}

export function getProductsByShopId(shopId: number, options: Omit<ProductFilterOptions, 'shop_id'> = {}, conn?: DbConnection) {
  return filterProducts({ ...options, shop_id: shopId }, conn);
}

export async function getProductsSoldByShopCount(
  shopCount: number,
  comparator: 'eq' | 'gte' | 'lte' = 'eq',
  conn?: DbConnection,
) {
  const operator = comparator === 'gte' ? '>=' : comparator === 'lte' ? '<=' : '=';
  const result = await connection(conn).raw(
    `
    SELECT p.*, COUNT(DISTINCT sp.shop_id)::int AS shop_count
    FROM products p
    JOIN shop_prices sp ON sp.product_id = p.id
    GROUP BY p.id
    HAVING COUNT(DISTINCT sp.shop_id) ${operator} ?
    ORDER BY shop_count DESC, p.id DESC
    `,
    [shopCount],
  );
  return result.rows;
}

export async function getCheapestShopByProduct(productIds?: number[], conn?: DbConnection) {
  const ids = uniqueNumbers(productIds);
  const result = await connection(conn).raw(
    `
    SELECT *
    FROM (
      SELECT
        sp.product_id,
        sp.shop_id,
        s.name AS shop_name,
        sp.current_price,
        sp.regular_price,
        sp.shop_product_url,
        ROW_NUMBER() OVER (PARTITION BY sp.product_id ORDER BY sp.current_price ASC, sp.updated_at DESC) AS price_rank
      FROM shop_prices sp
      JOIN shops s ON s.id = sp.shop_id
      WHERE sp.current_price IS NOT NULL
        AND (?::bigint[] IS NULL OR sp.product_id = ANY(?::bigint[]))
    ) ranked
    WHERE price_rank = 1
    `,
    [ids.length ? ids : null, ids.length ? ids : null],
  );
  return result.rows;
}

export async function getMostExpensiveShopByProduct(productIds?: number[], conn?: DbConnection) {
  const ids = uniqueNumbers(productIds);
  const result = await connection(conn).raw(
    `
    SELECT *
    FROM (
      SELECT
        sp.product_id,
        sp.shop_id,
        s.name AS shop_name,
        sp.current_price,
        sp.regular_price,
        sp.shop_product_url,
        ROW_NUMBER() OVER (PARTITION BY sp.product_id ORDER BY sp.current_price DESC, sp.updated_at DESC) AS price_rank
      FROM shop_prices sp
      JOIN shops s ON s.id = sp.shop_id
      WHERE sp.current_price IS NOT NULL
        AND (?::bigint[] IS NULL OR sp.product_id = ANY(?::bigint[]))
    ) ranked
    WHERE price_rank = 1
    `,
    [ids.length ? ids : null, ids.length ? ids : null],
  );
  return result.rows;
}

export async function getPriceSpreadByProduct(productIds?: number[], conn?: DbConnection) {
  const ids = uniqueNumbers(productIds);
  const result = await connection(conn).raw(
    `
    SELECT
      sp.product_id,
      MIN(sp.current_price)::numeric(14,3) AS min_price,
      MAX(sp.current_price)::numeric(14,3) AS max_price,
      (MAX(sp.current_price) - MIN(sp.current_price))::numeric(14,3) AS spread_amount,
      CASE
        WHEN MIN(sp.current_price) > 0
        THEN (((MAX(sp.current_price) - MIN(sp.current_price)) / MIN(sp.current_price)) * 100)::numeric(8,2)
        ELSE NULL
      END AS spread_percentage,
      COUNT(DISTINCT sp.shop_id)::int AS shop_count
    FROM shop_prices sp
    WHERE sp.current_price IS NOT NULL
      AND (?::bigint[] IS NULL OR sp.product_id = ANY(?::bigint[]))
    GROUP BY sp.product_id
    ORDER BY spread_amount DESC
    `,
    [ids.length ? ids : null, ids.length ? ids : null],
  );
  return result.rows;
}

export async function getCurrentDiscounts(
  options: { minPercentage?: number; limit?: number; shopId?: number } = {},
  conn?: DbConnection,
) {
  const result = await connection(conn).raw(
    `
    SELECT
      p.id AS product_id,
      p.name AS product_name,
      sp.shop_id,
      sp.current_price,
      sp.regular_price,
      ((sp.regular_price - sp.current_price) / sp.regular_price * 100)::numeric(8,2) AS discount_percentage
    FROM shop_prices sp
    JOIN products p ON p.id = sp.product_id
    WHERE sp.regular_price > current_price
      AND sp.regular_price > 0
      AND ((sp.regular_price - sp.current_price) / sp.regular_price * 100) >= ?
      AND (?::bigint IS NULL OR sp.shop_id = ?::bigint)
    ORDER BY discount_percentage DESC
    LIMIT ?
    `,
    [options.minPercentage ?? 0, options.shopId ?? null, options.shopId ?? null, options.limit ?? 50],
  );
  return result.rows;
}

export async function getLatestPriceMovements(productIds?: number[], conn?: DbConnection) {
  const ids = uniqueNumbers(productIds);
  const result = await connection(conn).raw(
    `
    WITH ranked AS (
      SELECT
        ph.*,
        LEAD(ph.price) OVER (PARTITION BY ph.product_id, ph.shop_id ORDER BY ph.recorded_at DESC) AS previous_price,
        ROW_NUMBER() OVER (PARTITION BY ph.product_id, ph.shop_id ORDER BY ph.recorded_at DESC) AS price_rank
      FROM price_history ph
      WHERE (?::bigint[] IS NULL OR ph.product_id = ANY(?::bigint[]))
    )
    SELECT
      product_id,
      shop_id,
      price AS current_price,
      previous_price,
      (price - previous_price)::numeric(14,3) AS movement_amount,
      CASE
        WHEN previous_price > 0 THEN (((price - previous_price) / previous_price) * 100)::numeric(8,2)
        ELSE NULL
      END AS movement_percentage,
      CASE
        WHEN previous_price IS NULL THEN 'unknown'
        WHEN price > previous_price THEN 'up'
        WHEN price < previous_price THEN 'down'
        ELSE 'flat'
      END AS movement_direction,
      recorded_at
    FROM ranked
    WHERE price_rank = 1
    `,
    [ids.length ? ids : null, ids.length ? ids : null],
  );
  return result.rows;
}

export async function getPriceDrops(
  options: { from?: Date | string; to?: Date | string; minDropPercentage?: number } = {},
  conn?: DbConnection,
) {
  const result = await connection(conn).raw(
    `
    WITH movements AS (
      SELECT
        ph.*,
        LAG(ph.price) OVER (PARTITION BY ph.product_id, ph.shop_id ORDER BY ph.recorded_at ASC) AS previous_price
      FROM price_history ph
      WHERE (?::timestamptz IS NULL OR ph.recorded_at >= ?::timestamptz)
        AND (?::timestamptz IS NULL OR ph.recorded_at <= ?::timestamptz)
    )
    SELECT *,
      ((previous_price - price) / previous_price * 100)::numeric(8,2) AS drop_percentage
    FROM movements
    WHERE previous_price IS NOT NULL
      AND price < previous_price
      AND previous_price > 0
      AND ((previous_price - price) / previous_price * 100) >= ?
    ORDER BY recorded_at DESC
    `,
    [options.from ?? null, options.from ?? null, options.to ?? null, options.to ?? null, options.minDropPercentage ?? 0],
  );
  return result.rows;
}

export async function getPriceIncreases(
  options: { from?: Date | string; to?: Date | string; minIncreasePercentage?: number } = {},
  conn?: DbConnection,
) {
  const result = await connection(conn).raw(
    `
    WITH movements AS (
      SELECT
        ph.*,
        LAG(ph.price) OVER (PARTITION BY ph.product_id, ph.shop_id ORDER BY ph.recorded_at ASC) AS previous_price
      FROM price_history ph
      WHERE (?::timestamptz IS NULL OR ph.recorded_at >= ?::timestamptz)
        AND (?::timestamptz IS NULL OR ph.recorded_at <= ?::timestamptz)
    )
    SELECT *,
      ((price - previous_price) / previous_price * 100)::numeric(8,2) AS increase_percentage
    FROM movements
    WHERE previous_price IS NOT NULL
      AND price > previous_price
      AND previous_price > 0
      AND ((price - previous_price) / previous_price * 100) >= ?
    ORDER BY recorded_at DESC
    `,
    [options.from ?? null, options.from ?? null, options.to ?? null, options.to ?? null, options.minIncreasePercentage ?? 0],
  );
  return result.rows;
}

export async function getPriceStats(
  options: { productId?: number; shopId?: number; from?: Date | string; to?: Date | string } = {},
  conn?: DbConnection,
) {
  const result = await connection(conn).raw(
    `
    SELECT
      COUNT(*)::int AS record_count,
      MIN(price)::numeric(14,3) AS lowest_price,
      MAX(price)::numeric(14,3) AS highest_price,
      AVG(price)::numeric(14,3) AS average_price,
      MIN(recorded_at) AS first_recorded_at,
      MAX(recorded_at) AS last_recorded_at
    FROM price_history
    WHERE (?::bigint IS NULL OR product_id = ?::bigint)
      AND (?::bigint IS NULL OR shop_id = ?::bigint)
      AND (?::timestamptz IS NULL OR recorded_at >= ?::timestamptz)
      AND (?::timestamptz IS NULL OR recorded_at <= ?::timestamptz)
    `,
    [
      options.productId ?? null,
      options.productId ?? null,
      options.shopId ?? null,
      options.shopId ?? null,
      options.from ?? null,
      options.from ?? null,
      options.to ?? null,
      options.to ?? null,
    ],
  );
  return result.rows[0];
}

export async function getPriceTrendSeries(
  options: {
    bucket?: TrendBucket;
    productId?: number;
    shopId?: number;
    brandId?: number;
    topCategoryId?: number;
    lowCategoryId?: number;
    subcategoryId?: number;
    from?: Date | string;
    to?: Date | string;
  } = {},
  conn?: DbConnection,
) {
  const bucket = trendBucket(options.bucket);
  const result = await connection(conn).raw(
    `
    SELECT
      date_trunc('${bucket}', ph.recorded_at) AS bucket,
      AVG(ph.price)::numeric(14,3) AS average_price,
      MIN(ph.price)::numeric(14,3) AS min_price,
      MAX(ph.price)::numeric(14,3) AS max_price,
      COUNT(*)::int AS record_count
    FROM price_history ph
    JOIN products p ON p.id = ph.product_id
    LEFT JOIN product_subcategories psc ON psc.product_id = p.id
    LEFT JOIN subcategories s ON s.id = psc.subcategory_id
    LEFT JOIN low_categories lc ON lc.id = s.low_category_id
    LEFT JOIN top_categories tc ON tc.id = lc.top_category_id
    WHERE (?::bigint IS NULL OR ph.product_id = ?::bigint)
      AND (?::bigint IS NULL OR ph.shop_id = ?::bigint)
      AND (?::bigint IS NULL OR p.brand_id = ?::bigint)
      AND (?::bigint IS NULL OR tc.id = ?::bigint)
      AND (?::bigint IS NULL OR lc.id = ?::bigint)
      AND (?::bigint IS NULL OR s.id = ?::bigint)
      AND (?::timestamptz IS NULL OR ph.recorded_at >= ?::timestamptz)
      AND (?::timestamptz IS NULL OR ph.recorded_at <= ?::timestamptz)
    GROUP BY bucket
    ORDER BY bucket ASC
    `,
    [
      options.productId ?? null,
      options.productId ?? null,
      options.shopId ?? null,
      options.shopId ?? null,
      options.brandId ?? null,
      options.brandId ?? null,
      options.topCategoryId ?? null,
      options.topCategoryId ?? null,
      options.lowCategoryId ?? null,
      options.lowCategoryId ?? null,
      options.subcategoryId ?? null,
      options.subcategoryId ?? null,
      options.from ?? null,
      options.from ?? null,
      options.to ?? null,
      options.to ?? null,
    ],
  );
  return result.rows;
}

export async function getProductCountByCategory(
  level: 'top' | 'low' | 'sub' = 'top',
  conn?: DbConnection,
) {
  const selectByLevel = {
    top: 'tc.id AS category_id, tc.name AS category_name',
    low: 'lc.id AS category_id, lc.name AS category_name, tc.id AS top_category_id',
    sub: 's.id AS category_id, s.name AS category_name, lc.id AS low_category_id, tc.id AS top_category_id',
  }[level];
  const groupByLevel = {
    top: 'tc.id, tc.name',
    low: 'lc.id, lc.name, tc.id',
    sub: 's.id, s.name, lc.id, tc.id',
  }[level];
  const result = await connection(conn).raw(
    `
    SELECT ${selectByLevel}, COUNT(DISTINCT p.id)::int AS product_count
    FROM products p
    JOIN product_subcategories psc ON psc.product_id = p.id
    JOIN subcategories s ON s.id = psc.subcategory_id
    JOIN low_categories lc ON lc.id = s.low_category_id
    JOIN top_categories tc ON tc.id = lc.top_category_id
    GROUP BY ${groupByLevel}
    ORDER BY product_count DESC
    `,
  );
  return result.rows;
}

export async function getProductCountByBrand(conn?: DbConnection) {
  const result = await connection(conn).raw(
    `
    SELECT b.id AS brand_id, b.name AS brand_name, COUNT(DISTINCT p.id)::int AS product_count
    FROM brands b
    LEFT JOIN products p ON p.brand_id = b.id
    GROUP BY b.id, b.name
    ORDER BY product_count DESC
    `,
  );
  return result.rows;
}

export async function getAveragePriceByCategory(level: 'top' | 'low' | 'sub' = 'top', conn?: DbConnection) {
  const counts = await getProductCountByCategory(level, conn);
  const result = await connection(conn).raw(
    `
    SELECT
      tc.id AS top_category_id,
      lc.id AS low_category_id,
      s.id AS subcategory_id,
      AVG(sp.current_price)::numeric(14,3) AS average_price,
      MIN(sp.current_price)::numeric(14,3) AS min_price,
      MAX(sp.current_price)::numeric(14,3) AS max_price
    FROM shop_prices sp
    JOIN products p ON p.id = sp.product_id
    JOIN product_subcategories psc ON psc.product_id = p.id
    JOIN subcategories s ON s.id = psc.subcategory_id
    JOIN low_categories lc ON lc.id = s.low_category_id
    JOIN top_categories tc ON tc.id = lc.top_category_id
    GROUP BY tc.id, lc.id, s.id
    `,
  );
  return { level, counts, prices: result.rows };
}

export async function getAveragePriceByBrand(conn?: DbConnection) {
  const result = await connection(conn).raw(
    `
    SELECT
      b.id AS brand_id,
      b.name AS brand_name,
      AVG(sp.current_price)::numeric(14,3) AS average_price,
      MIN(sp.current_price)::numeric(14,3) AS min_price,
      MAX(sp.current_price)::numeric(14,3) AS max_price
    FROM brands b
    LEFT JOIN products p ON p.brand_id = b.id
    LEFT JOIN shop_prices sp ON sp.product_id = p.id
    GROUP BY b.id, b.name
    ORDER BY average_price DESC NULLS LAST
    `,
  );
  return result.rows;
}

export async function getShopCoverageByCategory(level: 'top' | 'low' | 'sub' = 'top', conn?: DbConnection) {
  const selectByLevel = {
    top: 'tc.id AS category_id, tc.name AS category_name',
    low: 'lc.id AS category_id, lc.name AS category_name, tc.id AS top_category_id',
    sub: 's.id AS category_id, s.name AS category_name, lc.id AS low_category_id, tc.id AS top_category_id',
  }[level];
  const groupByLevel = {
    top: 'tc.id, tc.name',
    low: 'lc.id, lc.name, tc.id',
    sub: 's.id, s.name, lc.id, tc.id',
  }[level];
  const result = await connection(conn).raw(
    `
    SELECT ${selectByLevel}, COUNT(DISTINCT sp.shop_id)::int AS shop_count
    FROM shop_prices sp
    JOIN products p ON p.id = sp.product_id
    JOIN product_subcategories psc ON psc.product_id = p.id
    JOIN subcategories s ON s.id = psc.subcategory_id
    JOIN low_categories lc ON lc.id = s.low_category_id
    JOIN top_categories tc ON tc.id = lc.top_category_id
    GROUP BY ${groupByLevel}
    ORDER BY shop_count DESC
    `,
  );
  return result.rows;
}

export async function getShopCoverageByBrand(conn?: DbConnection) {
  const result = await connection(conn).raw(
    `
    SELECT b.id AS brand_id, b.name AS brand_name, COUNT(DISTINCT sp.shop_id)::int AS shop_count
    FROM brands b
    LEFT JOIN products p ON p.brand_id = b.id
    LEFT JOIN shop_prices sp ON sp.product_id = p.id
    GROUP BY b.id, b.name
    ORDER BY shop_count DESC
    `,
  );
  return result.rows;
}

export async function getTopDiscountedCategories(limit = 20, conn?: DbConnection) {
  const result = await connection(conn).raw(
    `
    SELECT
      tc.id AS top_category_id,
      tc.name AS top_category_name,
      COUNT(DISTINCT p.id)::int AS discounted_product_count,
      AVG(((sp.regular_price - sp.current_price) / sp.regular_price) * 100)::numeric(8,2) AS average_discount_percentage
    FROM shop_prices sp
    JOIN products p ON p.id = sp.product_id
    JOIN product_subcategories psc ON psc.product_id = p.id
    JOIN subcategories s ON s.id = psc.subcategory_id
    JOIN low_categories lc ON lc.id = s.low_category_id
    JOIN top_categories tc ON tc.id = lc.top_category_id
    WHERE sp.regular_price > current_price AND sp.regular_price > 0
    GROUP BY tc.id, tc.name
    ORDER BY average_discount_percentage DESC
    LIMIT ?
    `,
    [limit],
  );
  return result.rows;
}

export async function getTopDiscountedBrands(limit = 20, conn?: DbConnection) {
  const result = await connection(conn).raw(
    `
    SELECT
      b.id AS brand_id,
      b.name AS brand_name,
      COUNT(DISTINCT p.id)::int AS discounted_product_count,
      AVG(((sp.regular_price - sp.current_price) / sp.regular_price) * 100)::numeric(8,2) AS average_discount_percentage
    FROM shop_prices sp
    JOIN products p ON p.id = sp.product_id
    LEFT JOIN brands b ON b.id = p.brand_id
    WHERE sp.regular_price > current_price AND sp.regular_price > 0
    GROUP BY b.id, b.name
    ORDER BY average_discount_percentage DESC
    LIMIT ?
    `,
    [limit],
  );
  return result.rows;
}

export async function getStaleShopPrices(days = 7, conn?: DbConnection) {
  const result = await connection(conn).raw(
    `
    SELECT sp.*, p.name AS product_name, s.name AS shop_name
    FROM shop_prices sp
    JOIN products p ON p.id = sp.product_id
    JOIN shops s ON s.id = sp.shop_id
    WHERE sp.updated_at < now() - (? * interval '1 day')
    ORDER BY sp.updated_at ASC
    `,
    [days],
  );
  return result.rows;
}

export async function getOrphanRiskReport(conn?: DbConnection) {
  const result = await connection(conn).raw(
    `
    SELECT
      (SELECT COUNT(*) FROM products p LEFT JOIN product_images pi ON pi.product_id = p.id WHERE pi.id IS NULL)::int AS products_without_images,
      (SELECT COUNT(*) FROM products p LEFT JOIN product_specs ps ON ps.product_id = p.id WHERE ps.id IS NULL)::int AS products_without_specs,
      (SELECT COUNT(*) FROM products p LEFT JOIN product_subcategories psc ON psc.product_id = p.id WHERE psc.product_id IS NULL)::int AS products_without_categories,
      (SELECT COUNT(*) FROM products p LEFT JOIN shop_prices sp ON sp.product_id = p.id WHERE sp.product_id IS NULL)::int AS products_without_shop_prices,
      (SELECT COUNT(*) FROM shop_prices WHERE current_price IS NULL)::int AS null_current_prices,
      (SELECT COUNT(*) FROM (
        SELECT source_product_id
        FROM products
        WHERE source_product_id IS NOT NULL AND source_product_id <> ''
        GROUP BY source_product_id
        HAVING COUNT(*) > 1
      ) duplicates)::int AS duplicate_source_product_ids
    `,
  );
  return result.rows[0];
}
