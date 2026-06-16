"use client";
import { Bell, ChevronDown, Flame, Globe, Heart, Search, ShieldCheck, Sparkles, TrendingUp, User } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { navLinks } from "@/lib/nav";

const tickerItems = [
  { icon: TrendingUp, label: "Indice marché", value: "108.7", trend: "+1.2%", trendUp: true },
  { icon: Flame, label: "Promos actives", value: "152" },
  { icon: ShieldCheck, label: "Fausses promos", value: "37" },
  { icon: Sparkles, label: "Économisés aujourd'hui", value: "48 000 DT" },
];

export function Header() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-50 border-b border-white/5 bg-bg-900/75 backdrop-blur-xl supports-[backdrop-filter]:bg-bg-900/60">
      {/* Top live ticker strip */}
      <div className="border-b border-white/5 bg-gradient-to-r from-bg-900/90 via-bg-800/80 to-bg-900/90">
        <div className="mx-auto flex max-w-[1600px] items-center justify-between gap-3 px-3 py-1.5 text-[11px] sm:px-4">
          <div className="flex items-center gap-1.5 text-emerald-300">
            <span className="live-dot" />
            <span className="font-semibold uppercase tracking-wider">En direct</span>
            <span className="hidden sm:inline text-white/40">·</span>
            <span className="hidden sm:inline text-white/60">Marché Tunisien</span>
          </div>
          <div className="hidden md:flex items-center gap-5 text-white/70">
            {tickerItems.map((t) => (
              <div key={t.label} className="flex items-center gap-1.5">
                <t.icon className="h-3 w-3 text-brand-gold/80" />
                <span className="text-white/50">{t.label}</span>
                <span className="font-semibold text-white tabular-nums">{t.value}</span>
                {t.trend && (
                  <span className={`tabular-nums ${t.trendUp ? "text-emerald-400" : "text-red-400"}`}>
                    {t.trendUp ? "▲" : "▼"} {t.trend}
                  </span>
                )}
              </div>
            ))}
          </div>
          <div className="hidden lg:flex items-center gap-3 text-white/40">
            <span>Tunis · 28°C ☀️</span>
            <span className="text-white/20">·</span>
            <span className="font-arabic">تونس</span>
          </div>
        </div>
      </div>

      {/* Gold hairline */}
      <div className="h-[2px] w-full bg-gradient-to-r from-transparent via-brand-gold/70 to-transparent" />

      {/* Main bar */}
      <div className="mx-auto flex max-w-[1600px] items-center justify-between gap-2 px-3 py-2.5 sm:gap-4 sm:px-4 sm:py-3">
        {/* Logo */}
        <Link href="/" className="group flex min-w-0 items-center gap-2 shrink-0 sm:gap-3">
          <div className="relative">
            {/* glow */}
            <div className="absolute inset-0 -z-10 rounded-full bg-brand-red/30 blur-xl transition group-hover:bg-brand-red/50" />
            {/* mascot frame */}
            <div className="relative flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-bg-700 to-bg-800 ring-1 ring-white/10 shadow-card overflow-hidden transition group-hover:scale-105 group-hover:ring-brand-gold/30">
              <img
                src="/mascot.png"
                alt="Mascotte 1111.tn"
                className="h-11 w-11 object-contain drop-shadow-[0_4px_8px_rgba(225,29,45,0.45)] transition group-hover:scale-110"
              />
              <span className="pointer-events-none absolute inset-0 rounded-2xl bg-gradient-to-tr from-white/10 via-transparent to-transparent" />
            </div>
            {/* live indicator */}
            <span className="absolute -bottom-0.5 -right-0.5 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-emerald-500 ring-2 ring-bg-900">
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-white" />
            </span>
          </div>
          <div className="min-w-0 leading-tight">
            <div className="flex items-baseline gap-1 text-lg sm:text-[1.35rem] font-black tracking-tight text-white">
              <span className="text-brand-gold">°</span>
              <span>1111</span>
              <span className="gradient-text-gold">.TN</span>
            </div>
            <div className="hidden xs:flex sm:flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-[0.18em] text-white/45 sm:tracking-[0.22em]">
              <span>Prix</span>
              <span className="h-1 w-1 rounded-full bg-brand-gold/60" />
              <span>Comparateur</span>
              <span className="h-1 w-1 rounded-full bg-brand-gold/60" />
              <span className="text-brand-gold/70">IA</span>
            </div>
          </div>
        </Link>

        {/* Nav */}
        <nav className="hidden lg:flex items-center gap-0.5 rounded-2xl border border-white/5 bg-white/[0.02] p-1">
          {navLinks.map((n) => {
            const isActive = pathname === n.href || pathname.startsWith(n.href + "/");
            return (
              <Link
                key={n.href}
                href={n.href}
                className={`group relative flex flex-col items-center rounded-xl px-3 py-1.5 transition ${
                  isActive
                    ? "bg-gradient-to-b from-white/10 to-white/[0.04] text-white shadow-inner ring-1 ring-white/10"
                    : "text-white/75 hover:bg-white/[0.04] hover:text-white"
                }`}
              >
                <span className="flex items-center gap-1 text-[13px] font-semibold">
                  {n.fr}
                  {n.caret && <ChevronDown className="h-3.5 w-3.5 opacity-60 transition group-hover:opacity-100" />}
                </span>
                <span
                  className={`font-arabic text-[10px] leading-tight transition ${
                    isActive ? "text-brand-gold" : "text-white/40 group-hover:text-brand-gold/70"
                  }`}
                >
                  {n.ar}
                </span>
                {isActive && (
                  <span className="absolute -bottom-[5px] left-1/2 h-1 w-8 -translate-x-1/2 rounded-full bg-gradient-to-r from-brand-red via-brand-gold to-brand-red shadow-[0_0_8px_rgba(246,196,83,0.6)]" />
                )}
              </Link>
            );
          })}
        </nav>

        {/* Search (desktop) */}
        <div className="hidden xl:flex relative w-72">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/40" />
          <input
            type="search"
            placeholder="Rechercher un produit, marque, magasin…"
            className="w-full rounded-xl border border-white/10 bg-white/[0.04] py-2 pl-9 pr-14 text-sm text-white placeholder:text-white/35 outline-none transition focus:border-brand-gold/50 focus:bg-white/[0.06] focus:ring-2 focus:ring-brand-gold/20"
          />
          <kbd className="absolute right-2 top-1/2 -translate-y-1/2 rounded-md border border-white/10 bg-white/5 px-1.5 py-0.5 text-[10px] font-semibold text-white/60">
            ⌘K
          </kbd>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1">
          <button
            className="lg:hidden flex h-9 w-9 items-center justify-center rounded-xl text-white/80 hover:bg-white/10 hover:text-white transition"
            aria-label="Rechercher"
          >
            <Search className="h-4 w-4" />
          </button>

          <button
            className="hidden sm:flex h-9 items-center gap-1.5 rounded-xl border border-white/10 bg-white/[0.03] px-2.5 text-xs font-semibold text-white/85 hover:border-brand-gold/30 hover:bg-white/[0.06] hover:text-white transition"
            aria-label="Langue"
          >
            <Globe className="h-3.5 w-3.5 text-brand-gold/80" />
            FR
            <span className="text-white/30">·</span>
            <span className="font-arabic text-white/70">ع</span>
          </button>

          <button
            className="relative flex h-9 w-9 items-center justify-center rounded-xl text-white/80 hover:bg-white/10 hover:text-white transition"
            aria-label="Favoris"
          >
            <Heart className="h-4 w-4" />
          </button>

          <button
            className="relative flex h-9 w-9 items-center justify-center rounded-xl text-white/80 hover:bg-white/10 hover:text-white transition"
            aria-label="Notifications"
          >
            <Bell className="h-4 w-4" />
            <span className="absolute right-1 top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-brand-red px-1 text-[10px] font-bold text-white ring-2 ring-bg-900">
              3
            </span>
            <span className="pointer-events-none absolute right-1 top-1 h-4 w-4 animate-ping rounded-full bg-brand-red/60" />
          </button>

          <div className="mx-1 hidden sm:block h-6 w-px bg-white/10" />

          <button className="hidden md:flex h-9 items-center gap-2 rounded-xl border border-white/10 bg-white/[0.03] px-3 text-sm font-medium text-white/90 hover:border-white/20 hover:bg-white/[0.06] hover:text-white transition">
            <User className="h-4 w-4" />
            Se connecter
          </button>

          <button className="group relative h-9 overflow-hidden rounded-xl bg-gradient-to-br from-brand-red via-brand-redDark to-[#7a0f1a] px-3 text-xs font-bold text-white shadow-glow ring-1 ring-white/10 transition hover:shadow-[0_0_30px_rgba(225,29,45,0.55)] hover:ring-brand-gold/30 sm:px-4 sm:text-sm">
            <span className="relative z-10 flex items-center gap-1.5">
              <span className="font-arabic">تسجيل الدخول</span>
            </span>
            <span className="pointer-events-none absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/30 to-transparent transition-transform duration-700 group-hover:translate-x-full" />
          </button>
        </div>
      </div>
    </header>
  );
}
