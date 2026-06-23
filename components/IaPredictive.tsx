"use client";
import { useEffect, useState } from "react";
import { BrainCircuit, Package, ReceiptText, SearchCheck, ShieldCheck, Sparkles, Store, Truck, Wrench, Zap } from "lucide-react";
import Link from "next/link";

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

function fmtDT(n: number): string {
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1).replace(/\.0$/, "") + " M DT";
  if (n >= 1_000)     return Math.round(n / 1_000) + " K DT";
  return Math.round(n).toLocaleString("fr-FR") + " DT";
}

export function IaPredictive() {
  const [catalogs, setCatalogs] = useState<CatalogStats[]>([]);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/stats/catalog-summary")
      .then((r) => r.json())
      .then((d) => { if (!cancelled && Array.isArray(d?.catalogs)) setCatalogs(d.catalogs); })
      .catch(() => {});
    return () => { cancelled = true; };
  }, []);

  const totalProducts = catalogs.reduce((s, c) => s + c.products, 0);
  const totalShops = catalogs.reduce((s, c) => s + c.shops, 0);
  const totalPromos = catalogs.reduce((s, c) => s + c.activePromos, 0);
  const avgDiscountAll = catalogs.length
    ? Math.round(catalogs.reduce((s, c) => s + c.avgDiscountPct, 0) / catalogs.length)
    : 0;

  const maxPromos = Math.max(1, ...catalogs.map((c) => c.activePromos));

  return (
    <section className="mx-auto mt-5 max-w-[1600px] px-3 sm:px-4">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-[1.2fr_1fr_1.6fr_1fr]">

        {/* IA PRÉDICTIVE — model intro */}
        <div className="card card-pad relative overflow-hidden">
          {/* Animated glow */}
          <div className="absolute -right-8 -top-8 h-32 w-32 rounded-full bg-violet-500/25 blur-3xl animate-pulse-slow" />
          <div className="absolute -left-10 -bottom-10 h-36 w-36 rounded-full bg-blue-500/20 blur-3xl" />

          <div className="relative flex items-center gap-2">
            <BrainCircuit className="h-4 w-4 text-violet-500" />
            <span className="section-title">IA Prédictive</span>
            <span className="ml-auto inline-flex items-center gap-1 rounded-full border border-violet-400/30 bg-violet-500/10 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-violet-600 dark:text-violet-300">
              <span className="relative flex h-1.5 w-1.5">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-violet-400 opacity-75" />
                <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-violet-500" />
              </span>
              Beta
            </span>
          </div>

          {/* AI brain illustration */}
          <div className="relative mt-3 flex items-center gap-3">
            <div className="relative flex h-20 w-20 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-500/20 via-blue-500/15 to-emerald-400/10 ring-1 ring-violet-400/20">
              <svg viewBox="0 0 64 64" className="h-14 w-14 drop-shadow-[0_4px_12px_rgba(139,92,246,0.4)]" aria-hidden>
                <defs>
                  <linearGradient id="iaBrainGrad" x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0%" stopColor="#a78bfa" />
                    <stop offset="50%" stopColor="#60a5fa" />
                    <stop offset="100%" stopColor="#34d399" />
                  </linearGradient>
                </defs>
                {/* Brain outline */}
                <path
                  d="M22 14c-4 0-7 3-7 7 0 1 .2 2 .5 3-2.5 1.5-4 4-4 7 0 3 1.5 5.5 4 7-.3 1-.5 2-.5 3 0 4 3 7 7 7 1.5 0 3-.5 4-1.5V14.5C25 14.5 23.5 14 22 14zM42 14c4 0 7 3 7 7 0 1-.2 2-.5 3 2.5 1.5 4 4 4 7 0 3-1.5 5.5-4 7 .3 1 .5 2 .5 3 0 4-3 7-7 7-1.5 0-3-.5-4-1.5V14.5C39 14.5 40.5 14 42 14z"
                  fill="url(#iaBrainGrad)"
                  opacity="0.95"
                />
                {/* Neural nodes */}
                <circle cx="22" cy="24" r="2" fill="#fff" />
                <circle cx="32" cy="32" r="2.5" fill="#fff" />
                <circle cx="42" cy="24" r="2" fill="#fff" />
                <circle cx="22" cy="40" r="2" fill="#fff" />
                <circle cx="42" cy="40" r="2" fill="#fff" />
                {/* Connections */}
                <g stroke="#fff" strokeWidth="0.6" opacity="0.6">
                  <line x1="22" y1="24" x2="32" y2="32" />
                  <line x1="42" y1="24" x2="32" y2="32" />
                  <line x1="22" y1="40" x2="32" y2="32" />
                  <line x1="42" y1="40" x2="32" y2="32" />
                </g>
              </svg>
              <Sparkles className="absolute -right-1 -top-1 h-4 w-4 text-amber-400 drop-shadow-[0_0_8px_rgba(251,191,36,0.8)]" />
            </div>

            <div className="min-w-0 flex-1">
              <div className="text-sm font-bold text-slate-900 dark:text-white">
                Acheter ou attendre ?
              </div>
              <div className="font-arabic text-[11px] text-slate-400 dark:text-white/45" dir="rtl">
                اشري ولا استنى ؟
              </div>
              <p className="mt-1 text-[10px] leading-snug text-slate-500 dark:text-white/60">
                Notre modèle IA analyse l&apos;historique des prix de chaque produit pour prédire son évolution sur 15 jours.
              </p>
            </div>
          </div>

          {/* Capabilities */}
          <ul className="relative mt-3 space-y-1 text-[10px] text-slate-600 dark:text-white/70">
            <li className="flex items-center gap-1.5">
              <span className="h-1 w-1 rounded-full bg-violet-500" />
              Détection des cycles de promotion
            </li>
            <li className="flex items-center gap-1.5">
              <span className="h-1 w-1 rounded-full bg-blue-500" />
              Prévision à 7, 15 et 30 jours
            </li>
            <li className="flex items-center gap-1.5">
              <span className="h-1 w-1 rounded-full bg-emerald-500" />
              Alertes intelligentes sur baisse imminente
            </li>
          </ul>

          <Link
            href="/ia-predictive"
            className="relative mt-3 block w-full rounded-lg bg-gradient-to-r from-violet-600 to-blue-600 px-3 py-2 text-center text-xs font-bold text-white shadow-[0_4px_18px_-4px_rgba(139,92,246,0.6)] transition hover:from-violet-500 hover:to-blue-500"
          >
            Découvrir l&apos;IA →
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
                Produits Similaires
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

        {/* CHECKLIST ACHAT INFORMATIQUE */}
        <div className="card card-pad">
          <div className="mb-2 flex items-center gap-2">
            <SearchCheck className="h-4 w-4 text-blue-500" />
            <span className="section-title">Avant d'acheter en tech</span>
          </div>
          <div className="mb-2 text-[10px] text-slate-400 dark:text-white/40">
            Les points à vérifier avant de choisir une boutique
          </div>

          <ul className="space-y-1.5">
            {[
              { icon: ReceiptText, label: "Prix final", text: "Comparez livraison, TVA et frais de paiement." },
              { icon: ShieldCheck, label: "Garantie", text: "Vérifiez la durée, le SAV et les conditions d'échange." },
              { icon: Wrench, label: "Compatibilité", text: "RAM, SSD, ports, écran et chargeur doivent correspondre au besoin." },
              { icon: Truck, label: "Disponibilité", text: "Confirmez le stock réel avant de commander." },
            ].map((item) => {
              const Icon = item.icon;
              return (
                <li key={item.label} className="rounded-lg border border-slate-200 bg-slate-50 p-2 dark:border-white/5 dark:bg-bg-800">
                  <div className="flex items-start gap-2">
                    <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-blue-500/10 text-blue-600 dark:text-blue-300">
                      <Icon className="h-3.5 w-3.5" />
                    </span>
                    <div className="min-w-0 leading-tight">
                      <div className="text-[11px] font-bold text-slate-900 dark:text-white">{item.label}</div>
                      <div className="mt-0.5 text-[10px] leading-snug text-slate-500 dark:text-white/55">{item.text}</div>
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>

          <Link className="mt-3 inline-block text-xs font-medium text-brand-gold hover:underline" href="/retail">
            Comparer les prix informatique
          </Link>
        </div>
      </div>
    </section>
  );
}
