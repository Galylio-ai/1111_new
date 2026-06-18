"use client";
import { ChevronLeft, ChevronRight, Gamepad2, Store, BadgeCheck } from "lucide-react";
import { useRef } from "react";
import Link from "next/link";

type ShopPrice = { shop: string; price: number };

type TechProduct = {
  id: number;
  name: string;
  brand: string;
  img: string;
  offers: ShopPrice[];
};

const gamingProducts: TechProduct[] = [
  {
    id: 4499,
    name: "AQIRYS Clavier Gaming ALUDRA",
    brand: "AQIRYS",
    img: "https://www.tunisianet.com.tn/325664-large/aqirys-clavier-gaming-aludra.jpg",
    offers: [
      { shop: "Tunisianet", price: 295 },
      { shop: "Expert Gaming", price: 302 },
      { shop: "Jumbo", price: 309 },
    ],
  },
  {
    id: 4508,
    name: "Casque Gamer Filaire Advance GTA 230 RGB Black",
    brand: "Advance",
    img: "https://www.scoopgaming.com.tn/21996-large_default/casque-gamer-filaire-advance-gta-230-rgb-black.jpg",
    offers: [
      { shop: "Scoop", price: 59 },
      { shop: "Expert Gaming", price: 59 },
      { shop: "Tunisianet", price: 60 },
      { shop: "Jumbo", price: 60 },
    ],
  },
  {
    id: 4523,
    name: "Ensemble Clavier Souris Sans Fil Advance Wireless Combo",
    brand: "Advance",
    img: "https://www.tunisianet.com.tn/92819-large/ensemble-clavier-souris-sans-fil-advance-wireless-combo.jpg",
    offers: [
      { shop: "Expert Gaming", price: 77 },
      { shop: "Scoop", price: 78 },
      { shop: "Tunisianet", price: 79 },
    ],
  },
  {
    id: 4504,
    name: "Carte Mère ASUS TUF GAMING B550M-PLUS WIFI II D4",
    brand: "ASUS",
    img: "https://www.sbsinformatique.com/20518/tunisie/large/carte-mere-asus-tuf-gaming-b550m-plus-wifi-ii-d4-tunisie.jpg",
    offers: [
      { shop: "SBS", price: 389 },
      { shop: "Spacenet", price: 389 },
      { shop: "Expert Gaming", price: 395 },
    ],
  },
  {
    id: 4509,
    name: "Casque Micro Gamer Advance GTA 210 Filaire",
    brand: "Advance",
    img: "https://www.scoopgaming.com.tn/21983-large_default/casque-micro-gamer-advance-gta-210-filaire.jpg",
    offers: [
      { shop: "Scoop", price: 40 },
      { shop: "Expert Gaming", price: 40 },
      { shop: "Tunewtec", price: 41 },
    ],
  },
  {
    id: 4529,
    name: "Tapis Advance Souris GTA Medium",
    brand: "Advance",
    img: "https://www.expert-gaming.tn/wp-content/uploads/2026/03/tapis-advance-souris-gta-medium-1.jpg",
    offers: [
      { shop: "Expert Gaming", price: 29 },
      { shop: "Scoop", price: 29 },
      { shop: "Kamounhome", price: 30 },
      { shop: "Tunewtec", price: 30 },
    ],
  },
];

function ProductCard({ p }: { p: TechProduct }) {
  // cheapest first
  const offers = [...p.offers].sort((a, b) => a.price - b.price);
  const minPrice = offers[0].price;
  const maxPrice = offers[offers.length - 1].price;
  const savings = maxPrice - minPrice;
  const fmt = (n: number) => n.toLocaleString("fr-FR");

  return (
    <Link
      href={`/produit/${p.id}`}
      className="card group relative w-[230px] sm:w-[250px] md:w-[270px] shrink-0 snap-start flex flex-col overflow-hidden p-0 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:border-brand-gold/40 dark:hover:border-brand-gold/40"
    >
      {/* discount badge */}
      {savings > 0 && (
        <span className="absolute right-2.5 top-2.5 z-10 rounded-full bg-brand-red px-2.5 py-1 text-[10px] font-black text-white shadow-md">
          −{fmt(savings)} DT
        </span>
      )}

      {/* image */}
      <div className="relative h-48 sm:h-52 w-full overflow-hidden bg-gradient-to-b from-slate-50 to-slate-100 dark:from-white/[0.06] dark:to-white/[0.02]">
        <img
          src={p.img}
          alt={p.name}
          className="h-full w-full object-cover transition duration-500 group-hover:scale-110"
          loading="lazy"
        />
        {/* shop count chip */}
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

        {/* best price */}
        <div className="mt-2.5 flex items-baseline gap-2">
          <span className="text-xl font-black text-brand-gold tabular-nums">
            {fmt(minPrice)} <span className="text-[11px] font-bold">DT</span>
          </span>
          {savings > 0 && (
            <span className="text-[11px] text-slate-400 line-through dark:text-white/35 tabular-nums">
              {fmt(maxPrice)} DT
            </span>
          )}
        </div>

        {/* per-shop price list, cheapest first */}
        <div className="mt-2.5 flex flex-col gap-1 border-t border-slate-100 pt-2.5 dark:border-white/[0.06]">
          {offers.slice(0, 3).map((o, i) => (
            <div
              key={o.shop}
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
              <span className="shrink-0 tabular-nums font-bold">{fmt(o.price)} DT</span>
            </div>
          ))}
          {offers.length > 3 && (
            <span className="px-2 text-[10px] font-medium text-slate-400 dark:text-white/40">
              +{offers.length - 3} autre{offers.length - 3 > 1 ? "s" : ""} magasin{offers.length - 3 > 1 ? "s" : ""}
            </span>
          )}
        </div>
      </div>
    </Link>
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

export function TechOffers() {
  return (
    <section className="mx-auto mt-8 max-w-[1600px] px-3 sm:px-4">
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Gamepad2 className="h-5 w-5 text-purple-400" />
          <h2 className="section-title">TOP OFFRES DU MOMENT</h2>
          <span className="text-brand-gold">✦</span>
        </div>
        <Link href="/retail" className="text-xs font-medium text-slate-500 transition hover:text-brand-gold dark:text-white/70">
          Voir tous les magasins →
        </Link>
      </div>

      <ScrollRow
        products={gamingProducts}
        label=""
        icon={<Gamepad2 className="h-4 w-4 text-purple-400" />}
        color="bg-purple-400/10"
      />
    </section>
  );
}
