import * as productRepositoryDefault from '../repositories/product.repository';
import * as shopRepositoryDefault from '../repositories/shop.repository';
import * as brandRepositoryDefault from '../repositories/brand.repository';
import * as categoryRepositoryDefault from '../repositories/category.repository';
import {
  CategoryAnalyticsQuery,
  CommonAnalyticsQuery,
  PriceAnalyticsQuery,
  PriceDropsQuery,
  ShopSummaryQuery,
  TopDiscountsQuery,
} from '../validators/analytics.validators';

type ProductRepository = typeof productRepositoryDefault;
type ShopRepository = typeof shopRepositoryDefault;
type BrandRepository = typeof brandRepositoryDefault;
type CategoryRepository = typeof categoryRepositoryDefault;

type AnalyticsDeps = {
  productRepository?: ProductRepository;
  shopRepository?: ShopRepository;
  brandRepository?: BrandRepository;
  categoryRepository?: CategoryRepository;
};

function page(query: Partial<Pick<CommonAnalyticsQuery, 'page'>>) {
  return query.page ?? 1;
}

function limit(query: Partial<Pick<CommonAnalyticsQuery, 'limit'>>) {
  return query.limit ?? 20;
}

function staleDays(query: Partial<Pick<CommonAnalyticsQuery, 'stale_days'>>) {
  return query.stale_days ?? 7;
}

function bucket(query: Partial<Pick<PriceAnalyticsQuery, 'bucket'>>) {
  return query.bucket ?? 'day';
}

function level(query: Partial<Pick<CategoryAnalyticsQuery, 'level'>>) {
  return query.level ?? 'top';
}

function listOptions(query: Partial<Pick<CommonAnalyticsQuery, 'page' | 'limit' | 'status'>>) {
  return {
    page: page(query),
    limit: limit(query),
    ...(query.status ? { status: query.status } : {}),
  };
}

function itemCount(value: unknown): number {
  if (Array.isArray(value)) return value.length;
  if (value && typeof value === 'object' && Array.isArray((value as { items?: unknown[] }).items)) {
    return (value as { items: unknown[] }).items.length;
  }
  return 0;
}

export function createAnalyticsService(deps: AnalyticsDeps = {}) {
  const productRepository = deps.productRepository ?? productRepositoryDefault;
  const shopRepository = deps.shopRepository ?? shopRepositoryDefault;
  const brandRepository = deps.brandRepository ?? brandRepositoryDefault;
  const categoryRepository = deps.categoryRepository ?? categoryRepositoryDefault;

  async function getProductQualityReport(query: CommonAnalyticsQuery) {
    const options = listOptions(query);
    const [
      productsWithoutImages,
      productsWithoutSpecs,
      productsWithoutCategories,
      productsWithoutShopPrices,
      productsWithNullCurrentPrice,
      duplicateSourceProductIds,
      orphanRiskSummary,
    ] = await Promise.all([
      productRepository.getProductsMissingImages(options),
      productRepository.getProductsMissingSpecs(options),
      productRepository.getProductsMissingCategories(options),
      productRepository.getProductsMissingShopPrices(options),
      productRepository.getProductsWithNullCurrentPrice(options),
      productRepository.getDuplicateSourceProductIds(),
      productRepository.getOrphanRiskReport(),
    ]);

    return {
      products_without_images: productsWithoutImages,
      products_without_specs: productsWithoutSpecs,
      products_without_categories: productsWithoutCategories,
      products_without_shop_prices: productsWithoutShopPrices,
      products_with_null_current_price: productsWithNullCurrentPrice,
      duplicate_source_product_ids: duplicateSourceProductIds,
      orphan_risk_summary: orphanRiskSummary,
    };
  }

  async function getOverview(query: CommonAnalyticsQuery) {
    const [
      totalProducts,
      activeProducts,
      archivedProducts,
      totalShops,
      activeShops,
      totalBrands,
      totalTopCategories,
      totalLowCategories,
      totalSubcategories,
      quality,
      stalePrices,
      currentDiscounts,
    ] = await Promise.all([
      productRepository.countProductsByStatus(),
      productRepository.countProductsByStatus('active'),
      productRepository.countProductsByStatus('archived'),
      shopRepository.countShopsByStatus(),
      shopRepository.countShopsByStatus('active'),
      brandRepository.countBrandsByStatus(),
      categoryRepository.countTopCategoriesByStatus(),
      categoryRepository.countLowCategoriesByStatus(),
      categoryRepository.countSubcategoriesByStatus(),
      getProductQualityReport(query),
      productRepository.getStaleShopPrices(staleDays(query)),
      productRepository.getCurrentDiscounts({ minPercentage: 0, limit: 100 }),
    ]);

    return {
      summary: {
        total_products: totalProducts,
        active_products: activeProducts,
        archived_products: archivedProducts,
        total_shops: totalShops,
        active_shops: activeShops,
        total_brands: totalBrands,
        total_top_categories: totalTopCategories,
        total_low_categories: totalLowCategories,
        total_subcategories: totalSubcategories,
      },
      quality: {
        products_missing_images: itemCount(quality.products_without_images),
        products_missing_specs: itemCount(quality.products_without_specs),
        products_missing_categories: itemCount(quality.products_without_categories),
        products_missing_shop_prices: itemCount(quality.products_without_shop_prices),
        null_current_prices: itemCount(quality.products_with_null_current_price),
        duplicate_source_product_ids: itemCount(quality.duplicate_source_product_ids),
        orphan_risk_summary: quality.orphan_risk_summary,
      },
      stale_price_count: itemCount(stalePrices),
      current_discounted_product_count: itemCount(currentDiscounts),
    };
  }

  async function getShopSummary(shopId: number, query: ShopSummaryQuery) {
    const [shop, insights, categoryCoverage, brandCoverage, topDiscountedProducts] = await Promise.all([
      shopRepository.findShopById(shopId),
      shopRepository.getShopInsights(shopId, { staleDays: staleDays(query) }),
      shopRepository.getShopCategoryCoverage(shopId),
      shopRepository.getShopBrandCoverage(shopId),
      productRepository.getCurrentDiscounts({
        minPercentage: query.min_discount_percentage ?? 0,
        limit: limit(query),
        shopId,
      }),
    ]);

    return {
      shop,
      insights,
      category_coverage: categoryCoverage,
      brand_coverage: brandCoverage,
      top_discounted_products: topDiscountedProducts,
    };
  }

  async function getPriceIntelligence(query: PriceAnalyticsQuery) {
    const productIds = query.product_id ? [query.product_id] : undefined;
    const [cheapest, expensive, spread, movements, trend, stats] = await Promise.all([
      productRepository.getCheapestShopByProduct(productIds),
      productRepository.getMostExpensiveShopByProduct(productIds),
      productRepository.getPriceSpreadByProduct(productIds),
      productRepository.getLatestPriceMovements(productIds),
      productRepository.getPriceTrendSeries({
        bucket: bucket(query),
        productId: query.product_id,
        shopId: query.shop_id,
        brandId: query.brand_id,
        topCategoryId: query.top_category_id,
        lowCategoryId: query.low_category_id,
        subcategoryId: query.subcategory_id,
        from: query.from,
        to: query.to,
      }),
      productRepository.getPriceStats({
        productId: query.product_id,
        shopId: query.shop_id,
        from: query.from,
        to: query.to,
      }),
    ]);

    return {
      cheapest_shop_per_product: cheapest,
      most_expensive_shop_per_product: expensive,
      price_spread_by_product: spread,
      latest_price_movements: movements,
      price_trend_series: trend,
      price_stats: stats,
    };
  }

  async function getCategoryAnalytics(query: CategoryAnalyticsQuery) {
    const [categoryAnalytics, productCount, averagePrice, shopCoverage, topDiscounted] = await Promise.all([
      categoryRepository.getCategoryAnalytics({
        level: level(query),
        staleDays: staleDays(query),
        limit: limit(query),
      }),
      productRepository.getProductCountByCategory(level(query)),
      productRepository.getAveragePriceByCategory(level(query)),
      productRepository.getShopCoverageByCategory(level(query)),
      productRepository.getTopDiscountedCategories(limit(query)),
    ]);

    return {
      category_analytics: categoryAnalytics,
      product_count_by_category: productCount,
      average_price_by_category: averagePrice,
      shop_coverage_by_category: shopCoverage,
      top_discounted_categories: topDiscounted,
    };
  }

  async function getBrandAnalytics(query: CommonAnalyticsQuery) {
    const [brandAnalytics, productCount, averagePrice, shopCoverage, topDiscounted] = await Promise.all([
      brandRepository.getBrandAnalytics({
        status: query.status,
        staleDays: staleDays(query),
        limit: limit(query),
      }),
      productRepository.getProductCountByBrand(),
      productRepository.getAveragePriceByBrand(),
      productRepository.getShopCoverageByBrand(),
      productRepository.getTopDiscountedBrands(limit(query)),
    ]);

    return {
      brand_analytics: brandAnalytics,
      product_count_by_brand: productCount,
      average_price_by_brand: averagePrice,
      shop_coverage_by_brand: shopCoverage,
      top_discounted_brands: topDiscounted,
    };
  }

  async function getStaleDataReport(query: CommonAnalyticsQuery) {
    const [staleShopPrices, quality, categories, brands] = await Promise.all([
      productRepository.getStaleShopPrices(staleDays(query)),
      getProductQualityReport(query),
      categoryRepository.getCategoryAnalytics({ level: 'top', staleDays: staleDays(query), limit: limit(query) }),
      brandRepository.getBrandAnalytics({ status: query.status, staleDays: staleDays(query), limit: limit(query) }),
    ]);

    return {
      stale_shop_prices: staleShopPrices,
      product_quality_context: quality,
      stale_category_context: categories,
      stale_brand_context: brands,
    };
  }

  async function getTopDiscounts(query: TopDiscountsQuery) {
    const [currentDiscounts, topCategories, topBrands] = await Promise.all([
      productRepository.getCurrentDiscounts({
        minPercentage: query.min_discount_percentage ?? 0,
        limit: limit(query),
      }),
      productRepository.getTopDiscountedCategories(limit(query)),
      productRepository.getTopDiscountedBrands(limit(query)),
    ]);

    return {
      current_discounts: currentDiscounts,
      top_discounted_categories: topCategories,
      top_discounted_brands: topBrands,
    };
  }

  async function getPriceDrops(query: PriceDropsQuery) {
    const [drops, increases, movements] = await Promise.all([
      productRepository.getPriceDrops({
        from: query.from,
        to: query.to,
        minDropPercentage: query.min_drop_percentage ?? 0,
      }),
      productRepository.getPriceIncreases({
        from: query.from,
        to: query.to,
        minIncreasePercentage: query.min_drop_percentage ?? 0,
      }),
      productRepository.getLatestPriceMovements(),
    ]);

    return {
      price_drops: drops,
      price_increases: increases,
      latest_price_movements: movements,
    };
  }

  return {
    getOverview,
    getShopSummary,
    getProductQualityReport,
    getPriceIntelligence,
    getCategoryAnalytics,
    getBrandAnalytics,
    getStaleDataReport,
    getTopDiscounts,
    getPriceDrops,
  };
}

const service = createAnalyticsService();

export const getOverview = service.getOverview;
export const getShopSummary = service.getShopSummary;
export const getProductQualityReport = service.getProductQualityReport;
export const getPriceIntelligence = service.getPriceIntelligence;
export const getCategoryAnalytics = service.getCategoryAnalytics;
export const getBrandAnalytics = service.getBrandAnalytics;
export const getStaleDataReport = service.getStaleDataReport;
export const getTopDiscounts = service.getTopDiscounts;
export const getPriceDrops = service.getPriceDrops;
