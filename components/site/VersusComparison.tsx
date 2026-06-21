"use client";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  ArrowLeftRight, Check, ChevronDown, Crown, ExternalLink, Loader2,
  Plus, Search, ShieldCheck, Store, Trophy, X,
} from "lucide-react";

/* ────────────────────────────────────────────────────────────────────────── */
/* Types                                                                        */
/* ────────────────────────────────────────────────────────────────────────── */

type SearchItem = {
  slug: string;
  name: string;
  brand: string;
  img: string;
  price: number | null;
  category: string;
  shopCount: number;
};

type Offer = {
  shop: string;
  shopSlug: string;
  logo: string | null;
  price: number;
  url: string | null;
};

type Product = {
  slug: string;
  name: string;
  brand: string;
  img: string;
  category: { top: string | null; low: string | null; sub: string | null };
  minPrice: number | null;
  maxPrice: number | null;
  offers: Offer[];
  shopCount: number;
  description: string | null;
  specs: Record<string, string>;
};

/* ────────────────────────────────────────────────────────────────────────── */
/* Helpers                                                                      */
/* ────────────────────────────────────────────────────────────────────────── */

function fmt(n: number | null): string {
  return n == null ? "—" : n.toFixed(3);
}

// Pull the first number out of a spec value ("8 Go" -> 8, "5000 mAh" -> 5000).
function numOf(v: string): number | null {
  const m = v.replace(/\s/g, "").match(/-?\d+([.,]\d+)?/);
  if (!m) return null;
  return parseFloat(m[0].replace(",", "."));
}

// For a given spec key, decide whether a HIGHER number is better (battery, RAM…),
// LOWER is better (price, weight…), or it's not numerically comparable.
const LOWER_IS_BETTER = ["prix", "price", "poids", "weight", "épaisseur", "epaisseur", "temps de charge"];
function specDirection(key: string): "higher" | "lower" | null {
  const k = key.toLowerCase();
  if (LOWER_IS_BETTER.some((w) => k.includes(w))) return "lower";
  return "higher";
}

function useDebounced<T>(value: T, delay = 250): T {
  const [v, setV] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setV(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return v;
}

/* ────────────────────────────────────────────────────────────────────────── */
/* Product picker (search + autocomplete)                                       */
/* ────────────────────────────────────────────────────────────────────────── */

function ProductPicker({
  side,
  selected,
  onSelect,
  onClear,
}: {
  side: "A" | "B";
  selected: Product | null;
  onSelect: (slug: string) => void;
  onClear: () => void;
}) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchItem[]>([]);
  const [loading, setLoading] = useState(false);
  const debounced = useDebounced(query);
  const boxRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (debounced.trim().length < 2) {
      setResults([]);
      return;
    }
    let cancelled = false;
    setLoading(true);
    fetch(`/api/catalog/compare/search?q=${encodeURIComponent(debounced)}&limit=10`)
      .then((r) => r.json())
      .then((d) => { if (!cancelled) setResults(d.items ?? []); })
      .catch(() => { if (!cancelled) setResults([]); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [debounced]);

  // Close dropdown on outside click.
  useEffect(() => {
    function onDoc(e: MouseEvent) {
      if (boxRef.current && !boxRef.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, []);

  if (selected) {
    return (
      <div className="relative w-full">
        <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white p-3 shadow-sm dark:border-white/10 dark:bg-bg-card">
          <div className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-slate-200 bg-white p-1.5 dark:border-white/10">
            <img src={selected.img} alt={selected.name} referrerPolicy="no-referrer" className="h-full w-full object-contain" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="text-[10px] font-black uppercase tracking-wider text-brand-gold">
              Produit {side}
            </div>
            <div className="truncate text-sm font-bold text-slate-900 dark:text-white">
              {selected.name}
            </div>
            <div className="mt-0.5 text-xs font-bold tabular-nums text-slate-500 dark:text-white/55">
              {fmt(selected.minPrice)} DT
            </div>
          </div>
          <button
            onClick={onClear}
            aria-label="Changer de produit"
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-slate-200 text-slate-500 transition hover:bg-slate-50 hover:text-slate-900 dark:border-white/10 dark:text-white/50 dark:hover:bg-white/5 dark:hover:text-white"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div ref={boxRef} className="relative w-full">
      <div
        className={`flex items-center gap-2 rounded-2xl border bg-white p-2.5 shadow-sm transition dark:bg-bg-card ${
          open ? "border-brand-gold/50 ring-2 ring-brand-gold/20" : "border-slate-200 dark:border-white/10"
        }`}
      >
        <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-dashed border-slate-300 text-slate-400 dark:border-white/15 dark:text-white/40">
          <Plus className="h-5 w-5" />
        </span>
        <div className="flex flex-1 items-center gap-2">
          <Search className="h-4 w-4 shrink-0 text-slate-400 dark:text-white/40" />
          <input
            value={query}
            onChange={(e) => { setQuery(e.target.value); setOpen(true); }}
            onFocus={() => setOpen(true)}
            placeholder={`Choisir le produit ${side}…`}
            className="min-w-0 flex-1 bg-transparent py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none dark:text-white dark:placeholder:text-white/40"
          />
          {loading && <Loader2 className="h-4 w-4 animate-spin text-slate-400" />}
        </div>
      </div>

      {open && (query.trim().length >= 2) && (
        <div className="absolute z-50 mt-2 max-h-80 w-full overflow-y-auto rounded-2xl border border-slate-200 bg-white p-1.5 shadow-xl dark:border-white/10 dark:bg-bg-card">
          {results.length === 0 && !loading && (
            <div className="px-3 py-6 text-center text-sm text-slate-400 dark:text-white/40">
              Aucun produit trouvé
            </div>
          )}
          {results.map((r) => (
            <button
              key={r.slug}
              onClick={() => { onSelect(r.slug); setOpen(false); setQuery(""); }}
              className="flex w-full items-center gap-3 rounded-xl px-2 py-2 text-left transition hover:bg-slate-50 dark:hover:bg-white/[0.05]"
            >
              <div className="flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-slate-200 bg-white p-1 dark:border-white/10">
                <img src={r.img} alt={r.name} referrerPolicy="no-referrer" className="h-full w-full object-contain" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="truncate text-[13px] font-semibold text-slate-900 dark:text-white">
                  {r.name}
                </div>
                <div className="flex items-center gap-2 text-[11px] text-slate-500 dark:text-white/50">
                  {r.brand && <span className="font-bold">{r.brand}</span>}
                  <span className="tabular-nums">{fmt(r.price)} DT</span>
                  <span className="inline-flex items-center gap-0.5">
                    <Store className="h-3 w-3" />{r.shopCount}
                  </span>
                </div>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

/* ────────────────────────────────────────────────────────────────────────── */
/* Spec row + winner logic                                                      */
/* ────────────────────────────────────────────────────────────────────────── */

type Verdict = "A" | "B" | "tie" | null;

function compareSpec(key: string, a: string | undefined, b: string | undefined): Verdict {
  if (a == null && b == null) return null;
  if (a == null) return "B";
  if (b == null) return "A";
  const dir = specDirection(key);
  const na = numOf(a);
  const nb = numOf(b);
  if (dir && na != null && nb != null) {
    if (na === nb) return "tie";
    const aWins = dir === "higher" ? na > nb : na < nb;
    return aWins ? "A" : "B";
  }
  if (a.trim().toLowerCase() === b.trim().toLowerCase()) return "tie";
  return null; // present on both but not numerically rankable
}

/* ────────────────────────────────────────────────────────────────────────── */
/* Where-to-buy block                                                           */
/* ────────────────────────────────────────────────────────────────────────── */

function OfferList({ product }: { product: Product }) {
  const top = product.offers.slice(0, 4);
  if (top.length === 0)
    return <p className="text-xs text-slate-400 dark:text-white/40">Aucune offre disponible.</p>;
  return (
    <ul className="space-y-1.5">
      {top.map((o, i) => (
        <li key={o.shopSlug + i}>
          <a
            href={o.url ?? "#"}
            target="_blank"
            rel="noopener noreferrer"
            className={`flex items-center justify-between gap-2 rounded-lg border px-3 py-2 text-sm transition ${
              i === 0
                ? "border-emerald-500/40 bg-emerald-500/5 hover:bg-emerald-500/10"
                : "border-slate-200 bg-white hover:bg-slate-50 dark:border-white/10 dark:bg-transparent dark:hover:bg-white/5"
            }`}
          >
            <span className="flex items-center gap-2 min-w-0">
              {o.logo ? (
                <span className="flex h-7 w-7 shrink-0 items-center justify-center overflow-hidden rounded-md bg-white p-0.5 ring-1 ring-slate-200 dark:ring-white/10">
                  <img src={o.logo} alt={o.shop} referrerPolicy="no-referrer" className="h-full w-full object-contain" />
                </span>
              ) : (
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-slate-100 text-[10px] font-black uppercase text-slate-600 dark:bg-white/10 dark:text-white/70">
                  {o.shop.slice(0, 2)}
                </span>
              )}
              <span className="truncate font-semibold text-slate-800 dark:text-white/85">{o.shop}</span>
              {i === 0 && (
                <span className="hidden items-center gap-0.5 rounded bg-emerald-600 px-1.5 py-0.5 text-[9px] font-bold text-white sm:inline-flex">
                  <Trophy className="h-2.5 w-2.5" /> Min
                </span>
              )}
            </span>
            <span className="flex shrink-0 items-center gap-1.5 font-black tabular-nums text-slate-900 dark:text-white">
              {fmt(o.price)} <span className="text-[10px] font-normal text-slate-400">DT</span>
              <ExternalLink className="h-3 w-3 text-slate-400" />
            </span>
          </a>
        </li>
      ))}
    </ul>
  );
}

/* ────────────────────────────────────────────────────────────────────────── */
/* Main component                                                               */
/* ────────────────────────────────────────────────────────────────────────── */

export function VersusComparison({
  initialA,
  initialB,
}: {
  initialA?: string;
  initialB?: string;
}) {
  const [a, setA] = useState<Product | null>(null);
  const [b, setB] = useState<Product | null>(null);
  const [loadingA, setLoadingA] = useState(false);
  const [loadingB, setLoadingB] = useState(false);

  const load = useCallback(
    async (slug: string, set: (p: Product | null) => void, setLoading: (v: boolean) => void) => {
      setLoading(true);
      try {
        const r = await fetch(`/api/catalog/compare/${encodeURIComponent(slug)}`);
        if (!r.ok) throw new Error("not found");
        set(await r.json());
      } catch {
        set(null);
      } finally {
        setLoading(false);
      }
    },
    []
  );

  // Deep-link support: /comparaison?a=slug&b=slug
  useEffect(() => {
    if (initialA) load(initialA, setA, setLoadingA);
    if (initialB) load(initialB, setB, setLoadingB);
  }, [initialA, initialB, load]);

  // Keep the URL in sync so a comparison is shareable.
  useEffect(() => {
    const params = new URLSearchParams();
    if (a) params.set("a", a.slug);
    if (b) params.set("b", b.slug);
    const qs = params.toString();
    window.history.replaceState(null, "", qs ? `?${qs}` : window.location.pathname);
  }, [a, b]);

  const ready = a && b;

  // Union of spec keys, ordered: keys present in both first, then the rest.
  const specRows = useMemo(() => {
    if (!a || !b) return [];
    const keys = new Set([...Object.keys(a.specs), ...Object.keys(b.specs)]);
    const rows = Array.from(keys).map((k) => {
      const va = a.specs[k];
      const vb = b.specs[k];
      return { key: k, va, vb, both: va != null && vb != null, winner: compareSpec(k, va, vb) };
    });
    rows.sort((x, y) => (Number(y.both) - Number(x.both)) || x.key.localeCompare(y.key));
    return rows;
  }, [a, b]);

  // Overall verdict: count spec wins + cheaper price.
  const verdict = useMemo(() => {
    if (!a || !b) return null;
    let aw = 0, bw = 0;
    for (const r of specRows) {
      if (r.winner === "A") aw++;
      else if (r.winner === "B") bw++;
    }
    if (a.minPrice != null && b.minPrice != null && a.minPrice !== b.minPrice) {
      if (a.minPrice < b.minPrice) aw++; else bw++;
    }
    if (aw === bw) return { side: "tie" as const, aw, bw };
    return { side: (aw > bw ? "A" : "B") as "A" | "B", aw, bw };
  }, [a, b, specRows]);

  const swap = () => { setA(b); setB(a); };

  return (
    <div className="mx-auto max-w-[1100px] px-3 sm:px-4">
      {/* ── Pickers ──────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 items-stretch gap-3 sm:grid-cols-[1fr_auto_1fr]">
        <ProductPicker side="A" selected={a} onSelect={(s) => load(s, setA, setLoadingA)} onClear={() => setA(null)} />
        <div className="flex items-center justify-center">
          <button
            onClick={swap}
            disabled={!a && !b}
            aria-label="Inverser les produits"
            className="flex h-11 w-11 items-center justify-center rounded-full bg-gradient-to-br from-brand-red to-brand-red/80 text-sm font-black text-white shadow-lg ring-2 ring-white transition hover:scale-105 disabled:opacity-40 dark:ring-bg-900"
          >
            <span className="hidden sm:block">VS</span>
            <ArrowLeftRight className="h-4 w-4 sm:hidden" />
          </button>
        </div>
        <ProductPicker side="B" selected={b} onSelect={(s) => load(s, setB, setLoadingB)} onClear={() => setB(null)} />
      </div>

      {(loadingA || loadingB) && (
        <div className="mt-10 flex justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-brand-gold" />
        </div>
      )}

      {/* ── Empty state ──────────────────────────────────────────────────── */}
      {!ready && !loadingA && !loadingB && (
        <div className="mt-12 rounded-2xl border border-dashed border-slate-300 bg-white/50 px-6 py-16 text-center dark:border-white/10 dark:bg-bg-card/40">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-gold/15 text-brand-gold">
            <ArrowLeftRight className="h-7 w-7" />
          </div>
          <h3 className="text-lg font-black text-slate-900 dark:text-white">
            Choisissez deux produits à comparer
          </h3>
          <p className="mx-auto mt-2 max-w-md text-sm text-slate-500 dark:text-white/55">
            Smartphones, PC portables, composants informatiques… Sélectionnez le produit A et le produit B
            pour voir leurs caractéristiques et prix côte à côte.
          </p>
        </div>
      )}

      {/* ── VS HERO ──────────────────────────────────────────────────────── */}
      {ready && (
        <>
          <section className="mt-6 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-white/10 dark:bg-bg-card">
            <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-2 p-5 sm:gap-6 sm:p-8">
              <VsSide product={a!} winner={verdict?.side === "A"} align="right" />
              <div className="flex flex-col items-center gap-2">
                <span className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-brand-red to-brand-red/80 text-base font-black text-white shadow-lg sm:h-16 sm:w-16 sm:text-2xl">
                  VS
                </span>
              </div>
              <VsSide product={b!} winner={verdict?.side === "B"} align="left" />
            </div>

            {/* Verdict bar */}
            {verdict && (
              <div className="border-t border-slate-200 bg-slate-50 px-5 py-4 dark:border-white/10 dark:bg-bg-800">
                {verdict.side === "tie" ? (
                  <p className="text-center text-sm font-bold text-slate-600 dark:text-white/70">
                    Match nul — les deux produits sont à égalité sur les critères comparables.
                  </p>
                ) : (
                  <div className="flex flex-col items-center justify-center gap-1 text-center">
                    <div className="inline-flex items-center gap-2 text-sm font-black text-slate-900 dark:text-white">
                      <Crown className="h-4 w-4 text-brand-gold" />
                      Notre verdict :{" "}
                      <span className="text-emerald-600 dark:text-emerald-400">
                        {(verdict.side === "A" ? a! : b!).name}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 dark:text-white/55">
                      Gagne sur {Math.max(verdict.aw, verdict.bw)} critère
                      {Math.max(verdict.aw, verdict.bw) > 1 ? "s" : ""} contre {Math.min(verdict.aw, verdict.bw)}
                    </p>
                  </div>
                )}
              </div>
            )}
          </section>

          {/* ── Price face-off ─────────────────────────────────────────────── */}
          <section className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
            {[a!, b!].map((p, i) => {
              const other = i === 0 ? b! : a!;
              const cheaper = p.minPrice != null && other.minPrice != null && p.minPrice < other.minPrice;
              return (
                <div
                  key={p.slug + "-price"}
                  className={`rounded-2xl border bg-white p-5 dark:bg-bg-card ${
                    cheaper ? "border-emerald-500/40 ring-1 ring-emerald-500/20" : "border-slate-200 dark:border-white/10"
                  }`}
                >
                  <div className="mb-3 flex items-center justify-between">
                    <h3 className="flex items-center gap-1.5 text-sm font-black text-slate-900 dark:text-white">
                      <Store className="h-4 w-4 text-slate-400" />
                      Où acheter
                    </h3>
                    {cheaper && (
                      <span className="inline-flex items-center gap-1 rounded-md bg-emerald-600 px-2 py-0.5 text-[10px] font-bold text-white">
                        <Check className="h-3 w-3" /> Moins cher
                      </span>
                    )}
                  </div>
                  <div className="mb-3 flex items-baseline gap-2">
                    <span className="text-2xl font-black tabular-nums text-slate-900 dark:text-white">
                      {fmt(p.minPrice)}
                    </span>
                    <span className="text-sm font-bold text-slate-500 dark:text-white/50">DT</span>
                    <span className="ml-auto text-xs text-slate-400 dark:text-white/40">
                      {p.shopCount} boutique{p.shopCount > 1 ? "s" : ""}
                    </span>
                  </div>
                  <OfferList product={p} />
                </div>
              );
            })}
          </section>

          {/* ── Spec-by-spec ───────────────────────────────────────────────── */}
          <section className="mt-8">
            <h2 className="mb-1 text-xl font-black tracking-tight text-slate-900 dark:text-white">
              Comparaison des caractéristiques
            </h2>
            <p className="mb-4 text-sm text-slate-500 dark:text-white/55">
              La meilleure valeur de chaque ligne est surlignée en vert.
            </p>

            {specRows.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-12 text-center dark:border-white/10 dark:bg-bg-card">
                <p className="text-sm text-slate-500 dark:text-white/55">
                  Aucune caractéristique technique détaillée n'est disponible pour ces produits.
                </p>
              </div>
            ) : (
              <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white dark:border-white/10 dark:bg-bg-card">
                {/* sticky header with the two names */}
                <div className="grid grid-cols-[1fr_1.2fr_1.2fr] border-b border-slate-200 bg-slate-50 text-[11px] font-black uppercase tracking-wider text-slate-500 dark:border-white/10 dark:bg-bg-800 dark:text-white/50">
                  <div className="px-4 py-3">Caractéristique</div>
                  <div className="truncate px-4 py-3 text-slate-900 dark:text-white">{a!.name}</div>
                  <div className="truncate px-4 py-3 text-slate-900 dark:text-white">{b!.name}</div>
                </div>
                {specRows.map((r, idx) => (
                  <div
                    key={r.key}
                    className={`grid grid-cols-[1fr_1.2fr_1.2fr] text-sm ${
                      idx % 2 ? "bg-slate-50/50 dark:bg-white/[0.015]" : ""
                    }`}
                  >
                    <div className="border-t border-slate-100 px-4 py-3 text-[12px] font-semibold capitalize text-slate-500 dark:border-white/[0.06] dark:text-white/55">
                      {r.key.replace(/_/g, " ")}
                    </div>
                    <SpecCell value={r.va} highlight={r.winner === "A"} dim={r.winner === "B"} />
                    <SpecCell value={r.vb} highlight={r.winner === "B"} dim={r.winner === "A"} />
                  </div>
                ))}
              </div>
            )}
          </section>
        </>
      )}
    </div>
  );
}

function SpecCell({ value, highlight, dim }: { value: string | undefined; highlight: boolean; dim: boolean }) {
  return (
    <div
      className={`flex items-center gap-1.5 border-t border-slate-100 px-4 py-3 font-bold dark:border-white/[0.06] ${
        highlight
          ? "bg-emerald-500/10 text-emerald-700 dark:bg-emerald-500/[0.08] dark:text-emerald-300"
          : dim
          ? "text-slate-500 dark:text-white/45"
          : "text-slate-900 dark:text-white/85"
      }`}
    >
      {highlight && <Check className="h-3.5 w-3.5 shrink-0" />}
      <span className="break-words">{value ?? "—"}</span>
    </div>
  );
}

function VsSide({ product, winner, align }: { product: Product; winner: boolean; align: "left" | "right" }) {
  return (
    <div className={`flex flex-col ${align === "right" ? "items-end text-right" : "items-start text-left"}`}>
      <div className="relative">
        <div className="flex h-24 w-24 items-center justify-center overflow-hidden rounded-2xl border border-slate-200 bg-white p-2 sm:h-32 sm:w-32 dark:border-white/10">
          <img src={product.img} alt={product.name} referrerPolicy="no-referrer" className="h-full w-full object-contain" />
        </div>
        {winner && (
          <span className="absolute -right-2 -top-2 flex h-7 w-7 items-center justify-center rounded-full bg-brand-gold text-bg-900 shadow-lg">
            <Crown className="h-4 w-4" strokeWidth={2.4} />
          </span>
        )}
      </div>
      {product.brand && (
        <div className="mt-3 text-[10px] font-black uppercase tracking-wider text-brand-gold">
          {product.brand}
        </div>
      )}
      <h2 className="mt-0.5 line-clamp-2 max-w-[180px] text-sm font-black leading-tight text-slate-900 sm:max-w-[240px] sm:text-base dark:text-white">
        {product.name}
      </h2>
      <div className="mt-2 flex items-baseline gap-1">
        <span className="text-lg font-black tabular-nums text-slate-900 sm:text-xl dark:text-white">
          {fmt(product.minPrice)}
        </span>
        <span className="text-xs font-bold text-slate-500 dark:text-white/50">DT</span>
      </div>
      <div className="mt-1 inline-flex items-center gap-1 text-[11px] text-slate-400 dark:text-white/40">
        <ShieldCheck className="h-3 w-3 text-emerald-500" /> Prix vérifié
      </div>
    </div>
  );
}
