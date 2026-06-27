export const CATALOG_SORT_OPTIONS = [
  { value: "price_desc", label: "Prix décroissant" },
  { value: "price_asc", label: "Prix croissant" },
  { value: "shops_desc", label: "Plus de boutiques" },
  { value: "name_asc", label: "Nom A → Z" },
] as const;

export type CatalogSortOption = (typeof CATALOG_SORT_OPTIONS)[number]["value"];

export const DEFAULT_CATALOG_SORT: CatalogSortOption = "price_desc";

const VALID = new Set<string>(CATALOG_SORT_OPTIONS.map((o) => o.value));

export function parseCatalogSort(raw: string | null | undefined): CatalogSortOption {
  if (raw && VALID.has(raw)) return raw as CatalogSortOption;
  return DEFAULT_CATALOG_SORT;
}

export function catalogSortSql(sort: CatalogSortOption, priceCol = "MIN(sp.current_price)"): string {
  switch (sort) {
    case "price_asc":
      return `${priceCol} ASC NULLS LAST, p.name ASC`;
    case "shops_desc":
      return "COUNT(DISTINCT s.id) DESC, MIN(sp.current_price) DESC NULLS LAST";
    case "name_asc":
      return "p.name ASC";
    case "price_desc":
    default:
      return `${priceCol} DESC NULLS LAST, p.name ASC`;
  }
}

export function sortCatalogItems<T extends { minPrice: number; name: string; shopNames?: string[] }>(
  items: T[],
  sort: CatalogSortOption,
): T[] {
  const copy = [...items];
  switch (sort) {
    case "price_asc":
      return copy.sort((a, b) => a.minPrice - b.minPrice || a.name.localeCompare(b.name, "fr"));
    case "shops_desc":
      return copy.sort(
        (a, b) =>
          (b.shopNames?.length ?? 0) - (a.shopNames?.length ?? 0) ||
          b.minPrice - a.minPrice,
      );
    case "name_asc":
      return copy.sort((a, b) => a.name.localeCompare(b.name, "fr"));
    case "price_desc":
    default:
      return copy.sort((a, b) => b.minPrice - a.minPrice || a.name.localeCompare(b.name, "fr"));
  }
}
