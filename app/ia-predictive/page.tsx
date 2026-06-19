import { TrendingUp, TrendingDown, Sparkles } from "lucide-react";
import { PageShell } from "@/components/site/PageShell";
import { Reveal } from "@/components/site/Reveal";
import { IaPredictive } from "@/components/IaPredictive";

export const metadata = { title: "IA Prédictive — 1111.tn" };

const predictions = [
  { name: "iPhone 15 128Go", reco: "Attendre", forecast: "+2.1%", up: true, conf: 88, horizon: "15 j" },
  { name: "Climatiseur 12000 BTU", reco: "Acheter", forecast: "+6.8%", up: true, conf: 91, horizon: "30 j" },
  { name: "Samsung S23 256Go", reco: "Attendre", forecast: "−3.2%", up: false, conf: 84, horizon: "10 j" },
  { name: "PS5 Console", reco: "Acheter", forecast: "−5.7%", up: false, conf: 79, horizon: "20 j" },
  { name: "MacBook Air M1", reco: "Acheter", forecast: "+1.4%", up: true, conf: 86, horizon: "15 j" },
  { name: "TV Samsung 55″ QLED", reco: "Attendre", forecast: "−2.0%", up: false, conf: 82, horizon: "25 j" },
];

export default function IaPredictivePage() {
  return (
    <PageShell
      icon="bot"
      title="IA Prédictive"
      arabic="الذكاء الاصطناعي للأسعار"
      description="Notre IA analyse des millions de points de prix pour prédire l'évolution future et vous dire quand acheter ou attendre."
      chips={[
        { label: "Précision modèle", value: "91.8%", tone: "emerald" },
        { label: "Moteur", value: "GPT · v2", tone: "gold" },
      ]}
    >
      <IaPredictive />

      {/* Predictions table */}
      <section className="mx-auto mt-5 max-w-[1600px] px-3 sm:px-4">
        <Reveal>
          <div className="card card-pad">
            <div className="mb-3 flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-brand-gold" />
              <h2 className="section-title">Prévisions par produit</h2>
            </div>
            <div className="grid grid-cols-[1fr_auto_auto_auto] items-center gap-2 px-2 text-[10px] font-semibold uppercase tracking-wider text-slate-400 dark:text-white/40">
              <div>Produit</div>
              <div className="w-20 text-center">Reco</div>
              <div className="w-20 text-right">Prévision</div>
              <div className="hidden w-24 text-right sm:block">Confiance</div>
            </div>
            <ul className="mt-1 space-y-1.5">
              {predictions.map((p) => (
                <li
                  key={p.name}
                  className="grid grid-cols-[1fr_auto_auto_auto] items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-2 py-2.5 text-sm transition hover:border-slate-300 dark:border-white/5 dark:bg-bg-800 dark:hover:border-white/15"
                >
                  <span className="truncate font-semibold text-slate-900 dark:text-white">{p.name}</span>
                  <span className="flex w-20 justify-center">
                    <span className={`rounded-md px-2 py-0.5 text-[11px] font-bold ${p.reco === "Acheter" ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-300" : "bg-amber-500/15 text-amber-600 dark:text-amber-300"}`}>
                      {p.reco}
                    </span>
                  </span>
                  <span className={`flex w-20 items-center justify-end gap-0.5 font-bold tabular-nums ${p.up ? "text-red-500 dark:text-red-300" : "text-emerald-600 dark:text-emerald-300"}`}>
                    {p.up ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                    {p.forecast}
                  </span>
                  <span className="hidden w-24 items-center justify-end gap-2 sm:flex">
                    <span className="h-1.5 w-12 overflow-hidden rounded-full bg-slate-200 dark:bg-white/10">
                      <span className="block h-full rounded-full bg-gradient-to-r from-brand-gold to-brand-red" style={{ width: `${p.conf}%` }} />
                    </span>
                    <span className="text-[11px] tabular-nums text-slate-500 dark:text-white/60">{p.conf}%</span>
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </Reveal>
      </section>
    </PageShell>
  );
}
