import type { Metadata } from "next";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "Observatoire du marché Tunisie",
  description:
    "Observatoire en temps réel du marché tunisien : prix modifiés du jour, promotions actives, fausses promos détectées et nouveaux produits indexés.",
  path: "/observatoire",
  keywords: ["observatoire prix tunisie", "veille prix tunisie", "marché en temps réel"],
});

export default function ObservatoireLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
