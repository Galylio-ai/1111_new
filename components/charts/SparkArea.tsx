"use client";
import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

type Point = { x: string | number; y: number };

export function SparkArea({
  data,
  stroke = "#f6c453",
  fill = "rgba(246,196,83,0.18)",
  height = 110,
  showAxis = false,
}: {
  data: Point[];
  stroke?: string;
  fill?: string;
  height?: number;
  showAxis?: boolean;
}) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <AreaChart data={data} margin={{ top: 6, right: 6, left: 0, bottom: 0 }}>
        <defs>
          <linearGradient id={`grad-${stroke}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={stroke} stopOpacity={0.45} />
            <stop offset="100%" stopColor={stroke} stopOpacity={0} />
          </linearGradient>
        </defs>
        {showAxis && (
          <>
            <XAxis dataKey="x" tick={{ fill: "#8a93ab", fontSize: 10 }} axisLine={false} tickLine={false} />
            <YAxis
              domain={[(dataMin: number) => dataMin - 1.5, (dataMax: number) => dataMax + 1.5]}
              tick={{ fill: "#8a93ab", fontSize: 10 }}
              axisLine={false}
              tickLine={false}
              width={28}
            />
          </>
        )}
        {!showAxis && (
          <YAxis hide domain={[(dataMin: number) => dataMin - 1.5, (dataMax: number) => dataMax + 1.5]} />
        )}
        <Tooltip
          contentStyle={{
            background: "#0f1422",
            border: "1px solid #222b44",
            borderRadius: 8,
            fontSize: 12,
          }}
          labelStyle={{ color: "#e6e8ee" }}
        />
        <Area
          type="linear"
          dataKey="y"
          stroke={stroke}
          strokeWidth={2}
          fill={`url(#grad-${stroke})`}
          isAnimationActive
          animationDuration={400}
          animationEasing="ease-out"
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}
