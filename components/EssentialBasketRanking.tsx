import Link from "next/link";
import { ChevronRight, Trophy } from "lucide-react";
import type { ReactNode } from "react";
import { getStoreLogo } from "@/lib/data";
import {
  BASKET_CATEGORY_LABELS,
  fmtDt,
  fmtDtDelta,
  getEssentialBasketData,
  shopDisplayName,
  type ShopRankingRow,
} from "@/lib/essentialBasket";

function rankBadgeClass(rank: number): string {
  if (rank === 1)
    return "bg-gradient-to-br from-emerald-400 to-emerald-600 text-white ring-1 ring-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.5)]";
  if (rank === 2)
    return "bg-gradient-to-br from-lime-400 to-lime-600 text-white ring-1 ring-lime-400";
  if (rank === 3)
    return "bg-gradient-to-br from-yellow-400 to-amber-500 text-white ring-1 ring-yellow-400";
  if (rank === 4)
    return "bg-gradient-to-br from-orange-400 to-orange-600 text-white ring-1 ring-orange-400";
  return "bg-gradient-to-br from-red-500 to-red-700 text-white ring-1 ring-red-500";
}

function RankingRow({ row }: { row: ShopRankingRow }) {
  const logo = getStoreLogo(row.shop);
  const display = shopDisplayName(row.shop);

  return (
    <li
      className={`grid grid-cols-[1fr_5rem_5rem] items-center gap-x-3 px-1 py-2 text-sm transition ${
        row.isCheapest
          ? "rounded-lg bg-emerald-500/10"
          : "hover:bg-slate-50 dark:hover:bg-white/[0.03]"
      }`}
    >
      <div className="flex items-center gap-3 min-w-0">
        <span
          className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-[13px] font-black tabular-nums ${rankBadgeClass(row.rank)}`}
        >
          {row.rank === 1 ? "🏆" : row.rank}
        </span>
        {logo ? (
          <span className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-white p-1 ring-1 ring-slate-200 shadow-sm dark:ring-white/10">
            <img src={logo} alt={display} className="h-full w-full object-contain" />
          </span>
        ) : (
          <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-slate-200 text-sm font-black text-slate-600 dark:bg-white/10 dark:text-white/70">
            {display.slice(0, 1)}
          </span>
        )}
        <span
          className={`hidden truncate text-xs font-semibold sm:block ${row.isCheapest ? "text-emerald-700 dark:text-emerald-300" : "text-slate-700 dark:text-white/80"}`}
        >
          {display}
        </span>
      </div>
      <div
        className={`whitespace-nowrap text-right font-bold tabular-nums ${row.isCheapest ? "text-emerald-600 dark:text-emerald-300" : "text-slate-900 dark:text-white"}`}
      >
        {fmtDt(row.total)} DT
      </div>
      <div
        className={`whitespace-nowrap text-right text-xs font-semibold tabular-nums ${row.isCheapest ? "text-emerald-600 dark:text-emerald-300" : "text-red-500 dark:text-red-400"}`}
      >
        {fmtDtDelta(row.deltaVsCheapest)}
      </div>
    </li>
  );
}

type Props = {
  compact?: boolean;
  detailHref?: string;
  showEconomy?: boolean;
  showCta?: boolean;
  footer?: ReactNode;
};

export function EssentialBasketRanking({
  compact,
  detailHref = "/grande-distribution",
  showEconomy = true,
  showCta = true,
  footer,
}: Props) {
  const { fiveShop } = getEssentialBasketData();
  const leader = fiveShop.ranking[0];

  return (
    <div>
      <div className="mb-2 text-sm font-semibold text-slate-900 dark:text-white">
        Panier essentiel{" "}
        <span className="font-normal text-slate-400 dark:text-white/50">
          ({fiveShop.productCount} produits : {BASKET_CATEGORY_LABELS})
        </span>
      </div>

      <div className="grid grid-cols-[1fr_5rem_5rem] gap-x-3 px-1 text-xs font-medium text-slate-400 dark:text-white/40">
        <div>Enseigne</div>
        <div className="text-right">Prix total</div>
        <div className="text-right">vs min</div>
      </div>

      <ul className="mt-1 divide-y divide-slate-100 dark:divide-white/5">
        {fiveShop.ranking.map((row) => (
          <RankingRow key={row.shop} row={row} />
        ))}
      </ul>

      {showEconomy && leader && (
        <div className="mt-3 rounded-xl border border-emerald-500/25 bg-emerald-500/5 px-3 py-2.5 text-center dark:border-emerald-400/45 dark:bg-gradient-to-br dark:from-emerald-900/85 dark:to-emerald-950/90">
          <div className="text-[10px] font-bold uppercase tracking-[0.12em] text-emerald-700 dark:text-emerald-200">
            Économie possible
          </div>
          <div className="mt-1 text-2xl font-black tabular-nums text-emerald-600 dark:text-emerald-300">
            {fmtDt(fiveShop.maxSavings)} DT
          </div>
          <div className="mt-1 text-[10px] font-medium text-slate-500 dark:text-emerald-100/75">
            vs {shopDisplayName(fiveShop.ranking[fiveShop.ranking.length - 1]?.shop ?? "")} · panier strict 5 enseignes
          </div>
        </div>
      )}

      {footer}

      {showCta && (
        <Link
          href={detailHref}
          className={`mt-3 flex w-full items-center justify-center gap-1.5 rounded-xl bg-brand-gold text-center font-black text-black transition hover:bg-brand-gold/90 ${compact ? "py-2 text-xs" : "py-2.5 text-sm"}`}
        >
          Voir le détail du panier
          <ChevronRight className="h-3.5 w-3.5" />
        </Link>
      )}

      {!compact && leader && (
        <p className="mt-2 flex items-center gap-1.5 text-[10px] text-slate-400 dark:text-white/40">
          <Trophy className="h-3 w-3 text-brand-gold" />
          {shopDisplayName(leader.shop)} en tête · {fmtDt(leader.total)} DT pour {fiveShop.productCount} produits identiques
        </p>
      )}
    </div>
  );
}
