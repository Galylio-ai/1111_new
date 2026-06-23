"use client";
import { useEffect, useState } from "react";
import { Flame, Package, Store, Tag, Zap } from "lucide-react";
import Link from "next/link";

type Discount = {
  name: string;
  catalog: string;
  catalogPath: string;
  slug: string;
  shop: string;
  img: string | null;
  currentPrice: number;
  regularPrice: number;
  discountPct: number;
  saving: number;
};

type CatalogStats = {
  catalog: string;
  catalogPath: string;
  products: number;
  shops: number;
  activePromos: number;
  avgDiscountPct: number;
  totalSavingsDT: number;
};

function fmtCompact(n: number): string {
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1).replace(/\.0$/, "") + " M";
  if (n >= 1_000)     return (n / 1_000).toFixed(0) + " K";
  return n.toLocaleString("fr-FR");
}

function fmtPrice(n: number): string {
  return n.toFixed(3).replace(/\.?0+$/, "");
}

function fmtDT(n: number): string {
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1).replace(/\.0$/, "") + " M DT";
  if (n >= 1_000)     return Math.round(n / 1_000) + " K DT";
  return Math.round(n).toLocaleString("fr-FR") + " DT";
}

const CATALOG_BADGES: Record<string, string> = {
  Supermarché:    "bg-emerald-500/15 text-emerald-700 border-emerald-400/30 dark:text-emerald-300",
  Parapharmacie:  "bg-pink-500/15 text-pink-700 border-pink-400/30 dark:text-pink-300",
  Retail:         "bg-blue-500/15 text-blue-700 border-blue-400/30 dark:text-blue-300",
};

export function IaPredictive() {
  const [discounts, setDiscounts] = useState<Discount[]>([]);
  const [catalogs, setCatalogs] = useState<CatalogStats[]>([]);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/stats/biggest-discounts")
      .then((r) => r.json())
      .then((d) => { if (!cancelled && Array.isArray(d?.items)) setDiscounts(d.items); })
      .catch(() => {});
    fetch("/api/stats/catalog-summary")
      .then((r) => r.json())
      .then((d) => { if (!cancelled && Array.isArray(d?.catalogs)) setCatalogs(d.catalogs); })
      .catch(() => {});
    return () => { cancelled = true; };
  }, []);

  const totalProducts = catalogs.reduce((s, c) => s + c.products, 0);
  const totalShops = catalogs.reduce((s, c) => s + c.shops, 0);
  const totalPromos = catalogs.reduce((s, c) => s + c.activePromos, 0);
  const totalSavings = catalogs.reduce((s, c) => s + c.totalSavingsDT, 0);
  const avgDiscountAll = catalogs.length
    ? Math.round(catalogs.reduce((s, c) => s + c.avgDiscountPct, 0) / catalogs.length)
    : 0;

  const maxPromos = Math.max(1, ...catalogs.map((c) => c.activePromos));

  return (
    <section className="mx-auto mt-5 max-w-[1600px] px-3 sm:px-4">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-[1.2fr_1fr_1.6fr_1fr]">

        {/* HERO INTRO CARD */}
        <div className="card card-pad relative overflow-hidden">
          <div className="absolute -right-6 -top-6 h-28 w-28 rounded-full bg-brand-gold/15 blur-2xl" />
          <div className="absolute -left-8 -bottom-8 h-32 w-32 rounded-full bg-emerald-500/10 blur-3xl" />

          <div className="relative flex items-center gap-2">
            <Flame className="h-4 w-4 text-brand-red" />
            <span className="section-title">Promotions live</span>
          </div>
          <div className="relative mt-2 text-sm font-semibold text-slate-900 dark:text-white">Le marché en chiffres réels</div>
          <div className="relative text-sm text-slate-600 dark:text-white/80">aujourd'hui sur 1111.tn</div>
          <div className="relative font-arabic text-xs text-slate-400 dark:text-white/40" dir="rtl">
            السوق بالأرقام الحقيقية
          </div>

          <div className="relative mt-4 rounded-xl border border-emerald-400/30 bg-emerald-500/10 p-3">
            <div className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-300">
              Économies totales disponibles
            </div>
            <div className="mt-1 text-2xl font-black tabular-nums text-emerald-600 dark:text-emerald-300">
              {fmtDT(totalSavings)}
            </div>
            <div className="text-[10px] text-emerald-700/70 dark:text-emerald-300/70">
              cumul des promotions actives
            </div>
          </div>

          <Link
            href="/promotions"
            className="relative mt-3 block w-full rounded-lg bg-brand-red px-3 py-2 text-center text-xs font-semibold text-white transition hover:bg-brand-red/90"
          >
            Voir toutes les promotions
          </Link>
        </div>

        {/* CATALOG ACTIVITY KPI CARD */}
        <div className="card card-pad text-center">
          <div className="text-[11px] uppercase tracking-wider text-slate-500 dark:text-white/50">
            Activité du catalogue
          </div>
          <div className="mt-1 grid grid-cols-1 gap-2">
            <div className="rounded-lg border border-slate-200 bg-slate-50 px-2 py-1.5 dark:border-white/5 dark:bg-bg-800">
              <div className="flex items-center justify-center gap-1.5 text-[10px] font-semibold uppercase tracking-wider text-brand-gold">
                <Package className="h-3 w-3" />
                Produits
              </div>
              <div className="mt-0.5 text-2xl font-black tabular-nums text-slate-900 dark:text-white">
                {fmtCompact(totalProducts)}
              </div>
            </div>

            <div className="rounded-lg border border-slate-200 bg-slate-50 px-2 py-1.5 dark:border-white/5 dark:bg-bg-800">
              <div className="flex items-center justify-center gap-1.5 text-[10px] font-semibold uppercase tracking-wider text-blue-600 dark:text-blue-300">
                <Store className="h-3 w-3" />
                Boutiques
              </div>
              <div className="mt-0.5 text-2xl font-black tabular-nums text-slate-900 dark:text-white">
                {totalShops || "—"}
              </div>
            </div>

            <div className="rounded-lg border border-emerald-200 bg-emerald-50/60 px-2 py-1.5 dark:border-emerald-400/20 dark:bg-emerald-500/[0.06]">
              <div className="flex items-center justify-center gap-1.5 text-[10px] font-semibold uppercase tracking-wider text-emerald-700 dark:text-emerald-300">
                <Zap className="h-3 w-3" />
                Promos actives
              </div>
              <div className="mt-0.5 text-2xl font-black tabular-nums text-emerald-700 dark:text-emerald-300">
                {fmtCompact(totalPromos)}
              </div>
              <div className="text-[10px] text-emerald-600/70 dark:text-emerald-300/60">
                −{avgDiscountAll}% en moyenne
              </div>
            </div>
          </div>
        </div>

        {/* PROMOTIONS PAR CATALOGUE — real bar chart */}
        <div className="card card-pad sm:col-span-2 lg:col-span-1">
          <div className="mb-3 flex items-center justify-between">
            <span className="section-title">Promotions par catalogue</span>
            <span className="text-[10px] text-slate-400 dark:text-white/40">
              total {fmtCompact(totalPromos)} offres
            </span>
          </div>

          {catalogs.length === 0 ? (
            <div className="flex h-[200px] items-center justify-center text-xs text-slate-400 dark:text-white/40">
              Chargement…
            </div>
          ) : (
            <div className="space-y-3">
              {catalogs.map((c) => {
                const pct = (c.activePromos / maxPromos) * 100;
                const colorBar =
                  c.catalog === "Supermarché"   ? "from-emerald-500 to-emerald-400" :
                  c.catalog === "Parapharmacie" ? "from-pink-500 to-pink-400" :
                                                  "from-blue-500 to-blue-400";
                const shareOfTotal = totalPromos > 0 ? Math.round((c.activePromos / totalPromos) * 100) : 0;
                return (
                  <Link key={c.catalog} href={c.catalogPath} className="block group">
                    <div className="mb-1 flex items-center justify-between text-[11px]">
                      <span className="font-semibold text-slate-700 dark:text-white/85 group-hover:text-brand-gold">
                        {c.catalog}
                      </span>
                      <span className="tabular-nums text-slate-500 dark:text-white/55">
                        {fmtCompact(c.activePromos)} · −{c.avgDiscountPct}%
                      </span>
                    </div>
                    <div className="relative h-6 w-full overflow-hidden rounded-md bg-slate-100 dark:bg-white/[0.04]">
                      <div
                        className={`flex h-full items-center justify-end rounded-md bg-gradient-to-r ${colorBar} pr-2 text-[10px] font-bold text-white transition-all`}
                        style={{ width: `${Math.max(pct, 8)}%` }}
                      >
                        {shareOfTotal}%
                      </div>
                    </div>
                    <div className="mt-1 text-[10px] text-slate-400 dark:text-white/40">
                      {fmtCompact(c.products)} produits · {c.shops} boutiques · économie {fmtDT(c.totalSavingsDT)}
                    </div>
                  </Link>
                );
              })}
            </div>
          )}

          <Link href="/promotions" className="mt-4 inline-block text-xs font-medium text-brand-gold hover:underline">
            Explorer toutes les promotions →
          </Link>
        </div>

        {/* PLUS GRANDES RÉDUCTIONS ACTIVES */}
        <div className="card card-pad">
          <div className="mb-2 flex items-center gap-2">
            <Tag className="h-4 w-4 text-brand-red" />
            <span className="section-title">Top réductions</span>
          </div>
          <div className="mb-2 text-[10px] text-slate-400 dark:text-white/40">
            promotions actives les plus agressives
          </div>

          {discounts.length === 0 ? (
            <div className="rounded-lg border border-dashed border-slate-200 bg-slate-50 p-3 text-center text-[11px] text-slate-400 dark:border-white/10 dark:bg-white/[0.02] dark:text-white/40">
              Chargement…
            </div>
          ) : (
            <ul className="space-y-1.5">
              {discounts.slice(0, 4).map((d) => (
                <li key={`${d.catalog}-${d.slug}`}>
                  <Link
                    href={`${d.catalogPath}/${d.slug}`}
                    className="flex items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 p-1.5 transition hover:border-brand-gold/40 hover:bg-brand-gold/[0.04] dark:border-white/5 dark:bg-bg-800 dark:hover:border-brand-gold/40"
                  >
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-md bg-white ring-1 ring-slate-200 dark:ring-white/10">
                      {d.img ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={d.img} alt={d.name} className="h-full w-full object-contain p-0.5" />
                      ) : (
                        <span className="text-sm">🏷️</span>
                      )}
                    </div>
                    <div className="min-w-0 flex-1 leading-tight">
                      <div className="truncate text-[11px] font-semibold text-slate-900 dark:text-white">{d.name}</div>
                      <div className="mt-0.5 flex items-center gap-1.5 text-[9px] text-slate-500 dark:text-white/55">
                        <span className={`rounded-sm border px-1 py-px font-bold uppercase tracking-wider ${CATALOG_BADGES[d.catalog] ?? ""}`}>
                          {d.catalog === "Supermarché" ? "Super" : d.catalog === "Parapharmacie" ? "Para" : "Retail"}
                        </span>
                        <span>{d.shop}</span>
                      </div>
                    </div>
                    <div className="shrink-0 text-right leading-tight">
                      <div className="rounded-md bg-red-500/15 px-1.5 py-0.5 text-[11px] font-black tabular-nums text-red-600 dark:text-red-300">
                        −{d.discountPct}%
                      </div>
                      <div className="mt-0.5 text-[9px] tabular-nums text-emerald-600 dark:text-emerald-300">
                        {fmtPrice(d.currentPrice)} DT
                      </div>
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          )}

          <Link className="mt-3 inline-block text-xs font-medium text-brand-gold hover:underline" href="/promotions">
            Voir toutes les promotions
          </Link>
        </div>
      </div>
    </section>
  );
}
