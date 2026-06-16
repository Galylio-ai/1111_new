import { PageShell } from "@/components/site/PageShell";
import { Reveal } from "@/components/site/Reveal";
import { LiveIndexCard } from "@/components/site/LiveIndexCard";
import { MarketIndex } from "@/components/MarketIndex";

export const metadata = { title: "Indice du marché — 1111.tn" };

export default function IndicePage() {
  return (
    <PageShell
      icon="activity"
      title="Indice du marché"
      arabic="مؤشر السوق التونسي"
      live
      description="Le pouls du e-commerce tunisien — indice global en temps réel, indices propriétaires par dimension et baromètres par catégorie."
      chips={[
        { label: "Meta Index", value: "108.7", tone: "gold" },
        { label: "vs mois dernier", value: "+1.2%", tone: "emerald" },
      ]}
    >
      <section className="mx-auto mt-6 max-w-[1600px] px-3 sm:px-4">
        <Reveal>
          <LiveIndexCard />
        </Reveal>
      </section>

      <MarketIndex />
    </PageShell>
  );
}
