import { z } from 'zod';

export const idParamSchema = z.object({
  id: z.string().uuid(),
});

export const paginationSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});

export const importPayloadSchema = z
  .object({
    source_type: z.enum(['json', 'csv']),
    mapping: z.record(z.string().trim().min(1)),
    rows: z.array(z.record(z.unknown())).optional(),
    csv: z.string().trim().optional(),
  })
  .superRefine((value, ctx) => {
    if (value.source_type === 'json' && (!value.rows || value.rows.length === 0)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['rows'],
        message: 'rows are required for JSON imports',
      });
    }
    if (value.source_type === 'csv' && !value.csv) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['csv'],
        message: 'csv is required for CSV imports',
      });
    }
  });
