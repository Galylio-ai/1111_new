import type { Metadata } from "next";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "Toutes les catégories par boutique",
  description:
    "Parcourez chaque boutique tunisienne par ses propres rayons : informatique, parapharmacie, électroménager, gaming, soins, smartphones et plus.",
  path: "/categories",
  keywords: ["catégories tunisie", "rayons boutique tunisie", "comparateur catégorie"],
});

export default function CategoriesLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
