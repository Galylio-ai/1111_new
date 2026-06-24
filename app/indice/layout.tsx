import type { Metadata } from "next";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "Indice du marché Tunisie",
  description:
    "L'indice du marché tunisien : évolution des prix, top boutiques en promo, secteurs les plus chauds et statistiques en temps réel.",
  path: "/indice",
  keywords: ["indice prix tunisie", "marché tunisie", "tendances prix tunisie"],
});

export default function IndiceLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
