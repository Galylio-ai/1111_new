import type { Metadata } from "next";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "Vérification email",
  description: "Confirmez votre adresse email pour activer votre compte 1111.tn.",
  path: "/verify-email",
  noindex: true,
});

export default function VerifyEmailLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
