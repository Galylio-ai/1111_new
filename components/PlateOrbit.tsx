"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import type { StrictPlateReport } from "@/lib/popularPlates";
import { fmtDt } from "@/lib/popularPlates";

const CARD = 78;
const PADDING = 10;
const STAGE_HEIGHT = 380;
const BOTTOM_BLEED = 14;
const ROTATE_MS = 9000;
const FADE_MS = 420;

type Props = {
  plates: StrictPlateReport[];
};

function orbitLabel(name: string): string {
  if (name === "Tomate/concentre") return "Tomate";
  if (name === "Oeufs") return "Œufs";
  return name;
}

export function PlateOrbit({ plates }: Props) {
  const stageRef = useRef<HTMLDivElement>(null);
  const fadeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [width, setWidth] = useState(360);
  const [paused, setPaused] = useState(false);
  const [index, setIndex] = useState(0);
  const [visible, setVisible] = useState(true);

  const plate = plates[index] ?? plates[0];
  const ingredients = plate?.orbitIngredients ?? [];

  useEffect(() => {
    const el = stageRef.current;
    if (!el) return;
    const ro = new ResizeObserver((entries) => {
      for (const e of entries) {
        const w = e.contentRect.width;
        if (w > 0) setWidth(Math.round(w));
      }
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const transitionTo = useCallback(
    (next: number) => {
      if (plates.length <= 1 || next === index) return;

      if (fadeTimer.current) clearTimeout(fadeTimer.current);
      setVisible(false);

      fadeTimer.current = setTimeout(() => {
        setIndex(next);
        requestAnimationFrame(() => setVisible(true));
      }, FADE_MS);
    },
    [index, plates.length],
  );

  useEffect(() => {
    return () => {
      if (fadeTimer.current) clearTimeout(fadeTimer.current);
    };
  }, []);

  const indexRef = useRef(index);
  indexRef.current = index;

  useEffect(() => {
    if (plates.length <= 1 || paused) return;
    const id = window.setInterval(() => {
      const next = (indexRef.current + 1) % plates.length;
      setVisible(false);
      if (fadeTimer.current) clearTimeout(fadeTimer.current);
      fadeTimer.current = setTimeout(() => {
        setIndex(next);
        requestAnimationFrame(() => setVisible(true));
      }, FADE_MS);
    }, ROTATE_MS);
    return () => window.clearInterval(id);
  }, [plates.length, paused]);

  if (!plate) return null;

  const count = Math.max(ingredients.length, 1);
  const card = width < 320 ? 64 : width < 420 ? 72 : count <= 6 ? 84 : CARD;
  const height = width < 320 ? 322 : width < 420 ? 352 : STAGE_HEIGHT;
  const halfW = width / 2;
  const halfH = height / 2;
  const radius = Math.max(
    0,
    Math.min(halfW, halfH - BOTTOM_BLEED * 0.5) - card / 2 - PADDING,
  );
  const ring = 2 * radius + card;
  const center = ring / 2;
  const spinPaused = paused || !visible;

  return (
    <div className="plate-orbit-wrap" style={{ paddingBottom: BOTTOM_BLEED }}>
      <div
        ref={stageRef}
        className="ojja-stage plate-orbit-root"
        style={{ height }}
        onMouseEnter={() => setPaused(true)}
        onMouseLeave={() => setPaused(false)}
      >
        <div
          key={plate.id}
          className={`plate-orbit-layer${visible ? " plate-orbit-layer--visible" : ""}`}
        >
          <div className="ojja-center-cost">
            <span className="ojja-center-cost-kicker">{orbitLabel(plate.title.split(" ")[0])}</span>
            <strong>{fmtDt(plate.featuredConsumedTotal)} DT</strong>
            <span className="ojja-center-cost-shop">
              {plate.featuredShop} · identiques
            </span>
          </div>

          <div className="ojja-orbit-guide" style={{ width: 2 * radius, height: 2 * radius }} />

          <div className="ojja-center-plate">
            <div className="ojja-plate-halo" />
            <img src={plate.image} alt={plate.title} className="ojja-plate-img" />
          </div>

          <div
            className="ojja-spinner"
            style={{
              width: ring,
              height: ring,
              animationPlayState: spinPaused ? "paused" : "running",
            }}
          >
            {ingredients.map((ing, i) => {
              const angle = (2 * Math.PI * i) / count - Math.PI / 2;
              const x = center + radius * Math.cos(angle) - card / 2;
              const y = center + radius * Math.sin(angle) - card / 2;
              return (
                <div
                  key={ing.name}
                  className="ojja-card-slot"
                  style={{ left: x, top: y, width: card, height: card }}
                >
                  <div
                    className="ojja-card-counter"
                    style={{ animationPlayState: spinPaused ? "paused" : "running" }}
                  >
                    <div className="ojja-card" style={{ ["--accent" as string]: ing.accent }}>
                      <div className="ojja-card-icon">
                        <img src={ing.icon} alt="" width={20} height={20} />
                      </div>
                      <div className="ojja-card-name">{orbitLabel(ing.name)}</div>
                      <div className="ojja-card-qty">{ing.qty}</div>
                      <div className="ojja-card-price" title={`Prix catalogue: ${ing.price} DT`}>
                        {ing.portionPrice} DT
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {plates.length > 1 && (
        <div className="mt-3 flex items-center justify-center gap-2">
          {plates.map((p, i) => (
            <button
              key={p.id}
              type="button"
              aria-label={p.title}
              aria-current={i === index ? "true" : undefined}
              onClick={() => transitionTo(i)}
              className={`h-2 rounded-full transition-all duration-300 ${
                i === index ? "w-6 bg-brand-gold" : "w-2 bg-slate-300 dark:bg-white/20"
              }`}
            />
          ))}
        </div>
      )}

      <p className="mt-2 text-center text-[10px] text-slate-400 transition-opacity duration-300 dark:text-white/40">
        <span className="font-medium text-slate-500 dark:text-white/55">{plate.title}</span>
        {" · "}
        <Link href={`/qoffa/plats/${plate.slug}`} className="font-semibold text-brand-gold hover:underline">
          Voir le détail
        </Link>
      </p>
    </div>
  );
}
