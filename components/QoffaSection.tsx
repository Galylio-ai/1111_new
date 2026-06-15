"use client";
import { ChefHat, TrendingUp, Trophy, Users } from "lucide-react";
import Image from "next/image";
import { classementEnseignes, qoffaWeekData, recettes } from "@/lib/data";
import { SparkArea } from "./charts/SparkArea";

export function QoffaSection() {
  return (
    <section className="mx-auto mt-5 max-w-[1600px] px-3 sm:px-4">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-[1fr_1fr_1.2fr_1fr]">
        {/* QOFFA TOUNSI */}
        <div className="card card-pad relative overflow-hidden">
          <div className="flex items-center gap-2">
            <span className="text-xl">🛒</span>
            <span className="section-title text-brand-gold">QOFFA TOUNSI</span>
          </div>
          <div className="text-[11px] text-white/60">Le coût réel de la vie en Tunisie</div>
          <div className="font-arabic text-[11px] text-white/40" dir="rtl">قفة التونسي</div>
          <div className="mt-4 flex justify-center">
            <img
              src="/couffin.png"
              alt="Couffin tunisien"
              className="h-40 w-40 md:h-48 md:w-48 animate-couffin-swing object-contain drop-shadow-[0_8px_20px_rgba(212,175,55,0.35)]"
            />
          </div>
          <button className="btn-primary mt-3 w-full">Voir toutes les recettes</button>
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
                <div className="section-title">Recettes populaires</div>
                <div className="font-arabic text-[11px] text-white/40" dir="rtl">وصفات شعبية</div>
              </div>
            </div>
            <span className="rounded-full border border-brand-gold/25 bg-brand-gold/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-brand-gold">
              4 plats
            </span>
          </div>

          {/* Recipe list */}
          <ul className="relative mt-3 space-y-2">
            {recettes.map((r) => (
              <li
                key={r.name}
                className="group flex items-center gap-3 rounded-xl border border-white/[0.04] bg-bg-800/40 p-2 transition hover:border-brand-gold/25 hover:bg-bg-800/70"
              >
                {/* Dish photo */}
                <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-lg ring-1 ring-white/10">
                  <Image
                    src={r.image}
                    alt={r.name}
                    fill
                    sizes="48px"
                    className="object-cover transition group-hover:scale-110"
                    unoptimized
                  />
                </div>

                {/* Name + meta */}
                <div className="min-w-0 flex-1 leading-tight">
                  <div className="flex items-baseline gap-1.5">
                    <span className="text-sm font-semibold text-white">{r.name}</span>
                    <span className="font-arabic text-[11px] text-white/40" dir="rtl">
                      {r.arabic}
                    </span>
                  </div>
                  <div className="mt-0.5 flex items-center gap-1.5 text-[10px] text-white/55">
                    <Users className="h-3 w-3" />
                    <span>{r.serves} pers.</span>
                    <span className="text-white/20">·</span>
                    <span className="truncate">{r.desc}</span>
                  </div>
                </div>

                {/* Price + change */}
                <div className="text-right leading-tight">
                  <div className="text-sm font-bold tabular-nums text-white">
                    {r.price} <span className="text-[10px] font-normal text-white/40">DT</span>
                  </div>
                  <div className="mt-0.5 inline-flex items-center gap-0.5 text-[10px] font-semibold tabular-nums text-red-300">
                    <TrendingUp className="h-2.5 w-2.5" />
                    {r.change}
                  </div>
                </div>
              </li>
            ))}
          </ul>

          <a
            className="relative mt-3 inline-flex items-center gap-1 text-xs font-semibold text-brand-gold transition hover:gap-2 hover:underline"
            href="#"
          >
            Voir toutes les recettes →
          </a>
        </div>

        {/* COÛT MOYEN DU PANIER */}
        <div className="card card-pad">
          <div className="section-title mb-1">Coût moyen du panier</div>
          <div className="text-[11px] text-white/60">Cette semaine</div>
          <div className="mt-2 flex items-end gap-3">
            <div className="text-4xl font-black tabular-nums text-white">21.460</div>
            <div className="mb-1 text-sm font-semibold text-brand-gold">DT</div>
          </div>
          <div className="text-xs text-red-300">vs semaine dernière −3%</div>
          <div className="mt-1">
            <SparkArea data={qoffaWeekData.map((d) => ({ x: d.m, y: d.v }))} stroke="#ef4444" height={120} showAxis />
          </div>
        </div>

        {/* CLASSEMENT PAR ENSEIGNE */}
        <div className="card card-pad">
          <div className="mb-2 flex items-center gap-2">
            <Trophy className="h-4 w-4 text-brand-gold" />
            <span className="section-title">Classement par enseigne</span>
          </div>
          <ul className="divide-y divide-bg-border/50">
            {classementEnseignes.map((e) => (
              <li key={e.name} className="flex items-center justify-between py-2 text-sm">
                <span className="flex items-center gap-2.5">
                  <span className="text-[11px] font-bold text-white/40 tabular-nums w-3">{e.rank}</span>
                  <EnseigneLogo name={e.name} />
                  <span className="text-white/90">{e.name}</span>
                </span>
                <span className="tabular-nums text-white">{e.price} DT</span>
              </li>
            ))}
          </ul>
          <a className="mt-3 inline-block text-xs font-medium text-brand-gold hover:underline" href="#">
            Voir le classement complet
          </a>
        </div>
      </div>
    </section>
  );
}

const enseigneStyles: Record<string, { bg: string; fg: string; ring: string; label: string }> = {
  Aziza:     { bg: "bg-red-600",     fg: "text-white",       ring: "ring-red-300/30",     label: "A" },
  Carrefour: { bg: "bg-blue-600",    fg: "text-white",       ring: "ring-blue-300/30",    label: "C" },
  "Carrefour Market": { bg: "bg-blue-600", fg: "text-white", ring: "ring-blue-300/30",    label: "C" },
  MG:        { bg: "bg-emerald-600", fg: "text-white",       ring: "ring-emerald-300/30", label: "MG" },
  Géant:     { bg: "bg-yellow-400",  fg: "text-yellow-950",  ring: "ring-yellow-200/40",  label: "G" },
  Monoprix:  { bg: "bg-rose-600",    fg: "text-white",       ring: "ring-rose-300/30",    label: "M" },
};

function EnseigneLogo({ name }: { name: string }) {
  const s = enseigneStyles[name] ?? { bg: "bg-white/10", fg: "text-white", ring: "ring-white/20", label: name.charAt(0) };
  return (
    <span
      className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-md text-[10px] font-black tracking-tight shadow-sm ring-1 ${s.bg} ${s.fg} ${s.ring}`}
      aria-label={name}
    >
      {s.label}
    </span>
  );
}
