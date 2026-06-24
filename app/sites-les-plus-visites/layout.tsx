import type { Metadata } from "next";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "Sites e-commerce les plus visités en Tunisie",
  description:
    "Classement et trafic estimé des plus grands sites e-commerce tunisiens : retail, parapharmacie, supermarché et plus.",
  path: "/sites-les-plus-visites",
  keywords: ["sites e-commerce tunisie", "top sites tunisie", "trafic sites tunisie"],
});

export default function SitesPlusVisitesLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
