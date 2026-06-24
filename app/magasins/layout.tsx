import type { Metadata } from "next";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "Magasins Tunisie",
  description:
    "Annuaire des magasins tunisiens : électroménager, informatique, smartphones, gaming et plus. Comparez les prix et le catalogue de chaque enseigne.",
  path: "/magasins",
  keywords: ["magasins tunisie", "boutiques tunisie"],
});

export default function MagasinsLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
