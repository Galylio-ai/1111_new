"use client";
import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft, ChevronRight, ExternalLink, FileText,
  ListChecks, Scale, ShieldCheck, Sparkles, Star, Store, Tag, Truck,
} from "lucide-react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { FavoriteAlertButtons } from "@/components/site/FavoriteAlertButtons";

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
  images?: string[] | null;
  reference?: string | null;
  minPrice: number;
  maxPrice: number;
  shopNames: string[];
  discount: number | null;
  slug: string;
  description: string | null;
  specs: Record<string, string> | null;
  shopUrls: Record<string, string> | null;
  shopPrices: Record<string, number> | null;
  related: RelatedProduct[];
};

// Search URL patterns for each shop key — {q} is replaced with the encoded product name
const shopSearchUrls: Record<string, string> = {
  // ── Supermarché ────────────────────────────────────────────────────────────
  aziza:             "https://clusteraz.flesk.fr/recherche?query={q}",
  carrefour:         "https://www.carrefour.tn/recherche?q={q}",
  geant:             "https://www.geantdrive.tn/tunis-city/recherche?q={q}",
  monoprix:          "https://www.monoprix.tn/recherche?q={q}",
  "carrefour market":"https://www.carrefour.tn/recherche?q={q}",
  "carrefour express":"https://www.carrefour.tn/recherche?q={q}",
  // ── Retail / Tech ──────────────────────────────────────────────────────────
  mytek:             "https://www.mytek.tn/catalogsearch/result/?q={q}",
  spacenet:          "https://spacenet.tn/recherche?controller=search&s={q}",
  tunisianet:        "https://www.tunisianet.com.tn/recherche?controller=search&s={q}",
  technopro:         "https://www.technopro-online.com/recherche?controller=search&s={q}",
  affariyet:         "https://www.affariyet.com/recherche?controller=search&s={q}",
  tunewtec:          "https://tunewtec.com/?s={q}",
  jumbo:             "https://jumbo.tn/recherche?controller=search&s={q}",
  kamounhome:        "https://kamounhome.tn/?s={q}",
  zoom:              "https://zoom.com.tn/recherche?controller=search&s={q}",
  darty:             "https://www.darty.tn/recherche?controller=search&s={q}",
  itechstore:        "https://www.itechstore.tn/catalogsearch/result/?q={q}",
  scoop:             "https://www.scoopgaming.tn/recherche?controller=search&s={q}",
  sbs:               "https://www.sbsinformatique.com/search?q={q}",
  agora:             "https://agora.tn/fr/recherche?controller=search&s={q}",
  jmb:               "https://jmb.com.tn/?s={q}",
  wiki:              "https://wiki.tn/?s={q}",
  bill:              "https://bill.com.tn/?s={q}",
  bstech:            "https://bstech.tn/?s={q}",
  maalejaudio:       "https://maalejaudio.com/?s={q}",
  krichen:           "https://www.krichen-distribution.tn/?s={q}",
  taktek:            "https://taktek.tn/?s={q}",
  topbureau:         "https://topbureau.tn/?s={q}",
  emh:               "https://emh.com.tn/?s={q}",
  sigshop:           "https://sigshop.tn/?s={q}",
  // ── Parapharmacie ──────────────────────────────────────────────────────────
  mapara:            "https://www.mapara.tn/recherche?controller=search&s={q}",
  paraexpert:        "https://www.paraexpert.tn/recherche?controller=search&s={q}",
  parashop:          "https://parashop.tn/recherche?controller=search&s={q}",
  parafendri:        "https://parafendri.tn/recherche?controller=search&s={q}",
  el_farabi:         "https://www.pharmacie-elfarabi.tn/recherche?controller=search&s={q}",
  cosmetique:        "https://www.cosmetique.tn/recherche?controller=search&s={q}",
  beautystore:       "https://beautystore.tn/recherche?controller=search&s={q}",
  pharmashop:        "https://pharmashop.tn/recherche?controller=search&s={q}",
  parahouse:         "https://parahouse.tn/recherche?controller=search&s={q}",
  paraland:          "https://paraland.tn/recherche?controller=search&s={q}",
};

function shopUrl(shopKey: string, productName: string): string {
  const key = shopKey.toLowerCase().trim();
  const pattern = shopSearchUrls[key];
  if (!pattern) return `https://www.google.com/search?q=${encodeURIComponent(productName + " " + shopKey + " tunisie")}`;
  return pattern.replace("{q}", encodeURIComponent(productName));
}

function shopBadge(name: string, isCheapest: boolean) {
  if (isCheapest) {
    return "bg-emerald-500/15 text-emerald-600 dark:text-emerald-300 ring-1 ring-emerald-500/30";
  }
  return "bg-brand-gold/10 text-brand-gold ring-1 ring-brand-gold/25";
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
  const [activeImage, setActiveImage] = useState(0);

  useEffect(() => {
    fetch(`${apiBase}/${slug}`)
      .then(r => { if (!r.ok) throw new Error("not found"); return r.json(); })
      .then(setProduct)
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false));
  }, [slug, apiBase]);

  const gallery = useMemo(() => {
    if (!product) return [] as string[];
    const all = [
      ...(product.images ?? []),
      ...(product.img ? [product.img] : []),
    ].filter(u => typeof u === "string" && u.startsWith("http"));
    return Array.from(new Set(all));
  }, [product]);

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
        <div className="grid grid-cols-1 items-stretch gap-6 lg:grid-cols-[420px_1fr]">

          {/* LEFT — image (stretches to match right column height) */}
          <div className="flex flex-col gap-3">
            <div className="relative flex flex-1 min-h-[420px] items-center justify-center overflow-hidden rounded-2xl border border-bg-border bg-white p-6 dark:bg-gradient-to-br dark:from-white/[0.06] dark:via-white/[0.02] dark:to-transparent">
              <img
                src={gallery[activeImage] ?? product.img}
                alt={product.name}
                className="max-h-full max-w-full object-contain transition duration-500 hover:scale-105"
              />
              {discountPct && (
                <span className="absolute left-4 top-4 inline-flex items-center gap-1 rounded-full bg-brand-red px-3 py-1 text-[12px] font-bold text-white shadow">
                  <Tag className="h-3 w-3" />−{discountPct}%
                </span>
              )}
            </div>

            {/* Thumbnail strip — only when multiple images */}
            {gallery.length > 1 && (
              <div className="flex gap-2 overflow-x-auto pb-1">
                {gallery.map((src, i) => (
                  <button
                    key={src}
                    onClick={() => setActiveImage(i)}
                    className={`relative h-16 w-16 shrink-0 overflow-hidden rounded-lg border bg-white p-1 transition dark:bg-white/[0.04] ${
                      i === activeImage
                        ? "border-brand-gold ring-2 ring-brand-gold/30"
                        : "border-bg-border hover:border-brand-gold/40"
                    }`}
                    aria-label={`Image ${i + 1}`}
                  >
                    <img src={src} alt="" className="h-full w-full object-contain" />
                  </button>
                ))}
              </div>
            )}

            {/* Trust badges */}
            <div className="grid grid-cols-3 gap-2">
              {[
                { icon: ShieldCheck, label: "Prix vérifié" },
                { icon: Scale,       label: "Comparé sur 9+" },
                { icon: Truck,       label: "Livraison dispo" },
              ].map((b) => (
                <div key={b.label} className="flex flex-col items-center gap-1.5 rounded-xl border border-bg-border bg-bg-700 p-2.5 text-center">
                  <b.icon className="h-4 w-4 text-brand-gold" strokeWidth={2} />
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

              <div className="mt-4 flex">
                <Link
                  href={`/comparateur/${slug}?from=${comparatorBase.replace(/^\//, "")}`}
                  className="group relative flex flex-1 items-center justify-center gap-2 overflow-hidden rounded-xl bg-gradient-to-br from-brand-gold via-brand-goldDark to-[#a77f24] px-5 py-3 text-sm font-bold text-bg-900 ring-1 ring-brand-gold/40 shadow-[0_4px_18px_-4px_rgba(246,196,83,0.45)] transition-all duration-300 ease-out hover:-translate-y-0.5 hover:shadow-[0_6px_24px_-2px_rgba(246,196,83,0.65)] active:translate-y-0 active:shadow-[0_2px_10px_-2px_rgba(246,196,83,0.45)]"
                >
                  <Scale className="h-4 w-4 transition-transform duration-300 group-hover:rotate-[-8deg]" />
                  <span className="relative z-10">Comparer les prix</span>
                  <span className="pointer-events-none absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/35 to-transparent transition-transform duration-700 ease-out group-hover:translate-x-full" />
                </Link>
              </div>

              {/* Real favorite + price-drop alert (persisted server-side) */}
              <FavoriteAlertButtons slug={slug} />
            </div>

            {/* Shops list */}
            <div className="rounded-2xl border border-bg-border bg-bg-card p-5 shadow-card">
              <h2 className="section-title mb-3 flex items-center gap-2">
                <Store className="h-4 w-4 text-brand-gold" />
                Disponible dans {product.shopNames.length} boutique{product.shopNames.length > 1 ? "s" : ""}
              </h2>
              <ul className="space-y-2">
                {[...product.shopNames]
                  .map((shop) => {
                    // Try multiple key formats to match what the DB stores
                    const keyExact = shop;
                    const keyLower = shop.toLowerCase();
                    const keyUnder = keyLower.replace(/\s+/g, "_").replace(/[^a-z0-9_]/g, "");
                    const keyNoSep = keyLower.replace(/[^a-z0-9]/g, "");
                    const p = product.shopPrices;
                    const u = product.shopUrls;
                    const price = p?.[keyUnder] ?? p?.[keyExact] ?? p?.[keyLower] ?? p?.[keyNoSep] ?? product.minPrice;
                    const dbUrl = u?.[keyUnder] ?? u?.[keyExact] ?? u?.[keyLower] ?? u?.[keyNoSep];
                    const href = dbUrl ?? shopUrl(shop, product.name);
                    return { shop, price, href };
                  })
                  .sort((a, b) => a.price - b.price)
                  .map(({ shop, price, href }, i) => {
                  const isFirst = i === 0;
                  return (
                    <li key={shop}>
                      <a
                        href={href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={`relative flex items-center justify-between overflow-hidden rounded-xl px-3 py-2.5 transition-all duration-300 ease-out group/shop hover:-translate-y-0.5 active:translate-y-0 ${
                          isFirst
                            ? "border border-emerald-500/30 bg-emerald-500/10 hover:border-emerald-500/60 hover:bg-emerald-500/15 hover:shadow-[0_6px_20px_-6px_rgba(16,185,129,0.45)]"
                            : "border border-slate-200 bg-slate-50 hover:border-brand-gold/40 hover:bg-brand-gold/5 hover:shadow-[0_6px_20px_-6px_rgba(246,196,83,0.35)] dark:border-white/5 dark:bg-bg-800 dark:hover:border-brand-gold/40 dark:hover:bg-brand-gold/[0.06]"
                        }`}
                      >
                        <span className="pointer-events-none absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/10 to-transparent transition-transform duration-700 ease-out group-hover/shop:translate-x-full" />
                        <div className="relative flex items-center gap-2.5">
                          <span className={`flex h-7 w-7 items-center justify-center rounded-lg text-[11px] font-black transition-transform duration-300 group-hover/shop:scale-110 ${shopBadge(shop, isFirst)}`}>
                            {shop.charAt(0).toUpperCase()}
                          </span>
                          <span className={`text-sm font-semibold capitalize transition-colors ${isFirst ? "text-emerald-700 dark:text-emerald-300" : "text-slate-800 dark:text-white/85 group-hover/shop:text-brand-gold"}`}>
                            {shop}
                          </span>
                          {isFirst && (
                            <span className="rounded-full bg-emerald-500 px-1.5 py-0.5 text-[9px] font-bold text-white shadow-[0_0_10px_rgba(16,185,129,0.5)]">Moins cher</span>
                          )}
                        </div>
                        <div className="relative flex items-center gap-2">
                          <span className={`text-sm font-extrabold tabular-nums ${isFirst ? "text-emerald-600 dark:text-emerald-400" : "text-slate-900 dark:text-white"}`}>
                            {price.toFixed(3)} <span className="text-[10px] font-normal text-slate-400 dark:text-white/40">DT</span>
                          </span>
                          <ExternalLink className={`h-3.5 w-3.5 transition-all duration-300 group-hover/shop:translate-x-0.5 group-hover/shop:-translate-y-0.5 ${isFirst ? "text-emerald-500/60 group-hover/shop:text-emerald-400" : "text-slate-300 dark:text-white/20 group-hover/shop:text-brand-gold"}`} />
                        </div>
                      </a>
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

        {/* Description & caractéristiques */}
        <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-[1fr_1fr]">
          {/* Description */}
          <div className="rounded-2xl border border-bg-border bg-bg-card p-5 shadow-card">
            <h2 className="section-title mb-3 flex items-center gap-2">
              <FileText className="h-4 w-4 text-brand-gold" />
              Description
            </h2>
            {product.description ? (
              <p className="whitespace-pre-line text-sm leading-relaxed text-slate-600 dark:text-white/70">
                {product.description}
              </p>
            ) : (
              <div className="space-y-2">
                <p className="text-sm leading-relaxed text-slate-600 dark:text-white/70">
                  <span className="font-semibold text-slate-900 dark:text-white">{product.name}</span>
                  {" "}de la marque{" "}
                  <span className="font-semibold text-slate-900 dark:text-white">{product.brand}</span>
                  {" "}fait partie de la catégorie{" "}
                  <span className="font-semibold text-slate-900 dark:text-white">{product.category}</span>.
                  {" "}Ce produit est suivi en temps réel par 1111.tn et comparé sur{" "}
                  <span className="font-semibold text-brand-gold">{product.shopNames.length} boutique{product.shopNames.length > 1 ? "s" : ""}</span>
                  {" "}afin de vous garantir le meilleur prix.
                  {savings > 0.5 && (
                    <> Vous pouvez économiser jusqu'à{" "}
                      <span className="font-semibold text-emerald-600 dark:text-emerald-400">{savings.toFixed(3)} DT</span>
                      {" "}en choisissant la boutique la moins chère.
                    </>
                  )}
                </p>
                <p className="text-sm leading-relaxed text-slate-600 dark:text-white/70">
                  Le prix le plus bas observé est de{" "}
                  <span className="font-semibold text-emerald-600 dark:text-emerald-400">{product.minPrice.toFixed(3)} DT</span>.
                  Activez une alerte prix pour être notifié dès qu'une nouvelle promotion est détectée.
                </p>
              </div>
            )}
          </div>

          {/* Caractéristiques */}
          <div className="rounded-2xl border border-bg-border bg-bg-card p-5 shadow-card">
            <h2 className="section-title mb-3 flex items-center gap-2">
              <ListChecks className="h-4 w-4 text-brand-gold" />
              Caractéristiques
            </h2>
            <dl className="grid grid-cols-1 gap-2 sm:grid-cols-2">
              {/* Always-present base fields */}
              {[
                ["Marque", product.brand],
                ["Catégorie", product.category],
                ["Prix min", `${product.minPrice.toFixed(3)} DT`],
                ["Prix max", `${product.maxPrice.toFixed(3)} DT`],
                ["Boutiques", `${product.shopNames.length}`],
                ["Disponibilité", "En stock"],
                ...(discountPct ? [["Réduction", `−${discountPct}%`] as [string, string]] : []),
                ["Mise à jour", "Aujourd'hui"],
              ].map(([k, v]) => (
                <div
                  key={k}
                  className="flex items-center justify-between rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-xs dark:border-white/5 dark:bg-bg-800"
                >
                  <dt className="text-slate-500 dark:text-white/50">{k}</dt>
                  <dd className="font-semibold text-slate-900 dark:text-white">{v}</dd>
                </div>
              ))}
              {/* Dynamic specs from DB */}
              {product.specs && Object.entries(product.specs).map(([k, v]) => (
                <div
                  key={k}
                  className="flex items-center justify-between rounded-lg border border-brand-gold/20 bg-brand-gold/5 px-3 py-2 text-xs dark:border-brand-gold/15 dark:bg-brand-gold/[0.06]"
                >
                  <dt className="capitalize text-slate-500 dark:text-white/50">{k.replace(/_/g, " ")}</dt>
                  <dd className="font-semibold text-slate-900 dark:text-white">{v}</dd>
                </div>
              ))}
            </dl>
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
        className="group/back fixed bottom-6 left-6 z-40 flex items-center gap-2 rounded-full border border-bg-border bg-bg-card/95 px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-lg backdrop-blur-sm transition-all duration-300 ease-out hover:-translate-y-1 hover:border-brand-gold/50 hover:text-brand-gold hover:shadow-[0_8px_28px_-6px_rgba(246,196,83,0.4)] active:translate-y-0 dark:text-white/80"
      >
        <ArrowLeft className="h-4 w-4 transition-transform duration-300 group-hover/back:-translate-x-1" />
        {backLabel}
      </Link>

      <Footer />
    </main>
  );
}
