"use client";

import { Search, SlidersHorizontal } from "lucide-react";
import { CATALOG_SORT_OPTIONS, type CatalogSortOption } from "@/lib/catalogFilters";

export function CatalogListToolbar({
  search,
  onSearchChange,
  onSearchSubmit,
  sort,
  onSortChange,
  filterOpen,
  onFilterToggle,
  activeFilterCount,
  viewMode,
  onViewModeChange,
  showViewToggle = false,
}: {
  search: string;
  onSearchChange: (v: string) => void;
  onSearchSubmit: () => void;
  sort: CatalogSortOption;
  onSortChange: (v: CatalogSortOption) => void;
  filterOpen: boolean;
  onFilterToggle: () => void;
  activeFilterCount: number;
  viewMode?: "catalogue" | "similaires";
  onViewModeChange?: (v: "catalogue" | "similaires") => void;
  showViewToggle?: boolean;
}) {
  return (
    <div className="mx-auto max-w-[1600px] space-y-2 px-4">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          onSearchSubmit();
        }}
        className="flex gap-2"
      >
        <div className="relative min-w-0 flex-1">
          <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
          <input
            type="search"
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Titre, SKU ou référence produit…"
            className="w-full rounded-xl border border-slate-200 bg-white py-2 pl-8 pr-3 text-xs text-slate-900 placeholder:text-slate-400 focus:border-brand-gold/50 focus:outline-none focus:ring-1 focus:ring-brand-gold/30 dark:border-white/10 dark:bg-white/[0.04] dark:text-white dark:placeholder:text-white/30 sm:text-sm"
          />
        </div>
        <button
          type="button"
          onClick={onFilterToggle}
          className={`relative flex shrink-0 items-center gap-1.5 rounded-xl border px-3 py-2 text-xs font-bold transition ${
            filterOpen
              ? "border-brand-gold/50 bg-brand-gold/10 text-brand-gold"
              : "border-slate-200 bg-white text-slate-700 dark:border-white/10 dark:bg-white/[0.04] dark:text-white/80"
          }`}
        >
          <SlidersHorizontal className="h-3.5 w-3.5" />
          <span className="hidden sm:inline">Filtres</span>
          {activeFilterCount > 0 && (
            <span className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-brand-gold px-1 text-[9px] font-black text-black">
              {activeFilterCount}
            </span>
          )}
        </button>
      </form>

      <div className="flex flex-wrap items-center gap-2">
        {showViewToggle && onViewModeChange && (
          <div className="flex rounded-lg border border-slate-200 p-0.5 dark:border-white/10">
            {(["catalogue", "similaires"] as const).map((mode) => (
              <button
                key={mode}
                type="button"
                onClick={() => onViewModeChange(mode)}
                className={`rounded-md px-2.5 py-1 text-[10px] font-bold capitalize transition sm:text-[11px] ${
                  viewMode === mode
                    ? "bg-brand-gold/15 text-brand-gold"
                    : "text-slate-500 dark:text-white/50"
                }`}
              >
                {mode === "catalogue" ? "Catalogue" : "Similaires"}
              </button>
            ))}
          </div>
        )}
        <select
          value={sort}
          onChange={(e) => onSortChange(e.target.value as CatalogSortOption)}
          className="ml-auto rounded-lg border border-slate-200 bg-white px-2 py-1 text-[10px] font-semibold text-slate-700 dark:border-white/10 dark:bg-white/[0.04] dark:text-white/80 sm:text-[11px]"
        >
          {CATALOG_SORT_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}
