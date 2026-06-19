import { Flame } from "lucide-react";
import { PageShell } from "@/components/site/PageShell";
import { Reveal } from "@/components/site/Reveal";
import { OffersGrid } from "@/components/site/OffersGrid";
import { PromoBanner } from "@/components/PromoBanner";

export const metadata = { title: "Promotions & Offres — 1111.tn" };

export default function PromotionsPage() {
  return (
    <PageShell
      icon="flame"
      title="Promotions"
      accent="& Offres"
      arabic="العروض والتخفيضات"
      description="Les meilleures baisses de prix détectées en temps réel sur tous les sites tunisiens — vraies promos vérifiées par notre IA."
      chips={[
        { label: "Promos actives", value: "152", tone: "red" },
        { label: "Fausses promos", value: "37", tone: "gold" },
        { label: "Économisés", value: "48 000 DT", tone: "emerald" },
      ]}
    >
      <section className="mx-auto mt-5 max-w-[1600px] px-3 sm:px-4">
        <PromoBanner />
      </section>

      <section className="mx-auto mt-6 max-w-[1600px] px-3 sm:px-4">
        <Reveal>
          <div className="mb-3 flex items-center gap-2">
            <Flame className="h-5 w-5 text-brand-red" />
            <h2 className="section-title">Top offres du moment</h2>
            <span className="text-brand-gold">✦</span>
          </div>
        </Reveal>
        <OffersGrid />
      </section>
    </PageShell>
  );
}
