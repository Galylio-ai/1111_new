"use client";
import { Bot, TrendingDown } from "lucide-react";
import Link from "next/link";
import { MultiLine } from "./charts/MultiLine";
import { iaPredictiveData, watchProducts } from "@/lib/data";

export function IaPredictive() {
  return (
    <section className="mx-auto mt-5 max-w-[1600px] px-3 sm:px-4">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-[1.2fr_1fr_1.6fr_1fr]">
        {/* IA card */}
        <div className="card card-pad relative overflow-hidden">
          <div className="flex items-center gap-2">
            <Bot className="h-4 w-4 text-brand-blue" />
            <span className="section-title">IA Prédictive</span>
          </div>
          <div className="mt-2 text-sm font-semibold text-white">Acheter maintenant</div>
          <div className="text-sm text-white/80">ou attendre ?</div>
          <div className="font-arabic text-xs text-white/40" dir="rtl">اشري ولا استني</div>

          <p className="mt-3 text-[11px] leading-snug text-white/60">
            Notre IA analyse l'historique des prix et prédit l'évolution future avec une haute précision.
          </p>

          <div className="mt-3 grid grid-cols-2 gap-2">
            <button className="rounded-lg bg-emerald-500 px-3 py-2 text-xs font-semibold text-white hover:bg-emerald-600">
              Acheter maintenant
            </button>
            <button className="rounded-lg border border-bg-border bg-bg-800 px-3 py-2 text-xs font-semibold text-white/80 hover:bg-bg-700">
              Attendre
            </button>
          </div>
        </div>

        {/* Confiance card */}
        <div className="card card-pad text-center">
          <div className="text-[11px] uppercase tracking-wider text-white/50">Probabilité d'augmentation</div>
          <div className="mt-1 text-4xl font-black text-brand-gold">+4.6%</div>
          <div className="text-[11px] text-white/60">dans les 15 prochains jours</div>

          <div className="mt-4">
            <div className="text-[11px] uppercase tracking-wider text-white/50">Confiance IA</div>
            <div className="text-4xl font-black text-emerald-400">91.8%</div>
            <div className="text-[11px] text-emerald-300">élevée</div>
          </div>
        </div>

        {/* Chart */}
        <div className="card card-pad sm:col-span-2 lg:col-span-1">
          <div className="section-title mb-1">Évolution de prix</div>
          <MultiLine
            data={iaPredictiveData}
            height={230}
            series={[
              { key: "historique", name: "Historique", color: "#3b82f6" },
              { key: "prevision", name: "Prévision IA", color: "#ef4444", dashed: true },
            ]}
          />
        </div>

        {/* À surveiller */}
        <div className="card card-pad">
          <div className="section-title mb-2">Produits à surveiller</div>
          <ul className="space-y-2">
            {watchProducts.map((w) => (
              <li
                key={w.name}
                className="flex items-center justify-between rounded-lg border border-bg-border bg-bg-800/60 p-2 text-sm"
              >
                <span className="text-white/90">{w.name}</span>
                <span className="inline-flex items-center gap-1 text-emerald-400 text-xs">
                  <TrendingDown className="h-3 w-3" /> {w.change}
                </span>
              </li>
            ))}
          </ul>
          <Link className="mt-3 inline-block text-xs font-medium text-brand-gold hover:underline" href="/ia-predictive">
            Voir tous les produits
          </Link>
        </div>
      </div>
    </section>
  );
}
