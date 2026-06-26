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
  interactive = false,
}: {
  shopKey: string;
  size?: number;
  className?: string;
  /** Scale + lift on hover */
  interactive?: boolean;
}) {
  const fallbacks = [
    `/shop-logos/${shopKey}.svg`,
    `/shop-logos/${shopKey}.png`,
    `/shop-logos/${shopKey}.webp`,
    `/shop-logos/${shopKey}.jpg`,
  ];
  const [idx, setIdx] = useState(0);

  const shellClass = [
    "flex shrink-0 items-center justify-center rounded-xl border border-slate-200/90 bg-white shadow-sm",
    "dark:border-slate-200/20 dark:bg-white dark:shadow-md dark:shadow-black/20",
    interactive
      ? "cursor-pointer transition-all duration-300 ease-out hover:scale-[1.12] hover:-translate-y-1.5 hover:shadow-lg hover:shadow-black/30 hover:ring-2 hover:ring-brand-gold/45 active:scale-105"
      : "",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  const pad = Math.max(6, Math.round(size * 0.14));
  const imgSize = size - pad * 2;

  if (idx >= fallbacks.length) {
    const initials = shopKey
      .replace(/[_-]/g, " ")
      .split(" ")
      .filter(Boolean)
      .slice(0, 2)
      .map((w) => w[0]?.toUpperCase() ?? "")
      .join("");
    return (
      <div style={{ width: size, height: size }} className={shellClass}>
        <span
          className={`flex h-full w-full items-center justify-center rounded-[10px] text-[11px] font-bold tracking-wide text-white ${initialsColor(shopKey)}`}
        >
          {initials}
        </span>
      </div>
    );
  }

  return (
    <div style={{ width: size, height: size, padding: pad }} className={shellClass}>
      <img
        src={fallbacks[idx]}
        alt=""
        onError={() => setIdx((i) => i + 1)}
        referrerPolicy="no-referrer"
        style={{ width: imgSize, height: imgSize }}
        className="object-contain"
      />
    </div>
  );
}
