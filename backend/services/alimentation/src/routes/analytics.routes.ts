import { Router } from 'express';
import { validate } from '../middleware/validate';
import * as v from '../validators/analytics.validators';
import * as ctrl from '../controllers/analytics.controller';

const router = Router();

router.get('/overview', validate(v.commonAnalyticsQuerySchema, 'query'), ctrl.overview);
router.get(
  '/shops/:id',
  validate(v.idParamSchema, 'params'),
  validate(v.shopSummaryQuerySchema, 'query'),
  ctrl.shopSummary,
);
router.get('/product-quality', validate(v.commonAnalyticsQuerySchema, 'query'), ctrl.productQuality);
router.get('/prices', validate(v.priceAnalyticsQuerySchema, 'query'), ctrl.prices);
router.get('/categories', validate(v.categoryAnalyticsQuerySchema, 'query'), ctrl.categories);
router.get('/brands', validate(v.commonAnalyticsQuerySchema, 'query'), ctrl.brands);
router.get('/stale-data', validate(v.commonAnalyticsQuerySchema, 'query'), ctrl.staleData);
router.get('/top-discounts', validate(v.topDiscountsQuerySchema, 'query'), ctrl.topDiscounts);
router.get('/price-drops', validate(v.priceDropsQuerySchema, 'query'), ctrl.priceDrops);

export default router;
