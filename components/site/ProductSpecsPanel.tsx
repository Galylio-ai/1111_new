"use client";

import { useMemo, useState } from "react";
import { ChevronDown, ListChecks } from "lucide-react";

const PREVIEW_COUNT = 5;

const SPEC_LABELS: Record<string, string> = {
  brand: "Marque",
  color: "Couleur",
  connectors: "Connecteurs",
  dimensions: "Dimensions",
  frequency: "Fréquence",
  graphics_card: "Carte graphique",
  graphics_reference: "Réf. graphique",
  is_gaming: "Gaming",
  keyboard: "Clavier",
  memory: "Mémoire",
  memory_type: "Type mémoire",
  model: "Modèle",
  operating_system: "Système d'exploitation",
  processor: "Processeur",
  processor_cache: "Cache processeur",
  processor_frequency: "Fréq. processeur",
  processor_generation: "Génération",
  processor_model: "Modèle processeur",
  ram: "Mémoire RAM",
  screen_size: "Taille écran",
  screen_resolution: "Résolution",
  screen_type: "Type d'écran",
  storage: "Stockage",
  storage_type: "Type stockage",
  weight: "Poids",
  warranty: "Garantie",
  wifi: "Wi‑Fi",
  bluetooth: "Bluetooth",
  battery: "Batterie",
  camera: "Caméra",
  refresh_rate: "Fréquence de rafraîchissement",
};

const PRIORITY_KEYS = [
  "processor",
  "memory",
  "ram",
  "storage",
  "screen_size",
  "screen_resolution",
  "graphics_card",
  "operating_system",
  "color",
  "weight",
  "dimensions",
];

const HIDDEN_KEYS = new Set(["brand", "data_quality_score", "shop_count", "gtin"]);

function formatSpecLabel(key: string): string {
  if (SPEC_LABELS[key]) return SPEC_LABELS[key];
  return key
    .replace(/_/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

function sortSpecEntries(entries: [string, string][]): [string, string][] {
  const rank = new Map(PRIORITY_KEYS.map((k, i) => [k, i]));
  return [...entries].sort((a, b) => {
    const ra = rank.get(a[0]) ?? 999;
    const rb = rank.get(b[0]) ?? 999;
    if (ra !== rb) return ra - rb;
    return formatSpecLabel(a[0]).localeCompare(formatSpecLabel(b[0]), "fr");
  });
}

function SpecTable({ rows }: { rows: [string, string][] }) {
  return (
    <dl className="overflow-hidden rounded-xl border border-slate-200/80 dark:border-white/[0.06]">
      {rows.map(([label, value], i) => (
        <div
          key={`${label}-${i}`}
          className={`grid grid-cols-1 gap-0.5 px-3.5 py-2.5 text-sm sm:grid-cols-[minmax(8rem,38%)_1fr] sm:gap-4 sm:py-3 ${
            i > 0 ? "border-t border-slate-200/80 dark:border-white/[0.05]" : ""
          } ${i % 2 === 0 ? "bg-slate-50/70 dark:bg-white/[0.025]" : "bg-white dark:bg-transparent"}`}
        >
          <dt className="text-[12px] font-medium text-slate-500 dark:text-white/45">{label}</dt>
          <dd className="font-medium leading-snug text-slate-800 dark:text-white/90">{value}</dd>
        </div>
      ))}
    </dl>
  );
}

export function ProductSpecsPanel({
  baseSpecs,
  techSpecs,
}: {
  baseSpecs: [string, string][];
  techSpecs: Record<string, string> | null;
}) {
  const [expanded, setExpanded] = useState(false);

  const allRows = useMemo(() => {
    const tech = sortSpecEntries(
      Object.entries(techSpecs ?? {}).filter(([k]) => !HIDDEN_KEYS.has(k)),
    ).map(([k, v]) => [formatSpecLabel(k), v] as [string, string]);

    const brandRow = baseSpecs.find(([k]) => k === "Marque");
    const categoryRow = baseSpecs.find(([k]) => k === "Catégorie");
    const otherBase = baseSpecs.filter(([k]) => k !== "Marque" && k !== "Catégorie");

    const baseLabels = new Set(
      [brandRow, categoryRow, ...otherBase].filter(Boolean).map(([k]) => k.toLowerCase()),
    );
    const dedupedTech = tech.filter(([label]) => !baseLabels.has(label.toLowerCase()));

    const rows: [string, string][] = [];
    if (brandRow) rows.push(brandRow);
    if (categoryRow) rows.push(categoryRow);
    rows.push(...dedupedTech);
    rows.push(...otherBase);
    return rows;
  }, [baseSpecs, techSpecs]);

  const previewRows = allRows.slice(0, PREVIEW_COUNT);
  const hasMore = allRows.length > PREVIEW_COUNT;

  if (allRows.length === 0) {
    return (
      <div className="rounded-2xl border border-bg-border bg-bg-card p-5 shadow-card sm:p-6">
        <h2 className="section-title mb-3 flex items-center gap-2">
          <ListChecks className="h-4 w-4 shrink-0 text-brand-gold" />
          Caractéristiques
        </h2>
        <p className="text-sm text-slate-500 dark:text-white/45">
          Aucune caractéristique technique disponible pour ce produit.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-bg-border bg-bg-card p-5 shadow-card sm:p-6">
      <div className="mb-4 flex items-start justify-between gap-3">
        <h2 className="section-title flex items-center gap-2">
          <ListChecks className="h-4 w-4 shrink-0 text-brand-gold" />
          Caractéristiques
        </h2>
        <span className="shrink-0 rounded-full border border-slate-200 bg-slate-50 px-2.5 py-0.5 text-[11px] font-semibold tabular-nums text-slate-500 dark:border-white/10 dark:bg-white/[0.04] dark:text-white/45">
          {allRows.length}
        </span>
      </div>

      {!expanded ? (
        <div className="relative">
          <SpecTable rows={previewRows} />
          {hasMore && (
            <div
              className="pointer-events-none absolute inset-x-0 bottom-0 h-14 rounded-b-xl bg-gradient-to-t from-bg-card via-bg-card/90 to-transparent"
              aria-hidden
            />
          )}
        </div>
      ) : (
        <div
          className="max-h-[min(420px,60vh)] overflow-y-auto overscroll-contain pr-0.5 [scrollbar-width:thin]"
        >
          <SpecTable rows={allRows} />
        </div>
      )}

      {hasMore && (
        <button
          type="button"
          onClick={() => setExpanded((v) => !v)}
          className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl border border-slate-200 bg-slate-50/80 px-4 py-2.5 text-[13px] font-semibold text-slate-600 transition hover:border-brand-gold/35 hover:bg-brand-gold/5 hover:text-brand-gold dark:border-white/10 dark:bg-white/[0.03] dark:text-white/65 dark:hover:border-brand-gold/30 dark:hover:text-brand-gold"
          aria-expanded={expanded}
        >
          {expanded
            ? "Réduire"
            : `Voir toutes les caractéristiques (${allRows.length - PREVIEW_COUNT} de plus)`}
          <ChevronDown
            className={`h-4 w-4 shrink-0 transition-transform duration-300 ${expanded ? "rotate-180" : ""}`}
          />
        </button>
      )}
    </div>
  );
}
