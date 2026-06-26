"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { Trophy, ChevronRight, X, Star } from "lucide-react";

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

const SCOPE_LABELS: Record<string, { fr: string; icon: string; color: string }> = {
  "home_appliances/ac_climate":           { fr: "Climatisation", icon: "❄️", color: "from-sky-500/10 to-sky-600/5 border-sky-400/20" },
  "home_appliances/*":                    { fr: "Électroménager", icon: "🏠", color: "from-violet-500/10 to-violet-600/5 border-violet-400/20" },
  "computing_it/*":                       { fr: "Informatique",   icon: "💻", color: "from-blue-500/10 to-blue-600/5 border-blue-400/20" },
  "office_printing_school/*":             { fr: "Bureau & Impression", icon: "🖨️", color: "from-slate-500/10 to-slate-600/5 border-slate-400/20" },
  "phones_tablets_wearables/smartphones": { fr: "Smartphones",   icon: "📱", color: "from-emerald-500/10 to-emerald-600/5 border-emerald-400/20" },
  "tv_audio_photo/televisions":           { fr: "Télévisions",   icon: "📺", color: "from-rose-500/10 to-rose-600/5 border-rose-400/20" },
};

const RANK_STYLE: Record<number, { medal: string; label: string; bar: string; badge: string }> = {
  1: { medal: "🥇", label: "text-yellow-600 dark:text-yellow-400", bar: "bg-yellow-400", badge: "bg-yellow-400/15 text-yellow-700 dark:text-yellow-300 border border-yellow-400/30" },
  2: { medal: "🥈", label: "text-slate-500 dark:text-slate-300",   bar: "bg-slate-400",  badge: "bg-slate-400/15 text-slate-600 dark:text-slate-300 border border-slate-300/30" },
  3: { medal: "🥉", label: "text-orange-600 dark:text-orange-400", bar: "bg-orange-400", badge: "bg-orange-400/15 text-orange-700 dark:text-orange-300 border border-orange-400/30" },
};

function ShopLogo({ shopKey, size = 56 }: { shopKey: string; size?: number }) {
  const fallbacks = [
    `/shop-logos/${shopKey}.png`,
    `/shop-logos/${shopKey}.webp`,
    `/shop-logos/${shopKey}.jpg`,
    `/shop-logos/${shopKey}.svg`,
  ];
  const [idx, setIdx] = useState(0);

  if (idx >= fallbacks.length) {
    return (
      <div
        style={{ width: size, height: size }}
        className="flex items-center justify-center rounded-xl bg-slate-100 dark:bg-white/10 text-sm font-black text-slate-400 dark:text-white/30 uppercase tracking-wide"
      >
        {shopKey.slice(0, 2)}
      </div>
    );
  }
  return (
    <div
      style={{ width: size, height: size }}
      className="flex items-center justify-center rounded-xl bg-white shadow-sm border border-slate-100 dark:border-white/10 p-1.5 shrink-0"
    >
      <img
        src={fallbacks[idx]}
        alt={shopKey}
        onError={() => setIdx(i => i + 1)}
        referrerPolicy="no-referrer"
        style={{ width: size - 12, height: size - 12 }}
        className="object-contain"
      />
    </div>
  );
}

function shopDisplayName(key: string) {
  return key.replace(/[_-]+/g, " ").replace(/\b\w/g, c => c.toUpperCase());
}

function WinBar({ pct, color }: { pct: number; color: string }) {
  return (
    <div className="h-1 w-full rounded-full bg-slate-100 dark:bg-white/10 overflow-hidden">
      <div className={`h-full rounded-full ${color} transition-all duration-700`} style={{ width: `${pct}%` }} />
    </div>
  );
}

function PodiumShop({ shop, isFirst }: { shop: RankedShop; isFirst: boolean }) {
  const rank = shop.rank;
  const style = RANK_STYLE[rank] ?? { medal: `#${rank}`, label: "text-slate-400", bar: "bg-slate-300", badge: "bg-slate-100 text-slate-500" };
  const winPct = Math.round(shop.fair_win_rate * 100);

  return (
    <div className={`flex flex-col items-center gap-3 rounded-2xl p-4 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md ${isFirst ? "bg-gradient-to-b from-yellow-50 to-amber-50/30 dark:from-yellow-500/10 dark:to-yellow-400/5 border border-yellow-200/60 dark:border-yellow-400/20" : "bg-slate-50/60 dark:bg-white/[0.03] border border-slate-100 dark:border-white/[0.06]"}`}>
      {/* Medal */}
      <span className="text-2xl leading-none">{style.medal}</span>

      {/* Logo with white bg */}
      <ShopLogo shopKey={shop.shop_key} size={60} />

      {/* Name */}
      <div className="text-center space-y-1 w-full">
        <div className="text-[12px] font-black text-slate-800 dark:text-white leading-tight truncate max-w-full px-1">
          {shopDisplayName(shop.shop_key)}
        </div>

        {/* Win rate badge */}
        <div className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold ${style.badge}`}>
          <Star className="h-2.5 w-2.5 fill-current" />
          {winPct}% wins
        </div>

        {/* Bar */}
        <WinBar pct={winPct} color={style.bar} />

        <div className="text-[9px] text-slate-400 dark:text-white/30">
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
    color: "from-slate-500/10 to-slate-600/5 border-slate-400/20",
  };
  const top3 = scope.shops.slice(0, 3);

  return (
    <div className={`flex flex-col gap-5 rounded-2xl border bg-gradient-to-br p-5 ${label.color}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white dark:bg-white/10 shadow-sm text-xl border border-white/60 dark:border-white/10">
            {label.icon}
          </div>
          <div>
            <div className="text-[14px] font-black uppercase tracking-wide text-slate-900 dark:text-white">{label.fr}</div>
            <div className="text-[10px] text-slate-400 dark:text-white/40">
              {scope.matched_products?.toLocaleString("fr-TN")} produits · {scope.distinct_shops} enseignes
            </div>
          </div>
        </div>
        <span className="rounded-full bg-white/80 dark:bg-white/10 px-2.5 py-1 text-[10px] font-bold text-slate-500 dark:text-white/50 border border-slate-100 dark:border-white/10">
          Top 3
        </span>
      </div>

      {/* Podium grid — first shop gets wider card */}
      <div className="grid grid-cols-3 gap-2">
        {top3.map((sh, i) => <PodiumShop key={sh.shop_key} shop={sh} isFirst={i === 0} />)}
      </div>

      {/* Footer */}
      {scope.shops.length > 3 && (
        <button
          onClick={() => onViewMore(scope)}
          className="flex w-full items-center justify-center gap-1.5 rounded-xl bg-white/70 dark:bg-white/[0.05] border border-white/60 dark:border-white/10 py-2.5 text-[12px] font-semibold text-slate-600 dark:text-white/60 transition hover:bg-white dark:hover:bg-white/10 hover:text-slate-900 dark:hover:text-white shadow-sm"
        >
          Voir le classement complet
          <ChevronRight className="h-3.5 w-3.5" />
        </button>
      )}
    </div>
  );
}

function FullRankingModal({ scope, onClose }: { scope: Scope; onClose: () => void }) {
  const label = SCOPE_LABELS[scope.scope_id] ?? { fr: scope.scope_name, icon: "🏷️", color: "" };
  const maxWin = Math.max(...scope.shops.map(s => s.fair_win_rate));

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm p-0 sm:p-4"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-lg max-h-[90vh] sm:max-h-[80vh] overflow-y-auto rounded-t-3xl sm:rounded-2xl border border-bg-border bg-white dark:bg-bg-card shadow-2xl"
        onClick={e => e.stopPropagation()}
      >
        {/* Handle bar (mobile) */}
        <div className="flex justify-center pt-3 pb-1 sm:hidden">
          <div className="h-1 w-10 rounded-full bg-slate-200 dark:bg-white/20" />
        </div>

        {/* Header */}
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-100 dark:border-white/[0.07] bg-white dark:bg-bg-card px-5 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-50 dark:bg-white/10 text-xl border border-slate-100 dark:border-white/10">
              {label.icon}
            </div>
            <div>
              <div className="text-[15px] font-black uppercase tracking-wide text-slate-900 dark:text-white">{label.fr}</div>
              <div className="text-[11px] text-slate-400 dark:text-white/40">
                {scope.matched_products?.toLocaleString("fr-TN")} produits · {scope.distinct_shops} enseignes
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-xl p-2 hover:bg-slate-100 dark:hover:bg-white/10 transition"
          >
            <X className="h-4 w-4 text-slate-400 dark:text-white/50" />
          </button>
        </div>

        {/* List */}
        <div className="p-4 space-y-2">
          {scope.shops.map(sh => {
            const winPct = Math.round(sh.fair_win_rate * 100);
            const relativeWidth = Math.round((sh.fair_win_rate / maxWin) * 100);
            const style = RANK_STYLE[sh.rank];
            return (
              <div
                key={sh.shop_key}
                className={`flex items-center gap-3 rounded-2xl px-3 py-3 transition-all ${
                  sh.rank <= 3
                    ? "bg-gradient-to-r from-brand-gold/8 to-transparent border border-brand-gold/15"
                    : "hover:bg-slate-50 dark:hover:bg-white/[0.03] border border-transparent"
                }`}
              >
                {/* Rank */}
                <div className="w-8 text-center shrink-0">
                  {style ? (
                    <span className="text-lg">{style.medal}</span>
                  ) : (
                    <span className="text-[13px] font-black text-slate-300 dark:text-white/20">#{sh.rank}</span>
                  )}
                </div>

                {/* Logo */}
                <ShopLogo shopKey={sh.shop_key} size={44} />

                {/* Name + bar */}
                <div className="flex-1 min-w-0 space-y-1.5">
                  <div className="text-[13px] font-bold text-slate-900 dark:text-white truncate">
                    {shopDisplayName(sh.shop_key)}
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="flex-1 h-1.5 rounded-full bg-slate-100 dark:bg-white/10 overflow-hidden">
                      <div
                        className={`h-full rounded-full ${style?.bar ?? "bg-slate-300"} transition-all duration-700`}
                        style={{ width: `${relativeWidth}%` }}
                      />
                    </div>
                    <span className="text-[10px] text-slate-400 dark:text-white/30 shrink-0">
                      {sh.products_compared} produits
                    </span>
                  </div>
                </div>

                {/* Win rate */}
                <div className="text-right shrink-0">
                  <div className={`text-[15px] font-black tabular-nums ${
                    winPct >= 70 ? "text-emerald-500" :
                    winPct >= 55 ? "text-amber-500" : "text-slate-400 dark:text-white/30"
                  }`}>
                    {winPct}<span className="text-[10px] font-bold">%</span>
                  </div>
                  <div className="text-[9px] text-slate-300 dark:text-white/20">win rate</div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="px-5 pb-5 pt-1 text-center text-[10px] text-slate-300 dark:text-white/20">
          Classement basé sur les comparaisons pairwise de prix entre enseignes
        </div>
      </div>
    </div>
  );
}

const SKELETON = (
  <div className="rounded-2xl border border-slate-100 dark:border-white/[0.06] bg-slate-50/50 dark:bg-white/[0.02] p-5 animate-pulse space-y-4">
    <div className="flex items-center gap-2.5">
      <div className="h-9 w-9 rounded-xl bg-slate-100 dark:bg-white/[0.05]" />
      <div className="space-y-1.5">
        <div className="h-3.5 w-28 rounded bg-slate-100 dark:bg-white/[0.05]" />
        <div className="h-2.5 w-20 rounded bg-slate-100 dark:bg-white/[0.05]" />
      </div>
    </div>
    <div className="grid grid-cols-3 gap-2">
      {[0, 1, 2].map(i => (
        <div key={i} className="rounded-2xl bg-slate-100 dark:bg-white/[0.04]" style={{ height: 140 }} />
      ))}
    </div>
    <div className="h-10 rounded-xl bg-slate-100 dark:bg-white/[0.04]" />
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
        {/* Section header */}
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-gold/10 border border-brand-gold/20">
              <Trophy className="h-4.5 w-4.5 text-brand-gold" />
            </div>
            <div>
              <h2 className="section-title leading-none">MEILLEURS PRIX PAR CATÉGORIE</h2>
              <p className="text-[11px] text-slate-400 dark:text-white/40 mt-0.5">
                Classement basé sur {scopes.reduce((a, s) => a + (s.matched_products ?? 0), 0).toLocaleString("fr-TN")} produits comparés
              </p>
            </div>
          </div>
          <Link
            href="/retail"
            className="hidden sm:flex items-center gap-1 text-[12px] font-semibold text-slate-400 dark:text-white/40 transition hover:text-brand-gold dark:hover:text-brand-gold"
          >
            Voir tous les magasins <ChevronRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[0, 1, 2, 3, 4, 5].map(i => <div key={i}>{SKELETON}</div>)}
          </div>
        ) : scopes.length === 0 ? (
          <div className="rounded-2xl border border-bg-border bg-bg-card p-10 text-center text-sm text-slate-400 dark:text-white/40">
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
