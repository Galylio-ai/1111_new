import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PageShell } from "@/components/site/PageShell";
import { PopularPlateDetail } from "@/components/PopularPlateDetail";
import { PLATE_IDS, fmtDateFr, fmtDt, getStrictPlate } from "@/lib/popularPlates";
import { pageMetadata } from "@/lib/seo";

export function generateStaticParams() {
  return PLATE_IDS.map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: { slug: string };
}): Promise<Metadata> {
  const plate = getStrictPlate(params.slug);
  if (!plate) return { title: "Plat introuvable" };
  return pageMetadata({
    title: `${plate.title} — Coût par enseigne`,
    description: `Prix réel de ${plate.title.toLowerCase()} : comparaison stricte sur produits identiques entre enseignes tunisiennes.`,
    path: `/qoffa/plats/${params.slug}`,
  });
}

export default function QoffaPlateDetailPage({ params }: { params: { slug: string } }) {
  const plate = getStrictPlate(params.slug);
  if (!plate) notFound();

  const leader = plate.clusters.flatMap((c) => c.totals).sort(
    (a, b) => a.estimatedConsumedTotal - b.estimatedConsumedTotal,
  )[0];

  return (
    <PageShell
      icon="basket"
      title={plate.title}
      arabic={plate.arabicTitle}
      description="Comparaison stricte sur produits identiques croisés — coût assiette vs panier catalogue."
      chips={[
        {
          label: "Meilleur prix",
          value: leader ? `${fmtDt(leader.estimatedConsumedTotal)} DT` : "—",
          tone: "emerald",
        },
        { label: "Ingrédients", value: String(plate.recipeAssumption.length), tone: "gold" },
        { label: "Groupes", value: String(plate.clusters.length), tone: "blue" },
        {
          label: "Analyse",
          value: fmtDateFr(plate.generatedAt) ?? "—",
          tone: "gold",
        },
      ]}
    >
      <PopularPlateDetail plate={plate} />
    </PageShell>
  );
}
