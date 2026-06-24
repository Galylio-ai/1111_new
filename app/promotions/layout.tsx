import type { Metadata } from "next";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "Promotions actives Tunisie",
  description:
    "Toutes les promotions en cours sur 1111.tn : supermarchés, parapharmacies, magasins informatique et électroménager. Détection des vraies remises et des fausses promos.",
  path: "/promotions",
  keywords: ["promotions tunisie", "soldes tunisie", "réductions tunisie", "fausse promo", "vraies promotions"],
});

export default function PromotionsLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
