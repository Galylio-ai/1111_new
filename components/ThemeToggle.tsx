"use client";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "./ThemeProvider";

const btnClass =
  "group relative flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-slate-300 bg-white text-slate-700 shadow-sm transition-all duration-300 hover:scale-[1.06] hover:border-brand-gold/45 hover:shadow-[0_0_18px_-4px_rgba(246,196,83,0.5)] hover:text-brand-gold active:scale-95 dark:border-white/10 dark:bg-bg-800 dark:text-white/85 dark:hover:border-brand-gold/50 dark:hover:bg-white/[0.08] dark:hover:text-brand-gold";

export function ThemeToggle() {
  const { theme, toggle } = useTheme();
  const isDark = theme === "dark";

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={isDark ? "Activer le mode clair" : "Activer le mode sombre"}
      className={btnClass}
    >
      <span key={theme} className="nav-icon-pop flex items-center justify-center">
        {isDark ? (
          <Sun className="h-5 w-5 transition-transform duration-500 group-hover:rotate-45" />
        ) : (
          <Moon className="h-5 w-5 transition-transform duration-500 group-hover:-rotate-12" />
        )}
      </span>
    </button>
  );
}
