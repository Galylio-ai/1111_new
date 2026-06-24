import type { Metadata } from "next";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "Grande distribution Tunisie",
  description:
    "Comparaison du panier essentiel chez les enseignes de grande distribution tunisiennes : Aziza, Carrefour, Géant, Monoprix et leurs filiales.",
  path: "/grande-distribution",
  keywords: ["grande distribution tunisie", "panier familial tunisie", "panier essentiel tunisie"],
});

export default function GrandeDistribLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
