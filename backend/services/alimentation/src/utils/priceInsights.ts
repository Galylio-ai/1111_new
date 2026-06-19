import { PriceValue } from '../entities/catalog.entities';

export type TrendBucket = 'day' | 'week' | 'month';
export type PriceDirection = 'up' | 'down' | 'flat' | 'unknown';

export function normalizePriceNumber(value: PriceValue | undefined): number | null {
  if (value === null || value === undefined) return null;
  const parsed = typeof value === 'number' ? value : Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

function round(value: number): number {
  return Number(value.toFixed(2));
}

export function calculateDiscountPercentage(
  currentPrice: PriceValue | undefined,
  regularPrice: PriceValue | undefined,
): number | null {
  const current = normalizePriceNumber(currentPrice);
  const regular = normalizePriceNumber(regularPrice);
  if (current === null || regular === null || regular <= 0 || current > regular) return null;
  return round(((regular - current) / regular) * 100);
}

export function calculatePriceSpread(values: Array<PriceValue | undefined>) {
  const prices = values
    .map((value) => normalizePriceNumber(value))
    .filter((value): value is number => value !== null);

  if (prices.length === 0) {
    return { min_price: null, max_price: null, spread_amount: null, spread_percentage: null };
  }

  const minPrice = Math.min(...prices);
  const maxPrice = Math.max(...prices);
  const spreadAmount = maxPrice - minPrice;

  return {
    min_price: round(minPrice),
    max_price: round(maxPrice),
    spread_amount: round(spreadAmount),
    spread_percentage: minPrice > 0 ? round((spreadAmount / minPrice) * 100) : null,
  };
}

export function calculatePriceMovement(
  currentPrice: PriceValue | undefined,
  previousPrice: PriceValue | undefined,
) {
  const current = normalizePriceNumber(currentPrice);
  const previous = normalizePriceNumber(previousPrice);
  if (current === null || previous === null || previous <= 0) {
    return { direction: 'unknown' as PriceDirection, amount: null, percentage: null };
  }

  const amount = current - previous;
  return {
    direction: amount > 0 ? 'up' as const : amount < 0 ? 'down' as const : 'flat' as const,
    amount: round(amount),
    percentage: round((amount / previous) * 100),
  };
}

function isoWeek(date: Date): number {
  const copy = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
  const day = copy.getUTCDay() || 7;
  copy.setUTCDate(copy.getUTCDate() + 4 - day);
  const yearStart = new Date(Date.UTC(copy.getUTCFullYear(), 0, 1));
  return Math.ceil((((copy.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
}

export function formatTrendBucket(value: Date | string, bucket: TrendBucket): string {
  const date = value instanceof Date ? value : new Date(value);
  const year = date.getUTCFullYear();
  const month = String(date.getUTCMonth() + 1).padStart(2, '0');
  const day = String(date.getUTCDate()).padStart(2, '0');

  if (bucket === 'day') return `${year}-${month}-${day}`;
  if (bucket === 'month') return `${year}-${month}`;
  return `${year}-W${String(isoWeek(date)).padStart(2, '0')}`;
}
