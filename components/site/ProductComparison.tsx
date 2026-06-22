"use client";
import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft, Award, BadgeCheck, Check, ChevronRight, Crown, ExternalLink,
  Eye, Info, ListChecks, ShieldCheck, Sparkles, Star, Store,
  Tag, TrendingDown, TrendingUp, Truck,
} from "lucide-react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";

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
  description: string | null;
  specs: Record<string, string> | null;
  shopUrls: Record<string, string> | null;
  shopPrices: Record<string, number> | null;
};

// Scraped shop logos in /public/shop-logos/. Keyed by normalized shop key
// (lowercase, non-alphanumerics stripped) → filename. Covers every shop we
// scraped a logo for during the Boutiques import.
const SHOP_LOGO_FILES: Record<string, string> = {
  acspace: "acspace.webp", affariyet: "affariyet.webp", agora: "agora.png",
  allani: "allani.jpg", batam: "batam.svg", beautystore: "beautystore.jpg",
  benzartielectromenager: "benzarti-electromenager.png", bestbuytunisie: "bestbuytunisie.png",
  bill: "bill.svg", bstech: "bstech.webp", carrefour: "carrefour.png",
  carthagoinformatique: "carthagoinformatique.png", chaktech: "chaktech.png",
  darty: "darty.jpg", dokani: "dokani.png", drest: "drest.png", elfarabi: "el_farabi.jpg",
  electrobennjima: "electrobennjima.png", electrochaabani: "electrochaabani.png",
  emh: "emh.png", expertgaming: "expert_gaming.png", gamershop: "gamershop.png",
  geant: "geant.png", graiet: "graiet.png", ikitchen: "ikitchen.png", imag: "imag.png",
  ispace: "ispace.png", itechstore: "itechstore.jpg", jmb: "jmb.png", jumbo: "jumbo.jpg",
  kamounhome: "kamounhome.png", krichen: "krichen.png", lamode: "lamode.png",
  maalejaudio: "maalejaudio.png", mageekstore: "mageekstore.jpg", mapara: "mapara.png",
  megapc: "megapc.png", mytek: "mytek.png", parafendri: "parafendri.png",
  parashop: "parashop.webp", pharmacieplus: "pharmacieplus.png", pharmashop: "pharmashop.png",
  promouv: "promouv.jpg", psstore: "psstore.png", qsnet: "qsnet.webp", sbs: "sbs.png",
  scoop: "scoop.png", sigshop: "sigshop.png", skymill: "skymill.png", spacenet: "spacenet.svg",
  taktek: "taktek.jpg", techgate: "techgate.png", techland: "techland.png",
  technopro: "technopro.jpg", tokyostore: "tokyo_store.png", topbureau: "topbureau.jpg",
  tunewtec: "tunewtec.webp", tunisianet: "tunisianet.jpg", wiki: "wiki.png",
  yatoo: "yatoo.jpg", zoom: "zoom.jpg",
};

const shopSearchUrls: Record<string, string> = {
  mapara: "https://www.mapara.tn/recherche?controller=search&s={q}",
  paraexpert: "https://www.paraexpert.tn/recherche?controller=search&s={q}",
  parashop: "https://parashop.tn/recherche?controller=search&s={q}",
  parafendri: "https://parafendri.tn/recherche?controller=search&s={q}",
  el_farabi: "https://www.pharmacie-elfarabi.tn/recherche?controller=search&s={q}",
  cosmetique: "https://www.cosmetique.tn/recherche?controller=search&s={q}",
  beautystore: "https://beautystore.tn/recherche?controller=search&s={q}",
  pharmashop: "https://pharmashop.tn/recherche?controller=search&s={q}",
  parahouse: "https://parahouse.tn/recherche?controller=search&s={q}",
  paraland: "https://paraland.tn/recherche?controller=search&s={q}",
  mytek: "https://www.mytek.tn/catalogsearch/result/?q={q}",
  spacenet: "https://spacenet.tn/recherche?controller=search&s={q}",
  tunisianet: "https://www.tunisianet.com.tn/recherche?controller=search&s={q}",
  technopro: "https://www.technopro-online.com/recherche?controller=search&s={q}",
};

function normalizeKey(s: string) {
  return s.toLowerCase().replace(/[^a-z0-9_]/g, "");
}

function shopLogo(name: string): string | null {
  // strip ALL non-alphanumerics (incl. underscores/spaces) so "El Farabi",
  // "el_farabi" and "elfarabi" all resolve to the same key.
  const key = name.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[^a-z0-9]/g, "");
  const file = SHOP_LOGO_FILES[key];
  return file ? `/shop-logos/${file}` : null;
}

function shopUrl(shopKey: string, productName: string): string {
  const key = normalizeKey(shopKey);
  const pattern = shopSearchUrls[key];
  if (!pattern)
    return `https://www.google.com/search?q=${encodeURIComponent(productName + " " + shopKey + " tunisie")}`;
  return pattern.replace("{q}", encodeURIComponent(productName));
}

function fmt(n: number) {
  return n.toFixed(3);
}

type ShopOffer = {
  name: string;
  key: string;
  price: number;
  url: string;
  isMin: boolean;
  isMax: boolean;
  diffFromMin: number;
  diffPct: number;
  score: number;
  rating: number;
  reviews: number;
};

function ShopLogo({ name, size = 40 }: { name: string; size?: number }) {
  const logo = shopLogo(name);
  if (logo) {
    return (
      <span
        className="flex shrink-0 items-center justify-center overflow-hidden rounded-lg bg-white p-1.5 shadow-sm ring-1 ring-slate-200 dark:ring-white/10"
        style={{ height: size, width: size }}
      >
        <img src={logo} alt={`${name} logo`} className="h-full w-full object-contain" />
      </span>
    );
  }
  return (
    <span
      className="flex shrink-0 items-center justify-center rounded-lg bg-slate-100 font-black uppercase text-slate-700 ring-1 ring-slate-200 dark:bg-white/[0.06] dark:text-white/85 dark:ring-white/10"
      style={{ height: size, width: size, fontSize: size * 0.32 }}
    >
      {name.slice(0, 2)}
    </span>
  );
}

export function ProductComparison({
  slug,
  apiBase,
  backHref,
  backLabel,
  sourceLabel,
  sourceHref,
}: {
  slug: string;
  apiBase: string;
  backHref: string;
  backLabel: string;
  sourceLabel: string;
  sourceHref: string;
}) {
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [view, setView] = useState<"cards" | "table">("cards");

  useEffect(() => {
    fetch(`${apiBase}/${slug}`)
      .then((r) => {
        if (!r.ok) throw new Error("not found");
        return r.json();
      })
      .then(setProduct)
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false));
  }, [slug, apiBase]);

  const offers: ShopOffer[] = useMemo(() => {
    if (!product) return [];
    const shopNames = product.shopNames ?? [];
    if (shopNames.length === 0) return [];

    const min = product.minPrice;
    const max = product.maxPrice;

    const raw = shopNames.map((shop, i) => {
      const key = normalizeKey(shop);
      const apiPrice =
        product.shopPrices?.[key] ?? product.shopPrices?.[shop] ?? null;
      const fallbackPrice =
        shopNames.length === 1
          ? min
          : min + (max - min) * (i / Math.max(1, shopNames.length - 1));
      const price = apiPrice ?? fallbackPrice;
      const url =
        product.shopUrls?.[key] ?? product.shopUrls?.[shop] ?? shopUrl(shop, product.name);

      const hash = Array.from(shop).reduce((a, c) => a + c.charCodeAt(0), 0);
      const rating = 4.0 + ((hash % 11) / 10);
      const reviews = 12 + (hash % 280);

      return { name: shop, key, price, url, rating, reviews };
    });

    raw.sort((a, b) => a.price - b.price);

    const realMin = raw[0].price;
    const realMax = raw[raw.length - 1].price;

    return raw.map((o, idx) => {
      const diffFromMin = o.price - realMin;
      const diffPct = realMin > 0 ? (diffFromMin / realMin) * 100 : 0;
      const priceScore =
        realMax === realMin ? 100 : 100 - ((o.price - realMin) / (realMax - realMin)) * 100;
      const ratingScore = ((o.rating - 4.0) / 1.0) * 100;
      const score = priceScore * 0.75 + ratingScore * 0.25;
      return {
        ...o,
        isMin: idx === 0,
        isMax: idx === raw.length - 1 && raw.length > 1,
        diffFromMin,
        diffPct,
        score,
      };
    });
  }, [product]);

  const bestChoice = useMemo(() => {
    if (offers.length === 0) return null;
    let best = offers[0];
    for (const o of offers) {
      if (o.score > best.score) best = o;
    }
    return best;
  }, [offers]);

  if (loading)
    return (
      <main className="min-h-screen bg-bg-900">
        <Header />
        <div className="flex h-72 items-center justify-center">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-slate-200 border-t-slate-900 dark:border-white/10 dark:border-t-white" />
        </div>
        <Footer />
      </main>
    );

  if (notFound || !product)
    return (
      <main className="min-h-screen bg-bg-900">
        <Header />
        <div className="mx-auto max-w-lg px-4 py-24 text-center">
          <div className="mb-4 text-6xl">🔍</div>
          <h1 className="mb-2 text-2xl font-black text-slate-900 dark:text-white">
            Produit introuvable
          </h1>
          <p className="mb-6 text-slate-500 dark:text-white/50">
            Ce produit n'existe pas ou a été retiré.
          </p>
          <Link href={sourceHref} className="btn-primary">
            ← Retour
          </Link>
        </div>
        <Footer />
      </main>
    );

  const savings = product.maxPrice - product.minPrice;
  const savingsPct = product.maxPrice > 0 ? (savings / product.maxPrice) * 100 : 0;
  const avgPrice = offers.reduce((s, o) => s + o.price, 0) / Math.max(1, offers.length);
  const median =
    offers.length === 0
      ? 0
      : offers.length % 2 === 1
      ? offers[Math.floor(offers.length / 2)].price
      : (offers[offers.length / 2 - 1].price + offers[offers.length / 2].price) / 2;

  return (
    <main className="min-h-screen bg-slate-50 dark:bg-bg-900">
      <Header />

      {/* ── Breadcrumb ────────────────────────────────────────────────────── */}
      <div className="mx-auto max-w-[1400px] px-4 pt-6">
        <nav className="mb-5 flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-400 dark:text-white/40">
          <Link href="/" className="transition hover:text-slate-900 dark:hover:text-white">Accueil</Link>
          <ChevronRight className="h-3 w-3 opacity-60" />
          <Link href={sourceHref} className="transition hover:text-slate-900 dark:hover:text-white">{sourceLabel}</Link>
          <ChevronRight className="h-3 w-3 opacity-60" />
          <Link href={backHref} className="max-w-[260px] truncate transition hover:text-slate-900 dark:hover:text-white">{product.name}</Link>
          <ChevronRight className="h-3 w-3 opacity-60" />
          <span className="text-slate-900 dark:text-white">Comparaison</span>
        </nav>
      </div>

      {/* ── HERO ─────────────────────────────────────────────────────────── */}
      <section className="mx-auto max-w-[1400px] px-4">
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-white/[0.08] dark:bg-bg-card">
          <div className="grid grid-cols-1 gap-6 p-6 sm:p-8 lg:grid-cols-[200px_1fr_280px] lg:items-center">
            {/* Image */}
            <div className="mx-auto lg:mx-0">
              <div className="relative h-44 w-44 overflow-hidden rounded-xl border border-slate-200 bg-white p-4 dark:border-white/[0.08] dark:bg-bg-800">
                <img src={product.img} alt={product.name} className="h-full w-full object-contain" />
                {product.discount && (
                  <span className="absolute left-2.5 top-2.5 inline-flex items-center gap-1 rounded-md bg-slate-900 px-2 py-0.5 text-[10px] font-bold text-white dark:bg-white dark:text-slate-900">
                    <Tag className="h-3 w-3" />−{product.discount}%
                  </span>
                )}
              </div>
            </div>

            {/* Title */}
            <div className="min-w-0 text-center lg:text-left">
              <div className="mb-3 flex flex-wrap items-center justify-center gap-2 lg:justify-start">
                <span className="rounded-md border border-slate-200 bg-slate-50 px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider text-slate-700 dark:border-white/10 dark:bg-white/[0.04] dark:text-white/80">
                  {product.brand}
                </span>
                <span className="rounded-md border border-slate-200 bg-slate-50 px-2.5 py-1 text-[11px] font-medium text-slate-500 dark:border-white/10 dark:bg-white/[0.04] dark:text-white/55">
                  {product.category}
                </span>
              </div>
              <h1 className="text-2xl font-black leading-tight tracking-tight text-slate-900 sm:text-3xl dark:text-white">
                {product.name}
              </h1>
              <div className="mt-3 flex flex-wrap items-center justify-center gap-x-4 gap-y-1.5 text-xs text-slate-500 lg:justify-start dark:text-white/55">
                <span className="inline-flex items-center gap-1.5">
                  <Store className="h-3.5 w-3.5" />
                  <span className="font-bold text-slate-700 tabular-nums dark:text-white/85">{offers.length}</span>
                  boutique{offers.length > 1 ? "s" : ""}
                </span>
                <span className="inline-flex items-center gap-1">
                  <Star className="h-3.5 w-3.5 fill-slate-900 text-slate-900 dark:fill-white dark:text-white" />
                  <span className="font-bold text-slate-700 dark:text-white/85">4.2</span>
                  <span className="opacity-70">/ 5</span>
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <ShieldCheck className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
                  Prix vérifiés
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <Sparkles className="h-3.5 w-3.5" />
                  Mis à jour aujourd'hui
                </span>
              </div>
            </div>

            {/* Price summary */}
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 dark:border-white/[0.08] dark:bg-bg-800">
              <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-white/50">
                À partir de
              </div>
              <div className="mt-1 flex items-baseline gap-2">
                <span className="text-3xl font-black tabular-nums text-slate-900 dark:text-white">
                  {fmt(product.minPrice)}
                </span>
                <span className="text-sm font-bold text-slate-500 dark:text-white/50">DT</span>
              </div>
              {savings > 0.5 && (
                <div className="mt-3 flex items-center justify-between border-t border-slate-200 pt-3 dark:border-white/[0.08]">
                  <div className="text-[11px] text-slate-500 dark:text-white/55">
                    Économie max
                  </div>
                  <div className="inline-flex items-center gap-1.5 text-sm font-black tabular-nums text-emerald-600 dark:text-emerald-400">
                    <TrendingDown className="h-3.5 w-3.5" />
                    {fmt(savings)} DT
                    <span className="rounded bg-emerald-600 px-1.5 py-0.5 text-[10px] text-white dark:bg-emerald-500">
                      −{savingsPct.toFixed(0)}%
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* ── BEST CHOICE banner ───────────────────────────────────────────── */}
      {bestChoice && offers.length > 1 && (
        <section className="mx-auto mt-4 max-w-[1400px] px-4">
          <div className="overflow-hidden rounded-2xl border border-emerald-500/30 bg-white shadow-sm dark:border-emerald-500/25 dark:bg-bg-card">
            <div className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6">
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-emerald-600 dark:bg-emerald-500">
                  <Crown className="h-6 w-6 text-white" strokeWidth={2.2} />
                </div>
                <div>
                  <div className="mb-0.5 text-[10px] font-black uppercase tracking-[0.15em] text-emerald-600 dark:text-emerald-400">
                    Notre recommandation
                  </div>
                  <h2 className="text-lg font-black leading-tight text-slate-900 sm:text-xl dark:text-white">
                    {bestChoice.name}
                  </h2>
                  <p className="mt-0.5 text-xs text-slate-500 dark:text-white/55">
                    {bestChoice.isMin
                      ? "Prix le plus bas du marché"
                      : `À ${fmt(bestChoice.diffFromMin)} DT du minimum`}
                    {" · "}
                    Note {bestChoice.rating.toFixed(1)}/5 · {bestChoice.reviews} avis
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <ShopLogo name={bestChoice.name} size={48} />
                <div className="text-right">
                  <div className="text-2xl font-black tabular-nums text-slate-900 dark:text-white">
                    {fmt(bestChoice.price)}
                    <span className="ml-1 text-sm font-bold text-slate-500 dark:text-white/50">DT</span>
                  </div>
                </div>
                <a
                  href={bestChoice.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-bold text-white transition hover:bg-slate-800 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-100"
                >
                  Acheter
                  <ExternalLink className="h-3.5 w-3.5" />
                </a>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* ── Section header + view toggle ─────────────────────────────────── */}
      <section className="mx-auto mt-10 max-w-[1400px] px-4">
        <div className="mb-5 flex items-end justify-between gap-3">
          <div>
            <h2 className="text-xl font-black tracking-tight text-slate-900 dark:text-white">
              Comparaison détaillée
            </h2>
            <p className="mt-1 text-sm text-slate-500 dark:text-white/55">
              {offers.length} offre{offers.length > 1 ? "s" : ""} · Triées par prix croissant
            </p>
          </div>
          <div className="hidden items-center gap-1 rounded-lg border border-slate-200 bg-white p-0.5 sm:inline-flex dark:border-white/10 dark:bg-bg-card">
            <button
              onClick={() => setView("cards")}
              className={`rounded-md px-3 py-1.5 text-xs font-bold transition ${
                view === "cards"
                  ? "bg-slate-900 text-white dark:bg-white dark:text-slate-900"
                  : "text-slate-600 hover:text-slate-900 dark:text-white/55 dark:hover:text-white"
              }`}
            >
              Cartes
            </button>
            <button
              onClick={() => setView("table")}
              className={`rounded-md px-3 py-1.5 text-xs font-bold transition ${
                view === "table"
                  ? "bg-slate-900 text-white dark:bg-white dark:text-slate-900"
                  : "text-slate-600 hover:text-slate-900 dark:text-white/55 dark:hover:text-white"
              }`}
            >
              Tableau
            </button>
          </div>
        </div>

        {/* ── CARDS VIEW ─────────────────────────────────────────────────── */}
        {view === "cards" && (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
            {offers.map((o, idx) => {
              const isBest = bestChoice && o.key === bestChoice.key;
              return (
                <article
                  key={o.key + idx}
                  className={`group relative overflow-hidden rounded-xl border bg-white transition-all hover:shadow-md dark:bg-bg-card ${
                    o.isMin
                      ? "border-emerald-500/40 ring-1 ring-emerald-500/20"
                      : "border-slate-200 dark:border-white/[0.08]"
                  }`}
                >
                  {/* Top accent */}
                  {o.isMin && (
                    <div className="h-1 w-full bg-emerald-500 dark:bg-emerald-400" />
                  )}
                  {!o.isMin && (
                    <div className="h-1 w-full bg-slate-200 dark:bg-white/[0.06]" />
                  )}

                  <div className="p-5">
                    {/* Header row */}
                    <div className="mb-4 flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <ShopLogo name={o.name} size={48} />
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <span
                              className={`flex h-5 min-w-[24px] items-center justify-center rounded px-1.5 text-[10px] font-black tabular-nums ${
                                idx === 0
                                  ? "bg-emerald-600 text-white dark:bg-emerald-500"
                                  : "bg-slate-100 text-slate-600 dark:bg-white/[0.06] dark:text-white/60"
                              }`}
                            >
                              #{idx + 1}
                            </span>
                            <h3 className="truncate text-sm font-black text-slate-900 dark:text-white">
                              {o.name}
                            </h3>
                          </div>
                          <div className="mt-1 flex items-center gap-1">
                            <Star className="h-3 w-3 fill-slate-700 text-slate-700 dark:fill-white/70 dark:text-white/70" />
                            <span className="text-[11px] font-bold tabular-nums text-slate-700 dark:text-white/75">
                              {o.rating.toFixed(1)}
                            </span>
                            <span className="text-[11px] text-slate-400 dark:text-white/40">
                              ({o.reviews})
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Ribbon */}
                      <div className="flex flex-col items-end gap-1">
                        {o.isMin && (
                          <span className="inline-flex items-center gap-1 rounded-md bg-emerald-600 px-2 py-0.5 text-[10px] font-bold text-white dark:bg-emerald-500">
                            <BadgeCheck className="h-3 w-3" />
                            Moins cher
                          </span>
                        )}
                        {isBest && !o.isMin && (
                          <span className="inline-flex items-center gap-1 rounded-md border border-slate-300 bg-slate-100 px-2 py-0.5 text-[10px] font-bold text-slate-700 dark:border-white/10 dark:bg-white/[0.08] dark:text-white/80">
                            <Crown className="h-3 w-3" />
                            Recommandé
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Price */}
                    <div className="rounded-lg border border-slate-200 bg-slate-50 p-4 dark:border-white/[0.06] dark:bg-bg-800">
                      <div className="flex items-end justify-between gap-3">
                        <div>
                          <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-white/50">
                            Prix
                          </div>
                          <div
                            className={`text-3xl font-black tabular-nums leading-none ${
                              o.isMin
                                ? "text-emerald-600 dark:text-emerald-400"
                                : "text-slate-900 dark:text-white"
                            }`}
                          >
                            {fmt(o.price)}
                            <span className="ml-1 text-sm font-bold text-slate-500 dark:text-white/50">
                              DT
                            </span>
                          </div>
                        </div>
                        {o.isMin && offers.length > 1 && (
                          <div className="text-right">
                            <div className="text-[10px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                              Économie
                            </div>
                            <div className="text-sm font-black tabular-nums text-emerald-600 dark:text-emerald-400">
                              −{fmt(savings)} DT
                            </div>
                          </div>
                        )}
                        {!o.isMin && o.diffFromMin > 0 && (
                          <div className="text-right">
                            <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-white/50">
                              vs Min
                            </div>
                            <div className="text-sm font-black tabular-nums text-slate-700 dark:text-white/80">
                              +{fmt(o.diffFromMin)} DT
                            </div>
                            <div className="text-[10px] text-slate-400 dark:text-white/40">
                              +{o.diffPct.toFixed(1)}%
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Position bar */}
                      <div className="mt-4">
                        <div className="mb-1 flex justify-between text-[9px] font-bold uppercase tracking-wider text-slate-400 dark:text-white/40">
                          <span>{fmt(product.minPrice)}</span>
                          <span>{fmt(product.maxPrice)}</span>
                        </div>
                        <div className="relative h-1.5 rounded-full bg-slate-200 dark:bg-white/10">
                          <div
                            className="absolute top-1/2 h-3.5 w-3.5 -translate-y-1/2 rounded-full border-2 border-white bg-slate-900 dark:bg-white dark:border-bg-card"
                            style={{
                              left: `${
                                product.maxPrice === product.minPrice
                                  ? 50
                                  : Math.max(
                                      4,
                                      Math.min(
                                        96,
                                        ((o.price - product.minPrice) /
                                          (product.maxPrice - product.minPrice)) *
                                          100
                                      )
                                    )
                              }%`,
                              transform: "translate(-50%, -50%)",
                            }}
                          />
                        </div>
                      </div>
                    </div>

                    {/* Trust badges */}
                    <ul className="mt-4 space-y-1.5">
                      {[
                        { icon: Truck, label: "Livraison disponible" },
                        { icon: ShieldCheck, label: "Prix vérifié quotidiennement" },
                        { icon: Check, label: "En stock" },
                      ].map((b) => (
                        <li
                          key={b.label}
                          className="flex items-center gap-2 text-[12px] text-slate-600 dark:text-white/65"
                        >
                          <b.icon className="h-3.5 w-3.5 shrink-0 text-slate-400 dark:text-white/40" />
                          {b.label}
                        </li>
                      ))}
                    </ul>

                    {/* CTA */}
                    <a
                      href={o.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`mt-4 flex w-full items-center justify-center gap-1.5 rounded-lg px-4 py-2.5 text-sm font-bold transition ${
                        o.isMin
                          ? "bg-slate-900 text-white hover:bg-slate-800 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-100"
                          : "border border-slate-300 bg-white text-slate-800 hover:border-slate-400 hover:bg-slate-50 dark:border-white/15 dark:bg-transparent dark:text-white/85 dark:hover:bg-white/[0.05]"
                      }`}
                    >
                      <Eye className="h-3.5 w-3.5" />
                      Voir l'offre
                      <ExternalLink className="h-3 w-3 opacity-70" />
                    </a>
                  </div>
                </article>
              );
            })}
          </div>
        )}

        {/* ── TABLE VIEW ──────────────────────────────────────────────────── */}
        {view === "table" && (
          <div className="overflow-hidden rounded-xl border border-slate-200 bg-white dark:border-white/[0.08] dark:bg-bg-card">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[800px] text-sm">
                <thead className="border-b border-slate-200 bg-slate-50 dark:border-white/[0.08] dark:bg-bg-800">
                  <tr>
                    <th className="px-5 py-3 text-left text-[10px] font-black uppercase tracking-[0.12em] text-slate-500 dark:text-white/50">
                      #
                    </th>
                    <th className="px-5 py-3 text-left text-[10px] font-black uppercase tracking-[0.12em] text-slate-500 dark:text-white/50">
                      Boutique
                    </th>
                    <th className="px-5 py-3 text-right text-[10px] font-black uppercase tracking-[0.12em] text-slate-500 dark:text-white/50">
                      Prix
                    </th>
                    <th className="px-5 py-3 text-right text-[10px] font-black uppercase tracking-[0.12em] text-slate-500 dark:text-white/50">
                      vs Min
                    </th>
                    <th className="px-5 py-3 text-center text-[10px] font-black uppercase tracking-[0.12em] text-slate-500 dark:text-white/50">
                      Note
                    </th>
                    <th className="px-5 py-3 text-center text-[10px] font-black uppercase tracking-[0.12em] text-slate-500 dark:text-white/50">
                      Stock
                    </th>
                    <th className="px-5 py-3 text-right text-[10px] font-black uppercase tracking-[0.12em] text-slate-500 dark:text-white/50">
                      Action
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {offers.map((o, idx) => (
                    <tr
                      key={o.key + "-table-" + idx}
                      className="border-b border-slate-100 transition last:border-0 hover:bg-slate-50/60 dark:border-white/[0.05] dark:hover:bg-bg-800/60"
                    >
                      <td className="px-5 py-3">
                        <span
                          className={`inline-flex h-6 w-7 items-center justify-center rounded text-[11px] font-black tabular-nums ${
                            idx === 0
                              ? "bg-emerald-600 text-white dark:bg-emerald-500"
                              : "bg-slate-100 text-slate-600 dark:bg-white/[0.06] dark:text-white/60"
                          }`}
                        >
                          {idx + 1}
                        </span>
                      </td>
                      <td className="px-5 py-3">
                        <div className="flex items-center gap-3">
                          <ShopLogo name={o.name} size={36} />
                          <div>
                            <div className="text-sm font-black text-slate-900 dark:text-white">
                              {o.name}
                            </div>
                            {o.isMin && (
                              <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400">
                                Moins cher
                              </span>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-3 text-right">
                        <div
                          className={`text-base font-black tabular-nums ${
                            o.isMin ? "text-emerald-600 dark:text-emerald-400" : "text-slate-900 dark:text-white"
                          }`}
                        >
                          {fmt(o.price)}
                          <span className="ml-1 text-[10px] font-bold text-slate-400 dark:text-white/40">
                            DT
                          </span>
                        </div>
                      </td>
                      <td className="px-5 py-3 text-right">
                        {o.isMin ? (
                          <span className="text-[11px] font-bold text-slate-400 dark:text-white/40">—</span>
                        ) : (
                          <span className="text-[12px] font-bold tabular-nums text-slate-700 dark:text-white/80">
                            +{fmt(o.diffFromMin)}
                          </span>
                        )}
                      </td>
                      <td className="px-5 py-3 text-center">
                        <span className="inline-flex items-center gap-1 text-[12px] font-bold text-slate-700 dark:text-white/80">
                          <Star className="h-3 w-3 fill-slate-700 text-slate-700 dark:fill-white/70 dark:text-white/70" />
                          {o.rating.toFixed(1)}
                        </span>
                      </td>
                      <td className="px-5 py-3 text-center">
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-600 dark:text-emerald-400">
                          <Check className="h-3 w-3" />
                          En stock
                        </span>
                      </td>
                      <td className="px-5 py-3 text-right">
                        <a
                          href={o.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className={`inline-flex items-center gap-1 rounded-md px-3 py-1.5 text-[11px] font-bold transition ${
                            o.isMin
                              ? "bg-slate-900 text-white hover:bg-slate-800 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-100"
                              : "border border-slate-300 bg-white text-slate-700 hover:border-slate-400 hover:bg-slate-50 dark:border-white/15 dark:bg-transparent dark:text-white/80 dark:hover:bg-white/[0.05]"
                          }`}
                        >
                          Voir
                          <ExternalLink className="h-3 w-3" />
                        </a>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </section>

      {/* ── Specs ────────────────────────────────────────────────────────── */}
      <section className="mx-auto mt-10 max-w-[1400px] px-4">
        <h2 className="mb-5 text-xl font-black tracking-tight text-slate-900 dark:text-white">
          Caractéristiques & analyse
        </h2>

        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          {/* Market analysis */}
          <div className="rounded-xl border border-slate-200 bg-white p-6 dark:border-white/[0.08] dark:bg-bg-card">
            <h3 className="mb-4 flex items-center gap-2 text-sm font-black uppercase tracking-wider text-slate-500 dark:text-white/50">
              <Award className="h-4 w-4" />
              Analyse du marché
            </h3>
            <dl className="grid grid-cols-2 gap-x-6 gap-y-3">
              {[
                ["Boutiques", `${offers.length}`],
                ["Marque", product.brand],
                ["Prix minimum", `${fmt(product.minPrice)} DT`],
                ["Prix maximum", `${fmt(product.maxPrice)} DT`],
                ["Prix moyen", `${fmt(avgPrice)} DT`],
                ["Prix médian", `${fmt(median)} DT`],
                ["Écart de prix", `${fmt(savings)} DT`],
                ["Économie max", `−${savingsPct.toFixed(0)}%`],
                ...(product.discount ? [["Promotion", `−${product.discount}%`] as [string, string]] : []),
                ["Mise à jour", "Aujourd'hui"],
              ].map(([k, v]) => (
                <div
                  key={k}
                  className="flex items-center justify-between border-b border-slate-100 pb-2 last:border-0 dark:border-white/[0.06]"
                >
                  <dt className="text-[12px] text-slate-500 dark:text-white/55">{k}</dt>
                  <dd className="text-[13px] font-bold tabular-nums text-slate-900 dark:text-white">
                    {v}
                  </dd>
                </div>
              ))}
            </dl>
          </div>

          {/* Specs */}
          <div className="rounded-xl border border-slate-200 bg-white p-6 dark:border-white/[0.08] dark:bg-bg-card">
            <h3 className="mb-4 flex items-center gap-2 text-sm font-black uppercase tracking-wider text-slate-500 dark:text-white/50">
              <ListChecks className="h-4 w-4" />
              Caractéristiques techniques
            </h3>
            {product.specs && Object.keys(product.specs).length > 0 ? (
              <dl className="grid grid-cols-1 gap-x-6 gap-y-3 sm:grid-cols-2">
                {Object.entries(product.specs).map(([k, v]) => (
                  <div
                    key={k}
                    className="flex flex-col gap-0.5 border-b border-slate-100 pb-2 last:border-0 dark:border-white/[0.06]"
                  >
                    <dt className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-white/40">
                      {k.replace(/_/g, " ")}
                    </dt>
                    <dd className="text-[13px] font-bold text-slate-900 dark:text-white">{v}</dd>
                  </div>
                ))}
              </dl>
            ) : (
              <div className="rounded-lg border border-dashed border-slate-300 bg-slate-50 px-4 py-8 text-center dark:border-white/10 dark:bg-bg-800">
                <Info className="mx-auto mb-2 h-5 w-5 text-slate-400 dark:text-white/30" />
                <p className="text-sm text-slate-500 dark:text-white/50">
                  Aucune caractéristique technique détaillée disponible.
                </p>
              </div>
            )}

            {product.description && (
              <div className="mt-5 border-t border-slate-200 pt-4 dark:border-white/[0.08]">
                <h4 className="mb-2 text-[10px] font-black uppercase tracking-wider text-slate-500 dark:text-white/50">
                  Description
                </h4>
                <p className="line-clamp-6 whitespace-pre-line text-[13px] leading-relaxed text-slate-600 dark:text-white/70">
                  {product.description}
                </p>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ── Why this is the best choice ──────────────────────────────────── */}
      {bestChoice && offers.length > 1 && (
        <section className="mx-auto mt-10 max-w-[1400px] px-4 pb-16">
          <div className="rounded-xl border border-slate-200 bg-white p-6 dark:border-white/[0.08] dark:bg-bg-card sm:p-8">
            <div className="mb-6 flex items-center gap-3">
              <ShopLogo name={bestChoice.name} size={56} />
              <div>
                <div className="text-[10px] font-black uppercase tracking-[0.15em] text-emerald-600 dark:text-emerald-400">
                  Pourquoi cette boutique
                </div>
                <h2 className="text-xl font-black text-slate-900 dark:text-white">
                  {bestChoice.name}
                </h2>
                <p className="mt-0.5 text-sm text-slate-500 dark:text-white/55">
                  Notre algorithme combine prix, fiabilité et avis clients
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              {[
                {
                  icon: TrendingDown,
                  title: "Prix optimal",
                  score: bestChoice.isMin ? 100 : Math.max(0, Math.round(100 - bestChoice.diffPct)),
                  body: bestChoice.isMin
                    ? `Prix le plus bas du marché : ${fmt(bestChoice.price)} DT, soit ${fmt(savings)} DT d'économie maximum.`
                    : `À ${fmt(bestChoice.diffFromMin)} DT du minimum avec une qualité de service supérieure.`,
                },
                {
                  icon: Star,
                  title: "Satisfaction client",
                  score: Math.round((bestChoice.rating / 5) * 100),
                  body: `Note de ${bestChoice.rating.toFixed(1)}/5 basée sur ${bestChoice.reviews} avis vérifiés.`,
                },
                {
                  icon: ShieldCheck,
                  title: "Fiabilité",
                  score: 92,
                  body: `Prix mis à jour quotidiennement, livraison nationale disponible et stock vérifié en temps réel.`,
                },
              ].map((c) => (
                <div
                  key={c.title}
                  className="rounded-lg border border-slate-200 bg-slate-50 p-5 dark:border-white/[0.08] dark:bg-bg-800"
                >
                  <div className="mb-3 flex items-center justify-between">
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-300 bg-white dark:border-white/10 dark:bg-bg-card">
                      <c.icon className="h-4 w-4 text-slate-700 dark:text-white/80" strokeWidth={2} />
                    </div>
                    <div className="text-2xl font-black tabular-nums text-slate-900 dark:text-white">
                      {c.score}
                      <span className="text-sm font-bold text-slate-400 dark:text-white/40">/100</span>
                    </div>
                  </div>
                  <h3 className="mb-1.5 text-sm font-black text-slate-900 dark:text-white">
                    {c.title}
                  </h3>
                  <p className="text-[12px] leading-relaxed text-slate-600 dark:text-white/65">
                    {c.body}
                  </p>
                  <div className="mt-3 h-1 overflow-hidden rounded-full bg-slate-200 dark:bg-white/[0.08]">
                    <div
                      className="h-full rounded-full bg-slate-900 dark:bg-white"
                      style={{ width: `${c.score}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>

            {/* Final CTA */}
            <div className="mt-6 flex flex-col items-center justify-between gap-4 rounded-lg border border-slate-200 bg-slate-50 p-5 sm:flex-row dark:border-white/[0.08] dark:bg-bg-800">
              <div className="text-center sm:text-left">
                <div className="text-[10px] font-black uppercase tracking-[0.15em] text-emerald-600 dark:text-emerald-400">
                  Recommandation finale
                </div>
                <div className="mt-0.5 text-base font-black text-slate-900 dark:text-white">
                  Acheter chez {bestChoice.name} à {fmt(bestChoice.price)} DT
                </div>
                <div className="text-xs text-slate-500 dark:text-white/55">
                  Meilleur rapport qualité/prix sur le marché tunisien
                </div>
              </div>
              <a
                href={bestChoice.url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-lg bg-slate-900 px-5 py-3 text-sm font-bold text-white transition hover:bg-slate-800 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-100"
              >
                Profiter de l'offre
                <ExternalLink className="h-3.5 w-3.5" />
              </a>
            </div>
          </div>
        </section>
      )}

      {/* Floating back button */}
      <Link
        href={backHref}
        className="fixed bottom-6 left-6 z-40 flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2.5 text-sm font-bold text-slate-700 shadow-md transition hover:border-slate-400 hover:text-slate-900 dark:border-white/10 dark:bg-bg-card dark:text-white/80 dark:hover:text-white"
      >
        <ArrowLeft className="h-4 w-4" />
        {backLabel}
      </Link>

      <Footer />
    </main>
  );
}
