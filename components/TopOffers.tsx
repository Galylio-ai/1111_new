"use client";
import { ChevronLeft, ChevronRight, Flame, Star } from "lucide-react";
import { useRef } from "react";
import Image from "next/image";
import { topOffers } from "@/lib/data";

export function TopOffers() {
  const scrollerRef = useRef<HTMLDivElement>(null);

  const scrollBy = (dir: 1 | -1) => {
    const el = scrollerRef.current;
    if (!el) return;
    el.scrollBy({ left: dir * (el.clientWidth * 0.8), behavior: "smooth" });
  };

  return (
    <section className="mx-auto mt-6 max-w-[1600px] px-3 sm:px-4">
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Flame className="h-5 w-5 text-brand-red" />
          <h2 className="section-title">TOP OFFRES DU MOMENT</h2>
          <span className="text-brand-gold">✦</span>
        </div>
        <a className="text-xs font-medium text-white/70 hover:text-brand-gold" href="#">
          Voir toutes les offres
        </a>
      </div>

      <div className="relative">
        <button
          onClick={() => scrollBy(-1)}
          className="absolute -left-3 top-1/2 z-10 hidden -translate-y-1/2 rounded-full border border-bg-border bg-bg-800 p-2 text-white shadow-card hover:bg-bg-700 md:flex"
          aria-label="Précédent"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>
        <button
          onClick={() => scrollBy(1)}
          className="absolute -right-3 top-1/2 z-10 hidden -translate-y-1/2 rounded-full border border-bg-border bg-bg-800 p-2 text-white shadow-card hover:bg-bg-700 md:flex"
          aria-label="Suivant"
        >
          <ChevronRight className="h-4 w-4" />
        </button>

        <div
          ref={scrollerRef}
          className="flex snap-x snap-mandatory gap-4 overflow-x-auto pb-2 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
        >
          {topOffers.map((p) => (
            <a
              key={p.id}
              href={p.url ?? "#"}
              target={p.url ? "_blank" : undefined}
              rel={p.url ? "noopener noreferrer" : undefined}
              className="card group relative w-[200px] sm:w-[240px] md:w-[260px] shrink-0 snap-start overflow-hidden p-3 transition hover:-translate-y-0.5 hover:border-white/20"
            >
              <span className="absolute right-3 top-3 z-10 rounded-md bg-brand-red px-2 py-0.5 text-[11px] font-bold text-white shadow">
                {p.discount} DT
              </span>
              <div className="relative h-36 sm:h-40 md:h-44 w-full overflow-hidden rounded-xl bg-white">
                <Image
                  src={p.image}
                  alt={p.name}
                  fill
                  sizes="(max-width: 640px) 200px, (max-width: 768px) 240px, 260px"
                  className="object-contain p-3 transition group-hover:scale-105"
                  unoptimized
                />
              </div>
              <h3 className="mt-3 line-clamp-2 h-10 text-sm font-semibold text-white">{p.name}</h3>
              <div className="mt-1 flex items-baseline gap-2">
                <span className="text-xl font-extrabold text-brand-gold">
                  {p.price.toLocaleString("fr-FR")} DT
                </span>
                <span className="text-xs text-white/40 line-through">
                  {p.oldPrice.toLocaleString("fr-FR")} DT
                </span>
              </div>
              <div className="mt-2 flex items-center justify-between text-xs text-white/70">
                <span className="inline-flex items-center gap-1">
                  <span className="h-4 w-4 rounded-sm bg-gradient-to-br from-brand-red to-brand-redDark" />
                  {p.store}
                </span>
                <span className="inline-flex items-center gap-0.5 text-brand-gold">
                  <Star className="h-3 w-3 fill-current" /> {p.rating}
                </span>
              </div>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}
