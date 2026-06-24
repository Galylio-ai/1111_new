import type { Metadata } from "next";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "Boutiques en ligne — Comparateur Tunisie",
  description:
    "Toutes les boutiques en ligne suivies par 1111.tn — supermarchés, parapharmacies, magasins informatique, électroménager et plus. Catalogue par enseigne et comparateur de prix.",
  path: "/boutiques",
  keywords: ["boutiques en ligne tunisie", "e-commerce tunisie", "comparateur tunisie"],
});

export default function BoutiquesLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
