"use client";
import { Bar, BarChart, ResponsiveContainer, Tooltip, XAxis, YAxis, Cell } from "recharts";

export type PromoPoint = {
  x: string;
  y: number;
  products: number;
  savings: number;
};

const COLORS = ["#f6c453", "#e11d2d", "#10b981", "#3b82f6", "#8b5cf6"];

function fmt(n: number) {
  return n.toLocaleString("fr-FR").replace(/ /g, " ");
}

function CustomTooltip({ active, payload }: { active?: boolean; payload?: Array<{ payload: PromoPoint }> }) {
  if (!active || !payload || !payload.length) return null;
  const d = payload[0].payload;
  return (
    <div className="rounded-lg border border-bg-border bg-bg-card/95 px-3 py-2 text-xs shadow-lg backdrop-blur-sm">
      <div className="font-bold text-slate-900 dark:text-white">{d.x}</div>
      <div className="mt-1 flex items-center justify-between gap-4 text-slate-600 dark:text-white/70">
        <span>Promotions</span>
        <span className="font-bold tabular-nums text-brand-red dark:text-red-400">{fmt(d.y)}</span>
      </div>
      <div className="flex items-center justify-between gap-4 text-slate-600 dark:text-white/70">
        <span>Produits</span>
        <span className="font-bold tabular-nums text-brand-gold">{fmt(d.products)}</span>
      </div>
      <div className="flex items-center justify-between gap-4 text-slate-600 dark:text-white/70">
        <span>Économies</span>
        <span className="font-bold tabular-nums text-emerald-600 dark:text-emerald-400">{fmt(d.savings)} DT</span>
      </div>
    </div>
  );
}

export function PromosBars({ data, height = 130 }: { data: PromoPoint[]; height?: number }) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart data={data} margin={{ top: 8, right: 6, left: 0, bottom: 4 }}>
        <XAxis
          dataKey="x"
          tick={{ fill: "#8a93ab", fontSize: 10 }}
          axisLine={false}
          tickLine={false}
          tickFormatter={(v: string) => v.length > 10 ? v.slice(0, 9) + "…" : v}
          interval={0}
        />
        <YAxis
          tick={{ fill: "#8a93ab", fontSize: 10 }}
          axisLine={false}
          tickLine={false}
          width={36}
          tickFormatter={(v: number) => (v >= 1000 ? `${Math.round(v / 1000)}k` : String(v))}
        />
        <Tooltip cursor={{ fill: "rgba(246,196,83,0.08)" }} content={<CustomTooltip />} />
        <Bar dataKey="y" radius={[6, 6, 2, 2]} maxBarSize={48} isAnimationActive animationDuration={500}>
          {data.map((_, i) => (
            <Cell key={i} fill={COLORS[i % COLORS.length]} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
