"use client";
import { useEffect, useState } from "react";
import { AlertTriangle, BarChart3, Coins, Flame, TrendingUp } from "lucide-react";
import { SparkArea } from "../charts/SparkArea";

const initial = [
  { x: "00h", y: 105.2 }, { x: "02h", y: 105.5 }, { x: "04h", y: 105.1 },
  { x: "06h", y: 105.8 }, { x: "08h", y: 106.2 }, { x: "10h", y: 106.6 },
  { x: "12h", y: 107.1 }, { x: "14h", y: 107.5 }, { x: "16h", y: 107.9 },
  { x: "18h", y: 108.3 }, { x: "20h", y: 108.5 }, { x: "22h", y: 108.6 },
  { x: "24h", y: 108.7 },
];
const close = 107.4;

const stats = [
  { value: "152", label: "Promotions aujourd'hui", icon: Flame, color: "text-red-500 dark:text-red-400" },
  { value: "4 238", label: "Prix modifiés aujourd'hui", icon: BarChart3, color: "text-yellow-600 dark:text-yellow-400" },
  { value: "37", label: "Fausses promos détectées", icon: AlertTriangle, color: "text-orange-600 dark:text-orange-400" },
  { value: "48 000 DT", label: "Économisés aujourd'hui", icon: Coins, color: "text-emerald-600 dark:text-emerald-400" },
];

export function LiveIndexCard() {
  const [data, setData] = useState(initial);

  useEffect(() => {
    const id = setInterval(() => {
      setData((prev) => {
        const last = prev[prev.length - 1].y;
        const pull = (close - last) * 0.08;
        const shock = (Math.random() - 0.5) * 3.2;
        const next = Math.max(100, Math.min(115, +(last + pull + shock).toFixed(2)));
        return [...prev.slice(1), { x: prev[prev.length - 1].x, y: next }];
      });
    }, 900);
    return () => clearInterval(id);
  }, []);

  const current = data[data.length - 1].y;
  const change = +(((current - close) / close) * 100).toFixed(2);
  const up = change >= 0;

  return (
    <div className="card card-pad relative overflow-hidden">
      <div className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full bg-brand-gold/10 blur-3xl" />
      <div className="relative flex items-start justify-between">
        <div className="flex items-center gap-2">
          <TrendingUp className="h-4 w-4 text-brand-gold" />
          <span className="section-title">Indice du marché ✦</span>
        </div>
        <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-0.5 text-[11px] font-medium text-emerald-600 dark:text-emerald-300">
          <span className="live-dot" /> En temps réel
        </span>
      </div>

      <div className="relative mt-3 flex items-end gap-3">
        <div className="text-5xl font-black tracking-tight text-slate-900 tabular-nums transition-all duration-500 dark:text-white md:text-6xl">
          {current.toFixed(1)}
        </div>
        <div className="mb-2 flex flex-col text-sm">
          <span className={`font-bold tabular-nums transition-colors duration-500 ${up ? "text-emerald-600 dark:text-emerald-400" : "text-red-500 dark:text-red-400"}`}>
            {up ? "▲" : "▼"} {up ? "+" : ""}{change}%
          </span>
          <span className="text-xs text-slate-500 dark:text-white/50">vs hier</span>
        </div>
      </div>

      <div className="relative mt-1">
        <SparkArea data={data} stroke={up ? "#f6c453" : "#ef4444"} height={150} showAxis />
      </div>

      <div className="relative mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4">
        {stats.map((s) => (
          <div key={s.label} className="rounded-xl border border-bg-border bg-bg-700 p-3 transition hover:border-slate-300 dark:hover:border-white/15">
            <div className={`flex items-center justify-between ${s.color}`}>
              <span className="text-xl font-extrabold tabular-nums">{s.value}</span>
              <s.icon className="h-4 w-4 opacity-80" />
            </div>
            <div className="mt-1 text-[11px] leading-tight text-slate-500 dark:text-white/60">{s.label}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
