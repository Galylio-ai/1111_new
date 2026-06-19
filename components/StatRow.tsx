"use client";
import { AlertTriangle, Database, Tag } from "lucide-react";
import Image from "next/image";
import { useEffect, useState } from "react";
import { featuredProducts } from "@/lib/data";

function formatNumber(n: number): string {
  return n.toLocaleString("fr-FR").replace(/ /g, " ");
}

export function StatRow() {
  const [totalSkus, setTotalSkus] = useState<number | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/stats/total-skus")
      .then((r) => r.json())
      .then((d) => {
        if (!cancelled && typeof d?.total === "number") setTotalSkus(d.total);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <section className="mx-auto mt-5 max-w-[1600px] px-3 sm:px-4">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        {/* Dernier article avant changé de prix */}
        <div className="card card-pad">
          <div className="mb-2 flex items-center gap-2">
            <Tag className="h-4 w-4 text-brand-gold" />
            <span className="text-[11px] font-bold uppercase tracking-wider text-brand-gold">
              Dernier article
            </span>
          </div>
          <div className="text-[11px] text-slate-500 dark:text-white/60">avant changé de prix</div>
          <div className="mt-3 flex items-center gap-3">
            <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-lg bg-slate-200 p-1 ring-1 ring-inset ring-slate-300 dark:bg-white/[0.06] dark:ring-white/5">
              <Image
                src={featuredProducts.iphone15.image}
                alt={featuredProducts.iphone15.name}
                fill
                sizes="80px"
                style={{ filter: "contrast(1.05) brightness(1.02)" }}
                className="object-contain"
                unoptimized
              />
            </div>
            <div className="flex-1 text-xs">
              <div className="text-sm font-semibold text-slate-900 dark:text-white">{featuredProducts.iphone15.name}</div>
              <div className="text-slate-500 dark:text-white/50">{featuredProducts.iphone15.store}</div>
              <div className="text-slate-600 dark:text-white/60">
                Ancien prix : <span className="line-through">{featuredProducts.iphone15.oldPrice}</span>
              </div>
              <div className="text-slate-600 dark:text-white/60">
                Nouveau prix :{" "}
                <span className="font-semibold text-emerald-600 dark:text-emerald-400">{featuredProducts.iphone15.newPrice}</span>
              </div>
            </div>
          </div>
          <div className="mt-2 flex items-center justify-between text-[11px]">
            <span className="text-slate-500 dark:text-white/50">{featuredProducts.iphone15.time}</span>
            <span className="rounded-md bg-emerald-500/20 px-2 py-0.5 font-semibold text-emerald-600 dark:text-emerald-300">
              {featuredProducts.iphone15.diff}
            </span>
          </div>
        </div>

        {/* Dernier article ajouté */}
        <div className="card card-pad">
          <div className="mb-2 flex items-center gap-2">
            <Tag className="h-4 w-4 text-brand-gold" />
            <span className="text-[11px] font-bold uppercase tracking-wider text-brand-gold">
              Dernier article ajouté
            </span>
          </div>
          <div className="text-[11px] text-slate-600 dark:text-white/60">(tous sites)</div>
          <div className="mt-3 flex items-center gap-3">
            <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-lg bg-slate-200 p-1 ring-1 ring-inset ring-slate-300 dark:bg-white/[0.06] dark:ring-white/5">
              <Image
                src={featuredProducts.ps5.image}
                alt={featuredProducts.ps5.name}
                fill
                sizes="80px"
                style={{ filter: "contrast(1.05) brightness(1.02)" }}
                className="object-contain"
                unoptimized
              />
            </div>
            <div className="flex-1 text-xs">
              <div className="text-sm font-semibold text-slate-900 dark:text-white">{featuredProducts.ps5.name}</div>
              <div className="text-slate-500 dark:text-white/50">{featuredProducts.ps5.store}</div>
              <div className="text-slate-600 dark:text-white/60">
                Prix : <span className="font-semibold text-slate-900 dark:text-white">{featuredProducts.ps5.price}</span>
              </div>
            </div>
          </div>
          <div className="mt-2 flex items-center justify-between text-[11px]">
            <span className="text-slate-500 dark:text-white/50">{featuredProducts.ps5.time}</span>
            <span className="rounded-md bg-brand-gold/20 px-2 py-0.5 font-bold text-brand-gold">NOUVEAU</span>
          </div>
        </div>

        {/* Nombre total SKU */}
        <div className="card card-pad flex flex-col items-center justify-center text-center">
          <Database className="h-5 w-5 text-brand-gold" />
          <div className="mt-1 text-[11px] font-bold uppercase tracking-wider text-brand-gold">
            Nombre total de SKU
          </div>
          <div className="text-[11px] text-slate-600 dark:text-white/60">dans notre base</div>
          <div className="mt-2 text-4xl font-black tracking-tight text-slate-900 dark:text-white">
            {totalSkus !== null ? formatNumber(totalSkus) : "—"}
          </div>
          <div className="mt-1 text-[11px] text-slate-600 dark:text-white/60">
            SKU uniques analysés
            <br />
            sur tous les sites scrappés
          </div>
        </div>

        {/* Promotions illogiques détectées */}
        <div className="card card-pad">
          <div className="mb-2 flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-orange-400" />
            <span className="text-[11px] font-bold uppercase tracking-wider text-orange-400">
              Promotions illogiques détectées
            </span>
          </div>
          <div className="text-[11px] text-slate-600 dark:text-white/60">aujourd'hui</div>
          <div className="mt-3 flex items-center gap-3">
            <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-lg bg-slate-200 p-1 ring-1 ring-inset ring-slate-300 dark:bg-white/[0.06] dark:ring-white/5">
              <Image
                src={featuredProducts.acIllogique.image}
                alt={featuredProducts.acIllogique.name}
                fill
                sizes="80px"
                style={{ filter: "contrast(1.05) brightness(1.02)" }}
                className="object-contain"
                unoptimized
              />
            </div>
            <div className="flex-1 text-xs">
              <div className="text-sm font-semibold text-slate-900 dark:text-white">{featuredProducts.acIllogique.name}</div>
              <div className="text-slate-500 dark:text-white/50">{featuredProducts.acIllogique.store}</div>
              <div className="text-slate-600 dark:text-white/60">
                Ancien prix : <span className="line-through">{featuredProducts.acIllogique.oldPrice}</span>
              </div>
              <div className="text-slate-600 dark:text-white/60">
                Prix avant promo :{" "}
                <span className="text-slate-900 dark:text-white">{featuredProducts.acIllogique.promoPrice}</span>
              </div>
            </div>
          </div>
          <div className="mt-2 flex items-center justify-between text-[11px]">
            <span className="text-slate-600 dark:text-white/60">
              Remise effective : <span className="text-orange-600 font-semibold dark:text-orange-300">{featuredProducts.acIllogique.remise}</span>
            </span>
            <span className="rounded-md bg-orange-500/20 px-2 py-0.5 font-bold text-orange-600 dark:text-orange-300">
              ILLOGIQUE
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
