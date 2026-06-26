import type { Metadata } from "next";
import Link from "next/link";
import { ChefHat } from "lucide-react";
import { PageShell } from "@/components/site/PageShell";
import { Reveal } from "@/components/site/Reveal";
import { fmtDateFr, fmtDt, getPopularPlatesData } from "@/lib/popularPlates";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "Plats populaires — Qoffa",
  description:
    "Coût réel des plats tunisiens (ojja, makrouna au thon) comparé sur les mêmes produits croisés entre enseignes.",
  path: "/qoffa/plats",
  keywords: ["ojja tunisienne prix", "makrouna thon tunisie", "recette tunisienne coût", "qoffa plats"],
});

export default function QoffaPlatsPage() {
  const { strict } = getPopularPlatesData();

  return (
    <PageShell
      icon="basket"
      title="Plats populaires"
      arabic="أطباق شعبية"
      description="Combien coûte une assiette tunisienne quand on compare les mêmes produits catalogue entre enseignes ?"
      chips={[
        { label: "Plats", value: String(strict.length), tone: "gold" },
        { label: "Mode", value: "Strict", tone: "emerald" },
        {
          label: "Analyse",
          value: fmtDateFr(strict[0]?.generatedAt ?? null) ?? "—",
          tone: "blue",
        },
      ]}
    >
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {strict.map((plate, i) => (
          <Reveal key={plate.id} delay={i * 0.06}>
            <Link
              href={`/qoffa/plats/${plate.slug}`}
              className="card card-pad group block transition hover:border-brand-gold/40 hover:shadow-lg"
            >
              <div className="flex items-start gap-4">
                <div className="flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-slate-50 dark:bg-white/[0.04]">
                  <img
                    src={plate.image}
                    alt=""
                    className="h-16 w-16 object-contain transition group-hover:scale-105"
                  />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <ChefHat className="h-4 w-4 text-brand-gold" />
                    <span className="section-title">{plate.title}</span>
                  </div>
                  <p className="font-arabic text-sm text-slate-500 dark:text-white/50" dir="rtl">
                    {plate.arabicTitle}
                  </p>
                  <p className="mt-2 text-xs text-slate-500 dark:text-white/50">
                    {plate.recipeAssumption.length} ingrédients · {plate.clusters.length} groupes
                    d&apos;enseignes
                  </p>
                  <div className="mt-3 flex flex-wrap items-center gap-2">
                    <span className="rounded-full border border-emerald-500/25 bg-emerald-500/10 px-2.5 py-1 text-xs font-bold text-emerald-600 dark:text-emerald-300">
                      dès {fmtDt(plate.featuredConsumedTotal)} DT / assiette
                    </span>
                    <span className="rounded-full border border-brand-gold/25 bg-brand-gold/10 px-2.5 py-0.5 text-[10px] font-semibold text-brand-gold">
                      Produits identiques
                    </span>
                  </div>
                </div>
              </div>
            </Link>
          </Reveal>
        ))}
      </div>

      <Reveal delay={0.12}>
        <div className="card card-pad mt-4 border-amber-400/20 bg-amber-500/5">
          <p className="text-sm leading-relaxed text-slate-600 dark:text-white/65">
            Les comparaisons strictes sont découpées par <strong>groupes d&apos;enseignes</strong> où
            chaque ingrédient partage le même produit croisé. Aziza n&apos;apparaît pas sur ces plats en
            mode strict (œufs et cumin non croisés). Pour une vue sur 7 enseignes avec ingrédients
            comparables, consultez le tableau « estimation tous magasins » sur chaque fiche plat.
          </p>
        </div>
      </Reveal>
    </PageShell>
  );
}
