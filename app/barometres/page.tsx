import { TrendingDown, TrendingUp } from "lucide-react";
import { PageShell } from "@/components/site/PageShell";
import { Reveal } from "@/components/site/Reveal";
import { AcBarometer } from "@/components/AcBarometer";
import { categoryBarometres } from "@/lib/data";

export const metadata = { title: "Baromètres par catégorie - 1111.tn" };

const categoryImages = [
  "/SmartphoneBg.png",
  "/InformatiqueBg.png",
  "/ElectroBg.png",
  "/couffin.png",
  "/ParaSymbole.png",
  "/clim.png",
];

export default function BarometresPage() {
  return (
    <PageShell
      icon="gauge"
      title="Baromètres"
      accent="par catégorie"
      arabic="مقاييس الأسعار"
      description="L'indice de prix de chaque univers du marché tunisien, avec les meilleures enseignes et leur fiabilité - mis à jour chaque heure."
      chips={[
        { label: "Catégories", value: "6", tone: "gold" },
        { label: "Meta Index", value: "108.7", tone: "emerald" },
      ]}
    >
      <section className="mx-auto mt-6 max-w-[1600px] px-3 sm:px-4">
        <Reveal>
          <h2 className="section-title mb-3">Baromètres par catégorie</h2>
        </Reveal>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {categoryBarometres.map((c, i) => {
            const up = c.change.startsWith("+");
            const image = categoryImages[i] ?? "/metaBg.png";
            return (
              <Reveal key={c.name} delay={i * 0.05}>
                <div className="card card-pad group h-full transition hover:-translate-y-1 hover:border-slate-300 dark:hover:border-white/20">
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex min-w-0 items-center gap-3">
                      <span className={`flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-gradient-to-br ${c.color} p-1.5 shadow-lg`}>
                        <img src={image} alt={c.name} className="h-full w-full object-contain" />
                      </span>
                      <div className="truncate text-base font-bold text-slate-900 dark:text-white">{c.name}</div>
                    </div>
                    <div className={`h-2.5 w-2.5 shrink-0 rounded-full bg-gradient-to-br ${c.color}`} />
                  </div>
                  <div className="mt-2 flex items-baseline gap-2">
                    <div className="text-3xl font-black tabular-nums text-slate-900 dark:text-white">{c.value}</div>
                    <div className="text-xs text-slate-400 dark:text-white/35">/100</div>
                    <div className={`ml-auto inline-flex items-center gap-0.5 text-sm font-bold ${up ? "text-red-500 dark:text-red-300" : "text-emerald-600 dark:text-emerald-300"}`}>
                      {up ? <TrendingUp className="h-3.5 w-3.5" /> : <TrendingDown className="h-3.5 w-3.5" />}
                      {c.change}
                    </div>
                  </div>
                  <div className="mt-3 border-t border-slate-200 pt-2 text-[10px] font-semibold uppercase tracking-wider text-slate-400 dark:border-bg-border/60 dark:text-white/40">
                    Meilleures enseignes
                  </div>
                  <ul className="mt-1.5 space-y-1.5 text-sm">
                    {c.stores.map((s, idx) => (
                      <li key={s} className="flex items-center justify-between">
                        <span className="text-slate-700 dark:text-white/85">{s}</span>
                        <span className="text-brand-gold">★ {c.ratings[idx]}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </Reveal>
            );
          })}
        </div>
      </section>

      <section className="mx-auto mt-8 max-w-[1600px] px-3 sm:px-4">
        <Reveal>
          <h2 className="section-title mb-1">Focus - Climatiseurs Tunisie</h2>
        </Reveal>
      </section>
      <AcBarometer />
    </PageShell>
  );
}
