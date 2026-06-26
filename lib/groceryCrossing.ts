import raw from "@/lib/data/grocery-crossing-ranking.json";
import { getStoreLogo } from "@/lib/data";

export type GroceryShopHealth = {
  shop_name: string;
  shop_key?: string;
  rank?: number;
  total_products: number;
  crossed_products: number;
  unique_products: number;
  crossing_rate_pct: number;
  cheapest_wins: number;
  price_comparisons: number;
  cheapest_rate_pct: number;
  best_overlap_shop: string;
  best_overlap_products: number;
};

export type GroceryCrossingData = {
  generated_at: string;
  summary: {
    products: number;
    offers: number;
    shops: number;
    crossed_products: number;
    not_crossed_products: number;
    crossingDepth: Record<string, number>;
  };
  featured_shops: GroceryShopHealth[];
  shop_health: GroceryShopHealth[];
  carrefour_family: Array<{
    shops: string;
    products: number;
    exact_products?: number;
    cheapest_wins: Record<string, number>;
    avg_spread_pct: number;
  }>;
};

const data = raw as GroceryCrossingData;

export function getGroceryCrossingData(): GroceryCrossingData {
  return data;
}

const SHORT_NAMES: Record<string, string> = {
  Aziza: "Aziza",
  Carrefour: "Carrefour",
  Monoprix: "Monoprix",
  "Carrefour Market": "C. Market",
  "Carrefour Express": "C. Express",
  Geant: "Géant",
  "Monoprix Glovo": "Monoprix Glovo",
};

export function shopShortName(name: string): string {
  return SHORT_NAMES[name] ?? name;
}

export function shopLogoPath(name: string): string {
  return getStoreLogo(name) ?? "/shop-logos/default.png";
}

export function barHeightForRate(rate: number, maxRate: number, maxH = 72, minH = 8): number {
  if (maxRate <= 0) return minH;
  return Math.max(minH, Math.round((rate / maxRate) * maxH));
}

export function formatCheapestWins(wins: Record<string, number>): string {
  return Object.entries(wins)
    .sort(([, a], [, b]) => b - a)
    .map(([shop, n]) => `${shopShortName(shop)}:${n}`)
    .join(", ");
}
