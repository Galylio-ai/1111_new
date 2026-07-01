"use client";

import { Search, SlidersHorizontal, X } from "lucide-react";
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
    <div className="mx-auto max-w-[1600px] space-y-3 px-4">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          onSearchSubmit();
        }}
        className="flex gap-2.5"
      >
        {/* Search input */}
        <div className="group relative min-w-0 flex-1">
          {/* glow ring behind input on focus */}
          <div className="pointer-events-none absolute inset-0 rounded-2xl opacity-0 transition-opacity duration-300 group-focus-within:opacity-100 [box-shadow:0_0_0_3px_rgba(246,196,83,0.18),0_4px_24px_-4px_rgba(246,196,83,0.25)]" />
          <Search className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400 transition-colors duration-200 group-focus-within:text-brand-gold dark:text-white/30" />
          <input
            type="search"
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Rechercher un produit, marque ou référence…"
            className="w-full rounded-2xl border border-slate-200 bg-white py-3.5 pl-11 pr-10 text-sm font-medium text-slate-900 placeholder:text-slate-400 transition-all duration-200 focus:border-brand-gold/50 focus:outline-none dark:border-white/10 dark:bg-white/[0.06] dark:text-white dark:placeholder:text-white/30 dark:focus:border-brand-gold/40 sm:text-base"
          />
          {search && (
            <button
              type="button"
              onClick={() => onSearchChange("")}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 rounded-full p-0.5 text-slate-400 transition hover:text-slate-700 dark:text-white/30 dark:hover:text-white/70"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        {/* Filter button */}
        <button
          type="button"
          onClick={onFilterToggle}
          className={`relative flex shrink-0 items-center gap-2 rounded-2xl border px-4 py-3.5 text-sm font-bold transition-all duration-200 ${
            filterOpen
              ? "border-brand-gold/50 bg-brand-gold/10 text-brand-gold shadow-[0_0_0_2px_rgba(246,196,83,0.2)]"
              : "border-slate-200 bg-white text-slate-700 hover:border-brand-gold/30 hover:text-brand-gold dark:border-white/10 dark:bg-white/[0.06] dark:text-white/80 dark:hover:border-brand-gold/30"
          }`}
        >
          <SlidersHorizontal className="h-4 w-4" />
          <span className="hidden sm:inline">Filtres</span>
          {activeFilterCount > 0 && (
            <span className="absolute -right-1.5 -top-1.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-brand-gold px-1 text-[10px] font-black text-black shadow">
              {activeFilterCount}
            </span>
          )}
        </button>
      </form>

      <div className="flex flex-wrap items-center gap-2">
        {showViewToggle && onViewModeChange && (
          <div className="flex rounded-xl border border-slate-200 p-0.5 dark:border-white/10">
            {(["catalogue", "similaires"] as const).map((mode) => (
              <button
                key={mode}
                type="button"
                onClick={() => onViewModeChange(mode)}
                className={`rounded-lg px-3 py-1.5 text-[11px] font-bold capitalize transition sm:text-xs ${
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
          className="ml-auto rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 transition hover:border-brand-gold/30 dark:border-white/10 dark:bg-[#0d1220] dark:text-white/90 sm:text-[11px]"
        >
          {CATALOG_SORT_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value} className="bg-white text-slate-900 dark:bg-[#0d1220] dark:text-white">
              {opt.label}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}
