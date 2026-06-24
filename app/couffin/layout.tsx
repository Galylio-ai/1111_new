import type { Metadata } from "next";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "Couffin Tounsi — Comparateur de panier",
  description:
    "Composez votre panier de courses et découvrez instantanément dans quel supermarché tunisien il coûte le moins cher.",
  path: "/couffin",
  keywords: ["couffin tounsi", "panier moins cher tunisie", "comparateur panier tunisie"],
});

export default function CouffinLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
