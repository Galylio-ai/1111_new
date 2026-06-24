import type { Metadata } from "next";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "Mon profil",
  description: "Gérez votre compte 1111.tn, vos favoris et vos alertes prix.",
  path: "/profil",
  noindex: true,
});

export default function ProfilLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
