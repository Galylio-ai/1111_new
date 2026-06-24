"use client";
import { Suspense, useCallback, useEffect, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  ArrowRight, BadgeCheck, ChevronDown, ChevronRight, FlaskConical, Loader2, Search, Store, Tag, X,
} from "lucide-react";

/* ── Custom dropdown ─────────────────────────────────────────────────────── */
function Dropdown({
  value, onChange, options, placeholder,
}: {
  value: string;
  onChange: (v: string) => void;
  options: { value: string; label: string }[];
  placeholder: string;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const selected = options.find(o => o.value === value);

  useEffect(() => {
    function handler(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        className="flex h-[42px] min-w-[170px] items-center justify-between gap-2 rounded-xl border border-slate-300 bg-white px-3 text-sm font-semibold text-slate-700 outline-none transition hover:border-brand-gold/40 dark:border-white/10 dark:bg-white/[0.06] dark:text-white"
      >
        <span className={selected ? "" : "text-slate-400 dark:text-white/35"}>
          {selected ? selected.label : placeholder}
        </span>
        <ChevronDown className={`h-3.5 w-3.5 shrink-0 transition-transform text-slate-400 dark:text-white/40 ${open ? "rotate-180" : ""}`} />
      </button>

      {open && (
        <div className="absolute left-0 top-[46px] z-50 max-h-72 min-w-full overflow-y-auto overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xl dark:border-white/10 dark:bg-[#0f1422]">
          <button
            type="button"
            onClick={() => { onChange(""); setOpen(false); }}
            className={`w-full px-4 py-2.5 text-left text-sm transition hover:bg-slate-50 dark:hover:bg-white/[0.06] ${!value ? "font-bold text-brand-gold" : "text-slate-500 dark:text-white/50"}`}
          >
            {placeholder}
          </button>
          {options.map(o => (
            <button
              key={o.value}
              type="button"
              onClick={() => { onChange(o.value); setOpen(false); }}
              className={`w-full px-4 py-2.5 text-left text-sm transition hover:bg-slate-50 dark:hover:bg-white/[0.06] ${value === o.value ? "font-bold text-brand-gold bg-brand-gold/5" : "text-slate-700 dark:text-white/80"}`}
            >
              {o.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Reveal } from "@/components/site/Reveal";
import { ParaRanking } from "@/components/ParaRanking";

type Product = {
  name: string;
  brand: string;
  category: string;
  img: string;
  minPrice: number;
  maxPrice: number;
  shopNames: string[];
  discount: number | null;
  bestUrl?: string | null;
};

/* ── Real categories (top 16 by product count) ──────────────────────────── */
const categories = [
  { id: "visage",       fr: "Visage",               ar: "الوجه",                 count: 1449, img: "/visage.jpg" },
  { id: "bébé",        fr: "Bébé & Maman",          ar: "الأم والطفل",           count: 702,  img: "/bebe&maman.png" },
  { id: "cheveux",     fr: "Cheveux",               ar: "الشعر",                 count: 631,  img: "/cheveux.png" },
  { id: "hygiène",     fr: "Hygiène",               ar: "النظافة",               count: 629,  img: "/hygiene.png" },
  { id: "maquillage",  fr: "Maquillage",            ar: "مستحضرات التجميل",      count: 538,  img: "/Maquillage.png" },
  { id: "corps",       fr: "Corps & Bain",          ar: "الجسم والحمام",         count: 392,  img: "/corps&bain.jpg" },
  { id: "soins",       fr: "Soins",                 ar: "العلاجات",              count: 361,  img: "/Soins.png" },
  { id: "compléments", fr: "Compléments Alimentaires", ar: "المكملات الغذائية", count: 342,  img: "/ComplementAlimentaire.png" },
  { id: "capillaire",  fr: "Capillaire",            ar: "تقوية الشعر",           count: 318,  img: "/capilaire.png" },
  { id: "solaire",     fr: "Solaire",               ar: "الحماية الشمسية",       count: 302,  img: "/EcranSolaire.png" },
  { id: "démaquillants", fr: "Démaquillants",       ar: "إزالة المكياج",         count: 280,  img: "/Demaquillant.png" },
  { id: "cicatrisation", fr: "Cicatrisation",       ar: "التئام الجروح",         count: 240,  img: "/cicatrisation.png" },
  { id: "anti-âge",    fr: "Anti-Âge",              ar: "مكافحة الشيخوخة",       count: 323,  img: "/Anti-Age.png" },
  { id: "lèvres",      fr: "Soins Lèvres & Mains",  ar: "العناية بالشفاه",       count: 277,  img: "/levre.png" },
  { id: "accessoires", fr: "Accessoires",           ar: "الإكسسوارات",           count: 260,  img: "/accesoires.png" },
  { id: "parfums",     fr: "Parfums & Déodorants",  ar: "العطور",                count: 215,  img: "/parfums.png" },
];

/* ── Real shops ──────────────────────────────────────────────────────────── */
const shops = [
  { key: "mapara",      name: "MaPara",        products: 7616, offerCount: 6226, color: "bg-emerald-500", imgs: ["https://beautystore.tn/20589-large_default/arganskin-huile-d-argan-40ml.jpg","https://beautystore.tn/15279-large_default/bloc-polissoir-4-faces.jpg","https://www.maparatunisie.tn/wp-content/uploads/2021/05/317556-laboratoires-svr-ampoule-c-30ml-serum-et-booster-30ml-pipette-1000x1000-1.jpg","https://beautystore.tn/28440-large_default/stick-lèvres-ultra-hydratant-atoderm-4gr.jpg"] },
  { key: "paraexpert",  name: "ParaExpert",    products: 4863, offerCount: 4747, color: "bg-blue-500",    imgs: ["https://beautystore.tn/20589-large_default/arganskin-huile-d-argan-40ml.jpg","https://beautystore.tn/20201-large_default/lime-émeri-double-face-arc-en-ciel.jpg","https://beautystore.tn/15268-large_default/coupe-ongles-avec-chaine.jpg","https://beautystore.tn/29792-large_default/gummies-mini-beauté-cheveux-ongles.jpg"] },
  { key: "parashop",    name: "ParaShop",      products: 6534, offerCount: 4599, color: "bg-violet-500",  imgs: ["https://beautystore.tn/20589-large_default/arganskin-huile-d-argan-40ml.jpg","https://beautystore.tn/17872-large_default/coupe-ongle-rose-gold.jpg","https://beautystore.tn/15279-large_default/bloc-polissoir-4-faces.jpg","https://beautystore.tn/27847-large_default/baume-à-lèvres-réparateur-cicalfate-10ml.jpg"] },
  { key: "parafendri",  name: "ParaFendri",    products: 5126, offerCount: 4419, color: "bg-rose-500",    imgs: ["https://beautystore.tn/20589-large_default/arganskin-huile-d-argan-40ml.jpg","https://parafendri.tn/1509-large_default/biom-ecran-cc-creme-unifiant-antitache-40ml-bio-m-nos-promotions-biom.webp","https://beautystore.tn/27847-large_default/baume-à-lèvres-réparateur-cicalfate-10ml.jpg","https://beautystore.tn/27743-large_default/baume-réparateur-lèvres-atoderm-15ml.jpg"] },
  { key: "el_farabi",   name: "El Farabi",     products: 3449, offerCount: 3042, color: "bg-amber-500",   imgs: ["https://beautystore.tn/20589-large_default/arganskin-huile-d-argan-40ml.jpg","https://beautystore.tn/29792-large_default/gummies-mini-beauté-cheveux-ongles.jpg","https://www.maparatunisie.tn/wp-content/uploads/2021/05/317556-laboratoires-svr-ampoule-c-30ml-serum-et-booster-30ml-pipette-1000x1000-1.jpg","https://beautystore.tn/28440-large_default/stick-lèvres-ultra-hydratant-atoderm-4gr.jpg"] },
  { key: "cosmetique",  name: "Cosmetique.tn", products: 2132, offerCount: 1884, color: "bg-pink-500",    imgs: ["https://www.maparatunisie.tn/wp-content/uploads/2021/04/317578-laboratoires-svr-cicavit-baume-levres-10g-soin-des-levres-10g-tube-1000x1000-1.jpg","https://www.maparatunisie.tn/wp-content/uploads/2021/04/317546-laboratoires-svr-topialyse-creme-barriere-50ml-creme-et-lait-hydratant-50ml-tube-1000x1000-1.jpg","https://beautystore.tn/26443-large_default/ampoule-a-lift-30ml.jpg","https://beautystore.tn/24976-large_default/huile-prodigieuse-florale-50ml.jpg"] },
  { key: "beautystore", name: "Beauty Store",  products: 1630, offerCount: 533,  color: "bg-fuchsia-500", imgs: ["https://beautystore.tn/20589-large_default/arganskin-huile-d-argan-40ml.jpg","https://beautystore.tn/20201-large_default/lime-émeri-double-face-arc-en-ciel.jpg","https://beautystore.tn/17872-large_default/coupe-ongle-rose-gold.jpg","https://beautystore.tn/15279-large_default/bloc-polissoir-4-faces.jpg"] },
  { key: "pharmashop",  name: "PharmaShop",    products: 640,  offerCount: 549,  color: "bg-teal-500",    imgs: ["https://pharma-shop.tn/25594-large_default/svr-topialyse-stick-levres-vegetale-4g.jpg","https://beautystore.tn/27738-large_default/hydrabio-hyalu-serum-30ml.jpg","https://beautystore.tn/27548-large_default/super-sérum-10-30ml.jpg","https://beautystore.tn/28440-large_default/stick-lèvres-ultra-hydratant-atoderm-4gr.jpg"] },
  { key: "parahouse",   name: "ParaHouse",     products: 4983, offerCount: 448,  color: "bg-indigo-500",  imgs: ["https://www.parahouse.tn/17146-large_default/avene-cleanance-comedomed-peeling-creme-intensive-poussee-de-boutons-40ml.jpg","https://www.parahouse.tn/9890-large_default/bioderma-pigmentbio-soin-de-nuit-eclaircissant-50ml.jpg","https://www.parahouse.tn/19326-large_default/avene-cicalfate-spray-assechant-reparateur-100ml.jpg","https://www.parahouse.tn/16099-large_default/avene-cleanance-eau-micellaire-400ml.jpg"] },
];

const LIMIT = 24;

export default function ParapharmacyPage() {
  return (
    <Suspense fallback={null}>
      <ParapharmacyPageInner />
    </Suspense>
  );
}

function ParapharmacyPageInner() {
  const sp = useSearchParams();
  const [products, setProducts]   = useState<Product[]>([]);
  const [total, setTotal]         = useState(0);
  const [page, setPage]           = useState(0);
  const [loading, setLoading]     = useState(false);
  const [activeCat, setActiveCat]   = useState(sp?.get("cat") ?? "");
  const [activeShop, setActiveShop] = useState(sp?.get("shop") ?? "");
  const [search, setSearch]         = useState(sp?.get("q") ?? "");
  const [query, setQuery]           = useState(sp?.get("q") ?? "");

  const fetchProducts = useCallback(async (p: number, cat: string, q: string, shop: string) => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: String(p), limit: String(LIMIT) });
      if (cat)  params.set("cat", cat);
      if (q)    params.set("q", q);
      if (shop) params.set("shop", shop);
      const res  = await fetch(`/api/para-products?${params}`);
      const data = await res.json();
      setProducts(data.items);
      setTotal(data.total);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchProducts(0, "", "", ""); }, [fetchProducts]);

  useEffect(() => {
    setPage(0);
    fetchProducts(0, activeCat, query, activeShop);
  }, [activeCat, activeShop, query, fetchProducts]);

  useEffect(() => { fetchProducts(page, activeCat, query, activeShop); }, [page]); // eslint-disable-line

  // debounce search input → query
  useEffect(() => {
    const t = setTimeout(() => setQuery(search), 350);
    return () => clearTimeout(t);
  }, [search]);

  const totalPages = Math.ceil(total / LIMIT);

  return (
    <main className="min-h-screen bg-white dark:bg-[#0a0e1a]">
      <Header />

      {/* ── Breadcrumb ────────────────────────────────────────────────────── */}
      <div className="mx-auto max-w-[1600px] px-4 pt-5">
        <nav className="reveal-up mb-4 flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-400 dark:text-white/40">
          <Link href="/" className="transition hover:text-brand-gold">Accueil</Link>
          <ChevronRight className="h-3 w-3 opacity-60" />
          <span className="text-brand-gold">Parapharmacie</span>
        </nav>

        {/* ── Hero ────────────────────────────────────────────────────────── */}
        <Reveal>
          <div className="relative overflow-hidden rounded-2xl border border-slate-200 bg-gradient-to-br from-slate-50 via-white to-rose-50/30 p-6 sm:p-8 dark:border-white/5 dark:from-[#0f1422] dark:via-[#0f1422] dark:to-[#130f1a]">
            <div className="pointer-events-none absolute -left-12 -top-12 h-56 w-56 rounded-full bg-rose-500/10 blur-3xl" />
            <div className="pointer-events-none absolute right-0 top-0 h-48 w-48 rounded-full bg-brand-gold/8 blur-3xl" />
            <div className="relative flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
              <div className="flex items-start gap-4">
                <span className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-rose-400/25 to-pink-500/10 ring-1 ring-rose-400/30 shadow-[0_0_30px_-8px_rgba(244,63,94,0.4)] overflow-hidden">
                  <img src="/pharmacie logo.jpg" alt="Parapharmacie" className="h-full w-full object-cover" />
                </span>
                <div>
                  <h1 className="text-3xl font-black tracking-tight text-slate-900 sm:text-4xl dark:text-white">
                    Para<span className="gradient-text-gold">pharmacie</span>
                  </h1>
                  <p className="mt-1 font-arabic text-base text-slate-500 dark:text-white/50" dir="rtl">شبه الصيدلية — قارن الأسعار واشتري بذكاء</p>
                  <p className="mt-2 max-w-xl text-sm leading-relaxed text-slate-600 dark:text-white/65">
                    Comparez les prix de <span className="font-bold text-slate-900 dark:text-white">12 768</span> produits sur <span className="font-bold text-slate-900 dark:text-white">9 enseignes</span> tunisiennes.
                  </p>
                </div>
              </div>
              <div className="flex flex-wrap gap-2 shrink-0">
                {[
                  { label: "Produits", value: "12 768", cls: "border-brand-gold/25 bg-brand-gold/10 text-brand-gold" },
                  { label: "Enseignes", value: "9", cls: "border-sky-500/25 bg-sky-500/10 text-sky-600 dark:text-sky-300" },
                  { label: "Catégories", value: "142", cls: "border-emerald-500/25 bg-emerald-500/10 text-emerald-600 dark:text-emerald-300" },
                ].map((c) => (
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

      {/* ── Categories ────────────────────────────────────────────────────── */}
      <section className="mx-auto mt-10 max-w-[1600px] px-4">
        <Reveal>
          <h2 className="mb-6 text-lg font-black text-slate-900 dark:text-white">
            Catégories <span className="gradient-text-gold">para</span>
          </h2>
        </Reveal>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8">
          {categories.map((cat, i) => (
            <Reveal key={cat.id} delay={i * 0.03}>
              <button
                onClick={() => setActiveCat(activeCat === cat.id ? "" : cat.id)}
                className={`group relative w-full overflow-hidden rounded-2xl transition-all duration-300 hover:-translate-y-2 ${
                  activeCat === cat.id
                    ? "shadow-[0_0_0_2px_rgba(246,196,83,0.9),0_16px_40px_-8px_rgba(246,196,83,0.3)]"
                    : "shadow-[0_2px_12px_rgba(0,0,0,0.15)] hover:shadow-[0_16px_40px_rgba(0,0,0,0.35)] dark:shadow-[0_2px_12px_rgba(0,0,0,0.5)] dark:hover:shadow-[0_20px_50px_rgba(0,0,0,0.7)]"
                }`}
              >
                {/* Image — tall */}
                <div className="relative h-60 w-full overflow-hidden bg-slate-100 dark:bg-white/[0.04]">
                  <img
                    src={cat.img}
                    alt={cat.fr}
                    className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-115"
                    loading="lazy"
                  />

                  {/* Base dark gradient always visible */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

                  {/* Extra overlay that fades in on hover — darkens top half */}
                  <div className="absolute inset-0 bg-gradient-to-b from-black/40 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

                  {/* Shimmer sweep */}
                  <div className="pointer-events-none absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/20 to-transparent transition-transform duration-700 group-hover:translate-x-full" />

                  {/* Active gold ring inset */}
                  {activeCat === cat.id && (
                    <div className="absolute inset-0 rounded-2xl ring-2 ring-inset ring-brand-gold/80" />
                  )}

                  {/* Active checkmark */}
                  {activeCat === cat.id && (
                    <span className="absolute right-2 top-2 flex h-6 w-6 items-center justify-center rounded-full bg-brand-gold shadow-[0_0_12px_rgba(246,196,83,0.8)]">
                      <svg viewBox="0 0 12 12" fill="none" className="h-3.5 w-3.5" stroke="white" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M2 6l3 3 5-5" />
                      </svg>
                    </span>
                  )}

                  {/* Text block — slides up on hover */}
                  <div className="absolute bottom-0 left-0 right-0 p-3 transition-transform duration-300 group-hover:-translate-y-1">
                    <p className="text-[13px] font-black leading-tight text-white drop-shadow-lg">{cat.fr}</p>
                    {/* Arabic — hidden, slides in on hover */}
                    <p className="mt-0.5 max-h-0 overflow-hidden font-arabic text-[10px] text-white/60 transition-all duration-300 group-hover:max-h-6 dir-rtl" dir="rtl">
                      {cat.ar}
                    </p>
                    {/* Count pill */}
                    <div className={`mt-1.5 inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold backdrop-blur-sm transition-colors duration-300 ${
                      activeCat === cat.id
                        ? "bg-brand-gold/30 text-brand-gold"
                        : "bg-white/15 text-white/80 group-hover:bg-white/25"
                    }`}>
                      {cat.count.toLocaleString("fr-FR")} produits
                    </div>
                  </div>
                </div>
              </button>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ── Search + filters bar ──────────────────────────────────────────── */}
      <section className="mx-auto mt-24 max-w-[1600px] px-4">
        <Reveal>
          <h2 className="mb-6 text-lg font-black text-slate-900 dark:text-white">
            Les Produits <span className="gradient-text-gold">similaires</span>
          </h2>
        </Reveal>
        <div className="flex flex-wrap items-center gap-3">
          {/* search */}
          <div className="relative flex-1 min-w-[180px]">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400 dark:text-white/30" />
            <input
              type="search"
              placeholder="Rechercher un produit ou une marque…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-xl border border-slate-300 bg-white py-2.5 pl-9 pr-9 text-sm text-slate-900 placeholder:text-slate-400 outline-none transition focus:border-brand-gold/50 focus:ring-2 focus:ring-brand-gold/20 dark:border-white/10 dark:bg-white/[0.04] dark:text-white dark:placeholder:text-white/30"
            />
            {search && (
              <button onClick={() => setSearch("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:text-white/30 dark:hover:text-white/70">
                <X className="h-4 w-4" />
              </button>
            )}
          </div>

          {/* category dropdown */}
          <Dropdown
            value={activeCat}
            onChange={setActiveCat}
            placeholder="Toutes catégories"
            options={categories.map(c => ({ value: c.id, label: c.fr }))}
          />

          {/* shop dropdown */}
          <Dropdown
            value={activeShop}
            onChange={setActiveShop}
            placeholder="Toutes les enseignes"
            options={shops.map(s => ({ value: s.key, label: s.name }))}
          />

          {/* reset */}
          {(activeCat || activeShop) && (
            <button
              onClick={() => { setActiveCat(""); setActiveShop(""); }}
              className="flex items-center gap-1.5 rounded-xl border border-slate-300 bg-slate-100 px-3 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-200 dark:border-white/10 dark:bg-white/[0.06] dark:text-white/60 dark:hover:bg-white/[0.1]"
            >
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
              const slug = p.name.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
              const fmt = (n: number) => n.toLocaleString("fr-FR");
              return (
                <Link
                  key={p.name + i}
                  href={`/parapharmacie/${slug}`}
                  className="card group relative flex flex-col overflow-hidden p-0 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:border-brand-gold/40 dark:hover:border-brand-gold/40"
                >
                  {/* discount badge */}
                  {p.discount && (
                    <span className="absolute right-2.5 top-2.5 z-10 rounded-full bg-brand-red px-2.5 py-1 text-[10px] font-black text-white shadow-md">
                      −{p.discount}%
                    </span>
                  )}

                  {/* image */}
                  <div className="relative h-48 w-full overflow-hidden bg-gradient-to-b from-slate-50 to-slate-100 dark:from-white/[0.06] dark:to-white/[0.02]">
                    <img
                      src={p.img}
                      alt={p.name}
                      className="h-full w-full object-cover transition duration-500 group-hover:scale-110"
                      loading="lazy"
                    />
                    <span className="absolute bottom-2 left-2 inline-flex items-center gap-1 rounded-full bg-white/90 px-2 py-0.5 text-[9px] font-bold text-slate-700 shadow-sm backdrop-blur dark:bg-black/50 dark:text-white/80">
                      <Store className="h-2.5 w-2.5" />
                      {p.shopNames.length} boutique{p.shopNames.length > 1 ? "s" : ""}
                    </span>
                  </div>

                  {/* info */}
                  <div className="flex flex-1 flex-col p-3.5">
                    <div className="mb-1 text-[10px] font-bold uppercase tracking-wider text-brand-gold/80">
                      {p.brand}
                    </div>
                    <h3 className="text-[12.5px] font-bold leading-snug text-slate-900 line-clamp-2 dark:text-white">
                      {p.name}
                    </h3>
                    <div className="mt-0.5 text-[10px] text-slate-500 dark:text-white/45">{p.category}</div>

                    {/* best price + strikethrough max */}
                    <div className="mt-2.5 flex items-baseline gap-2">
                      <span className="text-xl font-black text-brand-gold tabular-nums">
                        {fmt(p.minPrice)} <span className="text-[11px] font-bold">DT</span>
                      </span>
                      {savings > 0.5 && (
                        <span className="text-[11px] text-slate-400 line-through dark:text-white/35 tabular-nums">
                          {fmt(p.maxPrice)} DT
                        </span>
                      )}
                    </div>

                    {/* per-shop price list, cheapest first */}
                    <div className="mt-2.5 flex flex-col gap-1 border-t border-slate-100 pt-2.5 dark:border-white/[0.06]">
                      {p.shopNames.slice(0, 3).map((shop, si) => {
                        const price = p.shopNames.length === 1
                          ? p.minPrice
                          : p.minPrice + (savings * si) / Math.max(p.shopNames.length - 1, 1);
                        return (
                          <div
                            key={shop}
                            className={`group/row flex items-center justify-between rounded-md px-2 py-1.5 transition-all duration-300 hover:scale-[1.03] hover:shadow-sm ${
                              si === 0
                                ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300 animate-shop-pulse"
                                : "text-slate-700 hover:bg-slate-50 dark:text-white/75 dark:hover:bg-white/[0.04]"
                            }`}
                          >
                            <span className="flex items-center gap-1.5 truncate">
                              {si === 0 && <BadgeCheck className="h-3.5 w-3.5 shrink-0 animate-pulse" />}
                              <span className="truncate text-[13px] font-extrabold capitalize tracking-tight transition-transform duration-300 group-hover/row:translate-x-0.5">
                                {shop}
                              </span>
                            </span>
                            <span className="shrink-0 text-[12px] tabular-nums font-bold">{fmt(price)} DT</span>
                          </div>
                        );
                      })}
                      {p.shopNames.length > 3 && (
                        <span className="px-2 text-[10px] font-medium text-slate-400 dark:text-white/40">
                          +{p.shopNames.length - 3} autre{p.shopNames.length - 3 > 1 ? "s" : ""} boutique{p.shopNames.length - 3 > 1 ? "s" : ""}
                        </span>
                      )}
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}

        {/* ── Pagination ──────────────────────────────────────────────────── */}
        {!loading && totalPages > 1 && (
          <div className="mt-10 flex items-center justify-center gap-2 flex-wrap">
            <button
              onClick={() => setPage(0)}
              disabled={page === 0}
              className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 transition hover:border-brand-gold/40 disabled:opacity-40 dark:border-white/10 dark:bg-white/[0.04] dark:text-white"
            >
              «
            </button>
            <button
              onClick={() => setPage((p) => Math.max(0, p - 1))}
              disabled={page === 0}
              className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-brand-gold/40 disabled:opacity-40 dark:border-white/10 dark:bg-white/[0.04] dark:text-white"
            >
              ← Précédent
            </button>

            {/* page numbers — show window of 5 around current */}
            {Array.from({ length: totalPages }).map((_, idx) => {
              if (idx !== 0 && idx !== totalPages - 1 && Math.abs(idx - page) > 2) return null;
              if (Math.abs(idx - page) === 3) return <span key={idx} className="text-slate-400 dark:text-white/30">…</span>;
              return (
                <button
                  key={idx}
                  onClick={() => setPage(idx)}
                  className={`h-9 w-9 rounded-xl text-sm font-bold transition ${
                    page === idx
                      ? "bg-brand-gold text-black shadow"
                      : "border border-slate-200 bg-white text-slate-700 hover:border-brand-gold/40 dark:border-white/10 dark:bg-white/[0.04] dark:text-white"
                  }`}
                >
                  {idx + 1}
                </button>
              );
            })}

            <button
              onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
              disabled={page === totalPages - 1}
              className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-brand-gold/40 disabled:opacity-40 dark:border-white/10 dark:bg-white/[0.04] dark:text-white"
            >
              Suivant →
            </button>
            <button
              onClick={() => setPage(totalPages - 1)}
              disabled={page === totalPages - 1}
              className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 transition hover:border-brand-gold/40 disabled:opacity-40 dark:border-white/10 dark:bg-white/[0.04] dark:text-white"
            >
              »
            </button>

            <span className="ml-2 text-xs text-slate-400 dark:text-white/40 tabular-nums">
              Page {page + 1} / {totalPages}
            </span>
          </div>
        )}
      </section>

      {/* ── Shops ─────────────────────────────────────────────────────────── */}
      <section className="mx-auto mt-14 max-w-[1600px] px-4">
        <Reveal>
          <div className="mb-5 flex items-center gap-3">
            <FlaskConical className="h-5 w-5 text-brand-gold" />
            <h2 className="text-lg font-black text-slate-900 dark:text-white">
              Enseignes <span className="gradient-text-gold">para</span>
            </h2>
          </div>
        </Reveal>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {shops.map((shop, i) => (
            <Reveal key={shop.key} delay={i * 0.04}>
              <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white dark:border-white/[0.06] dark:bg-white/[0.025]">
                <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3 dark:border-white/[0.06]">
                  <div className="flex items-center gap-3">
                    <span className={`flex h-9 w-9 items-center justify-center rounded-xl text-xs font-black text-white ${shop.color}`}>
                      {shop.name.slice(0, 2).toUpperCase()}
                    </span>
                    <div>
                      <div className="font-bold text-slate-900 dark:text-white">{shop.name}</div>
                      <div className="text-[11px] text-slate-400 dark:text-white/40">{shop.offerCount.toLocaleString("fr-FR")} offres comparées</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-black tabular-nums text-slate-900 dark:text-white">{shop.products.toLocaleString("fr-FR")}</div>
                    <div className="text-[10px] uppercase tracking-wider text-slate-400 dark:text-white/40">produits</div>
                  </div>
                </div>
                <div className="grid grid-cols-4 gap-0.5 bg-slate-100 dark:bg-white/[0.04]">
                  {shop.imgs.map((img, j) => (
                    <div key={j} className="relative aspect-square overflow-hidden bg-white dark:bg-[#0f1422]">
                      <img src={img} alt="" className="h-full w-full object-contain p-1.5" loading="lazy" />
                    </div>
                  ))}
                </div>
                <div className="flex items-center justify-between px-4 py-3">
                  <div className="h-1.5 flex-1 mr-4 overflow-hidden rounded-full bg-slate-100 dark:bg-white/[0.08]">
                    <div className={`h-full rounded-full ${shop.color} opacity-70`} style={{ width: `${Math.round((shop.offerCount / 7616) * 100)}%` }} />
                  </div>
                  <button
                    onClick={() => { setActiveCat(""); setActiveShop(shop.key); setSearch(""); window.scrollTo({ top: 600, behavior: "smooth" }); }}
                    className="flex items-center gap-1 text-[11px] font-bold text-brand-gold hover:underline shrink-0"
                  >
                    Explorer <ArrowRight className="h-3 w-3" />
                  </button>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ── CTA ───────────────────────────────────────────────────────────── */}
      <section className="mx-auto mt-14 max-w-[1600px] px-4 pb-12">
        <Reveal>
          <div className="relative overflow-hidden rounded-3xl border border-brand-gold/20 bg-gradient-to-br from-[#1a1018] via-[#120c12] to-[#0a0e1a] p-8 shadow-[0_20px_60px_-20px_rgba(0,0,0,0.6)] sm:p-10">
            {/* decorative glows + grid */}
            <div className="pointer-events-none absolute -left-16 -top-20 h-64 w-64 rounded-full bg-pink-500/15 blur-3xl" />
            <div className="pointer-events-none absolute -right-12 bottom-0 h-56 w-56 rounded-full bg-emerald-500/15 blur-3xl" />
            <div className="pointer-events-none absolute inset-0 opacity-[0.04] [background-image:linear-gradient(rgba(255,255,255,0.6)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.6)_1px,transparent_1px)] [background-size:32px_32px]" />

            <div className="relative flex flex-col items-center gap-8 lg:flex-row lg:justify-between">
              {/* Left: branded badge + copy */}
              <div className="flex flex-col items-center text-center lg:flex-row lg:items-center lg:gap-6 lg:text-left">
                <div className="relative mb-5 shrink-0 lg:mb-0">
                  <div className="absolute inset-0 -z-10 rounded-3xl bg-pink-500/30 blur-2xl" />
                  <img
                    src="/pharmacie logo.jpg"
                    alt="Parapharmacie"
                    className="h-20 w-20 rounded-3xl object-cover shadow-[0_10px_30px_-8px_rgba(236,72,153,0.6)] ring-1 ring-white/20"
                  />
                </div>
                <div>
                  <span className="mb-3 inline-flex items-center gap-1.5 rounded-full border border-pink-400/30 bg-pink-400/10 px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-pink-300">
                    <Tag className="h-3 w-3" /> Jusqu'à −30%
                  </span>
                  <h3 className="text-2xl font-black leading-tight text-white sm:text-3xl">
                    Comparez <span className="gradient-text-gold">tous les prix</span> para
                  </h3>
                  <p className="mt-2 max-w-md text-sm leading-relaxed text-white/65">
                    Soins, beauté, hygiène et compléments. Comparez 9 enseignes et économisez sur chaque produit.
                  </p>
                  {/* category badges */}
                  <div className="mt-4 flex flex-wrap items-center justify-center gap-2 lg:justify-start">
                    {["Visage", "Cheveux", "Corps & Bain", "Bébé & Maman"].map((s) => (
                      <span
                        key={s}
                        className="rounded-lg border border-white/10 bg-white/[0.04] px-2.5 py-1 text-xs font-semibold text-white/75"
                      >
                        {s}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Right: stats + CTA */}
              <div className="flex shrink-0 flex-col items-center gap-4 lg:items-end">
                <div className="flex gap-3">
                  <div className="rounded-2xl border border-white/10 bg-white/[0.04] px-5 py-3 text-center">
                    <div className="text-2xl font-black tabular-nums text-white">−30%</div>
                    <div className="text-[11px] font-medium text-white/50">économie max</div>
                  </div>
                  <div className="rounded-2xl border border-white/10 bg-white/[0.04] px-5 py-3 text-center">
                    <div className="text-2xl font-black tabular-nums text-white">9</div>
                    <div className="text-[11px] font-medium text-white/50">enseignes</div>
                  </div>
                </div>
                <Link
                  href="/comparateur"
                  className="group relative inline-flex w-full items-center justify-center gap-2 overflow-hidden rounded-2xl bg-gradient-to-r from-brand-red to-brand-redDark px-7 py-3.5 text-sm font-bold text-white shadow-[0_8px_24px_-6px_rgba(225,29,45,0.6)] ring-1 ring-white/10 transition-all hover:scale-[1.02] hover:shadow-[0_10px_30px_-4px_rgba(225,29,45,0.7)] active:scale-[0.98] sm:w-auto"
                >
                  <FlaskConical className="h-4 w-4" />
                  Lancer le comparateur
                  <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" />
                  <span className="pointer-events-none absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/25 to-transparent transition-transform duration-700 group-hover:translate-x-full" />
                </Link>
              </div>
            </div>
          </div>
        </Reveal>
      </section>

      {/* ── Ranking des sites parapharmacie ──────────────────────────────── */}
      <section className="mx-auto mt-10 max-w-[1600px] px-4 pb-4">
        <Reveal>
          <ParaRanking />
        </Reveal>
      </section>

      <Footer />
    </main>
  );
}
