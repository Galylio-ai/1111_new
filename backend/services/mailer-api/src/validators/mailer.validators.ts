import { z } from 'zod';

export const uuidParamSchema = z.object({
  id: z.string().uuid(),
});

export const templateStatusSchema = z.enum(['active', 'archived', 'hidden']);
export const logStatusSchema = z.enum(['queued', 'sent', 'failed']);

export const paginationSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});

export const templateListQuerySchema = paginationSchema.extend({
  status: templateStatusSchema.optional(),
});

export const logListQuerySchema = paginationSchema.extend({
  status: logStatusSchema.optional(),
});

export const createTemplateSchema = z.object({
  template_key: z.string().trim().min(1).max(120),
  subject: z.string().trim().min(1).max(255),
  html_body: z.string().trim().min(1),
  status: templateStatusSchema.default('active'),
});

export const updateTemplateSchema = createTemplateSchema.partial();

export const previewTemplateSchema = z.object({
  variables: z.record(z.unknown()).default({}),
});

export const testSendSchema = z.object({
  to_email: z.string().email(),
  variables: z.record(z.unknown()).default({}),
});
