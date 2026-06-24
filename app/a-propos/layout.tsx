import type { Metadata } from "next";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "À propos — 1111.tn",
  description:
    "Découvrez 1111.tn, le comparateur de prix tunisien : notre mission, notre équipe et la technologie derrière le suivi de 350 000 produits.",
  path: "/a-propos",
});

export default function AProposLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
