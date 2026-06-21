"use client";
import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { ChevronRight, Search, Store, X } from "lucide-react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Reveal } from "@/components/site/Reveal";

type Shop = {
  slug: string;
  key: string;
  name: string;
  logo: string | null;
  count: number;
  categories: string[];
};

function normKey(s: string) {
  return s.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "");
}

export default function BoutiquesPage() {
  const [shops, setShops]     = useState<Shop[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch]   = useState("");

  useEffect(() => {
    fetch("/api/catalog/shops")
      .then(r => r.json())
      .then(d => setShops(d.shops ?? []))
      .finally(() => setLoading(false));
  }, []);

  const q = normKey(search.trim());
  const filtered = useMemo(
    () => shops.filter(s => !q || normKey(s.name).includes(q) || s.categories.some(c => normKey(c).includes(q))),
    [shops, q]
  );

  const totalProducts = useMemo(() => shops.reduce((s, x) => s + x.count, 0), [shops]);

  return (
    <main className="min-h-screen bg-white dark:bg-[#0a0e1a]">
      <Header />

      {/* ── Breadcrumb ──────────────────────────────────────────────────── */}
      <div className="mx-auto max-w-[1600px] px-4 pt-5">
        <nav className="mb-4 flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-400 dark:text-white/40">
          <Link href="/" className="transition-colors hover:text-brand-gold">Accueil</Link>
          <ChevronRight className="h-3 w-3 opacity-60" />
          <span className="text-brand-gold">Boutiques</span>
        </nav>

        {/* ── Hero ────────────────────────────────────────────────────────── */}
        <Reveal>
          <div className="relative overflow-hidden rounded-3xl border border-slate-200 bg-white p-7 sm:p-10 dark:border-white/[0.07] dark:bg-[#0d1220]">
            <div className="pointer-events-none absolute -left-16 -top-20 h-64 w-64 rounded-full bg-brand-gold/15 blur-3xl" />
            <div className="pointer-events-none absolute -right-10 top-0 h-56 w-56 rounded-full bg-blue-500/[0.10] blur-3xl" />
            <div className="pointer-events-none absolute inset-0 opacity-[0.04] [background-image:linear-gradient(rgba(120,120,120,0.5)_1px,transparent_1px),linear-gradient(90deg,rgba(120,120,120,0.5)_1px,transparent_1px)] [background-size:34px_34px]" />

            <div className="relative flex flex-col gap-7 md:flex-row md:items-center md:justify-between">
              <div className="max-w-xl">
                <span className="mb-4 inline-flex items-center gap-1.5 rounded-full border border-brand-gold/30 bg-brand-gold/10 px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-brand-gold">
                  <Store className="h-3 w-3" /> Annuaire des boutiques
                </span>
                <h1 className="text-3xl font-black leading-tight tracking-tight text-slate-900 sm:text-[2.6rem] dark:text-white">
                  Toutes les <span className="gradient-text-gold">boutiques</span>
                </h1>
                <p className="mt-2 font-arabic text-base text-slate-500 dark:text-white/50" dir="rtl">
                  تصفّح كامل كاطالوج كل حانوت
                </p>
                <p className="mt-3 max-w-md text-[15px] leading-relaxed text-slate-600 dark:text-white/65">
                  Choisissez une enseigne et parcourez l’intégralité de son catalogue —
                  prix, stock et fiches produits scrappés en continu.
                </p>
              </div>

              <div className="flex shrink-0 gap-3">
                {[
                  { label: "Boutiques", value: loading ? "—" : String(shops.length), cls: "border-brand-gold/25 bg-brand-gold/[0.08] text-brand-gold" },
                  { label: "Produits",  value: loading ? "—" : totalProducts.toLocaleString("fr-FR"), cls: "border-blue-400/25 bg-blue-400/[0.08] text-blue-500 dark:text-blue-300" },
                ].map(c => (
                  <div key={c.label} className={`flex min-w-[120px] flex-col gap-1 rounded-2xl border px-4 py-3 backdrop-blur-sm ${c.cls}`}>
                    <Store className="h-4 w-4 opacity-80" />
                    <div className="text-2xl font-black tabular-nums leading-none">{c.value}</div>
                    <div className="text-[10px] font-semibold uppercase tracking-wider opacity-80">{c.label}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </Reveal>
      </div>

      {/* ── Search ──────────────────────────────────────────────────────────── */}
      <div className="sticky top-[68px] z-30 mx-auto mt-6 max-w-[1600px] px-4">
        <div className="rounded-2xl border border-slate-200/80 bg-white/85 p-2 shadow-sm backdrop-blur-md dark:border-white/[0.07] dark:bg-[#0d1220]/85">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400 dark:text-white/30" />
            <label htmlFor="shop-search" className="sr-only">Rechercher une boutique</label>
            <input
              id="shop-search"
              type="search"
              placeholder="Rechercher une boutique…"
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full rounded-xl border border-transparent bg-slate-50 py-2.5 pl-10 pr-9 text-sm text-slate-900 placeholder:text-slate-400 outline-none transition focus:border-brand-gold/50 focus:bg-white focus:ring-2 focus:ring-brand-gold/20 dark:bg-white/[0.04] dark:text-white dark:placeholder:text-white/30"
            />
            {search && (
              <button onClick={() => setSearch("")} aria-label="Effacer"
                className="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer text-slate-400 hover:text-slate-600 dark:text-white/30 dark:hover:text-white/60">
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* ── Shops grid ──────────────────────────────────────────────────────── */}
      <section className="mx-auto mt-6 max-w-[1600px] px-4 pb-16">
        {loading ? (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
            {Array.from({ length: 15 }).map((_, i) => (
              <div key={i} className="h-44 animate-pulse rounded-2xl bg-slate-100 dark:bg-white/[0.04]" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="py-24 text-center">
            <Store className="mx-auto mb-4 h-10 w-10 text-slate-300 dark:text-white/20" />
            <p className="font-bold text-slate-700 dark:text-white/80">Aucune boutique trouvée</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
            {filtered.map((shop, i) => (
              <Reveal key={shop.slug} delay={Math.min(i, 12) * 0.03}>
                <Link
                  href={`/boutiques/${shop.slug}`}
                  aria-label={`${shop.name} — voir le catalogue`}
                  className="group flex h-full cursor-pointer flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white transition-all duration-300 hover:-translate-y-1 hover:border-brand-gold/40 hover:shadow-[0_18px_40px_-12px_rgba(0,0,0,0.18)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-gold/60 dark:border-white/[0.07] dark:bg-white/[0.02] dark:hover:shadow-[0_18px_44px_-12px_rgba(0,0,0,0.6)]"
                >
                  {/* logo panel — letter tile sits underneath; logo img hides
                      itself on error (broken/missing Clearbit logo) */}
                  <div className="relative flex h-28 items-center justify-center overflow-hidden border-b border-slate-100 bg-white dark:border-white/[0.06]">
                    <div className="pointer-events-none absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-black/[0.03] to-transparent transition-transform duration-700 group-hover:translate-x-full dark:via-white/[0.06] motion-reduce:hidden" />
                    <span className="absolute flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-brand-gold/20 to-brand-gold/5 text-xl font-black text-brand-gold">
                      {shop.name.charAt(0).toUpperCase()}
                    </span>
                    {shop.logo && (
                      <img src={shop.logo} alt={shop.name}
                        className="relative max-h-16 max-w-[70%] bg-white object-contain transition-transform duration-500 group-hover:scale-110 motion-reduce:group-hover:scale-100"
                        loading="lazy"
                        onError={e => { (e.currentTarget as HTMLImageElement).style.display = "none"; }}
                      />
                    )}
                  </div>

                  {/* info */}
                  <div className="flex flex-1 flex-col p-3.5">
                    <h3 className="truncate text-[14px] font-black text-slate-900 dark:text-white">{shop.name}</h3>
                    <div className="mt-1 flex items-center gap-1.5 text-[11px] text-slate-500 dark:text-white/45">
                      <Store className="h-3 w-3" />
                      <span className="tabular-nums font-semibold">{shop.count.toLocaleString("fr-FR")}</span>
                      produit{shop.count > 1 ? "s" : ""}
                    </div>

                    {shop.categories.length > 0 && (
                      <div className="mt-2.5 flex flex-wrap gap-1">
                        {shop.categories.slice(0, 3).map(c => (
                          <span key={c} className="truncate rounded-md bg-slate-100 px-1.5 py-0.5 text-[9px] font-semibold text-slate-500 dark:bg-white/[0.06] dark:text-white/50">
                            {c}
                          </span>
                        ))}
                      </div>
                    )}

                    <div className="mt-auto pt-3 flex items-center justify-between">
                      <span className="text-[10px] font-bold text-brand-gold">Voir le catalogue</span>
                      <ChevronRight className="h-3.5 w-3.5 text-brand-gold transition group-hover:translate-x-0.5" />
                    </div>
                  </div>
                </Link>
              </Reveal>
            ))}
          </div>
        )}
      </section>

      <Footer />
    </main>
  );
}
