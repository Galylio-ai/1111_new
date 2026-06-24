"use client";
import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  Award, BadgeCheck, ChevronLeft, Crown, Loader2, Percent, Star, TrendingDown, TrendingUp, Users,
} from "lucide-react";
import { PageShell } from "@/components/site/PageShell";
import { Reveal } from "@/components/site/Reveal";

type ShopStat = {
  shop: string;
  displayName: string;
  products: number;
  avgPrice: number;
  cheapestCount: number;
  promoCount: number;
  promoPct: number;
  availability: number;
  score: number;
  rank: number;
  logo: string | null;
  visitors: number;
};

const RANK_BG = [
  "bg-yellow-500",
  "bg-blue-500",
  "bg-red-600",
  "bg-emerald-600",
  "bg-purple-600",
  "bg-slate-500",
];

function fmtNumber(n: number): string {
  return n.toLocaleString("fr-FR");
}

function fmtPrice(n: number): string {
  return `${n.toFixed(2).replace(/\.?0+$/, "")} DT`;
}

function scoreTone(score: number) {
  if (score >= 85) return "text-emerald-600 dark:text-emerald-400";
  if (score >= 70) return "text-amber-600 dark:text-amber-300";
  return "text-red-500 dark:text-red-400";
}

export default function BarometreParapharmaciePage() {
  const [shops, setShops] = useState<ShopStat[] | null>(null);
  const [selected, setSelected] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/para-shops-stats")
      .then((r) => r.json())
      .then((d) => {
        if (cancelled) return;
        const arr: ShopStat[] = Array.isArray(d?.shops) ? d.shops : [];
        setShops(arr);
        if (arr[0]) setSelected(arr[0].shop);
      })
      .catch(() => setShops([]));
    return () => { cancelled = true; };
  }, []);

  const totals = useMemo(() => {
    if (!shops || shops.length === 0) return null;
    const products = shops.reduce((s, x) => s + x.products, 0);
    const promos = shops.reduce((s, x) => s + x.promoCount, 0);
    const visitors = shops.reduce((s, x) => s + x.visitors, 0);
    return { products, promos, visitors };
  }, [shops]);

  const selectedShop = useMemo(
    () => shops?.find((s) => s.shop === selected) ?? null,
    [shops, selected]
  );

  const ranked = useMemo(
    () => (shops ?? []).map((s, i) => ({
      ...s,
      rankBg: RANK_BG[Math.min(i, RANK_BG.length - 1)],
    })),
    [shops]
  );

  const podium = ranked.slice(0, 3);
  const rest = ranked.slice(3);

  return (
    <PageShell
      icon="gauge"
      title="Baromètre"
      accent="Parapharmacie"
      arabic="مقياس البارافارماسي"
      description="Classement complet des parapharmacies tunisiennes — score, prix moyens, parts de meilleurs prix, taux de promotion et audience estimée. Données calculées en direct depuis notre catalogue."
      chips={[
        { label: "Enseignes", value: String(shops?.length ?? "—"), tone: "gold" },
        { label: "Produits", value: totals ? fmtNumber(totals.products) : "—", tone: "emerald" },
        { label: "Promotions", value: totals ? fmtNumber(totals.promos) : "—", tone: "red" },
      ]}
    >
      <section className="mx-auto mt-6 max-w-[1600px] px-3 sm:px-4">
        <Link
          href="/barometres"
          className="mb-4 inline-flex items-center gap-1 text-xs font-semibold text-slate-500 transition hover:text-brand-gold dark:text-white/55"
        >
          <ChevronLeft className="h-3.5 w-3.5" />
          Tous les baromètres
        </Link>

        {!shops ? (
          <div className="flex items-center justify-center gap-2 rounded-2xl border border-dashed border-slate-300 bg-slate-50 py-16 text-sm text-slate-500 dark:border-white/10 dark:bg-white/[0.03] dark:text-white/55">
            <Loader2 className="h-4 w-4 animate-spin" />
            Chargement des données en direct…
          </div>
        ) : shops.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 py-16 text-center text-sm text-slate-500 dark:border-white/10 dark:bg-white/[0.03] dark:text-white/55">
            Aucune donnée disponible pour le moment.
          </div>
        ) : (
          <>
            {/* Podium — top 3 */}
            <Reveal>
              <h2 className="section-title mb-3">Podium</h2>
            </Reveal>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              {podium.map((s, i) => (
                <Reveal key={s.shop} delay={i * 0.05}>
                  <button
                    onClick={() => setSelected(s.shop)}
                    className={`card card-pad group relative w-full overflow-hidden text-left transition hover:-translate-y-1 ${
                      selected === s.shop ? "border-brand-gold/50 shadow-[0_0_24px_-8px_rgba(246,196,83,0.4)]" : ""
                    }`}
                  >
                    <span className={`absolute right-3 top-3 flex h-7 w-7 items-center justify-center rounded-full text-xs font-black text-white ${s.rankBg}`}>
                      {s.rank}
                    </span>
                    {i === 0 && (
                      <Crown className="absolute left-3 top-3 h-4 w-4 text-yellow-500 animate-pulse" />
                    )}
                    <div className="mt-2 flex items-center gap-3">
                      {s.logo ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={s.logo} alt={s.displayName} className="h-12 w-12 rounded-xl bg-white p-1 ring-1 ring-slate-200 dark:ring-white/10 object-contain" />
                      ) : (
                        <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-slate-100 text-base font-black text-slate-600 dark:bg-white/10 dark:text-white/60">
                          {s.displayName.charAt(0)}
                        </span>
                      )}
                      <div className="min-w-0">
                        <div className="truncate text-base font-extrabold text-slate-900 dark:text-white">{s.displayName}</div>
                        <div className="text-[11px] text-slate-500 dark:text-white/50">{fmtNumber(s.products)} produits</div>
                      </div>
                    </div>
                    <div className="mt-3 flex items-baseline gap-1.5">
                      <span className={`text-3xl font-black tabular-nums ${scoreTone(s.score)}`}>{s.score}</span>
                      <span className="text-xs text-slate-500 dark:text-white/45">/ 100</span>
                      <Star className={`ml-auto h-4 w-4 ${scoreTone(s.score)}`} />
                    </div>
                    <div className="mt-2 grid grid-cols-3 gap-1 text-center text-[10px]">
                      <div className="rounded-md bg-slate-50 px-1 py-1 dark:bg-bg-800">
                        <div className="font-bold tabular-nums text-emerald-600 dark:text-emerald-300">{fmtNumber(s.cheapestCount)}</div>
                        <div className="text-slate-500 dark:text-white/45">moins chers</div>
                      </div>
                      <div className="rounded-md bg-slate-50 px-1 py-1 dark:bg-bg-800">
                        <div className="font-bold tabular-nums text-slate-900 dark:text-white">{Math.round(s.promoPct)}%</div>
                        <div className="text-slate-500 dark:text-white/45">promos</div>
                      </div>
                      <div className="rounded-md bg-slate-50 px-1 py-1 dark:bg-bg-800">
                        <div className="font-bold tabular-nums text-slate-900 dark:text-white">{fmtNumber(s.visitors)}</div>
                        <div className="text-slate-500 dark:text-white/45">visiteurs</div>
                      </div>
                    </div>
                  </button>
                </Reveal>
              ))}
            </div>

            {/* Drill-down panel for selected shop */}
            {selectedShop && (
              <Reveal>
                <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-[1.6fr_1fr]">
                  <div className="card card-pad">
                    <div className="flex flex-wrap items-center gap-3">
                      {selectedShop.logo ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={selectedShop.logo} alt={selectedShop.displayName} className="h-14 w-14 rounded-xl bg-white p-1.5 ring-1 ring-slate-200 dark:ring-white/10 object-contain" />
                      ) : (
                        <span className="flex h-14 w-14 items-center justify-center rounded-xl bg-slate-100 text-lg font-black text-slate-600 dark:bg-white/10 dark:text-white/60">
                          {selectedShop.displayName.charAt(0)}
                        </span>
                      )}
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <h3 className="text-xl font-black text-slate-900 dark:text-white">{selectedShop.displayName}</h3>
                          <span className="rounded-full border border-brand-gold/30 bg-brand-gold/10 px-2 py-0.5 text-[10px] font-bold text-brand-gold">
                            Rang #{selectedShop.rank}
                          </span>
                        </div>
                        <div className="mt-0.5 text-xs text-slate-500 dark:text-white/55">
                          {fmtNumber(selectedShop.products)} produits suivis · prix moyen {fmtPrice(selectedShop.avgPrice)}
                        </div>
                      </div>
                      <Link
                        href={`/parapharmacie?shop=${encodeURIComponent(selectedShop.shop)}`}
                        className="rounded-full bg-brand-gold/15 px-3 py-1.5 text-[11px] font-bold text-brand-gold hover:bg-brand-gold/25 transition"
                      >
                        Voir les produits →
                      </Link>
                    </div>

                    <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
                      <DrillStat
                        icon={<Star className="h-4 w-4" />}
                        label="Score global"
                        value={`${selectedShop.score}/100`}
                        tone={scoreTone(selectedShop.score)}
                      />
                      <DrillStat
                        icon={<BadgeCheck className="h-4 w-4" />}
                        label="Meilleurs prix"
                        value={fmtNumber(selectedShop.cheapestCount)}
                        tone="text-emerald-600 dark:text-emerald-400"
                      />
                      <DrillStat
                        icon={<Percent className="h-4 w-4" />}
                        label="Taux promotions"
                        value={`${Math.round(selectedShop.promoPct)}%`}
                        tone="text-red-500 dark:text-red-300"
                      />
                      <DrillStat
                        icon={<Users className="h-4 w-4" />}
                        label="Visiteurs/mois"
                        value={fmtNumber(selectedShop.visitors)}
                        tone="text-blue-600 dark:text-blue-300"
                      />
                    </div>

                    {/* Score breakdown bars */}
                    <div className="mt-5">
                      <div className="mb-2 text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-white/55">
                        Décomposition du score
                      </div>
                      <ScoreBar label="Meilleurs prix" pct={pctFromMax(selectedShop.cheapestCount, shops, "cheapestCount")} color="bg-emerald-500" weight="45%" />
                      <ScoreBar label="Prix moyen" pct={inverseFromRange(selectedShop.avgPrice, shops, "avgPrice")} color="bg-amber-500" weight="25%" />
                      <ScoreBar label="Catalogue" pct={pctFromMax(selectedShop.products, shops, "products")} color="bg-blue-500" weight="15%" />
                      <ScoreBar label="Audience" pct={pctFromMax(selectedShop.visitors, shops, "visitors")} color="bg-purple-500" weight="15%" />
                    </div>
                  </div>

                  <div className="card card-pad">
                    <div className="flex items-center gap-2">
                      <Award className="h-4 w-4 text-brand-gold" />
                      <span className="text-[11px] font-bold uppercase tracking-wider text-brand-gold">Comparaison marché</span>
                    </div>
                    <div className="mt-4 space-y-3">
                      <CompareLine
                        label="Couverture catalogue"
                        value={`${selectedShop.availability.toFixed(1)}%`}
                        helper="part du catalogue total disponible chez cette enseigne"
                      />
                      <CompareLine
                        label="Position prix"
                        value={
                          selectedShop.avgPrice <= avg(shops, "avgPrice")
                            ? "Sous la moyenne"
                            : "Au-dessus de la moyenne"
                        }
                        helper={`moyenne marché ${fmtPrice(avg(shops, "avgPrice"))}`}
                        icon={selectedShop.avgPrice <= avg(shops, "avgPrice") ? <TrendingDown className="h-3.5 w-3.5 text-emerald-500" /> : <TrendingUp className="h-3.5 w-3.5 text-red-500" />}
                      />
                      <CompareLine
                        label="Produits en promo"
                        value={fmtNumber(selectedShop.promoCount)}
                        helper={`sur ${fmtNumber(selectedShop.products)} produits suivis`}
                      />
                    </div>
                  </div>
                </div>
              </Reveal>
            )}

            {/* Full ranking table */}
            <Reveal>
              <h2 className="section-title mb-3 mt-8">Classement complet</h2>
            </Reveal>
            <div className="card card-pad overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-[11px] uppercase tracking-wider text-slate-500 dark:text-white/45">
                    <th className="pb-3 text-left font-medium">#</th>
                    <th className="pb-3 text-left font-medium">Enseigne</th>
                    <th className="pb-3 text-center font-medium">Produits</th>
                    <th className="pb-3 text-center font-medium">Prix moyen</th>
                    <th className="pb-3 text-center font-medium">Meilleurs prix</th>
                    <th className="pb-3 text-center font-medium">Promos</th>
                    <th className="pb-3 text-center font-medium">Visiteurs</th>
                    <th className="pb-3 text-center font-medium">Score</th>
                    <th className="pb-3 text-right font-medium"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-white/5">
                  {ranked.map((s) => (
                    <tr
                      key={s.shop}
                      onClick={() => setSelected(s.shop)}
                      className={`cursor-pointer transition hover:bg-slate-50 dark:hover:bg-white/[0.02] ${
                        selected === s.shop ? "bg-brand-gold/5" : ""
                      }`}
                    >
                      <td className="py-3">
                        <span className={`inline-flex h-6 w-6 items-center justify-center rounded-md text-[11px] font-black text-white ${s.rankBg}`}>
                          {s.rank}
                        </span>
                      </td>
                      <td className="py-3">
                        <div className="flex items-center gap-2">
                          {s.logo ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img src={s.logo} alt={s.displayName} className="h-7 w-7 rounded-md bg-white p-0.5 ring-1 ring-slate-200 dark:ring-white/10 object-contain" />
                          ) : (
                            <span className="flex h-7 w-7 items-center justify-center rounded-md bg-slate-100 text-[11px] font-black text-slate-600 dark:bg-white/10 dark:text-white/60">
                              {s.displayName.charAt(0)}
                            </span>
                          )}
                          <span className="font-semibold text-slate-900 dark:text-white">{s.displayName}</span>
                        </div>
                      </td>
                      <td className="py-3 text-center tabular-nums text-slate-700 dark:text-white/75">{fmtNumber(s.products)}</td>
                      <td className="py-3 text-center tabular-nums text-slate-700 dark:text-white/75">{fmtPrice(s.avgPrice)}</td>
                      <td className="py-3 text-center tabular-nums font-semibold text-emerald-600 dark:text-emerald-300">{fmtNumber(s.cheapestCount)}</td>
                      <td className="py-3 text-center tabular-nums text-slate-700 dark:text-white/75">{Math.round(s.promoPct)}%</td>
                      <td className="py-3 text-center tabular-nums text-slate-700 dark:text-white/75">{fmtNumber(s.visitors)}</td>
                      <td className={`py-3 text-center font-black tabular-nums ${scoreTone(s.score)}`}>{s.score}</td>
                      <td className="py-3 text-right">
                        <Link
                          href={`/parapharmacie?shop=${encodeURIComponent(s.shop)}`}
                          onClick={(e) => e.stopPropagation()}
                          className="rounded-full bg-slate-100 px-2.5 py-1 text-[10px] font-bold text-slate-600 hover:bg-brand-gold/20 hover:text-brand-gold transition dark:bg-white/[0.05] dark:text-white/55"
                        >
                          Voir
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Methodology footnote */}
            <div className="mt-4 rounded-xl border border-slate-200 bg-slate-50 p-4 text-[11px] leading-relaxed text-slate-600 dark:border-white/5 dark:bg-bg-800 dark:text-white/65">
              <span className="font-bold text-brand-gold">Méthodologie. </span>
              Le score combine quatre signaux pondérés : part des produits où l'enseigne propose le meilleur prix (45%),
              niveau de prix moyen normalisé sur la fourchette du marché (25%), profondeur du catalogue (15%) et audience estimée (15%).
              Les visiteurs mensuels sont estimés à partir de la taille du catalogue et du nombre de meilleurs prix, et sont indicatifs.
              {rest.length > 0 && (
                <span> Affichage de toutes les <span className="font-bold text-slate-900 dark:text-white">{ranked.length}</span> enseignes parapharmacie suivies en direct.</span>
              )}
            </div>
          </>
        )}
      </section>
    </PageShell>
  );
}

function DrillStat({ icon, label, value, tone }: { icon: React.ReactNode; label: string; value: string; tone: string }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 dark:border-bg-border dark:bg-bg-800">
      <div className={`flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider ${tone}`}>
        {icon}
        {label}
      </div>
      <div className={`mt-1 text-xl font-black tabular-nums ${tone}`}>{value}</div>
    </div>
  );
}

function ScoreBar({ label, pct, color, weight }: { label: string; pct: number; color: string; weight: string }) {
  const clamped = Math.max(0, Math.min(100, pct));
  return (
    <div className="mb-2 last:mb-0">
      <div className="mb-0.5 flex items-center justify-between text-[10px]">
        <span className="text-slate-600 dark:text-white/65">
          {label} <span className="text-slate-400 dark:text-white/30">({weight})</span>
        </span>
        <span className="font-semibold tabular-nums text-slate-700 dark:text-white/75">{Math.round(clamped)}%</span>
      </div>
      <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-200 dark:bg-white/10">
        <div className={`h-full rounded-full ${color} transition-all duration-700`} style={{ width: `${clamped}%` }} />
      </div>
    </div>
  );
}

function CompareLine({ label, value, helper, icon }: { label: string; value: string; helper: string; icon?: React.ReactNode }) {
  return (
    <div className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 dark:border-bg-border dark:bg-bg-800">
      <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-white/50">{label}</div>
      <div className="mt-0.5 flex items-center gap-1.5 text-sm font-bold text-slate-900 dark:text-white">
        {icon}{value}
      </div>
      <div className="mt-0.5 text-[10px] text-slate-500 dark:text-white/45">{helper}</div>
    </div>
  );
}

function pctFromMax(value: number, shops: ShopStat[], key: keyof ShopStat): number {
  const max = Math.max(...shops.map((s) => (s[key] as number) || 0), 1);
  return (value / max) * 100;
}

function inverseFromRange(value: number, shops: ShopStat[], key: keyof ShopStat): number {
  const vals = shops.map((s) => (s[key] as number) || 0);
  const min = Math.min(...vals);
  const max = Math.max(...vals);
  if (max === min) return 100;
  return ((max - value) / (max - min)) * 100;
}

function avg(shops: ShopStat[], key: keyof ShopStat): number {
  if (shops.length === 0) return 0;
  return shops.reduce((s, x) => s + ((x[key] as number) || 0), 0) / shops.length;
}
