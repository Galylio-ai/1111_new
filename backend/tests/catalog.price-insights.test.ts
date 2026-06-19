import { describe, expect, it } from 'vitest';
import {
  calculateDiscountPercentage,
  calculatePriceMovement,
  calculatePriceSpread,
  formatTrendBucket,
  normalizePriceNumber,
} from '../services/retail/src/utils/priceInsights';

describe('catalog price insight utilities', () => {
  it('normalizes numeric price values safely', () => {
    expect(normalizePriceNumber('120.500')).toBe(120.5);
    expect(normalizePriceNumber(99)).toBe(99);
    expect(normalizePriceNumber(null)).toBeNull();
    expect(normalizePriceNumber('not-a-price')).toBeNull();
  });

  it('calculates discount percentage from regular and current price', () => {
    expect(calculateDiscountPercentage(80, 100)).toBe(20);
    expect(calculateDiscountPercentage('75.000', '100.000')).toBe(25);
    expect(calculateDiscountPercentage(100, null)).toBeNull();
    expect(calculateDiscountPercentage(100, 0)).toBeNull();
  });

  it('calculates price spread across shop offers', () => {
    expect(calculatePriceSpread([120, '100.000', null, 140])).toEqual({
      min_price: 100,
      max_price: 140,
      spread_amount: 40,
      spread_percentage: 40,
    });
  });

  it('calculates price movement between historical records', () => {
    expect(calculatePriceMovement(90, 100)).toEqual({
      direction: 'down',
      amount: -10,
      percentage: -10,
    });
    expect(calculatePriceMovement(110, 100)).toMatchObject({ direction: 'up', amount: 10 });
    expect(calculatePriceMovement(100, 100)).toMatchObject({ direction: 'flat', amount: 0 });
  });

  it('formats trend buckets for chart series', () => {
    const date = new Date('2026-06-15T10:20:00Z');

    expect(formatTrendBucket(date, 'day')).toBe('2026-06-15');
    expect(formatTrendBucket(date, 'week')).toBe('2026-W25');
    expect(formatTrendBucket(date, 'month')).toBe('2026-06');
  });
});
