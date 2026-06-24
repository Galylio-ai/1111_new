import type { Metadata } from "next";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "Comparaison de produits",
  description:
    "Comparez deux produits côte à côte : prix, caractéristiques, disponibilité et meilleures offres chez les boutiques tunisiennes.",
  path: "/comparaison",
  keywords: ["comparaison produits tunisie", "versus tunisie"],
});

export default function ComparaisonLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
