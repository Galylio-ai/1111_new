"use client";
import Link from "next/link";

const PLAY_STORE_URL =
  "https://play.google.com/store/apps/details?id=com.tn_1111.tn_1111&hl=en&pli=1";

export function PromoBanner() {
  return (
    <section className="mx-auto mt-5 max-w-[1600px] px-3 sm:px-4">
      <div className="group relative overflow-hidden rounded-2xl border border-orange-500/30 shadow-card transition hover:border-orange-400/60 hover:shadow-[0_0_32px_-8px_rgba(249,115,22,0.5)]">
        <Link href="/promotions" className="block">
          <img
            src="/banner.png"
            alt="1111.tn · Téléchargez l'application"
            className="block h-auto w-full transition duration-700 group-hover:scale-[1.015]"
          />
          {/* Shimmer sweep on hover */}
          <span className="pointer-events-none absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/15 to-transparent transition-transform duration-1000 group-hover:translate-x-full" />
        </Link>

        {/* CTA pinned top-right → Google Play (separate link, not nested) */}
        <a
          href={PLAY_STORE_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="btn-gold absolute right-3 top-3 z-10 shadow-lg sm:right-4 sm:top-4"
        >
          Téléchargez →
        </a>
      </div>
    </section>
  );
}
