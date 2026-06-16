"use client";
import { ArrowDownRight, ArrowUpRight, Bell, ShoppingBasket, ShoppingCart, Sparkles, TrendingDown, TrendingUp, Trophy } from "lucide-react";
import Link from "next/link";
import { distributionEnseignes, veilleProducts } from "@/lib/data";
import { SparkArea } from "./charts/SparkArea";

const previsionData = [
  { x: 1, y: 2.04 },
  { x: 2, y: 2.06 },
  { x: 3, y: 2.08 },
  { x: 4, y: 2.07 },
  { x: 5, y: 2.10 },
  { x: 6, y: 2.13 },
  { x: 7, y: 2.16 },
];

export function GrandeDistribRow() {
  return (
    <section className="mx-auto mt-6 max-w-[1600px] px-3 sm:px-4">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-[1.4fr_1fr_0.85fr_0.85fr]">
        {/* GRANDE DISTRIBUTION */}
        <div className="card card-pad relative overflow-hidden">
          {/* Watermark cart icon — real lucide icon, faded */}
          <ShoppingCart
            className="pointer-events-none absolute -right-2 -top-2 hidden h-32 w-32 text-white/[0.04] md:block"
            strokeWidth={1.2}
            aria-hidden
          />

          {/* Header */}
          <div className="relative">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-brand-gold/15 ring-1 ring-brand-gold/30">
                  <ShoppingBasket className="h-4 w-4 text-brand-gold" />
                </span>
                <div className="leading-tight">
                  <div className="section-title">Grande distribution</div>
                  <div className="font-arabic text-[11px] text-white/40" dir="rtl">السوبرماركت</div>
                </div>
              </div>
              <span className="rounded-full border border-brand-gold/25 bg-brand-gold/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-brand-gold">
                20 produits
              </span>
            </div>
            <div className="mt-1 text-xs text-white/60">
              Comparaison panier familial · cette semaine
            </div>
          </div>

          {/* Table header */}
          <div className="mt-4 grid grid-cols-[28px_1fr_92px_84px] items-center gap-2 px-1 text-[10px] font-semibold uppercase tracking-wider text-white/40">
            <div>#</div>
            <div>Enseigne</div>
            <div className="text-right">Prix total</div>
            <div className="text-right">vs min</div>
          </div>

          {/* Rows */}
          <ul className="relative mt-1 space-y-1">
            {distributionEnseignes.map((e, idx) => (
              <li
                key={e.name}
                className={`grid grid-cols-[28px_1fr_92px_84px] items-center gap-2 rounded-lg px-1 py-2 text-sm transition ${
                  e.best
                    ? "bg-gradient-to-r from-brand-red/15 via-brand-red/5 to-transparent ring-1 ring-brand-red/30"
                    : "hover:bg-white/[0.03]"
                }`}
              >
                {/* Rank */}
                <div className="flex items-center justify-center">
                  {e.best ? (
                    <Trophy className="h-4 w-4 text-brand-gold" />
                  ) : (
                    <span className="text-[11px] font-bold text-white/40">{idx + 1}</span>
                  )}
                </div>
                {/* Name + dot */}
                <div className="flex items-center gap-2 min-w-0">
                  <span className={`h-2.5 w-2.5 shrink-0 rounded-full ${e.color}`} />
                  <span
                    className={`truncate ${
                      e.best ? "font-bold text-brand-red" : "text-white/90"
                    }`}
                  >
                    {e.name}
                  </span>
                </div>
                {/* Price */}
                <div className="text-right font-semibold tabular-nums text-white">
                  {e.price} <span className="text-[10px] font-normal text-white/40">DT</span>
                </div>
                {/* Delta */}
                <div
                  className={`text-right text-xs font-medium tabular-nums ${
                    e.best ? "text-brand-gold" : "text-red-300"
                  }`}
                >
                  {e.diff}
                </div>
              </li>
            ))}
          </ul>

          {/* Économie possible */}
          <div className="relative mt-4 overflow-hidden rounded-xl border border-emerald-500/30 bg-gradient-to-br from-emerald-500/15 via-emerald-500/10 to-transparent p-3">
            <div className="absolute -right-4 -top-4 h-20 w-20 rounded-full bg-emerald-500/20 blur-2xl" />
            <div className="relative flex items-end justify-between gap-3">
              <div>
                <div className="text-[11px] font-semibold uppercase tracking-wider text-emerald-200/80">
                  Économie possible
                </div>
                <div className="mt-0.5 flex items-baseline gap-1">
                  <span className="text-3xl font-extrabold tabular-nums text-emerald-300">8.370</span>
                  <span className="text-sm font-semibold text-emerald-200/70">DT</span>
                </div>
                <div className="text-[11px] text-white/60">vs l'enseigne la plus chère</div>
              </div>
              <Link href="/grande-distribution" className="btn-primary shrink-0 whitespace-nowrap">Comparer mon panier</Link>
            </div>
          </div>
        </div>

        {/* VEILLE PRIX CONSOMMATEUR */}
        <div className="card card-pad">
          <div className="mb-1 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Bell className="h-4 w-4 text-brand-gold" />
              <span className="section-title">Veille prix consommateur</span>
            </div>
          </div>
          <div className="font-arabic text-[11px] text-white/50" dir="rtl">
            ثبت في السعر بلا ما تفتكش
          </div>

          <div className="mt-3 flex items-center gap-2 rounded-xl border border-bg-border bg-bg-800/70 p-1.5">
            <input
              className="flex-1 bg-transparent px-2 py-1.5 text-xs text-white placeholder:text-white/40 focus:outline-none"
              placeholder="Rechercher un produit à surveiller…"
            />
            <button className="rounded-lg bg-brand-red px-3 py-1.5 text-xs font-semibold text-white">
              Surveiller
            </button>
          </div>

          <div className="mt-3 text-[11px] uppercase tracking-wider text-white/40">Mes produits suivis</div>
          <ul className="mt-1 divide-y divide-bg-border/50">
            {veilleProducts.map((p) => (
              <li key={p.name} className="flex items-center justify-between py-2 text-sm">
                <span className="flex items-center gap-2 text-white/90">
                  <span className="h-1.5 w-1.5 rounded-full bg-brand-gold" />
                  {p.name}
                </span>
                <span className="flex items-center gap-3">
                  <span className="tabular-nums text-white">{p.price}</span>
                  <span
                    className={`inline-flex items-center gap-0.5 text-xs ${
                      p.down ? "text-emerald-400" : "text-red-300"
                    }`}
                  >
                    {p.down ? <TrendingDown className="h-3 w-3" /> : <TrendingUp className="h-3 w-3" />}
                    {p.change}
                  </span>
                </span>
              </li>
            ))}
          </ul>
          <Link href="/veille" className="mt-3 block w-full rounded-lg border border-bg-border bg-bg-800/70 py-2 text-center text-xs font-medium text-white/80 hover:bg-bg-700">
            Voir tous mes produits
          </Link>
        </div>

        {/* ALERTE PRIX */}
        <div className="card card-pad relative flex flex-col overflow-hidden border-brand-red/40">
          <div className="absolute -right-6 -top-6 h-24 w-24 rounded-full bg-brand-red/20 blur-2xl" />
          <div className="absolute -left-10 bottom-0 h-32 w-32 rounded-full bg-brand-red/10 blur-3xl" />

          {/* Header with live pulse */}
          <div className="relative flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="relative flex h-7 w-7 items-center justify-center rounded-lg bg-brand-red/15 ring-1 ring-brand-red/40">
                <Bell className="h-3.5 w-3.5 text-brand-red" />
                <span className="absolute -right-0.5 -top-0.5 flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-brand-red opacity-75" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-brand-red" />
                </span>
              </span>
              <div className="leading-tight">
                <div className="text-[11px] font-bold uppercase tracking-wider text-brand-red">Alerte Prix</div>
                <div className="font-arabic text-[10px] text-white/40" dir="rtl">تنبيه فوري</div>
              </div>
            </div>
            <span className="rounded-full border border-emerald-400/30 bg-emerald-500/10 px-2 py-0.5 text-[10px] font-semibold text-emerald-300">
              ● Live
            </span>
          </div>

          {/* Product */}
          <div className="relative mt-3 flex items-center gap-3 rounded-xl border border-white/5 bg-bg-800/50 p-2.5">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-blue-400/20 to-blue-600/10 text-2xl ring-1 ring-white/5">
              🥛
            </div>
            <div className="min-w-0 flex-1">
              <div className="truncate text-sm font-semibold text-white">Lait Délice 1L</div>
              <div className="truncate text-[11px] text-white/50">Demi-écrémé · UHT</div>
            </div>
          </div>

          {/* Price block */}
          <div className="relative mt-3">
            <div className="text-[10px] font-semibold uppercase tracking-wider text-white/40">Prix actuel</div>
            <div className="mt-0.5 flex items-baseline gap-2">
              <span className="text-4xl font-black tabular-nums text-white">2.080</span>
              <span className="text-sm font-bold text-brand-gold">DT</span>
              <span className="ml-auto inline-flex items-center gap-0.5 rounded-md bg-emerald-500/15 px-1.5 py-0.5 text-[11px] font-bold text-emerald-300">
                <ArrowDownRight className="h-3 w-3" />
                −7.5%
              </span>
            </div>
            <div className="text-[11px] text-white/50">
              Ancien : <span className="line-through">2.250 DT</span>
              <span className="mx-1.5 text-white/20">·</span>
              <span className="text-emerald-300">Économie 0.17 DT</span>
            </div>
          </div>

          {/* Mini price history (7 days) */}
          <div className="relative mt-3">
            <div className="mb-1 flex items-center justify-between text-[10px] text-white/40">
              <span className="font-semibold uppercase tracking-wider">7 derniers jours</span>
              <span className="tabular-nums">Min 2.05 · Max 2.25</span>
            </div>
            <div className="flex h-12 items-end gap-1">
              {[2.25, 2.22, 2.18, 2.20, 2.15, 2.10, 2.08].map((v, i, arr) => {
                const min = Math.min(...arr);
                const max = Math.max(...arr);
                const h = ((v - min) / (max - min)) * 100;
                const isLast = i === arr.length - 1;
                return (
                  <div key={i} className="group relative flex flex-1 flex-col items-center">
                    <div
                      className={`w-full rounded-t-sm transition ${
                        isLast
                          ? "bg-gradient-to-t from-brand-red to-brand-red/60"
                          : "bg-white/15 group-hover:bg-white/25"
                      }`}
                      style={{ height: `${Math.max(h, 8)}%` }}
                    />
                  </div>
                );
              })}
            </div>
          </div>

          {/* Store */}
          <div className="relative mt-3 flex items-center justify-between rounded-xl border border-white/5 bg-bg-800/70 p-2">
            <div className="flex items-center gap-2 text-sm">
              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-br from-red-500 to-red-700 text-xs font-black text-white ring-1 ring-white/10">
                A
              </span>
              <div className="leading-tight">
                <div className="text-sm font-semibold text-white">Aziza</div>
                <div className="text-[10px] text-white/50">2 km · Stock OK</div>
              </div>
            </div>
            <button className="rounded-md border border-white/10 bg-white/5 px-2 py-1 text-[10px] font-medium text-white/70 hover:bg-white/10 hover:text-white">
              Itinéraire
            </button>
          </div>

          {/* Actions */}
          <div className="relative mt-auto pt-3">
            <Link href="/alertes" className="btn-primary w-full">Voir l'offre</Link>
            <Link href="/alertes" className="mt-1.5 block w-full rounded-lg py-1.5 text-center text-xs font-medium text-white/60 hover:text-white">
              Me rappeler plus tard
            </Link>
          </div>
        </div>

        {/* PRÉVISION IA */}
        <div className="card card-pad relative flex flex-col overflow-hidden">
          <div className="absolute -right-8 -top-8 h-28 w-28 rounded-full bg-brand-gold/10 blur-3xl" />
          <div className="absolute -left-8 bottom-0 h-24 w-24 rounded-full bg-red-500/10 blur-3xl" />

          {/* Header */}
          <div className="relative flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-brand-gold/15 ring-1 ring-brand-gold/30">
                <Sparkles className="h-3.5 w-3.5 text-brand-gold" />
              </span>
              <div className="leading-tight">
                <div className="section-title">Prévision IA</div>
                <div className="font-arabic text-[10px] text-white/40" dir="rtl">توقعات الأسعار</div>
              </div>
            </div>
            <span className="rounded-full border border-brand-gold/25 bg-brand-gold/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-brand-gold">
              GPT · v2
            </span>
          </div>

          {/* Confidence ring + forecast */}
          <div className="relative mt-3 flex items-center gap-3">
            {/* SVG ring */}
            <div className="relative h-16 w-16 shrink-0">
              <svg viewBox="0 0 36 36" className="h-16 w-16 -rotate-90">
                <circle cx="18" cy="18" r="15.915" fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="3" />
                <circle
                  cx="18"
                  cy="18"
                  r="15.915"
                  fill="none"
                  stroke="url(#confGrad)"
                  strokeWidth="3"
                  strokeDasharray="87 100"
                  strokeLinecap="round"
                />
                <defs>
                  <linearGradient id="confGrad" x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0%" stopColor="#f6c453" />
                    <stop offset="100%" stopColor="#e11d2d" />
                  </linearGradient>
                </defs>
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-sm font-extrabold text-white">87%</span>
                <span className="text-[8px] uppercase tracking-wider text-white/40">Conf.</span>
              </div>
            </div>

            <div className="min-w-0 flex-1">
              <div className="text-[10px] font-semibold uppercase tracking-wider text-white/40">Hausse prévue</div>
              <div className="flex items-baseline gap-1">
                <ArrowUpRight className="h-5 w-5 text-red-400" />
                <span className="text-3xl font-black tabular-nums text-red-400">+4.2%</span>
              </div>
              <div className="text-[11px] text-white/60">dans 10 jours</div>
            </div>
          </div>

          {/* Spark */}
          <div className="relative mt-3 rounded-xl border border-white/5 bg-bg-800/40 p-2">
            <div className="mb-1 flex items-center justify-between text-[10px] text-white/40">
              <span className="font-semibold uppercase tracking-wider">Tendance 7j</span>
              <span className="tabular-nums text-red-300">2.04 → 2.16 DT</span>
            </div>
            <SparkArea data={previsionData} stroke="#ef4444" height={60} />
          </div>

          {/* Signal chips */}
          <div className="relative mt-3 grid grid-cols-3 gap-1.5 text-center">
            <div className="rounded-lg border border-white/5 bg-bg-800/60 p-1.5">
              <div className="text-[9px] uppercase tracking-wider text-white/40">Saison</div>
              <div className="text-xs font-bold text-red-300">↑ Été</div>
            </div>
            <div className="rounded-lg border border-white/5 bg-bg-800/60 p-1.5">
              <div className="text-[9px] uppercase tracking-wider text-white/40">Stock</div>
              <div className="text-xs font-bold text-amber-300">Bas</div>
            </div>
            <div className="rounded-lg border border-white/5 bg-bg-800/60 p-1.5">
              <div className="text-[9px] uppercase tracking-wider text-white/40">Demande</div>
              <div className="text-xs font-bold text-emerald-300">Forte</div>
            </div>
          </div>

          {/* Reco banner */}
          <div className="relative mt-3 flex items-center gap-2 rounded-xl border border-brand-gold/25 bg-gradient-to-r from-brand-gold/15 via-brand-gold/5 to-transparent p-2">
            <Sparkles className="h-3.5 w-3.5 shrink-0 text-brand-gold" />
            <div className="text-[11px] leading-tight text-white/80">
              <span className="font-semibold text-brand-gold">Conseil IA :</span> achetez sous 48h pour économiser ~0.09 DT/unité.
            </div>
          </div>

          {/* Actions */}
          <div className="relative mt-auto pt-3">
            <Link href="/ia-predictive" className="btn-primary w-full">Acheter maintenant</Link>
            <Link href="/ia-predictive" className="mt-1.5 block w-full rounded-lg py-1.5 text-center text-xs font-medium text-white/60 hover:text-white">
              Me rappeler plus tard
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
