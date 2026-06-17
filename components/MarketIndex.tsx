"use client";
import {
  Activity,
  Diamond,
  Flame,
  Info,
  ShoppingBag,
  Tag,
  Lock,
} from "lucide-react";
import Link from "next/link";
import { categoryBarometres } from "@/lib/data";

const indices = [
  {
    name: "Inflation e-commerce",
    value: "104.2",
    change: "+ 1.9%",
    up: true,
    icon: Tag,
    iconBg: "from-blue-500/40 to-blue-700/30 ring-blue-400/30 text-blue-600 dark:text-blue-300",
    impact: "Moyen",
    impactIcon: "🟡",
    impactColor: "text-amber-600 dark:text-amber-400",
    desc:
      "Mesure la hausse moyenne des prix en ligne par rapport à l'année dernière. " +
      "Base 100 = janvier de l'année précédente. Un indice de 104.2 signifie que les " +
      "prix ont augmenté de 4.2% sur les sites e-commerce tunisiens.",
  },
  {
    name: "Volatilité des prix",
    value: "102.7",
    change: "− 0.6%",
    up: false,
    icon: Activity,
    iconBg: "from-cyan-500/40 to-cyan-700/30 ring-cyan-400/30 text-cyan-600 dark:text-cyan-300",
    impact: "Élevé",
    impactIcon: "🔴",
    impactColor: "text-red-500 dark:text-red-400",
    desc:
      "Indique à quel point les prix bougent souvent sur une période donnée. " +
      "Plus l'indice est haut, plus les prix changent fréquemment — il est donc " +
      "stratégique d'attendre ou de surveiller avant d'acheter.",
  },
  {
    name: "Guerre des prix",
    value: "103.5",
    change: "+ 1.2%",
    up: true,
    icon: ShoppingBag,
    iconBg: "from-emerald-500/40 to-emerald-700/30 ring-emerald-400/30 text-emerald-600 dark:text-emerald-300",
    impact: "Positif",
    impactIcon: "🟢",
    impactColor: "text-emerald-600 dark:text-emerald-400",
    desc:
      "Détecte quand plusieurs enseignes baissent leurs prix sur les mêmes produits " +
      "pour se concurrencer. Un indice élevé veut dire que c'est un bon moment pour " +
      "acheter — les marchands tirent les prix vers le bas.",
  },
  {
    name: "Pression promotionnelle",
    value: "99.6",
    change: "+ 0.6%",
    up: false,
    icon: Lock,
    iconBg: "from-purple-500/40 to-purple-700/30 ring-purple-400/30 text-purple-600 dark:text-purple-300",
    impact: "Moyen",
    impactIcon: "🟡",
    impactColor: "text-amber-600 dark:text-amber-400",
    desc:
      "Pourcentage de produits actuellement en promotion sur l'ensemble des sites. " +
      "Un indice supérieur à 100 indique une période de soldes plus intense que la " +
      "moyenne annuelle.",
  },
];

const META_DESC =
  "Indice composite qui combine les quatre indicateurs ci-dessus en une seule note. " +
  "Il représente la santé globale du marché e-commerce tunisien — au-dessus de 100, " +
  "le marché est dynamique et favorable aux consommateurs.";

const MYTEK_CACHE = "https://mk-media.mytek.tn/media/catalog/product/cache/7683d28f7d5b38a73a8ad2bb0d1aa983";

const catIcons = [
  // Smartphones — Samsung Galaxy S25 Ultra
  { img: `${MYTEK_CACHE}/s/m/smartphone-samsung-galaxy-s25-ultra-5g-12go-256go-noir-titanium-h.jpg`, grad: "from-blue-500 to-blue-700" },
  // Informatique — MacBook Air M1
  { img: `${MYTEK_CACHE}/a/p/apple-macbook-air-m1-8go-256go-ssd-gris-1_1.jpg`, grad: "from-cyan-500 to-cyan-700" },
  // Électroménager — Aspirateur robot Kärcher
  { img: `${MYTEK_CACHE}/a/s/aspirateur-robot-karcher-rcv5-blanc--v.jpg`, grad: "from-amber-500 to-orange-600" },
  // Grande Distribution — local couffin
  { img: "/couffin.png", grad: "from-emerald-500 to-emerald-700" },
  // Parapharmacie — unsplash pharmacy/skincare
  { img: "https://images.unsplash.com/photo-1556228720-195a672e8a03?w=200&h=200&fit=crop&q=80", grad: "from-pink-500 to-purple-600" },
  // Climatiseurs — local clim
  { img: "/clim.png", grad: "from-sky-400 to-blue-600" },
];

const rankBadges = ["bg-amber-500 text-black", "bg-blue-500 text-white", "bg-blue-400 text-white"];

export function MarketIndex() {
  return (
    <section className="mx-auto mt-5 max-w-[1600px] px-3 sm:px-4">
      {/* TUNISIA E-COMMERCE MARKET INDEX */}
      <div className="card card-pad relative overflow-visible">
        {/* Header row */}
        <div className="relative mb-4 flex items-center justify-between gap-3">
          <div className="flex flex-wrap items-baseline gap-3">
            <span className="text-lg font-black uppercase tracking-wide text-brand-gold">
              Tunisia E-Commerce Market Index
            </span>
            <span className="font-arabic text-base font-semibold text-brand-gold/80" dir="rtl">
              مؤشر التجارة الإلكترونية في تونس
            </span>
          </div>
          <Link
            href="/indice"
            className="shrink-0 rounded-full border border-brand-gold/40 bg-brand-gold/5 px-4 py-1.5 text-xs font-semibold text-brand-gold hover:bg-brand-gold/15 transition"
          >
            Voir tous les indices
          </Link>
        </div>

        {/* Indices + Meta Index in one row */}
        <div className="relative grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-5">
          {indices.map((idx) => (
            <div
              key={idx.name}
              tabIndex={0}
              className="group relative rounded-2xl border border-brand-gold/15 bg-slate-50 p-3.5 ring-1 ring-brand-gold/10 transition hover:border-brand-gold/40 hover:bg-slate-100 hover:ring-brand-gold/30 focus:outline-none focus-visible:border-brand-gold/40 focus-visible:bg-slate-100 dark:bg-bg-800 dark:hover:bg-bg-700 dark:focus-visible:bg-bg-700"
            >
              {/* Info hint icon */}
              <Info className="absolute right-2 top-2 h-3.5 w-3.5 text-slate-400 transition group-hover:text-brand-gold group-focus-visible:text-brand-gold dark:text-white/30" />

              {/* Top row: icon + name/value */}
              <div className="flex items-start gap-3">
                <span
                  className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br ${idx.iconBg} ring-1`}
                >
                  <idx.icon className="h-6 w-6" strokeWidth={2} />
                </span>
                <div className="min-w-0 flex-1">
                  <div className="truncate pr-4 text-xs text-slate-600 dark:text-white/80">{idx.name}</div>
                  <div className="mt-1 flex items-baseline gap-2">
                    <span className="text-2xl font-black tabular-nums text-slate-900 dark:text-white">{idx.value}</span>
                    <span
                      className={`text-sm font-bold tabular-nums ${
                        idx.up ? "text-emerald-600 dark:text-emerald-400" : "text-red-500 dark:text-red-400"
                      }`}
                    >
                      {idx.change}
                    </span>
                  </div>
                </div>
              </div>
              {/* Impact row */}
              <div className="mt-3 flex items-center gap-1.5 text-xs text-slate-500 dark:text-white/50">
                <span className="text-slate-400 dark:text-white/40">👤</span>
                <span>Impact :</span>
                <span>{idx.impactIcon}</span>
                <span className={`font-semibold ${idx.impactColor}`}>{idx.impact}</span>
              </div>

              {/* Hover/focus tooltip */}
              <div
                role="tooltip"
                className="pointer-events-none invisible absolute left-1/2 top-full z-30 mt-2 w-72 -translate-x-1/2 translate-y-1 rounded-xl border border-brand-gold/30 bg-white/95 p-3 text-left shadow-[0_8px_30px_rgba(0,0,0,0.15)] ring-1 ring-brand-gold/15 backdrop-blur-md opacity-0 transition duration-200 group-hover:visible group-hover:translate-y-0 group-hover:opacity-100 group-focus-visible:visible group-focus-visible:translate-y-0 group-focus-visible:opacity-100 dark:bg-bg-900 dark:shadow-[0_8px_30px_rgba(0,0,0,0.6)]"
              >
                {/* arrow */}
                <span className="absolute -top-1.5 left-1/2 h-3 w-3 -translate-x-1/2 rotate-45 border-l border-t border-brand-gold/30 bg-white/95 dark:bg-bg-900" />
                <div className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-brand-gold">
                  <Info className="h-3 w-3" />
                  Définition
                </div>
                <div className="mt-1 text-[12px] font-semibold text-slate-900 dark:text-white">{idx.name}</div>
                <p className="mt-1 text-[11px] leading-relaxed text-slate-600 dark:text-white/75">{idx.desc}</p>
              </div>
            </div>
          ))}

          {/* Meta Index Global 1111 */}
          <div
            tabIndex={0}
            className="group relative overflow-visible rounded-2xl border border-brand-gold/40 bg-gradient-to-br from-brand-gold/10 via-brand-gold/5 to-transparent p-3.5 ring-1 ring-brand-gold/25 transition hover:border-brand-gold/60 hover:ring-brand-gold/40 focus:outline-none focus-visible:border-brand-gold/60"
          >
            <div className="pointer-events-none absolute -right-4 -top-4 h-20 w-20 overflow-hidden rounded-full bg-brand-gold/20 blur-2xl" />
            <Info className="absolute right-2 top-2 h-3.5 w-3.5 text-slate-400 transition group-hover:text-brand-gold group-focus-visible:text-brand-gold dark:text-white/30" />

            <div className="relative flex items-start justify-between gap-2">
              <div className="min-w-0 flex-1">
                <div className="pr-4 text-xs font-semibold text-slate-600 dark:text-white/80">Meta Index Global 1111</div>
                <div className="mt-1 flex items-baseline gap-1">
                  <span className="text-3xl font-black tabular-nums tracking-tight text-slate-900 dark:text-white">
                    108.7
                  </span>
                  <span className="text-sm text-slate-400 dark:text-white/40">/ 100</span>
                </div>
                <div className="mt-2 flex items-center gap-1.5 text-xs">
                  <Diamond className="h-3 w-3 text-slate-400 dark:text-white/40" />
                  <span className="font-bold text-emerald-600 dark:text-emerald-400">+1.2%</span>
                </div>
                <div className="mt-0.5 text-[11px] text-slate-500 dark:text-white/50">vs mois dernier</div>
              </div>
              <span className="text-3xl">🚀</span>
            </div>

            {/* Tooltip — opens to the LEFT since this is the last card */}
            <div
              role="tooltip"
              className="pointer-events-none invisible absolute right-0 top-full z-30 mt-2 w-72 translate-y-1 rounded-xl border border-brand-gold/30 bg-white/95 p-3 text-left shadow-[0_8px_30px_rgba(0,0,0,0.15)] ring-1 ring-brand-gold/15 backdrop-blur-md opacity-0 transition duration-200 group-hover:visible group-hover:translate-y-0 group-hover:opacity-100 group-focus-visible:visible group-focus-visible:translate-y-0 group-focus-visible:opacity-100 dark:bg-bg-900 dark:shadow-[0_8px_30px_rgba(0,0,0,0.6)]"
            >
              <span className="absolute -top-1.5 right-6 h-3 w-3 rotate-45 border-l border-t border-brand-gold/30 bg-white/95 dark:bg-bg-900" />
              <div className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-brand-gold">
                <Info className="h-3 w-3" />
                Définition
              </div>
              <div className="mt-1 text-[12px] font-semibold text-slate-900 dark:text-white">Meta Index Global 1111</div>
              <p className="mt-1 text-[11px] leading-relaxed text-slate-600 dark:text-white/75">{META_DESC}</p>
            </div>
          </div>
        </div>
      </div>

      {/* BAROMÈTRES PAR CATÉGORIE */}
      <div className="card card-pad relative mt-5 overflow-hidden">
        <div className="relative mb-4 flex items-center justify-between gap-3">
          <div className="flex flex-wrap items-baseline gap-3">
            <span className="text-lg font-black uppercase tracking-wide text-brand-gold">
              Baromètres par catégorie
            </span>
            <span className="font-arabic text-base font-semibold text-brand-gold/80" dir="rtl">
              بارومترات حسب القسم
            </span>
          </div>
          <Link
            href="/barometres"
            className="shrink-0 rounded-full border border-brand-gold/40 bg-brand-gold/5 px-4 py-1.5 text-xs font-semibold text-brand-gold hover:bg-brand-gold/15 transition"
          >
            Voir tous les baromètres
          </Link>
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
          {categoryBarometres.map((c, ci) => {
            const ic = catIcons[ci];
            return (
              <div
                key={c.name}
                className="flex flex-col rounded-2xl border border-brand-gold/15 bg-slate-50 p-3.5 ring-1 ring-brand-gold/10 dark:bg-bg-800"
              >
                {/* Top: icon + name + value */}
                <div className="flex items-start gap-3">
                  <span
                    className={`flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-gradient-to-br ${ic.grad} p-1 shadow-lg`}
                  >
                    <img
                      src={ic.img}
                      alt={c.name}
                      className="h-full w-full object-contain"
                    />
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-xs text-slate-600 dark:text-white/80">{c.name}</div>
                    <div className="mt-1 flex items-baseline gap-2">
                      <span className="text-xl font-black tabular-nums text-slate-900 dark:text-white">{c.value}</span>
                      <span
                        className={`text-xs font-bold tabular-nums ${
                          c.change.startsWith("+") ? "text-emerald-600 dark:text-emerald-400" : "text-red-500 dark:text-red-400"
                        }`}
                      >
                        {c.change.startsWith("+") ? "+ " : "− "}
                        {c.change.replace(/[+−-]/, "")}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Ranked stores */}
                <ul className="mt-3 flex-1 space-y-1.5 text-xs">
                  {c.stores.map((s, idx) => (
                    <li key={s} className="flex items-center justify-between">
                      <span className="flex items-center gap-2">
                        <span
                          className={`flex h-4 w-4 items-center justify-center rounded-full text-[10px] font-black ${rankBadges[idx]}`}
                        >
                          {idx + 1}
                        </span>
                        <span className="text-slate-700 dark:text-white/85">{s}</span>
                      </span>
                      <span className="tabular-nums text-slate-500 dark:text-white/60">{c.ratings[idx]}</span>
                    </li>
                  ))}
                </ul>

                {/* Voir le baromètre */}
                <div className="mt-3 border-t border-slate-200 pt-2 text-center dark:border-white/10">
                  <Link
                    href="/barometres"
                    className="text-xs font-medium text-brand-gold/90 hover:text-brand-gold"
                  >
                    Voir le baromètre
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
