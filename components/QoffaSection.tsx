"use client";
import { ChefHat, Store } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { MultiLine } from "./charts/MultiLine";
import { OjjaOrbit } from "./OjjaOrbit";

type BasketShop = { shop: string; current: number; change: number; week: number[] };
type BasketPayload = { shops: BasketShop[]; data: Array<Record<string, string | number>> };

// Sensible fallback while the DB fetch resolves (or if it fails).
const FALLBACK: BasketPayload = {
  shops: [
    { shop: "Carrefour", current: 134.5, change: 4.3,  week: [128.9, 130.6, 132.4, 129.7, 133.8, 131.2, 134.5] },
    { shop: "Geant",     current: 133.6, change: -3.5, week: [138.4, 135.7, 137.9, 134.3, 136.1, 139.2, 133.6] },
    { shop: "Monoprix",  current: 133.1, change: 0.8,  week: [132.1, 134.8, 131.5, 135.9, 132.8, 135.4, 133.1] },
  ],
  data: [
    { m: "Lun", Carrefour: 128.9, Geant: 138.4, Monoprix: 132.1 },
    { m: "Mar", Carrefour: 130.6, Geant: 135.7, Monoprix: 134.8 },
    { m: "Mer", Carrefour: 132.4, Geant: 137.9, Monoprix: 131.5 },
    { m: "Jeu", Carrefour: 129.7, Geant: 134.3, Monoprix: 135.9 },
    { m: "Ven", Carrefour: 133.8, Geant: 136.1, Monoprix: 132.8 },
    { m: "Sam", Carrefour: 131.2, Geant: 139.2, Monoprix: 135.4 },
    { m: "Dim", Carrefour: 134.5, Geant: 133.6, Monoprix: 133.1 },
  ],
};

function shopChip(shop: BasketShop) {
  const styles: Record<string, { border: string; bg: string; label: string }> = {
    Carrefour: { border: "border-blue-500/30",  bg: "bg-blue-500/10",  label: "text-blue-600 dark:text-blue-300" },
    Geant:     { border: "border-yellow-500/30", bg: "bg-yellow-500/10", label: "text-yellow-700 dark:text-yellow-300" },
    Monoprix:  { border: "border-rose-500/30",  bg: "bg-rose-500/10",  label: "text-rose-600 dark:text-rose-300" },
  };
  const s = styles[shop.shop] ?? styles.Carrefour;
  const up = shop.change >= 0;
  return (
    <div key={shop.shop} className={`rounded-lg border ${s.border} ${s.bg} p-2 text-center`}>
      <div className={`text-[10px] font-bold uppercase tracking-wider ${s.label}`}>
        {shop.shop === "Geant" ? "Géant" : shop.shop}
      </div>
      <div className="mt-0.5 text-base font-extrabold tabular-nums text-slate-900 dark:text-white">
        {(shop.current ?? 0).toFixed(1).replace(".", ",")}
      </div>
      <div className={`text-[10px] ${up ? "text-red-500 dark:text-red-400" : "text-emerald-600 dark:text-emerald-400"}`}>
        {up ? "▲" : "▼"} {up ? "+" : ""}{(shop.change ?? 0).toFixed(1).replace(".", ",")}%
      </div>
    </div>
  );
}

export function QoffaSection() {
  const [basket, setBasket] = useState<BasketPayload>(FALLBACK);

  useEffect(() => {
    fetch("/api/basket-variation")
      .then(r => r.ok ? r.json() : null)
      .then(j => { if (j && j.shops) setBasket(j); })
      .catch(() => { /* keep fallback */ });
  }, []);
  return (
    <section className="mx-auto mt-5 max-w-[1600px] px-3 sm:px-4">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-[1fr_1.5fr_1.2fr]">
        {/* QOFFA TOUNSI */}
        <div className="card card-pad relative overflow-hidden">
          <div className="flex items-center gap-2">
            <span className="text-xl">🛒</span>
            <span className="section-title text-brand-gold">QOFFA TOUNSI</span>
          </div>
          <div className="text-[11px] text-slate-500 dark:text-white/60">Le coût réel de la vie en Tunisie</div>
          <div className="font-arabic text-[11px] text-slate-400 dark:text-white/40" dir="rtl">قفة التونسي</div>
          <div className="mt-4 flex justify-center">
            <img
              src="/couffin.png"
              alt="Couffin tunisien"
              className="h-40 w-40 md:h-48 md:w-48 animate-couffin-swing object-contain drop-shadow-[0_8px_20px_rgba(212,175,55,0.35)]"
            />
          </div>
          <Link href="/qoffa" className="btn-primary mt-3 w-full">Voir toutes les recettes</Link>

          {/* Stat cards */}
          <div className="mt-3 grid grid-cols-2 gap-2">
            <div className="flex flex-col justify-center rounded-lg border border-emerald-500/30 bg-emerald-500/10 p-3.5 text-center">
              <div className="text-base font-extrabold tabular-nums text-emerald-600 dark:text-emerald-300">21,460 DT</div>
              <div className="mt-0.5 text-[10px] text-slate-500 dark:text-white/60">Coût total · meilleur prix</div>
            </div>
            <div className="flex flex-col justify-center rounded-lg border border-brand-gold/30 bg-brand-gold/10 p-3.5 text-center">
              <div className="text-base font-extrabold tabular-nums text-brand-gold">8</div>
              <div className="mt-0.5 text-[10px] text-slate-500 dark:text-white/60">Ingrédients comparés</div>
            </div>
          </div>
        </div>

        {/* RECETTES POPULAIRES */}
        <div className="card card-pad relative overflow-hidden">
          {/* Watermark icon */}
          <ChefHat
            className="pointer-events-none absolute -right-2 -top-2 h-28 w-28 text-white/[0.04]"
            strokeWidth={1.2}
            aria-hidden
          />

          {/* Header */}
          <div className="relative flex items-center justify-between gap-2">
            <div className="flex items-center gap-2.5">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-brand-gold/25 to-brand-gold/5 ring-1 ring-brand-gold/30">
                <ChefHat className="h-4 w-4 text-brand-gold" strokeWidth={2.2} />
              </span>
              <div className="leading-tight">
                <div className="section-title">Plat des riches</div>
                <div className="font-arabic text-[11px] text-slate-400 dark:text-white/40" dir="rtl">عجة التونسي</div>
              </div>
            </div>
            <span className="rounded-full border border-brand-gold/25 bg-brand-gold/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-brand-gold">
              8 ingrédients
            </span>
          </div>

          {/* Ojja ingredients board */}
          <div className="relative mt-4">
            <div className="mb-3 flex items-center justify-between text-[10px]">
              <span className="font-bold uppercase tracking-wider text-brand-gold">
                Décortiquez l'ojja
              </span>
              <span className="text-slate-400 dark:text-white/45">8 ingrédients · 4 135 DT</span>
            </div>
            <OjjaOrbit />
          </div>

          <Link
            className="relative mt-3 inline-flex items-center gap-1 text-xs font-semibold text-brand-gold transition hover:gap-2 hover:underline"
            href="/qoffa"
          >
            Voir toutes les recettes →
          </Link>
        </div>

        {/* VARIATION DES PRIX — GRANDE DISTRIBUTION */}
        <div className="card card-pad relative overflow-hidden">
          {/* Watermark icon */}
          <Store
            className="pointer-events-none absolute -right-2 -top-2 h-28 w-28 text-white/[0.04]"
            strokeWidth={1.2}
            aria-hidden
          />

          {/* Header */}
          <div className="relative flex items-center justify-between gap-2">
            <div className="flex items-center gap-2.5">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-brand-gold/25 to-brand-gold/5 ring-1 ring-brand-gold/30">
                <Store className="h-4 w-4 text-brand-gold" strokeWidth={2.2} />
              </span>
              <div className="leading-tight">
                <div className="section-title">Variation des prix</div>
                <div className="text-[11px] text-slate-500 dark:text-white/55">Grandes distributions · panier familial</div>
              </div>
            </div>
            <span className="rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-emerald-300">
              7 jours
            </span>
          </div>

          {/* Enseigne summary chips */}
          <div className="relative mt-3 grid grid-cols-3 gap-2">
            {basket.shops.map(shopChip)}
          </div>

          {/* Multi-line chart */}
          <div className="relative mt-3">
            <MultiLine
              data={basket.data}
              height={200}
              series={[
                { key: "Carrefour", name: "Carrefour", color: "#3b82f6" },
                { key: "Geant",     name: "Géant",     color: "#eab308" },
                { key: "Monoprix",  name: "Monoprix",  color: "#f43f5e" },
              ]}
            />
          </div>

          {/* Definition */}
          <div className="relative mt-3 rounded-lg border border-brand-gold/20 bg-brand-gold/[0.04] p-2.5 text-[11px] leading-relaxed text-slate-600 dark:text-white/65">
            <span className="font-bold text-brand-gold">Comment lire ce graphique ?</span>{" "}
            Le <span className="font-semibold text-slate-800 dark:text-white">panier familial</span> regroupe 30 produits de base
            (lait, huile, pâtes, riz, conserves…) communs aux trois enseignes. Chaque ligne montre le coût total de ce même panier,
            jour par jour, sur les 7 derniers jours. Plus la courbe est <span className="text-emerald-600 dark:text-emerald-400 font-semibold">basse</span>,
            plus l'enseigne est <span className="text-emerald-600 dark:text-emerald-400 font-semibold">avantageuse</span> ; une hausse indique une inflation sur les produits suivis.
          </div>
        </div>

      </div>
    </section>
  );
}
