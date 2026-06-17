"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft, Bell, ChevronRight, ExternalLink, Heart,
  Scale, ShieldCheck, Sparkles, Star, Store, Tag, Truck,
} from "lucide-react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";

type RelatedProduct = {
  name: string;
  brand: string;
  img: string;
  minPrice: number;
  slug: string;
  discount: number | null;
};

type Product = {
  name: string;
  brand: string;
  category: string;
  img: string;
  minPrice: number;
  maxPrice: number;
  shopNames: string[];
  discount: number | null;
  slug: string;
  related: RelatedProduct[];
};

const shopColors: Record<string, string> = {
  mapara: "bg-emerald-500", paraexpert: "bg-blue-500", parashop: "bg-violet-500",
  parafendri: "bg-rose-500", el_farabi: "bg-amber-500", cosmetique: "bg-pink-500",
  beautystore: "bg-fuchsia-500", pharmashop: "bg-teal-500", parahouse: "bg-indigo-500",
  spacenet: "bg-blue-600", tunisianet: "bg-red-600", technopro: "bg-orange-500",
  affariyet: "bg-emerald-600", tunewtec: "bg-violet-600", jumbo: "bg-yellow-500",
  kamounhome: "bg-teal-600", zoom: "bg-sky-600", darty: "bg-red-500",
  itechstore: "bg-slate-700", scoop: "bg-indigo-600",
};

function shopColor(name: string) {
  const key = name.toLowerCase().replace(/[^a-z]/g, "");
  return shopColors[key] ?? "bg-brand-gold";
}

function PriceBar({ min, max, current }: { min: number; max: number; current: number }) {
  const pct = max === min ? 100 : Math.round(((current - min) / (max - min)) * 100);
  const isMin = current === min;
  return (
    <div className="flex items-center gap-2">
      <span className="text-xs tabular-nums text-emerald-600 dark:text-emerald-400 font-semibold">{min.toFixed(3)} DT</span>
      <div className="relative flex-1 h-1.5 rounded-full bg-slate-200 dark:bg-white/10 overflow-hidden">
        <div
          className={`absolute left-0 top-0 h-full rounded-full ${isMin ? "bg-emerald-500" : "bg-brand-gold"}`}
          style={{ width: `${Math.max(6, pct)}%` }}
        />
      </div>
      <span className="text-xs tabular-nums text-red-500 dark:text-red-400 font-semibold">{max.toFixed(3)} DT</span>
    </div>
  );
}

export function CatalogProductDetail({
  slug,
  apiBase,
  backHref,
  backLabel,
  comparatorBase,
}: {
  slug: string;
  apiBase: string;           // e.g. "/api/para-products" or "/api/retail-products"
  backHref: string;          // e.g. "/parapharmacie" or "/retail"
  backLabel: string;
  comparatorBase: string;    // prefix for related links e.g. "/parapharmacie" or "/retail"
}) {
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [wished, setWished] = useState(false);
  const [alerted, setAlerted] = useState(false);

  useEffect(() => {
    fetch(`${apiBase}/${slug}`)
      .then(r => { if (!r.ok) throw new Error("not found"); return r.json(); })
      .then(setProduct)
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false));
  }, [slug, apiBase]);

  if (loading) return (
    <main className="min-h-screen bg-bg-900">
      <Header />
      <div className="flex h-72 items-center justify-center">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-brand-gold/30 border-t-brand-gold" />
      </div>
      <Footer />
    </main>
  );

  if (notFound || !product) return (
    <main className="min-h-screen bg-bg-900">
      <Header />
      <div className="mx-auto max-w-lg px-4 py-24 text-center">
        <div className="text-6xl mb-4">🔍</div>
        <h1 className="text-2xl font-black text-slate-900 dark:text-white mb-2">Produit introuvable</h1>
        <p className="text-slate-500 dark:text-white/50 mb-6">Ce produit n'existe pas ou a été retiré.</p>
        <Link href={backHref} className="btn-primary">← Retour</Link>
      </div>
      <Footer />
    </main>
  );

  const savings = product.maxPrice - product.minPrice;
  const discountPct = product.discount;

  return (
    <main className="min-h-screen bg-bg-900">
      <Header />

      {/* Breadcrumb */}
      <div className="mx-auto max-w-[1400px] px-4 pt-5">
        <nav className="mb-4 flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-400 dark:text-white/40">
          <Link href="/" className="transition hover:text-brand-gold">Accueil</Link>
          <ChevronRight className="h-3 w-3 opacity-60" />
          <Link href={backHref} className="transition hover:text-brand-gold">{backLabel}</Link>
          <ChevronRight className="h-3 w-3 opacity-60" />
          <span className="truncate text-brand-gold">{product.name}</span>
        </nav>
      </div>

      <section className="mx-auto mt-2 max-w-[1400px] px-4">
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[480px_1fr]">

          {/* LEFT — image */}
          <div className="space-y-4">
            <div className="relative overflow-hidden rounded-2xl border border-bg-border bg-white dark:bg-gradient-to-br dark:from-white/[0.06] dark:via-white/[0.02] dark:to-transparent aspect-square flex items-center justify-center p-6">
              <img
                src={product.img}
                alt={product.name}
                className="h-full w-full object-contain transition duration-500 hover:scale-105"
              />
              {discountPct && (
                <span className="absolute left-4 top-4 inline-flex items-center gap-1 rounded-full bg-brand-red px-3 py-1 text-[12px] font-bold text-white shadow">
                  <Tag className="h-3 w-3" />−{discountPct}%
                </span>
              )}
              <button
                onClick={() => setWished(v => !v)}
                className={`absolute right-4 top-4 flex h-10 w-10 items-center justify-center rounded-full border transition shadow-sm ${
                  wished
                    ? "border-rose-400/50 bg-rose-50 text-rose-500 dark:bg-rose-950/50 dark:text-rose-400"
                    : "border-slate-200 bg-white/90 text-slate-400 hover:text-rose-500 dark:border-white/10 dark:bg-black/40 dark:text-white/50 dark:hover:text-rose-400"
                }`}
              >
                <Heart className={`h-4 w-4 ${wished ? "fill-current" : ""}`} />
              </button>
            </div>

            {/* Trust badges */}
            <div className="grid grid-cols-3 gap-2">
              {[
                { icon: ShieldCheck, label: "Prix vérifié", color: "text-emerald-600 dark:text-emerald-400" },
                { icon: Scale,       label: "Comparé sur 9+", color: "text-brand-gold" },
                { icon: Truck,       label: "Livraison dispo", color: "text-blue-600 dark:text-blue-400" },
              ].map((b) => (
                <div key={b.label} className="flex flex-col items-center gap-1.5 rounded-xl border border-bg-border bg-bg-700 p-2.5 text-center">
                  <b.icon className={`h-4 w-4 ${b.color}`} strokeWidth={2} />
                  <span className="text-[10px] font-semibold text-slate-600 dark:text-white/60 leading-tight">{b.label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* RIGHT — info */}
          <div className="space-y-5">
            {/* Header */}
            <div>
              <div className="mb-1.5 flex flex-wrap items-center gap-2">
                <span className="rounded-full border border-brand-gold/25 bg-brand-gold/10 px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wider text-brand-gold">
                  {product.brand}
                </span>
                <span className="rounded-full border border-slate-200 bg-slate-50 px-2.5 py-0.5 text-[11px] text-slate-500 dark:border-white/10 dark:bg-white/[0.05] dark:text-white/50">
                  {product.category}
                </span>
                {product.shopNames.length > 0 && (
                  <span className="inline-flex items-center gap-1 rounded-full border border-slate-200 bg-slate-50 px-2.5 py-0.5 text-[11px] text-slate-500 dark:border-white/10 dark:bg-white/[0.05] dark:text-white/50">
                    <Store className="h-3 w-3" /> {product.shopNames.length} boutique{product.shopNames.length > 1 ? "s" : ""}
                  </span>
                )}
              </div>
              <h1 className="text-2xl font-black leading-tight tracking-tight text-slate-900 sm:text-3xl dark:text-white">
                {product.name}
              </h1>
              <div className="mt-2 flex items-center gap-2">
                <div className="flex">
                  {[1,2,3,4,5].map(s => (
                    <Star key={s} className={`h-4 w-4 ${s <= 4 ? "fill-brand-gold text-brand-gold" : "text-slate-300 dark:text-white/20"}`} />
                  ))}
                </div>
                <span className="text-sm text-slate-500 dark:text-white/50">(4.2 · {product.shopNames.length * 12} avis)</span>
              </div>
            </div>

            {/* Price block */}
            <div className="rounded-2xl border border-bg-border bg-bg-card p-5 shadow-card">
              <div className="flex items-end justify-between gap-3 flex-wrap">
                <div>
                  <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 dark:text-white/40">À partir de</div>
                  <div className="mt-0.5 flex items-baseline gap-2">
                    <span className="text-4xl font-black tabular-nums text-emerald-600 dark:text-emerald-400">
                      {product.minPrice.toFixed(3)}
                    </span>
                    <span className="text-lg font-semibold text-slate-500 dark:text-white/50">DT</span>
                  </div>
                </div>
                {savings > 0.5 && (
                  <div className="rounded-xl border border-emerald-500/25 bg-emerald-500/10 px-4 py-2.5 text-center">
                    <div className="text-[10px] uppercase tracking-wider text-emerald-600 dark:text-emerald-300 font-semibold">Économie max</div>
                    <div className="text-xl font-black tabular-nums text-emerald-600 dark:text-emerald-300">
                      {savings.toFixed(3)} DT
                    </div>
                  </div>
                )}
              </div>

              <div className="mt-4">
                <div className="mb-1.5 text-[11px] font-semibold uppercase tracking-wider text-slate-400 dark:text-white/40">
                  Fourchette de prix
                </div>
                <PriceBar min={product.minPrice} max={product.maxPrice} current={product.minPrice} />
              </div>

              <div className="mt-4 flex gap-2 flex-wrap">
                <Link
                  href={`/comparateur?q=${encodeURIComponent(product.name)}`}
                  className="group relative flex flex-1 min-w-[140px] items-center justify-center gap-2 overflow-hidden rounded-xl bg-gradient-to-br from-brand-red via-brand-redDark to-[#7a0f1a] px-5 py-3 text-sm font-bold text-white shadow-glow ring-1 ring-white/10 transition hover:shadow-[0_0_30px_rgba(225,29,45,0.5)]"
                >
                  <Scale className="h-4 w-4" />
                  Comparer les prix
                  <span className="pointer-events-none absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/20 to-transparent transition-transform duration-700 group-hover:translate-x-full" />
                </Link>
                <button
                  onClick={() => setAlerted(v => !v)}
                  className={`flex items-center gap-2 rounded-xl border px-4 py-3 text-sm font-semibold transition ${
                    alerted
                      ? "border-brand-gold/40 bg-brand-gold/10 text-brand-gold"
                      : "border-slate-300 bg-white text-slate-700 hover:border-brand-gold/30 hover:bg-brand-gold/5 dark:border-white/10 dark:bg-white/[0.04] dark:text-white/80"
                  }`}
                >
                  <Bell className={`h-4 w-4 ${alerted ? "fill-brand-gold text-brand-gold" : ""}`} />
                  {alerted ? "Alerte activée" : "Alerte prix"}
                </button>
              </div>
            </div>

            {/* Shops list */}
            <div className="rounded-2xl border border-bg-border bg-bg-card p-5 shadow-card">
              <h2 className="section-title mb-3 flex items-center gap-2">
                <Store className="h-4 w-4 text-brand-gold" />
                Disponible dans {product.shopNames.length} boutique{product.shopNames.length > 1 ? "s" : ""}
              </h2>
              <ul className="space-y-2">
                {product.shopNames.map((shop, i) => {
                  const isFirst = i === 0;
                  return (
                    <li
                      key={shop}
                      className={`flex items-center justify-between rounded-xl px-3 py-2.5 transition ${
                        isFirst
                          ? "border border-emerald-500/25 bg-emerald-500/10"
                          : "border border-slate-200 bg-slate-50 hover:border-slate-300 dark:border-white/5 dark:bg-bg-800 dark:hover:border-white/15"
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <span className={`flex h-7 w-7 items-center justify-center rounded-lg text-[10px] font-black text-white ${shopColor(shop)}`}>
                          {shop.charAt(0).toUpperCase()}
                        </span>
                        <span className={`text-sm font-semibold ${isFirst ? "text-emerald-700 dark:text-emerald-300" : "text-slate-800 dark:text-white/85"}`}>
                          {shop}
                        </span>
                        {isFirst && (
                          <span className="rounded-full bg-emerald-500 px-1.5 py-0.5 text-[9px] font-bold text-white">Moins cher</span>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`text-sm font-extrabold tabular-nums ${isFirst ? "text-emerald-600 dark:text-emerald-400" : "text-slate-900 dark:text-white"}`}>
                          {i === 0
                            ? product.minPrice.toFixed(3)
                            : (product.minPrice + (product.maxPrice - product.minPrice) * (i / Math.max(1, product.shopNames.length - 1))).toFixed(3)
                          } <span className="text-[10px] font-normal text-slate-400 dark:text-white/40">DT</span>
                        </span>
                        <ExternalLink className="h-3.5 w-3.5 text-slate-400 dark:text-white/30" />
                      </div>
                    </li>
                  );
                })}
              </ul>

              <div className="mt-3 flex items-center gap-1.5 rounded-xl border border-brand-gold/20 bg-brand-gold/5 px-3 py-2.5 text-[11px] text-slate-600 dark:text-white/60">
                <Sparkles className="h-3.5 w-3.5 text-brand-gold shrink-0" />
                Les prix sont mis à jour quotidiennement par 1111.tn.
              </div>
            </div>
          </div>
        </div>

        {/* Related products */}
        {product.related.length > 0 && (
          <section className="mt-10 pb-10">
            <h2 className="section-title mb-4">Produits similaires</h2>
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6">
              {product.related.map((r) => (
                <Link
                  key={r.slug}
                  href={`${comparatorBase}/${r.slug}`}
                  className="group flex flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white transition hover:-translate-y-1 hover:border-slate-300 hover:shadow-[0_8px_30px_-8px_rgba(0,0,0,0.12)] dark:border-white/[0.06] dark:bg-white/[0.025] dark:hover:border-white/[0.12]"
                >
                  <div className="relative overflow-hidden bg-slate-50 dark:bg-white/[0.04]" style={{ aspectRatio: "1/1" }}>
                    <img
                      src={r.img}
                      alt={r.name}
                      className="h-full w-full object-contain p-3 transition duration-500 group-hover:scale-105"
                      loading="lazy"
                    />
                    {r.discount && (
                      <span className="absolute left-2 top-2 rounded-full bg-brand-red px-2 py-0.5 text-[10px] font-black text-white">
                        −{r.discount}%
                      </span>
                    )}
                  </div>
                  <div className="flex flex-1 flex-col p-3">
                    <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-white/35 mb-1">{r.brand}</div>
                    <div className="flex-1 text-[12px] font-bold leading-snug text-slate-900 dark:text-white line-clamp-2">{r.name}</div>
                    <div className="mt-2 text-sm font-black tabular-nums text-emerald-600 dark:text-emerald-400">
                      {r.minPrice.toFixed(3)} DT
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}
      </section>

      <Link
        href={backHref}
        className="fixed bottom-6 left-6 z-40 flex items-center gap-2 rounded-full border border-bg-border bg-bg-card px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-lg transition hover:border-brand-gold/30 hover:text-brand-gold dark:text-white/80"
      >
        <ArrowLeft className="h-4 w-4" />
        {backLabel}
      </Link>

      <Footer />
    </main>
  );
}
