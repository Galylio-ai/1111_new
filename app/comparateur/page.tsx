import { Search, Star, Trophy } from "lucide-react";
import { PageShell } from "@/components/site/PageShell";
import { Reveal } from "@/components/site/Reveal";
import { OffersGrid } from "@/components/site/OffersGrid";

export const metadata = { title: "Comparateur de prix — 1111.tn" };

const filters = ["Tout", "Smartphones", "Informatique", "Électroménager", "Maison", "Gaming", "Beauté"];

const comparison = {
  product: "Apple iPhone 15 128Go Noir",
  stores: [
    { name: "Mytek", price: "3.499", color: "from-red-500 to-red-700", rating: 4.9, stock: "En stock", best: true },
    { name: "Tunisianet", price: "3.560", color: "from-blue-500 to-blue-700", rating: 4.7, stock: "En stock" },
    { name: "Spacenet", price: "3.629", color: "from-orange-500 to-orange-600", rating: 4.6, stock: "Stock limité" },
    { name: "Zoom", price: "3.690", color: "from-pink-500 to-pink-600", rating: 4.5, stock: "En stock" },
    { name: "Batam", price: "3.749", color: "from-sky-500 to-sky-600", rating: 4.4, stock: "Sur commande" },
  ],
};

export default function ComparateurPage() {
  return (
    <PageShell
      icon="scale"
      title="Comparateur"
      arabic="مقارنة الأسعار"
      description="Comparez le même produit sur plus de 62 sites e-commerce tunisiens et trouvez le meilleur prix en un clic."
      chips={[
        { label: "Produits", value: "250 000+", tone: "gold" },
        { label: "Sites suivis", value: "62", tone: "blue" },
      ]}
    >
      {/* Search + filters */}
      <section className="mx-auto mt-5 max-w-[1600px] px-3 sm:px-4">
        <Reveal>
          <div className="card card-pad">
            <div className="flex items-center gap-2 rounded-2xl border border-bg-border bg-bg-700 p-1.5 shadow-inner dark:bg-bg-900">
              <Search className="ml-2 h-5 w-5 shrink-0 text-slate-400 dark:text-white/50" />
              <input
                className="min-w-0 flex-1 bg-transparent px-2 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none dark:text-white dark:placeholder:text-white/40"
                placeholder="Rechercher un produit, une marque, un modèle…"
              />
              <button className="btn-primary px-5 py-2 text-sm">Comparer</button>
            </div>
            <div className="mt-3 flex flex-wrap gap-2">
              {filters.map((f, i) => (
                <button key={f} className={i === 0 ? "chip border-brand-red/40 bg-brand-red/15 text-brand-red dark:text-white" : "chip"}>
                  {f}
                </button>
              ))}
            </div>
          </div>
        </Reveal>
      </section>

      {/* Live comparison table */}
      <section className="mx-auto mt-6 max-w-[1600px] px-3 sm:px-4">
        <Reveal>
          <div className="card card-pad relative overflow-hidden">
            <div className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full bg-brand-gold/10 blur-3xl" />
            <div className="relative mb-4 flex flex-wrap items-center justify-between gap-2">
              <div>
                <h2 className="section-title">Comparaison en direct</h2>
                <p className="mt-0.5 text-sm font-semibold text-slate-700 dark:text-white">{comparison.product}</p>
              </div>
              <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-0.5 text-[11px] font-semibold text-emerald-600 dark:text-emerald-300">
                <span className="live-dot" /> Prix mis à jour il y a 4 min
              </span>
            </div>

            <div className="relative grid grid-cols-[1fr_auto_auto] items-center gap-2 px-1 text-[10px] font-semibold uppercase tracking-wider text-slate-400 dark:text-white/40">
              <div>Enseigne</div>
              <div className="text-right">Prix</div>
              <div className="w-24 text-right">Disponibilité</div>
            </div>
            <ul className="relative mt-1 space-y-1.5">
              {comparison.stores.map((s) => (
                <li
                  key={s.name}
                  className={`grid grid-cols-[1fr_auto_auto] items-center gap-2 rounded-xl px-2 py-2.5 text-sm transition ${
                    s.best
                      ? "bg-gradient-to-r from-brand-red/15 via-brand-red/5 to-transparent ring-1 ring-brand-red/30"
                      : "border border-slate-200 bg-slate-50 hover:bg-slate-100 dark:border-white/5 dark:bg-bg-800 dark:hover:bg-bg-700"
                  }`}
                >
                  <span className="flex items-center gap-2.5">
                    <span className={`flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br ${s.color} text-xs font-black text-white ring-1 ring-white/10`}>
                      {s.name.charAt(0)}
                    </span>
                    <span className="font-semibold text-slate-900 dark:text-white">{s.name}</span>
                    {s.best && (
                      <span className="inline-flex items-center gap-1 rounded-md bg-brand-gold/15 px-1.5 py-0.5 text-[10px] font-bold text-brand-gold">
                        <Trophy className="h-3 w-3" /> Meilleur prix
                      </span>
                    )}
                    <span className="hidden items-center gap-0.5 text-xs text-brand-gold sm:inline-flex">
                      <Star className="h-3 w-3 fill-current" /> {s.rating}
                    </span>
                  </span>
                  <span className={`text-right font-extrabold tabular-nums ${s.best ? "text-brand-gold" : "text-slate-900 dark:text-white"}`}>
                    {s.price} <span className="text-[10px] font-normal text-slate-400 dark:text-white/40">DT</span>
                  </span>
                  <span className="w-24 text-right text-[11px] text-slate-500 dark:text-white/55">{s.stock}</span>
                </li>
              ))}
            </ul>
          </div>
        </Reveal>
      </section>

      {/* Suggestions */}
      <section className="mx-auto mt-6 max-w-[1600px] px-3 sm:px-4">
        <Reveal>
          <h2 className="section-title mb-3">Produits populaires à comparer</h2>
        </Reveal>
        <OffersGrid />
      </section>
    </PageShell>
  );
}
