"use client";
import { ArrowDownRight, Bell, ShieldAlert, TrendingDown, TrendingUp } from "lucide-react";
import Link from "next/link";
import { distributionEnseignes, veilleProducts } from "@/lib/data";

export function GrandeDistribRow() {
  return (
    <section className="mx-auto mt-6 max-w-[1600px] px-3 sm:px-4">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-[1.4fr_1fr_0.85fr_0.85fr]">
        {/* GRANDE DISTRIBUTION */}
        <div className="card card-pad relative overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between gap-2">
            <div>
              <div className="flex items-baseline gap-3">
                <span className="text-base font-black uppercase tracking-wide text-brand-gold">Grande Distribution</span>
                <span className="font-arabic text-sm font-semibold text-brand-gold/80" dir="rtl">مقارنة السوبرماركات</span>
              </div>
            </div>
          </div>

          {/* Two-column body */}
          <div className="mt-3 flex gap-4">
            {/* LEFT — table */}
            <div className="min-w-0 flex-1">
              {/* Sub-header */}
              <div className="mb-2 text-sm font-semibold text-slate-900 dark:text-white">
                Comparaison panier familial{" "}
                <span className="font-normal text-slate-400 dark:text-white/50">(29 produits)</span>
              </div>

              {/* Table header */}
              <div className="grid grid-cols-[1fr_auto_auto] gap-x-3 px-1 text-xs font-medium text-slate-400 dark:text-white/40">
                <div>Enseigne</div>
                <div className="text-right">Prix total</div>
                <div className="text-right">vs moins cher</div>
              </div>

              {/* Rows */}
              <ul className="mt-1 divide-y divide-slate-100 dark:divide-white/5">
                {distributionEnseignes.map((e) => (
                  <li
                    key={e.name}
                    className={`grid grid-cols-[1fr_auto_auto] items-center gap-x-3 px-1 py-2 text-sm transition ${
                      e.best ? "rounded-lg bg-emerald-500/10" : "hover:bg-slate-50 dark:hover:bg-white/[0.03]"
                    }`}
                  >
                    {/* Logo + name */}
                    <div className="flex items-center gap-2 min-w-0">
                      <span className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-[10px] font-black ${e.logo.bg} ${e.logo.textColor}`}>
                        {e.logo.text}
                      </span>
                      <span className={`truncate font-semibold ${e.best ? "text-slate-900 dark:text-white" : "text-slate-700 dark:text-white/80"}`}>
                        {e.name}
                        {e.best && <span className="ml-1.5 text-brand-gold">⭐</span>}
                      </span>
                    </div>
                    {/* Price */}
                    <div className={`whitespace-nowrap text-right font-bold tabular-nums ${e.best ? "text-emerald-600 dark:text-emerald-300" : "text-slate-900 dark:text-white"}`}>
                      {e.price} DT
                    </div>
                    {/* Delta */}
                    <div className={`whitespace-nowrap text-right text-sm font-semibold tabular-nums ${e.best ? "text-emerald-600 dark:text-emerald-300" : "text-red-500 dark:text-red-400"}`}>
                      {e.diff}
                    </div>
                  </li>
                ))}
              </ul>

              {/* Button */}
              <Link href="/grande-distribution" className="mt-4 block w-full rounded-xl bg-brand-gold py-2.5 text-center text-sm font-black text-black hover:bg-brand-gold/90 transition">
                Comparer Mon Panier
              </Link>
            </div>

            {/* RIGHT — basket image + economy box */}
            <div className="flex w-36 shrink-0 flex-col items-center gap-3">
              <img
                src="/kathya.png"
                alt="Panier de courses"
                className="h-36 w-36 object-contain drop-shadow-[0_8px_24px_rgba(0,0,0,0.5)]"
              />
              <div className="w-full rounded-xl bg-bg-700 p-3 text-center ring-1 ring-slate-200 dark:bg-bg-800 dark:ring-white/10">
                <div className="text-[11px] text-slate-500 dark:text-white/60">Économie possible</div>
                <div className="mt-0.5 text-2xl font-black tabular-nums text-emerald-600 dark:text-emerald-400">8.370 DT</div>
                <div className="text-[10px] text-slate-400 dark:text-white/50">vs l'enseigne la plus chère</div>
              </div>
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
          <div className="font-arabic text-[11px] text-slate-400 dark:text-white/50" dir="rtl">
            ثبت في السعر بلا ما تفتكش
          </div>

          <div className="mt-3 flex items-center gap-2 rounded-xl border border-bg-border bg-bg-700 p-1.5 dark:bg-bg-800">
            <input
              className="flex-1 bg-transparent px-2 py-1.5 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none dark:text-white dark:placeholder:text-white/40"
              placeholder="Rechercher un produit à surveiller…"
            />
            <button className="rounded-lg bg-brand-red px-3 py-1.5 text-xs font-semibold text-white">
              Surveiller
            </button>
          </div>

          <div className="mt-3 text-[11px] uppercase tracking-wider text-slate-400 dark:text-white/40">Mes produits suivis</div>
          <ul className="mt-1 divide-y divide-bg-border/50">
            {veilleProducts.map((p) => (
              <li key={p.name} className="flex items-center justify-between py-2 text-sm">
                <span className="flex items-center gap-2 text-slate-700 dark:text-white/90">
                  <span className="h-1.5 w-1.5 rounded-full bg-brand-gold" />
                  {p.name}
                </span>
                <span className="flex items-center gap-3">
                  <span className="tabular-nums text-slate-900 dark:text-white">{p.price}</span>
                  <span
                    className={`inline-flex items-center gap-0.5 text-xs ${
                      p.down ? "text-emerald-600 dark:text-emerald-400" : "text-red-500 dark:text-red-300"
                    }`}
                  >
                    {p.down ? <TrendingDown className="h-3 w-3" /> : <TrendingUp className="h-3 w-3" />}
                    {p.change}
                  </span>
                </span>
              </li>
            ))}
          </ul>
          <Link href="/veille" className="mt-3 block w-full rounded-lg border border-bg-border bg-bg-700 py-2 text-center text-xs font-medium text-slate-600 hover:bg-bg-800 dark:bg-bg-800 dark:text-white/80 dark:hover:bg-bg-700">
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
                <div className="font-arabic text-[10px] text-slate-400 dark:text-white/40" dir="rtl">تنبيه فوري</div>
              </div>
            </div>
            <span className="rounded-full border border-emerald-400/30 bg-emerald-500/10 px-2 py-0.5 text-[10px] font-semibold text-emerald-600 dark:text-emerald-300">
              ● Live
            </span>
          </div>

          {/* Product */}
          <div className="relative mt-3 flex items-center gap-3 rounded-xl border border-slate-200 bg-bg-700 p-2.5 dark:border-white/5 dark:bg-bg-800">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-blue-400/20 to-blue-600/10 text-2xl ring-1 ring-slate-200 dark:ring-white/5">
              🥛
            </div>
            <div className="min-w-0 flex-1">
              <div className="truncate text-sm font-semibold text-slate-900 dark:text-white">Lait Délice 1L</div>
              <div className="truncate text-[11px] text-slate-500 dark:text-white/50">Demi-écrémé · UHT</div>
            </div>
          </div>

          {/* Price block */}
          <div className="relative mt-3">
            <div className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 dark:text-white/40">Prix actuel</div>
            <div className="mt-0.5 flex items-baseline gap-2">
              <span className="text-4xl font-black tabular-nums text-slate-900 dark:text-white">2.080</span>
              <span className="text-sm font-bold text-brand-gold">DT</span>
              <span className="ml-auto inline-flex items-center gap-0.5 rounded-md bg-emerald-500/15 px-1.5 py-0.5 text-[11px] font-bold text-emerald-600 dark:text-emerald-300">
                <ArrowDownRight className="h-3 w-3" />
                −7.5%
              </span>
            </div>
            <div className="text-[11px] text-slate-500 dark:text-white/50">
              Ancien : <span className="line-through">2.250 DT</span>
              <span className="mx-1.5 text-slate-300 dark:text-white/20">·</span>
              <span className="text-emerald-600 dark:text-emerald-300">Économie 0.17 DT</span>
            </div>
          </div>

          {/* Mini price history (7 days) */}
          <div className="relative mt-3">
            <div className="mb-1 flex items-center justify-between text-[10px] text-slate-400 dark:text-white/40">
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
                          : "bg-slate-300 group-hover:bg-slate-400 dark:bg-white/15 dark:group-hover:bg-white/25"
                      }`}
                      style={{ height: `${Math.max(h, 8)}%` }}
                    />
                  </div>
                );
              })}
            </div>
          </div>

          {/* Store */}
          <div className="relative mt-3 flex items-center justify-between rounded-xl border border-slate-200 bg-bg-700 p-2 dark:border-white/5 dark:bg-bg-800">
            <div className="flex items-center gap-2 text-sm">
              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-br from-red-500 to-red-700 text-xs font-black text-white ring-1 ring-white/10">
                A
              </span>
              <div className="leading-tight">
                <div className="text-sm font-semibold text-slate-900 dark:text-white">Aziza</div>
                <div className="text-[10px] text-slate-500 dark:text-white/50">2 km · Stock OK</div>
              </div>
            </div>
            <button className="rounded-md border border-slate-200 bg-slate-100 px-2 py-1 text-[10px] font-medium text-slate-600 hover:bg-slate-200 hover:text-slate-900 dark:border-white/10 dark:bg-white/5 dark:text-white/70 dark:hover:bg-white/10 dark:hover:text-white">
              Itinéraire
            </button>
          </div>

          {/* Actions */}
          <div className="relative mt-auto pt-3">
            <Link href="/alertes" className="btn-primary w-full">Voir l'offre</Link>
            <Link href="/alertes" className="mt-1.5 block w-full rounded-lg py-1.5 text-center text-xs font-medium text-slate-500 hover:text-slate-900 dark:text-white/60 dark:hover:text-white">
              Me rappeler plus tard
            </Link>
          </div>
        </div>

        {/* PROMOTIONS ILLOGIQUES DÉTECTÉES */}
        <div className="relative flex flex-col overflow-hidden rounded-2xl border border-red-200 bg-white dark:border-red-800/60 dark:bg-[#0d1117]">
          {/* Red corner glow (dark only) */}
          <div className="pointer-events-none absolute -bottom-10 -right-10 h-48 w-48 rounded-full bg-red-700/25 blur-3xl dark:opacity-100 opacity-0" />
          <div className="pointer-events-none absolute -left-6 bottom-1/3 h-32 w-32 rounded-full bg-red-900/30 blur-2xl dark:opacity-100 opacity-0" />

          {/* Title block */}
          <div className="relative px-5 pt-5 pb-2">
            <div className="text-lg font-black uppercase leading-tight text-red-600 dark:text-red-500">
              Promotions illogiques détectées
            </div>
            <div className="font-arabic mt-1 text-sm font-semibold text-red-500 dark:text-red-400" dir="rtl">
              عروض غير منطقية تم اكتشافها
            </div>
          </div>

          {/* Product area */}
          <div className="relative mt-2 flex flex-1 flex-col gap-0 px-5">
            {/* Image + details side by side */}
            <div className="flex items-center gap-4">
              <div className="h-28 w-28 shrink-0 rounded-xl bg-slate-100 dark:bg-white/5 flex items-center justify-center">
                <img
                  src="/clim.png"
                  alt="Climatiseur 12000 BTU"
                  className="h-24 w-24 object-contain drop-shadow-[0_4px_16px_rgba(239,68,68,0.3)]"
                />
              </div>
              <div className="space-y-1.5">
                <div className="text-base font-semibold text-slate-900 dark:text-white">Climatiseur 12000 BTU</div>
                <div className="text-base text-slate-600 dark:text-white/70">Tunisianet</div>
                <div className="text-sm text-slate-500 dark:text-white/60">
                  Ancien prix : <span className="text-slate-900 dark:text-white">2 499 DT</span>
                </div>
                <div className="text-sm text-slate-500 dark:text-white/60">
                  Prix avant promo : <span className="text-slate-900 dark:text-white">2 799 DT</span>
                </div>
              </div>
            </div>

            {/* Remise effective */}
            <div className="mt-5 text-base font-bold text-red-600 dark:text-red-500">
              Remise effective : - 300 DT
            </div>
          </div>

          {/* ILLOGIQUE! button */}
          <div className="relative px-5 pb-5 mt-auto pt-6">
            <button className="flex w-full items-center justify-center gap-3 rounded-2xl bg-gradient-to-b from-red-600 to-red-700 border border-red-500 py-3.5 shadow-[0_0_24px_-4px_rgba(239,68,68,0.4)] hover:shadow-[0_0_32px_-4px_rgba(239,68,68,0.6)] transition dark:from-red-900/80 dark:to-red-950/90 dark:border-red-700/50">
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-orange-400 to-red-600 shadow-md dark:from-orange-400 dark:to-red-600">
                <ShieldAlert className="h-4 w-4 text-white" />
              </span>
              <span className="text-base font-black tracking-widest text-white dark:text-red-400">ILLOGIQUE !</span>
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
