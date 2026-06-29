"use client";
import Link from "next/link";
import { useEffect, useState } from "react";

const PLAY_STORE_URL =
  "https://play.google.com/store/apps/details?id=com.tn_1111.tn_1111&hl=en&pli=1";

type Slide = { src: string; href: string; alt: string; type?: "image" | "video" };

const SLIDES: Slide[] = [
  { src: "/biobalance.mp4",     href: "/promotions", alt: "1111.tn · Téléchargez l'application", type: "video" },
  { src: "/Banner-electro.png", href: "/retail",     alt: "Electroménager · Comparez les prix" },
  { src: "/banner-clim.png?v=20260624", href: "/retail", alt: "Climatiseurs · Meilleures offres" },
];

const INTERVAL = 5000;

export function PromoBanner() {
  const [active, setActive] = useState(0);
  const [prev, setPrev] = useState(0);

  useEffect(() => {
    if (SLIDES.length <= 1) return;
    const id = setInterval(() => {
      setActive((p) => {
        setPrev(p);
        return (p + 1) % SLIDES.length;
      });
    }, INTERVAL);
    return () => clearInterval(id);
  }, []);

  function goTo(i: number) {
    if (i === active) return;
    setPrev(active);
    setActive(i);
  }

  return (
    <section className="mx-auto mt-5 max-w-[1600px] px-3 sm:px-4">
      <div
        data-home-card=""
        className="group relative overflow-hidden rounded-2xl border border-orange-500/30 shadow-card transition hover:border-orange-400/60 hover:shadow-[0_0_32px_-8px_rgba(249,115,22,0.5)]"
      >
        {/* Slides */}
        <div className="relative w-full" style={{ aspectRatio: "1566 / 232" }}>
          {SLIDES.map((slide, i) => {
            const isActive = i === active;
            const wasPrev = i === prev && i !== active;
            // Slide direction: new slide enters from the right, previous exits to the left
            const transform = isActive
              ? "translate-x-0 scale-100"
              : wasPrev
              ? "-translate-x-full scale-100"
              : "translate-x-full scale-100";
            return (
              <Link
                key={slide.src}
                href={slide.href}
                className={`absolute inset-0 block overflow-hidden transition-all duration-[900ms] ease-[cubic-bezier(0.22,1,0.36,1)] ${transform} ${
                  isActive ? "opacity-100 z-10" : "opacity-0 z-0"
                }`}
                tabIndex={isActive ? 0 : -1}
                aria-hidden={!isActive}
              >
                {slide.type === "video" ? (
                  <video
                    src={slide.src}
                    autoPlay
                    muted
                    loop
                    playsInline
                    preload="auto"
                    aria-label={slide.alt}
                    className="block h-full w-full object-cover"
                  />
                ) : (
                  <img
                    src={slide.src}
                    alt={slide.alt}
                    className={`block h-full w-full object-cover transition-transform duration-[6000ms] ease-out ${
                      isActive ? "scale-105" : "scale-100"
                    }`}
                  />
                )}
                {/* Soft vignette on active slide for legibility */}
                <span className="pointer-events-none absolute inset-0 bg-gradient-to-r from-black/5 via-transparent to-black/15" />
              </Link>
            );
          })}
        </div>

        {/* Shimmer sweep on hover */}
        <span className="pointer-events-none absolute inset-0 z-20 -translate-x-full bg-gradient-to-r from-transparent via-white/15 to-transparent transition-transform duration-1000 group-hover:translate-x-full" />

        {/* CTA */}
        <a
          href={PLAY_STORE_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="btn-gold absolute right-3 top-3 z-30 shadow-lg sm:right-4 sm:top-4"
        >
          Téléchargez →
        </a>

        {/* Dots */}
        <div className="absolute bottom-4 left-1/2 z-30 flex -translate-x-1/2 items-center gap-2">
          {SLIDES.map((_, i) => {
            const isActive = i === active;
            return (
              <button
                key={i}
                onClick={() => goTo(i)}
                className={`relative h-2 overflow-hidden rounded-full transition-all duration-500 ${
                  isActive ? "w-9 bg-white/30" : "w-2 bg-white/40 hover:bg-white/60"
                }`}
                aria-label={`Slide ${i + 1}`}
              >
                {isActive && (
                  <span
                    key={active}
                    className="absolute inset-y-0 left-0 block w-0 rounded-full bg-white"
                    style={{
                      animation: `slider-progress ${INTERVAL}ms linear forwards`,
                    }}
                  />
                )}
              </button>
            );
          })}
        </div>

        {/* Keyframes for the progress fill on the active dot */}
        <style jsx>{`
          @keyframes slider-progress {
            from { width: 0%; }
            to { width: 100%; }
          }
        `}</style>
      </div>
    </section>
  );
}
