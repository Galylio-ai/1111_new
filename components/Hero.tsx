"use client";
import { useEffect, useState } from "react";
import { AlertTriangle, BarChart3, Coins, Flame, Search, TrendingUp } from "lucide-react";
import Link from "next/link";
import { SparkArea } from "./charts/SparkArea";

const initialIndexData = [
  { x: "00h", y: 105.2 },
  { x: "02h", y: 105.5 },
  { x: "04h", y: 105.1 },
  { x: "06h", y: 105.8 },
  { x: "08h", y: 106.2 },
  { x: "10h", y: 106.6 },
  { x: "12h", y: 107.1 },
  { x: "14h", y: 107.5 },
  { x: "16h", y: 107.9 },
  { x: "18h", y: 108.3 },
  { x: "20h", y: 108.5 },
  { x: "22h", y: 108.6 },
  { x: "24h", y: 108.7 },
];
const yesterdayClose = 107.4;

const tags = ["climatiseur", "iphone 15", "samsung", "machine à laver", "parfum", "laptop"];

const stats = [
  { value: "152", label: "Promotions aujourd'hui", icon: Flame, color: "text-red-400" },
  { value: "4 238", label: "Prix modifiés aujourd'hui", icon: BarChart3, color: "text-yellow-400" },
  { value: "37", label: "Fausses promos détectées", icon: AlertTriangle, color: "text-orange-400" },
  { value: "48 000 DT", label: "Économisés aujourd'hui", icon: Coins, color: "text-emerald-400" },
];

export function Hero() {
  const [indexData, setIndexData] = useState(initialIndexData);

  useEffect(() => {
    const id = setInterval(() => {
      setIndexData((prev) => {
        const last = prev[prev.length - 1].y;
        const mean = 107.4;
        const pull = (mean - last) * 0.08;
        const shock = (Math.random() - 0.5) * 3.2;
        const next = Math.max(100, Math.min(115, +(last + pull + shock).toFixed(2)));
        const shifted = prev.slice(1);
        return [...shifted, { x: prev[prev.length - 1].x, y: next }];
      });
    }, 900);
    return () => clearInterval(id);
  }, []);

  const current = indexData[indexData.length - 1].y;
  const change = +(((current - yesterdayClose) / yesterdayClose) * 100).toFixed(2);
  const up = change >= 0;

  return (
    <section className="mx-auto max-w-[1600px] px-3 pt-4 sm:px-4 sm:pt-6">
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1.15fr_1fr] lg:gap-5">
        {/* Left: mascot + headline + search */}
        <div className="relative overflow-hidden rounded-2xl border border-bg-border bg-gradient-to-br from-slate-50 to-white p-4 sm:p-6 md:p-8 dark:from-bg-700 dark:to-bg-800">
          <div className="absolute -left-6 -bottom-6 h-48 w-48 rounded-full bg-brand-red/15 blur-3xl" />
          <div className="absolute right-0 top-0 h-40 w-40 rounded-full bg-brand-gold/10 blur-3xl" />
          <div className="relative flex flex-col items-center gap-4 sm:gap-5 md:flex-row md:items-center md:text-left">
            <div className="shrink-0">
              <Mascot />
            </div>
            <div className="flex-1 text-center md:text-left">
              <h1 className="text-2xl sm:text-3xl md:text-4xl font-black leading-[1.05] tracking-tight text-slate-900 dark:text-white">
                VÉRIFIEZ AVANT D'ACHETER,
                <br />
                <span className="gradient-text-gold">ÉCONOMISEZ PLUS !</span>
              </h1>
              <p className="mt-2 font-arabic text-center md:text-right text-lg sm:text-xl text-slate-700 dark:text-white/90" dir="rtl">
                ثبت قبل ما تشري، وفر أكثر ! 😎
              </p>
              <p className="mt-3 text-xs sm:text-sm text-slate-600 dark:text-white/70">
                Comparez plus de <span className="text-slate-900 font-semibold dark:text-white">250 000 produits</span>,
                surveillez les prix, détectez les vraies promotions et économisez sur tous vos achats.
              </p>

              <div className="mt-4 flex items-center gap-1.5 sm:gap-2 rounded-2xl border border-slate-300 bg-white p-1.5 shadow-inner dark:border-bg-border dark:bg-bg-900">
                <Search className="ml-1 sm:ml-2 h-4 w-4 sm:h-5 sm:w-5 shrink-0 text-slate-400 dark:text-white/50" />
                <input
                  className="min-w-0 flex-1 bg-transparent px-1 sm:px-2 py-2 text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none dark:text-white dark:placeholder:text-white/40"
                  placeholder="Rechercher un produit, marque…"
                />
                <Link href="/comparateur" className="btn-gold whitespace-nowrap px-3 py-1.5 text-xs sm:px-4 sm:py-2 sm:text-sm">Rechercher</Link>
              </div>

              <div className="mt-3 flex flex-wrap justify-center gap-1.5 sm:gap-2 md:justify-start">
                {tags.map((t) => (
                  <Link key={t} href="/comparateur" className="chip">
                    {t}
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Right: market index card */}
        <div className="card card-pad relative overflow-hidden">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-brand-gold" />
              <span className="section-title">Indice du marché ✦</span>
            </div>
            <Link href="/indice" className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-0.5 text-[11px] font-medium text-emerald-700 transition hover:border-emerald-400/60 dark:text-emerald-300">
              <span className="live-dot" /> En temps réel
            </Link>
          </div>

          <div className="mt-3 flex items-end gap-3">
            <div className="text-4xl sm:text-5xl md:text-6xl font-black tracking-tight text-slate-900 tabular-nums transition-all duration-500 dark:text-white">
              {current.toFixed(1)}
            </div>
            <div className="mb-2 flex flex-col text-sm">
              <span className={`font-bold tabular-nums transition-colors duration-500 ${up ? "text-emerald-600 dark:text-emerald-400" : "text-red-500 dark:text-red-400"}`}>
                {up ? "▲" : "▼"} {up ? "+" : ""}{change}%
              </span>
              <span className="text-xs text-slate-500 dark:text-white/50">vs hier</span>
            </div>
          </div>

          <div className="mt-1">
            <SparkArea data={indexData} stroke={up ? "#f6c453" : "#ef4444"} height={130} showAxis />
          </div>

          <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4">
            {stats.map((s) => (
              <div
                key={s.label}
                className="rounded-xl border border-slate-200 bg-slate-50 p-3 hover:border-slate-300 transition dark:border-bg-border dark:bg-bg-800 dark:hover:border-white/15"
              >
                <div className={`flex items-center justify-between ${s.color}`}>
                  <span className="text-xl font-extrabold tabular-nums">{s.value}</span>
                  <s.icon className="h-4 w-4 opacity-80" />
                </div>
                <div className="mt-1 text-[11px] leading-tight text-slate-600 dark:text-white/60">{s.label}</div>
              </div>
            ))}
          </div>

          <Link href="/indice" className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-brand-gold transition hover:gap-2 hover:underline">
            Voir l'indice détaillé →
          </Link>
        </div>
      </div>
    </section>
  );
}

function Mascot() {
  return (
    <div className="relative h-40 w-40 sm:h-56 sm:w-56 md:h-80 md:w-80 lg:h-96 lg:w-96">
      <div className="absolute inset-0 -z-10 animate-pulse-slow rounded-full bg-brand-red/20 blur-2xl" />
      <img
        src="/mascot.png"
        alt="Mascotte 1111.tn"
        className="mascot-anim h-full w-full object-contain"
      />
    </div>
  );
}
