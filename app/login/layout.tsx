import type { Metadata } from "next";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "Connexion",
  description: "Connectez-vous à votre compte 1111.tn pour comparer les prix, suivre vos produits favoris et recevoir des alertes prix.",
  path: "/login",
  noindex: true,
});

export default function LoginLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
