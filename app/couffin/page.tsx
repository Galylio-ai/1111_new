"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import {
  AlertCircle, Check, ChevronRight, Crown, Loader2, Minus,
  Plus, Search, ShoppingBasket, Sparkles, Store, Trash2, X,
} from "lucide-react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Reveal } from "@/components/site/Reveal";
import { getStoreLogo } from "@/lib/data";

type SearchItem = { id: number; name: string; brand: string; img: string; minPrice: number; maxPrice: number; shopCount: number };
type BasketItem = { id: number; name: string; img: string; qty: number };
type ShopResult = { shopKey: string; shop: string; total: number; covered: number; totalItems: number; lines: { id: number; price: number | null }[] };
type MixLine   = { id: number; name: string; qty: number; shop: string | null; price: number | null };
type ComputeResp = {
  items: { id: number; name: string; img: string; qty: number; found: boolean }[];
  shops: ShopResult[];
  cheapestMix: { total: number; covered: number; totalItems: number; lines: MixLine[] } | null;
};

const STORAGE_KEY = "couffin_basket_v1";
const fmt = (n: number) => n.toLocaleString("fr-FR", { minimumFractionDigits: 3, maximumFractionDigits: 3 });

function useDebounced<T>(v: T, ms = 280) {
  const [d, setD] = useState(v);
  useEffect(() => { const t = setTimeout(() => setD(v), ms); return () => clearTimeout(t); }, [v, ms]);
  return d;
}

export default function CouffinPage() {
  const [basket,    setBasket]    = useState<BasketItem[]>([]);
  const [query,     setQuery]     = useState("");
  const [results,   setResults]   = useState<SearchItem[]>([]);
  const [searching, setSearching] = useState(false);
  const [open,      setOpen]      = useState(false);
  const [data,      setData]      = useState<ComputeResp | null>(null);
  const [computing, setComputing] = useState(false);
  const [error,     setError]     = useState<string | null>(null);
  const boxRef    = useRef<HTMLDivElement>(null);
  const debounced = useDebounced(query);

  // ── persist basket ──
  useEffect(() => {
    try { const r = localStorage.getItem(STORAGE_KEY); if (r) setBasket(JSON.parse(r)); } catch {}
  }, []);
  useEffect(() => {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(basket)); } catch {}
  }, [basket]);

  // ── search ──
  useEffect(() => {
    if (debounced.trim().length < 2) { setResults([]); return; }
    let cancelled = false;
    setSearching(true);
    fetch(`/api/couffin/search?q=${encodeURIComponent(debounced)}&limit=8`)
      .then(r => r.json())
      .then(d => { if (!cancelled) setResults(d.items ?? []); })
      .catch(() => { if (!cancelled) setResults([]); })
      .finally(() => { if (!cancelled) setSearching(false); });
    return () => { cancelled = true; };
  }, [debounced]);

  // close dropdown on outside click
  useEffect(() => {
    const h = (e: MouseEvent) => { if (boxRef.current && !boxRef.current.contains(e.target as Node)) setOpen(false); };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);

  // ── compute ──
  const compute = useCallback(async (b: BasketItem[]) => {
    if (b.length === 0) { setData(null); setError(null); return; }
    setComputing(true);
    setError(null);
    try {
      const r = await fetch("/api/couffin/compute", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ items: b.map(i => ({ id: i.id, qty: i.qty })) }),
      });
      if (!r.ok) throw new Error(`HTTP ${r.status}`);
      const json = await r.json();
      if (json.error) throw new Error(json.error);
      setData(json);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Erreur de calcul");
      setData(null);
    } finally {
      setComputing(false);
    }
  }, []);

  useEffect(() => { compute(basket); }, [basket, compute]);

  // ── basket ops ──
  const inBasket = (id: number) => basket.some(b => b.id === id);
  function add(it: SearchItem) {
    if (inBasket(it.id)) return;
    setBasket(b => [...b, { id: it.id, name: it.name, img: it.img, qty: 1 }]);
    setQuery(""); setResults([]); setOpen(false);
  }
  function remove(id: number) { setBasket(b => b.filter(x => x.id !== id)); }
  function setQty(id: number, qty: number) {
    setBasket(b => b.map(x => x.id === id ? { ...x, qty: Math.max(1, Math.min(99, qty)) } : x));
  }
  function clear() { setBasket([]); setData(null); }

  // shops sorted: full-coverage first (those covering all items), then by total asc
  const fullShops = data?.shops.filter(s => s.covered === s.totalItems) ?? [];
  const partShops = data?.shops.filter(s => s.covered < s.totalItems && s.covered > 0) ?? [];
  const winner = fullShops[0] ?? partShops[0] ?? null;
  const mix    = data?.cheapestMix ?? null;

  // savings vs winner
  const savings = winner && mix && mix.total < winner.total - 0.001
    ? winner.total - mix.total
    : null;

  // price per item from compute result (for basket list enrichment)
  const priceForItem = (id: number): number | null => {
    if (!winner || !data) return null;
    const line = winner.lines.find(l => l.id === id);
    return line?.price ?? null;
  };

  return (
    <main className="min-h-screen bg-slate-50 dark:bg-[#080c18]">
      <Header />

      {/* ── Breadcrumb ── */}
      <div className="mx-auto max-w-[1400px] px-4 pt-5">
        <nav className="mb-5 flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-400 dark:text-white/40">
          <Link href="/" className="transition-colors hover:text-brand-gold">Accueil</Link>
          <ChevronRight className="h-3 w-3 opacity-60" />
          <span className="text-brand-gold">Couffin Tounsi</span>
        </nav>

        {/* ── Hero ── */}
        <Reveal>
          <div className="relative overflow-hidden rounded-3xl border border-slate-200 bg-white p-7 sm:p-9 dark:border-white/[0.07] dark:bg-[#0d1220]">
            <div className="pointer-events-none absolute -left-20 -top-20 h-72 w-72 rounded-full bg-brand-gold/10 blur-3xl" />
            <div className="pointer-events-none absolute -right-12 -bottom-10 h-60 w-60 rounded-full bg-emerald-500/10 blur-3xl" />
            <div className="relative flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
              <div className="flex items-start gap-5">
                <div className="relative shrink-0">
                  <div className="absolute inset-0 -z-10 rounded-2xl bg-brand-gold/25 blur-2xl" />
                  <img
                    src="/couffin.png"
                    alt="Couffin Tounsi"
                    className="h-20 w-20 rounded-2xl object-cover shadow-[0_8px_32px_-8px_rgba(246,196,83,0.5)] ring-1 ring-brand-gold/30 animate-[float_3s_ease-in-out_infinite]"
                  />
                </div>
                <div>
                  <h1 className="text-3xl font-black tracking-tight text-slate-900 sm:text-4xl dark:text-white">
                    Couffin <span className="gradient-text-gold">Tounsi</span>
                  </h1>
                  <p className="mt-1 font-arabic text-sm text-slate-500 dark:text-white/50" dir="rtl">
                    القفة التونسية — احسب أرخص محل لقائمة مشترياتك
                  </p>
                  <p className="mt-2 max-w-xl text-sm leading-relaxed text-slate-600 dark:text-white/65">
                    Composez votre liste de courses. On calcule
                    <span className="font-bold text-slate-900 dark:text-white"> automatiquement où votre panier coûte le moins cher</span> parmi toutes les enseignes indexées.
                  </p>
                </div>
              </div>
              <div className="flex shrink-0 gap-3">
                <div className="rounded-2xl border border-brand-gold/25 bg-brand-gold/10 px-5 py-3 text-center">
                  <div className="text-2xl font-black tabular-nums leading-none text-brand-gold">{basket.length}</div>
                  <div className="mt-1 text-[10px] font-semibold uppercase tracking-wider text-brand-gold/70">Articles</div>
                </div>
                {data && data.shops.length > 0 && (
                  <div className="rounded-2xl border border-emerald-500/25 bg-emerald-500/10 px-5 py-3 text-center">
                    <div className="text-2xl font-black tabular-nums leading-none text-emerald-600 dark:text-emerald-300">{data.shops.length}</div>
                    <div className="mt-1 text-[10px] font-semibold uppercase tracking-wider text-emerald-600/70 dark:text-emerald-300/70">Enseignes</div>
                  </div>
                )}
                {savings != null && (
                  <div className="rounded-2xl border border-purple-500/25 bg-purple-500/10 px-5 py-3 text-center">
                    <div className="text-lg font-black tabular-nums leading-none text-purple-600 dark:text-purple-300">{fmt(savings)}</div>
                    <div className="mt-1 text-[10px] font-semibold uppercase tracking-wider text-purple-600/70 dark:text-purple-300/70">Économie DT</div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </Reveal>
      </div>

      {/* ── Main grid ── */}
      <div className="mx-auto mt-6 grid max-w-[1400px] grid-cols-1 gap-6 px-4 pb-20 lg:grid-cols-[1fr_420px]">

        {/* ════ LEFT: search + basket ════ */}
        <div className="space-y-4">

          {/* Search box */}
          <div ref={boxRef} className="relative">
            <div className={`flex items-center gap-2 rounded-2xl border bg-white px-3 py-2.5 shadow-sm transition-all dark:bg-[#0d1220] ${open ? "border-brand-gold/60 ring-2 ring-brand-gold/15 shadow-[0_0_0_4px_rgba(246,196,83,0.08)]" : "border-slate-200 dark:border-white/10"}`}>
              <Search className="ml-1 h-5 w-5 shrink-0 text-slate-400 dark:text-white/40" />
              <input
                value={query}
                onChange={e => { setQuery(e.target.value); setOpen(true); }}
                onFocus={() => setOpen(true)}
                placeholder="Titre, SKU ou nom exact (lait, huile…)"
                className="min-w-0 flex-1 bg-transparent py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none dark:text-white dark:placeholder:text-white/40"
              />
              {searching
                ? <Loader2 className="mr-1 h-4 w-4 animate-spin text-slate-400" />
                : query && <button onClick={() => { setQuery(""); setResults([]); }} className="mr-1 rounded-full p-0.5 text-slate-400 hover:text-slate-600"><X className="h-3.5 w-3.5" /></button>
              }
            </div>

            {/* Dropdown */}
            {open && query.trim().length >= 2 && (
              <div className="absolute z-40 mt-2 max-h-[400px] w-full overflow-y-auto rounded-2xl border border-slate-200 bg-white p-2 shadow-2xl dark:border-white/10 dark:bg-[#0d1220]">
                {results.length === 0 && !searching ? (
                  <div className="px-3 py-8 text-center">
                    <Search className="mx-auto mb-2 h-6 w-6 text-slate-300 dark:text-white/20" />
                    <p className="text-sm text-slate-400 dark:text-white/40">Aucun produit trouvé</p>
                  </div>
                ) : (
                  results.map(r => {
                    const added = inBasket(r.id);
                    return (
                      <button key={r.id} onClick={() => add(r)} disabled={added}
                        className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition ${added ? "opacity-50 cursor-default" : "hover:bg-slate-50 dark:hover:bg-white/[0.05]"}`}>
                        <span className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-slate-100 bg-white dark:border-white/10">
                          {r.img
                            ? <img src={r.img} alt="" referrerPolicy="no-referrer" className="h-full w-full object-cover" />
                            : <ShoppingBasket className="h-5 w-5 text-slate-300" />}
                        </span>
                        <div className="min-w-0 flex-1">
                          <div className="truncate text-[13px] font-semibold text-slate-900 dark:text-white">{r.name}</div>
                          <div className="flex items-center gap-2 text-[11px] text-slate-500 dark:text-white/50">
                            {r.brand && <span className="text-slate-400">{r.brand}</span>}
                            <span className="font-bold tabular-nums text-brand-gold">{fmt(r.minPrice)} DT</span>
                            <span className="inline-flex items-center gap-0.5 opacity-70"><Store className="h-3 w-3" />{r.shopCount}</span>
                          </div>
                        </div>
                        <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-xl text-sm font-bold transition ${added ? "bg-emerald-500/15 text-emerald-600" : "bg-brand-gold text-white"}`}>
                          {added ? <Check className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
                        </span>
                      </button>
                    );
                  })
                )}
              </div>
            )}
          </div>

          {/* Basket card */}
          <div className="rounded-2xl border border-slate-200 bg-white dark:border-white/[0.07] dark:bg-[#0d1220]">
            <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4 dark:border-white/[0.06]">
              <h2 className="flex items-center gap-2 text-sm font-black text-slate-900 dark:text-white">
                <ShoppingBasket className="h-4 w-4 text-brand-gold" />
                Mon couffin
                <span className="ml-0.5 rounded-full bg-brand-gold/15 px-2 py-0.5 text-[11px] font-bold tabular-nums text-brand-gold">{basket.length}</span>
              </h2>
              {basket.length > 0 && (
                <button onClick={clear} className="flex items-center gap-1.5 text-[11px] font-semibold text-slate-400 transition hover:text-red-500 dark:text-white/40">
                  <Trash2 className="h-3.5 w-3.5" /> Vider le couffin
                </button>
              )}
            </div>

            <div className="p-4">
              {basket.length === 0 ? (
                <div className="py-14 text-center">
                  <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-100 dark:bg-white/[0.05]">
                    <ShoppingBasket className="h-8 w-8 text-slate-300 dark:text-white/20" />
                  </div>
                  <p className="font-semibold text-slate-500 dark:text-white/50">Votre couffin est vide</p>
                  <p className="mt-1 text-xs text-slate-400 dark:text-white/35">Recherchez un produit ci-dessus pour commencer.</p>
                </div>
              ) : (
                <ul className="space-y-2.5">
                  {basket.map(b => {
                    const linePrice = priceForItem(b.id);
                    return (
                      <li key={b.id} className="group flex items-center gap-3 rounded-xl border border-slate-100 bg-slate-50 p-3 transition hover:border-slate-200 dark:border-white/[0.05] dark:bg-white/[0.03] dark:hover:border-white/10">
                        <span className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-slate-200 bg-white dark:border-white/10">
                          {b.img
                            ? <img src={b.img} alt="" referrerPolicy="no-referrer" className="h-full w-full object-cover" />
                            : <ShoppingBasket className="h-5 w-5 text-slate-300" />}
                        </span>
                        <div className="min-w-0 flex-1">
                          <div className="truncate text-[13px] font-semibold text-slate-800 dark:text-white/90">{b.name}</div>
                          {linePrice != null && (
                            <div className="mt-0.5 text-[11px] font-bold tabular-nums text-emerald-600 dark:text-emerald-400">
                              {fmt(linePrice * b.qty)} DT {b.qty > 1 && <span className="font-normal text-slate-400">({fmt(linePrice)} × {b.qty})</span>}
                            </div>
                          )}
                        </div>
                        {/* qty stepper */}
                        <div className="flex shrink-0 items-center gap-0.5 rounded-xl border border-slate-200 bg-white dark:border-white/10 dark:bg-white/[0.03]">
                          <button onClick={() => setQty(b.id, b.qty - 1)} className="flex h-8 w-8 items-center justify-center text-slate-400 transition hover:text-brand-gold"><Minus className="h-3.5 w-3.5" /></button>
                          <span className="w-6 text-center text-sm font-black tabular-nums text-slate-900 dark:text-white">{b.qty}</span>
                          <button onClick={() => setQty(b.id, b.qty + 1)} className="flex h-8 w-8 items-center justify-center text-slate-400 transition hover:text-brand-gold"><Plus className="h-3.5 w-3.5" /></button>
                        </div>
                        <button onClick={() => remove(b.id)} className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl text-slate-300 transition hover:bg-red-50 hover:text-red-500 dark:text-white/20 dark:hover:bg-red-500/10 dark:hover:text-red-400">
                          <X className="h-4 w-4" />
                        </button>
                      </li>
                    );
                  })}
                </ul>
              )}

              {/* basket total from winner */}
              {winner && basket.length > 0 && (
                <div className="mt-4 flex items-center justify-between rounded-xl border border-emerald-500/20 bg-emerald-500/[0.07] px-4 py-3">
                  <span className="text-xs font-semibold text-emerald-700 dark:text-emerald-400">Total estimé chez {winner.shop}</span>
                  <span className="text-base font-black tabular-nums text-emerald-700 dark:text-emerald-300">{fmt(winner.total)} DT</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ════ RIGHT: results panel ════ */}
        <div className="lg:sticky lg:top-[88px] lg:self-start">
          <div className="rounded-2xl border border-slate-200 bg-white dark:border-white/[0.07] dark:bg-[#0d1220]">

            <div className="flex items-center gap-2 border-b border-slate-100 px-5 py-4 dark:border-white/[0.06]">
              <Sparkles className="h-4 w-4 text-brand-gold" />
              <h2 className="text-sm font-black text-slate-900 dark:text-white">Comparatif par enseigne</h2>
            </div>

            <div className="p-5">
              {basket.length === 0 ? (
                <div className="py-10 text-center">
                  <Sparkles className="mx-auto mb-3 h-8 w-8 text-slate-200 dark:text-white/10" />
                  <p className="text-sm text-slate-400 dark:text-white/40">Ajoutez des articles pour voir le comparatif.</p>
                </div>
              ) : computing ? (
                <div className="flex flex-col items-center justify-center gap-3 py-12">
                  <Loader2 className="h-8 w-8 animate-spin text-brand-gold" />
                  <p className="text-xs text-slate-400 dark:text-white/40">Calcul en cours…</p>
                </div>
              ) : error ? (
                <div className="flex items-start gap-3 rounded-xl border border-red-500/20 bg-red-500/[0.07] p-4">
                  <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-red-500" />
                  <div>
                    <p className="text-sm font-semibold text-red-600 dark:text-red-400">Erreur de calcul</p>
                    <p className="mt-0.5 text-xs text-red-500/80">{error}</p>
                  </div>
                </div>
              ) : !data || data.shops.length === 0 ? (
                <div className="py-10 text-center">
                  <Store className="mx-auto mb-3 h-8 w-8 text-slate-200 dark:text-white/10" />
                  <p className="text-sm text-slate-400 dark:text-white/40">Aucune enseigne ne couvre ces produits.</p>
                  <p className="mt-1 text-xs text-slate-300 dark:text-white/25">Essayez d'autres produits.</p>
                </div>
              ) : (
                <div className="space-y-3">

                  {/* ── Winner card ── */}
                  {winner && (
                    <div className="relative overflow-hidden rounded-2xl border border-emerald-500/30 bg-gradient-to-br from-emerald-500/10 via-emerald-500/[0.05] to-transparent p-4">
                      <div className="pointer-events-none absolute -right-6 -top-6 h-24 w-24 rounded-full bg-emerald-500/10 blur-2xl" />
                      <div className="relative flex items-center justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <span className="flex h-12 w-12 items-center justify-center overflow-hidden rounded-xl bg-white p-1 ring-1 ring-emerald-500/20 dark:bg-white/10">
                            {getStoreLogo(winner.shop)
                              ? <img src={getStoreLogo(winner.shop)} alt={winner.shop} className="h-full w-full object-contain" />
                              : <span className="text-base font-black text-emerald-600">{winner.shop.charAt(0)}</span>}
                          </span>
                          <div>
                            <div className="flex items-center gap-1.5">
                              <Crown className="h-3.5 w-3.5 text-emerald-500" />
                              <span className="text-[10px] font-black uppercase tracking-wider text-emerald-600 dark:text-emerald-400">Meilleur prix</span>
                            </div>
                            <div className="text-base font-black text-slate-900 dark:text-white">{winner.shop}</div>
                            <div className="text-[11px] text-slate-500 dark:text-white/40">
                              {winner.covered}/{winner.totalItems} article{winner.totalItems > 1 ? "s" : ""} disponible{winner.covered > 1 ? "s" : ""}
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-2xl font-black tabular-nums text-emerald-600 dark:text-emerald-400">{fmt(winner.total)}</div>
                          <div className="text-xs font-semibold text-emerald-600/70 dark:text-emerald-400/70">DT</div>
                        </div>
                      </div>

                      {/* per-item prices in winner */}
                      <div className="relative mt-3 space-y-1 border-t border-emerald-500/15 pt-3">
                        {data.items.map(it => {
                          const line = winner.lines.find(l => l.id === it.id);
                          const qty  = basket.find(b => b.id === it.id)?.qty ?? 1;
                          return (
                            <div key={it.id} className="flex items-center justify-between text-[11px]">
                              <span className="truncate text-slate-600 dark:text-white/60">{it.name}</span>
                              {line?.price != null
                                ? <span className="ml-2 shrink-0 tabular-nums text-slate-800 dark:text-white/80">{fmt(line.price * qty)} DT</span>
                                : <span className="ml-2 shrink-0 text-red-400">non dispo</span>}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* ── Other shops ── */}
                  {(fullShops.length > 1 || partShops.length > 0) && (
                    <div className="space-y-2">
                      <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-white/30">Autres enseignes</p>
                      {[...fullShops.slice(1), ...partShops].map(s => {
                        const diff    = winner ? s.total - winner.total : 0;
                        const partial = s.covered < s.totalItems;
                        return (
                          <div key={s.shopKey} className="flex items-center gap-3 rounded-xl border border-slate-100 bg-slate-50 px-3 py-2.5 dark:border-white/[0.05] dark:bg-white/[0.02]">
                            <span className="flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-white p-1 ring-1 ring-slate-200 dark:ring-white/10">
                              {getStoreLogo(s.shop)
                                ? <img src={getStoreLogo(s.shop)} alt={s.shop} className="h-full w-full object-contain" />
                                : <span className="text-xs font-black text-brand-gold">{s.shop.charAt(0)}</span>}
                            </span>
                            <div className="min-w-0 flex-1">
                              <div className="flex items-center gap-1.5">
                                <span className="truncate text-[13px] font-bold text-slate-800 dark:text-white/90">{s.shop}</span>
                                {partial && (
                                  <span className="shrink-0 rounded-full bg-orange-500/10 px-1.5 py-0.5 text-[9px] font-bold text-orange-500">partiel</span>
                                )}
                              </div>
                              <div className="text-[11px] text-slate-400 dark:text-white/40">{s.covered}/{s.totalItems} articles</div>
                            </div>
                            <div className="text-right">
                              <div className="text-sm font-black tabular-nums text-slate-900 dark:text-white">{fmt(s.total)} DT</div>
                              {diff > 0.001 && <div className="text-[10px] font-semibold text-red-400">+{fmt(diff)} DT</div>}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {/* ── Cheapest mix ── */}
                  {mix && mix.covered > 0 && savings != null && savings > 0.001 && (
                    <div className="rounded-xl border border-brand-gold/30 bg-gradient-to-br from-brand-gold/10 to-brand-gold/[0.03] p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1.5">
                          <Sparkles className="h-3.5 w-3.5 text-brand-gold" />
                          <span className="text-[11px] font-black uppercase tracking-wider text-brand-gold">Mix optimal</span>
                        </div>
                        <span className="rounded-full bg-emerald-500/15 px-2 py-0.5 text-[11px] font-black text-emerald-600 dark:text-emerald-400">
                          −{fmt(savings)} DT
                        </span>
                      </div>
                      <div className="mt-2 text-xl font-black tabular-nums text-slate-900 dark:text-white">{fmt(mix.total)} DT</div>
                      <p className="mt-1 text-[11px] text-slate-500 dark:text-white/50">
                        En achetant chaque article au magasin le moins cher ({mix.covered}/{mix.totalItems} trouvés).
                      </p>
                      <div className="mt-3 space-y-1.5 border-t border-brand-gold/15 pt-3">
                        {mix.lines.filter(l => l.shop).map(l => (
                          <div key={l.id} className="flex items-center justify-between text-[11px]">
                            <span className="truncate text-slate-600 dark:text-white/60">{l.name}</span>
                            <span className="ml-2 shrink-0 text-right">
                              <span className="font-semibold text-brand-gold">{l.shop}</span>
                              {l.price != null && <span className="ml-1.5 tabular-nums text-slate-700 dark:text-white/70">{fmt(l.price * l.qty)} DT</span>}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </main>
  );
}
