"use client";
import { useMemo, useState } from "react";
import { ArrowUpDown, ExternalLink, Search, TrendingDown, TrendingUp } from "lucide-react";
import type { RetailSite } from "@/lib/topRetailSites";

function faviconFor(domain: string): string {
  return `https://www.google.com/s2/favicons?domain=${domain}&sz=64`;
}
function siteName(domain: string): string {
  const base = domain.replace(/\.(com\.tn|co\.uk|com|tn|fr|de|ae|ca|qa|net|to|co)$/i, "").split(".")[0];
  return base.charAt(0).toUpperCase() + base.slice(1);
}
// parse "↑12.8%" / "↓13.4%" → { up, pct } for sorting & coloring
function trend(v: string): { up: boolean; pct: number } {
  const up = v.includes("↑");
  const n = parseFloat(v.replace(/[↑↓%\s]/g, "")) || 0;
  return { up, pct: up ? n : -n };
}

type SortKey = "rank" | "visits" | "mom" | "yoy";

function Delta({ value }: { value: string }) {
  const { up } = trend(value);
  return (
    <span className={`inline-flex items-center gap-0.5 font-bold tabular-nums ${up ? "text-emerald-600 dark:text-emerald-400" : "text-red-500 dark:text-red-400"}`}>
      {up ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
      {value.replace(/[↑↓]/g, "")}
    </span>
  );
}

const sourceTone: Record<string, string> = {
  Direct: "border-blue-500/25 bg-blue-500/10 text-blue-600 dark:text-blue-300",
  Search: "border-purple-500/25 bg-purple-500/10 text-purple-600 dark:text-purple-300",
};

export function RetailSitesTable({ sites, month }: { sites: RetailSite[]; month: string }) {
  const [q, setQ] = useState("");
  const [sort, setSort] = useState<SortKey>("rank");
  const [asc, setAsc] = useState(false);

  // stable original rank (data is pre-sorted by visits desc)
  const ranked = useMemo(() => sites.map((s, i) => ({ ...s, rank: i + 1 })), [sites]);

  const rows = useMemo(() => {
    const needle = q.trim().toLowerCase();
    let r = ranked.filter(
      (s) => !needle || s.domain.toLowerCase().includes(needle) || siteName(s.domain).toLowerCase().includes(needle)
    );
    r = [...r].sort((a, b) => {
      let d = 0;
      if (sort === "rank") d = a.rank - b.rank;
      else if (sort === "visits") d = a.visitsNum - b.visitsNum;
      else if (sort === "mom") d = trend(a.mom).pct - trend(b.mom).pct;
      else if (sort === "yoy") d = trend(a.yoy).pct - trend(b.yoy).pct;
      return asc ? d : -d;
    });
    return r;
  }, [ranked, q, sort, asc]);

  const toggleSort = (key: SortKey) => {
    if (sort === key) setAsc((v) => !v);
    else { setSort(key); setAsc(key === "rank"); }
  };

  const Th = ({ label, k, className = "" }: { label: string; k: SortKey; className?: string }) => (
    <th className={`px-3 py-3 ${className}`}>
      <button
        onClick={() => toggleSort(k)}
        className={`inline-flex items-center gap-1 font-bold uppercase tracking-wider transition hover:text-brand-gold ${sort === k ? "text-brand-gold" : "text-slate-500 dark:text-white/50"}`}
      >
        {label}
        <ArrowUpDown className="h-3 w-3 opacity-60" />
      </button>
    </th>
  );

  return (
    <div>
      {/* search */}
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-3 py-2 shadow-sm sm:max-w-sm dark:border-white/10 dark:bg-bg-card">
          <Search className="h-4 w-4 shrink-0 text-slate-400 dark:text-white/40" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Rechercher un site (ex. tunisianet, zara…)"
            className="min-w-0 flex-1 bg-transparent py-1 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none dark:text-white dark:placeholder:text-white/40"
          />
        </div>
        <span className="text-xs text-slate-500 dark:text-white/50">
          {rows.length} site{rows.length > 1 ? "s" : ""} · données {month}
        </span>
      </div>

      {/* ── Desktop table ── */}
      <div className="hidden overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm md:block dark:border-white/10 dark:bg-bg-card">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[760px] text-left text-sm">
            <thead className="border-b border-slate-200 bg-slate-50 text-[11px] dark:border-white/10 dark:bg-bg-800">
              <tr>
                <Th label="#" k="rank" className="w-14" />
                <th className="px-3 py-3 text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-white/50">Site</th>
                <Th label="Visites" k="visits" className="text-right" />
                <th className="px-3 py-3 text-right text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-white/50">Desktop / Mobile</th>
                <Th label="MoM" k="mom" className="text-right" />
                <Th label="YoY" k="yoy" className="text-right" />
                <th className="px-3 py-3 text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-white/50">Source</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((s, i) => (
                <tr key={s.domain} className={`border-t border-slate-100 transition hover:bg-slate-50 dark:border-white/[0.06] dark:hover:bg-white/[0.025] ${i % 2 ? "bg-slate-50/40 dark:bg-white/[0.012]" : ""}`}>
                  <td className="px-3 py-2.5">
                    <span className={`inline-flex h-6 min-w-6 items-center justify-center rounded-full px-1.5 text-[11px] font-black ${
                      s.rank <= 3 ? "bg-gradient-to-br from-yellow-400 to-amber-600 text-yellow-950" : "bg-slate-100 text-slate-500 dark:bg-white/10 dark:text-white/60"
                    }`}>{s.rank}</span>
                  </td>
                  <td className="px-3 py-2.5">
                    <div className="flex items-center gap-2.5">
                      <span className="flex h-8 w-8 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-white p-1 ring-1 ring-slate-200 dark:ring-white/10">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={faviconFor(s.domain)} alt="" referrerPolicy="no-referrer" loading="lazy" className="h-full w-full object-contain" />
                      </span>
                      <div className="min-w-0">
                        <div className="font-semibold text-slate-900 dark:text-white">{siteName(s.domain)}</div>
                        <a href={`https://${s.domain}`} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-[11px] text-slate-400 transition hover:text-brand-gold dark:text-white/40">
                          {s.domain} <ExternalLink className="h-2.5 w-2.5" />
                        </a>
                      </div>
                    </div>
                  </td>
                  <td className="px-3 py-2.5 text-right font-black tabular-nums text-slate-900 dark:text-white">{s.visits}</td>
                  <td className="px-3 py-2.5 text-right text-[12px] tabular-nums text-slate-500 dark:text-white/55">
                    {s.desktop} / {s.mobile}
                  </td>
                  <td className="px-3 py-2.5 text-right text-[12px]"><Delta value={s.mom} /></td>
                  <td className="px-3 py-2.5 text-right text-[12px]"><Delta value={s.yoy} /></td>
                  <td className="px-3 py-2.5">
                    <span className={`inline-block rounded-full border px-2 py-0.5 text-[10px] font-bold ${sourceTone[s.source] ?? "border-slate-300 bg-slate-100 text-slate-600 dark:border-white/10 dark:bg-white/10 dark:text-white/60"}`}>
                      {s.source}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── Mobile cards ── */}
      <ul className="space-y-2.5 md:hidden">
        {rows.map((s) => (
          <li key={s.domain} className="rounded-2xl border border-slate-200 bg-white p-3 shadow-sm dark:border-white/10 dark:bg-bg-card">
            <div className="flex items-center gap-3">
              <span className={`flex h-7 min-w-7 items-center justify-center rounded-full px-1.5 text-[11px] font-black ${
                s.rank <= 3 ? "bg-gradient-to-br from-yellow-400 to-amber-600 text-yellow-950" : "bg-slate-100 text-slate-500 dark:bg-white/10 dark:text-white/60"
              }`}>{s.rank}</span>
              <span className="flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-white p-1 ring-1 ring-slate-200 dark:ring-white/10">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={faviconFor(s.domain)} alt="" referrerPolicy="no-referrer" loading="lazy" className="h-full w-full object-contain" />
              </span>
              <div className="min-w-0 flex-1">
                <div className="truncate font-semibold text-slate-900 dark:text-white">{siteName(s.domain)}</div>
                <a href={`https://${s.domain}`} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 truncate text-[11px] text-slate-400 dark:text-white/40">
                  {s.domain} <ExternalLink className="h-2.5 w-2.5 shrink-0" />
                </a>
              </div>
              <div className="text-right">
                <div className="text-base font-black tabular-nums text-amber-600 dark:text-amber-300">{s.visits}</div>
                <span className={`inline-block rounded-full border px-1.5 py-0.5 text-[9px] font-bold ${sourceTone[s.source] ?? "border-slate-300 bg-slate-100 text-slate-600 dark:border-white/10 dark:bg-white/10 dark:text-white/60"}`}>
                  {s.source}
                </span>
              </div>
            </div>
            <div className="mt-2.5 grid grid-cols-3 gap-2 border-t border-slate-100 pt-2.5 text-[11px] dark:border-white/[0.06]">
              <div>
                <div className="text-slate-400 dark:text-white/35">Desk/Mob</div>
                <div className="font-semibold tabular-nums text-slate-700 dark:text-white/80">{s.desktop}/{s.mobile}</div>
              </div>
              <div>
                <div className="text-slate-400 dark:text-white/35">MoM</div>
                <Delta value={s.mom} />
              </div>
              <div>
                <div className="text-slate-400 dark:text-white/35">YoY</div>
                <Delta value={s.yoy} />
              </div>
            </div>
          </li>
        ))}
      </ul>

      {rows.length === 0 && (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-white/50 py-16 text-center text-sm text-slate-400 dark:border-white/10 dark:bg-bg-card/40 dark:text-white/40">
          Aucun site ne correspond à « {q} ».
        </div>
      )}
    </div>
  );
}
