import { PageShell } from "@/components/site/PageShell";
import { VersusComparison } from "@/components/site/VersusComparison";

export const metadata = { title: "Comparaison de produits — 1111.tn" };

export default function ComparaisonPage({
  searchParams,
}: {
  searchParams: { a?: string; b?: string };
}) {
  return (
    <PageShell
      icon="scale"
      title="Comparaison"
      accent="produits"
      arabic="مقارنة المنتجات"
      description="Confrontez deux smartphones, PC portables ou composants informatiques face à face. Comparez leurs caractéristiques et leurs prix pour décider lequel acheter."
      chips={[
        { label: "Catégories", value: "Tech / Informatique", tone: "gold" },
        { label: "Sites suivis", value: "62", tone: "blue" },
      ]}
    >
      <section className="mt-6">
        <VersusComparison initialA={searchParams.a} initialB={searchParams.b} />
      </section>
    </PageShell>
  );
}
