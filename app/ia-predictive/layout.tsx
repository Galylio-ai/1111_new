import type { Metadata } from "next";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "IA prédictive — Acheter ou attendre ?",
  description:
    "Notre intelligence artificielle analyse l'historique des prix pour prédire l'évolution de chaque produit sur 7, 15 et 30 jours.",
  path: "/ia-predictive",
  keywords: ["ia prédictive prix", "prévision prix tunisie", "intelligence artificielle achat"],
});

export default function IaPredictiveLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
