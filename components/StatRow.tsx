"use client";
import { AlertTriangle, Database, Tag } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

function formatNumber(n: number): string {
  return n.toLocaleString("fr-FR").replace(/ /g, " ");
}

function formatPrice(n: number | null | undefined): string {
  if (n == null || !isFinite(n)) return "—";
  return `${n.toFixed(3)} DT`;
}

function timeAgo(iso: string | null | undefined): string {
  if (!iso) return "—";
  const t = new Date(iso).getTime();
  if (!isFinite(t)) return "—";
  const diff = Math.max(0, Date.now() - t);
  const mins = Math.round(diff / 60_000);
  if (mins < 1) return "à l'instant";
  if (mins < 60) return `il y a ${mins} min`;
  const hrs = Math.round(mins / 60);
  if (hrs < 24) return `il y a ${hrs} h`;
  const days = Math.round(hrs / 24);
  return `il y a ${days} j`;
}

type LatestAdded = {
  catalog: string;
  catalogPath: string;
  name: string;
  brand: string | null;
  slug: string;
  image: string | null;
  price: number | null;
  shopName: string | null;
  createdAt: string;
};

type LatestPriceChange = {
  catalog: string;
  catalogPath: string;
  name: string;
  brand: string | null;
  slug: string;
  image: string | null;
  shopName: string | null;
  oldPrice: number;
  newPrice: number;
  changedAt: string;
};

type IllogicalPromo = {
  catalog: string;
  catalogPath: string;
  name: string;
  brand: string | null;
  slug: string;
  image: string | null;
  shopName: string;
  oldPrice: number;
  currentPrice: number;
  honestMin: number;
  effectiveDiscountPct: number;
  claimedDiscountPct: number;
  changedAt: string;
};

function ProductThumb({ src, label }: { src: string | null; label: string }) {
  const [broken, setBroken] = useState(false);
  const isHttp = typeof src === "string" && /^https?:\/\//.test(src);
  const showImage = isHttp && !broken;
  return (
    <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-lg bg-slate-100 p-1 ring-1 ring-inset ring-slate-200 dark:bg-white/[0.06] dark:ring-white/5">
      {showImage ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={src!}
          alt={label}
          className="h-full w-full object-contain"
          loading="lazy"
          onError={() => setBroken(true)}
        />
      ) : (
        <div className="flex h-full w-full items-center justify-center text-2xl text-slate-300 dark:text-white/20" aria-label={label}>📦</div>
      )}
    </div>
  );
}

function EmptyState({ label }: { label: string }) {
  return (
    <div className="mt-3 flex items-center gap-3 rounded-lg border border-dashed border-slate-200 bg-slate-50 p-3 text-xs text-slate-500 dark:border-white/10 dark:bg-white/[0.02] dark:text-white/50">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-300 dark:bg-white/[0.04] dark:text-white/30">⏳</div>
      <div>{label}</div>
    </div>
  );
}

export function StatRow() {
  const [latestAdded, setLatestAdded] = useState<LatestAdded | null>(null);
  const [latestChange, setLatestChange] = useState<LatestPriceChange | null>(null);
  const [illogical, setIllogical] = useState<IllogicalPromo | null>(null);

  useEffect(() => {
    let cancelled = false;
    const safeFetch = <T,>(url: string, set: (v: T | null) => void, pick: (d: any) => T | null) =>
      fetch(url)
        .then(r => r.ok ? r.json() : null)
        .then(d => { if (!cancelled && d) set(pick(d)); })
        .catch(() => {});

    safeFetch<LatestAdded>("/api/stats/latest-added", setLatestAdded, d => d?.item ?? null);
    safeFetch<LatestPriceChange>("/api/stats/latest-price-change", setLatestChange, d => d?.item ?? null);
    safeFetch<IllogicalPromo>("/api/stats/illogical-promo", setIllogical, d => d?.item ?? null);

    return () => { cancelled = true; };
  }, []);

  return (
    <section className="mx-auto mt-5 max-w-[1600px] px-3 sm:px-4">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">

        {/* Dernier prix changé */}
        <div className="card card-pad">
          <div className="mb-2 flex items-center gap-2">
            <Tag className="h-4 w-4 text-brand-gold" />
            <span className="text-[11px] font-bold uppercase tracking-wider text-brand-gold">
              Dernier prix changé
            </span>
          </div>
          <div className="text-[11px] text-slate-500 dark:text-white/60">tous catalogues</div>
          {latestChange ? (
            <Link href={`${latestChange.catalogPath}/${latestChange.slug}`} className="block">
              <div className="mt-3 flex items-center gap-3">
                <ProductThumb src={latestChange.image} label={latestChange.name} />
                <div className="flex-1 text-xs min-w-0">
                  <div className="line-clamp-2 text-sm font-semibold text-slate-900 dark:text-white">{latestChange.name}</div>
                  <div className="text-slate-500 dark:text-white/50">{latestChange.shopName ?? "—"}</div>
                  <div className="text-slate-600 dark:text-white/60">
                    Ancien : <span className="line-through">{formatPrice(latestChange.oldPrice)}</span>
                  </div>
                  <div className="text-slate-600 dark:text-white/60">
                    Nouveau : <span className={`font-semibold ${latestChange.newPrice < latestChange.oldPrice ? "text-emerald-600 dark:text-emerald-400" : "text-orange-600 dark:text-orange-400"}`}>{formatPrice(latestChange.newPrice)}</span>
                  </div>
                </div>
              </div>
              <div className="mt-2 flex items-center justify-between text-[11px]">
                <span className="text-slate-500 dark:text-white/50">{timeAgo(latestChange.changedAt)}</span>
                <span className={`rounded-md px-2 py-0.5 font-semibold ${latestChange.newPrice < latestChange.oldPrice ? "bg-emerald-500/20 text-emerald-600 dark:text-emerald-300" : "bg-orange-500/20 text-orange-600 dark:text-orange-300"}`}>
                  {latestChange.newPrice < latestChange.oldPrice ? "−" : "+"}{Math.abs(latestChange.newPrice - latestChange.oldPrice).toFixed(3)} DT
                </span>
              </div>
            </Link>
          ) : (
            <EmptyState label="Aucun changement de prix enregistré encore. Les modifications apparaîtront ici." />
          )}
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
          {latestAdded ? (
            <Link href={`${latestAdded.catalogPath}/${latestAdded.slug}`} className="block">
              <div className="mt-3 flex items-center gap-3">
                <ProductThumb src={latestAdded.image} label={latestAdded.name} />
                <div className="flex-1 text-xs min-w-0">
                  <div className="line-clamp-2 text-sm font-semibold text-slate-900 dark:text-white">{latestAdded.name}</div>
                  <div className="text-slate-500 dark:text-white/50">{latestAdded.shopName ?? latestAdded.catalog}</div>
                  {latestAdded.price != null && (
                    <div className="text-slate-600 dark:text-white/60">
                      Prix : <span className="font-semibold text-slate-900 dark:text-white">{formatPrice(latestAdded.price)}</span>
                    </div>
                  )}
                </div>
              </div>
              <div className="mt-2 flex items-center justify-between text-[11px]">
                <span className="text-slate-500 dark:text-white/50">{timeAgo(latestAdded.createdAt)}</span>
                <span className="rounded-md bg-brand-gold/20 px-2 py-0.5 font-bold text-brand-gold">NOUVEAU</span>
              </div>
            </Link>
          ) : (
            <EmptyState label="Aucun article importé récemment." />
          )}
        </div>

        {/* Nombre total SKU */}
        <div className="card card-pad flex flex-col items-center justify-center text-center">
          <Database className="h-5 w-5 text-brand-gold" />
          <div className="mt-1 text-[11px] font-bold uppercase tracking-wider text-brand-gold">
            Nombre total de SKU
          </div>
          <div className="text-[11px] text-slate-600 dark:text-white/60">dans notre base</div>
          <div className="mt-2 text-4xl font-black tracking-tight text-slate-900 dark:text-white">
            +350 000
          </div>
          <div className="mt-1 text-[11px] text-slate-600 dark:text-white/60">
            SKU uniques analysés
            <br />
            sur tous les sites scrappés
          </div>
        </div>

        {/* Promotions illogiques */}
        <div className="card card-pad">
          <div className="mb-2 flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-orange-400" />
            <span className="text-[11px] font-bold uppercase tracking-wider text-orange-400">
              Promotion illogique détectée
            </span>
          </div>
          <div className="text-[11px] text-slate-600 dark:text-white/60">aujourd'hui</div>
          {illogical ? (
            <Link href={`${illogical.catalogPath}/${illogical.slug}`} className="block">
              <div className="mt-3 flex items-center gap-3">
                <ProductThumb src={illogical.image} label={illogical.name} />
                <div className="flex-1 text-xs min-w-0">
                  <div className="line-clamp-2 text-sm font-semibold text-slate-900 dark:text-white">{illogical.name}</div>
                  <div className="text-slate-500 dark:text-white/50">{illogical.shopName}</div>
                  <div className="text-slate-600 dark:text-white/60">
                    « Ancien prix » : <span className="line-through">{formatPrice(illogical.oldPrice)}</span>
                  </div>
                  <div className="text-slate-600 dark:text-white/60">
                    Prix réel marché : <span className="font-semibold text-slate-900 dark:text-white">{formatPrice(illogical.honestMin)}</span>
                  </div>
                </div>
              </div>
              <div className="mt-2 flex items-center justify-between text-[11px]">
                <span className="text-slate-600 dark:text-white/60">
                  Réduction annoncée : <span className="font-semibold text-orange-600 dark:text-orange-300">−{illogical.claimedDiscountPct}%</span>
                </span>
                <span className="rounded-md bg-orange-500/20 px-2 py-0.5 font-bold text-orange-600 dark:text-orange-300">
                  ILLOGIQUE
                </span>
              </div>
            </Link>
          ) : (
            <EmptyState label="Aucune promotion suspecte détectée pour le moment." />
          )}
        </div>
      </div>
    </section>
  );
}
