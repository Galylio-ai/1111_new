"use client";
import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { ChevronDown, ChevronRight, LayoutGrid, Search, Store, Tag, X } from "lucide-react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Reveal } from "@/components/site/Reveal";

type Category = { name: string; count: number };
type Shop = {
  slug: string;
  key: string;
  name: string;
  logo: string | null;
  count: number;
  categories: Category[];
};

function normKey(s: string) {
  return s.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "");
}

// How many category chips to show before "Voir plus".
const COLLAPSED = 10;

export default function CategoriesPage() {
  const [shops, setShops]     = useState<Shop[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch]   = useState("");
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});

  useEffect(() => {
    fetch("/api/catalog/shop-categories")
      .then(r => r.json())
      .then(d => setShops(d.shops ?? []))
      .finally(() => setLoading(false));
  }, []);

  const q = normKey(search.trim());

  /* Filter shops by name OR by matching category. When the query matches a
     category (not the shop name), only the matching categories are shown. */
  const filtered = useMemo(() => {
    if (!q) return shops;
    return shops
      .map(s => {
        const shopMatches = normKey(s.name).includes(q);
        const cats = shopMatches ? s.categories : s.categories.filter(c => normKey(c.name).includes(q));
        return { ...s, categories: cats, _shopMatches: shopMatches };
      })
      .filter(s => s.categories.length > 0)
      .sort((a, b) => Number(b._shopMatches) - Number(a._shopMatches) || b.count - a.count);
  }, [shops, q]);

  const totalShops = shops.length;
  const totalCats  = useMemo(() => shops.reduce((n, s) => n + s.categories.length, 0), [shops]);

  return (
    <main className="min-h-screen bg-white dark:bg-[#0a0e1a]">
      <Header />

      {/* ── Breadcrumb ──────────────────────────────────────────────────── */}
      <div className="mx-auto max-w-[1600px] px-4 pt-5">
        <nav className="mb-4 flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-400 dark:text-white/40">
          <Link href="/" className="transition hover:text-brand-gold">Accueil</Link>
          <ChevronRight className="h-3 w-3 opacity-60" />
          <span className="text-brand-gold">Catégories</span>
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
                  <LayoutGrid className="h-3 w-3" /> Catégories par boutique
                </span>
                <h1 className="text-3xl font-black leading-tight tracking-tight text-slate-900 sm:text-[2.6rem] dark:text-white">
                  Toutes les <span className="gradient-text-gold">catégories</span>
                </h1>
                <p className="mt-2 font-arabic text-base text-slate-500 dark:text-white/50" dir="rtl">
                  تصفّح الأقسام في كل حانوت على حدة
                </p>
                <p className="mt-3 max-w-md text-[15px] leading-relaxed text-slate-600 dark:text-white/65">
                  Chaque boutique avec ses propres rayons — cliquez une catégorie pour
                  parcourir directement son catalogue filtré.
                </p>
              </div>

              <div className="flex shrink-0 gap-3">
                {[
                  { label: "Boutiques", value: loading ? "—" : String(totalShops), icon: Store, cls: "border-brand-gold/25 bg-brand-gold/[0.08] text-brand-gold" },
                  { label: "Catégories", value: loading ? "—" : totalCats.toLocaleString("fr-FR"), icon: Tag, cls: "border-blue-400/25 bg-blue-400/[0.08] text-blue-500 dark:text-blue-300" },
                ].map(c => (
                  <div key={c.label} className={`flex min-w-[120px] flex-col gap-1 rounded-2xl border px-4 py-3 backdrop-blur-sm ${c.cls}`}>
                    <c.icon className="h-4 w-4 opacity-80" />
                    <div className="text-2xl font-black tabular-nums leading-none">{c.value}</div>
                    <div className="text-[10px] font-semibold uppercase tracking-wider opacity-80">{c.label}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </Reveal>
      </div>

      {/* ── Search (sticky) ─────────────────────────────────────────────────── */}
      <div className="sticky top-[68px] z-30 mx-auto mt-6 max-w-[1600px] px-4">
        <div className="rounded-2xl border border-slate-200/80 bg-white/85 p-2 shadow-sm backdrop-blur-md dark:border-white/[0.07] dark:bg-[#0d1220]/85">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400 dark:text-white/30" />
            <label htmlFor="cat-search" className="sr-only">Rechercher une boutique ou une catégorie</label>
            <input
              id="cat-search"
              type="search"
              placeholder="Rechercher une boutique ou une catégorie…"
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

      {/* ── Per-shop categories ─────────────────────────────────────────────── */}
      <section className="mx-auto mt-6 max-w-[1600px] px-4 pb-16">
        {loading ? (
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-52 animate-pulse rounded-2xl bg-slate-100 dark:bg-white/[0.04]" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="py-24 text-center">
            <LayoutGrid className="mx-auto mb-4 h-10 w-10 text-slate-300 dark:text-white/20" />
            <p className="font-bold text-slate-700 dark:text-white/80">Aucun résultat</p>
            <p className="mt-1 text-sm text-slate-400 dark:text-white/40">Essayez un autre nom de boutique ou de catégorie.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            {filtered.map((shop, i) => {
              const isOpen = !!expanded[shop.slug] || !!q;
              const cats = isOpen ? shop.categories : shop.categories.slice(0, COLLAPSED);
              const hidden = shop.categories.length - cats.length;
              const maxCount = Math.max(...shop.categories.map(c => c.count), 1);

              return (
                <Reveal key={shop.slug} delay={Math.min(i, 10) * 0.05}>
                  <div className="group flex h-full flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white transition-all duration-300 hover:border-brand-gold/40 hover:shadow-[0_18px_40px_-14px_rgba(0,0,0,0.18)] dark:border-white/[0.07] dark:bg-white/[0.02] dark:hover:shadow-[0_18px_44px_-12px_rgba(0,0,0,0.6)]">
                    {/* shop header */}
                    <Link
                      href={`/boutiques/${shop.slug}`}
                      className="flex items-center gap-3 border-b border-slate-100 bg-gradient-to-r from-slate-50 to-transparent p-4 transition hover:from-brand-gold/[0.06] dark:border-white/[0.06] dark:from-white/[0.03]"
                    >
                      <div className="relative flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-slate-200 bg-white dark:border-white/10">
                        <span className="absolute text-base font-black text-brand-gold">{shop.name.charAt(0).toUpperCase()}</span>
                        {shop.logo && (
                          <img src={shop.logo} alt={shop.name}
                            className="relative z-10 max-h-9 max-w-[80%] object-contain transition-transform duration-500 group-hover:scale-110"
                            loading="lazy"
                            onError={e => { (e.currentTarget as HTMLImageElement).style.display = "none"; }}
                          />
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <h3 className="truncate text-[15px] font-black text-slate-900 dark:text-white">{shop.name}</h3>
                        <div className="mt-0.5 flex items-center gap-3 text-[11px] text-slate-500 dark:text-white/45">
                          <span className="inline-flex items-center gap-1">
                            <Tag className="h-3 w-3" />
                            <span className="font-bold tabular-nums">{shop.categories.length}</span> catégories
                          </span>
                          <span className="inline-flex items-center gap-1">
                            <Store className="h-3 w-3" />
                            <span className="font-bold tabular-nums">{shop.count.toLocaleString("fr-FR")}</span> produits
                          </span>
                        </div>
                      </div>
                      <ChevronRight className="h-4 w-4 shrink-0 text-brand-gold transition group-hover:translate-x-0.5" />
                    </Link>

                    {/* category chips */}
                    <div className="flex flex-1 flex-col p-4">
                      <div className="flex flex-wrap gap-2">
                        {cats.map(c => {
                          const intensity = 0.06 + (c.count / maxCount) * 0.12;
                          return (
                            <Link
                              key={c.name}
                              href={`/boutiques/${shop.slug}?cat=${encodeURIComponent(c.name)}`}
                              style={{ backgroundColor: `rgba(246,196,83,${intensity})` }}
                              className="group/chip flex items-center gap-1.5 rounded-full border border-slate-200 px-3 py-1 text-xs font-semibold text-slate-700 transition hover:-translate-y-0.5 hover:border-brand-gold/50 hover:text-brand-gold dark:border-white/10 dark:text-white/75 dark:hover:border-brand-gold/40 dark:hover:text-brand-gold"
                            >
                              <span className="capitalize">{c.name}</span>
                              <span className="rounded-full bg-white/70 px-1.5 py-0.5 text-[9px] font-bold tabular-nums text-slate-500 dark:bg-black/30 dark:text-white/50">
                                {c.count.toLocaleString("fr-FR")}
                              </span>
                            </Link>
                          );
                        })}
                      </div>

                      {!q && hidden > 0 && (
                        <button
                          onClick={() => setExpanded(e => ({ ...e, [shop.slug]: !e[shop.slug] }))}
                          className="mt-3 inline-flex items-center gap-1 self-start text-[11px] font-bold text-brand-gold transition hover:gap-1.5"
                        >
                          {isOpen ? "Voir moins" : `+ ${hidden} autres catégories`}
                          <ChevronDown className={`h-3.5 w-3.5 transition-transform ${isOpen ? "rotate-180" : ""}`} />
                        </button>
                      )}
                    </div>
                  </div>
                </Reveal>
              );
            })}
          </div>
        )}
      </section>

      <Footer />
    </main>
  );
}
