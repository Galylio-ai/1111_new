"use client";
import { useEffect, useRef, useState } from "react";

type Ingredient = {
  name: string;
  qty: string;
  price: string;
  icon: string;
  accent: string;
};

const ingredients: Ingredient[] = [
  { name: "Ail",       qty: "50g",    price: "0.850", icon: "/food/garlic.svg",       accent: "#a78bfa" },
  { name: "Oignons",   qty: "200g",   price: "0.398", icon: "/food/onion.svg",        accent: "#facc15" },
  { name: "Harissa",   qty: "15g",    price: "0.150", icon: "/food/harissa.svg",      accent: "#fb923c" },
  { name: "Sel",       qty: "10g",    price: "0.015", icon: "/food/salt.svg",         accent: "#60a5fa" },
  { name: "Œufs",      qty: "4 pcs",  price: "1.500", icon: "/food/egg.svg",          accent: "#fbbf24" },
  { name: "Tomates",   qty: "100g",   price: "0.299", icon: "/food/tomato.svg",       accent: "#f87171" },
  { name: "Huile",     qty: "100ml",  price: "0.469", icon: "/food/oil.svg",          accent: "#eab308" },
  { name: "Concentré", qty: "100g",   price: "0.463", icon: "/food/tomato-paste.svg", accent: "#dc2626" },
];

const CARD = 76; // card size in px
const PADDING = 8; // breathing room from stage edge

export function OjjaOrbit() {
  const stageRef = useRef<HTMLDivElement>(null);
  const [size, setSize] = useState(320); // default until measured
  const [paused, setPaused] = useState(false);

  // Measure the stage so cards stay inside the available width.
  useEffect(() => {
    const el = stageRef.current;
    if (!el) return;
    const ro = new ResizeObserver((entries) => {
      for (const e of entries) {
        const w = e.contentRect.width;
        if (w > 0) setSize(Math.round(w));
      }
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const center = size / 2;
  const radius = Math.max(0, size / 2 - CARD / 2 - PADDING);

  return (
    <div
      ref={stageRef}
      className="ojja-stage"
      style={{ height: size }}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      {/* faint dashed orbit guide */}
      <div className="ojja-orbit-guide" style={{ width: 2 * radius, height: 2 * radius }} />

      {/* center plate */}
      <div className="ojja-center-plate">
        <div className="ojja-plate-halo" />
        <img src="/food/ojja.svg" alt="Ojja" className="ojja-plate-img" />
        <div className="ojja-center-cost">
          <span className="ojja-center-cost-kicker">Coût ojja</span>
          <strong>4.135 DT</strong>
        </div>
      </div>

      {/* rotating ring with cards positioned at fixed angles */}
      <div
        className="ojja-spinner"
        style={{
          width: size,
          height: size,
          animationPlayState: paused ? "paused" : "running",
        }}
      >
        {ingredients.map((ing, i) => {
          const angle = (2 * Math.PI * i) / ingredients.length - Math.PI / 2; // start at top
          const x = center + radius * Math.cos(angle) - CARD / 2;
          const y = center + radius * Math.sin(angle) - CARD / 2;
          return (
            <div
              key={ing.name}
              className="ojja-card-slot"
              style={{
                left: x,
                top: y,
                width: CARD,
                height: CARD,
              }}
            >
              <div
                className="ojja-card-counter"
                style={{ animationPlayState: paused ? "paused" : "running" }}
              >
                <div
                  className="ojja-card"
                  style={{ ["--accent" as string]: ing.accent }}
                >
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
  );
}
