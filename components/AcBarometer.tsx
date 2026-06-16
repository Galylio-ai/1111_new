"use client";
import { AlertTriangle, Snowflake } from "lucide-react";
import Link from "next/link";
import { MultiLine } from "./charts/MultiLine";
import { acChartData, acPromos } from "@/lib/data";

export function AcBarometer() {
  return (
    <section className="mx-auto mt-5 max-w-[1600px] px-3 sm:px-4">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-[1.2fr_1.2fr_2fr_1fr]">
        {/* Visual card */}
        <div className="card card-pad relative flex flex-col overflow-hidden">
          <div className="flex items-center gap-2">
            <Snowflake className="h-4 w-4 text-brand-blue" />
            <span className="section-title">Baromètre climatiseurs Tunisie</span>
          </div>
          <div className="font-arabic text-[11px] text-white/40" dir="rtl">سوق المكيفات في تونس</div>
          <div className="mt-3 flex flex-1 items-center justify-center">
            <img
              src="/clim.png"
              alt="Climatiseur"
              className="h-full max-h-72 w-full max-w-full animate-float object-contain drop-shadow-[0_12px_28px_rgba(59,130,246,0.45)]"
            />
          </div>
          <div className="mt-2 text-xs text-white/70">Suivi prix & promos en temps réel</div>
          <Link href="/barometres" className="btn-gold mt-3 w-full">Voir les offres</Link>
        </div>

        {/* Stats column */}
        <div className="card card-pad">
          <div className="grid grid-cols-3 gap-2">
            <Stat label="Prix moyen marché" value="1 849 DT" change="+4.2%" up />
            <Stat label="Promotions actives" value="127" change="+18%" up />
            <Stat label="Disponibilité" value="92%" change="stable" />
          </div>
          <div className="mt-4 text-[11px] uppercase tracking-wider text-white/40">Top promotions détectées</div>
          <ul className="mt-1 divide-y divide-bg-border/50">
            {acPromos.map((p) => (
              <li key={p.name} className="flex items-center justify-between py-2 text-sm">
                <span className="flex items-center gap-2 text-white/90">
                  <span className="h-2 w-2 rounded-full bg-emerald-400" /> {p.name}
                </span>
                <span className="flex items-center gap-2">
                  <span className="tabular-nums text-white">{p.price}</span>
                  <span className="rounded-md bg-emerald-500/20 px-1.5 py-0.5 text-[11px] font-semibold text-emerald-300">
                    {p.off}
                  </span>
                </span>
              </li>
            ))}
          </ul>
          <Link className="mt-2 inline-block text-xs font-medium text-brand-gold hover:underline" href="/barometres">
            Voir toutes les offres
          </Link>
        </div>

        {/* Chart */}
        <div className="card card-pad sm:col-span-2 lg:col-span-1">
          <div className="section-title mb-1">Évolution de prix (DT)</div>
          <MultiLine
            data={acChartData}
            height={230}
            series={[
              { key: "prix", name: "Prix moyen", color: "#3b82f6" },
              { key: "min", name: "Prix minimum", color: "#10b981" },
              { key: "ia", name: "Prévision IA", color: "#ef4444", dashed: true },
            ]}
          />
        </div>

        {/* Alerte IA */}
        <div className="card card-pad border-red-500/40 relative overflow-hidden">
          <div className="absolute -right-6 -top-6 h-24 w-24 rounded-full bg-red-500/20 blur-2xl" />
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-red-400" />
            <span className="text-[11px] font-bold uppercase tracking-wider text-red-300">Alerte IA</span>
          </div>
          <div className="mt-2 text-xs text-white/80">
            Les climatiseurs 12000 BTU pourraient augmenter de
          </div>
          <div className="mt-1 text-4xl font-black text-red-400">+6.8%</div>
          <div className="text-xs text-white/60">dans les 30 prochains jours</div>
          <button className="btn-primary mt-3 w-full bg-emerald-500 hover:bg-emerald-600 shadow-none">
            Acheter maintenant
          </button>
          <div className="mt-2 text-center text-[11px] text-white/50">Recommandation IA</div>
        </div>
      </div>
    </section>
  );
}

function Stat({ label, value, change, up }: { label: string; value: string; change: string; up?: boolean }) {
  return (
    <div className="rounded-xl border border-bg-border bg-bg-800/70 p-3">
      <div className="text-[10px] uppercase tracking-wider text-white/50">{label}</div>
      <div className="mt-1 text-lg font-extrabold text-white">{value}</div>
      <div className={`text-[11px] ${up ? "text-emerald-400" : "text-white/60"}`}>{change}</div>
    </div>
  );
}
