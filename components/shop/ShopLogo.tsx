"use client";

import { useState } from "react";

const INITIALS_COLORS: Record<string, string> = {
  a: "bg-slate-600", b: "bg-slate-700", c: "bg-zinc-600", d: "bg-neutral-600",
  e: "bg-stone-600", f: "bg-slate-600", g: "bg-zinc-700", h: "bg-neutral-700",
  i: "bg-stone-700", j: "bg-slate-500", k: "bg-zinc-500", l: "bg-neutral-500",
  m: "bg-stone-500", n: "bg-slate-600", o: "bg-zinc-600", p: "bg-neutral-600",
  q: "bg-stone-600", r: "bg-slate-700", s: "bg-zinc-700", t: "bg-neutral-700",
  u: "bg-stone-700", v: "bg-slate-500", w: "bg-zinc-500", x: "bg-neutral-500",
  y: "bg-stone-500", z: "bg-slate-600",
};

function initialsColor(key: string) {
  return INITIALS_COLORS[key[0]?.toLowerCase() ?? "a"] ?? "bg-slate-600";
}

export function ShopLogo({
  shopKey,
  size = 48,
  className = "",
}: {
  shopKey: string;
  size?: number;
  className?: string;
}) {
  const fallbacks = [
    `/shop-logos/${shopKey}.svg`,
    `/shop-logos/${shopKey}.png`,
    `/shop-logos/${shopKey}.webp`,
    `/shop-logos/${shopKey}.jpg`,
  ];
  const [idx, setIdx] = useState(0);

  if (idx >= fallbacks.length) {
    const initials = shopKey
      .replace(/[_-]/g, " ")
      .split(" ")
      .filter(Boolean)
      .slice(0, 2)
      .map((w) => w[0]?.toUpperCase() ?? "")
      .join("");
    return (
      <div
        style={{ width: size, height: size }}
        className={`flex shrink-0 items-center justify-center rounded-lg ${initialsColor(shopKey)} ${className}`}
      >
        <span className="text-[11px] font-bold tracking-wide text-white">{initials}</span>
      </div>
    );
  }

  return (
    <div
      style={{ width: size, height: size }}
      className={`flex shrink-0 items-center justify-center rounded-lg border border-slate-200/80 bg-white p-1 dark:border-white/10 dark:bg-white/[0.04] ${className}`}
    >
      <img
        src={fallbacks[idx]}
        alt=""
        onError={() => setIdx((i) => i + 1)}
        referrerPolicy="no-referrer"
        style={{ width: size - 10, height: size - 10 }}
        className="object-contain"
      />
    </div>
  );
}
