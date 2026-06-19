import { readFile } from 'fs/promises';
import path from 'path';
import { describe, expect, it } from 'vitest';

import * as retailService from '../services/retail/src/services/analytics.service';
import * as retailController from '../services/retail/src/controllers/analytics.controller';
import retailRoutes from '../services/retail/src/routes/analytics.routes';
import * as retailValidators from '../services/retail/src/validators/analytics.validators';

import * as paraService from '../services/para/src/services/analytics.service';
import * as paraController from '../services/para/src/controllers/analytics.controller';
import paraRoutes from '../services/para/src/routes/analytics.routes';
import * as paraValidators from '../services/para/src/validators/analytics.validators';

import * as alimentationService from '../services/alimentation/src/services/analytics.service';
import * as alimentationController from '../services/alimentation/src/controllers/analytics.controller';
import alimentationRoutes from '../services/alimentation/src/routes/analytics.routes';
import * as alimentationValidators from '../services/alimentation/src/validators/analytics.validators';

import * as fashionService from '../services/fashion/src/services/analytics.service';
import * as fashionController from '../services/fashion/src/controllers/analytics.controller';
import fashionRoutes from '../services/fashion/src/routes/analytics.routes';
import * as fashionValidators from '../services/fashion/src/validators/analytics.validators';

const expectedServiceExports = [
  'createAnalyticsService',
  'getOverview',
  'getShopSummary',
  'getProductQualityReport',
  'getPriceIntelligence',
  'getCategoryAnalytics',
  'getBrandAnalytics',
  'getStaleDataReport',
  'getTopDiscounts',
  'getPriceDrops',
] as const;

const expectedControllerExports = [
  'overview',
  'shopSummary',
  'productQuality',
  'prices',
  'categories',
  'brands',
  'staleData',
  'topDiscounts',
  'priceDrops',
] as const;

const expectedValidatorExports = [
  'idParamSchema',
  'commonAnalyticsQuerySchema',
  'priceAnalyticsQuerySchema',
  'categoryAnalyticsQuerySchema',
  'topDiscountsQuerySchema',
  'priceDropsQuerySchema',
] as const;

function expectExports(moduleExports: Record<string, unknown>, names: readonly string[]) {
  for (const name of names) {
    expect(moduleExports, `missing export ${name}`).toHaveProperty(name);
  }
}

describe('catalog analytics copied contracts', () => {
  it.each([
    ['retail', retailService, retailController, retailValidators, retailRoutes],
    ['para', paraService, paraController, paraValidators, paraRoutes],
    ['alimentation', alimentationService, alimentationController, alimentationValidators, alimentationRoutes],
    ['fashion', fashionService, fashionController, fashionValidators, fashionRoutes],
  ])('%s exposes analytics service/controller/validator/route contracts', (_domain, service, controller, validators, routes) => {
    expectExports(service, expectedServiceExports);
    expectExports(controller, expectedControllerExports);
    expectExports(validators, expectedValidatorExports);
    expect(routes).toBeDefined();
  });

  it('keeps copied analytics surfaces identical across services', () => {
    expect(Object.keys(paraService).sort()).toEqual(Object.keys(retailService).sort());
    expect(Object.keys(alimentationService).sort()).toEqual(Object.keys(retailService).sort());
    expect(Object.keys(fashionService).sort()).toEqual(Object.keys(retailService).sort());
    expect(Object.keys(paraController).sort()).toEqual(Object.keys(retailController).sort());
    expect(Object.keys(alimentationController).sort()).toEqual(Object.keys(retailController).sort());
    expect(Object.keys(fashionController).sort()).toEqual(Object.keys(retailController).sort());
    expect(Object.keys(paraValidators).sort()).toEqual(Object.keys(retailValidators).sort());
    expect(Object.keys(alimentationValidators).sort()).toEqual(Object.keys(retailValidators).sort());
    expect(Object.keys(fashionValidators).sort()).toEqual(Object.keys(retailValidators).sort());
  });

  it.each(['retail', 'para', 'alimentation', 'fashion'])('%s registers /analytics before the error handler', async (domain) => {
    const source = await readFile(
      path.join(process.cwd(), 'services', domain, 'src', 'index.ts'),
      'utf8',
    );

    expect(source).toContain("import analyticsRouter from './routes/analytics.routes'");
    expect(source.indexOf("app.use('/analytics', analyticsRouter)")).toBeGreaterThan(-1);
    expect(source.indexOf("app.use('/analytics', analyticsRouter)")).toBeLessThan(
      source.indexOf('app.use(errorHandler)'),
    );
  });
});
