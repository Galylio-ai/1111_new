import type { Metadata } from "next";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "Mot de passe oublié",
  description: "Réinitialisez le mot de passe de votre compte 1111.tn.",
  path: "/mot-de-passe-oublie",
  noindex: true,
});

export default function MotDePasseOublieLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
