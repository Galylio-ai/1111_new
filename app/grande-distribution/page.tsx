import type { Metadata } from "next";
import { EssentialBasketDetail } from "@/components/EssentialBasketDetail";
import { PageShell } from "@/components/site/PageShell";
import {
  fmtDateFr,
  fmtDt,
  getEssentialBasketData,
  shopDisplayName,
} from "@/lib/essentialBasket";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "Grande Distribution — Panier essentiel",
  description:
    "Comparez le panier essentiel tunisien entre Carrefour, Géant, Monoprix et les enseignes Carrefour. Prix réels sur les mêmes produits.",
  path: "/grande-distribution",
  keywords: [
    "grande distribution tunisie",
    "panier courses tunisie",
    "comparer supermarchés",
    "carrefour géant monoprix",
  ],
});

export default function GrandeDistributionPage() {
  const data = getEssentialBasketData().fiveShop;
  const leader = data.ranking[0];

  return (
    <PageShell
      icon="cart"
      title="Grande Distribution"
      accent="مقارنة السوبرماركات"
      arabic="مقارنة السوبرماركات"
      description={
        leader
          ? `${shopDisplayName(leader.shop)} en tête avec ${fmtDt(leader.total)} DT sur ${data.productCount} produits stricts — économie jusqu'à ${fmtDt(data.maxSavings)} DT.`
          : "Comparaison du panier essentiel entre les grandes enseignes tunisiennes."
      }
      chips={[
        { label: "Produits", value: String(data.productCount), tone: "gold" },
        { label: "Enseignes", value: String(data.shops.length), tone: "emerald" },
        {
          label: "Économie max",
          value: `${fmtDt(data.maxSavings)} DT`,
          tone: "blue",
        },
        {
          label: "Analyse",
          value: fmtDateFr(data.generatedAt) ?? "—",
          tone: "gold",
        },
      ]}
    >
      <EssentialBasketDetail />
    </PageShell>
  );
}
