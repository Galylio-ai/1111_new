"use client";

import { useEffect, useState } from "react";
import { PriceRankingCard } from "@/components/PriceRankingCard";
import { PRICE_RANKING_CATALOG } from "@/lib/priceRankings";

type ScopePayload = {
  scope_id: string;
  scope_name: string;
  matched_products: number;
  distinct_shops: number;
  shops: Array<{
    rank: number;
    shop_key: string;
    fair_win_rate: number;
    products_compared: number;
  }>;
};

const SKELETON = (
  <div className="animate-pulse overflow-hidden rounded-2xl border border-bg-border bg-bg-card">
    <div className="aspect-[16/10] bg-slate-100 dark:bg-white/[0.04]" />
    <div className="space-y-2 p-4">
      <div className="h-3 w-24 rounded bg-slate-100 dark:bg-white/[0.04]" />
      <div className="h-12 rounded-xl bg-slate-100 dark:bg-white/[0.04]" />
      <div className="h-12 rounded-xl bg-slate-100 dark:bg-white/[0.04]" />
      <div className="h-12 rounded-xl bg-slate-100 dark:bg-white/[0.04]" />
    </div>
    <div className="border-t border-bg-border p-4 dark:border-white/[0.06]">
      <div className="h-10 rounded-xl bg-slate-100 dark:bg-white/[0.04]" />
    </div>
  </div>
);

export function TechOffers() {
  const [scopes, setScopes] = useState<ScopePayload[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/stats/price-rankings?featured=1")
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => {
        if (Array.isArray(d?.scopes)) setScopes(d.scopes);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const catalogOrder = PRICE_RANKING_CATALOG.map((c) => c.scopeId);
  const cards = catalogOrder
    .map((scopeId) => {
      const catalog = PRICE_RANKING_CATALOG.find((c) => c.scopeId === scopeId)!;
      const scope = scopes.find((s) => s.scope_id === scopeId);
      if (!scope) return null;
      return { catalog, scope };
    })
    .filter(Boolean) as Array<{ catalog: (typeof PRICE_RANKING_CATALOG)[0]; scope: ScopePayload }>;

  const totalProducts = scopes.reduce((a, s) => a + (s.matched_products ?? 0), 0);

  const scrollRowClass =
    "-mx-3 flex snap-x snap-mandatory gap-4 overflow-x-auto px-3 pb-1 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden sm:mx-0 sm:px-0";
  const cardWrapClass = "w-[min(88vw,20rem)] shrink-0 snap-start sm:w-[19rem] lg:w-[21rem]";

  return (
    <section className="mx-auto mt-8 max-w-[1600px] px-3 sm:px-4">
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h2 className="section-title">MEILLEURS PRIX PAR CATÉGORIE</h2>
          <p className="mt-2 max-w-xl text-sm text-slate-500 dark:text-white/50">
            Classement des enseignes par comparaison produit à produit
            {totalProducts > 0 && (
              <> — <span className="font-medium text-slate-700 dark:text-white/70">{totalProducts.toLocaleString("fr-FR")} références</span> analysées</>
            )}
          </p>
        </div>
        <span className="text-[10px] font-medium text-slate-400 dark:text-white/35">Glisser →</span>
      </div>

      {loading ? (
        <div className={scrollRowClass}>
          {PRICE_RANKING_CATALOG.map((c) => (
            <div key={c.slug} className={cardWrapClass}>
              {SKELETON}
            </div>
          ))}
        </div>
      ) : cards.length === 0 ? (
        <div className="rounded-xl border border-slate-200 bg-slate-50 px-6 py-12 text-center text-sm text-slate-500 dark:border-white/[0.08] dark:bg-bg-800 dark:text-white/45">
          Classements en cours de chargement. Vérifiez que les données sont importées dans la base retail.
        </div>
      ) : (
        <div className={scrollRowClass}>
          {cards.map(({ catalog, scope }) => (
            <div key={catalog.slug} className={cardWrapClass}>
              <PriceRankingCard
                catalog={catalog}
                scopeName={scope.scope_name}
                matchedProducts={scope.matched_products}
                shopCount={scope.distinct_shops}
                shops={scope.shops}
              />
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
