"use client";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { useTheme } from "@/components/ThemeProvider";

type Point = { day: string; prix: number };

export function PriceHistoryChart({ data }: { data: Point[] }) {
  const { theme } = useTheme();
  const dark = theme === "dark";

  return (
    <div className="h-[260px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 10, right: 16, left: -10, bottom: 0 }}>
          <defs>
            <linearGradient id="priceFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#f6c453" stopOpacity={0.45} />
              <stop offset="100%" stopColor="#f6c453" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid stroke={dark ? "#1f2740" : "#e2e8f0"} strokeDasharray="3 3" vertical={false} />
          <XAxis
            dataKey="day"
            tick={{ fill: dark ? "#8a93ab" : "#64748b", fontSize: 11 }}
            axisLine={false}
            tickLine={false}
            interval={4}
          />
          <YAxis
            tick={{ fill: dark ? "#8a93ab" : "#64748b", fontSize: 11 }}
            axisLine={false}
            tickLine={false}
            domain={[(min: number) => Math.floor(min * 0.95), (max: number) => Math.ceil(max * 1.05)]}
            width={50}
          />
          <Tooltip
            contentStyle={{
              background: dark ? "#0f1422" : "#ffffff",
              border: `1px solid ${dark ? "#222b44" : "#e2e8f0"}`,
              borderRadius: 8,
              fontSize: 12,
            }}
            formatter={(v: number) => [`${v.toLocaleString("fr-FR")} DT`, "Prix"]}
            labelStyle={{ color: dark ? "#e6e8ee" : "#0f172a" }}
          />
          <Area
            type="monotone"
            dataKey="prix"
            stroke="#f6c453"
            strokeWidth={2.4}
            fill="url(#priceFill)"
            dot={false}
            activeDot={{ r: 5, stroke: "#f6c453", fill: dark ? "#0a0e1a" : "#ffffff", strokeWidth: 2 }}
            isAnimationActive
            animationDuration={900}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
