import type { Metadata } from "next";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "Veille prix consommateur",
  description:
    "Suivez les produits qui vous intéressent et soyez alerté à la moindre baisse de prix sur les sites tunisiens.",
  path: "/veille",
});

export default function VeilleLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
