"use client";
import { Activity, ArrowDownRight, ArrowUpRight, Bell, Clock, Plus, ShieldAlert, Store } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { distributionEnseignes, getStoreLogo } from "@/lib/data";

type EnseigneRow = { name: string; price: string; diff: string; best?: boolean };
type Pulse = {
  pricesUpdated24h: number;
  priceDropsCount: number;
  priceRisesCount: number;
  newProducts24h: number;
  topCategory: { name: string; count: number } | null;
  shopsActive: number;
  lastUpdate: string | null;
};
type AlertData = {
  name: string;
  brand: string;
  shop: string;
  price: string;
  oldPrice: string;
  change: string;
  down: boolean;
  saved: string;
  min: string;
  max: string;
  slug?: string;
  href?: string;
  img?: string | null;
};

type IllogicalPromo = {
  productId: number;
  name: string;
  slug: string;
  shop: string;
  shopProductUrl: string;
  img: string | null;
  currentPrice: string;
  regularPrice: string;
  marketMin: string;
  marketMax: string;
  claimedDiscount: string;
  realDiscount: string;
  currentPriceRaw: number;
  marketMinRaw: number;
  href: string;
};

function fmtCompact(n: number): string {
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1).replace(/\.0$/, "") + "M";
  if (n >= 1_000) return (n / 1_000).toFixed(1).replace(/\.0$/, "") + "k";
  return n.toLocaleString("fr-FR");
}

function timeSince(iso: string): string {
  const t = new Date(iso).getTime();
  if (!isFinite(t)) return "—";
  const diff = Math.max(0, Date.now() - t);
  const mins = Math.round(diff / 60_000);
  if (mins < 1) return "à l'instant";
  if (mins < 60) return `il y a ${mins} min`;
  const hrs = Math.round(mins / 60);
  if (hrs < 24) return `il y a ${hrs} h`;
  return `il y a ${Math.round(hrs / 24)} j`;
}

function shopLogoSrc(shop: string): string | null {
  const key = shop.trim().toLowerCase();
  if (key.includes("aziza")) return "/aziza-logo.jpg";
  if (key.includes("carrefour market")) return "/carrefour-market.png";
  if (key.includes("carrefour")) return "/Carrefour-Logo.png";
  if (key.includes("monoprix")) return "/monoprix.png";
  if (key.includes("géant") || key.includes("geant")) return "/geant-logo.png";
  return null;
}

function enseigneLogo(name: string) {
  const key = name.trim().toLowerCase();
  if (key.includes("aziza")) return { bg: "bg-green-600", text: "✓", textColor: "text-white" };
  if (key.includes("mg")) return { bg: "bg-red-700", text: "MG", textColor: "text-white" };
  if (key.includes("monoprix")) return { bg: "bg-red-800", text: "M", textColor: "text-white" };
  if (key.includes("géant") || key.includes("geant")) return { bg: "bg-red-600", text: "G", textColor: "text-white" };
  if (key.includes("carrefour")) return { bg: "bg-red-600", text: "C", textColor: "text-white" };
  return { bg: "bg-slate-500", text: name.slice(0, 1).toUpperCase(), textColor: "text-white" };
}

export function GrandeDistribRow() {
  const [enseignes, setEnseignes] = useState<EnseigneRow[]>(
    distributionEnseignes.map((e) => ({ name: e.name, price: e.price, diff: e.diff, best: e.best }))
  );
  const [pulse, setPulse] = useState<Pulse | null>(null);
  const [basketSize, setBasketSize] = useState<number>(29);
  const [economy, setEconomy] = useState<string>("8.370");
  const [alert, setAlert] = useState<AlertData | null>(null);
  const [illogicalPromo, setIllogicalPromo] = useState<IllogicalPromo | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/stats/grande-distrib")
      .then((r) => r.json())
      .then((d) => {
        if (cancelled) return;
        if (Array.isArray(d?.enseignes) && d.enseignes.length > 0) setEnseignes(d.enseignes);
        if (typeof d?.basketSize === "number") setBasketSize(d.basketSize);
        if (typeof d?.economy === "string") setEconomy(d.economy);
        if (d?.alert && typeof d.alert === "object") setAlert(d.alert as AlertData);
      })
      .catch(() => {});

    fetch("/api/stats/market-pulse")
      .then((r) => r.json())
      .then((d) => { if (!cancelled && d) setPulse(d as Pulse); })
      .catch(() => {});

    fetch("/api/stats/illogical-promo")
      .then((r) => r.json())
      .then((d) => {
        if (cancelled) return;
        if (d?.promo) setIllogicalPromo(d.promo as IllogicalPromo);
      })
      .catch(() => {});

    return () => {
      cancelled = true;
    };
  }, []);

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
                <span className="font-normal text-slate-400 dark:text-white/50">({basketSize} produits)</span>
              </div>

              {/* Table header */}
              <div className="grid grid-cols-[1fr_auto_auto] gap-x-3 px-1 text-xs font-medium text-slate-400 dark:text-white/40">
                <div>Enseigne</div>
                <div className="text-right">Prix total</div>
                <div className="text-right">vs moins cher</div>
              </div>

              {/* Rows */}
              <ul className="mt-1 divide-y divide-slate-100 dark:divide-white/5">
                {enseignes.map((e) => {
                  const logo = enseigneLogo(e.name);
                  return (
                  <li
                    key={e.name}
                    className={`grid grid-cols-[1fr_auto_auto] items-center gap-x-3 px-1 py-2 text-sm transition ${
                      e.best ? "rounded-lg bg-emerald-500/10" : "hover:bg-slate-50 dark:hover:bg-white/[0.03]"
                    }`}
                  >
                    {/* Logo + name */}
                    <div className="flex items-center gap-2.5 min-w-0">
                      {getStoreLogo(e.name) ? (
                        <span className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-white p-1 ring-1 ring-slate-200 shadow-sm dark:ring-white/10">
                          <img src={getStoreLogo(e.name)} alt={e.name} className="h-full w-full object-contain" />
                        </span>
                      ) : (
                        <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-xs font-black ${logo.bg} ${logo.textColor}`}>
                          {logo.text}
                        </span>
                      )}
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
                  );
                })}
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
                <div className="mt-0.5 text-2xl font-black tabular-nums text-emerald-600 dark:text-emerald-400">{economy} DT</div>
                <div className="text-[10px] text-slate-400 dark:text-white/50">vs l'enseigne la plus chère</div>
              </div>
            </div>
          </div>
        </div>

        {/* TOP ÉCONOMIES — biggest cross-shop price gaps */}
        <div className="card card-pad">
          <div className="mb-1 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Activity className="h-4 w-4 text-emerald-500" />
              <span className="section-title">Pouls du marché</span>
            </div>
            <span className="inline-flex items-center gap-1 rounded-full border border-emerald-400/30 bg-emerald-500/10 px-2 py-0.5 text-[10px] font-bold text-emerald-600 dark:text-emerald-300">
              <span className="relative flex h-1.5 w-1.5">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-emerald-500" />
              </span>
              24 h
            </span>
          </div>
          <div className="font-arabic text-[11px] text-slate-400 dark:text-white/50" dir="rtl">
            نبض السوق · آخر 24 ساعة
          </div>

          {/* KPI grid */}
          <div className="mt-3 grid grid-cols-2 gap-2">
            {/* Prices updated */}
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-2.5 dark:border-white/5 dark:bg-bg-800">
              <div className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wider text-slate-500 dark:text-white/55">
                <Activity className="h-3 w-3" />
                Prix mis à jour
              </div>
              <div className="mt-1 text-xl font-black tabular-nums text-slate-900 dark:text-white">
                {pulse ? fmtCompact(pulse.pricesUpdated24h) : "—"}
              </div>
              <div className="text-[10px] text-slate-400 dark:text-white/40">tous catalogues</div>
            </div>

            {/* New products */}
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-2.5 dark:border-white/5 dark:bg-bg-800">
              <div className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wider text-amber-600 dark:text-amber-300">
                <Plus className="h-3 w-3" />
                Nouveaux produits
              </div>
              <div className="mt-1 text-xl font-black tabular-nums text-slate-900 dark:text-white">
                {pulse ? fmtCompact(pulse.newProducts24h) : "—"}
              </div>
              <div className="text-[10px] text-slate-400 dark:text-white/40">indexés aujourd'hui</div>
            </div>

            {/* Price drops */}
            <div className="rounded-xl border border-emerald-200 bg-emerald-50/60 p-2.5 dark:border-emerald-400/20 dark:bg-emerald-500/[0.06]">
              <div className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wider text-emerald-700 dark:text-emerald-300">
                <ArrowDownRight className="h-3 w-3" />
                Baisses
              </div>
              <div className="mt-1 text-xl font-black tabular-nums text-emerald-700 dark:text-emerald-300">
                {pulse ? fmtCompact(pulse.priceDropsCount) : "—"}
              </div>
              <div className="text-[10px] text-emerald-600/70 dark:text-emerald-300/60">prix réduits</div>
            </div>

            {/* Price rises */}
            <div className="rounded-xl border border-red-200 bg-red-50/60 p-2.5 dark:border-red-400/20 dark:bg-red-500/[0.06]">
              <div className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wider text-red-600 dark:text-red-300">
                <ArrowUpRight className="h-3 w-3" />
                Hausses
              </div>
              <div className="mt-1 text-xl font-black tabular-nums text-red-600 dark:text-red-300">
                {pulse ? fmtCompact(pulse.priceRisesCount) : "—"}
              </div>
              <div className="text-[10px] text-red-500/70 dark:text-red-300/60">prix augmentés</div>
            </div>
          </div>

          {/* Bottom strip — active shops + last update */}
          <div className="mt-3 flex items-center justify-between gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 dark:border-white/5 dark:bg-bg-800">
            <div className="flex items-center gap-1.5 text-[11px] text-slate-600 dark:text-white/70">
              <Store className="h-3.5 w-3.5 text-brand-gold" />
              <span className="font-semibold">{pulse?.shopsActive ?? "—"}</span>
              <span>boutiques actives</span>
            </div>
            <div className="flex items-center gap-1.5 text-[10px] text-slate-500 dark:text-white/50">
              <Clock className="h-3 w-3" />
              {pulse?.lastUpdate ? timeSince(pulse.lastUpdate) : "—"}
            </div>
          </div>

          <Link href="/observatoire" className="mt-3 block w-full rounded-lg border border-emerald-200 bg-emerald-50 py-2 text-center text-xs font-semibold text-emerald-700 transition hover:bg-emerald-100 dark:border-emerald-400/20 dark:bg-emerald-500/10 dark:text-emerald-300 dark:hover:bg-emerald-500/20">
            Voir l'observatoire
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
            <div className="relative flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-white ring-1 ring-slate-200 dark:ring-white/10">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-400/15 via-transparent to-brand-red/10" />
              {(alert?.img ?? "https://clusteraz.flesk.fr/images/100016181.jpg") ? (
                <img
                  src={alert?.img ?? "https://clusteraz.flesk.fr/images/100016181.jpg"}
                  alt={alert?.name ?? "Fromage fondu triangles"}
                  className="relative h-full w-full object-contain p-1 animate-float drop-shadow-[0_4px_12px_rgba(0,0,0,0.15)]"
                />
              ) : (
                <span className="relative animate-float text-4xl">🧀</span>
              )}
            </div>
            <div className="min-w-0 flex-1">
              <div className="truncate text-sm font-semibold text-slate-900 dark:text-white">
                {alert?.name ?? "Fromage fondu triangles"}
              </div>
              <div className="truncate text-[11px] text-slate-500 dark:text-white/50">
                {alert?.brand || "PRESIDENT"}
              </div>
            </div>
          </div>

          {/* Price block */}
          <div className="relative mt-3">
            <div className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 dark:text-white/40">Prix actuel</div>
            <div className="mt-0.5 flex items-baseline gap-2">
              <span className="text-4xl font-black tabular-nums text-slate-900 dark:text-white">
                {alert?.price ?? "3.150"}
              </span>
              <span className="text-sm font-bold text-brand-gold">DT</span>
              <span className="ml-auto inline-flex items-center gap-0.5 rounded-md bg-emerald-500/15 px-1.5 py-0.5 text-[11px] font-bold text-emerald-600 dark:text-emerald-300">
                <ArrowDownRight className="h-3 w-3" />
                {alert?.change ?? "−12%"}
              </span>
            </div>
            <div className="text-[11px] text-slate-500 dark:text-white/50">
              Moyenne : <span className="line-through">{alert?.oldPrice ?? "3.570"} DT</span>
              <span className="mx-1.5 text-slate-300 dark:text-white/20">·</span>
              <span className="text-emerald-600 dark:text-emerald-300">Économie {alert?.saved ?? "0.420"} DT</span>
            </div>
          </div>

          {/* Mini price history (7 days) */}
          <div className="relative mt-3">
            <div className="mb-1 flex items-center justify-between text-[10px] text-slate-400 dark:text-white/40">
              <span className="font-semibold uppercase tracking-wider">Plage des prix</span>
              <span className="tabular-nums">Min {alert?.min ?? "3.15"} · Max {alert?.max ?? "3.57"}</span>
            </div>
            <div className="flex h-12 items-end gap-1">
              {[3.57, 3.55, 3.53, 3.53, 3.50, 3.49, 3.15].map((v, i, arr) => {
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
              {(() => {
                const logo = shopLogoSrc(alert?.shop ?? "Aziza");
                return logo ? (
                  <span className="relative flex h-11 w-11 items-center justify-center overflow-hidden rounded-full bg-white p-1 ring-2 ring-emerald-400/40 shadow-[0_0_16px_-4px_rgba(16,185,129,0.5)]">
                    <span className="absolute inset-0 animate-pulse-slow rounded-full bg-emerald-400/10" />
                    <img
                      src={logo}
                      alt={alert?.shop ?? "Aziza"}
                      className="relative h-full w-full object-contain animate-float"
                    />
                  </span>
                ) : (
                  <span className="flex h-11 w-11 items-center justify-center rounded-full bg-gradient-to-br from-red-500 to-red-700 text-sm font-black text-white ring-1 ring-white/10">
                    {(alert?.shop ?? "A").slice(0, 1).toUpperCase()}
                  </span>
                );
              })()}
              <div className="leading-tight">
                <div className="text-sm font-semibold text-slate-900 dark:text-white">{alert?.shop ?? "Aziza"}</div>
                <div className="text-[10px] text-slate-500 dark:text-white/50">Meilleur prix</div>
              </div>
            </div>
            <button className="rounded-md border border-slate-200 bg-slate-100 px-2 py-1 text-[10px] font-medium text-slate-600 hover:bg-slate-200 hover:text-slate-900 dark:border-white/10 dark:bg-white/5 dark:text-white/70 dark:hover:bg-white/10 dark:hover:text-white">
              Itinéraire
            </button>
          </div>

          {/* Actions */}
          <div className="relative mt-auto pt-3">
            <Link href={alert?.href ?? "/supermarche/fromage-fondu-triangles"} className="btn-primary w-full">Voir l'offre</Link>
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
              <div className="h-28 w-28 shrink-0 rounded-xl bg-slate-100 dark:bg-white/5 flex items-center justify-center overflow-hidden">
                <img
                  src={illogicalPromo?.img ?? "https://jumbo.tn/4425-large_default/tv-hisense-l5g-series-100-uhd-4k-smart-laser-tv-android-wifi.jpg"}
                  alt={illogicalPromo?.name ?? "TV Hisense L5G 100\""}
                  className="h-24 w-24 object-contain drop-shadow-[0_4px_16px_rgba(239,68,68,0.3)]"
                />
              </div>
              <div className="space-y-1.5 min-w-0">
                <div className="text-base font-semibold text-slate-900 dark:text-white line-clamp-2">
                  {illogicalPromo?.name ?? "TV Hisense L5G 100\" UHD 4K Smart Laser TV"}
                </div>
                <div className="text-base text-slate-600 dark:text-white/70">
                  {illogicalPromo?.shop ?? "Kamounhome"}
                </div>
                <div className="text-sm text-slate-500 dark:text-white/60">
                  Prix affiché : <span className="text-slate-900 dark:text-white">{illogicalPromo?.currentPrice ?? "14 020"} DT</span>
                </div>
                <div className="text-sm text-slate-500 dark:text-white/60">
                  Prix avant promo : <span className="text-slate-900 dark:text-white line-through">{illogicalPromo?.regularPrice ?? "29 830"} DT</span>
                </div>
                <div className="text-sm text-slate-500 dark:text-white/60">
                  Vrai prix marché : <span className="font-semibold text-emerald-600 dark:text-emerald-400">{illogicalPromo?.marketMin ?? "6 999"} DT</span>
                  <span className="ml-1 text-[10px] text-slate-400">chez Jumbo</span>
                </div>
              </div>
            </div>

            {/* Remise effective */}
            <div className="mt-5 text-base font-bold text-red-600 dark:text-red-500">
              Remise réelle :{" "}
              {illogicalPromo
                ? illogicalPromo.currentPriceRaw <= illogicalPromo.marketMinRaw
                  ? `−${illogicalPromo.realDiscount} DT`
                  : `+${Math.round(illogicalPromo.currentPriceRaw - illogicalPromo.marketMinRaw).toLocaleString("fr-FR").replace(/ /g, " ")} DT plus cher que le marché`
                : "+7 021 DT plus cher que le marché"}
            </div>
          </div>

          {/* ILLOGIQUE! button */}
          <div className="relative px-5 pb-5 mt-auto pt-6">
            <Link
              href={illogicalPromo?.href ?? "/retail/tv-hisense-l5g-series-100-quot-uhd-4k-smart-laser-tv-android-wifi"}
              className="flex w-full items-center justify-center gap-3 rounded-2xl bg-gradient-to-b from-red-600 to-red-700 border border-red-500 py-3.5 shadow-[0_0_24px_-4px_rgba(239,68,68,0.4)] hover:shadow-[0_0_32px_-4px_rgba(239,68,68,0.6)] transition dark:from-red-900/80 dark:to-red-950/90 dark:border-red-700/50"
            >
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-orange-400 to-red-600 shadow-md dark:from-orange-400 dark:to-red-600">
                <ShieldAlert className="h-4 w-4 text-white" />
              </span>
              <span className="text-base font-black tracking-widest text-white dark:text-red-400">ILLOGIQUE !</span>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
