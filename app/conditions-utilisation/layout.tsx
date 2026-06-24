import type { Metadata } from "next";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "Conditions d'utilisation",
  description: "Conditions générales d'utilisation du service 1111.tn.",
  path: "/conditions-utilisation",
});

export default function ConditionsLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
