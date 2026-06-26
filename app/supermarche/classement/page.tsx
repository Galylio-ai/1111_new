import type { Metadata } from "next";
import { GroceryClassementDetail } from "@/components/GroceryClassementDetail";
import { PageShell } from "@/components/site/PageShell";
import { getGroceryCrossingData, shopShortName } from "@/lib/groceryCrossing";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "Classement supermarchés — Courses",
  description:
    "Quel supermarché est le moins cher en Tunisie ? Classement Aziza, Carrefour, Géant, Monoprix par croisement de prix sur les mêmes produits.",
  path: "/supermarche/classement",
  keywords: [
    "supermarché moins cher tunisie",
    "classement aziza carrefour",
    "comparer prix courses",
    "grande distribution tunisie",
  ],
});

export default function SupermarcheClassementPage() {
  const data = getGroceryCrossingData();
  const leader = data.featured_shops[0];

  return (
    <PageShell
      icon="scale"
      title="Classement courses"
      accent="Grande distribution"
      arabic="أرخص سوبرماركت"
      description={
        leader
          ? `${shopShortName(leader.shop_name)} en tête avec ${leader.cheapest_rate_pct}% de victoires sur ${data.summary.crossed_products.toLocaleString("fr-FR")} produits croisés entre ${data.summary.shops} enseignes.`
          : "Comparaison des enseignes de grande distribution sur les produits identiques."
      }
    >
      <GroceryClassementDetail />
    </PageShell>
  );
}
