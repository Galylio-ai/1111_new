import type { Metadata } from "next";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "Parapharmacie — Comparateur de prix",
  description:
    "Comparez les prix des soins, du maquillage et des produits de parapharmacie en Tunisie : MaPara, ParaShop, Parafendri, PharmaShop, El Farabi, Beauty Store.",
  path: "/parapharmacie",
  keywords: ["parapharmacie tunisie", "mapara", "parashop", "parafendri", "beauty store tunisie", "comparer prix parapharmacie"],
});

export default function ParapharmacieLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
