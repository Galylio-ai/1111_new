import fiveShopRaw from "@/lib/data/five-shop-essential-basket-v2.json";
import carrefourRaw from "@/lib/data/carrefour-essential-basket-v2.json";

export const FIVE_SHOP_NAMES = [
  "Carrefour",
  "Carrefour Market",
  "Carrefour Express",
  "Monoprix",
  "Geant",
] as const;

export const CARREFOUR_FAMILY_SHOPS = [
  "Carrefour",
  "Carrefour Market",
  "Carrefour Express",
] as const;

export type ShopName = (typeof FIVE_SHOP_NAMES)[number];
export type CarrefourShopName = (typeof CARREFOUR_FAMILY_SHOPS)[number];

export type ShopPrice = {
  shop: string;
  price: number;
  url: string | null;
};

export type BasketProductRow = {
  category: string;
  choice: string;
  productId: string;
  name: string;
  brand: string;
  sourceCategory: string;
  prices: ShopPrice[];
  cheapestLabel: string;
  minPrice: number;
};

export type ShopRankingRow = {
  rank: number;
  shop: string;
  total: number;
  deltaVsCheapest: number;
  isCheapest: boolean;
};

export type ExcludedCategoryNote = {
  category: string;
  status: string;
  note: string;
};

export type FiveShopBasket = {
  generatedAt: string;
  shops: string[];
  productCount: number;
  rows: BasketProductRow[];
  ranking: ShopRankingRow[];
  maxSavings: number;
  optimalBasketTotal: number;
  excludedNotes: ExcludedCategoryNote[];
};

export type CarrefourFamilyBasket = {
  generatedAt: string;
  shops: string[];
  rows: BasketProductRow[];
  totals: Record<string, number>;
  totalsWithoutVolaille: Record<string, number>;
  notes: string[];
};

export type EssentialBasketData = {
  fiveShop: FiveShopBasket;
  carrefourFamily: CarrefourFamilyBasket;
};

export type QoffaBasketItem = {
  category: string;
  name: string;
  choice: string;
  price: number;
  shop: string;
  productId: string;
};

type RawPriceRow = Record<string, string | number>;

function shopDisplayName(shop: string): string {
  if (shop === "Geant") return "Géant";
  return shop;
}

function normalizePrices(row: RawPriceRow, shops: readonly string[]): ShopPrice[] {
  return shops.map((shop) => ({
    shop,
    price: Number(row[shop] ?? 0),
    url: typeof row[`${shop} url`] === "string" && row[`${shop} url`]
      ? (row[`${shop} url`] as string)
      : null,
  }));
}

function normalizeRow(row: RawPriceRow, shops: readonly string[]): BasketProductRow {
  const prices = normalizePrices(row, shops);
  const minPrice = Math.min(...prices.map((p) => p.price));
  return {
    category: String(row.category ?? ""),
    choice: String(row.choice ?? ""),
    productId: String(row.product_id ?? ""),
    name: String(row.name ?? ""),
    brand: String(row.brand ?? ""),
    sourceCategory: String(row.source_category ?? row.category_source ?? ""),
    prices,
    cheapestLabel: String(row.cheapest ?? ""),
    minPrice,
  };
}

function normalizeRanking(
  ranking: Array<{ rank: number; shop: string; total: number; delta_vs_cheapest: number }>
): ShopRankingRow[] {
  return ranking.map((r) => ({
    rank: r.rank,
    shop: r.shop,
    total: r.total,
    deltaVsCheapest: r.delta_vs_cheapest,
    isCheapest: r.delta_vs_cheapest === 0,
  }));
}

function buildFiveShopBasket(): FiveShopBasket {
  const raw = fiveShopRaw as {
    generated_at: string;
    shops: string[];
    strict_all_5_basket: {
      rows: RawPriceRow[];
      ranking: Array<{ rank: number; shop: string; total: number; delta_vs_cheapest: number }>;
    };
    more_search: ExcludedCategoryNote[];
  };

  const rows = raw.strict_all_5_basket.rows.map((r) =>
    normalizeRow(r, FIVE_SHOP_NAMES)
  );
  const ranking = normalizeRanking(raw.strict_all_5_basket.ranking);
  const maxSavings = Math.max(...ranking.map((r) => r.deltaVsCheapest), 0);
  const optimalBasketTotal = rows.reduce((sum, r) => sum + r.minPrice, 0);

  return {
    generatedAt: raw.generated_at,
    shops: raw.shops,
    productCount: rows.length,
    rows,
    ranking,
    maxSavings,
    optimalBasketTotal: Math.round(optimalBasketTotal * 1000) / 1000,
    excludedNotes: raw.more_search ?? [],
  };
}

function buildCarrefourFamilyBasket(): CarrefourFamilyBasket {
  const raw = carrefourRaw as {
    generated_at: string;
    shops: string[];
    basket_rows: RawPriceRow[];
    totals: Record<string, number>;
    totals_without_volaille: Record<string, number>;
    notes: string[];
  };

  return {
    generatedAt: raw.generated_at,
    shops: raw.shops,
    rows: raw.basket_rows.map((r) => normalizeRow(r, CARREFOUR_FAMILY_SHOPS)),
    totals: raw.totals,
    totalsWithoutVolaille: raw.totals_without_volaille,
    notes: raw.notes ?? [],
  };
}

export function getEssentialBasketData(): EssentialBasketData {
  return {
    fiveShop: buildFiveShopBasket(),
    carrefourFamily: buildCarrefourFamilyBasket(),
  };
}

export function getQoffaBasketItems(): QoffaBasketItem[] {
  const { rows } = getEssentialBasketData().fiveShop;
  return rows.map((row) => {
    const cheapest = row.prices.filter((p) => p.price === row.minPrice);
    const shop =
      cheapest.length === 1
        ? shopDisplayName(cheapest[0].shop)
        : cheapest.map((p) => shopDisplayName(p.shop)).join(" · ");
    return {
      category: row.category,
      name: row.name,
      choice: row.choice,
      price: row.minPrice,
      shop,
      productId: row.productId,
    };
  });
}

export function fmtDt(n: number, decimals = 2): string {
  return n.toLocaleString("fr-FR", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
}

export function fmtDtDelta(n: number): string {
  if (n === 0) return "Meilleur prix";
  return `+${fmtDt(n)} DT`;
}

export function fmtDateFr(iso: string): string | null {
  try {
    return new Date(iso).toLocaleDateString("fr-FR", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  } catch {
    return null;
  }
}

export { shopDisplayName };

export const BASKET_CATEGORY_LABELS =
  "eau, lait, pâtes, tomate, café, fromage, jambon, volaille, huile, harissa";
