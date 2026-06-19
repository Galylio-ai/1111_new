import { describe, expect, it, vi } from 'vitest';
import { createAnalyticsService } from '../services/retail/src/services/analytics.service';

function createRepositories() {
  const productRepository = {
    countProductsByStatus: vi
      .fn()
      .mockResolvedValueOnce(100)
      .mockResolvedValueOnce(80)
      .mockResolvedValueOnce(20),
    getProductsMissingImages: vi.fn(async () => ({ items: ['missing-image'] })),
    getProductsMissingSpecs: vi.fn(async () => ({ items: ['missing-spec'] })),
    getProductsMissingCategories: vi.fn(async () => ({ items: ['missing-category'] })),
    getProductsMissingShopPrices: vi.fn(async () => ({ items: ['missing-price'] })),
    getProductsWithNullCurrentPrice: vi.fn(async () => ({ items: ['null-price'] })),
    getDuplicateSourceProductIds: vi.fn(async () => [{ source_product_id: 'dup', duplicate_count: 2 }]),
    getOrphanRiskReport: vi.fn(async () => ({
      products_without_images: 1,
      products_without_specs: 1,
      products_without_categories: 1,
      products_without_shop_prices: 1,
      null_current_prices: 1,
      duplicate_source_product_ids: 1,
    })),
    getCurrentDiscounts: vi.fn(async () => ['discount']),
    getStaleShopPrices: vi.fn(async () => ['stale']),
    getCheapestShopByProduct: vi.fn(async () => ['cheap']),
    getMostExpensiveShopByProduct: vi.fn(async () => ['expensive']),
    getPriceSpreadByProduct: vi.fn(async () => ['spread']),
    getLatestPriceMovements: vi.fn(async () => ['movement']),
    getPriceTrendSeries: vi.fn(async () => ['trend']),
    getPriceStats: vi.fn(async () => ({ average_price: '100.000' })),
    getPriceDrops: vi.fn(async () => ['drop']),
    getPriceIncreases: vi.fn(async () => ['increase']),
    getProductCountByCategory: vi.fn(async () => ['category-count']),
    getAveragePriceByCategory: vi.fn(async () => ['category-average']),
    getShopCoverageByCategory: vi.fn(async () => ['category-coverage']),
    getTopDiscountedCategories: vi.fn(async () => ['top-category']),
    getProductCountByBrand: vi.fn(async () => ['brand-count']),
    getAveragePriceByBrand: vi.fn(async () => ['brand-average']),
    getShopCoverageByBrand: vi.fn(async () => ['brand-coverage']),
    getTopDiscountedBrands: vi.fn(async () => ['top-brand']),
  };
  const shopRepository = {
    countShopsByStatus: vi.fn().mockResolvedValueOnce(10).mockResolvedValueOnce(8),
    findShopById: vi.fn(async () => ({ id: 7, name: 'Mytek' })),
    getShopInsights: vi.fn(async () => ({ shop_id: 7, product_count: 5 })),
    getShopCategoryCoverage: vi.fn(async () => ['shop-category']),
    getShopBrandCoverage: vi.fn(async () => ['shop-brand']),
  };
  const brandRepository = {
    countBrandsByStatus: vi.fn(async () => 12),
    getBrandAnalytics: vi.fn(async () => ['brand-analytics']),
  };
  const categoryRepository = {
    countTopCategoriesByStatus: vi.fn(async () => 3),
    countLowCategoriesByStatus: vi.fn(async () => 8),
    countSubcategoriesByStatus: vi.fn(async () => 21),
    getCategoryAnalytics: vi.fn(async () => ['category-analytics']),
  };

  return { productRepository, shopRepository, brandRepository, categoryRepository };
}

describe('catalog analytics service', () => {
  it('composes overview counts and quality signals', async () => {
    const repositories = createRepositories();
    const service = createAnalyticsService(repositories as never);

    const result = await service.getOverview({ stale_days: 14 });

    expect(result.summary).toMatchObject({
      total_products: 100,
      active_products: 80,
      archived_products: 20,
      total_shops: 10,
      active_shops: 8,
      total_brands: 12,
      total_top_categories: 3,
      total_low_categories: 8,
      total_subcategories: 21,
    });
    expect(result.quality.products_missing_images).toBe(1);
    expect(result.quality.duplicate_source_product_ids).toBe(1);
    expect(result.stale_price_count).toBe(1);
    expect(result.current_discounted_product_count).toBe(1);
    expect(repositories.productRepository.getStaleShopPrices).toHaveBeenCalledWith(14);
  });

  it('composes shop summary from shop info, insights, and coverage', async () => {
    const repositories = createRepositories();
    const service = createAnalyticsService(repositories as never);

    const result = await service.getShopSummary(7, { stale_days: 9, limit: 5 });

    expect(result.shop).toEqual({ id: 7, name: 'Mytek' });
    expect(result.insights).toEqual({ shop_id: 7, product_count: 5 });
    expect(result.category_coverage).toEqual(['shop-category']);
    expect(result.brand_coverage).toEqual(['shop-brand']);
    expect(repositories.shopRepository.getShopInsights).toHaveBeenCalledWith(7, { staleDays: 9 });
    expect(repositories.productRepository.getCurrentDiscounts).toHaveBeenCalledWith({
      minPercentage: 0,
      limit: 5,
      shopId: 7,
    });
  });

  it('returns all product quality report groups', async () => {
    const repositories = createRepositories();
    const service = createAnalyticsService(repositories as never);

    const result = await service.getProductQualityReport({ page: 2, limit: 10, status: 'active' });

    expect(Object.keys(result).sort()).toEqual([
      'duplicate_source_product_ids',
      'orphan_risk_summary',
      'products_with_null_current_price',
      'products_without_categories',
      'products_without_images',
      'products_without_shop_prices',
      'products_without_specs',
    ]);
    expect(repositories.productRepository.getProductsMissingImages).toHaveBeenCalledWith({
      page: 2,
      limit: 10,
      status: 'active',
    });
  });

  it('composes price intelligence from price repositories', async () => {
    const repositories = createRepositories();
    const service = createAnalyticsService(repositories as never);

    const result = await service.getPriceIntelligence({
      bucket: 'week',
      product_id: 3,
      shop_id: 4,
      from: '2026-06-01T00:00:00Z',
      to: '2026-06-15T00:00:00Z',
    });

    expect(result).toMatchObject({
      cheapest_shop_per_product: ['cheap'],
      most_expensive_shop_per_product: ['expensive'],
      price_spread_by_product: ['spread'],
      latest_price_movements: ['movement'],
      price_trend_series: ['trend'],
      price_stats: { average_price: '100.000' },
    });
    expect(repositories.productRepository.getPriceTrendSeries).toHaveBeenCalledWith({
      bucket: 'week',
      productId: 3,
      shopId: 4,
      brandId: undefined,
      topCategoryId: undefined,
      lowCategoryId: undefined,
      subcategoryId: undefined,
      from: '2026-06-01T00:00:00Z',
      to: '2026-06-15T00:00:00Z',
    });
  });

  it('supports category levels and brand analytics composition', async () => {
    const repositories = createRepositories();
    const service = createAnalyticsService(repositories as never);

    await service.getCategoryAnalytics({ level: 'sub', limit: 6, stale_days: 5 });
    const brand = await service.getBrandAnalytics({ limit: 6, stale_days: 5 });

    expect(repositories.categoryRepository.getCategoryAnalytics).toHaveBeenCalledWith({
      level: 'sub',
      staleDays: 5,
      limit: 6,
    });
    expect(brand).toMatchObject({
      brand_analytics: ['brand-analytics'],
      product_count_by_brand: ['brand-count'],
      average_price_by_brand: ['brand-average'],
      shop_coverage_by_brand: ['brand-coverage'],
      top_discounted_brands: ['top-brand'],
    });
  });

  it('uses stale data defaults and top discount filters', async () => {
    const repositories = createRepositories();
    const service = createAnalyticsService(repositories as never);

    await service.getStaleDataReport({});
    await service.getTopDiscounts({ min_discount_percentage: 15, limit: 9 });

    expect(repositories.productRepository.getStaleShopPrices).toHaveBeenCalledWith(7);
    expect(repositories.productRepository.getCurrentDiscounts).toHaveBeenCalledWith({
      minPercentage: 15,
      limit: 9,
    });
  });

  it('returns drops, increases, and latest movements', async () => {
    const repositories = createRepositories();
    const service = createAnalyticsService(repositories as never);

    const result = await service.getPriceDrops({
      from: '2026-06-01T00:00:00Z',
      to: '2026-06-15T00:00:00Z',
      min_drop_percentage: 5,
    });

    expect(result).toEqual({
      price_drops: ['drop'],
      price_increases: ['increase'],
      latest_price_movements: ['movement'],
    });
    expect(repositories.productRepository.getPriceDrops).toHaveBeenCalledWith({
      from: '2026-06-01T00:00:00Z',
      to: '2026-06-15T00:00:00Z',
      minDropPercentage: 5,
    });
  });
});
