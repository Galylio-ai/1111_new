"use client";

export function PromoBanner() {
  return (
    <section className="mx-auto mt-5 max-w-[1600px] px-3 sm:px-4">
      <a
        href="#"
        className="group relative block overflow-hidden rounded-2xl border border-orange-500/30 shadow-card transition hover:border-orange-400/60 hover:shadow-[0_0_32px_-8px_rgba(249,115,22,0.5)]"
      >
        <img
          src="/banner.jfif"
          alt="Jumia · Soldes d'été · jusqu'à −70%"
          className="block h-auto w-full transition duration-700 group-hover:scale-[1.015]"
        />

        {/* Subtle gradient overlay so the CTA reads in any light */}
        <div className="pointer-events-none absolute inset-y-0 right-0 w-1/3 bg-gradient-to-l from-black/30 via-black/10 to-transparent" />

        {/* Floating CTA */}
        <div className="pointer-events-none absolute right-4 top-1/2 hidden -translate-y-1/2 md:block">
          <span className="btn-gold pointer-events-auto shadow-lg">Voir les offres →</span>
        </div>

        {/* Shimmer sweep on hover */}
        <span className="pointer-events-none absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/15 to-transparent transition-transform duration-1000 group-hover:translate-x-full" />
      </a>
    </section>
  );
}
