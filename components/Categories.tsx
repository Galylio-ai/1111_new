"use client";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { useEffect, useState } from "react";
import { getHomeCompareCategories } from "@/lib/retailCategories";

const categories = getHomeCompareCategories();

function fmtCount(n: number): string {
  return n.toLocaleString("fr-FR");
}

export function Categories() {
  const [counts, setCounts] = useState<Record<string, number>>({});

  useEffect(() => {
    fetch("/api/stats/home-category-counts")
      .then((r) => (r.ok ? r.json() : null))
      .then((j) => {
        if (j?.counts && typeof j.counts === "object") setCounts(j.counts);
      })
      .catch(() => {});
  }, []);

  return (
    <section className="mx-auto mt-8 max-w-[1600px] px-3 sm:px-4">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-gold/15 text-brand-gold">✦</span>
          <div>
            <h2 className="section-title">Comparez par catégorie</h2>
            <p className="text-[11px] text-slate-400 dark:text-white/40">
              Magasins, électro &amp; multimédia · comptages en direct
            </p>
          </div>
        </div>
        <Link
          href="/retail"
          className="group hidden items-center gap-1.5 rounded-full border border-slate-200 bg-white px-4 py-1.5 text-xs font-semibold text-slate-600 transition hover:border-brand-gold/40 hover:text-brand-gold dark:border-white/10 dark:bg-white/[0.04] dark:text-white/60 sm:inline-flex"
        >
          Tout voir
          <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-0.5" />
        </Link>
      </div>

      {/* Grid — 5 cols mobile → 10 on desktop */}
      <div className="grid grid-cols-5 gap-2.5 sm:gap-3 lg:grid-cols-10">
        {categories.map((c, i) => {
          const count = counts[c.id];
          return (
            <Link
              key={c.id}
              href={c.href}
              data-home-card=""
              className="group relative flex flex-col overflow-hidden rounded-2xl transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl"
              style={{ animationDelay: `${i * 50}ms` }}
            >
              <div className="relative h-[clamp(5rem,24vw,9rem)] w-full overflow-hidden sm:h-44 lg:h-52">
                <Image
                  src={c.image}
                  alt={c.fr}
                  fill
                  sizes="(max-width: 640px) 20vw, (max-width: 1024px) 20vw, 10vw"
                  className="object-cover transition-transform duration-700 group-hover:scale-110"
                  unoptimized
                />

                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

                {count != null && count > 0 && (
                  <span
                    className={`absolute right-1.5 top-1.5 max-w-[calc(100%-0.75rem)] truncate rounded-full border px-1.5 py-0.5 text-[clamp(7px,1.8vw,9px)] font-bold tabular-nums backdrop-blur-sm sm:right-2 sm:top-2 sm:px-2 ${c.badge}`}
                    title={`${fmtCount(count)} produits`}
                  >
                    {fmtCount(count)}
                  </span>
                )}

                <div className="absolute bottom-0 left-0 right-0 p-[clamp(0.35rem,1.7vw,0.625rem)] text-center">
                  <span className="block text-[clamp(8px,2.4vw,11px)] font-extrabold leading-tight text-white drop-shadow-lg sm:text-xs">
                    {c.fr}
                  </span>
                  <span className={`font-arabic mt-0.5 block text-[clamp(7px,2vw,10px)] leading-none ${c.text}`}>
                    {c.ar}
                  </span>
                  {count != null && count > 0 && (
                    <span className="mt-0.5 hidden text-[9px] tabular-nums text-white/55 sm:block">
                      {fmtCount(count)} produits
                    </span>
                  )}
                </div>

                <div className="pointer-events-none absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/15 to-transparent transition-transform duration-700 group-hover:translate-x-full" />
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
