import { ShoppingCart, Trophy } from "lucide-react";
import { PageShell } from "@/components/site/PageShell";
import { Reveal } from "@/components/site/Reveal";
import { distributionEnseignes } from "@/lib/data";

export const metadata = { title: "Grande Distribution — 1111.tn" };

const basket = [
  { name: "Semoule 5kg", best: "Aziza", price: "8.900" },
  { name: "Huile végétale 5L", best: "Carrefour Market", price: "32.500" },
  { name: "Viande bœuf 1kg", best: "Aziza", price: "39.900" },
  { name: "Lait 1L ×6", best: "Aziza", price: "12.480" },
  { name: "Café 250g ×2", best: "MG", price: "14.500" },
  { name: "Lessive 3kg", best: "Monoprix", price: "16.900" },
];

export default function GrandeDistributionPage() {
  return (
    <PageShell
      icon="cart"
      title="Grande Distribution"
      arabic="السوبرماركت"
      description="Comparez le prix d'un panier familial type entre toutes les enseignes de grande distribution, mis à jour chaque semaine."
      chips={[
        { label: "Produits comparés", value: "20", tone: "gold" },
        { label: "Économie max", value: "8.370 DT", tone: "emerald" },
      ]}
    >
      <section className="mx-auto mt-6 grid max-w-[1600px] grid-cols-1 gap-4 px-3 sm:px-4 lg:grid-cols-[1.6fr_1fr]">
        {/* Ranking */}
        <Reveal>
          <div className="card card-pad relative overflow-hidden">
            <ShoppingCart className="pointer-events-none absolute -right-2 -top-2 hidden h-32 w-32 text-white/[0.04] md:block" strokeWidth={1.2} aria-hidden />
            <div className="relative mb-4">
              <h2 className="section-title">Comparaison panier familial</h2>
              <div className="mt-0.5 text-xs text-white/60">Cette semaine · 20 produits essentiels</div>
            </div>
            <div className="relative grid grid-cols-[28px_1fr_92px_84px] items-center gap-2 px-1 text-[10px] font-semibold uppercase tracking-wider text-white/40">
              <div>#</div><div>Enseigne</div><div className="text-right">Prix total</div><div className="text-right">vs min</div>
            </div>
            <ul className="relative mt-1 space-y-1.5">
              {distributionEnseignes.map((e, idx) => (
                <li
                  key={e.name}
                  className={`grid grid-cols-[28px_1fr_92px_84px] items-center gap-2 rounded-xl px-2 py-2.5 text-sm transition ${
                    e.best ? "bg-gradient-to-r from-brand-red/15 via-brand-red/5 to-transparent ring-1 ring-brand-red/30" : "border border-white/5 bg-bg-800/40 hover:bg-bg-800/70"
                  }`}
                >
                  <div className="flex items-center justify-center">
                    {e.best ? <Trophy className="h-4 w-4 text-brand-gold" /> : <span className="text-[11px] font-bold text-white/40">{idx + 1}</span>}
                  </div>
                  <div className="flex min-w-0 items-center gap-2">
                    <span className={`h-2.5 w-2.5 shrink-0 rounded-full ${e.color}`} />
                    <span className={`truncate ${e.best ? "font-bold text-brand-red" : "text-white/90"}`}>{e.name}</span>
                  </div>
                  <div className="text-right font-semibold tabular-nums text-white">{e.price} <span className="text-[10px] font-normal text-white/40">DT</span></div>
                  <div className={`text-right text-xs font-medium tabular-nums ${e.best ? "text-brand-gold" : "text-red-300"}`}>{e.diff}</div>
                </li>
              ))}
            </ul>
            <div className="relative mt-4 overflow-hidden rounded-xl border border-emerald-500/30 bg-gradient-to-br from-emerald-500/15 via-emerald-500/10 to-transparent p-3">
              <div className="absolute -right-4 -top-4 h-20 w-20 rounded-full bg-emerald-500/20 blur-2xl" />
              <div className="relative flex items-end justify-between gap-3">
                <div>
                  <div className="text-[11px] font-semibold uppercase tracking-wider text-emerald-200/80">Économie possible</div>
                  <div className="mt-0.5 flex items-baseline gap-1">
                    <span className="text-3xl font-extrabold tabular-nums text-emerald-300">8.370</span>
                    <span className="text-sm font-semibold text-emerald-200/70">DT</span>
                  </div>
                  <div className="text-[11px] text-white/60">vs l'enseigne la plus chère</div>
                </div>
                <button className="btn-primary shrink-0 whitespace-nowrap">Comparer mon panier</button>
              </div>
            </div>
          </div>
        </Reveal>

        {/* Best per product */}
        <Reveal delay={0.1}>
          <div className="card card-pad">
            <h2 className="section-title mb-3">Meilleur prix par produit</h2>
            <ul className="space-y-1.5">
              {basket.map((b) => (
                <li key={b.name} className="flex items-center justify-between rounded-xl border border-white/5 bg-bg-800/40 px-3 py-2.5 text-sm transition hover:border-white/15">
                  <span className="min-w-0">
                    <span className="block truncate font-semibold text-white">{b.name}</span>
                    <span className="text-[11px] text-emerald-300">Moins cher chez {b.best}</span>
                  </span>
                  <span className="font-extrabold tabular-nums text-brand-gold">{b.price} <span className="text-[10px] font-normal text-white/40">DT</span></span>
                </li>
              ))}
            </ul>
          </div>
        </Reveal>
      </section>
    </PageShell>
  );
}
