import Link from "next/link";
import {
  ArrowLeft,
  ExternalLink,
  Info,
  ShoppingCart,
  Store,
} from "lucide-react";
import {
  BASKET_CATEGORY_LABELS,
  fmtDateFr,
  fmtDt,
  getEssentialBasketData,
  shopDisplayName,
  type BasketProductRow,
} from "@/lib/essentialBasket";
import { EssentialBasketRanking } from "@/components/EssentialBasketRanking";
import { getStoreLogo } from "@/lib/data";

function ProductTable({
  rows,
  shops,
}: {
  rows: BasketProductRow[];
  shops: string[];
}) {
  return (
    <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white dark:border-white/[0.08] dark:bg-bg-800">
      <table className="w-full min-w-[720px] text-left text-sm">
        <thead>
          <tr className="border-b border-slate-100 text-[11px] uppercase tracking-wide text-slate-400 dark:border-white/[0.06]">
            <th className="px-4 py-3 font-semibold">Produit</th>
            {shops.map((shop) => (
              <th key={shop} className="px-2 py-3 text-right font-semibold">
                <span className="hidden sm:inline">{shopDisplayName(shop)}</span>
                <span className="sm:hidden">{shopDisplayName(shop).split(" ")[0]}</span>
              </th>
            ))}
            <th className="px-4 py-3 font-semibold">Moins cher</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr
              key={row.productId}
              className="border-b border-slate-50 last:border-0 dark:border-white/[0.04]"
            >
              <td className="px-4 py-3">
                <div className="text-[10px] font-bold uppercase tracking-wide text-brand-gold">
                  {row.category}
                </div>
                <div className="mt-0.5 font-semibold text-slate-900 dark:text-white">{row.name}</div>
                <div className="text-[11px] text-slate-500 dark:text-white/45">{row.choice}</div>
              </td>
              {row.prices.map((p) => {
                const isMin = p.price === row.minPrice;
                return (
                  <td key={p.shop} className="px-2 py-3 text-right tabular-nums">
                    {p.url ? (
                      <a
                        href={p.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={`inline-flex items-center justify-end gap-0.5 transition hover:text-brand-gold ${isMin ? "font-bold text-emerald-600 dark:text-emerald-300" : "text-slate-600 dark:text-white/70"}`}
                      >
                        {fmtDt(p.price)}
                        <ExternalLink className="h-2.5 w-2.5 opacity-50" />
                      </a>
                    ) : (
                      <span
                        className={isMin ? "font-bold text-emerald-600 dark:text-emerald-300" : "text-slate-600 dark:text-white/70"}
                      >
                        {fmtDt(p.price)}
                      </span>
                    )}
                  </td>
                );
              })}
              <td className="px-4 py-3 text-xs text-slate-600 dark:text-white/65">
                {row.cheapestLabel.split(" + ").map(shopDisplayName).join(" · ")}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function EssentialBasketDetail() {
  const data = getEssentialBasketData();
  const { fiveShop, carrefourFamily } = data;
  const updated = fmtDateFr(fiveShop.generatedAt);
  const leader = fiveShop.ranking[0];

  return (
    <div className="min-w-0 space-y-5 sm:space-y-6">
      <div className="relative overflow-hidden rounded-2xl border border-emerald-200/80 bg-gradient-to-br from-emerald-50/90 via-white to-slate-50 p-5 sm:p-8 dark:border-emerald-500/20 dark:from-emerald-950/90 dark:via-slate-950/95 dark:to-slate-950">
        <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-emerald-700 dark:text-emerald-400/80">
          Grande distribution · Panier essentiel
        </p>
        <h2 className="mt-2 text-2xl font-black tracking-tight text-slate-900 sm:text-3xl dark:text-white">
          Quel supermarché pour un panier de base ?
        </h2>
        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-slate-600 dark:text-white/65">
          Comparaison <strong className="text-slate-900 dark:text-white/90">stricte</strong> : les mêmes{" "}
          {fiveShop.productCount} produits, disponibles simultanément chez Carrefour, Carrefour Market,
          Carrefour Express, Monoprix et Géant. Le total est la somme des prix affichés en ligne.
        </p>
        {leader && (
          <p className="mt-3 text-sm font-semibold text-emerald-700 dark:text-emerald-300">
            {shopDisplayName(leader.shop)} en tête à {fmtDt(leader.total)} DT — économie jusqu&apos;à{" "}
            {fmtDt(fiveShop.maxSavings)} DT vs l&apos;enseigne la plus chère.
          </p>
        )}
        {updated && <p className="mt-2 text-[11px] text-slate-400 dark:text-white/40">Dernière analyse · {updated}</p>}
      </div>

      <div className="grid grid-cols-2 gap-2 sm:gap-3 sm:grid-cols-4">
        {[
          { icon: ShoppingCart, label: "Produits comparés", value: String(fiveShop.productCount) },
          { icon: Store, label: "Enseignes", value: String(fiveShop.shops.length) },
          {
            icon: Info,
            label: "Panier optimal*",
            value: `${fmtDt(fiveShop.optimalBasketTotal)} DT`,
          },
          {
            icon: Info,
            label: "Écart max",
            value: `${fmtDt(fiveShop.maxSavings)} DT`,
          },
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
        <h3 className="text-sm font-bold text-slate-900 dark:text-white">Classement par enseigne</h3>
        <p className="mt-1 text-xs text-slate-500 dark:text-white/50">
          Total du panier si tous les produits sont achetés dans la même enseigne.
        </p>
        <div className="mt-4">
          <EssentialBasketRanking showEconomy={false} showCta={false} />
        </div>
      </div>

      <div>
        <h3 className="mb-3 text-sm font-bold text-slate-900 dark:text-white">
          Détail produit par produit
        </h3>
        <ProductTable rows={fiveShop.rows} shops={fiveShop.shops} />
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white dark:border-white/[0.08] dark:bg-bg-800">
        <div className="border-b border-slate-200 px-5 py-4 dark:border-white/[0.06]">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white">Famille Carrefour</h3>
          <p className="mt-0.5 text-xs text-slate-500 dark:text-white/50">
            Même méthode sur 11 produits stricts — Carrefour, Carrefour Market et Carrefour Express uniquement.
          </p>
        </div>
        <div className="p-4 sm:p-5">
          <div className="mb-4 flex flex-wrap gap-3">
            {carrefourFamily.shops.map((shop) => {
              const total = carrefourFamily.totals[shop];
              const logo = getStoreLogo(shop);
              return (
                <div
                  key={shop}
                  className="flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 dark:border-white/[0.08] dark:bg-white/[0.03]"
                >
                  {logo && (
                    <img src={logo} alt="" className="h-8 w-8 rounded-md bg-white object-contain p-0.5" />
                  )}
                  <div>
                    <div className="text-xs font-semibold text-slate-800 dark:text-white/90">
                      {shopDisplayName(shop)}
                    </div>
                    <div className="text-sm font-black tabular-nums text-brand-gold">
                      {fmtDt(total)} DT
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
          <ProductTable rows={carrefourFamily.rows} shops={carrefourFamily.shops} />
        </div>
      </div>

      <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-xs leading-relaxed text-slate-600 dark:border-white/[0.08] dark:bg-white/[0.03] dark:text-white/60">
        <p>
          <strong className="text-slate-800 dark:text-white/85">* Panier optimal</strong> — somme du prix
          le plus bas par ligne, toutes enseignes confondues ({fmtDt(fiveShop.optimalBasketTotal)} DT).
          Différent du total en une seule enseigne (meilleur : {leader ? shopDisplayName(leader.shop) : "—"} à{" "}
          {leader ? fmtDt(leader.total) : "—"} DT).
        </p>
        <p className="mt-2">
          Pour le classement global sur tous les produits croisés (7 enseignes, méthode shop-crossing), voir{" "}
          <Link href="/supermarche/classement" className="font-semibold text-brand-gold hover:underline">
            le classement courses
          </Link>
          .
        </p>
      </div>

      <div className="flex flex-wrap gap-3">
        <Link
          href="/supermarche"
          className="inline-flex items-center gap-1.5 text-sm font-semibold text-brand-gold transition hover:gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Retour supermarché
        </Link>
        <Link href="/qoffa" className="text-sm font-semibold text-slate-500 transition hover:text-brand-gold dark:text-white/50">
          Qoffa Tounsi →
        </Link>
      </div>
    </div>
  );
}
