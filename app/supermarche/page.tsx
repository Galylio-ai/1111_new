"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import {
  ArrowRight, ChevronDown, ChevronRight, Loader2, Scale, Search, ShoppingCart, Tag, X,
} from "lucide-react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Reveal } from "@/components/site/Reveal";

type Product = {
  name: string;
  brand: string;
  img: string;
  minPrice: number;
  maxPrice: number;
  shopNames: string[];
  discount: number | null;
};

/* ── Shops ───────────────────────────────────────────────────────────────── */
const shops = [
  { key: "aziza",             name: "Aziza",             count: 17982, color: "bg-green-600",  imgs: ["https://clusteraz.flesk.fr/images/100013251.jpg","https://clusteraz.flesk.fr/images/100013271.jpg","https://clusteraz.flesk.fr/images/100009532.jpg","https://clusteraz.flesk.fr/images/100003869.jpg"] },
  { key: "carrefour",         name: "Carrefour",         count: 26069, color: "bg-blue-600",   imgs: ["https://www.carrefour.tn/gel-machine-clean-power-5l-6192477622435-1.html/","https://cdn.monoprix.tn/ennasr/163018-home_default/nectar.jpg","https://www.geantdrive.tn/tunis-city/1320846-home_default/lot-shampooing.jpg","https://cdn.monoprix.tn/ennasr/178113-home_default/lessive-machine.jpg"] },
  { key: "geant",             name: "Géant",             count: 34412, color: "bg-red-600",    imgs: ["https://www.geantdrive.tn/tunis-city/1320846-home_default/lot-shampooing.jpg","https://www.geantdrive.tn/tunis-city/1320847-home_default/lot-shampooing.jpg","https://www.geantdrive.tn/tunis-city/178113-home_default/lessive.jpg","https://www.geantdrive.tn/tunis-city/163018-home_default/nectar.jpg"] },
  { key: "monoprix",          name: "Monoprix",          count: 12582, color: "bg-orange-500", imgs: ["https://cdn.monoprix.tn/ennasr/178113-home_default/lessive-machine.jpg","https://cdn.monoprix.tn/ennasr/163018-home_default/nectar.jpg","https://cdn.monoprix.tn/ennasr/100003869-home_default/produit.jpg","https://cdn.monoprix.tn/ennasr/100009532-home_default/produit.jpg"] },
  { key: "carrefour market",  name: "Carrefour Market",  count: 5049,  color: "bg-sky-600",    imgs: ["https://cdn.monoprix.tn/ennasr/178113-home_default/lessive-machine.jpg","https://cdn.monoprix.tn/ennasr/163018-home_default/nectar.jpg","https://clusteraz.flesk.fr/images/100013251.jpg","https://clusteraz.flesk.fr/images/100003869.jpg"] },
  { key: "carrefour express", name: "Carrefour Express", count: 3779,  color: "bg-indigo-500", imgs: ["https://cdn.monoprix.tn/ennasr/163018-home_default/nectar.jpg","https://cdn.monoprix.tn/ennasr/178113-home_default/lessive-machine.jpg","https://clusteraz.flesk.fr/images/100013271.jpg","https://clusteraz.flesk.fr/images/100009532.jpg"] },
];

/* ── Custom Dropdown ─────────────────────────────────────────────────────── */
function Dropdown({ value, onChange, options, placeholder }: {
  value: string; onChange: (v: string) => void;
  options: { value: string; label: string }[]; placeholder: string;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const selected = options.find(o => o.value === value);

  useEffect(() => {
    const h = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false); };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);

  return (
    <div ref={ref} className="relative">
      <button type="button" onClick={() => setOpen(o => !o)}
        className="flex h-[42px] min-w-[170px] items-center justify-between gap-2 rounded-xl border border-slate-300 bg-white px-3 text-sm font-semibold text-slate-700 outline-none transition hover:border-brand-gold/40 dark:border-white/10 dark:bg-white/[0.06] dark:text-white">
        <span className={selected ? "" : "text-slate-400 dark:text-white/35"}>{selected ? selected.label : placeholder}</span>
        <ChevronDown className={`h-3.5 w-3.5 shrink-0 transition-transform text-slate-400 dark:text-white/40 ${open ? "rotate-180" : ""}`} />
      </button>
      {open && (
        <div className="absolute left-0 top-[46px] z-50 min-w-full overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xl dark:border-white/10 dark:bg-[#0f1422]">
          <button type="button" onClick={() => { onChange(""); setOpen(false); }}
            className={`w-full px-4 py-2.5 text-left text-sm transition hover:bg-slate-50 dark:hover:bg-white/[0.06] ${!value ? "font-bold text-brand-gold" : "text-slate-500 dark:text-white/50"}`}>
            {placeholder}
          </button>
          {options.map(o => (
            <button key={o.value} type="button" onClick={() => { onChange(o.value); setOpen(false); }}
              className={`w-full px-4 py-2.5 text-left text-sm transition hover:bg-slate-50 dark:hover:bg-white/[0.06] ${value === o.value ? "font-bold text-brand-gold bg-brand-gold/5" : "text-slate-700 dark:text-white/80"}`}>
              {o.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

const LIMIT = 24;

export default function SupermarchePage() {
  const [products, setProducts]     = useState<Product[]>([]);
  const [total, setTotal]           = useState(0);
  const [page, setPage]             = useState(0);
  const [loading, setLoading]       = useState(false);
  const [activeShop, setActiveShop] = useState("");
  const [search, setSearch]         = useState("");
  const [query, setQuery]           = useState("");

  const fetchProducts = useCallback(async (p: number, q: string, shop: string) => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: String(p), limit: String(LIMIT) });
      if (q)    params.set("q", q);
      if (shop) params.set("shop", shop);
      const res  = await fetch(`/api/super-products?${params}`);
      const data = await res.json();
      setProducts(data.items ?? []);
      setTotal(data.total ?? 0);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchProducts(0, "", ""); }, [fetchProducts]);

  useEffect(() => {
    setPage(0);
    fetchProducts(0, query, activeShop);
  }, [activeShop, query, fetchProducts]);

  useEffect(() => { fetchProducts(page, query, activeShop); }, [page]); // eslint-disable-line

  useEffect(() => {
    const t = setTimeout(() => setQuery(search), 350);
    return () => clearTimeout(t);
  }, [search]);

  const totalPages = Math.ceil(total / LIMIT);

  return (
    <main className="min-h-screen bg-white dark:bg-[#0a0e1a]">
      <Header />

      {/* ── Breadcrumb ──────────────────────────────────────────────────── */}
      <div className="mx-auto max-w-[1600px] px-4 pt-5">
        <nav className="mb-4 flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-400 dark:text-white/40">
          <Link href="/" className="transition hover:text-brand-gold">Accueil</Link>
          <ChevronRight className="h-3 w-3 opacity-60" />
          <span className="text-brand-gold">Supermarché</span>
        </nav>

        {/* ── Hero ──────────────────────────────────────────────────────── */}
        <Reveal>
          <div className="relative overflow-hidden rounded-2xl border border-slate-200 bg-gradient-to-br from-slate-50 via-white to-emerald-50/30 p-6 sm:p-8 dark:border-white/5 dark:from-[#0f1422] dark:via-[#0f1422] dark:to-[#0f1a14]">
            <div className="pointer-events-none absolute -left-12 -top-12 h-56 w-56 rounded-full bg-emerald-500/10 blur-3xl" />
            <div className="pointer-events-none absolute right-0 top-0 h-48 w-48 rounded-full bg-brand-gold/8 blur-3xl" />
            <div className="relative flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
              <div className="flex items-start gap-4">
                <span className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-400/25 to-green-500/10 ring-1 ring-emerald-400/30 shadow-[0_0_30px_-8px_rgba(16,185,129,0.4)]">
                  <ShoppingCart className="h-8 w-8 text-emerald-500 dark:text-emerald-400" strokeWidth={1.8} />
                </span>
                <div>
                  <h1 className="text-3xl font-black tracking-tight text-slate-900 sm:text-4xl dark:text-white">
                    Super<span className="gradient-text-gold">marché</span>
                  </h1>
                  <p className="mt-1 font-arabic text-base text-slate-500 dark:text-white/50" dir="rtl">
                    السوبرماركت — قارن أسعار المواد الغذائية
                  </p>
                  <p className="mt-2 max-w-xl text-sm leading-relaxed text-slate-600 dark:text-white/65">
                    Comparez les prix de <span className="font-bold text-slate-900 dark:text-white">69 003</span> produits alimentaires sur{" "}
                    <span className="font-bold text-slate-900 dark:text-white">6 enseignes</span> tunisiennes.
                  </p>
                </div>
              </div>
              <div className="flex flex-wrap gap-2 shrink-0">
                {[
                  { label: "Produits",  value: "69 003", cls: "border-brand-gold/25 bg-brand-gold/10 text-brand-gold" },
                  { label: "Enseignes", value: "6",      cls: "border-emerald-500/25 bg-emerald-500/10 text-emerald-600 dark:text-emerald-300" },
                ].map(c => (
                  <div key={c.label} className={`rounded-xl border px-4 py-2.5 ${c.cls}`}>
                    <div className="text-xl font-black tabular-nums leading-none">{c.value}</div>
                    <div className="mt-0.5 text-[10px] uppercase tracking-wider opacity-80">{c.label}</div>
                  </div>
                ))}
              </div>
            </div>
            <div className="mt-6 h-px w-full bg-gradient-to-r from-transparent via-brand-gold/35 to-transparent" />
          </div>
        </Reveal>
      </div>

      {/* ── Shops ─────────────────────────────────────────────────────────── */}
      <section className="mx-auto mt-10 max-w-[1600px] px-4">
        <Reveal>
          <h2 className="mb-5 text-lg font-black text-slate-900 dark:text-white">
            Enseignes <span className="gradient-text-gold">supermarché</span>
          </h2>
        </Reveal>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
          {shops.map((shop, i) => (
            <Reveal key={shop.key} delay={i * 0.05}>
              <button
                onClick={() => setActiveShop(activeShop === shop.key ? "" : shop.key)}
                className={`group w-full overflow-hidden rounded-2xl border transition hover:-translate-y-0.5 ${
                  activeShop === shop.key
                    ? "border-brand-gold/60 shadow-[0_0_16px_-4px_rgba(246,196,83,0.5)]"
                    : "border-slate-200 dark:border-white/[0.06]"
                }`}
              >
                <div className={`flex h-14 items-center justify-center rounded-t-2xl text-lg font-black text-white ${shop.color}`}>
                  {shop.name.slice(0, 2).toUpperCase()}
                </div>
                <div className="bg-white px-2 py-2 dark:bg-white/[0.025]">
                  <div className="text-[11px] font-bold text-slate-800 dark:text-white truncate">{shop.name}</div>
                  <div className="text-[10px] text-slate-400 dark:text-white/40 tabular-nums">{shop.count.toLocaleString("fr-FR")} produits</div>
                </div>
                {activeShop === shop.key && <div className="h-0.5 w-full bg-brand-gold" />}
              </button>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ── Search + filters ──────────────────────────────────────────────── */}
      <section className="mx-auto mt-8 max-w-[1600px] px-4">
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative flex-1 min-w-[180px]">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400 dark:text-white/30" />
            <input
              type="search"
              placeholder="Rechercher un produit ou une marque…"
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full rounded-xl border border-slate-300 bg-white py-2.5 pl-9 pr-9 text-sm text-slate-900 placeholder:text-slate-400 outline-none transition focus:border-brand-gold/50 focus:ring-2 focus:ring-brand-gold/20 dark:border-white/10 dark:bg-white/[0.04] dark:text-white dark:placeholder:text-white/30"
            />
            {search && (
              <button onClick={() => setSearch("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:text-white/30 dark:hover:text-white/60">
                <X className="h-4 w-4" />
              </button>
            )}
          </div>

          <Dropdown
            value={activeShop}
            onChange={setActiveShop}
            placeholder="Tous les magasins"
            options={shops.map(s => ({ value: s.key, label: s.name }))}
          />

          {(activeShop || search) && (
            <button onClick={() => { setActiveShop(""); setSearch(""); }}
              className="flex items-center gap-1.5 rounded-xl border border-slate-300 bg-slate-100 px-3 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-200 dark:border-white/10 dark:bg-white/[0.06] dark:text-white/60 dark:hover:bg-white/[0.1]">
              Réinitialiser <X className="h-3 w-3" />
            </button>
          )}

          <span className="ml-auto text-sm text-slate-500 dark:text-white/40 shrink-0 tabular-nums">
            {total.toLocaleString("fr-FR")} produit{total > 1 ? "s" : ""}
          </span>
        </div>
      </section>

      {/* ── Products grid ─────────────────────────────────────────────────── */}
      <section className="mx-auto mt-5 max-w-[1600px] px-4">
        {loading ? (
          <div className="flex items-center justify-center py-24">
            <Loader2 className="h-8 w-8 animate-spin text-brand-gold" />
          </div>
        ) : products.length === 0 ? (
          <div className="py-24 text-center text-slate-400 dark:text-white/40">
            <div className="text-5xl mb-4">🔍</div>
            <p className="font-semibold">Aucun produit trouvé</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6">
            {products.map((p, i) => {
              const savings = p.maxPrice - p.minPrice;
              return (
                <div key={p.name + i}
                  className="group flex h-full flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white transition hover:-translate-y-1 hover:border-slate-300 hover:shadow-[0_8px_30px_-8px_rgba(0,0,0,0.12)] dark:border-white/[0.06] dark:bg-white/[0.025] dark:hover:border-white/[0.12]">
                  <div className="relative overflow-hidden bg-slate-50 dark:bg-white/[0.04]" style={{ aspectRatio: "1/1" }}>
                    {p.img ? (
                      <img src={p.img} alt={p.name}
                        className="h-full w-full object-contain p-3 transition duration-500 group-hover:scale-105"
                        loading="lazy"
                        onError={e => { (e.target as HTMLImageElement).style.display = "none"; }}
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center text-3xl">🛒</div>
                    )}
                    {p.discount && p.discount > 0 && (
                      <span className="absolute left-2 top-2 flex items-center gap-0.5 rounded-full bg-brand-red px-2 py-0.5 text-[10px] font-black text-white shadow">
                        <Tag className="h-2.5 w-2.5" />−{p.discount}%
                      </span>
                    )}
                    <span className="absolute right-2 top-2 rounded-full border border-slate-200 bg-white/90 px-2 py-0.5 text-[10px] font-semibold text-slate-600 dark:border-white/10 dark:bg-black/60 dark:text-white/70 backdrop-blur-sm">
                      {p.shopNames.length} magasin{p.shopNames.length > 1 ? "s" : ""}
                    </span>
                  </div>

                  <div className="flex flex-1 flex-col p-3">
                    {p.brand && (
                      <div className="mb-1 text-[10px] font-semibold uppercase tracking-wider text-slate-400 dark:text-white/35">{p.brand}</div>
                    )}
                    <div className="flex-1 text-[12px] font-bold leading-snug text-slate-900 dark:text-white line-clamp-2">{p.name}</div>

                    {/* shop pills */}
                    <div className="mt-2 flex flex-wrap gap-1">
                      {p.shopNames.slice(0, 3).map(s => (
                        <span key={s} className="rounded-full border border-slate-200 bg-slate-50 px-1.5 py-0.5 text-[9px] font-semibold text-slate-600 dark:border-white/10 dark:bg-white/[0.06] dark:text-white/60">
                          {s}
                        </span>
                      ))}
                      {p.shopNames.length > 3 && (
                        <span className="rounded-full border border-brand-gold/30 bg-brand-gold/10 px-1.5 py-0.5 text-[9px] font-bold text-brand-gold">
                          +{p.shopNames.length - 3}
                        </span>
                      )}
                    </div>

                    {/* prices */}
                    <div className="mt-2.5 flex items-end justify-between border-t border-slate-100 pt-2.5 dark:border-white/[0.06]">
                      <div>
                        <div className="text-[10px] text-slate-400 dark:text-white/40">À partir de</div>
                        <div className="text-base font-black text-emerald-600 dark:text-emerald-400 tabular-nums">
                          {p.minPrice.toFixed(3)} <span className="text-[10px]">DT</span>
                        </div>
                      </div>
                      {savings > 0.1 && (
                        <div className="text-right">
                          <div className="text-[10px] text-slate-400 dark:text-white/40">Économie</div>
                          <div className="text-[11px] font-bold text-brand-gold tabular-nums">{savings.toFixed(3)} DT</div>
                        </div>
                      )}
                    </div>

                    <Link href={`/comparateur?q=${encodeURIComponent(p.name)}`}
                      className="mt-2 flex items-center justify-between rounded-xl bg-slate-50 px-2.5 py-1.5 transition hover:bg-brand-gold/10 dark:bg-white/[0.04] dark:hover:bg-brand-gold/10">
                      <span className="text-[10px] font-semibold text-brand-gold">Comparer</span>
                      <ArrowRight className="h-3 w-3 text-brand-gold transition group-hover:translate-x-0.5" />
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* ── Pagination ────────────────────────────────────────────────── */}
        {!loading && totalPages > 1 && (
          <div className="mt-10 flex items-center justify-center gap-2 flex-wrap">
            <button onClick={() => setPage(0)} disabled={page === 0} className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 transition hover:border-brand-gold/40 disabled:opacity-40 dark:border-white/10 dark:bg-white/[0.04] dark:text-white">«</button>
            <button onClick={() => setPage(p => Math.max(0, p - 1))} disabled={page === 0} className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-brand-gold/40 disabled:opacity-40 dark:border-white/10 dark:bg-white/[0.04] dark:text-white">← Précédent</button>

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

            <button onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))} disabled={page === totalPages - 1} className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-brand-gold/40 disabled:opacity-40 dark:border-white/10 dark:bg-white/[0.04] dark:text-white">Suivant →</button>
            <button onClick={() => setPage(totalPages - 1)} disabled={page === totalPages - 1} className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 transition hover:border-brand-gold/40 disabled:opacity-40 dark:border-white/10 dark:bg-white/[0.04] dark:text-white">»</button>

            <span className="ml-2 text-xs text-slate-400 dark:text-white/40 tabular-nums">Page {page + 1} / {totalPages}</span>
          </div>
        )}
      </section>

      {/* ── CTA ───────────────────────────────────────────────────────────── */}
      <section className="mx-auto mt-14 max-w-[1600px] px-4 pb-12">
        <Reveal>
          <div className="relative overflow-hidden rounded-2xl border border-brand-gold/20 bg-gradient-to-br from-brand-gold/10 via-amber-500/5 to-transparent p-8 text-center">
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(246,196,83,0.08)_0%,transparent_70%)]" />
            <div className="relative">
              <ShoppingCart className="mx-auto mb-3 h-12 w-12 text-brand-gold/60" strokeWidth={1.5} />
              <h3 className="text-2xl font-black text-slate-900 dark:text-white">
                Comparez <span className="gradient-text-gold">tous les prix</span> alimentaires
              </h3>
              <p className="mt-2 text-sm text-slate-600 dark:text-white/60">
                Économisez sur vos courses en comparant Aziza, Carrefour, Géant, Monoprix et plus.
              </p>
              <Link href="/comparateur"
                className="group relative mt-6 inline-flex items-center gap-2 overflow-hidden rounded-xl bg-gradient-to-br from-brand-red via-brand-redDark to-[#7a0f1a] px-6 py-3 text-sm font-bold text-white shadow-glow ring-1 ring-white/10 transition hover:shadow-[0_0_30px_rgba(225,29,45,0.55)]">
                <Scale className="h-4 w-4" />
                Lancer le comparateur
                <span className="pointer-events-none absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/20 to-transparent transition-transform duration-700 group-hover:translate-x-full" />
              </Link>
            </div>
          </div>
        </Reveal>
      </section>

      <Footer />
    </main>
  );
}
