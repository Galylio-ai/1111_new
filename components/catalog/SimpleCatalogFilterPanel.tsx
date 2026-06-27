"use client";

import { FilterChip, FilterSectionLabel } from "@/components/catalog/CatalogFilterOverlay";
import { CatalogFilterOverlay } from "@/components/catalog/CatalogFilterOverlay";
import { CATALOG_SORT_OPTIONS, type CatalogSortOption } from "@/lib/catalogFilters";

export type SimpleCatalogFilterDraft = {
  shop: string;
  cat: string;
  minPrice: string;
  maxPrice: string;
  similar: boolean;
  sort: CatalogSortOption;
};

type ShopOption = { key: string; name: string };
type CatOption = { id: string; label: string };

function SectionLabel({ children }: { children: React.ReactNode }) {
  return <FilterSectionLabel>{children}</FilterSectionLabel>;
}

export function SimpleCatalogFilterPanel({
  open,
  onClose,
  title,
  draft,
  onChange,
  onApply,
  onReset,
  activeCount,
  shops,
  categories,
  showSimilarToggle = false,
}: {
  open: boolean;
  onClose: () => void;
  title?: string;
  draft: SimpleCatalogFilterDraft;
  onChange: (patch: Partial<SimpleCatalogFilterDraft>) => void;
  onApply: () => void;
  onReset: () => void;
  activeCount: number;
  shops: ShopOption[];
  categories?: CatOption[];
  showSimilarToggle?: boolean;
}) {
  return (
    <CatalogFilterOverlay
      open={open}
      onClose={onClose}
      title={title ?? "Filtres"}
      activeCount={activeCount}
      onApply={onApply}
      onReset={onReset}
    >
      <div className="grid gap-6 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <SectionLabel>Trier par</SectionLabel>
          <div className="flex flex-wrap gap-2">
            {CATALOG_SORT_OPTIONS.map((opt) => (
              <FilterChip
                key={opt.value}
                active={draft.sort === opt.value}
                onClick={() => onChange({ sort: opt.value })}
              >
                {opt.label}
              </FilterChip>
            ))}
          </div>
        </div>

        {showSimilarToggle && (
          <div>
            <SectionLabel>Type</SectionLabel>
            <div className="flex flex-wrap gap-2">
              <FilterChip active={!draft.similar} onClick={() => onChange({ similar: false })}>
                Catalogue
              </FilterChip>
              <FilterChip active={draft.similar} onClick={() => onChange({ similar: true })}>
                Similaires
              </FilterChip>
            </div>
          </div>
        )}

        <div>
          <SectionLabel>Prix (DT)</SectionLabel>
          <div className="flex items-center gap-2">
            <input
              type="number"
              min={0}
              placeholder="Min"
              value={draft.minPrice}
              onChange={(e) => onChange({ minPrice: e.target.value })}
              className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-brand-gold/50 dark:border-white/10 dark:bg-white/[0.04] dark:text-white"
            />
            <span className="text-slate-400">—</span>
            <input
              type="number"
              min={0}
              placeholder="Max"
              value={draft.maxPrice}
              onChange={(e) => onChange({ maxPrice: e.target.value })}
              className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-brand-gold/50 dark:border-white/10 dark:bg-white/[0.04] dark:text-white"
            />
          </div>
        </div>

        {categories && categories.length > 0 && (
          <div className="sm:col-span-2">
            <SectionLabel>Catégorie</SectionLabel>
            <div className="flex max-h-36 flex-wrap gap-2 overflow-y-auto pr-1">
              <FilterChip active={!draft.cat} onClick={() => onChange({ cat: "" })}>
                Toutes
              </FilterChip>
              {categories.map((c) => (
                <FilterChip
                  key={c.id}
                  active={draft.cat === c.id}
                  onClick={() => onChange({ cat: draft.cat === c.id ? "" : c.id })}
                >
                  {c.label}
                </FilterChip>
              ))}
            </div>
          </div>
        )}

        <div className="sm:col-span-2">
          <SectionLabel>Enseigne</SectionLabel>
          <div className="flex max-h-36 flex-wrap gap-2 overflow-y-auto pr-1">
            <FilterChip active={!draft.shop} onClick={() => onChange({ shop: "" })}>
              Toutes
            </FilterChip>
            {shops.map((s) => (
              <FilterChip
                key={s.key}
                active={draft.shop === s.key}
                onClick={() => onChange({ shop: draft.shop === s.key ? "" : s.key })}
              >
                {s.name}
              </FilterChip>
            ))}
          </div>
        </div>
      </div>
    </CatalogFilterOverlay>
  );
}

export function countSimpleCatalogFilters(d: SimpleCatalogFilterDraft): number {
  let n = 0;
  if (d.shop) n++;
  if (d.cat) n++;
  if (d.minPrice) n++;
  if (d.maxPrice) n++;
  if (d.similar) n++;
  return n;
}
