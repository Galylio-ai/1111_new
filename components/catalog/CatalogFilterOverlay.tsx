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
      className={`rounded-full border px-2 py-0.5 text-[10px] font-semibold transition sm:px-2.5 sm:py-1 sm:text-[11px] ${
        active
          ? "border-brand-gold/50 bg-brand-gold/15 text-brand-gold"
          : "border-slate-200 bg-white text-slate-600 hover:border-brand-gold/30 dark:border-white/10 dark:bg-white/[0.04] dark:text-white/70"
      }`}
    >
      {children}
    </button>
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
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  if (!open || !mounted) return null;

  return createPortal(
    <>
      <button
        type="button"
        aria-label="Fermer les filtres"
        className="fixed inset-0 z-[90] bg-black/50 backdrop-blur-[2px] animate-in fade-in duration-200"
        onClick={onClose}
      />
      <div className="fixed inset-x-0 top-[3.75rem] z-[100] mx-auto max-h-[min(78vh,540px)] w-full max-w-[1600px] px-3 sm:top-16 sm:px-4">
        <div
          role="dialog"
          aria-modal="true"
          className="flex max-h-[inherit] flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl dark:border-white/10 dark:bg-[#0f1422]"
        >
          <div className="flex shrink-0 items-center justify-between border-b border-slate-100 px-3 py-2.5 dark:border-white/[0.06] sm:px-4">
            <div className="flex items-center gap-2">
              <SlidersHorizontal className="h-4 w-4 text-brand-gold" />
              <h3 className="text-sm font-black text-slate-900 dark:text-white">{title}</h3>
              {activeCount > 0 && (
                <span className="rounded-full bg-brand-gold/20 px-1.5 py-0.5 text-[10px] font-bold text-brand-gold">
                  {activeCount}
                </span>
              )}
            </div>
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg p-1 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-white/10 dark:hover:text-white"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <div className="min-h-0 flex-1 overflow-y-auto px-3 py-3 sm:px-4">{children}</div>

          <div className="flex shrink-0 items-center justify-end gap-2 border-t border-slate-100 px-3 py-2.5 dark:border-white/[0.06] sm:px-4">
            <button
              type="button"
              onClick={onReset}
              className="rounded-lg px-3 py-1.5 text-xs font-semibold text-slate-500 transition hover:text-slate-800 dark:text-white/50 dark:hover:text-white"
            >
              Réinitialiser
            </button>
            <button
              type="button"
              onClick={onApply}
              className="rounded-lg bg-brand-gold px-4 py-1.5 text-xs font-bold text-black shadow transition hover:brightness-105"
            >
              Appliquer
            </button>
          </div>
        </div>
      </div>
    </>,
    document.body,
  );
}
