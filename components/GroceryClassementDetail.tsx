import Link from "next/link";
import {
  ArrowLeft,
  BarChart3,
  GitCompareArrows,
  Info,
  Store,
  TrendingDown,
} from "lucide-react";
import { GrocerySupermarketBars } from "@/components/GrocerySupermarketBars";
import {
  formatCheapestWins,
  getGroceryCrossingData,
  shopLogoPath,
  shopShortName,
} from "@/lib/groceryCrossing";

function fmtDate(iso: string) {
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

export function GroceryClassementDetail() {
  const data = getGroceryCrossingData();
  const { summary, featured_shops, shop_health, carrefour_family, generated_at } = data;
  const updated = fmtDate(generated_at);
  const leader = featured_shops[0];
  const depthEntries = Object.entries(summary.crossingDepth)
    .map(([k, v]) => ({ shops: Number(k), count: v }))
    .filter((d) => d.shops >= 2)
    .sort((a, b) => b.shops - a.shops);

  return (
    <div className="min-w-0 space-y-5 sm:space-y-6">
      <div className="relative overflow-hidden rounded-2xl border border-emerald-500/20 bg-gradient-to-br from-emerald-950/90 via-slate-950/95 to-slate-950 p-5 sm:p-8">
        <div className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full bg-emerald-500/20 blur-3xl" />
        <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-emerald-400/80">
          Classement courses · Grande distribution
        </p>
        <h2 className="mt-2 text-2xl font-black tracking-tight text-white sm:text-3xl">
          Quel supermarché est le moins cher ?
        </h2>
        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-white/65">
          Analyse par <strong className="text-white/90">croisement d&apos;enseignes</strong> : nous
          comparons le même produit lorsqu&apos;il est disponible chez plusieurs enseignes, puis
          comptons qui propose le prix le plus bas le plus souvent.
        </p>
        {leader && (
          <p className="mt-3 text-sm font-semibold text-emerald-300">
            {shopShortName(leader.shop_name)} en tête avec {leader.cheapest_rate_pct}% de victoires
            sur {leader.price_comparisons.toLocaleString("fr-FR")} confrontations de prix.
          </p>
        )}
        {updated && (
          <p className="mt-2 text-[11px] text-white/40">Dernière analyse · {updated}</p>
        )}
      </div>

      <div className="grid grid-cols-2 gap-2 sm:gap-3 sm:grid-cols-4">
        {[
          { icon: BarChart3, label: "Produits indexés", value: summary.products.toLocaleString("fr-FR") },
          { icon: GitCompareArrows, label: "Produits croisés", value: summary.crossed_products.toLocaleString("fr-FR") },
          { icon: Store, label: "Enseignes", value: String(summary.shops) },
          { icon: TrendingDown, label: "Offres suivies", value: summary.offers.toLocaleString("fr-FR") },
        ].map((s) => (
          <div
            key={s.label}
            className="rounded-xl border border-slate-200 bg-white p-4 dark:border-white/[0.08] dark:bg-bg-800"
          >
            <s.icon className="mb-2 h-4 w-4 text-brand-gold" />
            <p className="text-xl font-black tabular-nums text-slate-900 dark:text-white">{s.value}</p>
            <p className="mt-0.5 text-[11px] text-slate-500 dark:text-white/50">{s.label}</p>
          </div>
        ))}
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-white/[0.08] dark:bg-bg-800">
        <h3 className="text-sm font-bold text-slate-900 dark:text-white">Podium — 6 enseignes principales</h3>
        <p className="mt-1 text-xs text-slate-500 dark:text-white/50">
          Classement par taux de victoires sur les produits effectivement comparables entre enseignes.
        </p>
        <div className="mt-4">
          <GrocerySupermarketBars shops={featured_shops} />
        </div>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white dark:border-white/[0.08] dark:bg-bg-800">
        <div className="border-b border-slate-200 px-5 py-4 dark:border-white/[0.06]">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white">Toutes les enseignes</h3>
          <p className="mt-0.5 text-xs text-slate-500 dark:text-white/50">
            Inclut Monoprix Glovo (livraison) en plus des 6 enseignes physiques.
          </p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[640px] text-left text-sm">
            <thead>
              <tr className="border-b border-slate-100 text-[11px] uppercase tracking-wide text-slate-400 dark:border-white/[0.06]">
                <th className="px-5 py-3 font-semibold">#</th>
                <th className="px-3 py-3 font-semibold">Enseigne</th>
                <th className="px-3 py-3 font-semibold text-right">Produits</th>
                <th className="px-3 py-3 font-semibold text-right">Croisés</th>
                <th className="px-3 py-3 font-semibold text-right">Victoires</th>
                <th className="px-3 py-3 font-semibold text-right">Taux</th>
              </tr>
            </thead>
            <tbody>
              {shop_health.map((shop, i) => (
                <tr
                  key={shop.shop_name}
                  className="border-b border-slate-50 last:border-0 dark:border-white/[0.04]"
                >
                  <td className="px-5 py-3 font-bold tabular-nums text-slate-400">{i + 1}</td>
                  <td className="px-3 py-3">
                    <div className="flex items-center gap-2">
                      <img
                        src={shopLogoPath(shop.shop_name)}
                        alt=""
                        className="h-8 w-8 rounded-md bg-white object-contain p-0.5 ring-1 ring-slate-200 dark:ring-white/10"
                      />
                      <span className="font-semibold text-slate-800 dark:text-white/90">
                        {shop.shop_name}
                      </span>
                    </div>
                  </td>
                  <td className="px-3 py-3 text-right tabular-nums text-slate-600 dark:text-white/70">
                    {shop.total_products.toLocaleString("fr-FR")}
                  </td>
                  <td className="px-3 py-3 text-right tabular-nums text-slate-600 dark:text-white/70">
                    {shop.crossed_products.toLocaleString("fr-FR")}
                  </td>
                  <td className="px-3 py-3 text-right tabular-nums font-semibold text-slate-800 dark:text-white/90">
                    {shop.cheapest_wins.toLocaleString("fr-FR")}
                  </td>
                  <td className="px-3 py-3 text-right">
                    <span
                      className={`inline-flex rounded-full px-2 py-0.5 text-xs font-bold tabular-nums ${
                        i === 0
                          ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-300"
                          : "bg-slate-100 text-slate-600 dark:bg-white/5 dark:text-white/60"
                      }`}
                    >
                      {shop.cheapest_rate_pct}%
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-white/[0.08] dark:bg-bg-800">
          <div className="flex items-start gap-2">
            <Info className="mt-0.5 h-4 w-4 shrink-0 text-brand-gold" />
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">Méthodologie</h3>
              <ul className="mt-3 space-y-2 text-xs leading-relaxed text-slate-600 dark:text-white/65">
                <li>
                  <strong className="text-slate-800 dark:text-white/85">Produit croisé</strong> — même
                  référence trouvée dans au moins 2 enseignes ({summary.crossed_products.toLocaleString("fr-FR")}{" "}
                  produits sur {summary.products.toLocaleString("fr-FR")}).
                </li>
                <li>
                  <strong className="text-slate-800 dark:text-white/85">Victoire prix</strong> — pour
                  chaque confrontation, l&apos;enseigne avec le prix le plus bas remporte 1 point.
                </li>
                <li>
                  <strong className="text-slate-800 dark:text-white/85">Taux de victoires</strong> —
                  victoires ÷ confrontations de prix sur les produits où l&apos;enseigne est présente.
                  C&apos;est ce critère qui détermine le classement affiché.
                </li>
                <li>
                  <strong className="text-slate-800 dark:text-white/85">Profondeur de croisement</strong> —
                  un produit présent dans 7 enseignes compte dans toutes les combinaisons pertinentes
                  (paires, triplets, etc.).
                </li>
              </ul>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-white/[0.08] dark:bg-bg-800">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white">Profondeur du croisement</h3>
          <p className="mt-1 text-xs text-slate-500 dark:text-white/50">
            Nombre de produits présents simultanément dans N enseignes.
          </p>
          <div className="mt-4 space-y-2">
            {depthEntries.map((d) => {
              const pct = Math.round((d.count / summary.crossed_products) * 100);
              return (
                <div key={d.shops}>
                  <div className="mb-1 flex justify-between text-[11px]">
                    <span className="text-slate-600 dark:text-white/70">{d.shops} enseignes</span>
                    <span className="font-semibold tabular-nums text-slate-800 dark:text-white/90">
                      {d.count.toLocaleString("fr-FR")}
                    </span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-slate-100 dark:bg-white/5">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-brand-gold to-amber-500"
                      style={{ width: `${Math.max(pct, 2)}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {carrefour_family.length > 0 && (
        <div className="rounded-2xl border border-slate-200 bg-white dark:border-white/[0.08] dark:bg-bg-800">
          <div className="border-b border-slate-200 px-5 py-4 dark:border-white/[0.06]">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">Famille Carrefour</h3>
            <p className="mt-0.5 text-xs text-slate-500 dark:text-white/50">
              Comparaison interne entre Carrefour, Carrefour Market et Carrefour Express sur les
              produits communs.
            </p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[560px] text-left text-sm">
              <thead>
                <tr className="border-b border-slate-100 text-[11px] uppercase tracking-wide text-slate-400 dark:border-white/[0.06]">
                  <th className="px-5 py-3 font-semibold">Canaux</th>
                  <th className="px-3 py-3 font-semibold text-right">Produits</th>
                  <th className="px-3 py-3 font-semibold">Moins cher</th>
                  <th className="px-3 py-3 font-semibold text-right">Écart moy.</th>
                </tr>
              </thead>
              <tbody>
                {carrefour_family.map((row) => (
                  <tr
                    key={row.shops}
                    className="border-b border-slate-50 last:border-0 dark:border-white/[0.04]"
                  >
                    <td className="px-5 py-3 text-xs font-medium text-slate-700 dark:text-white/80">
                      {row.shops}
                    </td>
                    <td className="px-3 py-3 text-right tabular-nums text-slate-600 dark:text-white/70">
                      {row.products.toLocaleString("fr-FR")}
                    </td>
                    <td className="px-3 py-3 text-xs text-slate-600 dark:text-white/70">
                      {formatCheapestWins(row.cheapest_wins)}
                    </td>
                    <td className="px-3 py-3 text-right tabular-nums font-semibold text-slate-800 dark:text-white/90">
                      {row.avg_spread_pct}%
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <div className="flex flex-wrap gap-3">
        <Link
          href="/supermarche"
          className="inline-flex items-center gap-1.5 text-sm font-semibold text-brand-gold transition hover:gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Retour au supermarché
        </Link>
      </div>
    </div>
  );
}
