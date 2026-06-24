import type { Metadata } from "next";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "Mes alertes prix",
  description: "Suivez les produits qui vous intéressent et soyez alerté dès qu'un prix change.",
  path: "/alertes",
  noindex: true,
});

export default function AlertesLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
