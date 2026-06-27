import { normalizeSearchText, slugifySearch, SKU_SPEC_KEYS } from "@/lib/productSearch";

export const RETAIL_FILTER_SPECS = [
  {
    id: "ram",
    param: "spec_ram",
    keys: ["ram", "memory", "mémoire", "memoire"],
    label: "Mémoire RAM",
  },
  {
    id: "storage",
    param: "spec_storage",
    keys: ["storage", "stockage"],
    label: "Stockage",
  },
  {
    id: "screen",
    param: "spec_screen",
    keys: ["screen_size", "taille_ecran", "screen", "taille écran"],
    label: "Taille écran",
  },
] as const;

export const RETAIL_SORT_OPTIONS = [
  { value: "price_asc", label: "Prix croissant" },
  { value: "price_desc", label: "Prix décroissant" },
  { value: "shops_desc", label: "Plus de boutiques" },
  { value: "shops_asc", label: "Moins de boutiques" },
  { value: "name_asc", label: "Nom A → Z" },
  { value: "name_desc", label: "Nom Z → A" },
  { value: "relevance", label: "Pertinence", searchOnly: true },
] as const;

export type RetailSortOption = (typeof RETAIL_SORT_OPTIONS)[number]["value"];

const VALID_SORTS = new Set<string>(RETAIL_SORT_OPTIONS.map((o) => o.value));

export type RetailListFilters = {
  cat: string;
  q: string;
  shop: string;
  matched: string | null;
  brand: string;
  minPrice: number | null;
  maxPrice: number | null;
  specRam: string;
  specStorage: string;
  specScreen: string;
  sort: RetailSortOption;
};

export function parseRetailListFilters(sp: URLSearchParams): RetailListFilters {
  const minRaw = sp.get("min");
  const maxRaw = sp.get("max");
  const minPrice = minRaw != null && minRaw !== "" ? parseFloat(minRaw) : null;
  const maxPrice = maxRaw != null && maxRaw !== "" ? parseFloat(maxRaw) : null;

  const sortRaw = sp.get("sort") ?? "price_asc";

  return {
    cat: (sp.get("cat") ?? "").trim().toLowerCase(),
    q: normalizeSearchText(sp.get("q") ?? ""),
    shop: (sp.get("shop") ?? "").trim().toLowerCase(),
    matched: sp.get("matched"),
    brand: (sp.get("brand") ?? "").trim(),
    minPrice: Number.isFinite(minPrice) ? minPrice : null,
    maxPrice: Number.isFinite(maxPrice) ? maxPrice : null,
    specRam: (sp.get("spec_ram") ?? "").trim(),
    specStorage: (sp.get("spec_storage") ?? "").trim(),
    specScreen: (sp.get("spec_screen") ?? "").trim(),
    sort: VALID_SORTS.has(sortRaw) ? (sortRaw as RetailSortOption) : "price_asc",
  };
}

export function countActiveRetailFilters(f: RetailListFilters): number {
  let n = 0;
  if (f.cat) n++;
  if (f.shop) n++;
  if (f.brand) n++;
  if (f.minPrice != null) n++;
  if (f.maxPrice != null) n++;
  if (f.specRam) n++;
  if (f.specStorage) n++;
  if (f.specScreen) n++;
  if (f.matched === "true" || f.matched === "false") n++;
  return n;
}

const BASE_JOINS = `
  FROM products p
  LEFT JOIN brands b ON b.id = p.brand_id
  LEFT JOIN product_subcategories psc ON psc.product_id = p.id
  LEFT JOIN subcategories sc ON sc.id = psc.subcategory_id
  LEFT JOIN low_categories lc ON lc.id = sc.low_category_id
  LEFT JOIN top_categories tc ON tc.id = lc.top_category_id
  LEFT JOIN shop_prices sp ON sp.product_id = p.id
  LEFT JOIN shops s ON s.id = sp.shop_id
`;

function resolveRetailOrderBy(sort: RetailSortOption, searchRelevanceOrder: string | null): string {
  const priceAsc = "MIN(sp.current_price) ASC NULLS LAST, p.name ASC";
  const priceDesc = "MIN(sp.current_price) DESC NULLS LAST, p.name ASC";

  if (sort === "relevance" && searchRelevanceOrder) {
    return `${searchRelevanceOrder}, ${priceAsc}`;
  }

  switch (sort) {
    case "price_desc":
      return priceDesc;
    case "shops_desc":
      return "COUNT(DISTINCT s.shop_key) DESC, MIN(sp.current_price) ASC NULLS LAST";
    case "shops_asc":
      return "COUNT(DISTINCT s.shop_key) ASC, MIN(sp.current_price) ASC NULLS LAST";
    case "name_asc":
      return "p.name ASC";
    case "name_desc":
      return "p.name DESC";
    case "price_asc":
    default:
      if (searchRelevanceOrder) {
        return `${searchRelevanceOrder}, ${priceAsc}`;
      }
      return priceAsc;
  }
}

export function buildRetailProductQuery(filters: RetailListFilters) {
  const conditions: string[] = [];
  const having: string[] = [];
  const params: (string | number | boolean | string[])[] = [];
  let searchRelevanceOrder: string | null = null;

  if (filters.matched === "true") {
    conditions.push("p.is_matched = TRUE");
  } else if (filters.matched === "false") {
    conditions.push("p.is_matched = FALSE");
  }

  if (filters.cat) {
    const slugs = filters.cat.split(",").map((s) => s.trim()).filter(Boolean);
    if (slugs.length === 1) {
      params.push(slugs[0]);
      conditions.push(
        `(tc.slug = $${params.length} OR lc.slug = $${params.length} OR sc.slug = $${params.length})`,
      );
    } else if (slugs.length > 1) {
      const placeholders = slugs.map((slug) => {
        params.push(slug);
        return `$${params.length}`;
      });
      const inList = placeholders.join(",");
      conditions.push(`(tc.slug IN (${inList}) OR lc.slug IN (${inList}) OR sc.slug IN (${inList}))`);
    }
  }

  if (filters.q) {
    const qLower = filters.q.toLowerCase();
    const slugQ = slugifySearch(filters.q);
    const like = `%${qLower}%`;
    const prefix = `${qLower}%`;
    params.push(qLower, slugQ, like, SKU_SPEC_KEYS, prefix);
    const qIdx = params.length - 4;
    const slugIdx = params.length - 3;
    const likeIdx = params.length - 2;
    const skuKeysIdx = params.length - 1;
    const prefixIdx = params.length;

    conditions.push(`(
      lower(regexp_replace(trim(p.name), '\\s+', ' ', 'g')) = $${qIdx}
      OR lower(coalesce(p.source_product_id, '')) = $${qIdx}
      OR lower(p.slug) = $${slugIdx}
      OR lower(p.name) LIKE $${likeIdx}
      OR lower(coalesce(b.name, '')) LIKE $${likeIdx}
      OR lower(coalesce(p.source_product_id, '')) LIKE $${likeIdx}
      OR EXISTS (
        SELECT 1 FROM product_specs ps_q
        WHERE ps_q.product_id = p.id
          AND (
            lower(ps_q.spec_value) = $${qIdx}
            OR (ps_q.spec_key = ANY($${skuKeysIdx}::text[]) AND lower(ps_q.spec_value) LIKE $${likeIdx})
          )
      )
    )`);

    searchRelevanceOrder = `
      MIN(
        CASE
          WHEN lower(regexp_replace(trim(p.name), '\\s+', ' ', 'g')) = $${qIdx} THEN 0
          WHEN lower(coalesce(p.source_product_id, '')) = $${qIdx} THEN 1
          WHEN lower(p.slug) = $${slugIdx} THEN 2
          WHEN EXISTS (
            SELECT 1 FROM product_specs ps_r
            WHERE ps_r.product_id = p.id AND lower(ps_r.spec_value) = $${qIdx}
          ) THEN 3
          WHEN lower(p.name) LIKE $${prefixIdx} THEN 4
          WHEN lower(p.name) LIKE $${likeIdx} THEN 5
          WHEN lower(coalesce(b.name, '')) LIKE $${likeIdx} THEN 6
          WHEN lower(coalesce(p.source_product_id, '')) LIKE $${likeIdx} THEN 7
          WHEN EXISTS (
            SELECT 1 FROM product_specs ps_r
            WHERE ps_r.product_id = p.id
              AND ps_r.spec_key = ANY($${skuKeysIdx}::text[])
              AND lower(ps_r.spec_value) LIKE $${likeIdx}
          ) THEN 8
          ELSE 9
        END
      ) ASC,
      length(p.name) ASC,
      p.name ASC
    `;
  }

  if (filters.shop) {
    params.push(filters.shop);
    conditions.push(`p.id IN (
      SELECT sp2.product_id FROM shop_prices sp2
      JOIN shops s2 ON s2.id = sp2.shop_id
      WHERE s2.shop_key = $${params.length}
    )`);
  }

  if (filters.brand) {
    params.push(filters.brand.toLowerCase());
    conditions.push(`lower(b.name) = $${params.length}`);
  }

  const specValues: { keys: readonly string[]; value: string }[] = [
    { keys: RETAIL_FILTER_SPECS[0].keys, value: filters.specRam },
    { keys: RETAIL_FILTER_SPECS[1].keys, value: filters.specStorage },
    { keys: RETAIL_FILTER_SPECS[2].keys, value: filters.specScreen },
  ];

  for (const spec of specValues) {
    if (!spec.value) continue;
    params.push([...spec.keys], spec.value.toLowerCase());
    const keysIdx = params.length - 1;
    const valIdx = params.length;
    conditions.push(`EXISTS (
      SELECT 1 FROM product_specs ps_f
      WHERE ps_f.product_id = p.id
        AND ps_f.spec_key = ANY($${keysIdx}::text[])
        AND lower(ps_f.spec_value) = $${valIdx}
    )`);
  }

  if (filters.minPrice != null) {
    params.push(filters.minPrice);
    having.push(`MIN(sp.current_price) >= $${params.length}`);
  }
  if (filters.maxPrice != null) {
    params.push(filters.maxPrice);
    having.push(`MIN(sp.current_price) <= $${params.length}`);
  }

  const where = conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";
  const havingClause = having.length > 0 ? `HAVING ${having.join(" AND ")}` : "";
  const orderBy = resolveRetailOrderBy(filters.sort, searchRelevanceOrder);

  return {
    baseJoins: BASE_JOINS,
    where,
    having: havingClause,
    params,
    orderBy,
  };
}

export function buildRetailContextWhere(filters: RetailListFilters) {
  const clone = { ...filters, brand: "", minPrice: null, maxPrice: null, specRam: "", specStorage: "", specScreen: "" };
  const { where, params } = buildRetailProductQuery(clone);
  return { where, params };
}
