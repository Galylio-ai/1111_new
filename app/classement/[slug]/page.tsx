import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PriceRankingDetail } from "@/components/PriceRankingDetail";
import { PageShell } from "@/components/site/PageShell";
import { PRICE_RANKING_CATALOG } from "@/lib/priceRankings";
import { shopDisplayName } from "@/lib/priceRankings";
import { getRankingBySlug } from "@/lib/priceRankingsServer";
import { pageMetadata } from "@/lib/seo";

export function generateStaticParams() {
  return PRICE_RANKING_CATALOG.map((c) => ({ slug: c.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: { slug: string };
}): Promise<Metadata> {
  const catalog = PRICE_RANKING_CATALOG.find((c) => c.slug === params.slug);
  if (!catalog) return { title: "Classement introuvable" };
  return pageMetadata({
    title: `Meilleurs prix — ${catalog.title}`,
    description: `Classement des enseignes en ${catalog.title.toLowerCase()} : comparaison équitable des prix sur les mêmes produits.`,
    path: `/classement/${params.slug}`,
  });
}

export default async function ClassementPage({
  params,
}: {
  params: { slug: string };
}) {
  const data = await getRankingBySlug(params.slug, 15);
  if (!data) notFound();

  const { catalog, scope } = data;
  const leader = scope.shops[0];

  return (
    <PageShell
      icon="scale"
      title="Classement prix"
      accent={catalog.title}
      arabic="أفضل الأسعار"
      description={
        leader
          ? `${shopDisplayName(leader.shop_key)} en tête avec ${Math.round(leader.fair_win_rate * 1000) / 10} % de victoires équitables sur ${scope.matched_products?.toLocaleString("fr-FR")} produits comparés.`
          : `Comparaison des enseignes en ${catalog.title.toLowerCase()}.`
      }
    >
      <PriceRankingDetail catalog={catalog} scope={scope} />
    </PageShell>
  );
}
