"use client";
import { AlertTriangle, Eye, Flame, PackagePlus, Pencil } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

type Stats = {
  pricesModifiedToday: number;
  activePromos: number;
  fakePromos: number;
  newProductsToday: number;
};

function fmt(n: number): string {
  return n.toLocaleString("fr-FR");
}

export function Observatoire() {
  const [stats, setStats] = useState<Stats | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/stats/observatoire-retail")
      .then((r) => r.json())
      .then((d) => {
        if (cancelled || !d) return;
        setStats({
          pricesModifiedToday: d.pricesModifiedToday ?? 0,
          activePromos: d.activePromos ?? 0,
          fakePromos: d.fakePromos ?? 0,
          newProductsToday: d.newProductsToday ?? 0,
        });
      })
      .catch(() => {});
    return () => { cancelled = true; };
  }, []);

  const placeholder = "—";
  const v = (n: number | undefined): string => (n == null ? placeholder : fmt(n));

  return (
    <section className="mx-auto mt-5 max-w-[1600px] px-3 sm:px-4">
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1fr_1.4fr]">
        <div className="card card-pad">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2.5">
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-brand-gold/25 to-brand-gold/5 ring-1 ring-brand-gold/30">
                <Eye className="h-4.5 w-4.5 text-brand-gold" strokeWidth={2.2} />
              </span>
              <div>
                <div className="section-title">Observatoire du marché</div>
                <div className="text-[11px] text-slate-500 dark:text-white/60">Magasins · données collectées aujourd'hui</div>
              </div>
            </div>
            <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2 py-0.5 text-[10px] font-semibold text-emerald-600 dark:text-emerald-300">
              <span className="live-dot" /> Live
            </span>
          </div>
          <div className="mt-4 grid grid-cols-2 gap-2.5 md:grid-cols-4">
            <Cell
              icon={Pencil}
              value={v(stats?.pricesModifiedToday)}
              label="Prix modifiés aujourd'hui"
              tone="emerald"
            />
            <Cell
              icon={Flame}
              value={v(stats?.activePromos)}
              label="Promotions actives"
              tone="red"
            />
            <Cell
              icon={AlertTriangle}
              value={v(stats?.fakePromos)}
              label="Fausses promos détectées"
              tone="orange"
            />
            <Cell
              icon={PackagePlus}
              value={v(stats?.newProductsToday)}
              label="Nouveaux produits aujourd'hui"
              tone="blue"
            />
          </div>
          <Link href="/observatoire" className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-brand-gold transition hover:gap-2 hover:underline">
            Explorer l'observatoire →
          </Link>
        </div>

        <Link
          href="/promotions"
          data-home-card=""
          className="group relative block overflow-hidden rounded-2xl border border-red-500/40 shadow-card transition hover:border-red-400/70 hover:shadow-[0_0_32px_-8px_rgba(239,68,68,0.55)]"
        >
          <video
            src="/biobalance.mp4"
            autoPlay
            muted
            loop
            playsInline
            preload="auto"
            aria-label="1111.tn · Mobile · COMPAREZ"
            className="block h-full w-full object-cover object-center transition duration-700 group-hover:scale-[1.015]"
          />

          {/* Hover shimmer sweep */}
          <span className="pointer-events-none absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/15 to-transparent transition-transform duration-1000 group-hover:translate-x-full" />
        </Link>
      </div>
    </section>
  );
}

const tonePalette = {
  emerald: {
    text: "text-emerald-600 dark:text-emerald-300",
    iconBg: "bg-emerald-500/15 ring-emerald-500/30",
    cardRing: "hover:border-emerald-500/30",
    glow: "from-emerald-500/10",
  },
  red: {
    text: "text-red-500 dark:text-red-300",
    iconBg: "bg-red-500/15 ring-red-500/30",
    cardRing: "hover:border-red-500/30",
    glow: "from-red-500/10",
  },
  orange: {
    text: "text-orange-600 dark:text-orange-300",
    iconBg: "bg-orange-500/15 ring-orange-500/30",
    cardRing: "hover:border-orange-500/30",
    glow: "from-orange-500/10",
  },
  blue: {
    text: "text-blue-600 dark:text-blue-300",
    iconBg: "bg-blue-500/15 ring-blue-500/30",
    cardRing: "hover:border-blue-500/30",
    glow: "from-blue-500/10",
  },
} as const;

function Cell({
  icon: Icon,
  value,
  label,
  tone,
}: {
  icon: any;
  value: string;
  label: string;
  tone: keyof typeof tonePalette;
}) {
  const t = tonePalette[tone];
  return (
    <div
      className={`relative overflow-hidden rounded-xl border border-bg-border bg-bg-700 p-3 transition dark:bg-bg-800 ${t.cardRing}`}
    >
      <div
        className={`pointer-events-none absolute -right-6 -top-6 h-16 w-16 rounded-full bg-gradient-to-br ${t.glow} to-transparent blur-2xl`}
      />
      <div className="relative flex items-center gap-2">
        <span className={`flex h-7 w-7 items-center justify-center rounded-lg ring-1 ${t.iconBg}`}>
          <Icon className={`h-3.5 w-3.5 ${t.text}`} strokeWidth={2.4} />
        </span>
        <span className={`text-xl font-extrabold tabular-nums ${t.text}`}>{value}</span>
      </div>
      <div className="relative mt-1.5 text-[11px] leading-tight text-slate-500 dark:text-white/65">{label}</div>
    </div>
  );
}
