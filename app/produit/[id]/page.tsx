import { ArrowLeft, BadgePercent, BellRing, ChevronRight, ExternalLink, Heart, ShieldCheck, Sparkles, Star, Store, Truck } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { topOffers } from "@/lib/data";
import { PriceHistoryChart } from "./PriceHistoryChart";

type Params = { params: { id: string } };

export function generateStaticParams() {
  return topOffers.map((p) => ({ id: p.id }));
}

export function generateMetadata({ params }: Params) {
  const p = topOffers.find((x) => x.id === params.id);
  return {
    title: p ? `${p.name} · 1111.tn` : "Produit · 1111.tn",
    description: p
      ? `${p.name} — ${p.price.toLocaleString("fr-FR")} DT chez ${p.store}. Économisez ${Math.abs(p.discount)} DT.`
      : undefined,
  };
}

export default function ProductPage({ params }: Params) {
  const p = topOffers.find((x) => x.id === params.id);
  if (!p) notFound();

  const discountPct = Math.round(((p.oldPrice - p.price) / p.oldPrice) * 100);
  const similar = topOffers.filter((x) => x.id !== p.id).slice(0, 4);

  // Static 30-day price history — anchors to real oldPrice and drops to current price
  const staticSeeds: Record<string, number[]> = {
    "57734": [5999,5950,5950,5899,5899,5849,5849,5799,5799,5750,5700,5700,5650,5600,5600,5550,5500,5499,5450,5400,5350,5299,5250,5199,5149,5099,5050,4999,4899,4799],
    "57966": [3899,3850,3850,3799,3799,3750,3699,3699,3650,3599,3550,3499,3450,3399,3350,3299,3249,3199,3149,3099,3050,2999,2950,2899,2799,2749,2699,2599,2549,2499],
    "52821": [3999,3950,3950,3899,3850,3799,3750,3699,3650,3599,3550,3499,3450,3399,3350,3299,3249,3199,3149,3099,3050,2999,2950,2899,2849,2849,2799,2799,2799,2799],
    "67225": [8999,8950,8899,8850,8799,8750,8699,8649,8599,8550,8499,8449,8399,8349,8299,8249,8199,8099,8049,7999,7899,7849,7799,7749,7199,7099,6999,6899,6799,6699],
    "58353": [7299,7250,7199,7150,7099,7050,6999,6950,6899,6850,6799,6750,6699,6699,6650,6649,6649,6649,6599,6599,6549,6549,6499,6499,6499,6449,6449,6449,6449,6449],
    "57821": [5799,5750,5699,5650,5599,5550,5499,5449,5399,5350,5299,5249,5199,5149,5099,5050,4999,4999,4999,4950,4950,4950,4950,4950,4949,4949,4949,4899,4899,4899],
    "58112": [2299,2279,2249,2249,2199,2199,2149,2149,2099,2099,2049,2049,1999,1999,1999,1999,1999,1949,1949,1949,1949,1949,1949,1949,1899,1899,1899,1899,1899,1899],
    "59210": [3499,3449,3399,3349,3299,3249,3199,3149,3099,3049,2999,2999,2999,2950,2950,2950,2950,2899,2899,2899,2899,2849,2849,2849,2849,2849,2849,2849,2799,2799],
    "60110": [2799,2749,2699,2699,2649,2649,2599,2549,2549,2499,2499,2449,2449,2449,2399,2399,2349,2349,2299,2299,2299,2249,2249,2249,2249,2249,2249,2199,2199,2199],
    "60345": [1599,1579,1549,1549,1499,1499,1499,1449,1449,1449,1399,1399,1399,1399,1399,1349,1349,1349,1349,1349,1349,1349,1299,1299,1299,1299,1299,1299,1299,1299],
    "60567": [4299,4249,4199,4199,4149,4149,4099,4049,3999,3999,3949,3899,3849,3799,3799,3749,3749,3749,3699,3699,3699,3699,3649,3649,3649,3649,3649,3599,3599,3599],
    "60789": [2199,2149,2099,2099,2049,2049,1999,1999,1949,1949,1899,1899,1849,1849,1799,1799,1799,1749,1749,1699,1699,1699,1649,1649,1649,1649,1649,1599,1599,1599],
    "60912": [1899,1879,1849,1849,1799,1799,1749,1749,1699,1699,1649,1649,1649,1599,1599,1599,1599,1599,1549,1549,1549,1549,1549,1549,1499,1499,1499,1499,1499,1499],
    "61023": [2299,2249,2249,2199,2199,2149,2099,2099,2049,2049,2049,1999,1999,1999,1949,1949,1899,1899,1899,1849,1849,1849,1849,1849,1799,1799,1799,1799,1799,1799],
  };

  const baseDate = new Date("2026-05-27");
  const prices = staticSeeds[p.id] ?? Array.from({ length: 30 }, (_, i) => {
    const t = i / 29;
    return Math.round(p.oldPrice + (p.price - p.oldPrice) * t);
  });

  const history = prices.map((prix, i) => {
    const d = new Date(baseDate);
    d.setDate(d.getDate() + i);
    const day = `${d.getDate().toString().padStart(2, "0")}/${(d.getMonth() + 1).toString().padStart(2, "0")}`;
    return { day, prix };
  });

  return (
    <main className="min-h-screen">
      {/* Breadcrumb */}
      <div className="mx-auto max-w-7xl px-4 pt-6">
        <nav className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-white/55">
          <Link href="/" className="hover:text-brand-gold">Accueil</Link>
          <ChevronRight className="h-3 w-3" />
          <Link href="/" className="hover:text-brand-gold">Top offres</Link>
          <ChevronRight className="h-3 w-3" />
          <span className="truncate text-slate-800 dark:text-white/80">{p.name}</span>
        </nav>
      </div>

      <section className="mx-auto mt-4 max-w-7xl px-4">
        <div className="grid grid-cols-1 gap-5 lg:grid-cols-[1fr_1fr]">
          {/* LEFT — gallery */}
          <div className="card relative overflow-hidden p-0">
            <div className="relative aspect-square w-full bg-slate-100 dark:bg-gradient-to-br dark:from-white/[0.06] dark:via-white/[0.02] dark:to-transparent">
              <Image
                src={p.image}
                alt={p.name}
                fill
                sizes="(max-width: 1024px) 100vw, 600px"
                className="object-contain p-8"
                unoptimized
                priority
              />
              <span className="absolute left-4 top-4 inline-flex items-center gap-1 rounded-full bg-brand-red px-2.5 py-1 text-[11px] font-bold text-white shadow">
                <BadgePercent className="h-3 w-3" /> −{discountPct}%
              </span>
              <button className="absolute right-4 top-4 flex h-9 w-9 items-center justify-center rounded-full bg-black/20 text-slate-700 backdrop-blur transition hover:bg-black/30 dark:bg-black/40 dark:text-white dark:hover:bg-black/60">
                <Heart className="h-4 w-4" />
              </button>
            </div>
            {/* thumbnail strip */}
            <div className="border-t border-bg-border p-3">
              <div className="flex items-center gap-2">
                {[0, 1, 2, 3].map((i) => (
                  <button
                    key={i}
                    className={`relative h-16 w-16 shrink-0 overflow-hidden rounded-lg border bg-slate-100 dark:bg-gradient-to-br dark:from-white/[0.06] dark:to-white/[0.01] transition ${
                      i === 0 ? "border-brand-gold ring-2 ring-brand-gold/40" : "border-bg-border hover:border-slate-400 dark:hover:border-white/30"
                    }`}
                    aria-label={`Vue ${i + 1}`}
                  >
                    <Image
                      src={p.image}
                      alt=""
                      fill
                      sizes="64px"
                      className="object-contain p-1.5"
                      unoptimized
                    />
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* RIGHT — info & buy */}
          <div className="flex flex-col gap-4">
            {/* title block */}
            <div className="card card-pad">
              <div className="flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-0.5 text-[11px] font-medium text-emerald-600 dark:text-emerald-300">
                  <ShieldCheck className="h-3 w-3" /> En stock
                </span>
                <span className="inline-flex items-center gap-1 rounded-full border border-slate-200 bg-slate-100 px-2.5 py-0.5 text-[11px] text-slate-600 dark:border-white/10 dark:bg-white/5 dark:text-white/70">
                  <Store className="h-3 w-3" /> Vendu par {p.store}
                </span>
                <span className="inline-flex items-center gap-1 text-[11px] text-brand-gold">
                  <Star className="h-3 w-3 fill-current" /> {p.rating} / 5
                </span>
              </div>

              <h1 className="mt-3 text-2xl md:text-3xl font-black leading-tight tracking-tight text-slate-900 dark:text-white">
                {p.name}
              </h1>

              <div className="mt-3 text-[12px] text-slate-400 dark:text-white/55">
                Réf. produit · <span className="tabular-nums text-slate-600 dark:text-white/75">{p.id}</span>
              </div>

              {/* price */}
              <div className="mt-4 rounded-xl border border-brand-gold/30 bg-gradient-to-br from-brand-gold/15 via-brand-gold/5 to-transparent p-4">
                <div className="flex items-baseline gap-3 flex-wrap">
                  <span className="text-4xl font-black tabular-nums text-brand-gold">
                    {p.price.toLocaleString("fr-FR")} DT
                  </span>
                  <span className="text-base text-slate-400 line-through tabular-nums dark:text-white/40">
                    {p.oldPrice.toLocaleString("fr-FR")} DT
                  </span>
                  <span className="inline-flex items-center gap-1 rounded-md bg-brand-red px-2 py-0.5 text-xs font-bold text-white">
                    Économisez {Math.abs(p.discount).toLocaleString("fr-FR")} DT
                  </span>
                </div>
                <div className="mt-1 text-[11px] text-slate-500 dark:text-white/55">
                  Prix le plus bas observé chez {p.store} sur les 30 derniers jours.
                </div>
              </div>

              {/* actions */}
              <div className="mt-4 flex flex-wrap gap-2">
                {p.url && (
                  <a
                    href={p.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn-primary flex-1 justify-center"
                  >
                    <ExternalLink className="h-4 w-4" />
                    Acheter sur {p.store}
                  </a>
                )}
                <button className="btn-gold">
                  <BellRing className="h-4 w-4" />
                  Surveiller le prix
                </button>
              </div>

              {/* trust strip */}
              <div className="mt-4 grid grid-cols-3 gap-2 text-[11px] text-slate-600 dark:text-white/65">
                <div className="flex items-center gap-1.5 rounded-lg border border-bg-border bg-bg-700 px-2 py-1.5 dark:bg-bg-800">
                  <Truck className="h-3.5 w-3.5 text-brand-gold" />
                  Livraison 24-48h
                </div>
                <div className="flex items-center gap-1.5 rounded-lg border border-bg-border bg-bg-700 px-2 py-1.5 dark:bg-bg-800">
                  <ShieldCheck className="h-3.5 w-3.5 text-emerald-500 dark:text-emerald-400" />
                  Garantie officielle
                </div>
                <div className="flex items-center gap-1.5 rounded-lg border border-bg-border bg-bg-700 px-2 py-1.5 dark:bg-bg-800">
                  <Sparkles className="h-3.5 w-3.5 text-brand-gold" />
                  IA vérifié
                </div>
              </div>
            </div>

            {/* AI insight card */}
            <div className="card card-pad relative overflow-hidden border-brand-gold/30">
              <div className="absolute -right-6 -top-6 h-24 w-24 rounded-full bg-brand-gold/20 blur-2xl" />
              <div className="relative flex items-start gap-3">
                <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-gold/15 ring-1 ring-brand-gold/30">
                  <Sparkles className="h-4 w-4 text-brand-gold" />
                </span>
                <div>
                  <div className="text-[11px] font-bold uppercase tracking-wider text-brand-gold">
                    Recommandation IA
                  </div>
                  <div className="mt-1 text-sm text-slate-800 dark:text-white">
                    <span className="font-bold text-emerald-600 dark:text-emerald-400">Acheter maintenant.</span>{" "}
                    Le prix actuel est <span className="font-semibold">{discountPct}%</span> sous
                    la moyenne 30 jours. Probabilité de hausse dans 15 j :{" "}
                    <span className="font-semibold text-red-500 dark:text-red-400">+3.8%</span>.
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Price history */}
        <div className="card card-pad mt-5">
          <div className="mb-2 flex items-center justify-between gap-2">
            <div>
              <div className="section-title">Historique du prix · 30 jours</div>
              <div className="text-[11px] text-slate-500 dark:text-white/55">Scrappé quotidiennement chez {p.store}</div>
            </div>
            <div className="hidden sm:flex items-center gap-2 text-[11px]">
              <span className="inline-flex items-center gap-1 rounded-md bg-slate-100 px-2 py-1 text-slate-600 dark:bg-white/5 dark:text-white/70">
                Min&nbsp;
                <span className="font-bold tabular-nums text-emerald-600 dark:text-emerald-400">
                  {Math.min(...history.map((h) => h.prix)).toLocaleString("fr-FR")} DT
                </span>
              </span>
              <span className="inline-flex items-center gap-1 rounded-md bg-slate-100 px-2 py-1 text-slate-600 dark:bg-white/5 dark:text-white/70">
                Max&nbsp;
                <span className="font-bold tabular-nums text-red-500 dark:text-red-300">
                  {Math.max(...history.map((h) => h.prix)).toLocaleString("fr-FR")} DT
                </span>
              </span>
              <span className="inline-flex items-center gap-1 rounded-md bg-slate-100 px-2 py-1 text-slate-600 dark:bg-white/5 dark:text-white/70">
                Actuel&nbsp;
                <span className="font-bold tabular-nums text-brand-gold">
                  {p.price.toLocaleString("fr-FR")} DT
                </span>
              </span>
            </div>
          </div>
          <PriceHistoryChart data={history} />
        </div>

        {/* Description / specs */}
        <div className="card card-pad mt-5">
          <div className="section-title mb-3">Description</div>
          <p className="text-sm leading-relaxed text-slate-600 dark:text-white/75">
            <span className="font-semibold text-slate-900 dark:text-white">{p.name}</span> — Produit officiel proposé par{" "}
            <span className="font-semibold text-slate-900 dark:text-white">{p.store}</span>. Bénéficiez d'une offre
            exceptionnelle avec une économie immédiate de{" "}
            <span className="font-semibold text-brand-gold">
              {Math.abs(p.discount).toLocaleString("fr-FR")} DT
            </span>{" "}
            par rapport au prix de référence. Notre algorithme suit ce produit en temps réel sur
            l'ensemble des sites e-commerce tunisiens pour vous garantir le meilleur prix.
          </p>

          <div className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-2">
            {[
              ["Boutique", p.store],
              ["Note moyenne", `${p.rating} / 5`],
              ["Statut", "En stock"],
              ["Réduction", `−${discountPct}% (${Math.abs(p.discount).toLocaleString("fr-FR")} DT)`],
              ["Réf. produit", p.id],
              ["Mise à jour", "il y a moins de 1 h"],
            ].map(([k, v]) => (
              <div
                key={k}
                className="flex items-center justify-between rounded-lg border border-bg-border bg-bg-700 px-3 py-2 text-xs dark:bg-bg-800"
              >
                <span className="text-slate-500 dark:text-white/55">{k}</span>
                <span className="font-semibold text-slate-900 dark:text-white">{v}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Similar products */}
        <div className="mt-5">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="section-title">Produits similaires</h2>
            <Link href="/" className="text-xs font-medium text-brand-gold hover:underline">
              Voir tout
            </Link>
          </div>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
            {similar.map((s) => (
              <Link
                key={s.id}
                href={`/produit/${s.id}`}
                className="card group relative overflow-hidden p-3 transition hover:-translate-y-0.5 hover:border-slate-300 dark:hover:border-white/20"
              >
                <span className="absolute right-3 top-3 z-10 rounded-md bg-brand-red px-2 py-0.5 text-[11px] font-bold text-white shadow">
                  {s.discount} DT
                </span>
                <div className="relative h-32 w-full overflow-hidden rounded-xl bg-slate-100 ring-1 ring-inset ring-slate-200 dark:bg-gradient-to-br dark:from-white/[0.06] dark:to-white/[0.01] dark:ring-white/5">
                  <Image
                    src={s.image}
                    alt={s.name}
                    fill
                    sizes="240px"
                    className="object-contain p-2 transition group-hover:scale-105"
                    unoptimized
                  />
                </div>
                <h3 className="mt-2 line-clamp-2 h-10 text-xs font-semibold text-slate-900 dark:text-white">{s.name}</h3>
                <div className="mt-1 flex items-baseline gap-2">
                  <span className="text-base font-extrabold text-brand-gold tabular-nums">
                    {s.price.toLocaleString("fr-FR")} DT
                  </span>
                  <span className="text-[10px] text-slate-400 line-through tabular-nums dark:text-white/40">
                    {s.oldPrice.toLocaleString("fr-FR")} DT
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Back link */}
        <div className="mt-6 mb-10">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 transition hover:text-brand-gold dark:text-white/70"
          >
            <ArrowLeft className="h-4 w-4" />
            Retour à l'accueil
          </Link>
        </div>
      </section>
    </main>
  );
}
