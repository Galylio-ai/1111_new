import type { Metadata } from "next";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "Politique de confidentialité",
  description: "Politique de confidentialité et de protection des données du service 1111.tn.",
  path: "/confidentialite",
});

export default function ConfidentialiteLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
