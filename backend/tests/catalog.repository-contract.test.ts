import { describe, expect, it } from 'vitest';

import * as retailProducts from '../services/retail/src/repositories/product.repository';
import * as retailShops from '../services/retail/src/repositories/shop.repository';
import * as retailBrands from '../services/retail/src/repositories/brand.repository';
import * as retailCategories from '../services/retail/src/repositories/category.repository';

import * as paraProducts from '../services/para/src/repositories/product.repository';
import * as paraShops from '../services/para/src/repositories/shop.repository';
import * as paraBrands from '../services/para/src/repositories/brand.repository';
import * as paraCategories from '../services/para/src/repositories/category.repository';

import * as alimentationProducts from '../services/alimentation/src/repositories/product.repository';
import * as alimentationShops from '../services/alimentation/src/repositories/shop.repository';
import * as alimentationBrands from '../services/alimentation/src/repositories/brand.repository';
import * as alimentationCategories from '../services/alimentation/src/repositories/category.repository';

import * as fashionProducts from '../services/fashion/src/repositories/product.repository';
import * as fashionShops from '../services/fashion/src/repositories/shop.repository';
import * as fashionBrands from '../services/fashion/src/repositories/brand.repository';
import * as fashionCategories from '../services/fashion/src/repositories/category.repository';

const productRepositoryContract = [
  'findProductById',
  'findProductsByIds',
  'findProductBySlug',
  'findProductBySourceProductId',
  'findProductsByStatus',
  'productExistsById',
  'countProductsByStatus',
  'reactivateProduct',
  'searchProducts',
  'filterProducts',
  'getProductsMissingImages',
  'getProductsMissingSpecs',
  'getProductsMissingCategories',
  'getProductsMissingShopPrices',
  'getProductsWithNullCurrentPrice',
  'getDuplicateSourceProductIds',
  'getProductsByShopId',
  'getProductsSoldByShopCount',
  'getCheapestShopByProduct',
  'getMostExpensiveShopByProduct',
  'getPriceSpreadByProduct',
  'getCurrentDiscounts',
  'getLatestPriceMovements',
  'getPriceDrops',
  'getPriceIncreases',
  'getPriceStats',
  'getPriceTrendSeries',
  'getProductCountByCategory',
  'getProductCountByBrand',
  'getAveragePriceByCategory',
  'getAveragePriceByBrand',
  'getShopCoverageByCategory',
  'getShopCoverageByBrand',
  'getTopDiscountedCategories',
  'getTopDiscountedBrands',
  'getStaleShopPrices',
  'getOrphanRiskReport',
] as const;

const shopRepositoryContract = [
  'findShopById',
  'findShopsByIds',
  'findShopBySlug',
  'findShopByShopKey',
  'findShopsByStatus',
  'shopExistsById',
  'countShopsByStatus',
  'reactivateShop',
  'getShopInsights',
  'getShopCategoryCoverage',
  'getShopBrandCoverage',
] as const;

const brandRepositoryContract = [
  'findBrandById',
  'findBrandsByIds',
  'findBrandBySlug',
  'findBrandsByStatus',
  'brandExistsById',
  'countBrandsByStatus',
  'reactivateBrand',
  'getBrandAnalytics',
] as const;

const categoryRepositoryContract = [
  'findTopCategoryById',
  'findTopCategoriesByIds',
  'findTopCategoryBySlug',
  'findTopCategoriesByStatus',
  'topCategoryExistsById',
  'countTopCategoriesByStatus',
  'reactivateTopCategory',
  'findLowCategoryById',
  'findLowCategoriesByIds',
  'findLowCategoryBySlug',
  'findLowCategoriesByStatus',
  'lowCategoryExistsById',
  'countLowCategoriesByStatus',
  'reactivateLowCategory',
  'findSubcategoryById',
  'findSubcategoriesByIds',
  'findSubcategoryBySlug',
  'findSubcategoriesByStatus',
  'subcategoryExistsById',
  'countSubcategoriesByStatus',
  'reactivateSubcategory',
  'getCategoryAnalytics',
] as const;

function expectExports(moduleExports: Record<string, unknown>, names: readonly string[]) {
  for (const name of names) {
    expect(moduleExports, `missing export ${name}`).toHaveProperty(name);
    expect(typeof moduleExports[name], `export ${name} should be a function`).toBe('function');
  }
}

describe('catalog repository contracts', () => {
  it.each([
    ['retail', retailProducts, retailShops, retailBrands, retailCategories],
    ['para', paraProducts, paraShops, paraBrands, paraCategories],
    ['alimentation', alimentationProducts, alimentationShops, alimentationBrands, alimentationCategories],
    ['fashion', fashionProducts, fashionShops, fashionBrands, fashionCategories],
  ])('%s exposes the robust copied repository surface', (_domain, products, shops, brands, categories) => {
    expectExports(products, productRepositoryContract);
    expectExports(shops, shopRepositoryContract);
    expectExports(brands, brandRepositoryContract);
    expectExports(categories, categoryRepositoryContract);
  });

  it('keeps the copied repository surfaces identical between services', () => {
    expect(Object.keys(paraProducts).sort()).toEqual(Object.keys(retailProducts).sort());
    expect(Object.keys(alimentationProducts).sort()).toEqual(Object.keys(retailProducts).sort());
    expect(Object.keys(paraShops).sort()).toEqual(Object.keys(retailShops).sort());
    expect(Object.keys(alimentationShops).sort()).toEqual(Object.keys(retailShops).sort());
    expect(Object.keys(fashionShops).sort()).toEqual(Object.keys(retailShops).sort());
    expect(Object.keys(paraBrands).sort()).toEqual(Object.keys(retailBrands).sort());
    expect(Object.keys(alimentationBrands).sort()).toEqual(Object.keys(retailBrands).sort());
    expect(Object.keys(fashionBrands).sort()).toEqual(Object.keys(retailBrands).sort());
    expect(Object.keys(paraCategories).sort()).toEqual(Object.keys(retailCategories).sort());
    expect(Object.keys(alimentationCategories).sort()).toEqual(Object.keys(retailCategories).sort());
    expect(Object.keys(fashionCategories).sort()).toEqual(Object.keys(retailCategories).sort());
    expect(Object.keys(fashionProducts).sort()).toEqual(Object.keys(retailProducts).sort());
  });
});
