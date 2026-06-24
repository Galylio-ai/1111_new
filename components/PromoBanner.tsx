"use client";
import Link from "next/link";
import { useEffect, useState } from "react";

const PLAY_STORE_URL =
  "https://play.google.com/store/apps/details?id=com.tn_1111.tn_1111&hl=en&pli=1";

const SLIDES = [
  { src: "/banner.png",  href: "/promotions" },
];

const INTERVAL = 4000;

export function PromoBanner() {
  const [active, setActive] = useState(0);

  useEffect(() => {
    const id = setInterval(() => {
      setActive((p) => (p + 1) % SLIDES.length);
    }, INTERVAL);
    return () => clearInterval(id);
  }, []);

  return (
    <section className="mx-auto mt-5 max-w-[1600px] px-3 sm:px-4">
      <div
        data-home-card=""
        className="group relative overflow-hidden rounded-2xl border border-orange-500/30 shadow-card transition hover:border-orange-400/60 hover:shadow-[0_0_32px_-8px_rgba(249,115,22,0.5)]"
      >

        {/* Slides */}
        {SLIDES.map((slide, i) => (
          <Link
            key={slide.src}
            href={slide.href}
            className={`block transition-opacity duration-700 ${i === active ? "opacity-100" : "opacity-0 absolute inset-0"}`}
            tabIndex={i === active ? 0 : -1}
            aria-hidden={i !== active}
          >
            <img
              src={slide.src}
              alt="1111.tn · Téléchargez l'application"
              className="block h-auto w-full"
            />
          </Link>
        ))}

        {/* Shimmer sweep on hover */}
        <span className="pointer-events-none absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/15 to-transparent transition-transform duration-1000 group-hover:translate-x-full" />

        {/* CTA */}
        <a
          href={PLAY_STORE_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="btn-gold absolute right-3 top-3 z-10 shadow-lg sm:right-4 sm:top-4"
        >
          Téléchargez →
        </a>

        {/* Dots */}
        <div className="absolute bottom-3 left-1/2 z-10 flex -translate-x-1/2 gap-1.5">
          {SLIDES.map((_, i) => (
            <button
              key={i}
              onClick={() => setActive(i)}
              className={`h-1.5 rounded-full transition-all duration-300 ${i === active ? "w-5 bg-white" : "w-1.5 bg-white/50"}`}
              aria-label={`Slide ${i + 1}`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
