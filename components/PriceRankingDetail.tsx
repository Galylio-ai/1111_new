import Link from "next/link";
import {
  ArrowLeft,
  BarChart3,
  Info,
  ShieldCheck,
  Store,
  Trophy,
} from "lucide-react";
import { ShopLogo } from "@/components/shop/ShopLogo";
import {
  confidenceLabel,
  formatWinRate,
  shopDisplayName,
  type PriceRankingCatalogEntry,
} from "@/lib/priceRankings";
import type { RankedShopRow, ScopeRanking } from "@/lib/priceRankingsServer";

function fmtDate(iso: string | null) {
  if (!iso) return null;
  try {
    return new Date(iso).toLocaleDateString("fr-FR", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  } catch {
    return null;
  }
}

export function PriceRankingDetail({
  catalog,
  scope,
}: {
  catalog: PriceRankingCatalogEntry;
  scope: ScopeRanking;
}) {
  const updated = fmtDate(scope.generated_at);
  const top3 = scope.shops.slice(0, 3);
  const maxRate = Math.max(...top3.map((s) => s.fair_win_rate), 0.01);
  const podium = [...top3].sort((a, b) => b.rank - a.rank);

  return (
    <div className="min-w-0 space-y-5 sm:space-y-6">
      {/* Hero */}
      <div className="relative overflow-hidden rounded-2xl border border-slate-200 dark:border-white/[0.08]">
        <div className="relative aspect-[21/9] min-h-[160px] sm:min-h-[200px]">
          <img
            src={catalog.image}
            alt=""
            className="absolute inset-0 h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-slate-950/95 via-slate-950/75 to-slate-950/40" />
          <div className="relative flex h-full flex-col justify-end p-5 sm:p-8">
            <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-white/50">
              Classement prix · {scope.scope_name}
            </p>
            <h1 className="mt-2 text-2xl font-black tracking-tight text-white sm:text-3xl">
              {catalog.title}
            </h1>
            <p className="mt-2 max-w-2xl text-sm text-white/65">{catalog.subtitle}</p>
            {updated && (
              <p className="mt-3 text-[11px] text-white/40">Dernière analyse · {updated}</p>
            )}
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[
          { icon: BarChart3, label: "Produits comparés", value: scope.matched_products?.toLocaleString("fr-FR") ?? "—" },
          { icon: Store, label: "Enseignes", value: String(scope.distinct_shops ?? "—") },
          { icon: ShieldCheck, label: "Méthode", value: "Tête-à-tête" },
          { icon: Info, label: "Classement", value: `Top ${scope.shops.length}` },
        ].map((s) => (
          <div
            key={s.label}
            className="rounded-xl border border-slate-200 bg-white p-4 dark:border-white/[0.08] dark:bg-bg-800"
          >
            <s.icon className="mb-2 h-4 w-4 text-slate-400 dark:text-white/40" />
            <div className="text-xl font-black tabular-nums text-slate-900 dark:text-white">
              {s.value}
            </div>
            <div className="mt-0.5 text-[11px] text-slate-500 dark:text-white/45">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Podium */}
      {top3.length > 0 && (
        <div className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-white/[0.08] dark:bg-bg-800">
          <h2 className="text-sm font-bold uppercase tracking-wider text-slate-500 dark:text-white/50">
            Podium
          </h2>
          <div className="mt-4 flex items-end justify-center gap-3 sm:gap-6">
            {podium.map((shop) => {
              const ratio = shop.fair_win_rate / maxRate;
              const h = Math.round(36 + ratio * 56);
              const isFirst = shop.rank === 1;
              return (
                <div key={shop.shop_key} className="group/shop flex max-w-[140px] flex-1 flex-col items-center gap-2">
                  <ShopLogo
                    shopKey={shop.shop_key}
                    size={isFirst ? 58 : 48}
                    interactive
                    className={isFirst ? "ring-2 ring-brand-gold/40" : ""}
                  />
                  <span className="w-full truncate text-center text-xs font-bold text-slate-800 dark:text-white">
                    {shopDisplayName(shop.shop_key)}
                  </span>
                  <span
                    className={`rounded-full px-2 py-0.5 text-sm font-black tabular-nums ${
                      isFirst ? "bg-brand-gold/15 text-brand-gold" : "text-slate-500"
                    }`}
                  >
                    {formatWinRate(shop.fair_win_rate)}
                  </span>
                  <div
                    className={`flex w-full items-end justify-center overflow-hidden rounded-t-lg ${
                      isFirst
                        ? "bg-gradient-to-t from-amber-500 to-brand-gold shadow-[0_-4px_16px_rgba(246,196,83,0.35)] ring-1 ring-brand-gold/30"
                        : "bg-gradient-to-t from-slate-500 to-slate-400 shadow-inner dark:from-slate-600 dark:to-slate-500"
                    }`}
                    style={{ height: h }}
                  >
                    <div className="flex items-center justify-center pb-1.5">
                      {isFirst ? (
                        <Trophy
                          className="h-5 w-5 text-slate-900 sm:h-6 sm:w-6"
                          strokeWidth={2.25}
                          fill="currentColor"
                          fillOpacity={0.15}
                        />
                      ) : (
                        <span className="pb-0 text-sm font-black text-white sm:text-base">{shop.rank}</span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Methodology */}
      <div className="rounded-2xl border border-slate-200 bg-slate-50/80 p-5 sm:p-6 dark:border-white/[0.08] dark:bg-bg-800/80">
        <h2 className="flex items-center gap-2 text-base font-bold text-slate-900 dark:text-white">
          <Info className="h-4 w-4 text-slate-500" />
          Comment lire ce classement
        </h2>
        <p className="mt-3 text-sm leading-relaxed text-slate-600 dark:text-white/70">
          Ce n&apos;est pas un simple « panier moyen » ou un décompte de promotions. Nous comparons
          les <strong>mêmes produits identifiés</strong> entre plusieurs boutiques tunisiennes et
          mesurons qui propose le <strong>meilleur prix le plus souvent</strong>.
        </p>
        <div className="mt-5 grid gap-3 sm:grid-cols-2">
          {[
            {
              title: "Comparaisons équitables",
              body: "Deux enseignes ne sont confrontées que sur les articles qu'elles vendent toutes les deux. Une boutique n'est pas pénalisée pour son catalogue plus restreint.",
            },
            {
              title: "Taux de victoire",
              body: "Le score principal (« fair win rate ») = (victoires + ½ × nuls) ÷ confrontations. Le moins cher remporte la manche ; les prix égaux comptent comme match nul.",
            },
            {
              title: "Qualité des prix",
              body: "Les erreurs d'échelle (millimes vs dinars) sont corrigées quand les prix voisins le prouvent. Les valeurs aberrantes extrêmes sont exclues.",
            },
            {
              title: "Niveau de confiance",
              body: "Le badge « Données solides » indique au moins 20 confrontations et 5 produits comparés — assez pour un signal fiable.",
            },
          ].map((item) => (
            <div
              key={item.title}
              className="rounded-xl border border-slate-200/80 bg-white p-4 dark:border-white/[0.06] dark:bg-bg-900/50"
            >
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">{item.title}</h3>
              <p className="mt-1.5 text-xs leading-relaxed text-slate-600 dark:text-white/60">
                {item.body}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Full table */}
      <div className="overflow-hidden rounded-2xl border border-slate-200 dark:border-white/[0.08]">
        <div className="border-b border-slate-200 bg-white px-5 py-4 dark:border-white/[0.06] dark:bg-bg-800">
          <h2 className="text-sm font-bold uppercase tracking-wider text-slate-900 dark:text-white">
            Classement complet
          </h2>
        </div>
        <div className="overflow-x-auto bg-white dark:bg-bg-800">
          <table className="w-full min-w-[640px] text-left text-sm">
            <thead>
              <tr className="border-b border-slate-100 text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:border-white/[0.06] dark:text-white/40">
                <th className="px-5 py-3">Rang</th>
                <th className="px-3 py-3">Enseigne</th>
                <th className="px-3 py-3">Victoires équitables</th>
                <th className="hidden px-3 py-3 sm:table-cell">Produits</th>
                <th className="hidden px-3 py-3 md:table-cell">Confrontations</th>
                <th className="px-5 py-3">Confiance</th>
              </tr>
            </thead>
            <tbody>
              {scope.shops.map((row: RankedShopRow) => {
                const isLeader = row.rank === 1;
                return (
                  <tr
                    key={row.shop_key}
                    className={`border-b border-slate-50 transition hover:bg-slate-50/80 dark:border-white/[0.04] dark:hover:bg-white/[0.02] ${
                      isLeader ? "bg-brand-gold/[0.04]" : ""
                    }`}
                  >
                    <td className="px-5 py-3.5 font-black tabular-nums text-slate-700 dark:text-white/80">
                      {row.rank}
                    </td>
                    <td className="px-3 py-3.5">
                      <div className="flex items-center gap-3">
                        <ShopLogo shopKey={row.shop_key} size={36} />
                        <span className="font-semibold text-slate-900 dark:text-white">
                          {shopDisplayName(row.shop_key)}
                        </span>
                      </div>
                    </td>
                    <td className="px-3 py-3.5">
                      <span className="text-base font-black tabular-nums text-slate-900 dark:text-white">
                        {formatWinRate(row.fair_win_rate)}
                      </span>
                      {row.wins != null && (
                        <div className="text-[10px] text-slate-400 dark:text-white/35">
                          {row.wins}V · {row.losses ?? 0}D · {row.ties ?? 0}N
                        </div>
                      )}
                    </td>
                    <td className="hidden px-3 py-3.5 tabular-nums text-slate-600 dark:text-white/65 sm:table-cell">
                      {row.products_compared}
                    </td>
                    <td className="hidden px-3 py-3.5 tabular-nums text-slate-600 dark:text-white/65 md:table-cell">
                      {row.pairwise_comparisons?.toLocaleString("fr-FR") ?? "—"}
                    </td>
                    <td className="px-5 py-3.5">
                      <span
                        className={`inline-block rounded-md px-2 py-0.5 text-[10px] font-semibold ${
                          row.confidence === "enough_data"
                            ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400"
                            : "bg-amber-500/10 text-amber-700 dark:text-amber-400"
                        }`}
                      >
                        {confidenceLabel(row.confidence)}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      <div className="flex flex-wrap gap-3">
        <Link
          href={`/retail?cat=${encodeURIComponent(catalog.retailCat)}`}
          className="inline-flex items-center gap-2 rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800 dark:bg-white dark:text-slate-900 dark:hover:bg-white/90"
        >
          <Store className="h-4 w-4" />
          Parcourir les produits
        </Link>
        <Link
          href="/"
          className="inline-flex items-center gap-2 rounded-lg border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:border-slate-300 dark:border-white/10 dark:text-white/80"
        >
          <ArrowLeft className="h-4 w-4" />
          Retour à l&apos;accueil
        </Link>
      </div>
    </div>
  );
}
