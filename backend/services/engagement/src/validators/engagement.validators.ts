import { z } from 'zod';

export const catalogDomainSchema = z.enum(['retail', 'para', 'alimentation', 'fashion']);
export const alertTypeSchema = z.enum(['price_drop', 'price_below', 'back_in_stock', 'promotion']);

export const uuidParamSchema = z.object({
  id: z.string().uuid(),
});

export const favoriteInputSchema = z.object({
  catalog_domain: catalogDomainSchema,
  product_id: z.coerce.number().int().positive(),
});

export const alertInputSchema = favoriteInputSchema.extend({
  alert_type: alertTypeSchema,
});

export const updateAlertSchema = z.object({
  alert_type: alertTypeSchema,
});
