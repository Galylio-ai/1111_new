"use client";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

const categories = [
  {
    id: "smartphones",
    fr: "Smartphones",
    ar: "هواتف",
    emoji: "📱",
    count: "4 200+",
    href: "/retail?q=smartphone",
    image: "/Smartphone.png",
    from: "#1d4ed8",
    to: "#0ea5e9",
    text: "text-blue-300",
    badge: "bg-blue-500/20 text-blue-200 border-blue-400/30",
  },
  {
    id: "info",
    fr: "Informatique",
    ar: "معلوماتية",
    emoji: "💻",
    count: "3 800+",
    href: "/retail?cat=informatique",
    image: "/informatique.png",
    from: "#0891b2",
    to: "#06b6d4",
    text: "text-cyan-300",
    badge: "bg-cyan-500/20 text-cyan-200 border-cyan-400/30",
  },
  {
    id: "elec",
    fr: "Électroménager",
    ar: "أجهزة منزلية",
    emoji: "🏠",
    count: "2 100+",
    href: "/retail?cat=electromenager",
    image: "/Electro.png",
    from: "#7c3aed",
    to: "#a855f7",
    text: "text-purple-300",
    badge: "bg-purple-500/20 text-purple-200 border-purple-400/30",
  },
  {
    id: "para",
    fr: "Parapharmacie",
    ar: "بارافارمسي",
    emoji: "💊",
    count: "12 000+",
    href: "/parapharmacie",
    image: "/Para.png",
    from: "#be185d",
    to: "#f43f5e",
    text: "text-pink-300",
    badge: "bg-pink-500/20 text-pink-200 border-pink-400/30",
  },
  {
    id: "super",
    fr: "Supermarchés",
    ar: "سوبرماركت",
    emoji: "🛒",
    count: "69 000+",
    href: "/supermarche",
    image: "https://images.unsplash.com/photo-1578916171728-46686eac8d58?w=600&h=800&fit=crop&q=90",
    from: "#047857",
    to: "#10b981",
    text: "text-emerald-300",
    badge: "bg-emerald-500/20 text-emerald-200 border-emerald-400/30",
  },
  {
    id: "beauty",
    fr: "Beauté",
    ar: "جمال",
    emoji: "✨",
    count: "5 500+",
    href: "/parapharmacie?cat=maquillage",
    image: "/beaute.png",
    from: "#9d174d",
    to: "#ec4899",
    text: "text-rose-300",
    badge: "bg-rose-500/20 text-rose-200 border-rose-400/30",
  },
  {
    id: "deco",
    fr: "Maison & Déco",
    ar: "منزل",
    emoji: "🛋️",
    count: "1 800+",
    href: "/retail?q=maison",
    image: "https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?w=600&h=800&fit=crop&q=90",
    from: "#b45309",
    to: "#f59e0b",
    text: "text-amber-300",
    badge: "bg-amber-500/20 text-amber-200 border-amber-400/30",
  },
  {
    id: "games",
    fr: "Jeux & Gaming",
    ar: "العاب",
    emoji: "🎮",
    count: "900+",
    href: "/retail?cat=gaming",
    image: "/gaming.png",
    from: "#1e3a8a",
    to: "#6366f1",
    text: "text-indigo-300",
    badge: "bg-indigo-500/20 text-indigo-200 border-indigo-400/30",
  },
  {
    id: "auto",
    fr: "Auto & Moto",
    ar: "سيارات",
    emoji: "🚗",
    count: "600+",
    href: "/retail?q=auto",
    image: "/Auto.png",
    from: "#991b1b",
    to: "#ef4444",
    text: "text-red-300",
    badge: "bg-red-500/20 text-red-200 border-red-400/30",
  },
  {
    id: "sport",
    fr: "Sport",
    ar: "رياضة",
    emoji: "⚽",
    count: "1 200+",
    href: "/retail?q=sport",
    image: "/Sport.png",
    from: "#065f46",
    to: "#34d399",
    text: "text-teal-300",
    badge: "bg-teal-500/20 text-teal-200 border-teal-400/30",
  },
];

export function Categories() {
  return (
    <section className="mx-auto mt-8 max-w-[1600px] px-3 sm:px-4">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-gold/15 text-brand-gold">✦</span>
          <div>
            <h2 className="section-title">Comparez par catégorie</h2>
            <p className="text-[11px] text-slate-400 dark:text-white/40">93 000+ produits · mis à jour en continu</p>
          </div>
        </div>
        <Link
          href="/categories"
          className="group hidden items-center gap-1.5 rounded-full border border-slate-200 bg-white px-4 py-1.5 text-xs font-semibold text-slate-600 transition hover:border-brand-gold/40 hover:text-brand-gold dark:border-white/10 dark:bg-white/[0.04] dark:text-white/60 sm:inline-flex"
        >
          Tout voir
          <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-0.5" />
        </Link>
      </div>

      {/* Grid — 5 cols on mobile → 10 on desktop */}
      <div className="grid grid-cols-5 gap-2.5 sm:gap-3 lg:grid-cols-10">
        {categories.map((c, i) => (
          <Link
            key={c.id}
            href={c.href}
            data-home-card=""
            className="group relative flex flex-col overflow-hidden rounded-2xl transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl"
            style={{ animationDelay: `${i * 50}ms` }}
          >
            {/* Image */}
            <div className="relative h-[clamp(5rem,24vw,9rem)] w-full overflow-hidden sm:h-44 lg:h-52">
              <Image
                src={c.image}
                alt={c.fr}
                fill
                sizes="(max-width: 640px) 20vw, (max-width: 1024px) 20vw, 10vw"
                className="object-cover transition-transform duration-700 group-hover:scale-110"
                unoptimized
              />

              {/* Neutral bottom gradient — keeps labels readable without tinting the image */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

              {/* Top-right product count badge */}
              <span className={`absolute right-1.5 top-1.5 rounded-full border px-1.5 py-0.5 text-[clamp(7px,1.8vw,9px)] font-bold backdrop-blur-sm sm:right-2 sm:top-2 sm:px-2 ${c.badge}`}>
                {c.count}
              </span>

              {/* Labels at bottom */}
              <div className="absolute bottom-0 left-0 right-0 p-[clamp(0.35rem,1.7vw,0.625rem)] text-center">
                <span className="block text-[clamp(8px,2.4vw,11px)] font-extrabold leading-tight text-white drop-shadow-lg sm:text-xs">
                  {c.fr}
                </span>
                <span className={`font-arabic mt-0.5 block text-[clamp(7px,2vw,10px)] leading-none ${c.text}`}>
                  {c.ar}
                </span>
              </div>

              {/* Hover shine sweep */}
              <div className="pointer-events-none absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/15 to-transparent transition-transform duration-700 group-hover:translate-x-full" />
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
