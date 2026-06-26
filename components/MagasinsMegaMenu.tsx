"use client";

import { getMagasinsNavCategories, retailCatHref, slugsForTop } from "@/lib/retailCategories";
import { ArrowRight, ChevronRight } from "lucide-react";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";

const NAV_CATEGORIES = getMagasinsNavCategories();

export function MagasinsMegaMenu({ onClose }: { onClose: () => void }) {
  const [activeId, setActiveId] = useState(NAV_CATEGORIES[0]?.id ?? "");
  const menuRef = useRef<HTMLDivElement>(null);

  const active = NAV_CATEGORIES.find((c) => c.id === activeId) ?? NAV_CATEGORIES[0];
  const mappedSubs = active?.subs.filter((s) => s.slug) ?? [];

  useEffect(() => {
    function handler(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) onClose();
    }
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [onClose]);

  if (!active) return null;

  const ActiveIcon = active.icon;
  const topHref = retailCatHref(slugsForTop(active.id));

  return (
    <div
      ref={menuRef}
      className="absolute left-1/2 top-full z-50 mt-2 w-[min(92vw,820px)] -translate-x-1/2 overflow-hidden rounded-2xl border border-slate-200/90 bg-white shadow-[0_24px_64px_-12px_rgba(0,0,0,0.18)] dark:border-white/10 dark:bg-[#0c101c] dark:shadow-[0_24px_64px_-12px_rgba(0,0,0,0.65)]"
    >
      {/* Top accent */}
      <div className="h-[3px] w-full bg-gradient-to-r from-brand-red via-brand-gold to-brand-red" />

      <div className="flex items-center justify-between border-b border-slate-100 px-5 py-3 dark:border-white/[0.06]">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-brand-gold">
            Magasins Tunisie
          </p>
          <p className="mt-0.5 text-xs text-slate-500 dark:text-white/45">
            Tech, électroménager &amp; multimédia
          </p>
        </div>
        <Link
          href="/retail"
          onClick={onClose}
          className="flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-semibold text-slate-500 transition hover:bg-slate-100 hover:text-brand-gold dark:text-white/50 dark:hover:bg-white/[0.06] dark:hover:text-brand-gold"
        >
          Tout voir
          <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </div>

      <div className="flex min-h-[320px]">
        {/* Left — top categories */}
        <aside className="w-[240px] shrink-0 border-r border-slate-100 bg-slate-50/80 py-2 dark:border-white/[0.06] dark:bg-white/[0.02]">
          <ul className="space-y-0.5 px-2">
            {NAV_CATEGORIES.map((cat) => {
              const Icon = cat.icon;
              const isActive = cat.id === activeId;
              return (
                <li key={cat.id}>
                  <button
                    type="button"
                    onMouseEnter={() => setActiveId(cat.id)}
                    onFocus={() => setActiveId(cat.id)}
                    className={`group flex w-full items-center gap-2.5 rounded-xl px-3 py-2.5 text-left transition ${
                      isActive
                        ? "bg-white shadow-sm ring-1 ring-brand-gold/25 dark:bg-white/[0.08] dark:ring-brand-gold/30"
                        : "hover:bg-white/70 dark:hover:bg-white/[0.05]"
                    }`}
                  >
                    <span
                      className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg transition ${
                        isActive
                          ? "bg-brand-gold/15 text-brand-gold"
                          : "bg-slate-200/60 text-slate-500 group-hover:text-brand-gold dark:bg-white/[0.06] dark:text-white/40"
                      }`}
                    >
                      <Icon className="h-4 w-4" strokeWidth={2} />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span
                        className={`block truncate text-[13px] font-semibold leading-tight ${
                          isActive
                            ? "text-slate-900 dark:text-white"
                            : "text-slate-600 dark:text-white/70"
                        }`}
                      >
                        {cat.shortLabel}
                      </span>
                      <span className="block truncate text-[10px] text-slate-400 dark:text-white/35">
                        {cat.subs.filter((s) => s.slug).length} catégories
                      </span>
                    </span>
                    {isActive && (
                      <ChevronRight className="h-4 w-4 shrink-0 text-brand-gold" />
                    )}
                  </button>
                </li>
              );
            })}
          </ul>
        </aside>

        {/* Right — subcategories panel */}
        <div className="flex min-w-0 flex-1 flex-col p-5">
          <div className="mb-4 flex items-start justify-between gap-3">
            <div className="flex items-start gap-3">
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-brand-gold/20 to-brand-gold/5 ring-1 ring-brand-gold/25">
                <ActiveIcon className="h-5 w-5 text-brand-gold" strokeWidth={2} />
              </span>
              <div>
                <h3 className="text-base font-black tracking-tight text-slate-900 dark:text-white">
                  {active.nom}
                </h3>
                <p className="mt-0.5 text-xs text-slate-500 dark:text-white/45">
                  {mappedSubs.length} sous-catégories disponibles
                </p>
              </div>
            </div>
            <Link
              href={topHref}
              onClick={onClose}
              className="shrink-0 rounded-xl border border-brand-gold/30 bg-brand-gold/10 px-3 py-1.5 text-xs font-bold text-brand-gold transition hover:bg-brand-gold/20"
            >
              Voir tout
            </Link>
          </div>

          {mappedSubs.length > 0 ? (
            <div className="grid grid-cols-2 gap-x-6 gap-y-1 sm:grid-cols-2">
              {mappedSubs.map((sub) => (
                <Link
                  key={sub.id}
                  href={retailCatHref(sub.slug!)}
                  onClick={onClose}
                  className="group flex items-center gap-2 rounded-lg px-2 py-2 text-sm text-slate-600 transition hover:bg-slate-50 hover:text-brand-gold dark:text-white/65 dark:hover:bg-white/[0.04] dark:hover:text-brand-gold"
                >
                  <span className="h-1 w-1 shrink-0 rounded-full bg-slate-300 transition group-hover:bg-brand-gold dark:bg-white/20" />
                  <span className="leading-snug">{sub.nom}</span>
                </Link>
              ))}
            </div>
          ) : (
            <p className="text-sm text-slate-400 dark:text-white/40">
              Aucune sous-catégorie pour cette section.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
