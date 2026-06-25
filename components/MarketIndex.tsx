"use client";
import { useEffect, useState } from "react";
import {
  Flame,
  Info,
  ShoppingCart,
  Sparkles,
  Store,
} from "lucide-react";
import Link from "next/link";

// Real per-category barometers from /api/category-barometers.
type CatBarometer = {
  name: string;
  products: number;
  avgDiscount: number;
  promoShare: number;
  topShops: { name: string; products: number }[];
};

// Real numbers pulled from /api/market-index. Instead of repeating the hero's
// global totals (produits / promos / enseignes), we break the market down by
// the three sectors we actually scrape — where the deals and savings are right
// now — plus one golden "total savings" highlight.
type Sector = { products: number; promos: number; savingsDT: number };
type MarketBreakdown = {
  totalSavingsDT: number;
  alimentation: Sector;
  para: Sector;
  retail: Sector;
};

const FR = (n: number) => n.toLocaleString("fr-FR");

// Compact dinar formatting for big sums: 1 414 956 → "1,41 M"
function fmtDT(n: number): string {
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(2).replace(".", ",") + " M";
  if (n >= 10_000) return Math.round(n / 1_000).toLocaleString("fr-FR") + " K";
  return FR(n);
}

// Icon + gradient per real category name (returned by the API).
const catIcons: Record<string, { img: string; grad: string }> = {
  "Informatique": { img: "/InformatiqueBg.png", grad: "from-cyan-500 to-cyan-700" },
  "Électroménager": { img: "/ElectroBg.png", grad: "from-amber-500 to-orange-600" },
  "Supermarché": { img: "/couffin.png", grad: "from-emerald-500 to-emerald-700" },
  "Beauté & Visage": { img: "/beauté.png", grad: "from-pink-500 to-purple-600" },
  "Cheveux & Soins": { img: "/cheveux-category.png", grad: "from-sky-400 to-blue-600" },
  "Bébé & Maman": { img: "/bébé.png", grad: "from-blue-500 to-blue-700" },
};
const FALLBACK_ICON = { img: "/metaBg.png", grad: "from-slate-500 to-slate-700" };

// Definition shown in the hover/focus tooltip for each barometer card.
const catDefinitions: Record<string, string> = {
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

const rankBadges = ["bg-amber-500 text-black", "bg-blue-500 text-white", "bg-blue-400 text-white"];

export function MarketIndex() {
  const [bd, setBd] = useState<MarketBreakdown | null>(null);
  const [barometers, setBarometers] = useState<CatBarometer[] | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/market-index")
      .then((r) => r.json())
      .then((d) => {
        if (cancelled || !d?.stats?.breakdown) return;
        const b = d.stats.breakdown;
        setBd({
          totalSavingsDT: d.stats.totalSavingsDT ?? 0,
          alimentation: b.alimentation ?? { products: 0, promos: 0, savingsDT: 0 },
          para: b.para ?? { products: 0, promos: 0, savingsDT: 0 },
          retail: b.retail ?? { products: 0, promos: 0, savingsDT: 0 },
        });
      })
      .catch(() => {});
    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/category-barometers")
      .then((r) => r.json())
      .then((d) => { if (!cancelled && Array.isArray(d?.categories)) setBarometers(d.categories); })
      .catch(() => {});
    return () => { cancelled = true; };
  }, []);

  // One card per sector we scrape — shows where the deals & savings actually are
  // right now (promo rate = promos / products). These are distinct from the
  // hero's global totals.
  const sectors = bd
    ? [
        {
          label: "Supermarché",
          sub: "alimentaire & courses",
          icon: ShoppingCart,
          color: "text-emerald-600 dark:text-emerald-400",
          ring: "from-emerald-500/15 to-emerald-500/5 ring-emerald-400/20",
          data: bd.alimentation,
          desc:
            "Produits alimentaires et de grande distribution suivis chez les supermarchés tunisiens. " +
            "« Promotions en cours » = articles dont le prix affiché est aujourd'hui inférieur à leur prix de référence. " +
            "« % en promo » = part de ce rayon actuellement en réduction.",
        },
        {
          label: "Parapharmacie",
          sub: "soin, beauté & santé",
          icon: Sparkles,
          color: "text-pink-600 dark:text-pink-400",
          ring: "from-pink-500/15 to-pink-500/5 ring-pink-400/20",
          data: bd.para,
          desc:
            "Soin, beauté, hygiène et santé suivis chez les parapharmacies en ligne. " +
            "Le montant « À économiser » est la somme des rabais réels (prix de référence − prix promo) " +
            "sur toutes les promotions actives de ce rayon.",
        },
        {
          label: "Magasins & Retail",
          sub: "high-tech & maison",
          icon: Store,
          color: "text-blue-600 dark:text-blue-400",
          ring: "from-blue-500/15 to-blue-500/5 ring-blue-400/20",
          data: bd.retail,
          desc:
            "High-tech, électroménager et maison suivis chez les enseignes retail. " +
            "Un « % en promo » élevé indique une période de soldes intense — un bon moment pour acheter dans cette catégorie.",
        },
      ]
    : [];

  // Golden card: the sector with the highest promo rate right now — i.e. where
  // it's most worth shopping today. Derived from the same real breakdown.
  const hottest =
    sectors.length > 0
      ? sectors
          .map((s) => ({
            label: s.label,
            rate: s.data.products > 0 ? (s.data.promos / s.data.products) * 100 : 0,
            promos: s.data.promos,
          }))
          .sort((a, b) => b.rate - a.rate)[0]
      : null;

  return (
    <section className="mx-auto mt-5 max-w-[1600px] px-3 sm:px-4">
      {/* TUNISIA E-COMMERCE MARKET INDEX — sector breakdown */}
      <div className="card card-pad relative overflow-visible">
        {/* Header row */}
        <div className="relative mb-4 flex items-center justify-between gap-3">
          <div className="flex flex-wrap items-baseline gap-3">
            <span className="text-lg font-black uppercase tracking-wide text-brand-gold">
              Où sont les bonnes affaires
            </span>
            <span className="font-arabic text-base font-semibold text-brand-gold/80" dir="rtl">
              وين توجد العروض
            </span>
          </div>
          <Link
            href="/indice"
            className="shrink-0 rounded-full border border-brand-gold/40 bg-brand-gold/5 px-4 py-1.5 text-xs font-semibold text-brand-gold hover:bg-brand-gold/15 transition"
          >
            Voir le détail
          </Link>
        </div>

        {/* 3 sector cards + total savings highlight */}
        <div className="relative grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {(bd ? sectors : Array.from({ length: 3 })).map((s, i) => {
            const sec = s as (typeof sectors)[number] | undefined;
            const promoRate =
              sec && sec.data.products > 0
                ? Math.round((sec.data.promos / sec.data.products) * 100)
                : 0;
            return (
              <div
                key={sec?.label ?? i}
                tabIndex={sec ? 0 : undefined}
                className="group relative flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm ring-1 ring-slate-100 transition-all duration-200 hover:border-brand-gold/40 hover:shadow-[0_4px_24px_rgba(246,196,83,0.12)] focus:outline-none focus-visible:border-brand-gold/30 dark:border-white/[0.06] dark:bg-gradient-to-b dark:from-bg-800 dark:to-bg-900 dark:ring-white/[0.04]"
              >
                {/* info hint */}
                {sec && (
                  <Info className="absolute right-3 top-3 h-3.5 w-3.5 text-slate-300 transition group-hover:text-brand-gold/60 group-focus-visible:text-brand-gold/60 dark:text-white/20" />
                )}

                {/* sector head */}
                <div className="flex items-center gap-3">
                  <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br ${sec?.ring ?? "from-slate-200 to-slate-100 ring-slate-200"} ring-1`}>
                    {sec ? <sec.icon className={`h-5 w-5 ${sec.color}`} strokeWidth={2.2} /> : <Store className="h-5 w-5 text-slate-300" />}
                  </div>
                  <div className="min-w-0 pr-5">
                    <div className="text-[13px] font-bold leading-tight text-slate-800 dark:text-white/90">{sec?.label ?? "—"}</div>
                    <div className="text-[10px] leading-tight text-slate-400 dark:text-white/40">{sec?.sub ?? ""}</div>
                  </div>
                </div>

                {/* headline: promos active */}
                <div className="flex items-end justify-between">
                  <div>
                    <span className={`block text-[28px] font-black tabular-nums leading-none tracking-tight ${sec ? "text-slate-900 dark:text-white" : "text-slate-300 dark:text-white/20"}`}>
                      {sec ? FR(sec.data.promos) : "—"}
                    </span>
                    <span className="mt-1.5 block text-[11px] leading-tight text-slate-400 dark:text-white/40">promotions en cours</span>
                  </div>
                  {sec && promoRate > 0 && (
                    <span className="mb-0.5 rounded-full bg-emerald-500/15 px-2 py-0.5 text-[11px] font-bold tabular-nums text-emerald-600 dark:text-emerald-400">
                      {promoRate}% en promo
                    </span>
                  )}
                </div>

                {/* footer: savings in this sector */}
                <div className="mt-auto flex items-center justify-between border-t border-slate-100 pt-2.5 dark:border-white/[0.06]">
                  <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 dark:text-white/30">À économiser</span>
                  <span className="text-[13px] font-black tabular-nums text-brand-gold">
                    {sec ? fmtDT(sec.data.savingsDT) : "—"} DT
                  </span>
                </div>

                {/* hover/focus tooltip — definition */}
                {sec && (
                  <div
                    role="tooltip"
                    className="pointer-events-none invisible absolute left-1/2 top-full z-30 mt-2 w-[min(18rem,calc(100vw-2rem))] -translate-x-1/2 translate-y-1 rounded-xl border border-brand-gold/30 bg-white p-3 text-left opacity-0 shadow-[0_8px_30px_rgba(0,0,0,0.15)] ring-1 ring-brand-gold/15 transition duration-200 group-hover:visible group-hover:translate-y-0 group-hover:opacity-100 group-focus-visible:visible group-focus-visible:translate-y-0 group-focus-visible:opacity-100 dark:border-brand-gold/25 dark:bg-bg-800 dark:shadow-[0_8px_30px_rgba(0,0,0,0.6)]"
                  >
                    <span className="absolute -top-1.5 left-1/2 h-3 w-3 -translate-x-1/2 rotate-45 border-l border-t border-brand-gold/30 bg-white dark:border-brand-gold/25 dark:bg-bg-800" />
                    <div className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-brand-gold">
                      <Info className="h-3 w-3" /> Définition
                    </div>
                    <div className="mt-1 text-[12px] font-semibold text-slate-900 dark:text-white">{sec.label}</div>
                    <p className="mt-1 text-[11px] leading-relaxed text-slate-600 dark:text-white/75">{sec.desc}</p>
                  </div>
                )}
              </div>
            );
          })}

          {/* Hottest sector — golden highlight card */}
          <div
            tabIndex={bd ? 0 : undefined}
            className="group relative flex flex-col gap-3 rounded-2xl border border-brand-gold/40 bg-gradient-to-b from-amber-50 to-yellow-50 p-4 shadow-sm ring-1 ring-brand-gold/20 transition-all duration-200 hover:border-brand-gold/60 hover:shadow-[0_4px_32px_rgba(246,196,83,0.2)] focus:outline-none dark:from-[#1a1506] dark:to-[#0f0e09]"
          >
            {/* ambient glow (clipped to its own layer so the tooltip can overflow) */}
            <div className="pointer-events-none absolute inset-0 overflow-hidden rounded-2xl">
              <div className="absolute -right-6 -top-6 h-28 w-28 rounded-full bg-brand-gold/20 blur-2xl" />
            </div>

            <Info className="absolute right-3 top-3 h-3.5 w-3.5 text-brand-gold/40 transition group-hover:text-brand-gold/70 group-focus-visible:text-brand-gold/70" />

            <div className="relative flex items-center gap-3">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-brand-gold/30 to-brand-gold/10 ring-1 ring-brand-gold/30">
                <Flame className="h-5 w-5 text-brand-gold" strokeWidth={2.2} />
              </div>
              <div className="min-w-0 pr-5">
                <div className="text-[13px] font-bold leading-tight text-amber-800 dark:text-brand-gold/90">Rayon le plus chaud</div>
                <div className="text-[10px] leading-tight text-amber-600/70 dark:text-brand-gold/40">où acheter maintenant</div>
              </div>
            </div>

            <div className="relative flex items-end">
              <div>
                <span className={`block text-[22px] font-black leading-none tracking-tight ${bd ? "text-slate-900 dark:text-white" : "text-amber-300/50 dark:text-brand-gold/20"}`}>
                  {hottest ? hottest.label : "—"}
                </span>
                <span className="mt-1.5 block text-[11px] leading-tight text-amber-600/70 dark:text-brand-gold/40">
                  c'est là que les promos sont les plus fréquentes
                </span>
              </div>
            </div>

            <div className="relative mt-auto flex items-center justify-between border-t border-brand-gold/20 pt-2.5">
              <span className="text-[10px] font-semibold uppercase tracking-wider text-amber-600/60 dark:text-brand-gold/40">Taux de promo</span>
              <span className="text-[13px] font-black tabular-nums text-brand-gold">
                {hottest ? `${Math.round(hottest.rate)}%` : "—"}
              </span>
            </div>

            {/* hover/focus tooltip — definition (right-anchored, last card) */}
            <div
              role="tooltip"
              className="pointer-events-none invisible absolute right-0 top-full z-30 mt-2 w-[min(18rem,calc(100vw-2rem))] translate-y-1 rounded-xl border border-brand-gold/30 bg-white p-3 text-left opacity-0 shadow-[0_8px_30px_rgba(0,0,0,0.15)] ring-1 ring-brand-gold/15 transition duration-200 group-hover:visible group-hover:translate-y-0 group-hover:opacity-100 group-focus-visible:visible group-focus-visible:translate-y-0 group-focus-visible:opacity-100 dark:border-brand-gold/25 dark:bg-bg-800 dark:shadow-[0_8px_30px_rgba(0,0,0,0.6)]"
            >
              <span className="absolute -top-1.5 right-6 h-3 w-3 rotate-45 border-l border-t border-brand-gold/30 bg-white dark:border-brand-gold/25 dark:bg-bg-800" />
              <div className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-brand-gold">
                <Info className="h-3 w-3" /> Définition
              </div>
              <div className="mt-1 text-[12px] font-semibold text-slate-900 dark:text-white">Rayon le plus chaud</div>
              <p className="mt-1 text-[11px] leading-relaxed text-slate-600 dark:text-white/75">
                Le secteur dont la part de produits en promotion (« taux de promo ») est la plus élevée en ce moment. C'est
                statistiquement le meilleur rayon où chercher une bonne affaire aujourd'hui.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* BAROMÈTRES PAR CATÉGORIE */}
      <div className="card card-pad relative mt-5 overflow-visible">
        <div className="relative mb-4 flex items-center justify-between gap-3">
          <div className="flex flex-wrap items-baseline gap-3">
            <span className="text-lg font-black uppercase tracking-wide text-brand-gold">
              Baromètres par catégorie
            </span>
            <span className="font-arabic text-base font-semibold text-brand-gold/80" dir="rtl">
              بارومترات حسب القسم
            </span>
          </div>
          <Link
            href="/barometres"
            className="shrink-0 rounded-full border border-brand-gold/40 bg-brand-gold/5 px-4 py-1.5 text-xs font-semibold text-brand-gold hover:bg-brand-gold/15 transition"
          >
            Voir tous les baromètres
          </Link>
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
          {(barometers ?? Array.from({ length: 6 })).map((cc, ci) => {
            const c = cc as CatBarometer | undefined;
            const ic = (c && catIcons[c.name]) || FALLBACK_ICON;
            return (
              <div
                key={c?.name ?? ci}
                tabIndex={c ? 0 : -1}
                className="group relative flex flex-col overflow-visible rounded-2xl border border-brand-gold/15 bg-slate-50 p-3.5 ring-1 ring-brand-gold/10 transition hover:border-brand-gold/30 focus:outline-none focus-visible:border-brand-gold/40 dark:bg-bg-800"
              >
                {/* Info indicator (top-right corner) */}
                {c && (
                  <Info className="absolute right-2.5 top-2.5 h-3.5 w-3.5 text-slate-300 transition group-hover:text-brand-gold/70 group-focus-visible:text-brand-gold/70 dark:text-white/25" />
                )}

                {/* Top: icon + name + headline (real avg discount) */}
                <div className="flex items-start gap-3">
                  <span
                    className={`flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-gradient-to-br ${ic.grad} p-1.5 shadow-lg`}
                  >
                    <img src={ic.img} alt={c?.name ?? ""} className="h-full w-full object-contain" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-xs text-slate-600 dark:text-white/80">{c?.name ?? "—"}</div>
                    <div className="mt-1 flex items-baseline gap-2">
                      <span className={`text-xl font-black tabular-nums ${c ? "text-slate-900 dark:text-white" : "text-slate-300 dark:text-white/20"}`}>
                        {c ? `−${c.avgDiscount}%` : "—"}
                      </span>
                      {c && c.promoShare > 0 && (
                        <span className="text-[10px] font-bold tabular-nums text-emerald-600 dark:text-emerald-400">
                          {c.promoShare}% en promo
                        </span>
                      )}
                    </div>
                    <div className="text-[10px] text-slate-400 dark:text-white/40">
                      {c ? `${FR(c.products)} produits suivis` : " "}
                    </div>
                  </div>
                </div>

                {/* Ranked stores — top shops by real product count */}
                <ul className="mt-3 flex-1 space-y-1.5 text-xs">
                  {(c?.topShops ?? []).map((s, idx) => (
                    <li key={s.name} className="flex items-center justify-between">
                      <span className="flex min-w-0 items-center gap-2">
                        <span className={`flex h-4 w-4 shrink-0 items-center justify-center rounded-full text-[10px] font-black ${rankBadges[idx]}`}>
                          {idx + 1}
                        </span>
                        <span className="truncate text-slate-700 dark:text-white/85">{s.name}</span>
                      </span>
                      <span className="shrink-0 tabular-nums text-slate-500 dark:text-white/60">{FR(s.products)}</span>
                    </li>
                  ))}
                  {c && c.topShops.length === 0 && (
                    <li className="text-[11px] italic text-slate-400 dark:text-white/35">Aucune enseigne</li>
                  )}
                </ul>

                {/* Voir le baromètre */}
                <div className="mt-3 border-t border-slate-200 pt-2 text-center dark:border-white/10">
                  <Link
                    href="/barometres"
                    className="text-xs font-medium text-brand-gold/90 hover:text-brand-gold"
                  >
                    Voir le baromètre
                  </Link>
                </div>

                {/* Hover / focus tooltip — category definition */}
                {c && (
                  <div
                    role="tooltip"
                    className="pointer-events-none invisible absolute bottom-full left-1/2 z-30 mb-2 w-[min(18rem,calc(100vw-2rem))] -translate-x-1/2 translate-y-1 rounded-xl border border-brand-gold/30 bg-white p-3 text-left opacity-0 shadow-[0_8px_30px_rgba(0,0,0,0.15)] ring-1 ring-brand-gold/15 transition duration-200 group-hover:visible group-hover:translate-y-0 group-hover:opacity-100 group-focus-visible:visible group-focus-visible:translate-y-0 group-focus-visible:opacity-100 dark:border-brand-gold/25 dark:bg-bg-800 dark:shadow-[0_8px_30px_rgba(0,0,0,0.6)]"
                  >
                    <span className="absolute -bottom-1.5 left-1/2 h-3 w-3 -translate-x-1/2 rotate-45 border-b border-r border-brand-gold/30 bg-white dark:border-brand-gold/25 dark:bg-bg-800" />
                    <div className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-brand-gold">
                      <Info className="h-3 w-3" /> Définition
                    </div>
                    <div className="mt-1 text-[12px] font-semibold text-slate-900 dark:text-white">{c.name}</div>
                    <p className="mt-1 text-[11px] leading-relaxed text-slate-600 dark:text-white/75">
                      {catDefinitions[c.name] ?? "Catégorie suivie en continu — données issues du marché tunisien."}
                    </p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
