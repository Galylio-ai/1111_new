"use client";
import { Suspense, useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useSearchParams } from "next/navigation";
import { ArrowRight, ChevronRight, Loader2, Search, Store, X } from "lucide-react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";

type Product = {
  slug: string;
  name: string;
  brand: string;
  img: string;
  img2?: string | null;
  images?: string[];
  price: number | null;
  oldPrice: number | null;
  available: boolean | null;
  category: string | null;
  discount: number | null;
};
type Category = { name: string; count: number };

const LIMIT = 24;
const fmt = (n: number) => n.toLocaleString("fr-FR", { minimumFractionDigits: 0, maximumFractionDigits: 3 });

function ShopCatalogInner() {
  const { shop } = useParams<{ shop: string }>();
  const searchParams = useSearchParams();

  const [shopName, setShopName]   = useState("");
  const [shopLogo, setShopLogo]   = useState<string | null>(null);
  const [products, setProducts]   = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [total, setTotal]         = useState(0);
  const [page, setPage]           = useState(0);
  const [loading, setLoading]     = useState(true);
  const [activeCat, setActiveCat] = useState(searchParams.get("cat") ?? "");
  const [search, setSearch]       = useState("");
  const [query, setQuery]         = useState("");

  const fetchProducts = useCallback(async (p: number, q: string, cat: string) => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ shop, page: String(p), limit: String(LIMIT) });
      if (q)   params.set("q", q);
      if (cat) params.set("cat", cat);
      const res  = await fetch(`/api/catalog/products?${params}`);
      const data = await res.json();
      setShopName(data.shop ?? shop);
      if (data.logo !== undefined) setShopLogo(data.logo);
      setProducts(data.items ?? []);
      setTotal(data.total ?? 0);
      if (data.categories) setCategories(data.categories);
    } finally {
      setLoading(false);
    }
  }, [shop]);

  useEffect(() => { setPage(0); fetchProducts(0, query, activeCat); }, [query, activeCat, fetchProducts]);
  useEffect(() => { fetchProducts(page, query, activeCat); }, [page]); // eslint-disable-line
  useEffect(() => { const t = setTimeout(() => setQuery(search), 350); return () => clearTimeout(t); }, [search]);

  const totalPages = Math.ceil(total / LIMIT);

  return (
    <main className="min-h-screen bg-white dark:bg-[#0a0e1a]">
      <Header />

      {/* ── Breadcrumb ──────────────────────────────────────────────────── */}
      <div className="mx-auto max-w-[1600px] px-4 pt-5">
        <nav className="mb-4 flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-400 dark:text-white/40">
          <Link href="/" className="transition-colors hover:text-brand-gold">Accueil</Link>
          <ChevronRight className="h-3 w-3 opacity-60" />
          <Link href="/boutiques" className="transition-colors hover:text-brand-gold">Boutiques</Link>
          <ChevronRight className="h-3 w-3 opacity-60" />
          <span className="text-brand-gold capitalize">{shopName || shop}</span>
        </nav>

        {/* ── Hero ────────────────────────────────────────────────────────── */}
        <div className="relative overflow-hidden rounded-3xl border border-slate-200 bg-white p-6 sm:p-8 dark:border-white/[0.07] dark:bg-[#0d1220]">
          <div className="pointer-events-none absolute -left-12 -top-16 h-56 w-56 rounded-full bg-brand-gold/12 blur-3xl" />
          <div className="relative flex items-center gap-4">
            {/* logo on a clean white tile; gold letter-tile shows only if no logo */}
            <span className="relative flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-white p-2 shadow-sm ring-1 ring-black/5">
              {/* fallback letter (behind) */}
              <span className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-brand-gold/20 to-brand-gold/5 text-2xl font-black text-brand-gold">
                {(shopName || shop).charAt(0).toUpperCase()}
              </span>
              {shopLogo && (
                <img
                  src={shopLogo}
                  alt={shopName || shop}
                  className="relative z-10 max-h-full max-w-full bg-white object-contain"
                  onError={e => { (e.currentTarget as HTMLImageElement).style.display = "none"; }}
                />
              )}
            </span>
            <div>
              <h1 className="text-2xl font-black capitalize tracking-tight text-slate-900 sm:text-3xl dark:text-white">
                {shopName || shop}
              </h1>
              <p className="mt-1 flex items-center gap-1.5 text-sm text-slate-500 dark:text-white/55">
                <Store className="h-3.5 w-3.5" />
                <span className="tabular-nums font-semibold text-slate-700 dark:text-white/80">{total.toLocaleString("fr-FR")}</span>
                produits au catalogue
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* ── Search + categories ───────────────────────────────────────────── */}
      <div className="sticky top-[68px] z-30 mx-auto mt-6 max-w-[1600px] px-4">
        <div className="rounded-2xl border border-slate-200/80 bg-white/85 p-2 shadow-sm backdrop-blur-md dark:border-white/[0.07] dark:bg-[#0d1220]/85">
          <div className="flex items-center gap-3">
            <div className="relative flex-1">
              <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400 dark:text-white/30" />
              <label htmlFor="prod-search" className="sr-only">Rechercher un produit</label>
              <input
                id="prod-search"
                type="search"
                placeholder="Titre, SKU ou référence produit…"
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
            <span className="shrink-0 pr-2 text-xs font-semibold text-slate-500 dark:text-white/45 tabular-nums">
              {total.toLocaleString("fr-FR")}
            </span>
          </div>

          {/* category pills */}
          {categories.length > 0 && (
            <div className="mt-2 flex gap-1.5 overflow-x-auto px-1 pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
              <button
                onClick={() => setActiveCat("")}
                className={`shrink-0 cursor-pointer rounded-full px-3 py-1 text-xs font-semibold transition ${
                  !activeCat ? "bg-brand-gold text-black" : "bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-white/[0.05] dark:text-white/65 dark:hover:bg-white/10"
                }`}
              >
                Tout
              </button>
              {categories.map(c => (
                <button
                  key={c.name}
                  onClick={() => setActiveCat(activeCat === c.name ? "" : c.name)}
                  className={`shrink-0 cursor-pointer rounded-full px-3 py-1 text-xs font-semibold transition ${
                    activeCat === c.name ? "bg-brand-gold text-black" : "bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-white/[0.05] dark:text-white/65 dark:hover:bg-white/10"
                  }`}
                >
                  {c.name} <span className="opacity-50 tabular-nums">{c.count}</span>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ── Products grid ─────────────────────────────────────────────────── */}
      <section className="mx-auto mt-5 max-w-[1600px] px-4 pb-16">
        {loading ? (
          <div className="flex items-center justify-center py-24">
            <Loader2 className="h-8 w-8 animate-spin text-brand-gold" />
          </div>
        ) : products.length === 0 ? (
          <div className="py-24 text-center text-slate-400 dark:text-white/40">
            <Search className="mx-auto mb-4 h-10 w-10 opacity-50" />
            <p className="font-semibold">Aucun produit trouvé</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6">
            {products.map((p, i) => (
              <Link
                key={p.slug + i}
                href={`/boutiques/${shop}/${p.slug}`}
                className="card group relative flex flex-col overflow-hidden p-0 transition-all duration-300 hover:-translate-y-1 hover:border-brand-gold/40 hover:shadow-lg"
              >
                {p.discount && p.discount > 0 && (
                  <span className="absolute right-2.5 top-2.5 z-10 rounded-full bg-brand-red px-2.5 py-1 text-[10px] font-black text-white shadow-md">
                    −{p.discount}%
                  </span>
                )}
                {p.available === false && (
                  <span className="absolute left-2.5 top-2.5 z-10 rounded-full bg-slate-700/80 px-2 py-0.5 text-[9px] font-bold uppercase text-white backdrop-blur">
                    Rupture
                  </span>
                )}

                <div className="relative flex h-44 w-full items-center justify-center overflow-hidden bg-gradient-to-b from-slate-50 to-slate-100 dark:from-white/[0.06] dark:to-white/[0.02]">
                  <span className="absolute text-4xl opacity-60">🛍️</span>
                  {p.img && (
                    <img src={p.img} alt={p.name}
                      className={`relative z-10 h-full w-full object-contain p-2 transition-all duration-500 group-hover:scale-105 ${p.img2 ? "group-hover:opacity-0" : ""}`}
                      loading="lazy"
                      referrerPolicy="no-referrer"
                      onError={e => { (e.currentTarget as HTMLImageElement).style.visibility = "hidden"; }}
                    />
                  )}
                  {p.img2 && (
                    <img src={p.img2} alt=""
                      className="absolute inset-0 z-20 h-full w-full object-contain p-2 opacity-0 transition-opacity duration-500 group-hover:opacity-100"
                      loading="lazy"
                      referrerPolicy="no-referrer"
                      onError={e => { (e.currentTarget as HTMLImageElement).style.display = "none"; }}
                    />
                  )}
                </div>

                <div className="flex flex-1 flex-col p-3.5">
                  {p.brand && <div className="mb-1 truncate text-[12.5px] font-extrabold uppercase tracking-wider text-brand-gold transition-transform duration-300 group-hover:translate-x-0.5">{p.brand}</div>}
                  <h3 className="text-[12.5px] font-bold leading-snug text-slate-900 line-clamp-2 dark:text-white">{p.name}</h3>

                  <div className="mt-auto pt-2.5">
                    <div className="flex items-baseline gap-2">
                      {p.price != null ? (
                        <span className="text-lg font-black text-brand-gold tabular-nums">
                          {fmt(p.price)} <span className="text-[11px] font-bold">DT</span>
                        </span>
                      ) : (
                        <span className="text-sm font-semibold text-slate-400">Prix N/C</span>
                      )}
                      {p.oldPrice && p.price && p.oldPrice > p.price && (
                        <span className="text-[11px] text-slate-400 line-through dark:text-white/35 tabular-nums">{fmt(p.oldPrice)} DT</span>
                      )}
                    </div>
                    <div className="mt-2 flex items-center justify-between rounded-xl bg-slate-50 px-2.5 py-1.5 dark:bg-white/[0.04]">
                      <span className="text-[10px] font-semibold text-brand-gold">Voir le produit</span>
                      <ArrowRight className="h-3 w-3 text-brand-gold transition group-hover:translate-x-0.5" />
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}

        {/* ── Pagination ────────────────────────────────────────────────── */}
        {!loading && totalPages > 1 && (
          <div className="mt-10 flex items-center justify-center gap-2 flex-wrap">
            <button onClick={() => setPage(p => Math.max(0, p - 1))} disabled={page === 0}
              className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-brand-gold/40 disabled:opacity-40 dark:border-white/10 dark:bg-white/[0.04] dark:text-white">← Précédent</button>
            {Array.from({ length: totalPages }).map((_, idx) => {
              if (idx !== 0 && idx !== totalPages - 1 && Math.abs(idx - page) > 2) return null;
              if (Math.abs(idx - page) === 3) return <span key={idx} className="text-slate-400 dark:text-white/30">…</span>;
              return (
                <button key={idx} onClick={() => setPage(idx)}
                  className={`h-9 w-9 rounded-xl text-sm font-bold transition ${page === idx ? "bg-brand-gold text-black shadow" : "border border-slate-200 bg-white text-slate-700 hover:border-brand-gold/40 dark:border-white/10 dark:bg-white/[0.04] dark:text-white"}`}>
                  {idx + 1}
                </button>
              );
            })}
            <button onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))} disabled={page === totalPages - 1}
              className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-brand-gold/40 disabled:opacity-40 dark:border-white/10 dark:bg-white/[0.04] dark:text-white">Suivant →</button>
            <span className="ml-2 text-xs text-slate-400 dark:text-white/40 tabular-nums">Page {page + 1} / {totalPages}</span>
          </div>
        )}
      </section>

      <Footer />
    </main>
  );
}

export default function ShopCatalogPage() {
  return (
    <Suspense
      fallback={
        <main className="min-h-screen bg-white dark:bg-[#0a0e1a]">
          <Header />
          <div className="flex items-center justify-center py-40">
            <Loader2 className="h-8 w-8 animate-spin text-brand-gold" />
          </div>
          <Footer />
        </main>
      }
    >
      <ShopCatalogInner />
    </Suspense>
  );
}
