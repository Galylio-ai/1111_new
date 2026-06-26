/** Shared helpers for product detail pages (similar products + price history). */

const STOP_WORDS = new Set([
  "le", "la", "les", "de", "du", "des", "et", "en", "pour", "avec", "sans",
  "the", "and", "for", "pack", "lot", "set",
]);

export function productNameTokens(name: string): string[] {
  return name
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, " ")
    .split(/\s+/)
    .filter((w) => w.length >= 3 && !STOP_WORDS.has(w));
}

/** Jaccard-like overlap on name tokens (0–1). */
export function nameSimilarityScore(a: string, b: string): number {
  const ta = new Set(productNameTokens(a));
  const tb = new Set(productNameTokens(b));
  if (!ta.size || !tb.size) return 0;
  let inter = 0;
  for (const t of ta) if (tb.has(t)) inter++;
  return inter / new Set([...ta, ...tb]).size;
}

export type PricePoint = { date: string; prix: number };

/** Last 7 days at a stable price — flat line for charts. */
export function weekPriceHistoryAt(price: number): PricePoint[] {
  const safe = Number.isFinite(price) && price > 0 ? price : 0;
  const out: PricePoint[] = [];
  const today = new Date();
  today.setHours(12, 0, 0, 0);

  for (let i = 6; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    out.push({
      date: d.toLocaleDateString("fr-FR", { day: "2-digit", month: "2-digit" }),
      prix: safe,
    });
  }
  return out;
}

export type CatalogPricePoint = { date: string; price: number };

export function weekCatalogPriceHistoryAt(price: number): CatalogPricePoint[] {
  return weekPriceHistoryAt(price).map(({ date, prix }) => ({ date, price: prix }));
}

/**
 * Prefer real history when it has variation; otherwise show 7 stable days
 * at the current product price.
 */
export function resolveCatalogPriceHistory(
  rows: CatalogPricePoint[],
  currentPrice: number | null,
): CatalogPricePoint[] {
  const price = currentPrice != null && currentPrice > 0 ? currentPrice : null;
  if (price == null) return rows.slice(-7);

  const lastWeek = rows.slice(-7);
  if (lastWeek.length >= 5) {
    const vals = lastWeek.map((r) => r.price);
    const spread = Math.max(...vals) - Math.min(...vals);
    if (spread > 0.001) return lastWeek;
  }

  return weekCatalogPriceHistoryAt(price);
}

/** CatalogProductDetail chart format ({ date, prix }). */
export function resolveDetailPriceHistory(
  rows: PricePoint[] | undefined,
  currentPrice: number | null,
): PricePoint[] {
  const price = currentPrice != null && currentPrice > 0 ? currentPrice : null;
  if (!rows?.length) {
    return price != null ? weekPriceHistoryAt(price) : [];
  }

  const lastWeek = rows.slice(-7);
  if (lastWeek.length >= 5) {
    const vals = lastWeek.map((r) => r.prix);
    const spread = Math.max(...vals) - Math.min(...vals);
    if (spread > 0.001) return lastWeek;
  }

  return price != null ? weekPriceHistoryAt(price) : lastWeek;
}

export function rankByNameSimilarity<T extends { name: string }>(
  items: T[],
  sourceName: string,
  limit: number,
): T[] {
  return [...items]
    .map((item) => ({ item, score: nameSimilarityScore(sourceName, item.name) }))
    .filter((x) => x.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map((x) => x.item);
}
