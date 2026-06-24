"use client";
import { ChevronLeft, ChevronRight, Gamepad2, Store, BadgeCheck, Smartphone } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import Link from "next/link";

type ShopPrice = { shop: string; price: string; url?: string | null };

type TechProduct = {
  id: number;
  name: string;
  slug: string;
  kind: string;
  brand: string;
  img: string;
  minPrice: string;
  maxPrice: string;
  savings: string;
  offers: ShopPrice[];
};

function ProductCard({ p }: { p: TechProduct }) {
  const offers = p.offers;
  const hasSavings = p.savings && p.savings !== "0";
  const bestOfferUrl = offers.find(o => o.url)?.url;
  const href = bestOfferUrl ?? `/retail/${p.slug}`;
  const isExternal = !!bestOfferUrl;

  return (
    <a
      href={href}
      {...(isExternal ? { target: "_blank", rel: "noopener noreferrer" } : {})}
      className="card group relative w-[clamp(12.5rem,68vw,14.375rem)] sm:w-[250px] md:w-[270px] shrink-0 snap-start flex flex-col overflow-hidden p-0 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:border-brand-gold/40 dark:hover:border-brand-gold/40"
    >
      {hasSavings && (
        <span className="absolute right-2.5 top-2.5 z-10 rounded-full bg-brand-red px-2.5 py-1 text-[10px] font-black text-white shadow-md">
          −{p.savings} DT
        </span>
      )}

      <div className="relative h-[clamp(8.5rem,44vw,12rem)] sm:h-52 w-full overflow-hidden bg-gradient-to-b from-slate-50 to-slate-100 dark:from-white/[0.06] dark:to-white/[0.02]">
        {p.img ? (
          <img
            src={p.img}
            alt={p.name}
            className="h-full w-full object-cover transition duration-500 group-hover:scale-110"
            loading="lazy"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-3xl text-slate-300 dark:text-white/20">
            {p.kind === "gaming" ? "🎮" : "📱"}
          </div>
        )}
        <span className="absolute bottom-2 left-2 inline-flex items-center gap-1 rounded-full bg-white/90 px-2 py-0.5 text-[9px] font-bold text-slate-700 shadow-sm backdrop-blur dark:bg-black/50 dark:text-white/80">
          <Store className="h-2.5 w-2.5" />
          {offers.length} magasins
        </span>
      </div>

      <div className="flex flex-1 flex-col p-3.5">
        <div className="mb-1 text-[10px] font-bold uppercase tracking-wider text-brand-gold/80">
          {p.brand}
        </div>
        <h3 className="text-[12.5px] font-bold leading-snug text-slate-900 line-clamp-2 dark:text-white">
          {p.name}
        </h3>

        <div className="mt-2.5 flex items-baseline gap-2">
          <span className="text-xl font-black text-brand-gold tabular-nums">
            {p.minPrice} <span className="text-[11px] font-bold">DT</span>
          </span>
          {hasSavings && (
            <span className="text-[11px] text-slate-400 line-through dark:text-white/35 tabular-nums">
              {p.maxPrice} DT
            </span>
          )}
        </div>

        <div className="mt-2.5 flex flex-col gap-1 border-t border-slate-100 pt-2.5 dark:border-white/[0.06]">
          {offers.slice(0, 3).map((o, i) => (
            <div
              key={`${o.shop}-${i}`}
              className={`flex items-center justify-between rounded-md px-2 py-1 text-[11px] ${
                i === 0
                  ? "bg-emerald-50 font-semibold text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300"
                  : "text-slate-600 dark:text-white/60"
              }`}
            >
              <span className="flex items-center gap-1 truncate">
                {i === 0 && <BadgeCheck className="h-3 w-3 shrink-0" />}
                <span className="truncate">{o.shop}</span>
              </span>
              <span className="shrink-0 tabular-nums font-bold">{o.price} DT</span>
            </div>
          ))}
          {offers.length > 3 && (
            <span className="px-2 text-[10px] font-medium text-slate-400 dark:text-white/40">
              +{offers.length - 3} autre{offers.length - 3 > 1 ? "s" : ""} magasin{offers.length - 3 > 1 ? "s" : ""}
            </span>
          )}
        </div>
      </div>
    </a>
  );
}

function ScrollRow({ products, label, icon, color }: {
  products: TechProduct[];
  label: string;
  icon: React.ReactNode;
  color: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const scroll = (dir: 1 | -1) => ref.current?.scrollBy({ left: dir * (ref.current.clientWidth * 0.8), behavior: "smooth" });

  return (
    <div>
      {label && (
        <div className="mb-3 flex items-center gap-2">
          <span className={`flex h-7 w-7 items-center justify-center rounded-lg ${color}`}>{icon}</span>
          <h3 className="text-sm font-black uppercase tracking-wide text-slate-900 dark:text-white">{label}</h3>
          <Link href="/retail" className="ml-auto text-[11px] font-semibold text-slate-400 transition hover:text-brand-gold dark:text-white/40 dark:hover:text-brand-gold">
            Voir tout →
          </Link>
        </div>
      )}
      <div className="relative">
        <button onClick={() => scroll(-1)} className="absolute -left-3 top-1/2 z-10 hidden -translate-y-1/2 rounded-full border border-bg-border bg-bg-card p-1.5 text-slate-700 shadow-card hover:bg-bg-700 dark:text-white md:flex" aria-label="Précédent">
          <ChevronLeft className="h-3.5 w-3.5" />
        </button>
        <button onClick={() => scroll(1)} className="absolute -right-3 top-1/2 z-10 hidden -translate-y-1/2 rounded-full border border-bg-border bg-bg-card p-1.5 text-slate-700 shadow-card hover:bg-bg-700 dark:text-white md:flex" aria-label="Suivant">
          <ChevronRight className="h-3.5 w-3.5" />
        </button>
        <div ref={ref} className="flex snap-x snap-mandatory gap-3 overflow-x-auto pb-2 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
          {products.map(p => <ProductCard key={p.id} p={p} />)}
        </div>
      </div>
    </div>
  );
}

const SKELETON_CARD = (
  <div className="card w-[clamp(12.5rem,68vw,14.375rem)] sm:w-[250px] md:w-[270px] shrink-0 p-0">
    <div className="h-[clamp(8.5rem,44vw,12rem)] w-full animate-pulse bg-slate-100 dark:bg-white/[0.04] sm:h-52" />
    <div className="space-y-2 p-3.5">
      <div className="h-3 w-1/3 animate-pulse rounded bg-slate-100 dark:bg-white/[0.04]" />
      <div className="h-4 w-full animate-pulse rounded bg-slate-100 dark:bg-white/[0.04]" />
      <div className="h-5 w-1/2 animate-pulse rounded bg-slate-100 dark:bg-white/[0.04]" />
    </div>
  </div>
);

export function TechOffers() {
  const [products, setProducts] = useState<TechProduct[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/stats/top-offers")
      .then(r => r.json())
      .then(d => {
        if (cancelled) return;
        if (Array.isArray(d?.offers)) setProducts(d.offers as TechProduct[]);
      })
      .catch(() => {})
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, []);

  const gaming = products.filter(p => p.kind === "gaming");
  const phones = products.filter(p => p.kind === "smartphone");

  return (
    <section className="mx-auto mt-8 max-w-[1600px] px-3 sm:px-4">
      <div className="mb-5 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Gamepad2 className="h-5 w-5 text-purple-400" />
          <h2 className="section-title">TOP OFFRES DU MOMENT</h2>
          <span className="text-brand-gold">✦</span>
        </div>
        <Link href="/retail" className="text-xs font-medium text-slate-500 transition hover:text-brand-gold dark:text-white/70">
          Voir tous les magasins →
        </Link>
      </div>

      {loading && products.length === 0 ? (
        <div className="space-y-6">
          <div className="flex gap-3 overflow-hidden pb-2">
            {Array.from({ length: 4 }).map((_, i) => <div key={i}>{SKELETON_CARD}</div>)}
          </div>
          <div className="flex gap-3 overflow-hidden pb-2">
            {Array.from({ length: 4 }).map((_, i) => <div key={i}>{SKELETON_CARD}</div>)}
          </div>
        </div>
      ) : products.length === 0 ? (
        <div className="rounded-2xl border border-bg-border bg-bg-card p-6 text-center text-sm text-slate-500 dark:text-white/50">
          Aucune offre disponible pour le moment.
        </div>
      ) : (
        <div className="space-y-8">
          {gaming.length > 0 && (
            <ScrollRow
              products={gaming}
              label="PC Gaming"
              icon={<Gamepad2 className="h-4 w-4 text-purple-400" />}
              color="bg-purple-400/10"
            />
          )}
          {false && phones.length > 0 && (
            <ScrollRow
              products={phones}
              label="Smartphones"
              icon={<Smartphone className="h-4 w-4 text-blue-400" />}
              color="bg-blue-400/10"
            />
          )}
        </div>
      )}
    </section>
  );
}
