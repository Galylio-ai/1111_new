"use client";
import { ChevronLeft, ChevronRight, Gamepad2 } from "lucide-react";
import { useRef } from "react";
import Link from "next/link";

type TechProduct = {
  id: number;
  name: string;
  brand: string;
  minPrice: number;
  maxPrice: number;
  img: string;
  shops: string[];
};

const gamingProducts: TechProduct[] = [
  {
    id: 4499,
    name: "AQIRYS Clavier Gaming ALUDRA",
    brand: "AQIRYS",
    minPrice: 295, maxPrice: 309,
    img: "https://www.tunisianet.com.tn/325664-large/aqirys-clavier-gaming-aludra.jpg",
    shops: ["Expert Gaming", "Jumbo", "Tunisianet"],
  },
  {
    id: 4508,
    name: "Casque Gamer Filaire Advance GTA 230 RGB Black",
    brand: "Advance",
    minPrice: 59, maxPrice: 60,
    img: "https://www.scoopgaming.com.tn/21996-large_default/casque-gamer-filaire-advance-gta-230-rgb-black.jpg",
    shops: ["Expert Gaming", "Jumbo", "Scoop", "Tunisianet"],
  },
  {
    id: 4523,
    name: "Ensemble Clavier Souris Sans Fil Advance Wireless Combo",
    brand: "Advance",
    minPrice: 77, maxPrice: 79,
    img: "https://www.tunisianet.com.tn/92819-large/ensemble-clavier-souris-sans-fil-advance-wireless-combo.jpg",
    shops: ["Expert Gaming", "Scoop", "Tunisianet"],
  },
  {
    id: 4504,
    name: "Carte Mère ASUS TUF GAMING B550M-PLUS WIFI II D4",
    brand: "ASUS",
    minPrice: 389, maxPrice: 389,
    img: "https://www.sbsinformatique.com/20518/tunisie/large/carte-mere-asus-tuf-gaming-b550m-plus-wifi-ii-d4-tunisie.jpg",
    shops: ["Expert Gaming", "SBS", "Spacenet"],
  },
  {
    id: 4509,
    name: "Casque Micro Gamer Advance GTA 210 Filaire",
    brand: "Advance",
    minPrice: 40, maxPrice: 41,
    img: "https://www.scoopgaming.com.tn/21983-large_default/casque-micro-gamer-advance-gta-210-filaire.jpg",
    shops: ["Expert Gaming", "Scoop", "Tunewtec"],
  },
  {
    id: 4529,
    name: "Tapis Advance Souris GTA Medium",
    brand: "Advance",
    minPrice: 29, maxPrice: 30,
    img: "https://www.expert-gaming.tn/wp-content/uploads/2026/03/tapis-advance-souris-gta-medium-1.jpg",
    shops: ["Expert Gaming", "Kamounhome", "Scoop", "Tunewtec"],
  },
];

function ProductCard({ p }: { p: TechProduct }) {
  const savings = p.maxPrice - p.minPrice;
  return (
    <div className="card group relative w-[200px] sm:w-[230px] md:w-[250px] shrink-0 snap-start flex flex-col overflow-hidden p-0 transition hover:-translate-y-0.5 hover:border-slate-300 dark:hover:border-white/20">
      {savings > 10 && (
        <span className="absolute right-2.5 top-2.5 z-10 rounded-md bg-brand-red px-2 py-0.5 text-[10px] font-black text-white shadow">
          -{savings.toLocaleString("fr-FR")} DT
        </span>
      )}
      <div className="relative h-36 sm:h-40 w-full overflow-hidden bg-slate-50 dark:bg-white/[0.04]">
        <img
          src={p.img}
          alt={p.name}
          className="h-full w-full object-contain p-3 transition duration-500 group-hover:scale-105"
          loading="lazy"
        />
      </div>
      <div className="flex flex-1 flex-col p-3">
        <div className="mb-1 text-[10px] font-semibold uppercase tracking-wider text-slate-400 dark:text-white/35">
          {p.brand}
        </div>
        <h3 className="flex-1 text-[12px] font-bold leading-snug text-slate-900 line-clamp-2 dark:text-white">
          {p.name}
        </h3>
        {/* shop pills */}
        <div className="mt-2 flex flex-wrap gap-1">
          {p.shops.slice(0, 3).map(s => (
            <span key={s} className="rounded-full border border-slate-200 bg-slate-50 px-1.5 py-0.5 text-[9px] font-semibold text-slate-600 dark:border-white/10 dark:bg-white/[0.06] dark:text-white/60">
              {s}
            </span>
          ))}
          {p.shops.length > 3 && (
            <span className="rounded-full border border-brand-gold/30 bg-brand-gold/10 px-1.5 py-0.5 text-[9px] font-bold text-brand-gold">
              +{p.shops.length - 3}
            </span>
          )}
        </div>
        {/* price */}
        <div className="mt-2 flex items-baseline gap-2 border-t border-slate-100 pt-2 dark:border-white/[0.06]">
          <span className="text-base font-black text-brand-gold tabular-nums">
            {p.minPrice.toLocaleString("fr-FR")} <span className="text-[10px]">DT</span>
          </span>
          {savings > 10 && (
            <span className="text-[11px] text-slate-400 line-through dark:text-white/35 tabular-nums">
              {p.maxPrice.toLocaleString("fr-FR")} DT
            </span>
          )}
        </div>
      </div>
    </div>
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
