import { TrendingDown, TrendingUp } from "lucide-react";
import { PageShell } from "@/components/site/PageShell";
import { Reveal } from "@/components/site/Reveal";
import { QoffaSection } from "@/components/QoffaSection";

export const metadata = { title: "Qoffa Tounsi — 1111.tn" };

const panier = [
  { name: "Semoule 5kg", qty: "1", price: "8.900", change: "+1.2%", up: true },
  { name: "Huile végétale 5L", price: "32.500", qty: "1", change: "+4.1%", up: true },
  { name: "Viande bœuf 1kg", price: "39.900", qty: "2", change: "+2.8%", up: true },
  { name: "Légumes (mix)", price: "12.300", qty: "1", change: "-3.4%", up: false },
  { name: "Lait 1L", price: "2.080", qty: "6", change: "-7.5%", up: false },
  { name: "Œufs (x30)", price: "7.500", qty: "1", change: "+0.4%", up: true },
  { name: "Café 250g", price: "7.250", qty: "2", change: "+1.1%", up: true },
  { name: "Sucre 1kg", price: "3.200", qty: "2", change: "0%", up: true },
];

export default function QoffaPage() {
  return (
    <PageShell
      icon="basket"
      title="Qoffa Tounsi"
      arabic="قفة التونسي"
      description="Le coût réel de la vie en Tunisie — suivez le prix du panier familial, les recettes populaires et le classement des enseignes."
      chips={[
        { label: "Coût du panier", value: "21.460 DT", tone: "gold" },
        { label: "vs semaine", value: "−3%", tone: "emerald" },
      ]}
    >
      <QoffaSection />

      {/* Panier breakdown */}
      <section className="mx-auto mt-5 max-w-[1600px] px-3 sm:px-4">
        <Reveal>
          <div className="card card-pad">
            <div className="mb-3 flex items-center justify-between">
              <h2 className="section-title">Composition du panier familial</h2>
              <span className="rounded-full border border-brand-gold/25 bg-brand-gold/10 px-2.5 py-0.5 text-[11px] font-semibold text-brand-gold">
                8 produits essentiels
              </span>
            </div>
            <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2 lg:grid-cols-4">
              {panier.map((p) => (
                <div key={p.name} className="rounded-xl border border-white/5 bg-bg-800/50 p-3 transition hover:border-white/15">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-semibold text-white">{p.name}</span>
                    <span className="rounded-md bg-white/5 px-1.5 py-0.5 text-[10px] text-white/50">×{p.qty}</span>
                  </div>
                  <div className="mt-2 flex items-end justify-between">
                    <span className="text-lg font-extrabold tabular-nums text-white">{p.price} <span className="text-[10px] font-normal text-white/40">DT</span></span>
                    <span className={`inline-flex items-center gap-0.5 text-xs font-semibold ${p.up ? "text-red-300" : "text-emerald-300"}`}>
                      {p.up ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                      {p.change}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </Reveal>
      </section>
    </PageShell>
  );
}
