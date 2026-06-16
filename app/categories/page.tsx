import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { PageShell } from "@/components/site/PageShell";
import { Reveal } from "@/components/site/Reveal";
import { categories } from "@/lib/data";

export const metadata = { title: "Catégories — 1111.tn" };

const meta: Record<string, { count: string; index: string; up: boolean }> = {
  smartphones: { count: "38 420", index: "104.2", up: true },
  info: { count: "52 110", index: "102.5", up: false },
  elec: { count: "41 980", index: "103.6", up: true },
  para: { count: "18 640", index: "101.6", up: true },
  deco: { count: "29 350", index: "100.9", up: false },
  games: { count: "12 870", index: "98.4", up: false },
  beauty: { count: "21 540", index: "102.1", up: true },
  super: { count: "9 320", index: "98.7", up: false },
  books: { count: "7 210", index: "99.8", up: true },
  auto: { count: "14 760", index: "105.3", up: true },
};

export default function CategoriesPage() {
  return (
    <PageShell
      icon="grid"
      title="Catégories"
      arabic="تصفح حسب الفئة"
      description="Explorez le marché tunisien par univers — chaque catégorie avec son indice de prix, son volume de produits et ses meilleures enseignes."
      chips={[
        { label: "Catégories", value: "10", tone: "gold" },
        { label: "SKU analysés", value: "254 327", tone: "blue" },
      ]}
    >
      <section className="mx-auto mt-6 max-w-[1600px] px-3 sm:px-4">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {categories.map((c, i) => {
            const m = meta[c.id];
            return (
              <Reveal key={c.id} delay={i * 0.05}>
                <Link
                  href="/comparateur"
                  className="card group relative flex h-full items-center gap-4 overflow-hidden p-4 transition hover:-translate-y-1 hover:border-white/20 hover:shadow-[0_0_30px_-10px_rgba(246,196,83,0.4)]"
                >
                  <div className={`cat-anim relative h-20 w-20 shrink-0 overflow-hidden rounded-2xl bg-bg-800 ring-2 ring-inset ${c.ring}`} style={{ animationDelay: `${i * 80}ms, ${600 + i * 80}ms` }}>
                    <Image src={c.image} alt={c.fr} fill sizes="80px" className="object-cover transition group-hover:scale-110" unoptimized />
                    <span className="pointer-events-none absolute inset-0 rounded-2xl bg-gradient-to-t from-black/40 via-transparent to-white/10" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="text-base font-bold text-white">{c.fr}</div>
                    <div className="font-arabic text-xs text-white/45" dir="rtl">{c.ar}</div>
                    <div className="mt-2 flex items-center gap-2 text-[11px]">
                      <span className="text-white/55">{m?.count} produits</span>
                      <span className="text-white/20">·</span>
                      <span className={m?.up ? "font-semibold text-red-300" : "font-semibold text-emerald-300"}>
                        Indice {m?.index} {m?.up ? "▲" : "▼"}
                      </span>
                    </div>
                  </div>
                  <ArrowRight className="h-4 w-4 shrink-0 text-white/30 transition group-hover:translate-x-1 group-hover:text-brand-gold" />
                </Link>
              </Reveal>
            );
          })}
        </div>
      </section>
    </PageShell>
  );
}
