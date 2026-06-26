"use client";
import { ChevronRight, ShieldAlert, Store, TrendingDown, TrendingUp, Trophy } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { distributionEnseignes, getStoreLogo } from "@/lib/data";
import { topRetailSites, retailSitesMonth } from "@/lib/topRetailSites";

// favicon for a domain (Google's service, themed-neutral, cached by browser)
function faviconFor(domain: string): string {
  return `https://www.google.com/s2/favicons?domain=${domain}&sz=64`;
}
// "tunisianet.com.tn" -> "Tunisianet"
function siteName(domain: string): string {
  const base = domain.replace(/\.(com\.tn|co\.uk|com|tn|fr|de|ae|ca|qa|net|to|co)$/i, "").split(".")[0];
  return base.charAt(0).toUpperCase() + base.slice(1);
}

type EnseigneRow = { name: string; price: string; diff: string; best?: boolean };
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

type RetailShopRow = {
  shop: string;
  displayName: string;
  logo: string | null;
  totalProducts: number;
  similarProducts: number;
  cheapestCount: number;
};

type AlertData = {
  type: "warning" | "info" | "danger";
  message: string;
  productName?: string;
  slug?: string;
};

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
  const [enseignes] = useState<EnseigneRow[]>(
    distributionEnseignes.map((e) => ({ name: e.name, price: e.price, diff: e.diff, best: e.best }))
  );
  const basketSize = 12;
  const economy = "8 370";
  // const alert: AlertData | null = null;
  const illogicalPromo = null as IllogicalPromo | null;
  const [topRetailShops, setTopRetailShops] = useState<RetailShopRow[]>([]);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/stats/top-retail-shops")
      .then((r) => r.json())
      .then((d) => {
        if (cancelled) return;
        if (Array.isArray(d?.shops)) setTopRetailShops(d.shops as RetailShopRow[]);
      })
      .catch(() => {});
    return () => { cancelled = true; };
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
          <div className="mt-3 flex flex-col gap-3 min-[420px]:flex-row min-[420px]:gap-4">
            {/* LEFT — table */}
            <div className="min-w-0 flex-1">
              {/* Sub-header */}
              <div className="mb-2 text-sm font-semibold text-slate-900 dark:text-white">
                Panier essentiel{" "}
                <span className="font-normal text-slate-400 dark:text-white/50">({basketSize} produits : tomate, huile, lait, thon, sucre, fromage, œufs (plateau 30), jambon, poulet, olives, harissa, café)</span>
              </div>

              {/* Table header */}
              <div className="grid grid-cols-[1fr_5rem_5rem] gap-x-3 px-1 text-xs font-medium text-slate-400 dark:text-white/40">
                <div>Enseigne</div>
                <div className="text-right">Prix total</div>
                <div className="text-right">bénéfice</div>
              </div>

              {/* Rows */}
              <ul className="mt-1 divide-y divide-slate-100 dark:divide-white/5">
                {enseignes.map((e, idx) => {
                  const logo = enseigneLogo(e.name);
                  const rank = idx + 1;
                  const rankCls =
                    rank === 1 ? "bg-gradient-to-br from-emerald-400 to-emerald-600 text-white ring-1 ring-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.5)]" :
                    rank === 2 ? "bg-gradient-to-br from-lime-400 to-lime-600 text-white ring-1 ring-lime-400" :
                    rank === 3 ? "bg-gradient-to-br from-yellow-400 to-amber-500 text-white ring-1 ring-yellow-400" :
                    rank === 4 ? "bg-gradient-to-br from-orange-400 to-orange-600 text-white ring-1 ring-orange-400" :
                                 "bg-gradient-to-br from-red-500 to-red-700 text-white ring-1 ring-red-500";
                  return (
                  <li
                    key={e.name}
                    className={`grid grid-cols-[1fr_5rem_5rem] items-center gap-x-3 px-1 py-2 text-sm transition ${
                      e.best ? "rounded-lg bg-emerald-500/10" : "hover:bg-slate-50 dark:hover:bg-white/[0.03]"
                    }`}
                  >
                    {/* Rank + Logo + name */}
                    <div className="flex items-center gap-4 min-w-0">
                      <span className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-[13px] font-black tabular-nums ${rankCls}`}>
                        {rank === 1 ? "🏆" : rank}
                      </span>
                      {getStoreLogo(e.name) ? (
                        <span className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-white p-1 ring-1 ring-slate-200 shadow-sm dark:ring-white/10">
                          <img src={getStoreLogo(e.name)} alt={e.name} className="h-full w-full object-contain" />
                        </span>
                      ) : (
                        <span className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-xl text-sm font-black ${logo.bg} ${logo.textColor}`}>
                          {logo.text}
                        </span>
                      )}
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
              <Link href="/couffin" className="mt-4 block w-full rounded-xl bg-brand-gold py-2.5 text-center text-sm font-black text-black hover:bg-brand-gold/90 transition">
                Comparer Mon Panier
              </Link>
            </div>

            {/* RIGHT — basket image + economy box */}
            <div className="flex w-full shrink-0 flex-row items-center justify-center gap-3 min-[420px]:w-36 min-[420px]:flex-col">
              <img
                src="/kathya.png"
                alt="Panier de courses"
                className="h-[clamp(5.75rem,28vw,9rem)] w-[clamp(5.75rem,28vw,9rem)] object-contain drop-shadow-[0_8px_24px_rgba(0,0,0,0.5)] lg:h-24 lg:w-24 xl:h-36 xl:w-36"
              />
              <div className="w-full max-w-[11rem] rounded-xl bg-bg-700 p-3 text-center ring-1 ring-slate-200 dark:bg-bg-800 dark:ring-white/10 min-[420px]:max-w-none">
                <div className="text-[11px] text-slate-500 dark:text-white/60">Économie possible</div>
                <div className="mt-0.5 text-2xl font-black tabular-nums text-emerald-600 dark:text-emerald-400">{economy} DT</div>
                <div className="text-[10px] text-slate-400 dark:text-white/50">vs l'enseigne la plus chère</div>
              </div>
            </div>
          </div>
        </div>

        {/* SITES LES PLUS VISITÉS — top retail websites in Tunisia */}
        <div className="card card-pad">
          <div className="mb-1 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Trophy className="h-4 w-4 text-amber-500" />
              <span className="section-title">Sites les plus visités</span>
            </div>
            <span className="rounded-full border border-amber-400/30 bg-amber-500/10 px-2 py-0.5 text-[10px] font-bold text-amber-600 dark:text-amber-300">
              Top 8
            </span>
          </div>
          <div className="font-arabic text-[11px] text-slate-400 dark:text-white/50" dir="rtl">
            المواقع الأكثر زيارة
          </div>
          <div className="mt-1 text-[11px] text-slate-500 dark:text-white/55">
            Les sites e-commerce les plus consultés en Tunisie · <span className="font-semibold text-slate-700 dark:text-white/80">{retailSitesMonth}</span>
          </div>

          <ul className="mt-3 space-y-2">
            {topRetailSites.slice(0, 8).map((s, i) => {
              const up = s.mom.includes("↑");
              const rankBg =
                i === 0 ? "bg-gradient-to-br from-yellow-400 to-amber-600 text-yellow-950" :
                i === 1 ? "bg-gradient-to-br from-slate-300 to-slate-500 text-slate-900" :
                i === 2 ? "bg-gradient-to-br from-orange-400 to-orange-700 text-orange-50" :
                          "bg-slate-200 text-slate-600 dark:bg-white/10 dark:text-white/70";
              const maxVisits = topRetailSites[0]?.visitsNum || 1;
              const barPct = (s.visitsNum / maxVisits) * 100;
              return (
                <li key={s.domain} className="rounded-xl border border-slate-200 bg-slate-50 p-2 dark:border-white/5 dark:bg-bg-800">
                  <div className="flex items-center gap-2.5">
                    <span className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[11px] font-black shadow-sm ${rankBg}`}>
                      {i + 1}
                    </span>
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-white p-1 ring-1 ring-slate-200 dark:ring-white/10">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={faviconFor(s.domain)} alt={s.domain} referrerPolicy="no-referrer" loading="lazy" className="h-full w-full object-contain" />
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="truncate text-xs font-semibold text-slate-900 dark:text-white">{siteName(s.domain)}</div>
                      <div className="truncate text-[10px] text-slate-500 dark:text-white/55">{s.domain}</div>
                    </div>
                    <div className="text-right leading-tight">
                      <div className="text-base font-black tabular-nums text-amber-600 dark:text-amber-300">{s.visits}</div>
                      <div className={`flex items-center justify-end gap-0.5 text-[9px] font-bold ${up ? "text-emerald-600 dark:text-emerald-400" : "text-red-500 dark:text-red-400"}`}>
                        {up ? <TrendingUp className="h-2.5 w-2.5" /> : <TrendingDown className="h-2.5 w-2.5" />}
                        {s.mom.replace(/[↑↓]/g, "")}
                      </div>
                    </div>
                  </div>
                  {/* Mini visits bar */}
                  <div className="mt-1.5 h-1 w-full overflow-hidden rounded-full bg-slate-200 dark:bg-white/10">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-amber-400 to-yellow-500 transition-all"
                      style={{ width: `${barPct}%` }}
                    />
                  </div>
                </li>
              );
            })}
          </ul>

          <Link href="/sites-les-plus-visites" className="mt-3 flex w-full items-center justify-center gap-1.5 rounded-lg border border-amber-200 bg-amber-50 py-2 text-center text-xs font-semibold text-amber-700 transition hover:bg-amber-100 dark:border-amber-400/20 dark:bg-amber-500/10 dark:text-amber-300 dark:hover:bg-amber-500/20">
            Voir le classement complet
            <ChevronRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        {/* TOP 5 RETAIL CHEAPEST */}
        <div className="card card-pad relative flex flex-col overflow-hidden border-emerald-500/30">
          <div className="absolute -right-6 -top-6 h-24 w-24 rounded-full bg-emerald-500/20 blur-2xl" />
          <div className="absolute -left-10 bottom-0 h-32 w-32 rounded-full bg-emerald-500/10 blur-3xl" />

          {/* Header */}
          <div className="relative flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-500/15 ring-1 ring-emerald-500/40">
                <Store className="h-3.5 w-3.5 text-emerald-500" />
              </span>
              <div className="leading-tight">
                <div className="text-[11px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">Top 5 Retails</div>
                <div className="font-arabic text-[10px] text-slate-400 dark:text-white/40" dir="rtl">أرخص متاجر التجزئة</div>
              </div>
            </div>
            <span className="rounded-full border border-emerald-400/30 bg-emerald-500/10 px-2 py-0.5 text-[10px] font-semibold text-emerald-600 dark:text-emerald-300">
              Moins chers
            </span>
          </div>

          {/* Sub-header */}
          <div className="relative mt-2 text-[11px] text-slate-500 dark:text-white/55">
            Classement par produits au meilleur prix · la barre indique le{" "}
            <span className="font-semibold text-slate-700 dark:text-white/80">% de produits en concurrence</span> avec un autre top-5
          </div>

          {/* Rows */}
          <ul className="relative mt-3 space-y-2">
            {(topRetailShops.length > 0 ? topRetailShops : Array.from({ length: 5 }).map((_, i) => ({
              shop: `shop-${i}`,
              displayName: "—",
              logo: null,
              totalProducts: 0,
              similarProducts: 0,
              cheapestCount: 0,
            }))).slice(0, 5).map((s, i) => {
              const rankBg =
                i === 0 ? "bg-gradient-to-br from-emerald-400 to-emerald-600 text-white ring-1 ring-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.5)]" :
                i === 1 ? "bg-gradient-to-br from-lime-400 to-lime-600 text-white ring-1 ring-lime-400" :
                i === 2 ? "bg-gradient-to-br from-yellow-400 to-amber-500 text-white ring-1 ring-yellow-400" :
                i === 3 ? "bg-gradient-to-br from-orange-400 to-orange-600 text-white ring-1 ring-orange-400" :
                          "bg-gradient-to-br from-red-500 to-red-700 text-white ring-1 ring-red-500";
              const pct = s.totalProducts > 0 ? Math.round((s.similarProducts / s.totalProducts) * 100) : 0;
              return (
                <li key={s.shop} className="rounded-xl border border-slate-200 bg-slate-50 p-2 dark:border-white/5 dark:bg-bg-800">
                  <div className="flex items-center gap-2.5">
                    <span className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[11px] font-black shadow-sm ${rankBg}`}>
                      {i === 0 ? "🏆" : i + 1}
                    </span>
                    {s.logo ? (
                      <span className="flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-white p-1 ring-1 ring-slate-200 dark:ring-white/10">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={s.logo} alt={s.displayName} className="h-full w-full object-contain" />
                      </span>
                    ) : (
                      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-slate-200 text-xs font-black text-slate-600 dark:bg-white/10 dark:text-white/70">
                        {s.displayName.slice(0, 1).toUpperCase()}
                      </span>
                    )}
                    <div className="min-w-0 flex-1">
                      <div className="truncate text-xs font-semibold text-slate-900 dark:text-white">{s.displayName}</div>
                      <div className="text-[10px] text-slate-500 dark:text-white/55">
                        <span className="tabular-nums font-semibold text-slate-700 dark:text-white/75">{s.totalProducts.toLocaleString("fr-FR")}</span>
                        <span className="ml-1">produits au total</span>
                      </div>
                    </div>
                    <div className="text-right leading-tight">
                      <div className="text-base font-black tabular-nums text-emerald-600 dark:text-emerald-400">{s.cheapestCount.toLocaleString("fr-FR")}</div>
                      <div className="text-[9px] font-bold uppercase tracking-wider text-slate-500 dark:text-white/50">Meilleur prix</div>
                    </div>
                  </div>
                  {/* Competition: similar / total products shared with another top-5 shop */}
                  <div className="mt-2 flex items-center justify-between text-[10px]">
                    <span className="text-slate-500 dark:text-white/50">Produits en concurrence</span>
                    <span className="tabular-nums">
                      <span className="font-black text-emerald-600 dark:text-emerald-400">{s.similarProducts.toLocaleString("fr-FR")}</span>
                      <span className="mx-0.5 text-slate-400 dark:text-white/40">/</span>
                      <span className="font-semibold text-slate-600 dark:text-white/65">{s.totalProducts.toLocaleString("fr-FR")}</span>
                    </span>
                  </div>
                  <div className="mt-1 flex items-center gap-2">
                    <div className="relative h-1.5 flex-1 overflow-hidden rounded-full bg-slate-200 dark:bg-white/10">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-emerald-400 via-emerald-500 to-emerald-600 transition-all duration-700"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                    <span className="w-9 shrink-0 text-right text-[10px] font-black tabular-nums text-emerald-600 dark:text-emerald-400">
                      {pct}%
                    </span>
                  </div>
                </li>
              );
            })}
          </ul>

          {/* Actions */}
          <div className="relative mt-auto pt-3">
            <Link href="/retail" className="btn-primary w-full">Voir le catalogue retail</Link>
          </div>
        </div>

        {/* PROMOTIONS ILLOGIQUES DÉTECTÉES */}
        <div
          data-home-card=""
          className="relative flex flex-col overflow-hidden rounded-2xl border border-red-200 bg-white dark:border-red-800/60 dark:bg-[#0d1117]"
        >
          {/* Red corner glow (dark only) */}
          <div className="pointer-events-none absolute -bottom-10 -right-10 h-48 w-48 rounded-full bg-red-700/25 blur-3xl dark:opacity-100 opacity-0" />
          <div className="pointer-events-none absolute -left-6 bottom-1/3 h-32 w-32 rounded-full bg-red-900/30 blur-2xl dark:opacity-100 opacity-0" />

          {/* Title block */}
          <div className="relative px-4 pt-4 pb-3 sm:px-5 sm:pt-5">
            <div className="text-lg font-black uppercase leading-tight text-red-600 dark:text-red-500">
              Promotions illogiques détectées
            </div>
            <div className="font-arabic mt-4 text-sm font-semibold text-red-500 dark:text-red-400" dir="rtl">
              عروض غير منطقية تم اكتشافها
            </div>
          </div>

          {/* Product area */}
          <div className="relative flex flex-1 flex-col px-4 sm:px-5">
            {/* Image — pleine largeur, en haut */}
            <div className="flex w-full items-center justify-center overflow-hidden rounded-xl bg-slate-100 py-4 dark:bg-white/5">
              <img
                src={illogicalPromo?.img ?? "https://jumbo.tn/4425-large_default/tv-hisense-l5g-series-100-uhd-4k-smart-laser-tv-android-wifi.jpg"}
                alt={illogicalPromo?.name ?? "TV Hisense L5G 100\""}
                className="max-h-40 w-full object-contain drop-shadow-[0_4px_16px_rgba(239,68,68,0.3)]"
              />
            </div>

            {/* Détails sous l'image */}
            <div className="mt-8 space-y-2">
              <div className="line-clamp-2 text-sm font-semibold leading-snug text-slate-900 dark:text-white">
                {illogicalPromo?.name ?? "TV Hisense L5G 100\" UHD 4K Smart Laser TV"}
              </div>
              <div className="text-xs text-slate-500 dark:text-white/60">{illogicalPromo?.shop ?? "Kamounhome"}</div>
              <div className="text-xs text-slate-500 dark:text-white/60">
                Prix affiché : <span className="font-medium text-slate-900 dark:text-white">{illogicalPromo?.currentPrice ?? "6 999"} DT</span>
              </div>
              <div className="text-xs text-slate-500 dark:text-white/60">
                Prix avant promo : <span className="text-slate-900 line-through dark:text-white">{illogicalPromo?.regularPrice ?? "14 020"} DT</span>
              </div>
              <div className="text-xs text-slate-500 dark:text-white/60">
                Vrai prix marché : <span className="font-semibold text-emerald-600 dark:text-emerald-400">{illogicalPromo?.marketMin ?? "6 999"} DT</span>
                <span className="ml-1 text-[10px] text-slate-400">chez Jumbo</span>
              </div>
            </div>

            {/* Remise effective */}
            <div className="mt-8 text-sm font-bold leading-snug text-red-600 dark:text-red-500">
              Remise réelle :{" "}
              {illogicalPromo
                ? illogicalPromo.currentPriceRaw <= illogicalPromo.marketMinRaw
                  ? `−${illogicalPromo.realDiscount} DT`
                  : `+${Math.round(illogicalPromo.currentPriceRaw - illogicalPromo.marketMinRaw).toLocaleString("fr-FR").replace(/ /g, " ")} DT plus cher que le marché`
                : "+7 021 DT plus cher que le marché"}
            </div>
          </div>

          {/* ILLOGIQUE! button */}
          <div className="relative mt-auto px-4 pb-4 pt-4 sm:px-5 sm:pb-5">
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
