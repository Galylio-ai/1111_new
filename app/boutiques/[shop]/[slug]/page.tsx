"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { ChevronRight, ExternalLink, Loader2, Package, Store, Tag } from "lucide-react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";

type Detail = {
  name: string;
  brand: string;
  shop: string;
  shopSlug: string;
  url: string | null;
  img: string;
  images: string[];
  price: number | null;
  oldPrice: number | null;
  discount: number | null;
  available: boolean | null;
  availability: string | null;
  category: { top: string | null; low: string | null; sub: string | null };
  sku: string | null;
  barcode: string | null;
  overview: string | null;
  description: string | null;
  specifications: Record<string, string> | null;
  priceHistory: { price: number; date: string }[];
  related: { slug: string; name: string; img: string; price: number | null }[];
};

const fmt = (n: number) => n.toLocaleString("fr-FR", { minimumFractionDigits: 0, maximumFractionDigits: 3 });

export default function ProductDetailPage() {
  const { shop, slug } = useParams<{ shop: string; slug: string }>();
  const [data, setData]       = useState<Detail | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeImg, setActiveImg] = useState(0);

  useEffect(() => {
    fetch(`/api/catalog/products/${slug}?shop=${shop}`)
      .then(r => r.ok ? r.json() : null)
      .then(d => setData(d && !d.error ? d : null))
      .finally(() => setLoading(false));
  }, [shop, slug]);

  if (loading) {
    return (
      <main className="min-h-screen bg-white dark:bg-[#0a0e1a]">
        <Header />
        <div className="flex items-center justify-center py-40"><Loader2 className="h-8 w-8 animate-spin text-brand-gold" /></div>
        <Footer />
      </main>
    );
  }

  if (!data) {
    return (
      <main className="min-h-screen bg-white dark:bg-[#0a0e1a]">
        <Header />
        <div className="mx-auto max-w-[1600px] px-4 py-40 text-center">
          <Package className="mx-auto mb-4 h-12 w-12 text-slate-300 dark:text-white/20" />
          <p className="font-bold text-slate-700 dark:text-white/80">Produit introuvable</p>
          <Link href={`/boutiques/${shop}`} className="mt-4 inline-block rounded-xl border border-brand-gold/30 bg-brand-gold/10 px-4 py-2 text-sm font-semibold text-brand-gold">
            ← Retour au catalogue
          </Link>
        </div>
        <Footer />
      </main>
    );
  }

  const images = data.images.length ? data.images : (data.img ? [data.img] : []);
  const ph = data.priceHistory;
  const phMin = ph.length ? Math.min(...ph.map(p => p.price)) : 0;
  const phMax = ph.length ? Math.max(...ph.map(p => p.price)) : 0;

  return (
    <main className="min-h-screen bg-white dark:bg-[#0a0e1a]">
      <Header />

      <div className="mx-auto max-w-[1600px] px-4 pt-5">
        {/* Breadcrumb */}
        <nav className="mb-5 flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-400 dark:text-white/40">
          <Link href="/" className="transition-colors hover:text-brand-gold">Accueil</Link>
          <ChevronRight className="h-3 w-3 opacity-60" />
          <Link href="/boutiques" className="transition-colors hover:text-brand-gold">Boutiques</Link>
          <ChevronRight className="h-3 w-3 opacity-60" />
          <Link href={`/boutiques/${data.shopSlug}`} className="capitalize transition-colors hover:text-brand-gold">{data.shop}</Link>
          <ChevronRight className="h-3 w-3 opacity-60" />
          <span className="truncate text-brand-gold">{data.name}</span>
        </nav>

        <div className="grid gap-8 lg:grid-cols-2">
          {/* ── Gallery ──────────────────────────────────────────────────── */}
          <div>
            <div className="relative flex h-[420px] items-center justify-center overflow-hidden rounded-3xl border border-slate-200 bg-white dark:border-white/[0.07] dark:bg-white/[0.02]">
              {images.length ? (
                <img src={images[activeImg]} alt={data.name} referrerPolicy="no-referrer" className="max-h-[90%] max-w-[90%] object-contain" />
              ) : (
                <Package className="h-20 w-20 text-slate-200 dark:text-white/10" />
              )}
              {data.discount && data.discount > 0 && (
                <span className="absolute left-4 top-4 rounded-full bg-brand-red px-3 py-1 text-xs font-black text-white shadow">−{data.discount}%</span>
              )}
            </div>
            {images.length > 1 && (
              <div className="mt-3 flex gap-2 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                {images.slice(0, 8).map((im, i) => (
                  <button key={i} onClick={() => setActiveImg(i)}
                    className={`flex h-16 w-16 shrink-0 cursor-pointer items-center justify-center overflow-hidden rounded-xl border bg-white transition dark:bg-white/[0.03] ${activeImg === i ? "border-brand-gold ring-2 ring-brand-gold/30" : "border-slate-200 hover:border-brand-gold/40 dark:border-white/10"}`}>
                    <img src={im} alt="" referrerPolicy="no-referrer" className="max-h-full max-w-full object-contain" loading="lazy" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* ── Info ─────────────────────────────────────────────────────── */}
          <div>
            <Link href={`/boutiques/${data.shopSlug}`} className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-slate-600 transition hover:border-brand-gold/40 hover:text-brand-gold dark:border-white/10 dark:bg-white/[0.04] dark:text-white/60">
              <Store className="h-3 w-3" /> {data.shop}
            </Link>

            {data.brand && <div className="mt-3 text-xs font-bold uppercase tracking-wider text-brand-gold/80">{data.brand}</div>}
            <h1 className="mt-1 text-2xl font-black leading-tight text-slate-900 sm:text-3xl dark:text-white">{data.name}</h1>

            <div className="mt-3 flex flex-wrap gap-1.5">
              {[data.category.top, data.category.low, data.category.sub].filter(Boolean).map((c, i) => (
                <span key={i} className="rounded-md bg-slate-100 px-2 py-0.5 text-[10px] font-semibold text-slate-500 dark:bg-white/[0.06] dark:text-white/50">{c}</span>
              ))}
            </div>

            {/* price */}
            <div className="mt-5 flex items-end gap-3">
              {data.price != null ? (
                <span className="text-4xl font-black text-brand-gold tabular-nums">{fmt(data.price)} <span className="text-lg font-bold">DT</span></span>
              ) : (
                <span className="text-xl font-semibold text-slate-400">Prix non communiqué</span>
              )}
              {data.oldPrice && data.price && data.oldPrice > data.price && (
                <span className="pb-1.5 text-lg text-slate-400 line-through dark:text-white/35 tabular-nums">{fmt(data.oldPrice)} DT</span>
              )}
            </div>

            {/* availability */}
            <div className="mt-3">
              {data.available === true ? (
                <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300">● {data.availability || "En stock"}</span>
              ) : data.available === false ? (
                <span className="inline-flex items-center gap-1.5 rounded-full bg-red-50 px-3 py-1 text-xs font-bold text-red-600 dark:bg-red-500/10 dark:text-red-300">● {data.availability || "Rupture de stock"}</span>
              ) : data.availability ? (
                <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-600 dark:bg-white/[0.06] dark:text-white/60">{data.availability}</span>
              ) : null}
            </div>

            {/* meta */}
            <div className="mt-4 flex flex-wrap gap-x-6 gap-y-1 text-xs text-slate-500 dark:text-white/50">
              {data.sku && <span>SKU: <span className="font-semibold text-slate-700 dark:text-white/80">{data.sku}</span></span>}
              {data.barcode && <span>Code-barres: <span className="font-semibold text-slate-700 dark:text-white/80">{data.barcode}</span></span>}
            </div>

            {/* CTA to source */}
            {data.url && (
              <a href={data.url} target="_blank" rel="noopener noreferrer"
                className="mt-6 inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-brand-red to-brand-redDark px-6 py-3 text-sm font-bold text-white shadow-[0_8px_24px_-6px_rgba(225,29,45,0.5)] transition hover:scale-[1.02]">
                Voir sur {data.shop} <ExternalLink className="h-4 w-4" />
              </a>
            )}

            {data.overview && (
              <p className="mt-6 text-sm leading-relaxed text-slate-600 dark:text-white/65">{data.overview}</p>
            )}
          </div>
        </div>

        {/* ── Price history ──────────────────────────────────────────────── */}
        {ph.length > 1 && (
          <section className="mt-12">
            <h2 className="mb-4 flex items-center gap-2 text-lg font-black text-slate-900 dark:text-white">
              <Tag className="h-5 w-5 text-brand-gold" /> Historique des prix
            </h2>
            <div className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-white/[0.07] dark:bg-white/[0.02]">
              <div className="flex h-32 items-end gap-1">
                {ph.map((pt, i) => {
                  const h = phMax > phMin ? 8 + ((pt.price - phMin) / (phMax - phMin)) * 92 : 50;
                  return (
                    <div key={i} className="group/bar relative flex-1" style={{ height: "100%" }}>
                      <div className="absolute bottom-0 w-full rounded-t bg-gradient-to-t from-brand-gold/40 to-brand-gold transition-all group-hover/bar:from-brand-gold group-hover/bar:to-brand-goldDark"
                        style={{ height: `${h}%` }} />
                      <div className="pointer-events-none absolute -top-7 left-1/2 -translate-x-1/2 whitespace-nowrap rounded bg-slate-900 px-1.5 py-0.5 text-[10px] font-bold text-white opacity-0 transition group-hover/bar:opacity-100">
                        {fmt(pt.price)} DT
                      </div>
                    </div>
                  );
                })}
              </div>
              <div className="mt-3 flex justify-between text-[11px] text-slate-400 dark:text-white/40">
                <span>{new Date(ph[0].date).toLocaleDateString("fr-FR")}</span>
                <span className="font-semibold">Min {fmt(phMin)} DT · Max {fmt(phMax)} DT</span>
                <span>{new Date(ph[ph.length - 1].date).toLocaleDateString("fr-FR")}</span>
              </div>
            </div>
          </section>
        )}

        {/* ── Specifications ─────────────────────────────────────────────── */}
        {data.specifications && Object.keys(data.specifications).length > 0 && (
          <section className="mt-12">
            <h2 className="mb-4 text-lg font-black text-slate-900 dark:text-white">Caractéristiques</h2>
            <div className="overflow-hidden rounded-2xl border border-slate-200 dark:border-white/[0.07]">
              <table className="w-full text-sm">
                <tbody>
                  {Object.entries(data.specifications).map(([k, v], i) => (
                    <tr key={k} className={i % 2 ? "bg-slate-50/60 dark:bg-white/[0.02]" : ""}>
                      <td className="w-1/3 px-4 py-2.5 font-semibold text-slate-600 dark:text-white/60">{k}</td>
                      <td className="px-4 py-2.5 text-slate-800 dark:text-white/85">{String(v)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        )}

        {/* ── Description ────────────────────────────────────────────────── */}
        {data.description && (
          <section className="mt-12">
            <h2 className="mb-4 text-lg font-black text-slate-900 dark:text-white">Description</h2>
            <div className="rounded-2xl border border-slate-200 bg-white p-5 text-sm leading-relaxed text-slate-600 dark:border-white/[0.07] dark:bg-white/[0.02] dark:text-white/65 whitespace-pre-line">
              {data.description}
            </div>
          </section>
        )}

        {/* ── Related ────────────────────────────────────────────────────── */}
        {data.related.length > 0 && (
          <section className="mt-12 pb-16">
            <h2 className="mb-4 text-lg font-black text-slate-900 dark:text-white">Produits similaires</h2>
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-4 lg:grid-cols-6">
              {data.related.map(r => (
                <Link key={r.slug} href={`/boutiques/${shop}/${r.slug}`}
                  className="card group flex flex-col overflow-hidden p-0 transition hover:-translate-y-1 hover:border-brand-gold/40">
                  <div className="flex h-32 items-center justify-center overflow-hidden bg-white dark:bg-white/[0.03]">
                    {r.img ? <img src={r.img} alt={r.name} referrerPolicy="no-referrer" className="max-h-full max-w-full object-contain p-2 transition group-hover:scale-105" loading="lazy" /> : <Package className="h-8 w-8 text-slate-200" />}
                  </div>
                  <div className="flex flex-1 flex-col p-2.5">
                    <h3 className="text-[11px] font-semibold leading-snug text-slate-800 line-clamp-2 dark:text-white/85">{r.name}</h3>
                    {r.price != null && <div className="mt-auto pt-1.5 text-sm font-black text-brand-gold tabular-nums">{fmt(r.price)} DT</div>}
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}
      </div>

      <Footer />
    </main>
  );
}
