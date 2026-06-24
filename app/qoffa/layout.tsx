import type { Metadata } from "next";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "Qoffa — Panier hebdo Tunisie",
  description:
    "Suivez l'évolution hebdomadaire des prix des produits du quotidien en Tunisie. Tendances, alertes et économies.",
  path: "/qoffa",
});

export default function QoffaLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
