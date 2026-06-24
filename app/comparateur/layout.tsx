import type { Metadata } from "next";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "Comparateur de produits",
  description:
    "Recherchez n'importe quel produit (smartphone, laptop, climatiseur, parfum, électroménager) et comparez son prix chez toutes les enseignes tunisiennes.",
  path: "/comparateur",
  keywords: ["comparateur tunisie", "comparer prix", "comparateur produit"],
});

export default function ComparateurLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
