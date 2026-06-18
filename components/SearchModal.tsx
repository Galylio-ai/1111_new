"use client";
import { useEffect, useMemo, useRef, useState } from "react";
import { ArrowRight, Search, Sparkles, Star, TrendingDown, X } from "lucide-react";
import Link from "next/link";
import { topOffers } from "@/lib/data";

const trending = ["iPhone 15", "Climatiseur", "Samsung S25", "MacBook", "PlayStation 5", "Réfrigérateur", "Casque", "Apple Watch"];

function formatDT(n: number) {
  return new Intl.NumberFormat("fr-TN").format(n);
}

export function SearchModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [query, setQuery] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  // Focus the input and lock body scroll when opened
  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
      const t = setTimeout(() => inputRef.current?.focus(), 60);
      return () => {
        clearTimeout(t);
        document.body.style.overflow = "";
      };
    }
  }, [open]);

  // Esc to close
  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return topOffers.slice(0, 12);
    return topOffers.filter((p) => p.name.toLowerCase().includes(q));
  }, [query]);

  if (!open) return null;

  const heading = query.trim() ? `Résultats (${results.length})` : "Recommandés pour vous";

  return (
    <div
      className="search-overlay fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/50 p-2 backdrop-blur-md sm:p-4 dark:bg-black/70"
      onMouseDown={onClose}
    >
      <div
        className="search-panel flex h-full w-full max-w-[1500px] flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_30px_90px_-20px_rgba(0,0,0,0.55)] ring-1 ring-black/5 dark:border-white/10 dark:bg-bg-800 dark:ring-white/5"
        onMouseDown={(e) => e.stopPropagation()}
      >
        {/* gold hairline */}
        <div className="h-[3px] w-full shrink-0 bg-gradient-to-r from-transparent via-brand-gold to-transparent" />

        {/* Search input row */}
        <div className="flex shrink-0 items-center gap-3 border-b border-slate-200 px-5 py-4 sm:px-7 sm:py-5 dark:border-white/10">
          <Search className="h-6 w-6 shrink-0 text-brand-gold sm:h-7 sm:w-7" />
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Rechercher un produit, une marque, un magasin…"
            className="min-w-0 flex-1 bg-transparent text-lg text-slate-900 placeholder:text-slate-400 focus:outline-none sm:text-2xl dark:text-white dark:placeholder:text-white/40"
          />
          {query && (
            <button
              onClick={() => setQuery("")}
              className="hidden rounded-lg px-3 py-1.5 text-sm font-medium text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 sm:block dark:hover:bg-white/10 dark:hover:text-white/80"
            >
              Effacer
            </button>
          )}
          <button
            onClick={onClose}
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-slate-200 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 dark:border-white/10 dark:hover:bg-white/10 dark:hover:text-white"
            aria-label="Fermer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Trending chips (only when empty) */}
        {!query.trim() && (
          <div className="flex shrink-0 flex-wrap items-center gap-2 border-b border-slate-100 px-5 py-4 sm:px-7 dark:border-white/5">
            <span className="flex items-center gap-1.5 text-sm font-semibold uppercase tracking-wide text-slate-400 dark:text-white/40">
              <Sparkles className="h-4 w-4 text-brand-gold" /> Tendances
            </span>
            {trending.map((t) => (
              <button
                key={t}
                onClick={() => setQuery(t)}
                className="rounded-full border border-slate-200 bg-slate-50 px-4 py-1.5 text-sm font-medium text-slate-600 transition hover:border-brand-gold/50 hover:bg-brand-gold/10 hover:text-slate-900 dark:border-white/10 dark:bg-white/[0.04] dark:text-white/70 dark:hover:text-white"
              >
                {t}
              </button>
            ))}
          </div>
        )}

        {/* Results / recommendations */}
        <div className="flex-1 overflow-y-auto px-5 py-5 sm:px-7 sm:py-6">
          <div className="mb-4 flex items-center justify-between">
            <span className="text-sm font-bold uppercase tracking-wider text-slate-400 dark:text-white/40">
              {heading}
            </span>
            <Link
              href="/comparateur"
              onClick={onClose}
              className="flex items-center gap-1 text-sm font-semibold text-brand-gold transition hover:gap-2"
            >
              Tout voir <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          {results.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-3 py-24 text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-slate-100 dark:bg-white/5">
                <Search className="h-7 w-7 text-slate-400" />
              </div>
              <p className="text-lg font-semibold text-slate-600 dark:text-white/70">
                Aucun résultat pour « {query} »
              </p>
              <p className="text-sm text-slate-400 dark:text-white/40">Essayez un autre mot-clé</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4 xl:grid-cols-5">
              {results.map((p, i) => {
                const off = Math.round(((p.oldPrice - p.price) / p.oldPrice) * 100);
                return (
                  <Link
                    key={p.id}
                    href={`/produit/${p.id}`}
                    onClick={onClose}
                    style={{ animationDelay: `${i * 40}ms` }}
                    className="search-result group flex flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-1 hover:border-brand-gold/40 hover:shadow-[0_12px_30px_-10px_rgba(0,0,0,0.25)] dark:border-white/10 dark:bg-bg-900 dark:hover:border-brand-gold/40"
                  >
                    {/* Image */}
                    <div className="relative aspect-square w-full overflow-hidden bg-gradient-to-br from-slate-50 to-slate-100 dark:from-bg-700 dark:to-bg-800">
                      <img
                        src={p.image}
                        alt={p.name}
                        className="h-full w-full object-contain p-4 transition duration-300 group-hover:scale-110"
                      />
                      {off > 0 && (
                        <span className="absolute left-2.5 top-2.5 rounded-lg bg-brand-red px-2 py-1 text-xs font-black text-white shadow-md">
                          -{off}%
                        </span>
                      )}
                      <span className="absolute right-2.5 top-2.5 flex items-center gap-1 rounded-lg bg-white/90 px-2 py-1 text-xs font-bold text-slate-700 shadow-sm backdrop-blur dark:bg-black/60 dark:text-white">
                        <Star className="h-3.5 w-3.5 fill-brand-gold text-brand-gold" /> {p.rating}
                      </span>
                    </div>

                    {/* Details */}
                    <div className="flex flex-1 flex-col p-3.5">
                      <p className="line-clamp-2 min-h-[2.5rem] text-sm font-semibold leading-snug text-slate-900 dark:text-white">
                        {p.name}
                      </p>
                      <div className="mt-2 flex items-baseline gap-2">
                        <span className="text-lg font-black text-brand-red">{formatDT(p.price)} DT</span>
                        <span className="text-sm text-slate-400 line-through dark:text-white/40">{formatDT(p.oldPrice)}</span>
                      </div>
                      <div className="mt-2 flex items-center justify-between border-t border-slate-100 pt-2.5 text-xs dark:border-white/5">
                        <span className="font-medium text-slate-500 dark:text-white/50">{p.store}</span>
                        <span className="flex items-center gap-1 font-bold text-emerald-600 dark:text-emerald-400">
                          <TrendingDown className="h-3.5 w-3.5" /> -{formatDT(p.oldPrice - p.price)} DT
                        </span>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer hint */}
        <div className="flex shrink-0 items-center justify-between border-t border-slate-100 px-5 py-3 text-xs text-slate-400 sm:px-7 dark:border-white/5 dark:text-white/40">
          <span className="flex items-center gap-1.5">
            <kbd className="rounded border border-slate-200 bg-slate-50 px-1.5 py-0.5 font-sans font-semibold dark:border-white/10 dark:bg-white/5">Esc</kbd>
            pour fermer
          </span>
          <span className="flex items-center gap-1.5">
            <span className="live-dot" /> Mises à jour en temps réel
          </span>
        </div>
      </div>
    </div>
  );
}
