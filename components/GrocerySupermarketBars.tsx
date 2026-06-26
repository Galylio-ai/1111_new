import Link from "next/link";
import {
  barHeightForRate,
  shopLogoPath,
  shopShortName,
  type GroceryShopHealth,
} from "@/lib/groceryCrossing";

type Props = {
  shops: GroceryShopHealth[];
  compact?: boolean;
  detailHref?: string;
};

export function GrocerySupermarketBars({ shops, compact, detailHref }: Props) {
  if (!shops.length) return null;

  const leader = shops[0];
  const others = shops.slice(1);
  const maxRate = leader.cheapest_rate_pct || 1;

  return (
    <div>
      <div className="mb-2 flex items-center justify-between">
        <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-white/50">
          Supermarché le moins cher
        </span>
        {detailHref ? (
          <Link
            href={detailHref}
            className="text-[10px] font-medium text-brand-gold transition hover:underline"
          >
            Méthodologie →
          </Link>
        ) : (
          <span className="text-[10px] text-slate-400 dark:text-white/40">Taux de victoires</span>
        )}
      </div>

      <div className="flex items-end justify-between gap-1">
        <LeaderColumn shop={leader} maxRate={maxRate} compact={compact} />
        <div className="flex min-w-0 flex-1 items-end gap-1">
          {others.map((shop) => (
            <OtherColumn key={shop.shop_name} shop={shop} maxRate={maxRate} compact={compact} />
          ))}
        </div>
      </div>
    </div>
  );
}

function LeaderColumn({
  shop,
  maxRate,
  compact,
}: {
  shop: GroceryShopHealth;
  maxRate: number;
  compact?: boolean;
}) {
  const logoSize = compact ? "h-12 w-12" : "h-14 w-14";
  const blockH = barHeightForRate(shop.cheapest_rate_pct, maxRate);

  return (
    <div className="flex w-[14%] min-w-0 shrink-0 flex-col items-center gap-0.5">
      <span className="text-center text-[7px] font-black uppercase leading-tight tracking-wide text-emerald-500">
        MOINS CHER
      </span>
      <img
        src={shopLogoPath(shop.shop_name)}
        alt={shop.shop_name}
        className={`${logoSize} rounded-lg bg-white object-contain p-0.5 shadow-md ring-2 ring-brand-gold`}
      />
      <span className="w-full truncate px-0.5 text-center text-[9px] font-bold leading-tight text-emerald-600 dark:text-emerald-300">
        {shopShortName(shop.shop_name)}
      </span>
      <div
        className="flex w-full items-center justify-center rounded-t-lg bg-gradient-to-b from-brand-gold to-amber-500 shadow-md"
        style={{ height: blockH }}
        title={`${shop.cheapest_rate_pct}% de victoires sur produits croisés`}
      >
        <span className="text-xl font-black text-white drop-shadow">1</span>
      </div>
    </div>
  );
}

function OtherColumn({
  shop,
  maxRate,
  compact,
}: {
  shop: GroceryShopHealth;
  maxRate: number;
  compact?: boolean;
}) {
  const rank = shop.rank ?? 0;
  const blockH = barHeightForRate(shop.cheapest_rate_pct, maxRate);
  const logoSize = rank <= 3 ? "h-12 w-12" : "h-10 w-10";
  const isSecond = rank === 2;

  const blockColor =
    rank === 2
      ? "from-slate-400 to-slate-500 dark:from-slate-500 dark:to-slate-600"
      : rank === 3
        ? "from-amber-600 to-amber-700"
        : "from-slate-500 to-slate-700";

  const numColor =
    rank === 2 ? "text-brand-gold" : rank === 3 ? "text-white" : "text-white/70";

  const ring =
    rank === 2
      ? "ring-1 ring-slate-300 dark:ring-white/20"
      : rank === 3
        ? "ring-1 ring-amber-400/50"
        : "ring-1 ring-slate-200 dark:ring-white/10";

  return (
    <div className="flex min-w-0 flex-1 flex-col items-center gap-0.5">
      <span className="text-[7px] leading-tight">&nbsp;</span>
      <img
        src={shopLogoPath(shop.shop_name)}
        alt={shop.shop_name}
        className={`${logoSize} rounded-lg bg-white object-contain p-0.5 shadow-md ${ring}`}
      />
      <span
        className={`w-full truncate px-0.5 text-center text-[9px] font-bold leading-tight ${
          isSecond ? "text-brand-gold" : "text-slate-400 dark:text-white/45"
        }`}
      >
        {shopShortName(shop.shop_name)}
      </span>
      <div
        className={`flex w-full items-center justify-center rounded-t-lg bg-gradient-to-b ${blockColor} shadow-md`}
        style={{ height: blockH }}
        title={`${shop.cheapest_rate_pct}% de victoires · ${shop.cheapest_wins} victoires`}
      >
        <span className={`font-black drop-shadow ${rank <= 3 ? "text-base" : "text-xs"} ${numColor}`}>
          {rank}
        </span>
      </div>
    </div>
  );
}
