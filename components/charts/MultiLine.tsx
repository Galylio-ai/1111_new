"use client";
import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

export type Series = { key: string; name: string; color: string; dashed?: boolean };

export function MultiLine({
  data,
  series,
  height = 220,
}: {
  data: any[];
  series: Series[];
  height?: number;
}) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <LineChart data={data} margin={{ top: 10, right: 16, left: -10, bottom: 0 }}>
        <CartesianGrid stroke="#1f2740" strokeDasharray="3 3" vertical={false} />
        <XAxis dataKey="m" tick={{ fill: "#8a93ab", fontSize: 11 }} axisLine={false} tickLine={false} />
        <YAxis tick={{ fill: "#8a93ab", fontSize: 11 }} axisLine={false} tickLine={false} />
        <Tooltip
          contentStyle={{
            background: "#0f1422",
            border: "1px solid #222b44",
            borderRadius: 8,
            fontSize: 12,
          }}
        />
        <Legend
          iconType="circle"
          wrapperStyle={{ fontSize: 11, paddingTop: 4, color: "#cbd5e1" }}
        />
        {series.map((s) => (
          <Line
            key={s.key}
            type="monotone"
            dataKey={s.key}
            name={s.name}
            stroke={s.color}
            strokeWidth={2.2}
            strokeDasharray={s.dashed ? "4 4" : undefined}
            dot={{ r: 3, stroke: s.color, fill: "#0a0e1a", strokeWidth: 2 }}
            activeDot={{ r: 5 }}
            isAnimationActive
            animationDuration={1500}
          />
        ))}
      </LineChart>
    </ResponsiveContainer>
  );
}
