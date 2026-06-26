import type { Metadata } from "next";
import { PageShell } from "@/components/site/PageShell";
import { Reveal } from "@/components/site/Reveal";
import { QoffaSection } from "@/components/QoffaSection";
import { EssentialBasketRanking } from "@/components/EssentialBasketRanking";
import {
  fmtDateFr,
  fmtDt,
  getEssentialBasketData,
  getQoffaBasketItems,
  shopDisplayName,
} from "@/lib/essentialBasket";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "Qoffa Tounsi — Panier essentiel",
  description:
    "Le coût réel de la vie en Tunisie : panier essentiel comparé entre Carrefour, Géant et Monoprix sur les mêmes produits.",
  path: "/qoffa",
  keywords: ["qoffa tunisie", "panier courses tunisie", "coût de la vie tunisie", "قفة التونسي"],
});

export default function QoffaPage() {
  const fiveShop = getEssentialBasketData().fiveShop;
  const panier = getQoffaBasketItems();
  const leader = fiveShop.ranking[0];

  return (
    <PageShell
      icon="basket"
      title="Qoffa Tounsi"
      arabic="قفة التونسي"
      description="Le coût réel de la vie en Tunisie — panier essentiel strict, recettes populaires et meilleurs prix par produit."
      chips={[
        {
          label: "Meilleur panier",
          value: leader ? `${fmtDt(leader.total)} DT` : "—",
          tone: "gold",
        },
        { label: "Produits", value: String(fiveShop.productCount), tone: "emerald" },
        {
          label: "Enseigne #1",
          value: leader ? shopDisplayName(leader.shop) : "—",
          tone: "blue",
        },
        {
          label: "Analyse",
          value: fmtDateFr(fiveShop.generatedAt) ?? "—",
          tone: "gold",
        },
      ]}
    >
      <QoffaSection contained={false} />

      <Reveal>
        <div className="card card-pad">
            <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
              <div>
                <h2 className="section-title">Panier essentiel — meilleur prix par produit</h2>
                <p className="mt-1 text-xs text-slate-500 dark:text-white/50">
                  Même référence dans 5 enseignes · prix minimum constaté par ligne.
                </p>
              </div>
              <span className="rounded-full border border-brand-gold/25 bg-brand-gold/10 px-2.5 py-0.5 text-[11px] font-semibold text-brand-gold">
                {panier.length} produits
              </span>
            </div>

            <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
              {panier.map((p) => (
                <div
                  key={p.productId}
                  className="rounded-xl border border-slate-200 bg-slate-50 p-3 dark:border-white/5 dark:bg-bg-800"
                >
                  <div className="text-[10px] font-bold uppercase tracking-wide text-brand-gold">
                    {p.category}
                  </div>
                  <div className="mt-1 line-clamp-2 text-sm font-semibold text-slate-900 dark:text-white">
                    {p.name}
                  </div>
                  <div className="mt-0.5 text-[11px] text-slate-500 dark:text-white/45">{p.choice}</div>
                  <div className="mt-2 flex items-end justify-between gap-2">
                    <span className="text-lg font-extrabold tabular-nums text-emerald-600 dark:text-emerald-300">
                      {fmtDt(p.price)} <span className="text-[10px] font-normal">DT</span>
                    </span>
                    <span className="min-w-0 truncate text-right text-[10px] font-semibold text-slate-600 dark:text-white/60">
                      {p.shop}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-5 grid gap-4 lg:grid-cols-2">
              <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-4 dark:bg-emerald-500/[0.06]">
                <div className="text-[11px] font-semibold uppercase tracking-wide text-slate-500 dark:text-white/50">
                  Panier optimal multi-enseignes
                </div>
                <div className="mt-1 text-2xl font-black tabular-nums text-emerald-600 dark:text-emerald-300">
                  {fmtDt(fiveShop.optimalBasketTotal)} DT
                </div>
                <p className="mt-1 text-[11px] text-slate-500 dark:text-white/45">
                  Somme du prix le plus bas par produit, toutes enseignes confondues.
                </p>
              </div>
              <div className="rounded-xl border border-brand-gold/20 bg-brand-gold/5 p-4">
                <div className="text-[11px] font-semibold uppercase tracking-wide text-slate-500 dark:text-white/50">
                  Une seule enseigne
                </div>
                <div className="mt-1 text-2xl font-black tabular-nums text-brand-gold">
                  {leader ? `${fmtDt(leader.total)} DT` : "—"}
                </div>
                <p className="mt-1 text-[11px] text-slate-500 dark:text-white/45">
                  {leader
                    ? `Tout acheter chez ${shopDisplayName(leader.shop)} — le moins cher en panier complet.`
                    : "—"}
                </p>
              </div>
            </div>
        </div>
      </Reveal>

      <Reveal delay={0.08}>
        <div className="card card-pad">
          <h2 className="section-title mb-3">Classement enseignes — panier complet</h2>
          <EssentialBasketRanking showCta detailHref="/grande-distribution" />
        </div>
      </Reveal>
    </PageShell>
  );
}
