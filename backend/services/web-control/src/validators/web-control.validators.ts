import { z } from 'zod';

export const statusSchema = z.enum(['active', 'archived', 'hidden']);
export const catalogDomainSchema = z.enum(['retail', 'para', 'alimentation', 'fashion']);
export const categoryLevelSchema = z.enum(['top', 'low', 'sub']);

const positiveInt = z.coerce.number().int().positive();
const nullablePositiveInt = positiveInt.nullable().optional();
const text = z.string().trim().min(1);
const optionalText = z.string().trim().min(1).nullable().optional();
const metadataSchema = z.record(z.unknown()).default({});

export const uuidParamSchema = z.object({
  id: z.string().uuid(),
});

export const keyParamSchema = z.object({
  key: text.max(120),
});

export const paginationSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
  status: statusSchema.optional(),
});

export const sectionItemListQuerySchema = paginationSchema.extend({
  section_id: z.string().uuid().optional(),
});

export const footerLinkListQuerySchema = paginationSchema.extend({
  group_id: z.string().uuid().optional(),
});

export const mediaListQuerySchema = paginationSchema;

export const createBannerSchema = z.object({
  title: text.max(180),
  subtitle: optionalText,
  image_url: optionalText,
  cta_label: optionalText,
  cta_url: optionalText,
  placement: text.max(120),
  display_order: z.coerce.number().int().min(0).default(0),
  catalog_domain: catalogDomainSchema.nullable().optional(),
  category_level: categoryLevelSchema.nullable().optional(),
  category_id: nullablePositiveInt,
  product_id: nullablePositiveInt,
  status: statusSchema.default('active'),
  metadata: metadataSchema,
});

export const updateBannerSchema = createBannerSchema.partial();

export const createSectionSchema = z.object({
  section_key: text.max(120),
  title: text.max(180),
  subtitle: optionalText,
  section_type: text.max(80).default('manual'),
  display_order: z.coerce.number().int().min(0).default(0),
  status: statusSchema.default('active'),
  metadata: metadataSchema,
});

export const updateSectionSchema = createSectionSchema.partial();

export const createSectionItemSchema = z.object({
  section_id: z.string().uuid(),
  item_type: text.max(80).default('manual'),
  catalog_domain: catalogDomainSchema.nullable().optional(),
  category_level: categoryLevelSchema.nullable().optional(),
  category_id: nullablePositiveInt,
  product_id: nullablePositiveInt,
  title: optionalText,
  image_url: optionalText,
  cta_url: optionalText,
  display_order: z.coerce.number().int().min(0).default(0),
  metadata: metadataSchema,
});

export const updateSectionItemSchema = createSectionItemSchema.partial();

export const createFooterGroupSchema = z.object({
  title: text.max(120),
  display_order: z.coerce.number().int().min(0).default(0),
  status: statusSchema.default('active'),
});

export const updateFooterGroupSchema = createFooterGroupSchema.partial();

export const createFooterLinkSchema = z.object({
  group_id: z.string().uuid(),
  label: text.max(120),
  href: text.max(500),
  display_order: z.coerce.number().int().min(0).default(0),
  status: statusSchema.default('active'),
});

export const updateFooterLinkSchema = createFooterLinkSchema.partial();

export const upsertSettingSchema = z.object({
  value: z.record(z.unknown()),
});
