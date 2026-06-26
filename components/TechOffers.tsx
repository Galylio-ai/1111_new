"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { Trophy, ChevronRight, TrendingDown, X } from "lucide-react";

type RankedShop = {
  rank: number;
  shop_key: string;
  products_compared: number;
  fair_win_rate: number;
  cheapest_score: number;
  median_price_index: number;
  confidence: string;
};

type Scope = {
  scope_id: string;
  scope_name: string;
  level1_id: string;
  level2_id: string;
  matched_products: number;
  distinct_shops: number;
  shops: RankedShop[];
};

const SCOPE_LABELS: Record<string, { fr: string; icon: string }> = {
  "home_appliances/ac_climate":           { fr: "Climatisation", icon: "❄️" },
  "home_appliances/*":                    { fr: "Électroménager", icon: "🏠" },
  "computing_it/*":                       { fr: "Informatique", icon: "💻" },
  "office_printing_school/*":             { fr: "Bureau & Impression", icon: "🖨️" },
  "phones_tablets_wearables/smartphones": { fr: "Smartphones", icon: "📱" },
  "tv_audio_photo/televisions":           { fr: "Télévisions", icon: "📺" },
};

const MEDAL: Record<number, string> = { 1: "🥇", 2: "🥈", 3: "🥉" };
const MEDAL_BG: Record<number, string> = {
  1: "from-yellow-400/20 to-yellow-500/5 border-yellow-400/30",
  2: "from-slate-300/20 to-slate-400/5 border-slate-300/30",
  3: "from-orange-400/20 to-orange-500/5 border-orange-400/30",
};
const MEDAL_RING: Record<number, string> = {
  1: "ring-2 ring-yellow-400/50",
  2: "ring-2 ring-slate-300/50",
  3: "ring-2 ring-orange-400/50",
};

function ShopLogo({ shopKey, size = 40 }: { shopKey: string; size?: number }) {
  const fallbacks = [
    `/shop-logos/${shopKey}.png`,
    `/shop-logos/${shopKey}.webp`,
    `/shop-logos/${shopKey}.jpg`,
    `/shop-logos/${shopKey}.svg`,
  ];
  const [idx, setIdx] = useState(0);
  const src = fallbacks[idx];

  if (!src) {
    return (
      <div
        style={{ width: size, height: size }}
        className="flex items-center justify-center rounded-lg bg-slate-100 dark:bg-white/10 text-xs font-bold text-slate-400 dark:text-white/40 uppercase"
      >
        {shopKey.slice(0, 2)}
      </div>
    );
  }
  return (
    <img
      src={src}
      alt={shopKey}
      onError={() => setIdx(i => i + 1)}
      referrerPolicy="no-referrer"
      style={{ width: size, height: size }}
      className="rounded-lg object-contain bg-white dark:bg-white/5 p-0.5"
    />
  );
}

function shopDisplayName(key: string) {
  return key.replace(/[_-]+/g, " ").replace(/\b\w/g, c => c.toUpperCase());
}

function PodiumCard({ shop }: { shop: RankedShop }) {
  const rank = shop.rank;
  const winPct = Math.round(shop.fair_win_rate * 100);
  return (
    <div className={`relative flex flex-col items-center gap-2 rounded-2xl border bg-gradient-to-b p-4 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg ${MEDAL_BG[rank] ?? "border-bg-border"}`}>
      <span className="text-xl">{MEDAL[rank] ?? `#${rank}`}</span>
      <div className={`rounded-xl overflow-hidden ${MEDAL_RING[rank] ?? ""}`}>
        <ShopLogo shopKey={shop.shop_key} size={52} />
      </div>
      <div className="text-center">
        <div className="text-[12px] font-black text-slate-900 dark:text-white leading-tight capitalize">
          {shopDisplayName(shop.shop_key)}
        </div>
        <div className="mt-1 flex items-center justify-center gap-1">
          <TrendingDown className="h-3 w-3 text-emerald-500" />
          <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400">{winPct}% wins</span>
        </div>
        <div className="mt-0.5 text-[10px] text-slate-400 dark:text-white/40">
          {shop.products_compared} produits
        </div>
      </div>
    </div>
  );
}

function ScopeCard({ scope, onViewMore }: { scope: Scope; onViewMore: (s: Scope) => void }) {
  const label = SCOPE_LABELS[scope.scope_id] ?? {
    fr: scope.scope_name.split(">").pop()?.trim() ?? scope.scope_name,
    icon: "🏷️",
  };
  const top3 = scope.shops.slice(0, 3);

  return (
    <div className="card flex flex-col gap-4 p-5 min-w-0">
      <div className="flex items-center gap-2">
        <span className="text-xl">{label.icon}</span>
        <div>
          <div className="text-[13px] font-black uppercase tracking-wide text-slate-900 dark:text-white">{label.fr}</div>
          <div className="text-[10px] text-slate-400 dark:text-white/40">
            {scope.matched_products?.toLocaleString("fr-TN")} produits · {scope.distinct_shops} enseignes
          </div>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-2">
        {top3.map(sh => <PodiumCard key={sh.shop_key} shop={sh} />)}
      </div>

      {scope.shops.length > 3 && (
        <button
          onClick={() => onViewMore(scope)}
          className="flex items-center justify-center gap-1.5 rounded-xl border border-bg-border py-2 text-[12px] font-semibold text-slate-500 transition hover:border-brand-gold/40 hover:text-brand-gold dark:text-white/50 dark:hover:text-brand-gold"
        >
          Voir plus <ChevronRight className="h-3.5 w-3.5" />
        </button>
      )}
    </div>
  );
}

function FullRankingModal({ scope, onClose }: { scope: Scope; onClose: () => void }) {
  const label = SCOPE_LABELS[scope.scope_id] ?? { fr: scope.scope_name, icon: "🏷️" };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-lg max-h-[85vh] overflow-y-auto rounded-2xl border border-bg-border bg-bg-card shadow-2xl"
        onClick={e => e.stopPropagation()}
      >
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-bg-border bg-bg-card px-5 py-4">
          <div className="flex items-center gap-2">
            <span className="text-xl">{label.icon}</span>
            <div>
              <div className="text-[14px] font-black uppercase text-slate-900 dark:text-white">{label.fr}</div>
              <div className="text-[11px] text-slate-400 dark:text-white/40">
                {scope.matched_products?.toLocaleString("fr-TN")} produits · {scope.distinct_shops} enseignes
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 hover:bg-slate-100 dark:hover:bg-white/10 transition"
          >
            <X className="h-4 w-4 text-slate-500 dark:text-white/50" />
          </button>
        </div>

        <div className="p-4 space-y-2">
          {scope.shops.map(sh => {
            const winPct = Math.round(sh.fair_win_rate * 100);
            const isTop = sh.rank <= 3;
            return (
              <div
                key={sh.shop_key}
                className={`flex items-center gap-3 rounded-xl px-3 py-2.5 transition ${
                  isTop
                    ? "bg-gradient-to-r from-brand-gold/10 to-transparent border border-brand-gold/20"
                    : "hover:bg-slate-50 dark:hover:bg-white/[0.03]"
                }`}
              >
                <span className="w-6 text-center text-[13px] font-black text-slate-400 dark:text-white/40">
                  {MEDAL[sh.rank] ?? `#${sh.rank}`}
                </span>
                <ShopLogo shopKey={sh.shop_key} size={36} />
                <div className="flex-1 min-w-0">
                  <div className="text-[13px] font-bold capitalize text-slate-900 dark:text-white truncate">
                    {shopDisplayName(sh.shop_key)}
                  </div>
                  <div className="text-[10px] text-slate-400 dark:text-white/40">
                    {sh.products_compared} produits comparés
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <div className={`text-[13px] font-black ${winPct >= 60 ? "text-emerald-500" : winPct >= 50 ? "text-amber-500" : "text-slate-400"}`}>
                    {winPct}%
                  </div>
                  <div className="text-[9px] text-slate-400 dark:text-white/30">win rate</div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

const SKELETON = (
  <div className="card p-5 animate-pulse space-y-4">
    <div className="h-4 w-1/2 rounded bg-slate-100 dark:bg-white/[0.04]" />
    <div className="grid grid-cols-3 gap-2">
      {[0, 1, 2].map(i => <div key={i} className="h-28 rounded-xl bg-slate-100 dark:bg-white/[0.04]" />)}
    </div>
  </div>
);

export function TechOffers() {
  const [scopes, setScopes] = useState<Scope[]>([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState<Scope | null>(null);

  useEffect(() => {
    fetch("/api/stats/price-rankings")
      .then(r => r.json())
      .then(d => { if (Array.isArray(d?.scopes)) setScopes(d.scopes); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <>
      <section className="mx-auto mt-8 max-w-[1600px] px-3 sm:px-4">
        <div className="mb-5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Trophy className="h-5 w-5 text-brand-gold" />
            <h2 className="section-title">MEILLEURS PRIX PAR CATÉGORIE</h2>
            <span className="text-brand-gold">✦</span>
          </div>
          <Link href="/retail" className="text-xs font-medium text-slate-500 transition hover:text-brand-gold dark:text-white/70">
            Voir tous les magasins →
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[0, 1, 2, 3, 4, 5].map(i => <div key={i}>{SKELETON}</div>)}
          </div>
        ) : scopes.length === 0 ? (
          <div className="rounded-2xl border border-bg-border bg-bg-card p-6 text-center text-sm text-slate-500 dark:text-white/50">
            Aucune donnée disponible.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {scopes.map(s => (
              <ScopeCard key={s.scope_id} scope={s} onViewMore={setModal} />
            ))}
          </div>
        )}
      </section>

      {modal && <FullRankingModal scope={modal} onClose={() => setModal(null)} />}
    </>
  );
}
