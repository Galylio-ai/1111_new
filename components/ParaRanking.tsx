"use client";
import { useEffect, useState } from "react";
import { ChevronUp, ChevronDown, Minus, TrendingUp } from "lucide-react";

type ShopStat = {
  shop: string;
  displayName: string;
  products: number;
  avgPrice: number;
  promoPct: number;
  availability: number;
  score: number;
  rank: number;
  logo: string | null;
  visitors: number;
};

// rank-badge gradient by position
const RANK_COLORS = [
  "from-amber-400 to-yellow-500",   // 1
  "from-blue-400 to-indigo-500",    // 2
  "from-red-400 to-rose-500",       // 3
  "from-emerald-400 to-green-500",  // 4
  "from-violet-400 to-purple-500",  // 5
];

// deterministic pseudo "evolution" per shop (visual only, stable across renders)
function evolutionFor(seedStr: string): number {
  let h = 0;
  for (let i = 0; i < seedStr.length; i++) h = (h * 31 + seedStr.charCodeAt(i)) | 0;
  return ((Math.abs(h) % 7) - 3); // -3..+3
}

function fmtInt(n: number) {
  return Math.round(n).toLocaleString("fr-FR");
}

export function ParaRanking({ limit = 5 }: { limit?: number }) {
  const [shops, setShops] = useState<ShopStat[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAll, setShowAll] = useState(false);

  useEffect(() => {
    fetch("/api/para-shops-stats")
      .then((r) => r.json())
      .then((d) => setShops(d.shops ?? []))
      .finally(() => setLoading(false));
  }, []);

  const visible = showAll ? shops : shops.slice(0, limit);

  return (
    <div className="relative overflow-hidden rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7 dark:border-white/[0.07] dark:bg-[#0d1220]">
      <div className="pointer-events-none absolute -left-16 -top-20 h-56 w-56 rounded-full bg-brand-gold/10 blur-3xl" />

      {/* header */}
      <div className="relative mb-5 flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="flex items-center gap-2 text-base font-black uppercase tracking-tight text-slate-900 sm:text-lg dark:text-white">
          <TrendingUp className="h-5 w-5 text-brand-gold" />
          Comparateur de position des sites parapharmacie
        </h2>
        <span className="font-arabic text-sm text-slate-500 dark:text-white/50" dir="rtl">
          مقارنة ترتيب مواقع شبه الصيدلية
        </span>
      </div>

      {loading ? (
        <div className="space-y-2">
          {Array.from({ length: limit }).map((_, i) => (
            <div key={i} className="h-16 animate-pulse rounded-xl bg-slate-100 dark:bg-white/[0.04]" />
          ))}
        </div>
      ) : (
        <>
          {/* column header (desktop) */}
          <div className="relative hidden grid-cols-[2fr_1fr_1fr_1fr_1fr_1.3fr] gap-3 px-3 pb-2 text-[10px] font-bold uppercase tracking-wider text-slate-400 lg:grid dark:text-white/40">
            <div>Sites</div>
            <div className="text-center">Position</div>
            <div className="text-center">Évolution</div>
            <div className="text-center">Prix moyens</div>
            <div className="text-center">Promotions</div>
            <div className="text-center">Disponibilité</div>
            <div className="text-right">Visiteurs</div>
          </div>

          <ul className="relative space-y-2">
            {visible.map((s) => {
              const evo = evolutionFor(s.shop);
              return (
                <li
                  key={s.shop}
                  className="grid grid-cols-2 items-center gap-2 rounded-xl border border-slate-200 bg-slate-50/60 px-3 py-3 transition hover:border-brand-gold/30 hover:bg-white lg:grid-cols-[2fr_1fr_1fr_1fr_1fr_1.3fr] dark:border-white/[0.06] dark:bg-white/[0.02] dark:hover:bg-white/[0.04]"
                >
                  {/* shop + rank + logo */}
                  <div className="col-span-2 flex items-center gap-3 lg:col-span-1">
                    <span className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br text-xs font-black text-white shadow ${RANK_COLORS[s.rank - 1] ?? "from-slate-400 to-slate-500"}`}>
                      {s.rank}
                    </span>
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-white p-1 ring-1 ring-slate-200 dark:ring-white/10">
                      {s.logo ? (
                        <img src={s.logo} alt={s.displayName} referrerPolicy="no-referrer" className="h-full w-full object-contain"
                          onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = "none"; }} />
                      ) : (
                        <span className="text-xs font-black text-brand-gold">{s.displayName.charAt(0)}</span>
                      )}
                    </span>
                    <div className="min-w-0">
                      <div className="truncate text-sm font-bold text-slate-900 dark:text-white">{s.displayName}</div>
                      <div className="text-[11px] text-slate-400 dark:text-white/40 tabular-nums">{fmtInt(s.products)} produits</div>
                    </div>
                  </div>

                  {/* position score */}
                  <Metric label="Position" className="text-center">
                    <span className={`font-black tabular-nums ${s.rank === 1 ? "text-emerald-600 dark:text-emerald-400" : "text-slate-700 dark:text-white/80"}`}>
                      {s.score}/100
                    </span>
                  </Metric>

                  {/* evolution */}
                  <Metric label="Évolution" className="text-center">
                    <span className={`inline-flex items-center gap-0.5 font-bold tabular-nums ${
                      evo > 0 ? "text-emerald-600 dark:text-emerald-400" : evo < 0 ? "text-red-500 dark:text-red-400" : "text-slate-400"
                    }`}>
                      {evo > 0 ? <ChevronUp className="h-3.5 w-3.5" /> : evo < 0 ? <ChevronDown className="h-3.5 w-3.5" /> : <Minus className="h-3.5 w-3.5" />}
                      {evo === 0 ? "0" : Math.abs(evo)}
                    </span>
                  </Metric>

                  {/* avg price */}
                  <Metric label="Prix moyens" className="text-center">
                    <span className="font-bold tabular-nums text-slate-700 dark:text-white/80">{s.avgPrice.toFixed(3)} DT</span>
                  </Metric>

                  {/* promo */}
                  <Metric label="Promotions" className="text-center">
                    <span className="font-bold tabular-nums text-brand-gold">{Math.round(s.promoPct)}%</span>
                  </Metric>

                  {/* availability */}
                  <Metric label="Disponibilité" className="text-center">
                    <span className="font-bold tabular-nums text-emerald-600 dark:text-emerald-400">{Math.round(s.availability)}%</span>
                  </Metric>

                  {/* visitors */}
                  <Metric label="Visiteurs" className="text-right">
                    <span className="font-bold tabular-nums text-slate-700 dark:text-white/80">{fmtInt(s.visitors)}</span>
                  </Metric>
                </li>
              );
            })}
          </ul>

          {shops.length > limit && (
            <div className="mt-5 flex justify-center">
              <button
                onClick={() => setShowAll((v) => !v)}
                className="cursor-pointer rounded-full border border-brand-gold/40 bg-brand-gold/10 px-6 py-2.5 text-sm font-bold text-brand-gold transition hover:bg-brand-gold/15"
              >
                {showAll ? "Réduire" : "Voir le classement complet"}
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}

// Mobile: stacked label+value. Desktop: just the value (label hidden, header row covers it).
function Metric({ label, children, className = "" }: { label: string; children: React.ReactNode; className?: string }) {
  return (
    <div className={`flex flex-col lg:block ${className}`}>
      <span className="text-[9px] font-bold uppercase tracking-wider text-slate-400 lg:hidden dark:text-white/40">{label}</span>
      <span className="text-[13px]">{children}</span>
    </div>
  );
}
