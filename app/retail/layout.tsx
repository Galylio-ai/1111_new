import type { Metadata } from "next";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "Magasins Retail — Comparateur de prix",
  description:
    "Comparez les prix de l'électroménager, des smartphones, de l'informatique et du gaming chez Tunisianet, Mytek, Spacenet, Agora, SBS et tous les magasins retail tunisiens.",
  path: "/retail",
  keywords: ["retail tunisie", "tunisianet", "mytek", "spacenet", "informatique tunisie", "electromenager tunisie", "comparer prix"],
});

export default function RetailLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
