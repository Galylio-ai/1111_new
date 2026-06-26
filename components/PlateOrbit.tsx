"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import type { StrictPlateReport } from "@/lib/popularPlates";
import { fmtDt } from "@/lib/popularPlates";

const CARD = 78;
const PADDING = 6;
const STAGE_HEIGHT = 360;
const ROTATE_MS = 9000;

type Props = {
  plates: StrictPlateReport[];
};

export function PlateOrbit({ plates }: Props) {
  const stageRef = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState(360);
  const [paused, setPaused] = useState(false);
  const [index, setIndex] = useState(0);

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

  useEffect(() => {
    if (plates.length <= 1 || paused) return;
    const id = window.setInterval(() => {
      setIndex((i) => (i + 1) % plates.length);
    }, ROTATE_MS);
    return () => window.clearInterval(id);
  }, [plates.length, paused]);

  if (!plate) return null;

  const card = width < 320 ? 60 : width < 420 ? 68 : CARD;
  const height = width < 320 ? 300 : width < 420 ? 330 : STAGE_HEIGHT;
  const halfW = width / 2;
  const halfH = height / 2;
  const radius = Math.max(0, Math.min(halfW, halfH) - card / 2 - PADDING);
  const ring = 2 * radius + card;
  const center = ring / 2;

  return (
    <div>
      <div
        ref={stageRef}
        className="ojja-stage"
        style={{ height }}
        onMouseEnter={() => setPaused(true)}
        onMouseLeave={() => setPaused(false)}
      >
        <div className="ojja-center-cost">
          <span className="ojja-center-cost-kicker">{plate.title}</span>
          <strong>{fmtDt(plate.featuredConsumedTotal)} DT</strong>
          <span className="mt-0.5 block text-[9px] font-medium text-slate-400 dark:text-white/45">
            {plate.featuredShop} · produits identiques
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
            animationPlayState: paused ? "paused" : "running",
          }}
        >
          {ingredients.map((ing, i) => {
            const angle = (2 * Math.PI * i) / Math.max(ingredients.length, 1) - Math.PI / 2;
            const x = center + radius * Math.cos(angle) - card / 2;
            const y = center + radius * Math.sin(angle) - card / 2;
            return (
              <div
                key={`${plate.id}-${ing.name}`}
                className="ojja-card-slot"
                style={{ left: x, top: y, width: card, height: card }}
              >
                <div
                  className="ojja-card-counter"
                  style={{ animationPlayState: paused ? "paused" : "running" }}
                >
                  <div className="ojja-card" style={{ ["--accent" as string]: ing.accent }}>
                    <div className="ojja-card-icon">
                      <img src={ing.icon} alt="" width={20} height={20} />
                    </div>
                    <div className="ojja-card-name">{ing.name}</div>
                    <div className="ojja-card-qty">{ing.qty}</div>
                    <div className="ojja-card-price">{ing.price}</div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {plates.length > 1 && (
        <div className="mt-3 flex items-center justify-center gap-2">
          {plates.map((p, i) => (
            <button
              key={p.id}
              type="button"
              aria-label={p.title}
              onClick={() => setIndex(i)}
              className={`h-2 rounded-full transition-all ${
                i === index ? "w-6 bg-brand-gold" : "w-2 bg-slate-300 dark:bg-white/20"
              }`}
            />
          ))}
        </div>
      )}

      <p className="mt-2 text-center text-[10px] text-slate-400 dark:text-white/40">
        Comparaison stricte ·{" "}
        <Link href={`/qoffa/plats/${plate.slug}`} className="font-semibold text-brand-gold hover:underline">
          Voir le détail
        </Link>
      </p>
    </div>
  );
}
