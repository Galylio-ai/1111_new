import { z } from 'zod';

export const statusSchema = z.enum(['active', 'archived', 'hidden']);

const optionalSlug = z.string().trim().min(1).max(255).optional();
const optionalText = z.string().trim().min(1).optional().nullable();
const priceSchema = z.number().positive().nullable();

export const idParamSchema = z.object({
  id: z.coerce.number().int().positive(),
});

export const paginationSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  status: statusSchema.optional(),
});

export const createTopCategorySchema = z.object({
  name: z.string().trim().min(1),
  slug: optionalSlug,
  status: statusSchema.default('active'),
});

export const updateTopCategorySchema = createTopCategorySchema.partial();

export const createLowCategorySchema = z.object({
  top_category_id: z.number().int().positive(),
  name: z.string().trim().min(1),
  slug: optionalSlug,
  status: statusSchema.default('active'),
});

export const updateLowCategorySchema = createLowCategorySchema.partial();

export const moveLowCategorySchema = z.object({
  top_category_id: z.number().int().positive(),
});

export const createSubcategorySchema = z.object({
  low_category_id: z.number().int().positive(),
  name: z.string().trim().min(1),
  slug: optionalSlug,
  status: statusSchema.default('active'),
});

export const updateSubcategorySchema = createSubcategorySchema.partial();

export const moveSubcategorySchema = z.object({
  low_category_id: z.number().int().positive(),
});

export const createBrandSchema = z.object({
  name: z.string().trim().min(1),
  slug: optionalSlug,
  status: statusSchema.default('active'),
});

export const updateBrandSchema = createBrandSchema.partial();

export const createShopSchema = z.object({
  shop_key: z.string().trim().min(1),
  name: z.string().trim().min(1),
  slug: optionalSlug,
  website_url: optionalText,
  logo_url: optionalText,
  status: statusSchema.default('active'),
});

export const updateShopSchema = createShopSchema.partial();

export const productImageSchema = z.object({
  image_url: z.string().trim().url(),
});

export const productSpecSchema = z.object({
  spec_key: z.string().trim().min(1),
  spec_value: z.string().trim().min(1),
});

export const shopPriceInputSchema = z.object({
  shop_id: z.number().int().positive(),
  current_price: priceSchema,
  regular_price: priceSchema,
  shop_product_url: z.string().trim().url(),
  recorded_at: z.string().datetime(),
});

export const createProductSchema = z.object({
  name: z.string().trim().min(1),
  slug: optionalSlug,
  brand_id: z.number().int().positive().nullable().optional(),
  description: optionalText,
  source_product_id: optionalText,
  source_url: optionalText,
  status: statusSchema.default('active'),
  subcategory_ids: z.array(z.number().int().positive()).default([]),
  images: z.array(productImageSchema).default([]),
  specs: z.array(productSpecSchema).default([]),
  shop_prices: z.array(shopPriceInputSchema).default([]),
  force_price_history: z.boolean().default(false),
});

export const updateProductSchema = createProductSchema
  .omit({
    subcategory_ids: true,
    images: true,
    specs: true,
    shop_prices: true,
    force_price_history: true,
  })
  .partial()
  .extend({
    subcategory_ids: z.array(z.number().int().positive()).optional(),
    images: z.array(productImageSchema).optional(),
    specs: z.array(productSpecSchema).optional(),
    shop_prices: z.array(shopPriceInputSchema).optional(),
    force_price_history: z.boolean().optional(),
  });
