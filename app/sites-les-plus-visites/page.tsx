import { PageShell } from "@/components/site/PageShell";
import { topRetailSites, retailSitesMonth } from "@/lib/topRetailSites";
import { RetailSitesTable } from "@/components/site/RetailSitesTable";
import { RetailSitesSourceAttribution } from "@/components/site/RetailSitesSourceAttribution";

export const metadata = {
  title: "Sites e-commerce les plus visités en Tunisie - 1111.tn",
  description:
    "Classement des sites e-commerce et retail les plus visités en Tunisie. Trafic mensuel, répartition desktop/mobile, évolution et source principale.",
};

export default function SitesLesPlusVisitesPage() {
  const totalVisits = topRetailSites.reduce((s, r) => s + r.visitsNum, 0);
  const fmtM = (n: number) =>
    n >= 1_000_000 ? (n / 1_000_000).toFixed(1).replace(".", ",") + " M" : Math.round(n / 1_000) + " K";

  return (
    <PageShell
      icon="eye"
      title="Sites les plus"
      accent="visités"
      arabic="المواقع الأكثر زيارة في تونس"
      description="Classement du trafic des principaux sites e-commerce et retail en Tunisie — visites mensuelles, part desktop/mobile, évolution et source principale du trafic."
      chips={[
        { label: "Sites classés", value: String(topRetailSites.length), tone: "gold" },
        { label: "Visites cumulées", value: fmtM(totalVisits), tone: "emerald" },
        { label: "Mois", value: retailSitesMonth, tone: "blue" },
      ]}
    >
      <RetailSitesSourceAttribution variant="footer" />
      <RetailSitesTable sites={topRetailSites} month={retailSitesMonth} />
      <RetailSitesSourceAttribution variant="footer" className="mt-4" />
    </PageShell>
  );
}
