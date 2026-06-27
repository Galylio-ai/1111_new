"use client";

import { createPortal } from "react-dom";
import { useEffect, useState } from "react";
import { SlidersHorizontal, X } from "lucide-react";

export function FilterChip({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-xl border px-3 py-1.5 text-xs font-semibold transition sm:px-3.5 sm:py-2 sm:text-sm ${
        active
          ? "border-brand-gold/60 bg-brand-gold/15 text-brand-gold shadow-[0_0_0_1px_rgba(246,196,83,0.2)]"
          : "border-slate-200 bg-slate-50 text-slate-700 hover:border-brand-gold/35 hover:bg-white dark:border-white/10 dark:bg-white/[0.05] dark:text-white/80 dark:hover:border-brand-gold/30"
      }`}
    >
      {children}
    </button>
  );
}

export function FilterSectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="mb-2.5 text-[11px] font-bold uppercase tracking-[0.14em] text-slate-500 dark:text-white/45">
      {children}
    </p>
  );
}

export function CatalogFilterOverlay({
  open,
  onClose,
  title = "Filtres",
  activeCount,
  onApply,
  onReset,
  children,
}: {
  open: boolean;
  onClose: () => void;
  title?: string;
  activeCount: number;
  onApply: () => void;
  onReset: () => void;
  children: React.ReactNode;
}) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [open, onClose]);

  if (!open || !mounted) return null;

  return createPortal(
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 sm:p-6">
      <button
        type="button"
        aria-label="Fermer les filtres"
        className="absolute inset-0 bg-slate-950/70 backdrop-blur-md animate-in fade-in duration-200"
        onClick={onClose}
      />

      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="catalog-filter-title"
        className="relative z-10 flex max-h-[min(92vh,760px)] w-full max-w-3xl flex-col overflow-hidden rounded-3xl border border-slate-200/80 bg-white shadow-[0_24px_80px_-12px_rgba(0,0,0,0.45)] animate-in zoom-in-95 fade-in duration-200 dark:border-white/10 dark:bg-[#0c101c] lg:max-w-4xl xl:max-w-5xl"
      >
        <div className="flex shrink-0 items-center justify-between border-b border-slate-100 bg-gradient-to-r from-slate-50 to-white px-5 py-4 dark:border-white/[0.06] dark:from-white/[0.03] dark:to-transparent sm:px-6">
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-brand-gold/15 text-brand-gold ring-1 ring-brand-gold/25">
              <SlidersHorizontal className="h-5 w-5" />
            </span>
            <div>
              <h3 id="catalog-filter-title" className="text-base font-black text-slate-900 sm:text-lg dark:text-white">
                {title}
              </h3>
              <p className="text-xs text-slate-500 dark:text-white/45">Affinez votre recherche</p>
            </div>
            {activeCount > 0 && (
              <span className="rounded-full bg-brand-gold px-2.5 py-1 text-xs font-black text-black">
                {activeCount} actif{activeCount > 1 ? "s" : ""}
              </span>
            )}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-white/10 dark:hover:text-white"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto px-5 py-5 sm:px-6 sm:py-6">{children}</div>

        <div className="flex shrink-0 items-center justify-between gap-3 border-t border-slate-100 bg-slate-50/80 px-5 py-4 dark:border-white/[0.06] dark:bg-white/[0.02] sm:px-6">
          <button
            type="button"
            onClick={onReset}
            className="rounded-xl px-4 py-2.5 text-sm font-semibold text-slate-500 transition hover:bg-white hover:text-slate-800 dark:text-white/50 dark:hover:bg-white/10 dark:hover:text-white"
          >
            Réinitialiser
          </button>
          <button
            type="button"
            onClick={onApply}
            className="rounded-xl bg-brand-gold px-6 py-2.5 text-sm font-bold text-black shadow-lg shadow-brand-gold/20 transition hover:brightness-105"
          >
            Appliquer les filtres
          </button>
        </div>
      </div>
    </div>,
    document.body,
  );
}
