import { z } from 'zod';

export const statusSchema = z.enum(['active', 'archived', 'hidden']);
export const bucketSchema = z.enum(['day', 'week', 'month']);
export const categoryLevelSchema = z.enum(['top', 'low', 'sub']);

export const idParamSchema = z.object({
  id: z.coerce.number().int().positive(),
});

const optionalDateTime = z.string().datetime().optional();
const optionalId = z.coerce.number().int().positive().optional();
const percentage = z.coerce.number().min(0).optional();

export const commonAnalyticsQuerySchema = z.object({
  status: statusSchema.optional(),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  from: optionalDateTime,
  to: optionalDateTime,
  stale_days: z.coerce.number().int().positive().default(7),
});

export const priceAnalyticsQuerySchema = commonAnalyticsQuerySchema.extend({
  bucket: bucketSchema.default('day'),
  product_id: optionalId,
  shop_id: optionalId,
  brand_id: optionalId,
  top_category_id: optionalId,
  low_category_id: optionalId,
  subcategory_id: optionalId,
  min_discount_percentage: z.coerce.number().min(0).default(0),
  min_drop_percentage: z.coerce.number().min(0).default(0),
});

export const categoryAnalyticsQuerySchema = commonAnalyticsQuerySchema.extend({
  level: categoryLevelSchema.default('top'),
});

export const topDiscountsQuerySchema = commonAnalyticsQuerySchema.extend({
  min_discount_percentage: z.coerce.number().min(0).default(0),
});

export const priceDropsQuerySchema = commonAnalyticsQuerySchema.extend({
  min_drop_percentage: z.coerce.number().min(0).default(0),
});

export const shopSummaryQuerySchema = commonAnalyticsQuerySchema.extend({
  min_discount_percentage: percentage.default(0),
});

export type CommonAnalyticsQuery = z.infer<typeof commonAnalyticsQuerySchema>;
export type PriceAnalyticsQuery = z.infer<typeof priceAnalyticsQuerySchema>;
export type CategoryAnalyticsQuery = z.infer<typeof categoryAnalyticsQuerySchema>;
export type TopDiscountsQuery = z.infer<typeof topDiscountsQuerySchema>;
export type PriceDropsQuery = z.infer<typeof priceDropsQuerySchema>;
export type ShopSummaryQuery = z.infer<typeof shopSummaryQuerySchema>;
