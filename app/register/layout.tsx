import type { Metadata } from "next";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "Créer un compte",
  description: "Rejoignez 1111.tn — comparez les prix, suivez vos produits favoris et recevez des alertes en cas de baisse de prix.",
  path: "/register",
  noindex: true,
});

export default function RegisterLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
