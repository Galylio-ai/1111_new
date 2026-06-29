"use client";

import { useEffect, useRef } from "react";

export type ChipItem = {
  id: string;
  label: string;
  sub?: string;
  image?: string;
};

export function HorizontalChipRow({
  title,
  titleAccent,
  items,
  activeId,
  onSelect,
  variant = "category",
  autoScroll = false,
}: {
  title: string;
  titleAccent?: string;
  items: ChipItem[];
  activeId: string;
  onSelect: (id: string) => void;
  variant?: "category" | "shop";
  autoScroll?: boolean;
}) {
  const isShop = variant === "shop";
  const rowRef = useRef<HTMLDivElement>(null);
  const isPaused = useRef(false);

  useEffect(() => {
    if (!autoScroll) return;
    const el = rowRef.current;
    if (!el || el.scrollWidth <= el.clientWidth + 2) return;

    let frame: number;
    let pos = el.scrollLeft;
    const speed = 0.5; // px per frame

    const step = () => {
      if (!isPaused.current && el) {
        pos += speed;
        const max = el.scrollWidth - el.clientWidth;
        if (pos >= max - 1) pos = 0;
        el.scrollLeft = pos;
      } else if (el) {
        // sync internal position if user scrolled manually
        pos = el.scrollLeft;
      }
      frame = requestAnimationFrame(step);
    };

    frame = requestAnimationFrame(step);

    const pause = () => { isPaused.current = true; };
    const resume = () => { isPaused.current = false; };

    el.addEventListener("mouseenter", pause);
    el.addEventListener("mouseleave", resume);
    el.addEventListener("touchstart", pause, { passive: true });
    el.addEventListener("touchend", resume);

    return () => {
      cancelAnimationFrame(frame);
      el.removeEventListener("mouseenter", pause);
      el.removeEventListener("mouseleave", resume);
      el.removeEventListener("touchstart", pause);
      el.removeEventListener("touchend", resume);
    };
  }, [autoScroll, items.length]);

  return (
    <section className="mx-auto max-w-[1600px] px-4">
      <div className="mb-2 flex items-center justify-between">
        <h2 className="text-base font-black text-slate-900 sm:text-lg dark:text-white">
          {title}{" "}
          {titleAccent && <span className="gradient-text-gold">{titleAccent}</span>}
        </h2>
        <span className="text-[10px] font-medium text-slate-400 dark:text-white/35">Glisser →</span>
      </div>
      <div
        ref={rowRef}
        className={`-mx-4 flex gap-2 overflow-x-auto px-4 pb-0.5 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden sm:mx-0 sm:px-0 ${
          autoScroll ? "scroll-auto" : "snap-x snap-mandatory"
        }`}
      >
        <button
          type="button"
          onClick={() => onSelect("")}
          className={`shrink-0 snap-start self-center rounded-xl border px-3 py-2 text-[10px] font-bold transition sm:text-[11px] ${
            !activeId
              ? "border-brand-gold/60 bg-brand-gold/10 text-brand-gold"
              : "border-slate-200 bg-white text-slate-600 dark:border-white/10 dark:bg-white/[0.04] dark:text-white/70"
          }`}
        >
          Tous
        </button>
        {items.map((item) => {
          const active = activeId === item.id;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => onSelect(active ? "" : item.id)}
              className={`group shrink-0 snap-start overflow-hidden rounded-xl border text-left transition active:scale-[0.98] ${
                active
                  ? "border-brand-gold/60 shadow-[0_0_12px_-4px_rgba(246,196,83,0.45)]"
                  : "border-slate-200 dark:border-white/[0.08]"
              } ${isShop ? "w-[6.5rem] lg:w-[8.5rem] bg-slate-50 dark:bg-white/[0.03]" : "relative w-[7rem] lg:w-[9rem]"}`}
            >
              {isShop ? (
                <>
                  <div className="flex h-[3.25rem] lg:h-[4.5rem] items-center justify-center bg-white p-1.5 dark:bg-white">
                    {item.image ? (
                      <img
                        src={item.image}
                        alt=""
                        className="max-h-full max-w-full object-contain transition group-hover:scale-105"
                        loading="lazy"
                      />
                    ) : (
                      <span className="text-lg font-black text-slate-400">{item.label.slice(0, 2)}</span>
                    )}
                  </div>
                  <div className="px-1.5 py-1.5">
                    <div className="line-clamp-2 text-[9px] font-black leading-tight text-slate-800 dark:text-white/90">
                      {item.label}
                    </div>
                    {item.sub && (
                      <div className="mt-0.5 text-[8px] tabular-nums text-slate-400">{item.sub}</div>
                    )}
                  </div>
                </>
              ) : (
                <>
                  <div className="relative h-[4.25rem] w-full overflow-hidden bg-slate-100 lg:h-[6rem] dark:bg-white/[0.04]">
                    {item.image ? (
                      <img
                        src={item.image}
                        alt=""
                        className="h-full w-full object-cover transition duration-500 group-hover:scale-110"
                        loading="lazy"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center">
                        <span className="text-lg font-black text-slate-400">{item.label.slice(0, 2)}</span>
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                    <div className="absolute bottom-1.5 left-1.5 right-1.5">
                      <div className="line-clamp-2 text-[9px] font-black leading-tight text-white drop-shadow sm:text-[10px] lg:text-[11px]">
                        {item.label}
                      </div>
                    </div>
                  </div>
                </>
              )}
            </button>
          );
        })}
      </div>
    </section>
  );
}
