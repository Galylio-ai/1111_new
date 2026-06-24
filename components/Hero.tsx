"use client";
import { useEffect, useState } from "react";
import { ArrowUpRight, Search, TrendingUp } from "lucide-react";
import Link from "next/link";
import { SearchModal } from "./SearchModal";

const tags = ["climatiseur", "iphone 15", "samsung", "machine a laver", "parfum", "laptop"];

const inflationSectors = [
  {
    name: "Climatisation",
    value: 18,
    detail: "Hausse la plus forte detectee sur les offres froid et confort",
    tone: "from-red-500 to-orange-400",
  },
  {
    name: "Smartphones",
    value: 11,
    detail: "Prix en progression sur les modeles les plus recherches",
    tone: "from-brand-gold to-yellow-300",
  },
  {
    name: "Electromenager",
    value: 8,
    detail: "Tendance haussiere sur cuisine, lavage et petit equipement",
    tone: "from-emerald-500 to-teal-300",
  },
];

export function Hero() {
  const [searchOpen, setSearchOpen] = useState(false);

  // Cmd+K / Ctrl+K opens search.
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setSearchOpen(true);
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return (
    <section className="mx-auto max-w-[1600px] px-3 pt-4 sm:px-4 sm:pt-6">
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1.15fr_1fr] lg:gap-5">
        {/* Left: mascot + headline + search */}
        <div className="relative overflow-hidden rounded-2xl border border-bg-border bg-gradient-to-br from-slate-50 to-white p-4 sm:p-6 md:p-8 dark:from-bg-700 dark:to-bg-800">
          <div className="absolute -left-6 -bottom-6 h-48 w-48 rounded-full bg-brand-red/15 blur-3xl" />
          <div className="absolute right-0 top-0 h-40 w-40 rounded-full bg-brand-gold/10 blur-3xl" />
          <div className="relative flex flex-row items-center gap-3 md:gap-5">
            <div className="shrink-0">
              <Mascot />
            </div>
            <div className="flex-1 min-w-0 text-left">
              <h1 className="text-base sm:text-xl md:text-3xl lg:text-4xl font-black leading-[1.05] tracking-tight text-slate-900 dark:text-white">
                VERIFIEZ AVANT D'ACHETER,
                <br />
                <span className="gradient-text-gold">ECONOMISEZ PLUS !</span>
              </h1>
              <p className="mt-1 md:mt-2 font-arabic text-right text-sm sm:text-base md:text-xl text-slate-700 dark:text-white/90" dir="rtl">
                ثبت قبل ما تشري، وفر أكثر !
              </p>
              <p className="mt-1 md:mt-3 text-[11px] sm:text-xs md:text-sm text-slate-600 dark:text-white/70">
                Comparez plus de <span className="text-slate-900 font-semibold dark:text-white">350 000 produits</span>,
                surveillez les prix, detectez les vraies promotions et economisez sur tous vos achats.
              </p>

              <button
                type="button"
                onClick={() => setSearchOpen(true)}
                className="group mt-2 md:mt-4 flex w-full items-center gap-1 sm:gap-2 rounded-2xl border border-slate-300 bg-white p-1 sm:p-1.5 text-left shadow-inner transition hover:border-brand-gold/50 hover:shadow-[0_0_0_3px_rgba(246,196,83,0.12)] dark:border-bg-border dark:bg-bg-900 dark:hover:border-brand-gold/40"
              >
                <Search className="ml-1 h-3 w-3 sm:h-4 sm:w-4 md:h-5 md:w-5 shrink-0 text-slate-400 transition group-hover:text-brand-gold dark:text-white/50" />
                <span className="min-w-0 flex-1 truncate px-1 py-1 sm:py-2 text-[11px] sm:text-xs md:text-sm text-slate-400 dark:text-white/40">
                  Rechercher un produit, marque...
                </span>
                <kbd className="mr-1 hidden shrink-0 rounded-md border border-slate-200 bg-slate-50 px-1.5 py-0.5 text-[10px] font-semibold text-slate-400 sm:inline-block dark:border-white/10 dark:bg-white/5 dark:text-white/50">
                  Ctrl K
                </kbd>
                <span className="btn-gold whitespace-nowrap px-2 py-1 text-[10px] sm:px-3 sm:py-1.5 sm:text-xs md:px-4 md:py-2 md:text-sm">Rechercher</span>
              </button>

              <div className="mt-2 md:mt-3 flex flex-wrap justify-start gap-1 sm:gap-1.5 md:gap-2">
                {tags.map((t) => (
                  <Link key={t} href="/comparateur" className="chip">
                    {t}
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Right: inflation sectors card */}
        <div className="card card-pad relative overflow-hidden">
          <div className="pointer-events-none absolute -right-10 -top-12 h-36 w-36 rounded-full bg-red-500/10 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-10 left-8 h-32 w-32 rounded-full bg-brand-gold/10 blur-3xl" />

          <div className="relative flex items-start justify-between gap-3">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-brand-gold" />
              <span className="section-title">Secteur le plus inflationniste</span>
            </div>
            <span className="inline-flex items-center gap-1.5 rounded-full border border-red-500/30 bg-red-500/10 px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wider text-red-600 dark:text-red-300">
              <span className="live-dot bg-red-500" /> Signal chaud
            </span>
          </div>

          <div className="relative mt-3">
            <p className="max-w-xl text-sm leading-relaxed text-slate-600 dark:text-white/65">
              Vous classez les secteurs selon l'augmentation des prix.
            </p>
            <div className="mt-3 flex items-end gap-2">
              <span className="text-5xl font-black tracking-tight text-red-500 tabular-nums sm:text-6xl">
                +18%
              </span>
              <span className="pb-2 text-sm font-bold text-slate-700 dark:text-white/80">
                secteur en plus forte hausse
              </span>
            </div>
          </div>

          <div className="relative mt-4 space-y-2.5">
            {inflationSectors.map((sector, index) => (
              <div
                key={sector.name}
                className="rounded-xl border border-slate-200 bg-slate-50 p-3 transition hover:border-brand-gold/40 dark:border-bg-border dark:bg-bg-800 dark:hover:border-white/15"
              >
                <div className="flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-slate-900 text-[10px] font-black text-white dark:bg-white dark:text-bg-900">
                        {index + 1}
                      </span>
                      <span className="truncate text-sm font-black text-slate-900 dark:text-white">
                        {sector.name}
                      </span>
                    </div>
                    <div className="mt-1 truncate text-[11px] text-slate-500 dark:text-white/45">
                      {sector.detail}
                    </div>
                  </div>
                  <div className="flex shrink-0 items-center gap-1 rounded-full border border-red-500/20 bg-red-500/10 px-2.5 py-1 text-sm font-black tabular-nums text-red-600 dark:text-red-300">
                    <ArrowUpRight className="h-3.5 w-3.5" />
                    +{sector.value}%
                  </div>
                </div>
                <div className="mt-2 h-2 overflow-hidden rounded-full bg-slate-200 dark:bg-white/10">
                  <div
                    className={`h-full rounded-full bg-gradient-to-r ${sector.tone}`}
                    style={{ width: `${Math.max(18, sector.value * 4)}%` }}
                  />
                </div>
              </div>
            ))}
          </div>

          <div className="relative mt-3 rounded-xl border border-brand-gold/20 bg-brand-gold/10 px-3 py-2 text-xs font-semibold text-brand-gold">
            Tres fort pour articles et reseaux sociaux.
          </div>
        </div>
      </div>

      <SearchModal open={searchOpen} onClose={() => setSearchOpen(false)} />
    </section>
  );
}

function Mascot() {
  return (
    <div className="relative h-20 w-20 sm:h-28 sm:w-28 md:h-40 md:w-40 lg:h-56 lg:w-56 xl:h-72 xl:w-72 2xl:h-96 2xl:w-96">
      <div className="absolute inset-0 -z-10 animate-pulse-slow rounded-full bg-brand-red/20 blur-2xl" />
      <img
        src="/mascot.png"
        alt="Mascotte 1111.tn"
        className="mascot-anim h-full w-full object-contain"
      />
    </div>
  );
}
