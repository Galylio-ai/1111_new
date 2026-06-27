"use client";

import { useEffect, useMemo, useState } from "react";
import { SlidersHorizontal } from "lucide-react";
import { CatalogFilterOverlay, FilterChip } from "@/components/catalog/CatalogFilterOverlay";
import { getMagasinsNavCategories, slugsForTop } from "@/lib/retailCategories";
import { RETAIL_SORT_OPTIONS, type RetailSortOption } from "@/lib/retailProductQuery";

export type RetailFilterDraft = {
  cat: string;
  shop: string;
  brand: string;
  minPrice: string;
  maxPrice: string;
  specRam: string;
  specStorage: string;
  specScreen: string;
  matched: "" | "true" | "false";
  sort: RetailSortOption;
};

type FilterFacets = {
  price: { min: number; max: number };
  brands: { name: string; count: number }[];
  specs: Record<
    string,
    { label: string; param: string; values: { value: string; count: number }[] }
  >;
};

type ShopOption = { key: string; name: string };

const CATEGORY_OPTIONS = getMagasinsNavCategories()
  .map((top) => ({
    slug: slugsForTop(top.id),
    label: top.shortLabel,
  }))
  .filter((c) => c.slug);

function Chip({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <FilterChip active={active} onClick={onClick}>
      {children}
    </FilterChip>
  );
}

export function RetailFilterPanel({
  open,
  onClose,
  draft,
  onChange,
  onApply,
  onReset,
  activeCount,
  shops,
  facetQuery,
  hasSearch,
}: {
  open: boolean;
  onClose: () => void;
  draft: RetailFilterDraft;
  onChange: (patch: Partial<RetailFilterDraft>) => void;
  onApply: () => void;
  onReset: () => void;
  activeCount: number;
  shops: ShopOption[];
  facetQuery: string;
  hasSearch: boolean;
}) {
  const [facets, setFacets] = useState<FilterFacets | null>(null);
  const [loadingFacets, setLoadingFacets] = useState(false);

  useEffect(() => {
    if (!open) return;
    setLoadingFacets(true);
    fetch(`/api/retail-products/filters?${facetQuery}`)
      .then((r) => (r.ok ? r.json() : null))
      .then((j) => {
        if (j) setFacets(j);
      })
      .catch(() => {})
      .finally(() => setLoadingFacets(false));
  }, [open, facetQuery]);

  const priceBounds = facets?.price ?? { min: 0, max: 0 };

  const matchedOptions = useMemo(
    () => [
      { value: "" as const, label: "Tous" },
      { value: "false" as const, label: "Catalogue" },
      { value: "true" as const, label: "Similaires" },
    ],
    [],
  );

  const sortOptions = useMemo(
    () => RETAIL_SORT_OPTIONS.filter((o) => !("searchOnly" in o && o.searchOnly) || hasSearch),
    [hasSearch],
  );

  if (!open) return null;

  return (
    <CatalogFilterOverlay
      open={open}
      onClose={onClose}
      title="Filtres retail"
      activeCount={activeCount}
      onApply={onApply}
      onReset={onReset}
    >
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {/* Sort */}
          <div className="sm:col-span-2 lg:col-span-3">
            <p className="mb-1.5 text-[9px] font-bold uppercase tracking-wider text-slate-400 dark:text-white/40">
              Trier par
            </p>
            <div className="flex flex-wrap gap-1">
              {sortOptions.map((opt) => (
                <Chip
                  key={opt.value}
                  active={draft.sort === opt.value}
                  onClick={() => onChange({ sort: opt.value })}
                >
                  {opt.label}
                </Chip>
              ))}
            </div>
          </div>

          {/* Type */}
          <div>
            <p className="mb-1.5 text-[9px] font-bold uppercase tracking-wider text-slate-400 dark:text-white/40">
              Type de produit
            </p>
            <div className="flex flex-wrap gap-1">
              {matchedOptions.map((opt) => (
                <Chip
                  key={opt.label}
                  active={draft.matched === opt.value}
                  onClick={() => onChange({ matched: opt.value })}
                >
                  {opt.label}
                </Chip>
              ))}
            </div>
          </div>

          {/* Price */}
          <div>
            <p className="mb-1.5 text-[9px] font-bold uppercase tracking-wider text-slate-400 dark:text-white/40">
              Prix (DT)
            </p>
            <div className="flex items-center gap-2">
              <input
                type="number"
                min={0}
                placeholder={String(priceBounds.min)}
                value={draft.minPrice}
                onChange={(e) => onChange({ minPrice: e.target.value })}
                className="w-full rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs outline-none focus:border-brand-gold/50 dark:border-white/10 dark:bg-white/[0.04] dark:text-white"
              />
              <span className="text-slate-400">—</span>
              <input
                type="number"
                min={0}
                placeholder={String(priceBounds.max)}
                value={draft.maxPrice}
                onChange={(e) => onChange({ maxPrice: e.target.value })}
                className="w-full rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs outline-none focus:border-brand-gold/50 dark:border-white/10 dark:bg-white/[0.04] dark:text-white"
              />
            </div>
            {priceBounds.max > 0 && (
              <p className="mt-1 text-[10px] text-slate-400 dark:text-white/35">
                {priceBounds.min.toLocaleString("fr-FR")} – {priceBounds.max.toLocaleString("fr-FR")} DT
              </p>
            )}
          </div>

          {/* Categories */}
          <div className="sm:col-span-2 lg:col-span-1">
            <p className="mb-1.5 text-[9px] font-bold uppercase tracking-wider text-slate-400 dark:text-white/40">
              Catégorie
            </p>
            <div className="flex max-h-24 flex-wrap gap-1 overflow-y-auto">
              <Chip active={!draft.cat} onClick={() => onChange({ cat: "" })}>
                Toutes
              </Chip>
              {CATEGORY_OPTIONS.map((c) => (
                <Chip
                  key={c.slug}
                  active={draft.cat === c.slug}
                  onClick={() => onChange({ cat: draft.cat === c.slug ? "" : c.slug })}
                >
                  {c.label}
                </Chip>
              ))}
            </div>
          </div>

          {/* Brands */}
          <div className="sm:col-span-2">
            <p className="mb-1.5 text-[9px] font-bold uppercase tracking-wider text-slate-400 dark:text-white/40">
              Marque
            </p>
            <div className="flex max-h-24 flex-wrap gap-1 overflow-y-auto">
              <Chip active={!draft.brand} onClick={() => onChange({ brand: "" })}>
                Toutes
              </Chip>
              {(facets?.brands ?? []).map((b) => (
                <Chip
                  key={b.name}
                  active={draft.brand === b.name}
                  onClick={() => onChange({ brand: draft.brand === b.name ? "" : b.name })}
                >
                  {b.name}
                  <span className="ml-1 opacity-50">({b.count})</span>
                </Chip>
              ))}
              {loadingFacets && !facets && (
                <span className="text-[11px] text-slate-400">Chargement…</span>
              )}
            </div>
          </div>

          {/* Shops */}
          <div className="sm:col-span-2">
            <p className="mb-1.5 text-[9px] font-bold uppercase tracking-wider text-slate-400 dark:text-white/40">
              Enseigne
            </p>
            <div className="flex max-h-24 flex-wrap gap-1 overflow-y-auto">
              <Chip active={!draft.shop} onClick={() => onChange({ shop: "" })}>
                Toutes
              </Chip>
              {shops.slice(0, 30).map((s) => (
                <Chip
                  key={s.key}
                  active={draft.shop === s.key}
                  onClick={() => onChange({ shop: draft.shop === s.key ? "" : s.key })}
                >
                  {s.name}
                </Chip>
              ))}
            </div>
          </div>

          {/* Spec filters */}
          {facets &&
            Object.entries(facets.specs).map(([id, group]) =>
              group.values.length > 0 ? (
                <div key={id} className="sm:col-span-2 lg:col-span-1">
                  <p className="mb-1.5 text-[9px] font-bold uppercase tracking-wider text-slate-400 dark:text-white/40">
                    {group.label}
                  </p>
                  <div className="flex flex-wrap gap-1">
                    <Chip
                      active={
                        (id === "ram" && !draft.specRam) ||
                        (id === "storage" && !draft.specStorage) ||
                        (id === "screen" && !draft.specScreen)
                      }
                      onClick={() => {
                        if (id === "ram") onChange({ specRam: "" });
                        if (id === "storage") onChange({ specStorage: "" });
                        if (id === "screen") onChange({ specScreen: "" });
                      }}
                    >
                      Tous
                    </Chip>
                    {group.values.map((v) => {
                      const active =
                        (id === "ram" && draft.specRam === v.value) ||
                        (id === "storage" && draft.specStorage === v.value) ||
                        (id === "screen" && draft.specScreen === v.value);
                      return (
                        <Chip
                          key={v.value}
                          active={active}
                          onClick={() => {
                            if (id === "ram") {
                              onChange({ specRam: draft.specRam === v.value ? "" : v.value });
                            } else if (id === "storage") {
                              onChange({ specStorage: draft.specStorage === v.value ? "" : v.value });
                            } else {
                              onChange({ specScreen: draft.specScreen === v.value ? "" : v.value });
                            }
                          }}
                        >
                          {v.value}
                        </Chip>
                      );
                    })}
                  </div>
                </div>
              ) : null,
            )}
        </div>
    </CatalogFilterOverlay>
  );
}

export function RetailSortSelect({
  value,
  onChange,
  hasSearch,
  className = "",
}: {
  value: RetailSortOption;
  onChange: (sort: RetailSortOption) => void;
  hasSearch: boolean;
  className?: string;
}) {
  const options = RETAIL_SORT_OPTIONS.filter(
    (o) => !("searchOnly" in o && o.searchOnly) || hasSearch,
  );

  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value as RetailSortOption)}
      className={`rounded-xl border border-slate-300 bg-white py-2 pl-2.5 pr-7 text-xs font-semibold text-slate-700 outline-none transition focus:border-brand-gold/50 dark:border-white/10 dark:bg-white/[0.06] dark:text-white ${className}`}
      aria-label="Trier les produits"
    >
      {options.map((o) => (
        <option key={o.value} value={o.value}>
          {o.label}
        </option>
      ))}
    </select>
  );
}

export function RetailFilterButton({
  onClick,
  activeCount,
}: {
  onClick: () => void;
  activeCount: number;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="relative flex shrink-0 items-center gap-2 rounded-xl border border-slate-300 bg-white px-3.5 py-2 text-sm font-semibold text-slate-700 transition hover:border-brand-gold/40 dark:border-white/10 dark:bg-white/[0.06] dark:text-white"
    >
      <SlidersHorizontal className="h-4 w-4" />
      Filtres
      {activeCount > 0 && (
        <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-brand-gold px-1 text-[10px] font-black text-black">
          {activeCount}
        </span>
      )}
    </button>
  );
}
