"use client";
import { Activity, Flame, Rocket, ShieldAlert, Tag, TrendingDown, TrendingUp } from "lucide-react";
import { categoryBarometres } from "@/lib/data";
import { SparkArea } from "./charts/SparkArea";

const indices = [
  {
    name: "Inflation e-commerce",
    value: "104.2",
    change: "+1.9%",
    up: true,
    icon: Tag,
    accent: "emerald",
    spark: Array.from({ length: 14 }, (_, i) => ({ x: i, y: 102 + Math.sin(i / 2) * 1.2 + i * 0.18 })),
  },
  {
    name: "Volatilité des prix",
    value: "102.7",
    change: "−0.6%",
    up: false,
    icon: Activity,
    accent: "amber",
    spark: Array.from({ length: 14 }, (_, i) => ({ x: i, y: 103 + Math.cos(i / 1.5) * 1.8 - i * 0.05 })),
  },
  {
    name: "Guerre des prix",
    value: "103.5",
    change: "+2.1%",
    up: true,
    icon: ShieldAlert,
    accent: "red",
    spark: Array.from({ length: 14 }, (_, i) => ({ x: i, y: 101 + Math.sin(i / 1.2) * 1 + i * 0.2 })),
  },
  {
    name: "Pression promotionnelle",
    value: "99.6",
    change: "−0.6%",
    up: false,
    icon: Flame,
    accent: "blue",
    spark: Array.from({ length: 14 }, (_, i) => ({ x: i, y: 100.5 + Math.cos(i / 2) * 1.4 - i * 0.06 })),
  },
];

const accentMap = {
  emerald: { ring: "ring-emerald-500/30", bg: "from-emerald-500/15 via-emerald-500/5", text: "text-emerald-300", icon: "text-emerald-300", stroke: "#10b981" },
  amber:   { ring: "ring-amber-500/30",   bg: "from-amber-500/15 via-amber-500/5",     text: "text-amber-300",   icon: "text-amber-300",   stroke: "#f59e0b" },
  red:     { ring: "ring-red-500/30",     bg: "from-red-500/15 via-red-500/5",         text: "text-red-300",     icon: "text-red-300",     stroke: "#ef4444" },
  blue:    { ring: "ring-blue-500/30",    bg: "from-blue-500/15 via-blue-500/5",       text: "text-blue-300",    icon: "text-blue-300",    stroke: "#3b82f6" },
} as const;

const metaSparkData = Array.from({ length: 24 }, (_, i) => ({
  x: i,
  y: 100 + Math.sin(i / 2.5) * 2.2 + i * 0.32,
}));

export function MarketIndex() {
  return (
    <section className="mx-auto mt-5 max-w-[1600px] px-3 sm:px-4">
      {/* TUNISIA E-COMMERCE MARKET INDEX */}
      <div className="card card-pad relative overflow-hidden">
        <div className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full bg-brand-gold/10 blur-3xl" />
        <div className="pointer-events-none absolute -left-10 bottom-0 h-32 w-32 rounded-full bg-brand-red/10 blur-3xl" />

        <div className="relative mb-4 flex flex-col items-start justify-between gap-3 sm:flex-row sm:items-start sm:gap-4">
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-brand-gold/30 to-brand-gold/5 ring-1 ring-brand-gold/30">
              <Activity className="h-5 w-5 text-brand-gold" strokeWidth={2.2} />
            </span>
            <div className="leading-tight">
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-sm sm:text-base font-black tracking-tight text-white">Tunisia E-commerce Market Index</h2>
                <span className="inline-flex items-center gap-1 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2 py-0.5 text-[10px] font-semibold text-emerald-300">
                  <span className="live-dot" /> Live
                </span>
              </div>
              <div className="mt-0.5 flex flex-wrap items-center gap-x-2 gap-y-0.5 text-[11px] text-white/55">
                <span>Indices propriétaires · 1×/h</span>
                <span className="hidden sm:inline text-white/20">·</span>
                <span className="font-arabic" dir="rtl">مؤشر التجارة الإلكترونية</span>
              </div>
            </div>
          </div>
          <a className="shrink-0 self-end rounded-lg border border-brand-gold/30 bg-brand-gold/10 px-3 py-1.5 text-xs font-semibold text-brand-gold transition hover:bg-brand-gold/20 sm:self-auto" href="#">
            Voir tous les indices →
          </a>
        </div>

        <div className="relative grid grid-cols-1 gap-3 lg:grid-cols-[2fr_1fr]">
          <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
            {indices.map((i) => {
              const a = accentMap[i.accent as keyof typeof accentMap];
              const Trend = i.up ? TrendingUp : TrendingDown;
              return (
                <div
                  key={i.name}
                  className={`group relative overflow-hidden rounded-xl border border-white/[0.06] bg-gradient-to-br ${a.bg} to-transparent p-3.5 ring-1 ${a.ring} transition hover:border-white/15`}
                >
                  <div className="relative flex items-center justify-between">
                    <span className={`flex h-8 w-8 items-center justify-center rounded-lg bg-white/[0.06] ${a.icon}`}>
                      <i.icon className="h-4 w-4" strokeWidth={2.2} />
                    </span>
                    <span className={`inline-flex items-center gap-0.5 rounded-md bg-white/[0.06] px-1.5 py-0.5 text-[11px] font-bold tabular-nums ${a.text}`}>
                      <Trend className="h-3 w-3" />
                      {i.change}
                    </span>
                  </div>
                  <div className="relative mt-3 flex items-baseline gap-1">
                    <div className="text-3xl font-black tracking-tight text-white tabular-nums">{i.value}</div>
                    <div className="text-[11px] text-white/35">/100</div>
                  </div>
                  <div className="relative mt-0.5 text-[11px] font-medium text-white/65 leading-tight">{i.name}</div>
                  <div className="-mx-3.5 -mb-3.5 mt-2 opacity-80">
                    <SparkArea data={i.spark} stroke={a.stroke} height={42} />
                  </div>
                </div>
              );
            })}
          </div>

          <div className="relative overflow-hidden rounded-xl border border-brand-gold/25 bg-gradient-to-br from-brand-gold/15 via-brand-gold/5 to-transparent p-4 ring-1 ring-brand-gold/20">
            <div className="absolute -right-6 -top-6 h-24 w-24 rounded-full bg-brand-gold/25 blur-2xl" />
            <div className="relative flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-brand-gold/20 ring-1 ring-brand-gold/40">
                  <Rocket className="h-3.5 w-3.5 text-brand-gold" />
                </span>
                <span className="text-[11px] font-bold uppercase tracking-wider text-brand-gold">Meta Index 1111</span>
              </div>
              <span className="rounded-full bg-white/5 px-2 py-0.5 text-[10px] font-semibold text-white/60">Global</span>
            </div>
            <div className="relative mt-3 flex items-baseline gap-2">
              <div className="text-5xl font-black tabular-nums tracking-tight text-white">108.7</div>
              <div className="text-sm text-white/40">/ 100</div>
            </div>
            <div className="relative flex items-center gap-2 text-xs">
              <span className="inline-flex items-center gap-1 font-bold text-emerald-300">
                <TrendingUp className="h-3 w-3" /> +1.2%
              </span>
              <span className="text-white/50">vs mois dernier</span>
            </div>
            <div className="relative -mx-4 -mb-4 mt-2">
              <SparkArea data={metaSparkData} stroke="#10b981" height={72} />
            </div>
          </div>
        </div>
      </div>

      {/* BAROMÈTRES PAR CATÉGORIE */}
      <div className="mt-5">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="section-title">Baromètres par catégorie</h2>
          <a className="text-xs font-medium text-brand-gold hover:underline" href="#">
            Voir tous les baromètres
          </a>
        </div>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
          {categoryBarometres.map((c) => (
            <div key={c.name} className="card card-pad">
              <div className="flex items-center justify-between">
                <div className="text-sm font-semibold text-white">{c.name}</div>
                <div className={`h-2 w-2 rounded-full bg-gradient-to-br ${c.color}`} />
              </div>
              <div className="mt-1 flex items-baseline gap-2">
                <div className="text-2xl font-black text-white">{c.value}</div>
                <div
                  className={`text-xs font-semibold ${
                    c.change.startsWith("+") ? "text-emerald-400" : "text-red-400"
                  }`}
                >
                  {c.change}
                </div>
              </div>
              <ul className="mt-2 space-y-1 text-[11px]">
                {c.stores.map((s, idx) => (
                  <li key={s} className="flex items-center justify-between">
                    <span className="text-white/80">{s}</span>
                    <span className="text-brand-gold">★ {c.ratings[idx]}</span>
                  </li>
                ))}
              </ul>
              <a className="mt-2 inline-block text-[11px] font-medium text-brand-gold hover:underline" href="#">
                Voir le baromètre
              </a>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
