import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        bg: {
          900: "var(--bg-900)",
          800: "var(--bg-800)",
          700: "var(--bg-700)",
          card: "var(--bg-card)",
          border: "var(--bg-border)",
        },
        brand: {
          red: "#e11d2d",
          redDark: "#b91623",
          gold: "#f6c453",
          goldDark: "#d4a23a",
          green: "#10b981",
          blue: "#3b82f6",
          purple: "#8b5cf6",
        },
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
        arabic: ["Tajawal", "system-ui", "sans-serif"],
      },
      boxShadow: {
        glow: "0 0 24px rgba(225, 29, 45, 0.25)",
        card: "0 2px 12px rgba(0,0,0,0.08), 0 1px 3px rgba(0,0,0,0.06)",
      },
      animation: {
        "pulse-slow": "pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        "shimmer": "shimmer 2s linear infinite",
        "float": "float 6s ease-in-out infinite",
        "marquee": "marquee 40s linear infinite",
        "couffin-swing": "couffin-swing 3.2s ease-in-out infinite",
      },
      keyframes: {
        shimmer: {
          "0%": { backgroundPosition: "-1000px 0" },
          "100%": { backgroundPosition: "1000px 0" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-10px)" },
        },
        marquee: {
          "0%": { transform: "translateX(0)" },
          "100%": { transform: "translateX(-50%)" },
        },
        "couffin-swing": {
          "0%, 100%": { transform: "translateY(0) rotate(-6deg)" },
          "50%": { transform: "translateY(-8px) rotate(6deg)" },
        },
        wiggle: {
          "0%, 100%": { transform: "rotate(0deg)" },
          "20%": { transform: "rotate(-14deg)" },
          "40%": { transform: "rotate(12deg)" },
          "60%": { transform: "rotate(-8deg)" },
          "80%": { transform: "rotate(6deg)" },
        },
      },
    },
  },
  plugins: [],
};
export default config;
