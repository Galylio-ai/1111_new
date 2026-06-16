import { PageShell } from "@/components/site/PageShell";
import { Observatoire } from "@/components/Observatoire";
import { StatRow } from "@/components/StatRow";

export const metadata = { title: "Observatoire du marché — 1111.tn" };

export default function ObservatoirePage() {
  return (
    <PageShell
      icon="eye"
      title="Observatoire du marché"
      arabic="مرصد السوق"
      live
      description="Toutes les données collectées aujourd'hui par nos robots — prix modifiés, promotions, fausses promos et nouveaux produits, en direct."
      chips={[
        { label: "Prix modifiés", value: "4 238", tone: "emerald" },
        { label: "Nouveaux produits", value: "428", tone: "blue" },
        { label: "Fausses promos", value: "37", tone: "gold" },
      ]}
    >
      <Observatoire />
      <StatRow />
    </PageShell>
  );
}
