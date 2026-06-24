"use client";
import { useEffect, useState } from "react";
import { Info, Loader2, TrendingDown, TrendingUp } from "lucide-react";
import { PageShell } from "@/components/site/PageShell";
import { Reveal } from "@/components/site/Reveal";
import { AcBarometer } from "@/components/AcBarometer";

type CategoryStat = {
  name: string;
  products: number;
  avgDiscount: number;
  promoShare: number;
  topShops: { name: string; products: number }[];
};

const CATEGORY_IMAGES: Record<string, string> = {
  "Informatique": "/InformatiqueBg.png",
  "Électroménager": "/ElectroBg.png",
  "Supermarché": "/couffin.png",
  "Beauté & Visage": "/beaute.png",
  "Cheveux & Soins": "/cheveux.png",
  "Bébé & Maman": "/bebe&maman.png",
};

const CATEGORY_COLORS: Record<string, string> = {
  "Informatique": "from-cyan-500 to-blue-600",
  "Électroménager": "from-purple-500 to-violet-600",
  "Supermarché": "from-emerald-500 to-green-600",
  "Beauté & Visage": "from-pink-500 to-rose-600",
  "Cheveux & Soins": "from-fuchsia-500 to-purple-600",
  "Bébé & Maman": "from-sky-500 to-indigo-600",
};

// Definition shown in the hover/focus tooltip for each barometer card.
const CATEGORY_DEFINITIONS: Record<string, string> = {
  "Informatique":
    "Univers PC, ordinateurs portables, écrans, imprimantes, périphériques et composants. Suivi en continu chez les enseignes spécialisées tech tunisiennes.",
  "Électroménager":
    "Gros et petit électroménager : réfrigérateurs, lave-linge, fours, climatiseurs, robots de cuisine. Comparé chez les enseignes physiques et e-commerce.",
  "Supermarché":
    "Produits alimentaires, hygiène, entretien et grande distribution suivis dans les 4 plus grandes enseignes : Aziza, Carrefour, Géant et Monoprix.",
  "Beauté & Visage":
    "Soins du visage, maquillage et protection solaire issus des parapharmacies en ligne tunisiennes. Indicateur clé pour les achats réguliers de cosmétiques.",
  "Cheveux & Soins":
    "Soins capillaires, hygiène corporelle et produits de soins du corps. Inclut shampoings, masques, gels douche et soins quotidiens des principales parapharmacies.",
  "Bébé & Maman":
    "Couches, lait infantile, soins bébé, cosmétiques maternité et accessoires. Catégorie sensible — un suivi des prix précis aide les jeunes parents à économiser.",
};

function fmtNumber(n: number): string {
  return n.toLocaleString("fr-FR");
}

export default function BarometresPage() {
  const [categories, setCategories] = useState<CategoryStat[] | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/category-barometers")
      .then((r) => r.json())
      .then((d) => {
        if (!cancelled && Array.isArray(d?.categories)) setCategories(d.categories);
      })
      .catch(() => {});
    return () => { cancelled = true; };
  }, []);

  const totalProducts = (categories ?? []).reduce((s, c) => s + c.products, 0);
  const totalPromo = (categories ?? []).reduce((s, c) => s + Math.round(c.products * c.promoShare / 100), 0);

  return (
    <PageShell
      icon="gauge"
      title="Baromètres"
      accent="par catégorie"
      arabic="مقاييس الأسعار"
      description="L'état réel de chaque univers du marché tunisien : nombre de produits suivis, taux de promotion, réduction moyenne et meilleures enseignes — calculé en direct depuis nos bases."
      chips={[
        { label: "Catégories", value: String(categories?.length ?? 6), tone: "gold" },
        { label: "Produits suivis", value: categories ? fmtNumber(totalProducts) : "—", tone: "emerald" },
      ]}
    >
      <section className="mx-auto mt-6 max-w-[1600px] px-3 sm:px-4">
        <Reveal>
          <h2 className="section-title mb-3">Baromètres par catégorie</h2>
        </Reveal>

        {!categories ? (
          <div className="flex items-center justify-center gap-2 rounded-2xl border border-dashed border-slate-300 bg-slate-50 py-12 text-sm text-slate-500 dark:border-white/10 dark:bg-white/[0.03] dark:text-white/55">
            <Loader2 className="h-4 w-4 animate-spin" />
            Chargement des données en direct…
          </div>
        ) : categories.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 py-12 text-center text-sm text-slate-500 dark:border-white/10 dark:bg-white/[0.03] dark:text-white/55">
            Aucune donnée de catégorie disponible.
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {categories.map((c, i) => {
              const image = CATEGORY_IMAGES[c.name] ?? "/metaBg.png";
              const color = CATEGORY_COLORS[c.name] ?? "from-slate-500 to-slate-600";
              const promoCount = Math.round(c.products * c.promoShare / 100);
              const goodDeal = c.avgDiscount >= 20;
              return (
                <Reveal key={c.name} delay={i * 0.05}>
                  <div
                    tabIndex={0}
                    className="card card-pad group relative h-full overflow-visible transition hover:-translate-y-1 hover:border-slate-300 focus:outline-none focus-visible:border-brand-gold/30 dark:hover:border-white/20"
                  >
                    {/* Info indicator (top-right corner) */}
                    <Info className="absolute right-3 top-3 h-3.5 w-3.5 text-slate-300 transition group-hover:text-brand-gold/70 group-focus-visible:text-brand-gold/70 dark:text-white/25" />

                    {/* Header */}
                    <div className="flex items-center justify-between gap-3 pr-6">
                      <div className="flex min-w-0 items-center gap-3">
                        <span className={`flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-gradient-to-br ${color} p-1.5 shadow-lg`}>
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src={image} alt={c.name} className="h-full w-full object-contain" />
                        </span>
                        <div className="truncate text-base font-bold text-slate-900 dark:text-white">{c.name}</div>
                      </div>
                      <div className={`h-2.5 w-2.5 shrink-0 rounded-full bg-gradient-to-br ${color}`} />
                    </div>

                    {/* Big stat: average discount */}
                    <div className="mt-3 flex items-baseline gap-2">
                      <div className={`text-3xl font-black tabular-nums ${goodDeal ? "text-emerald-600 dark:text-emerald-400" : "text-slate-900 dark:text-white"}`}>
                        −{c.avgDiscount}%
                      </div>
                      <div className="text-xs text-slate-400 dark:text-white/35">remise moyenne</div>
                      <div className={`ml-auto inline-flex items-center gap-0.5 text-sm font-bold ${goodDeal ? "text-emerald-600 dark:text-emerald-300" : "text-slate-500 dark:text-white/55"}`}>
                        {goodDeal ? <TrendingDown className="h-3.5 w-3.5" /> : <TrendingUp className="h-3.5 w-3.5" />}
                        {c.promoShare}%
                      </div>
                    </div>

                    {/* Sub-stats */}
                    <div className="mt-2 grid grid-cols-2 gap-2 text-[11px]">
                      <div className="rounded-md border border-slate-200 bg-slate-50 px-2 py-1.5 dark:border-white/5 dark:bg-bg-800">
                        <div className="text-slate-500 dark:text-white/55">Produits suivis</div>
                        <div className="font-bold tabular-nums text-slate-900 dark:text-white">{fmtNumber(c.products)}</div>
                      </div>
                      <div className="rounded-md border border-slate-200 bg-slate-50 px-2 py-1.5 dark:border-white/5 dark:bg-bg-800">
                        <div className="text-slate-500 dark:text-white/55">En promotion</div>
                        <div className="font-bold tabular-nums text-slate-900 dark:text-white">{fmtNumber(promoCount)}</div>
                      </div>
                    </div>

                    {/* Top 3 shops with real counts */}
                    <div className="mt-3 border-t border-slate-200 pt-2 text-[10px] font-semibold uppercase tracking-wider text-slate-400 dark:border-bg-border/60 dark:text-white/40">
                      Top 3 enseignes (produits)
                    </div>
                    {c.topShops.length === 0 ? (
                      <div className="mt-1.5 text-[11px] italic text-slate-400 dark:text-white/40">
                        Aucune donnée enseignes disponible.
                      </div>
                    ) : (
                      <ul className="mt-1.5 space-y-1.5 text-sm">
                        {c.topShops.map((s, idx) => {
                          const rankCls =
                            idx === 0 ? "bg-yellow-500 text-yellow-950" :
                            idx === 1 ? "bg-slate-400 text-slate-950" :
                                        "bg-amber-700 text-amber-50";
                          return (
                            <li key={s.name} className="flex items-center justify-between gap-2">
                              <span className="flex min-w-0 items-center gap-2">
                                <span className={`flex h-4 w-4 shrink-0 items-center justify-center rounded-full text-[10px] font-black ${rankCls}`}>
                                  {idx + 1}
                                </span>
                                <span className="truncate text-slate-700 dark:text-white/85">{s.name}</span>
                              </span>
                              <span className="shrink-0 font-semibold tabular-nums text-brand-gold">
                                {fmtNumber(s.products)}
                              </span>
                            </li>
                          );
                        })}
                      </ul>
                    )}

                    {/* Hover / focus tooltip — category definition */}
                    <div
                      role="tooltip"
                      className="pointer-events-none invisible absolute left-1/2 top-full z-30 mt-2 w-[min(20rem,calc(100vw-2rem))] -translate-x-1/2 translate-y-1 rounded-xl border border-brand-gold/30 bg-white p-3 text-left opacity-0 shadow-[0_8px_30px_rgba(0,0,0,0.15)] ring-1 ring-brand-gold/15 transition duration-200 group-hover:visible group-hover:translate-y-0 group-hover:opacity-100 group-focus-visible:visible group-focus-visible:translate-y-0 group-focus-visible:opacity-100 dark:border-brand-gold/25 dark:bg-bg-800 dark:shadow-[0_8px_30px_rgba(0,0,0,0.6)]"
                    >
                      <span className="absolute -top-1.5 left-1/2 h-3 w-3 -translate-x-1/2 rotate-45 border-l border-t border-brand-gold/30 bg-white dark:border-brand-gold/25 dark:bg-bg-800" />
                      <div className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-brand-gold">
                        <Info className="h-3 w-3" /> Définition
                      </div>
                      <div className="mt-1 text-[12px] font-semibold text-slate-900 dark:text-white">{c.name}</div>
                      <p className="mt-1 text-[11px] leading-relaxed text-slate-600 dark:text-white/75">
                        {CATEGORY_DEFINITIONS[c.name] ?? "Catégorie suivie en continu — données issues du marché tunisien."}
                      </p>
                    </div>
                  </div>
                </Reveal>
              );
            })}
          </div>
        )}

        {/* Footer total bar */}
        {categories && categories.length > 0 && (
          <div className="mt-4 flex flex-wrap items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-[11px] text-slate-600 dark:border-white/5 dark:bg-bg-800 dark:text-white/65">
            <span className="font-semibold text-brand-gold">Synthèse</span>
            <span>
              <span className="font-bold text-slate-900 dark:text-white">{fmtNumber(totalProducts)}</span> produits suivis au total
            </span>
            <span className="hidden sm:inline text-slate-300 dark:text-white/20">·</span>
            <span>
              <span className="font-bold text-emerald-600 dark:text-emerald-300">{fmtNumber(totalPromo)}</span> en promotion actuellement
            </span>
            <span className="hidden sm:inline text-slate-300 dark:text-white/20">·</span>
            <span className="text-slate-500 dark:text-white/50">Données live, mise à jour toutes les 10 min</span>
          </div>
        )}
      </section>

      <section className="mx-auto mt-8 max-w-[1600px] px-3 sm:px-4">
        <Reveal>
          <h2 className="section-title mb-1">Focus - Climatiseurs Tunisie</h2>
        </Reveal>
      </section>
      <AcBarometer />
    </PageShell>
  );
}
