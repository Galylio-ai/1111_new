import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { ShopLogo } from "@/components/shop/ShopLogo";
import {
  formatWinRate,
  shopDisplayName,
  type PriceRankingCatalogEntry,
} from "@/lib/priceRankings";

export type RankingShopPreview = {
  rank: number;
  shop_key: string;
  fair_win_rate: number;
  products_compared: number;
};

function rankBarHeight(rank: number, winRate: number, maxRate: number) {
  const ratio = maxRate > 0 ? winRate / maxRate : 0;
  const h = Math.round(28 + ratio * 44);
  if (rank === 1) return { h, tone: "bg-brand-gold" };
  if (rank === 2) return { h, tone: "bg-slate-400 dark:bg-slate-500" };
  return { h, tone: "bg-slate-500/70 dark:bg-slate-600" };
}

export function PriceRankingCard({
  catalog,
  scopeName,
  matchedProducts,
  shopCount,
  shops,
}: {
  catalog: PriceRankingCatalogEntry;
  scopeName: string;
  matchedProducts: number;
  shopCount: number;
  shops: RankingShopPreview[];
}) {
  const top3 = shops.slice(0, 3);
  const maxRate = Math.max(...top3.map((s) => s.fair_win_rate), 0.01);
  const ordered = [...top3].sort((a, b) => b.rank - a.rank);

  return (
    <article className="group flex flex-col overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm transition hover:border-slate-300 hover:shadow-md dark:border-white/[0.08] dark:bg-bg-800 dark:hover:border-white/15">
      {/* Hero image */}
      <div className="relative aspect-[16/10] overflow-hidden bg-slate-100 dark:bg-bg-900">
        <img
          src={catalog.image}
          alt=""
          className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.03]"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/35 to-transparent" />
        <div className="absolute inset-x-0 bottom-0 p-4 sm:p-5">
          <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-white/55">
            {catalog.subtitle}
          </p>
          <h3 className="mt-1 text-lg font-black tracking-tight text-white sm:text-xl">
            {catalog.title}
          </h3>
          <p className="mt-1 text-[11px] text-white/50">
            {matchedProducts.toLocaleString("fr-FR")} produits · {shopCount} enseignes
          </p>
        </div>
      </div>

      {/* Rankings — #1 on the right */}
      <div className="border-b border-slate-100 px-4 py-4 dark:border-white/[0.06]">
        <p className="mb-3 text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-white/40">
          Top 3 enseignes
        </p>
        {top3.length === 0 ? (
          <p className="py-4 text-center text-xs text-slate-400">Données indisponibles</p>
        ) : (
          <div className="flex items-end justify-center gap-2 sm:gap-3">
            {ordered.map((shop) => {
              const bar = rankBarHeight(shop.rank, shop.fair_win_rate, maxRate);
              const isFirst = shop.rank === 1;
              return (
                <div
                  key={shop.shop_key}
                  className="flex min-w-0 flex-1 flex-col items-center gap-1.5"
                >
                  <ShopLogo shopKey={shop.shop_key} size={isFirst ? 44 : 38} />
                  <span
                    className={`w-full truncate text-center text-[10px] font-semibold leading-tight sm:text-[11px] ${
                      isFirst
                        ? "text-slate-900 dark:text-white"
                        : "text-slate-500 dark:text-white/55"
                    }`}
                  >
                    {shopDisplayName(shop.shop_key)}
                  </span>
                  <span
                    className={`text-[11px] font-bold tabular-nums ${
                      isFirst ? "text-brand-gold" : "text-slate-500 dark:text-white/50"
                    }`}
                  >
                    {formatWinRate(shop.fair_win_rate)}
                  </span>
                  <div
                    className={`flex w-full items-end justify-center rounded-t-md ${bar.tone}`}
                    style={{ height: bar.h }}
                  >
                    <span
                      className={`pb-1 font-black tabular-nums ${
                        isFirst ? "text-base text-slate-900" : "text-sm text-white/90"
                      }`}
                    >
                      {shop.rank}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* CTA */}
      <div className="p-4 pt-3">
        <Link
          href={`/classement/${catalog.slug}`}
          className="flex w-full items-center justify-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-4 py-2.5 text-[12px] font-semibold text-slate-800 transition hover:border-brand-gold/40 hover:bg-white hover:text-brand-gold dark:border-white/10 dark:bg-white/[0.03] dark:text-white/85 dark:hover:border-brand-gold/30 dark:hover:bg-white/[0.06]"
        >
          Classement complet & méthodologie
          <ArrowRight className="h-3.5 w-3.5 transition group-hover:translate-x-0.5" />
        </Link>
      </div>
    </article>
  );
}
