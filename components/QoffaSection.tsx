"use client";
import { ChefHat, Sparkles, Store, Trophy } from "lucide-react";
import Link from "next/link";
import { classementEnseignes } from "@/lib/data";
import { MultiLine } from "./charts/MultiLine";
import { OjjaOrbit } from "./OjjaOrbit";

// Weekly price variation per enseigne (in DT) for the family basket
const grandeDistribData = [
  { m: "Lun", Carrefour: 128.9, Géant: 138.4, Monoprix: 132.1 },
  { m: "Mar", Carrefour: 130.6, Géant: 135.7, Monoprix: 134.8 },
  { m: "Mer", Carrefour: 132.4, Géant: 137.9, Monoprix: 131.5 },
  { m: "Jeu", Carrefour: 129.7, Géant: 134.3, Monoprix: 135.9 },
  { m: "Ven", Carrefour: 133.8, Géant: 136.1, Monoprix: 132.8 },
  { m: "Sam", Carrefour: 131.2, Géant: 139.2, Monoprix: 135.4 },
  { m: "Dim", Carrefour: 134.5, Géant: 133.6, Monoprix: 133.1 },
];

export function QoffaSection() {
  return (
    <section className="mx-auto mt-5 max-w-[1600px] px-3 sm:px-4">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-[1fr_1fr_1.2fr_1fr]">
        {/* QOFFA TOUNSI */}
        <div className="card card-pad relative overflow-hidden">
          <div className="flex items-center gap-2">
            <span className="text-xl">🛒</span>
            <span className="section-title text-brand-gold">QOFFA TOUNSI</span>
          </div>
          <div className="text-[11px] text-slate-500 dark:text-white/60">Le coût réel de la vie en Tunisie</div>
          <div className="font-arabic text-[11px] text-slate-400 dark:text-white/40" dir="rtl">قفة التونسي</div>
          <div className="mt-4 flex justify-center">
            <img
              src="/couffin.png"
              alt="Couffin tunisien"
              className="h-40 w-40 md:h-48 md:w-48 animate-couffin-swing object-contain drop-shadow-[0_8px_20px_rgba(212,175,55,0.35)]"
            />
          </div>
          <Link href="/qoffa" className="btn-primary mt-3 w-full">Voir toutes les recettes</Link>
        </div>

        {/* RECETTES POPULAIRES */}
        <div className="card card-pad relative overflow-hidden">
          {/* Watermark icon */}
          <ChefHat
            className="pointer-events-none absolute -right-2 -top-2 h-28 w-28 text-white/[0.04]"
            strokeWidth={1.2}
            aria-hidden
          />

          {/* Header */}
          <div className="relative flex items-center justify-between gap-2">
            <div className="flex items-center gap-2.5">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-brand-gold/25 to-brand-gold/5 ring-1 ring-brand-gold/30">
                <ChefHat className="h-4 w-4 text-brand-gold" strokeWidth={2.2} />
              </span>
              <div className="leading-tight">
                <div className="section-title">Plat des riches</div>
                <div className="font-arabic text-[11px] text-slate-400 dark:text-white/40" dir="rtl">عجة التونسي</div>
              </div>
            </div>
            <span className="rounded-full border border-brand-gold/25 bg-brand-gold/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-brand-gold">
              8 ingrédients
            </span>
          </div>

          {/* Ojja ingredients board */}
          <div className="relative mt-4">
            <div className="mb-3 flex items-center justify-between text-[10px]">
              <span className="font-bold uppercase tracking-wider text-brand-gold">
                Décortiquez l'ojja
              </span>
              <span className="text-slate-400 dark:text-white/45">8 ingrédients · 4 135 DT</span>
            </div>
            <OjjaOrbit />
          </div>

          <Link
            className="relative mt-3 inline-flex items-center gap-1 text-xs font-semibold text-brand-gold transition hover:gap-2 hover:underline"
            href="/qoffa"
          >
            Voir toutes les recettes →
          </Link>
        </div>

        {/* VARIATION DES PRIX — GRANDE DISTRIBUTION */}
        <div className="card card-pad relative overflow-hidden">
          {/* Watermark icon */}
          <Store
            className="pointer-events-none absolute -right-2 -top-2 h-28 w-28 text-white/[0.04]"
            strokeWidth={1.2}
            aria-hidden
          />

          {/* Header */}
          <div className="relative flex items-center justify-between gap-2">
            <div className="flex items-center gap-2.5">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-brand-gold/25 to-brand-gold/5 ring-1 ring-brand-gold/30">
                <Store className="h-4 w-4 text-brand-gold" strokeWidth={2.2} />
              </span>
              <div className="leading-tight">
                <div className="section-title">Variation des prix</div>
                <div className="text-[11px] text-slate-500 dark:text-white/55">Grandes distributions · panier familial</div>
              </div>
            </div>
            <span className="rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-emerald-300">
              7 jours
            </span>
          </div>

          {/* Enseigne summary chips */}
          <div className="relative mt-3 grid grid-cols-3 gap-2">
            <div className="rounded-lg border border-blue-500/30 bg-blue-500/10 p-2 text-center">
              <div className="text-[10px] font-bold uppercase tracking-wider text-blue-600 dark:text-blue-300">Carrefour</div>
              <div className="mt-0.5 text-base font-extrabold tabular-nums text-slate-900 dark:text-white">134,5</div>
              <div className="text-[10px] text-red-500 dark:text-red-400">▲ +4,3%</div>
            </div>
            <div className="rounded-lg border border-yellow-500/30 bg-yellow-500/10 p-2 text-center">
              <div className="text-[10px] font-bold uppercase tracking-wider text-yellow-700 dark:text-yellow-300">Géant</div>
              <div className="mt-0.5 text-base font-extrabold tabular-nums text-slate-900 dark:text-white">133,6</div>
              <div className="text-[10px] text-emerald-600 dark:text-emerald-400">▼ −3,5%</div>
            </div>
            <div className="rounded-lg border border-rose-500/30 bg-rose-500/10 p-2 text-center">
              <div className="text-[10px] font-bold uppercase tracking-wider text-rose-600 dark:text-rose-300">Monoprix</div>
              <div className="mt-0.5 text-base font-extrabold tabular-nums text-slate-900 dark:text-white">133,1</div>
              <div className="text-[10px] text-red-500 dark:text-red-400">▲ +0,8%</div>
            </div>
          </div>

          {/* Multi-line chart */}
          <div className="relative mt-3">
            <MultiLine
              data={grandeDistribData}
              height={200}
              series={[
                { key: "Carrefour", name: "Carrefour", color: "#3b82f6" },
                { key: "Géant",     name: "Géant",     color: "#eab308" },
                { key: "Monoprix",  name: "Monoprix",  color: "#f43f5e" },
              ]}
            />
          </div>
        </div>

        {/* CLASSEMENT PAR ENSEIGNE */}
        <div className="card card-pad relative overflow-hidden">
          {/* Watermark icon */}
          <Trophy
            className="pointer-events-none absolute -right-2 -top-2 h-28 w-28 text-white/[0.04]"
            strokeWidth={1.2}
            aria-hidden
          />

          {/* Header */}
          <div className="relative flex items-center justify-between gap-2">
            <div className="flex items-center gap-2.5">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-brand-gold/25 to-brand-gold/5 ring-1 ring-brand-gold/30">
                <Trophy className="h-4 w-4 text-brand-gold" strokeWidth={2.2} />
              </span>
              <div className="leading-tight">
                <div className="section-title">Classement enseignes</div>
                <div className="font-arabic text-[11px] text-slate-400 dark:text-white/40" dir="rtl">ترتيب المتاجر</div>
              </div>
            </div>
            <span className="rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-emerald-300">
              Cette semaine
            </span>
          </div>

          {/* Ranking list with visual bars */}
          <ul className="relative mt-3 space-y-1.5">
            {(() => {
              const prices = classementEnseignes.map((e) => parseFloat(e.price));
              const minPrice = Math.min(...prices);
              const maxPrice = Math.max(...prices);
              const range = maxPrice - minPrice || 1;
              return classementEnseignes.map((e) => {
                const p = parseFloat(e.price);
                const pct = ((p - minPrice) / range) * 100;
                const diff = p - minPrice;
                const isBest = e.rank === 1;
                const isWorst = e.rank === classementEnseignes.length;
                return (
                  <li
                    key={e.name}
                    className={`group relative grid grid-cols-[24px_auto_1fr_auto] items-center gap-2 rounded-xl border px-2.5 py-2 transition ${
                      isBest
                        ? "border-brand-gold/40 bg-gradient-to-r from-brand-gold/15 via-brand-gold/5 to-transparent shadow-[0_0_18px_-8px_rgba(246,196,83,0.55)]"
                        : "border-slate-200 bg-slate-50 hover:border-slate-300 hover:bg-slate-100 dark:border-white/[0.05] dark:bg-bg-800 dark:hover:border-white/15 dark:hover:bg-bg-700"
                    }`}
                  >
                    {/* Rank / medal */}
                    <div className="flex items-center justify-center">
                      {e.rank <= 3 ? (
                        <Medal place={e.rank as 1 | 2 | 3} />
                      ) : (
                        <span className="flex h-5 w-5 items-center justify-center rounded-full border border-slate-300 text-[10px] font-black tabular-nums text-slate-500 dark:border-white/10 dark:text-white/55">
                          {e.rank}
                        </span>
                      )}
                    </div>

                    {/* Logo */}
                    <EnseigneLogo name={e.name} />

                    {/* Name + relative bar */}
                    <div className="min-w-0">
                      <div className={`truncate text-sm font-semibold ${isBest ? "text-brand-gold" : "text-slate-800 dark:text-white/90"}`}>
                        {e.name}
                      </div>
                      <div className="mt-1 h-1 w-full overflow-hidden rounded-full bg-slate-200 dark:bg-white/[0.05]">
                        <div
                          className={`h-full rounded-full transition-all ${
                            isBest ? "bg-brand-gold" : isWorst ? "bg-red-400" : "bg-slate-400 dark:bg-white/40"
                          }`}
                          style={{ width: `${Math.max(8, 100 - pct)}%` }}
                        />
                      </div>
                    </div>

                    {/* Price + delta */}
                    <div className="text-right leading-tight">
                      <div className={`text-sm font-bold tabular-nums ${isBest ? "text-brand-gold" : "text-slate-900 dark:text-white"}`}>
                        {e.price} <span className="text-[10px] font-normal text-slate-400 dark:text-white/40">DT</span>
                      </div>
                      <div
                        className={`mt-0.5 text-[10px] font-semibold tabular-nums ${
                          isBest ? "text-emerald-600 dark:text-emerald-400" : "text-red-400 dark:text-red-300"
                        }`}
                      >
                        {isBest ? "Meilleur prix" : `+${diff.toFixed(3).replace(".", ",")} DT`}
                      </div>
                    </div>
                  </li>
                );
              });
            })()}
          </ul>

          {/* Summary footer */}
          <div className="relative mt-3 flex items-center justify-between gap-2 rounded-xl border border-emerald-500/25 bg-emerald-500/10 px-3 py-2">
            <div className="flex items-center gap-1.5 text-[11px] text-slate-600 dark:text-white/75">
              <Sparkles className="h-3 w-3 text-emerald-500 dark:text-emerald-300" />
              Économie max
            </div>
            <div className="text-sm font-extrabold tabular-nums text-emerald-600 dark:text-emerald-300">
              2,530 DT
            </div>
          </div>

          <Link
            className="relative mt-3 inline-flex items-center gap-1 text-xs font-semibold text-brand-gold transition hover:gap-2 hover:underline"
            href="/magasins"
          >
            Voir le classement complet →
          </Link>
        </div>
      </div>
    </section>
  );
}

const enseigneStyles: Record<string, { bg: string; fg: string; ring: string; label: string }> = {
  Aziza:     { bg: "bg-red-600",     fg: "text-white",       ring: "ring-red-300/30",     label: "A" },
  Carrefour: { bg: "bg-blue-600",    fg: "text-white",       ring: "ring-blue-300/30",    label: "C" },
  "Carrefour Market": { bg: "bg-blue-600", fg: "text-white", ring: "ring-blue-300/30",    label: "C" },
  MG:        { bg: "bg-emerald-600", fg: "text-white",       ring: "ring-emerald-300/30", label: "MG" },
  Géant:     { bg: "bg-yellow-400",  fg: "text-yellow-950",  ring: "ring-yellow-200/40",  label: "G" },
  Monoprix:  { bg: "bg-rose-600",    fg: "text-white",       ring: "ring-rose-300/30",    label: "M" },
};

const medalStyles = {
  1: { from: "from-yellow-300", to: "to-amber-600",     text: "text-yellow-950", ring: "ring-yellow-200/50" },
  2: { from: "from-slate-200",  to: "to-slate-500",     text: "text-slate-950",  ring: "ring-slate-200/40" },
  3: { from: "from-amber-500",  to: "to-orange-700",    text: "text-amber-50",   ring: "ring-orange-300/40" },
} as const;

function Medal({ place }: { place: 1 | 2 | 3 }) {
  const s = medalStyles[place];
  return (
    <span
      className={`flex h-5 w-5 items-center justify-center rounded-full bg-gradient-to-br ${s.from} ${s.to} text-[10px] font-black tabular-nums shadow-md ring-1 ${s.ring} ${s.text}`}
      aria-label={`Place ${place}`}
    >
      {place}
    </span>
  );
}

function EnseigneLogo({ name }: { name: string }) {
  const s = enseigneStyles[name] ?? { bg: "bg-white/10", fg: "text-white", ring: "ring-white/20", label: name.charAt(0) };
  return (
    <span
      className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-md text-[10px] font-black tracking-tight shadow-sm ring-1 ${s.bg} ${s.fg} ${s.ring}`}
      aria-label={name}
    >
      {s.label}
    </span>
  );
}
