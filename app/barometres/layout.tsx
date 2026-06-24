import type { Metadata } from "next";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "Baromètres par catégorie — Tunisie",
  description:
    "L'état réel du marché tunisien par catégorie : nombre de produits suivis, taux de promotion, réduction moyenne et meilleures enseignes. Calculé en direct depuis nos bases.",
  path: "/barometres",
  keywords: ["baromètre prix tunisie", "indice prix tunisie", "marché tunisien", "promotions tunisie par catégorie"],
});

export default function BarometresLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
