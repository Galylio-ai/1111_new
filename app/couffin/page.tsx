"use client";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import {
  Check, ChevronRight, Crown, Loader2, Minus, Plus, Search, ShoppingBasket,
  Sparkles, Store, Trash2, X,
} from "lucide-react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Reveal } from "@/components/site/Reveal";
import { getStoreLogo } from "@/lib/data";

type SearchItem = { id: number; name: string; brand: string; img: string; minPrice: number; maxPrice: number; shopCount: number };
type BasketItem = { id: number; name: string; img: string; qty: number };

type ShopResult = { shopKey: string; shop: string; total: number; covered: number; totalItems: number; lines: { id: number; price: number | null }[] };
type MixLine = { id: number; name: string; qty: number; shop: string | null; price: number | null };
type ComputeResp = {
  items: { id: number; name: string; img: string; qty: number; found: boolean }[];
  shops: ShopResult[];
  cheapestMix: { total: number; covered: number; totalItems: number; lines: MixLine[] } | null;
};

const STORAGE_KEY = "couffin_basket_v1";
const fmt = (n: number) => n.toLocaleString("fr-FR", { minimumFractionDigits: 3, maximumFractionDigits: 3 });

function useDebounced<T>(v: T, ms = 250) {
  const [d, setD] = useState(v);
  useEffect(() => { const t = setTimeout(() => setD(v), ms); return () => clearTimeout(t); }, [v, ms]);
  return d;
}

export default function CouffinPage() {
  const [basket, setBasket] = useState<BasketItem[]>([]);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchItem[]>([]);
  const [searching, setSearching] = useState(false);
  const [open, setOpen] = useState(false);
  const [data, setData] = useState<ComputeResp | null>(null);
  const [computing, setComputing] = useState(false);
  const boxRef = useRef<HTMLDivElement>(null);
  const debounced = useDebounced(query);

  // ── load / persist basket ──
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setBasket(JSON.parse(raw));
    } catch { /* ignore */ }
  }, []);
  useEffect(() => {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(basket)); } catch { /* ignore */ }
  }, [basket]);

  // ── search ──
  useEffect(() => {
    if (debounced.trim().length < 2) { setResults([]); return; }
    let cancelled = false;
    setSearching(true);
    fetch(`/api/couffin/search?q=${encodeURIComponent(debounced)}&limit=8`)
      .then((r) => r.json())
      .then((d) => { if (!cancelled) setResults(d.items ?? []); })
      .catch(() => { if (!cancelled) setResults([]); })
      .finally(() => { if (!cancelled) setSearching(false); });
    return () => { cancelled = true; };
  }, [debounced]);

  useEffect(() => {
    const h = (e: MouseEvent) => { if (boxRef.current && !boxRef.current.contains(e.target as Node)) setOpen(false); };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);

  // ── compute cheapest shop ──
  const compute = useCallback(async (b: BasketItem[]) => {
    if (b.length === 0) { setData(null); return; }
    setComputing(true);
    try {
      const r = await fetch("/api/couffin/compute", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ items: b.map((i) => ({ id: i.id, qty: i.qty })) }),
      });
      setData(await r.json());
    } finally { setComputing(false); }
  }, []);
  useEffect(() => { compute(basket); }, [basket, compute]);

  // ── basket ops ──
  const inBasket = (id: number) => basket.some((b) => b.id === id);
  function add(it: SearchItem) {
    if (inBasket(it.id)) return;
    setBasket((b) => [...b, { id: it.id, name: it.name, img: it.img, qty: 1 }]);
    setQuery(""); setResults([]); setOpen(false);
  }
  function remove(id: number) { setBasket((b) => b.filter((x) => x.id !== id)); }
  function setQty(id: number, qty: number) { setBasket((b) => b.map((x) => (x.id === id ? { ...x, qty: Math.max(1, Math.min(99, qty)) } : x))); }
  function clear() { setBasket([]); }

  const winner = data?.shops?.[0] ?? null;
  const mix = data?.cheapestMix ?? null;
  const itemImg = (id: number) => basket.find((b) => b.id === id)?.img ?? "";

  return (
    <main className="min-h-screen bg-white dark:bg-[#0a0e1a]">
      <Header />

      {/* ── Breadcrumb ──────────────────────────────────────────────────── */}
      <div className="mx-auto max-w-[1400px] px-4 pt-5">
        <nav className="mb-4 flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-400 dark:text-white/40">
          <Link href="/" className="transition-colors hover:text-brand-gold">Accueil</Link>
          <ChevronRight className="h-3 w-3 opacity-60" />
          <span className="text-brand-gold">Couffin Tounsi</span>
        </nav>

        {/* ── Hero ────────────────────────────────────────────────────────── */}
        <Reveal>
          <div className="relative overflow-hidden rounded-3xl border border-slate-200 bg-white p-7 sm:p-9 dark:border-white/[0.07] dark:bg-[#0d1220]">
            <div className="pointer-events-none absolute -left-16 -top-20 h-64 w-64 rounded-full bg-brand-gold/15 blur-3xl" />
            <div className="pointer-events-none absolute -right-10 top-0 h-56 w-56 rounded-full bg-emerald-500/10 blur-3xl" />
            <div className="relative flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
              <div className="flex items-start gap-4">
                <span className="flex h-20 w-20 shrink-0 animate-couffin-swing items-center justify-center rounded-3xl bg-gradient-to-br from-amber-400/25 to-brand-gold/10 text-brand-gold ring-1 ring-brand-gold/30">
                  <ShoppingBasket className="h-10 w-10" strokeWidth={2.2} />
                </span>
                <div>
                  <h1 className="text-3xl font-black tracking-tight text-slate-900 sm:text-4xl dark:text-white">
                    Couffin <span className="gradient-text-gold">Tounsi</span>
                  </h1>
                  <p className="mt-1 font-arabic text-base text-slate-500 dark:text-white/50" dir="rtl">
                    القفة التونسية — احسب أرخص محل لقائمة مشترياتك
                  </p>
                  <p className="mt-2 max-w-xl text-sm leading-relaxed text-slate-600 dark:text-white/65">
                    Remplissez votre couffin avec vos courses quotidiennes. On calcule
                    <span className="font-bold text-slate-900 dark:text-white"> où votre panier coûte le moins cher</span> parmi toutes les enseignes.
                  </p>
                </div>
              </div>
              <div className="flex shrink-0 gap-3">
                <div className="rounded-2xl border border-brand-gold/25 bg-brand-gold/10 px-4 py-3 text-center">
                  <div className="text-2xl font-black tabular-nums leading-none text-brand-gold">{basket.length}</div>
                  <div className="mt-1 text-[10px] font-semibold uppercase tracking-wider text-brand-gold/80">Articles</div>
                </div>
                <div className="rounded-2xl border border-emerald-500/25 bg-emerald-500/10 px-4 py-3 text-center">
                  <div className="text-2xl font-black tabular-nums leading-none text-emerald-600 dark:text-emerald-300">6</div>
                  <div className="mt-1 text-[10px] font-semibold uppercase tracking-wider text-emerald-600/80 dark:text-emerald-300/80">Enseignes</div>
                </div>
              </div>
            </div>
          </div>
        </Reveal>
      </div>

      <div className="mx-auto mt-6 grid max-w-[1400px] grid-cols-1 gap-6 px-4 pb-16 lg:grid-cols-[1fr_400px]">
        {/* ════ LEFT: search + basket ════ */}
        <div>
          {/* search */}
          <div ref={boxRef} className="relative">
            <div className={`flex items-center gap-2 rounded-2xl border bg-white p-2.5 shadow-sm transition dark:bg-[#0d1220] ${open ? "border-brand-gold/50 ring-2 ring-brand-gold/20" : "border-slate-200 dark:border-white/10"}`}>
              <Search className="ml-1 h-5 w-5 shrink-0 text-slate-400 dark:text-white/40" />
              <input
                value={query}
                onChange={(e) => { setQuery(e.target.value); setOpen(true); }}
                onFocus={() => setOpen(true)}
                placeholder="Rechercher un produit à ajouter (lait, huile, café…)"
                className="min-w-0 flex-1 bg-transparent py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none dark:text-white dark:placeholder:text-white/40"
              />
              {searching && <Loader2 className="mr-1 h-4 w-4 animate-spin text-slate-400" />}
            </div>

            {open && query.trim().length >= 2 && (
              <div className="absolute z-40 mt-2 max-h-[420px] w-full overflow-y-auto rounded-2xl border border-slate-200 bg-white p-1.5 shadow-xl dark:border-white/10 dark:bg-[#0d1220]">
                {results.length === 0 && !searching ? (
                  <div className="px-3 py-6 text-center text-sm text-slate-400 dark:text-white/40">Aucun produit trouvé</div>
                ) : (
                  results.map((r) => {
                    const added = inBasket(r.id);
                    return (
                      <button key={r.id} onClick={() => add(r)} disabled={added}
                        className="flex w-full items-center gap-3 rounded-xl px-2 py-2 text-left transition hover:bg-slate-50 disabled:opacity-50 dark:hover:bg-white/[0.05]">
                        <span className="flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-slate-200 bg-white dark:border-white/10">
                          {r.img ? <img src={r.img} alt="" referrerPolicy="no-referrer" className="h-full w-full object-cover" /> : <ShoppingBasket className="h-5 w-5 text-slate-300" />}
                        </span>
                        <div className="min-w-0 flex-1">
                          <div className="truncate text-[13px] font-semibold text-slate-900 dark:text-white">{r.name}</div>
                          <div className="flex items-center gap-2 text-[11px] text-slate-500 dark:text-white/50">
                            <span className="font-bold tabular-nums text-brand-gold">{fmt(r.minPrice)} DT</span>
                            <span className="inline-flex items-center gap-0.5"><Store className="h-3 w-3" />{r.shopCount}</span>
                          </div>
                        </div>
                        <span className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-lg ${added ? "bg-emerald-500/15 text-emerald-600" : "bg-brand-gold/15 text-brand-gold"}`}>
                          {added ? <Check className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
                        </span>
                      </button>
                    );
                  })
                )}
              </div>
            )}
          </div>

          {/* basket */}
          <div className="mt-5 rounded-2xl border border-slate-200 bg-white p-4 dark:border-white/[0.07] dark:bg-[#0d1220] sm:p-5">
            <div className="mb-3 flex items-center justify-between">
              <h2 className="flex items-center gap-2 text-sm font-black text-slate-900 dark:text-white">
                <ShoppingBasket className="h-4 w-4 text-brand-gold" /> Mon couffin
                <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-bold text-slate-500 dark:bg-white/[0.07] dark:text-white/50 tabular-nums">{basket.length}</span>
              </h2>
              {basket.length > 0 && (
                <button onClick={clear} className="flex items-center gap-1 text-[11px] font-semibold text-slate-400 transition hover:text-red-500 dark:text-white/40">
                  <Trash2 className="h-3.5 w-3.5" /> Vider
                </button>
              )}
            </div>

            {basket.length === 0 ? (
              <div className="py-12 text-center">
                <ShoppingBasket className="mx-auto mb-3 h-10 w-10 text-slate-200 dark:text-white/15" />
                <p className="text-sm font-semibold text-slate-500 dark:text-white/55">Votre couffin est vide</p>
                <p className="mt-1 text-xs text-slate-400 dark:text-white/35">Recherchez un produit ci-dessus pour commencer.</p>
              </div>
            ) : (
              <ul className="space-y-2">
                {basket.map((b) => (
                  <li key={b.id} className="flex items-center gap-3 rounded-xl border border-slate-100 bg-slate-50/60 p-2.5 dark:border-white/[0.05] dark:bg-white/[0.02]">
                    <span className="flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-slate-200 bg-white dark:border-white/10">
                      {b.img ? <img src={b.img} alt="" referrerPolicy="no-referrer" className="h-full w-full object-cover" /> : <ShoppingBasket className="h-5 w-5 text-slate-300" />}
                    </span>
                    <span className="min-w-0 flex-1 truncate text-[13px] font-semibold text-slate-800 dark:text-white/90">{b.name}</span>
                    <div className="flex shrink-0 items-center gap-1 rounded-lg border border-slate-200 dark:border-white/10">
                      <button onClick={() => setQty(b.id, b.qty - 1)} className="flex h-7 w-7 items-center justify-center text-slate-500 transition hover:text-brand-gold"><Minus className="h-3.5 w-3.5" /></button>
                      <span className="w-6 text-center text-sm font-bold tabular-nums text-slate-900 dark:text-white">{b.qty}</span>
                      <button onClick={() => setQty(b.id, b.qty + 1)} className="flex h-7 w-7 items-center justify-center text-slate-500 transition hover:text-brand-gold"><Plus className="h-3.5 w-3.5" /></button>
                    </div>
                    <button onClick={() => remove(b.id)} aria-label="Retirer" className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-slate-400 transition hover:bg-red-50 hover:text-red-500 dark:hover:bg-red-500/10"><X className="h-4 w-4" /></button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        {/* ════ RIGHT: results ════ */}
        <div className="lg:sticky lg:top-[88px] lg:self-start">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-white/[0.07] dark:bg-[#0d1220]">
            <h2 className="mb-4 flex items-center gap-2 text-sm font-black text-slate-900 dark:text-white">
              <Sparkles className="h-4 w-4 text-brand-gold" /> Où acheter le moins cher ?
            </h2>

            {basket.length === 0 ? (
              <p className="py-8 text-center text-sm text-slate-400 dark:text-white/40">Ajoutez des articles pour voir le comparatif.</p>
            ) : computing ? (
              <div className="flex justify-center py-10"><Loader2 className="h-7 w-7 animate-spin text-brand-gold" /></div>
            ) : !data || data.shops.length === 0 ? (
              <p className="py-8 text-center text-sm text-slate-400 dark:text-white/40">Aucune enseigne ne couvre ces produits.</p>
            ) : (
              <>
                {/* winner */}
                {winner && (
                  <div className="relative mb-4 overflow-hidden rounded-2xl border border-emerald-500/30 bg-gradient-to-br from-emerald-500/10 to-emerald-500/[0.03] p-4">
                    <div className="absolute right-3 top-3 flex h-7 w-7 items-center justify-center rounded-full bg-emerald-500 text-white shadow"><Crown className="h-4 w-4" /></div>
                    <div className="flex items-center gap-2.5">
                      <span className="flex h-11 w-11 items-center justify-center overflow-hidden rounded-xl bg-white p-1 ring-1 ring-emerald-500/20">
                        {getStoreLogo(winner.shop) ? <img src={getStoreLogo(winner.shop)} alt={winner.shop} className="h-full w-full object-contain" /> : <Store className="h-5 w-5 text-emerald-600" />}
                      </span>
                      <div>
                        <div className="text-[10px] font-black uppercase tracking-wider text-emerald-600 dark:text-emerald-400">Meilleur prix</div>
                        <div className="text-base font-black text-slate-900 dark:text-white">{winner.shop}</div>
                      </div>
                    </div>
                    <div className="mt-3 flex items-end justify-between">
                      <div>
                        <div className="text-2xl font-black tabular-nums text-emerald-600 dark:text-emerald-400">{fmt(winner.total)} <span className="text-sm">DT</span></div>
                        <div className="text-[11px] text-slate-500 dark:text-white/50">{winner.covered}/{winner.totalItems} article{winner.totalItems > 1 ? "s" : ""} disponible{winner.covered > 1 ? "s" : ""}</div>
                      </div>
                    </div>
                  </div>
                )}

                {/* ranked shops */}
                <ul className="space-y-2">
                  {data.shops.slice(1).map((s) => {
                    const diff = winner ? s.total - winner.total : 0;
                    return (
                      <li key={s.shopKey} className="flex items-center gap-3 rounded-xl border border-slate-100 bg-slate-50/60 px-3 py-2.5 dark:border-white/[0.05] dark:bg-white/[0.02]">
                        <span className="flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-white p-1 ring-1 ring-slate-200 dark:ring-white/10">
                          {getStoreLogo(s.shop) ? <img src={getStoreLogo(s.shop)} alt={s.shop} className="h-full w-full object-contain" /> : <span className="text-xs font-black text-brand-gold">{s.shop.charAt(0)}</span>}
                        </span>
                        <div className="min-w-0 flex-1">
                          <div className="truncate text-[13px] font-bold text-slate-800 dark:text-white/90">{s.shop}</div>
                          <div className="text-[11px] text-slate-400 dark:text-white/40">{s.covered}/{s.totalItems} articles</div>
                        </div>
                        <div className="text-right">
                          <div className="text-sm font-black tabular-nums text-slate-900 dark:text-white">{fmt(s.total)} DT</div>
                          {diff > 0.001 && <div className="text-[10px] font-semibold text-red-500">+{fmt(diff)} DT</div>}
                        </div>
                      </li>
                    );
                  })}
                </ul>

                {/* cheapest mix */}
                {mix && mix.covered > 0 && winner && mix.total < winner.total - 0.001 && (
                  <div className="mt-4 rounded-xl border border-brand-gold/30 bg-brand-gold/[0.07] p-3.5">
                    <div className="flex items-center gap-1.5 text-[11px] font-black uppercase tracking-wider text-brand-gold">
                      <Sparkles className="h-3.5 w-3.5" /> En faisant plusieurs magasins
                    </div>
                    <div className="mt-1 flex items-baseline justify-between">
                      <span className="text-lg font-black tabular-nums text-slate-900 dark:text-white">{fmt(mix.total)} DT</span>
                      <span className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">économie {fmt(winner.total - mix.total)} DT</span>
                    </div>
                    <p className="mt-1 text-[11px] text-slate-500 dark:text-white/50">Chaque article au magasin le moins cher ({mix.covered}/{mix.totalItems} trouvés).</p>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      <Footer />
    </main>
  );
}
