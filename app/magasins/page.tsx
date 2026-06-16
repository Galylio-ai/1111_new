import { Star, Trophy, ArrowUpRight, ArrowDownRight } from "lucide-react";
import { PageShell } from "@/components/site/PageShell";
import { Reveal } from "@/components/site/Reveal";
import { distributionEnseignes } from "@/lib/data";

export const metadata = { title: "Magasins & Enseignes — 1111.tn" };

const stores = [
  { name: "Mytek", color: "from-red-500 to-red-700", rating: 4.8, products: "48 200", index: "104.2", up: true, cat: "High-tech & Électroménager" },
  { name: "Tunisianet", color: "from-blue-500 to-blue-700", rating: 4.7, products: "41 900", index: "103.1", up: true, cat: "Informatique & High-tech" },
  { name: "Spacenet", color: "from-orange-500 to-orange-600", rating: 4.6, products: "33 540", index: "102.4", up: false, cat: "Informatique" },
  { name: "Aziza", color: "from-red-600 to-rose-700", rating: 4.6, products: "9 320", index: "98.7", up: false, cat: "Grande distribution" },
  { name: "Carrefour", color: "from-blue-600 to-indigo-700", rating: 4.5, products: "12 180", index: "100.2", up: true, cat: "Grande distribution" },
  { name: "Géant", color: "from-yellow-400 to-amber-500", rating: 4.4, products: "10 760", index: "101.0", up: true, cat: "Hypermarché" },
  { name: "Monoprix", color: "from-rose-500 to-pink-600", rating: 4.5, products: "8 940", index: "100.8", up: false, cat: "Supermarché" },
  { name: "Technopro", color: "from-emerald-500 to-teal-600", rating: 4.4, products: "22 410", index: "102.9", up: true, cat: "Informatique" },
];

export default function MagasinsPage() {
  return (
    <PageShell
      icon="store"
      title="Magasins"
      arabic="المتاجر والمؤسسات"
      description="Tous les magasins et enseignes suivis par 1111.tn — comparez leur indice de prix, leur catalogue et leur fiabilité."
      chips={[
        { label: "Enseignes suivies", value: "62", tone: "gold" },
        { label: "Note moyenne", value: "4.6/5", tone: "emerald" },
      ]}
    >
      {/* Store cards */}
      <section className="mx-auto mt-6 max-w-[1600px] px-3 sm:px-4">
        <Reveal>
          <h2 className="section-title mb-3">Enseignes populaires</h2>
        </Reveal>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {stores.map((s, i) => (
            <Reveal key={s.name} delay={i * 0.05}>
              <div className="card group relative h-full overflow-hidden p-4 transition hover:-translate-y-1 hover:border-white/20 hover:shadow-[0_0_30px_-10px_rgba(225,29,45,0.5)]">
                <div className="pointer-events-none absolute -right-8 -top-8 h-24 w-24 rounded-full bg-brand-gold/10 blur-2xl" />
                <div className="relative flex items-center gap-3">
                  <span className={`flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br ${s.color} text-lg font-black text-white ring-1 ring-white/10`}>
                    {s.name.charAt(0)}
                  </span>
                  <div className="min-w-0">
                    <div className="truncate text-base font-bold text-white">{s.name}</div>
                    <div className="inline-flex items-center gap-0.5 text-xs text-brand-gold">
                      <Star className="h-3 w-3 fill-current" /> {s.rating}
                    </div>
                  </div>
                </div>
                <div className="relative mt-3 text-[11px] text-white/55">{s.cat}</div>
                <div className="relative mt-3 flex items-center justify-between rounded-xl border border-white/5 bg-bg-800/50 px-3 py-2">
                  <div>
                    <div className="text-[10px] uppercase tracking-wider text-white/40">Produits</div>
                    <div className="text-sm font-bold tabular-nums text-white">{s.products}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-[10px] uppercase tracking-wider text-white/40">Indice prix</div>
                    <div className={`inline-flex items-center gap-0.5 text-sm font-bold tabular-nums ${s.up ? "text-red-300" : "text-emerald-300"}`}>
                      {s.up ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
                      {s.index}
                    </div>
                  </div>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* Ranking by cheapest basket */}
      <section className="mx-auto mt-6 max-w-[1600px] px-3 sm:px-4">
        <Reveal>
          <div className="card card-pad">
            <div className="mb-3 flex items-center gap-2">
              <Trophy className="h-4 w-4 text-brand-gold" />
              <h2 className="section-title">Classement panier familial — la moins chère gagne</h2>
            </div>
            <ul className="space-y-1.5">
              {distributionEnseignes.map((e, idx) => (
                <li
                  key={e.name}
                  className={`grid grid-cols-[40px_1fr_auto] items-center gap-2 rounded-xl px-3 py-2.5 text-sm transition ${
                    e.best ? "bg-gradient-to-r from-brand-red/15 via-brand-red/5 to-transparent ring-1 ring-brand-red/30" : "border border-white/5 bg-bg-800/40 hover:bg-bg-800/70"
                  }`}
                >
                  <span className="flex items-center justify-center">
                    {e.best ? <Trophy className="h-4 w-4 text-brand-gold" /> : <span className="text-xs font-bold text-white/40">{idx + 1}</span>}
                  </span>
                  <span className="flex items-center gap-2">
                    <span className={`h-2.5 w-2.5 rounded-full ${e.color}`} />
                    <span className={e.best ? "font-bold text-brand-red" : "text-white/90"}>{e.name}</span>
                  </span>
                  <span className="text-right">
                    <span className="font-extrabold tabular-nums text-white">{e.price} <span className="text-[10px] font-normal text-white/40">DT</span></span>
                    <span className={`ml-3 text-xs tabular-nums ${e.best ? "text-brand-gold" : "text-red-300"}`}>{e.diff}</span>
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
