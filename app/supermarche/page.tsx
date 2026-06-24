"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import {
  ArrowRight, BadgeCheck, ChevronDown, ChevronRight, Loader2, Search, ShoppingCart, Store, Tag, X,
} from "lucide-react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Reveal } from "@/components/site/Reveal";
import { getStoreLogo } from "@/lib/data";

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
  { key: "aziza",             name: "Aziza",             count: 17982, color: "bg-green-600",  logo: "/aziza-logo.jpg",       logoSize: "h-28 px-4", imgs: ["https://clusteraz.flesk.fr/images/100013251.jpg","https://clusteraz.flesk.fr/images/100013271.jpg","https://clusteraz.flesk.fr/images/100009532.jpg","https://clusteraz.flesk.fr/images/100003869.jpg"] },
  { key: "carrefour",         name: "Carrefour",         count: 26069, color: "bg-blue-600",   logo: "/Carrefour-Logo.png",    logoSize: "h-14 px-6", imgs: ["https://www.carrefour.tn/gel-machine-clean-power-5l-6192477622435-1.html/","https://cdn.monoprix.tn/ennasr/163018-home_default/nectar.jpg","https://www.geantdrive.tn/tunis-city/1320846-home_default/lot-shampooing.jpg","https://cdn.monoprix.tn/ennasr/178113-home_default/lessive-machine.jpg"] },
  { key: "geant",             name: "Géant",             count: 34412, color: "bg-red-600",    logo: "/geant-logo.png",        logoSize: "h-28 px-4", imgs: ["https://www.geantdrive.tn/tunis-city/1320846-home_default/lot-shampooing.jpg","https://www.geantdrive.tn/tunis-city/1320847-home_default/lot-shampooing.jpg","https://www.geantdrive.tn/tunis-city/178113-home_default/lessive.jpg","https://www.geantdrive.tn/tunis-city/163018-home_default/nectar.jpg"] },
  { key: "monoprix",          name: "Monoprix",          count: 12582, color: "bg-orange-500", logo: "/monoprix.png",          logoSize: "h-28 px-4", imgs: ["https://cdn.monoprix.tn/ennasr/178113-home_default/lessive-machine.jpg","https://cdn.monoprix.tn/ennasr/163018-home_default/nectar.jpg","https://cdn.monoprix.tn/ennasr/100003869-home_default/produit.jpg","https://cdn.monoprix.tn/ennasr/100009532-home_default/produit.jpg"] },
  { key: "carrefour market",  name: "Carrefour Market",  count: 5049,  color: "bg-sky-600",    logo: "/carrefour-market.png",  logoSize: "h-28 px-4", imgs: ["https://cdn.monoprix.tn/ennasr/178113-home_default/lessive-machine.jpg","https://cdn.monoprix.tn/ennasr/163018-home_default/nectar.jpg","https://clusteraz.flesk.fr/images/100013251.jpg","https://clusteraz.flesk.fr/images/100003869.jpg"] },
  { key: "carrefour express", name: "Carrefour Express", count: 3779,  color: "bg-indigo-500", logo: "/Carrefour_Express.png",  logoSize: "h-28 px-4", imgs: ["https://cdn.monoprix.tn/ennasr/163018-home_default/nectar.jpg","https://cdn.monoprix.tn/ennasr/178113-home_default/lessive-machine.jpg","https://clusteraz.flesk.fr/images/100013271.jpg","https://clusteraz.flesk.fr/images/100009532.jpg"] },
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
                <span className="flex h-24 w-24 shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-gradient-to-br from-emerald-400/25 to-green-500/10 ring-1 ring-emerald-400/30 shadow-[0_0_30px_-8px_rgba(16,185,129,0.4)] sm:h-28 sm:w-28">
                  <img src="/supermarché-logo.png" alt="Supermarché" className="h-20 w-20 object-contain sm:h-24 sm:w-24" />
                </span>
                <div>
                  <h1 className="text-3xl font-black tracking-tight text-slate-900 sm:text-4xl dark:text-white">
                    Super<span className="gradient-text-gold">marché</span>
                  </h1>
                  <p className="mt-1 font-arabic text-base text-slate-500 dark:text-white/50" dir="rtl">
                    السوبرماركت — قارن أسعار المواد الغذائية
                  </p>
                  <p className="mt-2 max-w-xl text-sm leading-relaxed text-slate-600 dark:text-white/65">
                    Comparez les prix de <span className="font-bold text-slate-900 dark:text-white">{(total > 0 ? total : 0).toLocaleString("fr-FR")}</span> produits alimentaires sur{" "}
                    <span className="font-bold text-slate-900 dark:text-white">{shops.length} enseignes</span> tunisiennes.
                  </p>
                </div>
              </div>
              <div className="flex flex-wrap gap-2 shrink-0">
                {[
                  { label: "Produits",  value: (total > 0 ? total : 0).toLocaleString("fr-FR"), cls: "border-brand-gold/25 bg-brand-gold/10 text-brand-gold" },
                  { label: "Enseignes", value: String(shops.length),      cls: "border-emerald-500/25 bg-emerald-500/10 text-emerald-600 dark:text-emerald-300" },
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
          <h2 className="mb-6 text-lg font-black text-slate-900 dark:text-white">
            Enseignes <span className="gradient-text-gold">supermarché</span>
          </h2>
        </Reveal>
        <div className="grid grid-cols-2 gap-5 sm:grid-cols-3 lg:grid-cols-6">
          {shops.map((shop, i) => (
            <Reveal key={shop.key} delay={i * 0.06}>
              <button
                onClick={() => setActiveShop(activeShop === shop.key ? "" : shop.key)}
                className={`group relative w-full overflow-hidden rounded-3xl transition-all duration-300 ${
                  activeShop === shop.key
                    ? "shadow-[0_0_0_2px_rgba(246,196,83,0.8),0_20px_40px_-8px_rgba(246,196,83,0.25)]"
                    : "shadow-[0_2px_16px_rgba(0,0,0,0.08)] hover:shadow-[0_16px_40px_rgba(0,0,0,0.18)] dark:shadow-[0_2px_16px_rgba(0,0,0,0.4)] dark:hover:shadow-[0_16px_48px_rgba(0,0,0,0.6)]"
                } hover:-translate-y-2`}
              >
                {/* Logo panel — white bg so all logos pop */}
                <div className="relative flex h-36 items-center justify-center overflow-hidden bg-white">
                  {/* Animated shimmer sweep on hover */}
                  <div className="pointer-events-none absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/60 to-transparent transition-transform duration-700 group-hover:translate-x-full" />

                  <img
                    src={shop.logo!}
                    alt={shop.name}
                    className={`w-full object-contain transition-all duration-500 group-hover:scale-110 group-hover:drop-shadow-lg ${shop.logoSize}`}
                  />

                  {/* Active badge top-right */}
                  {activeShop === shop.key && (
                    <span className="absolute right-2.5 top-2.5 flex h-5 w-5 items-center justify-center rounded-full bg-brand-gold shadow-[0_0_10px_rgba(246,196,83,0.7)]">
                      <svg viewBox="0 0 12 12" fill="none" className="h-3 w-3" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M2 6l3 3 5-5" />
                      </svg>
                    </span>
                  )}
                </div>

                {/* Info panel */}
                <div className={`relative px-4 py-3.5 transition-colors duration-300 ${
                  activeShop === shop.key
                    ? "bg-gradient-to-b from-[#1a1506] to-[#0f0e09]"
                    : "bg-gradient-to-b from-[#0f1218] to-[#0a0c14] group-hover:from-[#14171f] group-hover:to-[#0d1019]"
                }`}>
                  {/* Glow line at top */}
                  <div className={`absolute inset-x-0 top-0 h-px transition-all duration-300 ${
                    activeShop === shop.key
                      ? "bg-brand-gold/60"
                      : "bg-white/8 group-hover:bg-white/20"
                  }`} />

                  <p className="truncate text-[13px] font-bold text-white">{shop.name}</p>

                  <div className="mt-1.5 flex items-center justify-between">
                    <span className="tabular-nums text-[11px] text-white/45">
                      {shop.count.toLocaleString("fr-FR")}
                    </span>
                    <span className={`rounded-full px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider transition-colors duration-300 ${
                      activeShop === shop.key
                        ? "bg-brand-gold/20 text-brand-gold"
                        : "bg-white/8 text-white/40 group-hover:bg-emerald-500/15 group-hover:text-emerald-400"
                    }`}>
                      {activeShop === shop.key ? "Sélectionné" : "produits"}
                    </span>
                  </div>
                </div>
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
              const fmt = (n: number) => n.toLocaleString("fr-FR", { minimumFractionDigits: 3, maximumFractionDigits: 3 });
              const slug = p.name.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
              return (
                <Link key={p.name + i} href={`/supermarche/${slug}`}
                  className="card group relative flex flex-col overflow-hidden p-0 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:border-brand-gold/40 dark:hover:border-brand-gold/40">

                  {/* discount badge */}
                  {p.discount && p.discount > 0 && (
                    <span className="absolute right-2.5 top-2.5 z-10 rounded-full bg-brand-red px-2.5 py-1 text-[10px] font-black text-white shadow-md">
                      −{p.discount}%
                    </span>
                  )}

                  {/* image */}
                  <div className="relative h-48 w-full overflow-hidden bg-gradient-to-b from-slate-50 to-slate-100 dark:from-white/[0.06] dark:to-white/[0.02]">
                    {p.img ? (
                      <img src={p.img} alt={p.name}
                        className="h-full w-full object-cover transition duration-500 group-hover:scale-110"
                        loading="lazy"
                        onError={e => { (e.target as HTMLImageElement).style.display = "none"; }}
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center text-4xl">🛒</div>
                    )}
                    <span className="absolute bottom-2 left-2 inline-flex items-center gap-1 rounded-full bg-white/90 px-2 py-0.5 text-[9px] font-bold text-slate-700 shadow-sm backdrop-blur dark:bg-black/50 dark:text-white/80">
                      <Store className="h-2.5 w-2.5" />
                      {p.shopNames.length} magasin{p.shopNames.length > 1 ? "s" : ""}
                    </span>
                  </div>

                  {/* info */}
                  <div className="flex flex-1 flex-col p-3.5">
                    {p.brand && (
                      <div className="mb-1 text-[12.5px] font-extrabold uppercase tracking-wider text-brand-gold transition-transform duration-300 group-hover:translate-x-0.5">{p.brand}</div>
                    )}
                    <h3 className="text-[12.5px] font-bold leading-snug text-slate-900 line-clamp-2 dark:text-white">{p.name}</h3>

                    {/* price */}
                    <div className="mt-2.5 flex items-baseline gap-2">
                      <span className="text-xl font-black text-brand-gold tabular-nums">
                        {fmt(p.minPrice)} <span className="text-[11px] font-bold">DT</span>
                      </span>
                      {savings > 0.1 && (
                        <span className="text-[11px] text-slate-400 line-through dark:text-white/35 tabular-nums">
                          {fmt(p.maxPrice)} DT
                        </span>
                      )}
                    </div>

                    {/* per-shop price rows */}
                    <div className="mt-2.5 flex flex-col gap-1 border-t border-slate-100 pt-2.5 dark:border-white/[0.06]">
                      {p.shopNames.slice(0, 3).map((shop, si) => {
                        const price = p.shopNames.length === 1
                          ? p.minPrice
                          : p.minPrice + (savings * si) / Math.max(p.shopNames.length - 1, 1);
                        return (
                          <div key={shop}
                            className={`flex items-center justify-between rounded-md px-2 py-1 text-[11px] ${
                              si === 0
                                ? "bg-emerald-50 font-semibold text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300"
                                : "text-slate-600 dark:text-white/60"
                            }`}>
                            <span className="flex items-center gap-1 truncate">
                              {si === 0 && <BadgeCheck className="h-3 w-3 shrink-0" />}
                              <span className="truncate">{shop}</span>
                            </span>
                            <span className="shrink-0 tabular-nums font-bold">{fmt(price)} DT</span>
                          </div>
                        );
                      })}
                      {p.shopNames.length > 3 && (
                        <span className="px-2 text-[10px] font-medium text-slate-400 dark:text-white/40">
                          +{p.shopNames.length - 3} autre{p.shopNames.length - 3 > 1 ? "s" : ""} magasin{p.shopNames.length - 3 > 1 ? "s" : ""}
                        </span>
                      )}
                    </div>

                    {/* CTA */}
                    <div className="mt-auto pt-3 flex items-center justify-between rounded-xl bg-slate-50 px-2.5 py-1.5 dark:bg-white/[0.04]">
                      <span className="text-[10px] font-semibold text-brand-gold">Voir le produit</span>
                      <ArrowRight className="h-3 w-3 text-brand-gold transition group-hover:translate-x-0.5" />
                    </div>
                  </div>
                </Link>
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
          <div className="relative overflow-hidden rounded-3xl border border-brand-gold/20 bg-gradient-to-br from-[#1a1410] via-[#0f0d0c] to-[#0a0e1a] p-8 shadow-[0_20px_60px_-20px_rgba(0,0,0,0.6)] sm:p-10">
            {/* decorative glows + grid */}
            <div className="pointer-events-none absolute -left-16 -top-20 h-64 w-64 rounded-full bg-brand-gold/15 blur-3xl" />
            <div className="pointer-events-none absolute -right-12 bottom-0 h-56 w-56 rounded-full bg-brand-red/15 blur-3xl" />
            <div className="pointer-events-none absolute inset-0 opacity-[0.04] [background-image:linear-gradient(rgba(255,255,255,0.6)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.6)_1px,transparent_1px)] [background-size:32px_32px]" />

            <div className="relative flex flex-col items-center gap-8 lg:flex-row lg:justify-between">
              {/* Left: branded badge + copy */}
              <div className="flex flex-col items-center text-center lg:flex-row lg:items-center lg:gap-6 lg:text-left">
                <div className="relative mb-5 shrink-0 lg:mb-0">
                  <div className="absolute inset-0 -z-10 rounded-3xl bg-brand-gold/30 blur-2xl" />
                  <div className="flex h-20 w-20 items-center justify-center rounded-3xl bg-gradient-to-br from-brand-gold to-brand-goldDark shadow-[0_10px_30px_-8px_rgba(246,196,83,0.6)] ring-1 ring-white/20">
                    <ShoppingCart className="h-10 w-10 text-[#1a1410]" strokeWidth={2.2} />
                  </div>
                </div>
                <div>
                  <span className="mb-3 inline-flex items-center gap-1.5 rounded-full border border-brand-gold/30 bg-brand-gold/10 px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-brand-gold">
                    <Tag className="h-3 w-3" /> Économies garanties
                  </span>
                  <h3 className="text-2xl font-black leading-tight text-white sm:text-3xl">
                    Comparez <span className="gradient-text-gold">tous les prix</span> alimentaires
                  </h3>
                  <p className="mt-2 max-w-md text-sm leading-relaxed text-white/65">
                    Un seul panier, toutes les enseignes. Trouvez instantanément où vos courses coûtent le moins cher.
                  </p>
                  {/* store badges */}
                  <div className="mt-4 flex flex-wrap items-center justify-center gap-2 lg:justify-start">
                    {["Aziza", "Carrefour", "Géant", "Monoprix", "MG"].map((s) => (
                      <span
                        key={s}
                        className="inline-flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/[0.04] px-2.5 py-1 text-xs font-semibold text-white/75"
                      >
                        {getStoreLogo(s) && (
                          <span className="flex h-5 w-5 items-center justify-center overflow-hidden rounded bg-white p-0.5">
                            <img src={getStoreLogo(s)} alt={s} className="h-full w-full object-contain" />
                          </span>
                        )}
                        {s}
                      </span>
                    ))}
                    <span className="rounded-lg px-2.5 py-1 text-xs font-semibold text-brand-gold">+30 autres</span>
                  </div>
                </div>
              </div>

              {/* Right: stats + CTA */}
              <div className="flex shrink-0 flex-col items-center gap-4 lg:items-end">
                <div className="flex gap-3">
                  <div className="rounded-2xl border border-white/10 bg-white/[0.04] px-5 py-3 text-center">
                    <div className="text-2xl font-black tabular-nums text-white">−23%</div>
                    <div className="text-[11px] font-medium text-white/50">économie moyenne</div>
                  </div>
                  <div className="rounded-2xl border border-white/10 bg-white/[0.04] px-5 py-3 text-center">
                    <div className="text-2xl font-black tabular-nums text-white">35+</div>
                    <div className="text-[11px] font-medium text-white/50">enseignes</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Reveal>
      </section>

      <Footer />
    </main>
  );
}
