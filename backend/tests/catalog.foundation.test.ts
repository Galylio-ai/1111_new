import { describe, expect, it, vi } from 'vitest';
import { slugify, makeUniqueSlug } from '../services/retail/src/utils/slug';
import { buildCategoryTree } from '../services/retail/src/utils/categoryTree';
import { composeShopCatalogue } from '../services/retail/src/utils/catalogue';
import * as validators from '../services/retail/src/validators/catalog.validators';
import { createCategoryService } from '../services/retail/src/services/category.service';
import { createProductService } from '../services/retail/src/services/product.service';

function createTransactionRunner() {
  const trx = { id: 'trx' };
  return {
    trx,
    db: {
      transaction: vi.fn(async (callback: (trxArg: unknown) => Promise<unknown>) => callback(trx)),
    },
  };
}

describe('catalog slug utilities', () => {
  it('normalizes readable slugs and removes unsafe characters', () => {
    expect(slugify('  iPhone 15 Pro Max / 128GB  ')).toBe('iphone-15-pro-max-128gb');
    expect(slugify('Écran Samsung 55" QLED')).toBe('ecran-samsung-55-qled');
  });

  it('adds a numeric suffix when a generated slug already exists', async () => {
    const exists = vi.fn(async (slug: string) => ['iphone-15', 'iphone-15-2'].includes(slug));

    await expect(makeUniqueSlug('iPhone 15', exists)).resolves.toBe('iphone-15-3');
    expect(exists).toHaveBeenCalledWith('iphone-15');
    expect(exists).toHaveBeenCalledWith('iphone-15-2');
    expect(exists).toHaveBeenCalledWith('iphone-15-3');
  });
});

describe('catalog category tree', () => {
  it('builds a nested top, low, and subcategory tree', () => {
    const tree = buildCategoryTree({
      topCategories: [{ id: 1, name: 'Retail', slug: 'retail', status: 'active' }],
      lowCategories: [
        { id: 10, top_category_id: 1, name: 'Phones', slug: 'phones', status: 'active' },
      ],
      subcategories: [
        {
          id: 100,
          low_category_id: 10,
          name: 'Smartphones',
          slug: 'smartphones',
          status: 'active',
        },
      ],
    });

    expect(tree).toEqual([
      {
        id: 1,
        name: 'Retail',
        slug: 'retail',
        status: 'active',
        low_categories: [
          {
            id: 10,
            top_category_id: 1,
            name: 'Phones',
            slug: 'phones',
            status: 'active',
            subcategories: [
              {
                id: 100,
                low_category_id: 10,
                name: 'Smartphones',
                slug: 'smartphones',
                status: 'active',
              },
            ],
          },
        ],
      },
    ]);
  });

  it('moves low categories and archives without deleting', async () => {
    const categoryRepository = {
      ensureTopCategoryExists: vi.fn(async () => undefined),
      ensureLowCategoryExists: vi.fn(async () => undefined),
      moveLowCategory: vi.fn(async () => ({ id: 10, top_category_id: 2 })),
      archiveTopCategory: vi.fn(async () => ({ id: 1, status: 'archived' })),
    };
    const service = createCategoryService({ categoryRepository: categoryRepository as never });

    await expect(service.moveLowCategory(10, 2)).resolves.toEqual({ id: 10, top_category_id: 2 });
    await expect(service.archiveTopCategory(1)).resolves.toEqual({ id: 1, status: 'archived' });

    expect(categoryRepository.ensureLowCategoryExists).toHaveBeenCalledWith(10);
    expect(categoryRepository.ensureTopCategoryExists).toHaveBeenCalledWith(2);
    expect(categoryRepository.moveLowCategory).toHaveBeenCalledWith(10, 2);
    expect(categoryRepository.archiveTopCategory).toHaveBeenCalledWith(1);
  });
});

describe('catalog product service', () => {
  it('creates a full product transactionally with relations and price history', async () => {
    const { db, trx } = createTransactionRunner();
    const productRepository = {
      createProduct: vi.fn(async () => ({ id: 1 })),
      updateProduct: vi.fn(),
      getProductById: vi.fn(),
      archiveProduct: vi.fn(),
      syncProductSubcategories: vi.fn(async () => undefined),
      syncProductImages: vi.fn(async () => undefined),
      syncProductSpecs: vi.fn(async () => undefined),
      getShopPrice: vi.fn(async () => undefined),
      upsertShopPrice: vi.fn(async () => undefined),
      insertPriceHistory: vi.fn(async () => undefined),
      getProductDetails: vi.fn(async () => ({ product: { id: 1, name: 'iPhone 15' } })),
    };
    const categoryRepository = {
      ensureSubcategoriesExist: vi.fn(async () => undefined),
    };
    const brandRepository = {
      ensureBrandExists: vi.fn(async () => undefined),
    };
    const shopRepository = {
      ensureShopsExist: vi.fn(async () => undefined),
    };
    const service = createProductService({
      db: db as never,
      productRepository: productRepository as never,
      categoryRepository: categoryRepository as never,
      brandRepository: brandRepository as never,
      shopRepository: shopRepository as never,
    });

    const result = await service.createProduct({
      name: 'iPhone 15',
      brand_id: 1,
      description: 'Apple smartphone',
      source_product_id: 'external-123',
      source_url: 'https://example.com/product',
      subcategory_ids: [10, 11],
      images: [{ image_url: 'https://example.com/image.jpg' }],
      specs: [{ spec_key: 'storage', spec_value: '128GB' }],
      shop_prices: [
        {
          shop_id: 2,
          current_price: 3299,
          regular_price: 3499,
          shop_product_url: 'https://shop.tn/iphone-15',
          recorded_at: '2026-06-15T10:00:00Z',
        },
      ],
    });

    expect(result).toEqual({ product: { id: 1, name: 'iPhone 15' } });
    expect(db.transaction).toHaveBeenCalledOnce();
    expect(productRepository.createProduct).toHaveBeenCalledWith(
      expect.objectContaining({ name: 'iPhone 15', brand_id: 1, slug: 'iphone-15' }),
      trx,
    );
    expect(categoryRepository.ensureSubcategoriesExist).toHaveBeenCalledWith([10, 11], trx);
    expect(brandRepository.ensureBrandExists).toHaveBeenCalledWith(1, trx);
    expect(shopRepository.ensureShopsExist).toHaveBeenCalledWith([2], trx);
    expect(productRepository.syncProductSubcategories).toHaveBeenCalledWith(1, [10, 11], trx);
    expect(productRepository.syncProductImages).toHaveBeenCalledWith(
      1,
      [{ image_url: 'https://example.com/image.jpg' }],
      trx,
    );
    expect(productRepository.syncProductSpecs).toHaveBeenCalledWith(
      1,
      [{ spec_key: 'storage', spec_value: '128GB' }],
      trx,
    );
    expect(productRepository.upsertShopPrice).toHaveBeenCalledWith(
      1,
      expect.objectContaining({ shop_id: 2, current_price: 3299 }),
      trx,
    );
    expect(productRepository.insertPriceHistory).toHaveBeenCalledWith(
      1,
      expect.objectContaining({
        shop_id: 2,
        price: 3299,
        regular_price: 3499,
        recorded_at: new Date('2026-06-15T10:00:00Z'),
      }),
      trx,
    );
  });

  it('syncs only provided child relations on update', async () => {
    const { db, trx } = createTransactionRunner();
    const productRepository = {
      createProduct: vi.fn(),
      updateProduct: vi.fn(async () => ({ id: 1 })),
      getProductById: vi.fn(async () => ({ id: 1, brand_id: 1 })),
      archiveProduct: vi.fn(),
      syncProductSubcategories: vi.fn(async () => undefined),
      syncProductImages: vi.fn(async () => undefined),
      syncProductSpecs: vi.fn(async () => undefined),
      getShopPrice: vi.fn(),
      upsertShopPrice: vi.fn(),
      insertPriceHistory: vi.fn(),
      getProductDetails: vi.fn(async () => ({ product: { id: 1, name: 'iPhone 15 Pro' } })),
    };
    const service = createProductService({
      db: db as never,
      productRepository: productRepository as never,
      categoryRepository: { ensureSubcategoriesExist: vi.fn() } as never,
      brandRepository: { ensureBrandExists: vi.fn() } as never,
      shopRepository: { ensureShopsExist: vi.fn() } as never,
    });

    await service.updateProduct(1, {
      name: 'iPhone 15 Pro',
      images: [{ image_url: 'https://example.com/new.jpg' }],
    });

    expect(productRepository.updateProduct).toHaveBeenCalledWith(
      1,
      expect.objectContaining({ name: 'iPhone 15 Pro' }),
      trx,
    );
    expect(productRepository.syncProductImages).toHaveBeenCalledWith(
      1,
      [{ image_url: 'https://example.com/new.jpg' }],
      trx,
    );
    expect(productRepository.syncProductSubcategories).not.toHaveBeenCalled();
    expect(productRepository.syncProductSpecs).not.toHaveBeenCalled();
  });

  it('records price history only when price values change or history is forced', async () => {
    const { db, trx } = createTransactionRunner();
    const productRepository = {
      createProduct: vi.fn(),
      updateProduct: vi.fn(async () => ({ id: 1 })),
      getProductById: vi.fn(async () => ({ id: 1, brand_id: null })),
      archiveProduct: vi.fn(),
      syncProductSubcategories: vi.fn(),
      syncProductImages: vi.fn(),
      syncProductSpecs: vi.fn(),
      getShopPrice: vi
        .fn()
        .mockResolvedValueOnce({ current_price: '100.000', regular_price: '120.000' })
        .mockResolvedValueOnce({ current_price: '100.000', regular_price: '120.000' })
        .mockResolvedValueOnce({ current_price: '100.000', regular_price: '120.000' }),
      upsertShopPrice: vi.fn(async () => undefined),
      insertPriceHistory: vi.fn(async () => undefined),
      getProductDetails: vi.fn(async () => ({ product: { id: 1 } })),
    };
    const service = createProductService({
      db: db as never,
      productRepository: productRepository as never,
      categoryRepository: { ensureSubcategoriesExist: vi.fn() } as never,
      brandRepository: { ensureBrandExists: vi.fn() } as never,
      shopRepository: { ensureShopsExist: vi.fn(async () => undefined) } as never,
    });
    const basePrice = {
      shop_id: 2,
      current_price: 100,
      regular_price: 120,
      shop_product_url: 'https://shop.tn/p',
      recorded_at: '2026-06-15T10:00:00Z',
    };

    await service.updateProduct(1, { shop_prices: [basePrice] });
    await service.updateProduct(1, {
      shop_prices: [{ ...basePrice, current_price: 90 }],
    });
    await service.updateProduct(1, { shop_prices: [basePrice], force_price_history: true });

    expect(productRepository.upsertShopPrice).toHaveBeenCalledTimes(3);
    expect(productRepository.insertPriceHistory).toHaveBeenCalledTimes(2);
    expect(productRepository.insertPriceHistory).toHaveBeenNthCalledWith(
      1,
      1,
      expect.objectContaining({ price: 90 }),
      trx,
    );
    expect(productRepository.insertPriceHistory).toHaveBeenNthCalledWith(
      2,
      1,
      expect.objectContaining({ price: 100 }),
      trx,
    );
  });

  it('archives products through status instead of deleting rows', async () => {
    const productRepository = {
      archiveProduct: vi.fn(async () => ({ id: 1, status: 'archived' })),
    };
    const service = createProductService({
      productRepository: productRepository as never,
    });

    await expect(service.archiveProduct(1)).resolves.toEqual({ id: 1, status: 'archived' });
    expect(productRepository.archiveProduct).toHaveBeenCalledWith(1);
  });
});

describe('shop catalogue composition', () => {
  it('returns products sold by a shop with brand, categories, images, specs, and current price', () => {
    const catalogue = composeShopCatalogue({
      shop: { id: 2, name: 'Mytek', slug: 'mytek', shop_key: 'mytek', status: 'active' },
      prices: [
        {
          product_id: 1,
          shop_id: 2,
          current_price: '699.000',
          regular_price: '849.000',
          shop_product_url: 'https://mytek.tn/p',
          updated_at: '2026-06-15T10:00:00Z',
        },
      ],
      products: [
        {
          product: { id: 1, name: 'Redmi Note 13', slug: 'redmi-note-13', brand_id: 5 },
          brand: { id: 5, name: 'Xiaomi', slug: 'xiaomi', status: 'active' },
          categories: [{ id: 10, name: 'Smartphones', slug: 'smartphones' }],
          images: [{ id: 100, image_url: 'https://example.com/redmi.jpg' }],
          specs: [{ id: 200, spec_key: 'storage', spec_value: '128GB' }],
          shop_prices: [],
          price_history: [],
        },
      ],
    });

    expect(catalogue.products).toEqual([
      {
        product: { id: 1, name: 'Redmi Note 13', slug: 'redmi-note-13', brand_id: 5 },
        brand: { id: 5, name: 'Xiaomi', slug: 'xiaomi', status: 'active' },
        categories: [{ id: 10, name: 'Smartphones', slug: 'smartphones' }],
        images: [{ id: 100, image_url: 'https://example.com/redmi.jpg' }],
        specs: [{ id: 200, spec_key: 'storage', spec_value: '128GB' }],
        current_price: {
          product_id: 1,
          shop_id: 2,
          current_price: '699.000',
          regular_price: '849.000',
          shop_product_url: 'https://mytek.tn/p',
          updated_at: '2026-06-15T10:00:00Z',
        },
      },
    ]);
  });
});

describe('catalog validators', () => {
  it('rejects invalid IDs, statuses, prices, and missing names', () => {
    expect(validators.idParamSchema.safeParse({ id: '0' }).success).toBe(false);
    expect(validators.statusSchema.safeParse('deleted').success).toBe(false);
    expect(validators.createBrandSchema.safeParse({ name: '' }).success).toBe(false);
    expect(
      validators.createProductSchema.safeParse({
        name: 'Valid Product',
        shop_prices: [
          {
            shop_id: 1,
            current_price: -1,
            regular_price: null,
            shop_product_url: 'https://shop.tn/p',
            recorded_at: '2026-06-15T10:00:00Z',
          },
        ],
      }).success,
    ).toBe(false);
  });

  it('defaults relation arrays on product create', () => {
    const result = validators.createProductSchema.safeParse({ name: 'Valid Product' });

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.subcategory_ids).toEqual([]);
      expect(result.data.images).toEqual([]);
      expect(result.data.specs).toEqual([]);
      expect(result.data.shop_prices).toEqual([]);
    }
  });
});
