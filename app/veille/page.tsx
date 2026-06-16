import { TrendingDown, TrendingUp, Plus } from "lucide-react";
import { PageShell } from "@/components/site/PageShell";
import { Reveal } from "@/components/site/Reveal";
import { veilleProducts } from "@/lib/data";

export const metadata = { title: "Veille prix consommateur — 1111.tn" };

const tracked = [
  ...veilleProducts.map((p) => ({ ...p, target: (parseFloat(p.price) * 0.95).toFixed(3), store: "Aziza" })),
  { name: "Yaourt Délice ×8", price: "4.200", change: "-1.8%", down: true, target: "4.000", store: "Monoprix" },
  { name: "Pâtes Warda 500g", price: "1.350", change: "+0.6%", down: false, target: "1.250", store: "MG" },
];

export default function VeillePage() {
  return (
    <PageShell
      icon="bell"
      title="Veille prix consommateur"
      arabic="ثبت في السعر بلا ما تفتكش"
      description="Surveillez vos produits du quotidien et recevez une alerte dès qu'un prix baisse ou atteint votre objectif."
      chips={[
        { label: "Produits suivis", value: "7", tone: "gold" },
        { label: "En baisse", value: "4", tone: "emerald" },
      ]}
    >
      {/* Add product */}
      <section className="mx-auto mt-6 max-w-[1600px] px-3 sm:px-4">
        <Reveal>
          <div className="card card-pad">
            <h2 className="section-title mb-3">Ajouter un produit à surveiller</h2>
            <div className="flex items-center gap-2 rounded-xl border border-bg-border bg-bg-900/60 p-1.5">
              <input className="min-w-0 flex-1 bg-transparent px-3 py-2 text-sm text-white placeholder:text-white/40 focus:outline-none" placeholder="Ex : Lait Délice 1L, iPhone 15, Huile El Mazraa…" />
              <button className="btn-primary inline-flex items-center gap-1.5 px-4 py-2 text-sm">
                <Plus className="h-4 w-4" /> Surveiller
              </button>
            </div>
          </div>
        </Reveal>
      </section>

      {/* Watchlist */}
      <section className="mx-auto mt-6 max-w-[1600px] px-3 sm:px-4">
        <Reveal>
          <div className="card card-pad">
            <h2 className="section-title mb-3">Mes produits suivis</h2>
            <div className="grid grid-cols-[1fr_auto_auto_auto] items-center gap-2 px-2 text-[10px] font-semibold uppercase tracking-wider text-white/40">
              <div>Produit</div>
              <div className="w-24 text-right">Prix actuel</div>
              <div className="hidden w-24 text-right sm:block">Objectif</div>
              <div className="w-20 text-right">24h</div>
            </div>
            <ul className="mt-1 space-y-1.5">
              {tracked.map((p) => (
                <li key={p.name} className="grid grid-cols-[1fr_auto_auto_auto] items-center gap-2 rounded-xl border border-white/5 bg-bg-800/40 px-2 py-2.5 text-sm transition hover:border-white/15">
                  <span className="flex items-center gap-2 truncate">
                    <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-brand-gold" />
                    <span className="truncate font-semibold text-white">{p.name}</span>
                    <span className="hidden text-[11px] text-white/40 md:inline">· {p.store}</span>
                  </span>
                  <span className="w-24 text-right font-bold tabular-nums text-white">{p.price} <span className="text-[10px] font-normal text-white/40">DT</span></span>
                  <span className="hidden w-24 text-right text-xs tabular-nums text-brand-gold sm:block">{p.target} DT</span>
                  <span className={`flex w-20 items-center justify-end gap-0.5 text-xs font-semibold ${p.down ? "text-emerald-300" : "text-red-300"}`}>
                    {p.down ? <TrendingDown className="h-3 w-3" /> : <TrendingUp className="h-3 w-3" />}
                    {p.change}
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
