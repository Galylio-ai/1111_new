import type { Metadata } from "next";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "Supermarché — Comparateur de prix",
  description:
    "Comparez les prix de plus de 33 000 produits alimentaires dans Aziza, Carrefour, Géant, Monoprix et tous les supermarchés tunisiens. Trouvez où votre panier coûte le moins cher.",
  path: "/supermarche",
  keywords: ["supermarché tunisie", "courses tunisie", "aziza", "carrefour tunisie", "monoprix tunisie", "géant tunisie", "comparer prix supermarché"],
});

export default function SupermarcheLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
