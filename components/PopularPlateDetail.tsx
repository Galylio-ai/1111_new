"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ExternalLink, Info, ShoppingCart, Store } from "lucide-react";
import {
  fmtDateFr,
  fmtDt,
  getPlateProductRows,
  getRealPlate,
  getStrictPlateRaw,
  type PlateClusterId,
  type StrictPlateReport,
} from "@/lib/popularPlates";

export function PopularPlateDetail({ plate }: { plate: StrictPlateReport }) {
  const real = getRealPlate(plate.id);
  const raw = getStrictPlateRaw(plate.id);

  const [clusterId, setClusterId] = useState<PlateClusterId>(plate.featuredClusterId);
  const cluster = plate.clusters.find((c) => c.id === clusterId) ?? plate.clusters[0];
  const [shopName, setShopName] = useState(cluster?.totals[0]?.shopName ?? "");

  const productRows = useMemo(() => {
    if (!raw || !shopName) return [];
    return getPlateProductRows(raw, clusterId, shopName);
  }, [raw, clusterId, shopName]);

  const updated = fmtDateFr(plate.generatedAt);

  return (
    <div className="space-y-6">
      <div className="relative overflow-hidden rounded-2xl border border-brand-gold/35 bg-gradient-to-br from-amber-50/90 via-white to-brand-gold/10 p-5 sm:p-8 dark:border-brand-gold/25 dark:from-brand-gold/10 dark:via-slate-950/95 dark:to-slate-950">
        <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-amber-800/85 dark:text-brand-gold/80">
          Plat populaire · Produits identiques croisés
        </p>
        <h2 className="mt-2 text-2xl font-black tracking-tight text-slate-900 sm:text-3xl dark:text-white">
          {plate.title}
        </h2>
        <p className="font-arabic mt-1 text-base text-slate-500 dark:text-white/55" dir="rtl">
          {plate.arabicTitle}
        </p>
        <ul className="mt-3 flex flex-wrap gap-2">
          {plate.recipeAssumption.map((item) => (
            <li
              key={item}
              className="rounded-full border border-slate-200 bg-white px-2.5 py-1 text-[11px] font-medium text-slate-700 shadow-sm dark:border-white/10 dark:bg-white/5 dark:text-white/75"
            >
              {item}
            </li>
          ))}
        </ul>
        {updated && (
          <p className="mt-3 text-[11px] text-slate-500 dark:text-white/40">Analyse · {updated}</p>
        )}
      </div>

      <div className="rounded-2xl border border-amber-400/25 bg-amber-500/5 p-4 dark:bg-amber-500/[0.06]">
        <div className="flex items-start gap-2">
          <Info className="mt-0.5 h-4 w-4 shrink-0 text-amber-600 dark:text-amber-400" />
          <div className="text-sm leading-relaxed text-slate-600 dark:text-white/65">
            <strong className="text-slate-800 dark:text-white/85">Même produit croisé</strong> — chaque
            ingrédient utilise le même identifiant catalogue dans les enseignes du groupe comparé.
            Pas de panier unique sur 7 enseignes : Aziza est absente car œufs et cumin ne sont pas
            croisés partout.
          </div>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        {plate.clusters.map((c) => (
          <button
            key={c.id}
            type="button"
            onClick={() => {
              setClusterId(c.id);
              setShopName(c.totals[0]?.shopName ?? "");
            }}
            className={`rounded-xl border px-3 py-2 text-left text-xs font-semibold transition ${
              clusterId === c.id
                ? "border-brand-gold/50 bg-brand-gold/10 text-brand-gold"
                : "border-slate-200 bg-white text-slate-600 hover:border-brand-gold/30 dark:border-white/10 dark:bg-bg-800 dark:text-white/70"
            }`}
          >
            {c.label}
            <span className="mt-0.5 block text-[10px] font-normal opacity-70">
              {c.shops.join(" · ")}
            </span>
          </button>
        ))}
      </div>

      {cluster && (
        <div className="rounded-2xl border border-slate-200 bg-white dark:border-white/[0.08] dark:bg-bg-800">
          <div className="border-b border-slate-200 px-5 py-4 dark:border-white/[0.06]">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              Classement — {cluster.label}
            </h3>
            <p className="mt-0.5 text-xs text-slate-500 dark:text-white/50">
              Coût assiette = portion consommée · Panier = prix d&apos;achat catalogue
            </p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[520px] text-left text-sm">
              <thead>
                <tr className="border-b border-slate-100 text-[11px] uppercase tracking-wide text-slate-400 dark:border-white/[0.06]">
                  <th className="px-5 py-3 font-semibold">#</th>
                  <th className="px-3 py-3 font-semibold">Enseigne</th>
                  <th className="px-3 py-3 text-right font-semibold">Coût assiette</th>
                  <th className="px-3 py-3 text-right font-semibold">Panier</th>
                </tr>
              </thead>
              <tbody>
                {cluster.totals.map((row) => (
                  <tr
                    key={row.shopName}
                    onClick={() => setShopName(row.shopName)}
                    className={`cursor-pointer border-b border-slate-50 last:border-0 dark:border-white/[0.04] ${
                      shopName === row.shopName
                        ? "bg-brand-gold/10"
                        : "hover:bg-slate-50 dark:hover:bg-white/[0.03]"
                    }`}
                  >
                    <td className="px-5 py-3 font-bold tabular-nums text-slate-400">{row.rank}</td>
                    <td className="px-3 py-3 font-semibold text-slate-800 dark:text-white/90">
                      {row.shopName}
                      {row.isCheapest && (
                        <span className="ml-2 rounded-full bg-emerald-500/15 px-1.5 py-0.5 text-[9px] font-bold text-emerald-600 dark:text-emerald-300">
                          Moins cher
                        </span>
                      )}
                    </td>
                    <td className="px-3 py-3 text-right font-bold tabular-nums text-emerald-600 dark:text-emerald-300">
                      {fmtDt(row.estimatedConsumedTotal)} DT
                    </td>
                    <td className="px-3 py-3 text-right tabular-nums text-slate-600 dark:text-white/70">
                      {fmtDt(row.basketTotal)} DT
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {productRows.length > 0 && (
        <div className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-white/[0.08] dark:bg-bg-800">
          <h3 className="mb-3 flex items-center gap-2 text-sm font-bold text-slate-900 dark:text-white">
            <Store className="h-4 w-4 text-brand-gold" />
            Ingrédients — {shopName}
          </h3>
          <ul className="space-y-2">
            {productRows.map((row) => (
              <li
                key={row.ingredient}
                className="flex flex-col gap-1 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm dark:border-white/5 dark:bg-bg-900 sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="min-w-0">
                  <div className="text-[10px] font-bold uppercase tracking-wide text-brand-gold">
                    {row.ingredient}
                  </div>
                  <div className="font-semibold text-slate-900 dark:text-white">{row.productName}</div>
                  <div className="text-[11px] text-slate-500 dark:text-white/45">{row.usedQuantityNote}</div>
                </div>
                <div className="flex shrink-0 items-center gap-3 sm:text-right">
                  <div>
                    <div className="text-[10px] text-slate-400">Portion</div>
                    <div className="font-bold tabular-nums text-emerald-600 dark:text-emerald-300">
                      {fmtDt(row.consumedCost)} DT
                    </div>
                  </div>
                  <div>
                    <div className="text-[10px] text-slate-400">Prix catalogue</div>
                    <div className="font-semibold tabular-nums">{fmtDt(row.price)} DT</div>
                  </div>
                  {row.url && (
                    <a
                      href={row.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-brand-gold hover:text-amber-300"
                      aria-label="Voir le produit"
                    >
                      <ExternalLink className="h-4 w-4" />
                    </a>
                  )}
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}

      {real && (
        <div className="rounded-2xl border border-slate-200 bg-white dark:border-white/[0.08] dark:bg-bg-800">
          <div className="border-b border-slate-200 px-5 py-4 dark:border-white/[0.06]">
            <h3 className="flex items-center gap-2 text-sm font-bold text-slate-900 dark:text-white">
              <ShoppingCart className="h-4 w-4 text-brand-gold" />
              Estimation tous magasins (ingrédients comparables)
            </h3>
            <p className="mt-1 text-xs text-slate-500 dark:text-white/50">{real.note}</p>
          </div>
          <div className="overflow-x-auto p-4">
            <table className="w-full min-w-[480px] text-left text-sm">
              <thead>
                <tr className="text-[11px] uppercase tracking-wide text-slate-400">
                  <th className="pb-2 font-semibold">Enseigne</th>
                  <th className="pb-2 text-right font-semibold">Coût assiette</th>
                  <th className="pb-2 text-right font-semibold">Panier</th>
                </tr>
              </thead>
              <tbody>
                {real.totals.map((row) => (
                  <tr key={row.shopName} className="border-t border-slate-100 dark:border-white/[0.06]">
                    <td className="py-2.5 font-semibold text-slate-800 dark:text-white/90">
                      {row.shopName}
                    </td>
                    <td className="py-2.5 text-right font-bold tabular-nums text-emerald-600 dark:text-emerald-300">
                      {fmtDt(row.estimatedConsumedTotal)} DT
                    </td>
                    <td className="py-2.5 text-right tabular-nums text-slate-600 dark:text-white/70">
                      {fmtDt(row.basketTotal)} DT
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <div className="flex flex-wrap gap-3">
        <Link href="/qoffa/plats" className="text-sm font-semibold text-brand-gold hover:underline">
          ← Tous les plats
        </Link>
        <Link href="/qoffa" className="text-sm font-semibold text-slate-500 hover:text-brand-gold dark:text-white/50">
          Qoffa Tounsi
        </Link>
      </div>
    </div>
  );
}
