import type { Knex } from 'knex';
import { db as defaultDb } from '../db';
import * as productRepositoryDefault from '../repositories/product.repository';
import * as categoryRepositoryDefault from '../repositories/category.repository';
import * as brandRepositoryDefault from '../repositories/brand.repository';
import * as shopRepositoryDefault from '../repositories/shop.repository';
import { AppError } from '../middleware/errorHandler';
import { makeUniqueSlug, slugify } from '../utils/slug';
import { PriceValue, Product, ProductImage, ProductSpec, ShopPrice } from '../entities/catalog.entities';

type ProductRepository = typeof productRepositoryDefault;
type CategoryRepository = typeof categoryRepositoryDefault;
type BrandRepository = typeof brandRepositoryDefault;
type ShopRepository = typeof shopRepositoryDefault;
type TransactionRunner = Pick<Knex, 'transaction'>;
type ListOptions = { page?: number; limit?: number; status?: Product['status'] };

type ShopPriceInput = Omit<ShopPrice, 'product_id' | 'updated_at'> & {
  recorded_at: string;
};

type CreateProductInput = Partial<Product> & {
  name: string;
  subcategory_ids?: number[];
  images?: ProductImage[];
  specs?: ProductSpec[];
  shop_prices?: ShopPriceInput[];
  force_price_history?: boolean;
};

type UpdateProductInput = Partial<CreateProductInput>;

function normalizePrice(value: PriceValue | undefined): string | null {
  if (value === null || value === undefined) return null;
  return Number(value).toFixed(3);
}

function priceChanged(existing: ShopPrice | null, next: ShopPriceInput): boolean {
  if (!existing) return true;
  return (
    normalizePrice(existing.current_price) !== normalizePrice(next.current_price) ||
    normalizePrice(existing.regular_price) !== normalizePrice(next.regular_price)
  );
}

function cleanProductPatch(input: Partial<Product>) {
  const keys: Array<keyof Product> = [
    'brand_id',
    'source_product_id',
    'name',
    'slug',
    'description',
    'source_url',
    'status',
  ];
  return keys.reduce<Partial<Product>>((patch, key) => {
    if (input[key] !== undefined) {
      (patch as Record<string, unknown>)[key] = input[key];
    }
    return patch;
  }, {});
}

export function createProductService(
  deps: {
    db?: TransactionRunner;
    productRepository?: ProductRepository;
    categoryRepository?: CategoryRepository;
    brandRepository?: BrandRepository;
    shopRepository?: ShopRepository;
  } = {},
) {
  const db = deps.db ?? defaultDb;
  const productRepository = deps.productRepository ?? productRepositoryDefault;
  const categoryRepository = deps.categoryRepository ?? categoryRepositoryDefault;
  const brandRepository = deps.brandRepository ?? brandRepositoryDefault;
  const shopRepository = deps.shopRepository ?? shopRepositoryDefault;

  async function uniqueProductSlug(value: string, trx: Knex.Transaction, excludeId?: number) {
    if (!productRepository.productSlugExists) return slugify(value);
    return makeUniqueSlug(value, (candidate) =>
      productRepository.productSlugExists(candidate, excludeId, trx),
    );
  }

  async function syncShopPrices(
    productId: number,
    shopPrices: ShopPriceInput[],
    forcePriceHistory: boolean,
    trx: Knex.Transaction,
  ) {
    if (shopPrices.length === 0) return;
    await shopRepository.ensureShopsExist([...new Set(shopPrices.map((price) => price.shop_id))], trx);

    for (const shopPrice of shopPrices) {
      const existing = await productRepository.getShopPrice(productId, shopPrice.shop_id, trx);
      const shouldInsertHistory = forcePriceHistory || priceChanged(existing, shopPrice);
      await productRepository.upsertShopPrice(
        productId,
        {
          shop_id: shopPrice.shop_id,
          current_price: shopPrice.current_price,
          regular_price: shopPrice.regular_price,
          shop_product_url: shopPrice.shop_product_url,
        },
        trx,
      );

      if (shouldInsertHistory) {
        await productRepository.insertPriceHistory(
          productId,
          {
            shop_id: shopPrice.shop_id,
            price: shopPrice.current_price,
            regular_price: shopPrice.regular_price,
            recorded_at: new Date(shopPrice.recorded_at),
          },
          trx,
        );
      }
    }
  }

  async function createProduct(input: CreateProductInput) {
    return db.transaction(async (trx) => {
      if (input.brand_id) await brandRepository.ensureBrandExists(input.brand_id, trx);
      const subcategoryIds = input.subcategory_ids ?? [];
      const images = input.images ?? [];
      const specs = input.specs ?? [];
      const shopPrices = input.shop_prices ?? [];
      if (subcategoryIds.length > 0) {
        await categoryRepository.ensureSubcategoriesExist(subcategoryIds, trx);
      }

      const slug = await uniqueProductSlug(input.slug ?? input.name, trx);
      const created = await productRepository.createProduct(
        {
          ...cleanProductPatch(input),
          brand_id: input.brand_id ?? null,
          slug,
        },
        trx,
      );
      const productId = Number(created.id);

      await productRepository.syncProductSubcategories(productId, subcategoryIds, trx);
      await productRepository.syncProductImages(productId, images, trx);
      await productRepository.syncProductSpecs(productId, specs, trx);
      await syncShopPrices(productId, shopPrices, Boolean(input.force_price_history), trx);

      const details = await productRepository.getProductDetails(productId, trx);
      if (!details) throw new AppError(500, 'Product creation failed');
      return details;
    });
  }

  async function updateProduct(id: number, input: UpdateProductInput) {
    return db.transaction(async (trx) => {
      const existing = await productRepository.getProductById(id, trx);
      if (!existing) throw new AppError(404, 'Product not found');

      if (input.brand_id) await brandRepository.ensureBrandExists(input.brand_id, trx);
      if (input.subcategory_ids) {
        await categoryRepository.ensureSubcategoriesExist(input.subcategory_ids, trx);
      }

      const patch = cleanProductPatch(input);
      if (input.slug) patch.slug = await uniqueProductSlug(input.slug, trx, id);
      if (Object.keys(patch).length > 0) {
        const updated = await productRepository.updateProduct(id, patch, trx);
        if (!updated) throw new AppError(404, 'Product not found');
      }

      if (input.subcategory_ids) {
        await productRepository.syncProductSubcategories(id, input.subcategory_ids, trx);
      }
      if (input.images) await productRepository.syncProductImages(id, input.images, trx);
      if (input.specs) await productRepository.syncProductSpecs(id, input.specs, trx);
      if (input.shop_prices) {
        await syncShopPrices(id, input.shop_prices, Boolean(input.force_price_history), trx);
      }

      const details = await productRepository.getProductDetails(id, trx);
      if (!details) throw new AppError(404, 'Product not found');
      return details;
    });
  }

  async function getProductById(id: number) {
    const details = await productRepository.getProductDetails(id);
    if (!details) throw new AppError(404, 'Product not found');
    return details;
  }

  return {
    createProduct,
    listProducts: (options?: ListOptions) => productRepository.listProducts(options),
    getProductById,
    updateProduct,
    archiveProduct: (id: number) => productRepository.archiveProduct(id),
  };
}

const service = createProductService();

export const createProduct = service.createProduct;
export const listProducts = service.listProducts;
export const getProductById = service.getProductById;
export const updateProduct = service.updateProduct;
export const archiveProduct = service.archiveProduct;
