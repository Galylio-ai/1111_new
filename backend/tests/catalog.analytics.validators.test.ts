import { describe, expect, it } from 'vitest';
import * as validators from '../services/retail/src/validators/analytics.validators';

describe('catalog analytics validators', () => {
  it('rejects invalid params and accepts positive integer ids', () => {
    expect(validators.idParamSchema.safeParse({ id: '0' }).success).toBe(false);
    expect(validators.idParamSchema.safeParse({ id: '-1' }).success).toBe(false);
    expect(validators.idParamSchema.safeParse({ id: '12' }).success).toBe(true);
  });

  it('validates common analytics query defaults and enums', () => {
    const parsed = validators.commonAnalyticsQuerySchema.parse({});

    expect(parsed).toMatchObject({ page: 1, limit: 20, stale_days: 7 });
    expect(validators.commonAnalyticsQuerySchema.safeParse({ status: 'deleted' }).success).toBe(false);
    expect(validators.commonAnalyticsQuerySchema.safeParse({ limit: '101' }).success).toBe(false);
    expect(validators.commonAnalyticsQuerySchema.safeParse({ stale_days: '0' }).success).toBe(false);
    expect(validators.commonAnalyticsQuerySchema.safeParse({ from: 'not-a-date' }).success).toBe(false);
  });

  it('validates price query bucket, ids, and percentages', () => {
    const parsed = validators.priceAnalyticsQuerySchema.parse({});

    expect(parsed.bucket).toBe('day');
    expect(parsed.min_discount_percentage).toBe(0);
    expect(parsed.min_drop_percentage).toBe(0);
    expect(validators.priceAnalyticsQuerySchema.safeParse({ bucket: 'year' }).success).toBe(false);
    expect(validators.priceAnalyticsQuerySchema.safeParse({ product_id: '0' }).success).toBe(false);
    expect(validators.priceAnalyticsQuerySchema.safeParse({ min_drop_percentage: '-1' }).success).toBe(false);
  });

  it('validates category levels', () => {
    expect(validators.categoryAnalyticsQuerySchema.parse({}).level).toBe('top');
    expect(validators.categoryAnalyticsQuerySchema.safeParse({ level: 'low' }).success).toBe(true);
    expect(validators.categoryAnalyticsQuerySchema.safeParse({ level: 'sub' }).success).toBe(true);
    expect(validators.categoryAnalyticsQuerySchema.safeParse({ level: 'deep' }).success).toBe(false);
  });
});
