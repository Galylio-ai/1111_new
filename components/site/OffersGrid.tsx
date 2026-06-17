import Image from "next/image";
import { Star } from "lucide-react";
import { topOffers } from "@/lib/data";

export function OffersGrid({ limit }: { limit?: number }) {
  const items = limit ? topOffers.slice(0, limit) : topOffers;
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4 xl:grid-cols-5">
      {items.map((p, i) => {
        const pct = Math.round((p.discount / p.oldPrice) * 100);
        return (
          <a
            key={p.id}
            href={p.url ?? "#"}
            target={p.url ? "_blank" : undefined}
            rel={p.url ? "noopener noreferrer" : undefined}
            style={{ animationDelay: `${(i % 10) * 0.05}s` }}
            className="reveal-up card group relative overflow-hidden p-3 transition hover:-translate-y-1 hover:border-slate-300 hover:shadow-[0_0_30px_-10px_rgba(225,29,45,0.3)] dark:hover:border-white/20 dark:hover:shadow-[0_0_30px_-10px_rgba(225,29,45,0.5)]"
          >
            <span className="absolute right-3 top-3 z-10 rounded-md bg-brand-red px-2 py-0.5 text-[11px] font-bold text-white shadow">
              {pct}%
            </span>
            <div className="relative h-36 w-full overflow-hidden rounded-xl bg-gradient-to-br from-slate-100 to-white ring-1 ring-inset ring-slate-200 sm:h-40 md:h-44 dark:from-white/[0.06] dark:to-white/[0.01] dark:ring-white/5">
              <Image
                src={p.image}
                alt={p.name}
                fill
                sizes="(max-width: 640px) 45vw, (max-width: 1024px) 30vw, 18vw"
                className="object-contain p-3 transition duration-500 group-hover:scale-105"
                unoptimized
              />
            </div>
            <h3 className="mt-3 line-clamp-2 h-10 text-sm font-semibold text-slate-900 dark:text-white">{p.name}</h3>
            <div className="mt-1 flex items-baseline gap-2">
              <span className="text-xl font-extrabold text-brand-gold">{p.price.toLocaleString("fr-FR")} DT</span>
              <span className="text-xs text-slate-400 line-through dark:text-white/40">{p.oldPrice.toLocaleString("fr-FR")} DT</span>
            </div>
            <div className="mt-2 flex items-center justify-between text-xs text-slate-500 dark:text-white/70">
              <span className="inline-flex items-center gap-1">
                <span className="h-4 w-4 rounded-sm bg-gradient-to-br from-brand-red to-brand-redDark" />
                {p.store}
              </span>
              <span className="inline-flex items-center gap-0.5 text-brand-gold">
                <Star className="h-3 w-3 fill-current" /> {p.rating}
              </span>
            </div>
          </a>
        );
      })}
    </div>
  );
}
