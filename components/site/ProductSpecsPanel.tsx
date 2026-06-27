"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Cpu, ListChecks, Monitor, Smartphone, Wifi, Zap } from "lucide-react";
import { dimensionOf, type Dimension } from "@/lib/compareDimensions";

type SpecItem = { key: string; label: string; value: string };

const GROUP_ORDER: (Dimension | "Général" | "Autre")[] = [
  "Général",
  "Performance",
  "Écran",
  "Caméra",
  "Batterie",
  "Connectivité",
  "Design",
  "Autre",
];

const GROUP_ICONS: Partial<Record<Dimension | "Général" | "Autre", typeof Cpu>> = {
  Général: ListChecks,
  Performance: Cpu,
  Écran: Monitor,
  Caméra: Smartphone,
  Batterie: Zap,
  Connectivité: Wifi,
  Design: Monitor,
};

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

const HIDDEN_KEYS = new Set(["brand", "data_quality_score", "shop_count", "gtin", "sku", "reference"]);

function formatSpecLabel(key: string): string {
  if (SPEC_LABELS[key]) return SPEC_LABELS[key];
  return key
    .replace(/_/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

function formatSpecValue(value: string): string {
  const v = value.trim();
  if (!v) return "—";
  if (/^(true|oui|yes|1)$/i.test(v)) return "Oui";
  if (/^(false|non|no|0)$/i.test(v)) return "Non";
  return v;
}

function specGroup(key: string, isBase = false): Dimension | "Général" | "Autre" {
  if (isBase) return "Général";
  return dimensionOf(key) ?? "Autre";
}

function sortItems(items: SpecItem[]): SpecItem[] {
  const rank = new Map(PRIORITY_KEYS.map((k, i) => [k, i]));
  return [...items].sort((a, b) => {
    const ra = rank.get(a.key) ?? 999;
    const rb = rank.get(b.key) ?? 999;
    if (ra !== rb) return ra - rb;
    return a.label.localeCompare(b.label, "fr");
  });
}

function ScrollMouseHint({ visible }: { visible: boolean }) {
  if (!visible) return null;
  return (
    <div
      className="pointer-events-none absolute inset-x-0 bottom-0 z-10 h-[4.5rem] bg-gradient-to-t from-bg-card via-bg-card/90 to-transparent"
      aria-hidden
    >
      <div className="absolute bottom-1.5 left-1/2 flex -translate-x-1/2 flex-col items-center gap-1">
        <div className="relative flex h-9 w-[1.35rem] items-start justify-center rounded-full border-2 border-slate-400/55 pt-1.5 shadow-sm dark:border-white/25">
          <span className="specs-scroll-mouse-dot block h-1.5 w-1 rounded-full bg-brand-gold" />
        </div>
        <span className="text-[9px] font-semibold uppercase tracking-wider text-slate-400 dark:text-white/40">
          Défiler
        </span>
      </div>
    </div>
  );
}

function SpecGroupBlock({
  title,
  rows,
}: {
  title: Dimension | "Général" | "Autre";
  rows: SpecItem[];
}) {
  const Icon = GROUP_ICONS[title] ?? ListChecks;

  return (
    <section className="overflow-hidden rounded-xl border border-slate-200/80 dark:border-white/[0.06]">
      <div className="flex items-center gap-2 border-b border-slate-200/80 bg-slate-50/90 px-3.5 py-2 dark:border-white/[0.05] dark:bg-white/[0.03]">
        <Icon className="h-3.5 w-3.5 shrink-0 text-brand-gold" />
        <h3 className="text-[11px] font-bold uppercase tracking-wider text-slate-600 dark:text-white/55">
          {title}
        </h3>
        <span className="ml-auto text-[10px] tabular-nums text-slate-400 dark:text-white/30">
          {rows.length}
        </span>
      </div>
      <dl>
        {rows.map((row, i) => (
          <div
            key={`${row.key}-${i}`}
            className={`grid grid-cols-1 gap-0.5 px-3.5 py-2.5 text-sm sm:grid-cols-[minmax(7.5rem,36%)_1fr] sm:gap-3 sm:py-2.5 ${
              i > 0 ? "border-t border-slate-200/70 dark:border-white/[0.04]" : ""
            } ${i % 2 === 0 ? "bg-white dark:bg-transparent" : "bg-slate-50/60 dark:bg-white/[0.015]"}`}
          >
            <dt className="text-[11px] font-medium leading-snug text-slate-500 dark:text-white/45">
              {row.label}
            </dt>
            <dd className="text-[13px] font-semibold leading-snug text-slate-800 dark:text-white/90">
              {row.value}
            </dd>
          </div>
        ))}
      </dl>
    </section>
  );
}

export function ProductSpecsPanel({
  baseSpecs,
  techSpecs,
}: {
  baseSpecs: [string, string][];
  techSpecs: Record<string, string> | null;
}) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScroll, setCanScroll] = useState(false);
  const [showScrollHint, setShowScrollHint] = useState(true);

  const grouped = useMemo(() => {
    const items: SpecItem[] = [];
    const seen = new Set<string>();

    const push = (key: string, label: string, value: string, isBase = false) => {
      const sig = `${label.toLowerCase()}\0${value}`;
      if (!value.trim() || seen.has(sig)) return;
      seen.add(sig);
      items.push({ key: isBase ? `base:${label}` : key, label, value: formatSpecValue(value) });
    };

    for (const [label, value] of baseSpecs) {
      push(`base:${label}`, label, value, true);
    }

    const techEntries = Object.entries(techSpecs ?? {}).filter(([k]) => !HIDDEN_KEYS.has(k));
    for (const [key, value] of techEntries) {
      const label = formatSpecLabel(key);
      if (items.some((it) => it.label.toLowerCase() === label.toLowerCase())) continue;
      push(key, label, value);
    }

    const buckets = new Map<Dimension | "Général" | "Autre", SpecItem[]>();
    for (const item of items) {
      const isBase = item.key.startsWith("base:");
      const group = specGroup(isBase ? item.label : item.key, isBase);
      const list = buckets.get(group) ?? [];
      list.push(item);
      buckets.set(group, list);
    }

    return GROUP_ORDER
      .map((title) => ({
        title,
        rows: sortItems(buckets.get(title) ?? []),
      }))
      .filter((g) => g.rows.length > 0);
  }, [baseSpecs, techSpecs]);

  const totalCount = grouped.reduce((n, g) => n + g.rows.length, 0);

  const measureScroll = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    const overflow = el.scrollHeight > el.clientHeight + 6;
    setCanScroll(overflow);
    if (!overflow) setShowScrollHint(false);
  }, []);

  useEffect(() => {
    measureScroll();
    const el = scrollRef.current;
    if (!el) return;
    const ro = new ResizeObserver(measureScroll);
    ro.observe(el);
    return () => ro.disconnect();
  }, [grouped, measureScroll]);

  const handleScroll = () => {
    const el = scrollRef.current;
    if (!el) return;
    const nearBottom = el.scrollTop + el.clientHeight >= el.scrollHeight - 12;
    if (el.scrollTop > 6 || nearBottom) setShowScrollHint(false);
  };

  if (totalCount === 0) {
    return (
      <div className="flex h-full flex-col rounded-2xl border border-bg-border bg-bg-card p-5 shadow-card sm:p-6">
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
    <div className="flex h-full min-h-0 flex-col rounded-2xl border border-bg-border bg-bg-card p-5 shadow-card sm:p-6">
      <div className="mb-3 flex shrink-0 items-start justify-between gap-3">
        <h2 className="section-title flex items-center gap-2">
          <ListChecks className="h-4 w-4 shrink-0 text-brand-gold" />
          Caractéristiques
        </h2>
        <span className="shrink-0 rounded-full border border-brand-gold/25 bg-brand-gold/10 px-2.5 py-0.5 text-[11px] font-bold tabular-nums text-brand-gold">
          {totalCount}
        </span>
      </div>

      <div className="relative min-h-0 flex-1">
        <div
          ref={scrollRef}
          onScroll={handleScroll}
          className="max-h-[min(420px,58vh)] space-y-3 overflow-y-auto overscroll-y-contain scroll-smooth pr-1 [scrollbar-width:thin] [scrollbar-color:rgba(148,163,184,0.5)_transparent] [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-slate-300/80 dark:[&::-webkit-scrollbar-thumb]:bg-white/15"
        >
          {grouped.map((group) => (
            <SpecGroupBlock key={group.title} title={group.title} rows={group.rows} />
          ))}
        </div>

        <ScrollMouseHint visible={canScroll && showScrollHint} />

        {canScroll && !showScrollHint && (
          <div
            className="pointer-events-none absolute inset-x-0 top-0 h-4 bg-gradient-to-b from-bg-card to-transparent"
            aria-hidden
          />
        )}
      </div>
    </div>
  );
}
