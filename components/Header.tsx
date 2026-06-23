"use client";
import { ChevronDown, Flame, LogOut, Menu, ShieldCheck, Sparkles, TrendingUp, User, X } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { navLinks } from "@/lib/nav";
import { ThemeToggle } from "./ThemeToggle";
import { useAuth } from "@/lib/auth";
import { NotificationBell } from "./site/NotificationBell";

const tickerItems = [
  { icon: TrendingUp, label: "Indice marché", value: "108.7", trend: "+1.2%", trendUp: true },
  { icon: Flame, label: "Promos actives", value: "152" },
  { icon: ShieldCheck, label: "Fausses promos", value: "37" },
  { icon: Sparkles, label: "Économisés aujourd'hui", value: "48 000 DT" },
];

export function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);

  async function handleLogout() {
    await logout();
    router.push("/");
  }

  return (
    <>
      <header className="sticky top-0 z-50 border-b border-slate-200 bg-white/85 backdrop-blur-xl supports-[backdrop-filter]:bg-white/70 dark:border-white/5 dark:bg-[rgba(10,14,26,0.75)] dark:supports-[backdrop-filter]:bg-[rgba(10,14,26,0.60)]">
        {/* Top live ticker strip */}
        <div className="border-b border-slate-200 bg-gradient-to-r from-slate-50 via-white to-slate-50 dark:border-white/5 dark:bg-gradient-to-r dark:from-[#0a0e1a] dark:via-[#0f1422] dark:to-[#0a0e1a]">
          <div className="mx-auto flex max-w-[1600px] items-center justify-between gap-3 px-3 py-1.5 text-[11px] sm:px-4">
            <div className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-300">
              <span className="live-dot" />
              <span className="font-semibold uppercase tracking-wider">En direct</span>
              <span className="hidden sm:inline text-slate-300 dark:text-white/40">·</span>
              <span className="hidden sm:inline text-slate-500 dark:text-white/60">Marché Tunisien</span>
            </div>
            <div className="hidden md:flex items-center gap-5 text-slate-600 dark:text-white/70">
              {tickerItems.map((t) => (
                <div key={t.label} className="flex items-center gap-1.5">
                  <t.icon className="h-3 w-3 text-brand-gold/80" />
                  <span className="text-slate-500 dark:text-white/50">{t.label}</span>
                  <span className="font-semibold tabular-nums text-slate-900 dark:text-white">{t.value}</span>
                  {t.trend && (
                    <span className={`tabular-nums ${t.trendUp ? "text-emerald-600 dark:text-emerald-400" : "text-red-500 dark:text-red-400"}`}>
                      {t.trendUp ? "▲" : "▼"} {t.trend}
                    </span>
                  )}
                </div>
              ))}
            </div>
            <div className="hidden lg:flex items-center gap-3 text-slate-400 dark:text-white/40">
              <span>Tunis · 28°C ☀️</span>
              <span className="text-slate-300 dark:text-white/20">·</span>
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
              <div className="absolute inset-0 -z-10 rounded-full bg-brand-red/30 blur-xl transition group-hover:bg-brand-red/50" />
              <div className="relative flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-slate-100 to-slate-200 ring-1 ring-slate-300 shadow-card overflow-hidden transition group-hover:scale-105 group-hover:ring-brand-gold/30 dark:from-bg-700 dark:to-bg-800 dark:ring-white/10 sm:h-12 sm:w-12">
                <img
                  src="/mascot.png"
                  alt="Mascotte 1111.tn"
                  className="h-9 w-9 object-contain drop-shadow-[0_4px_8px_rgba(225,29,45,0.45)] transition group-hover:scale-110 sm:h-11 sm:w-11"
                />
                <span className="pointer-events-none absolute inset-0 rounded-2xl bg-gradient-to-tr from-white/10 via-transparent to-transparent" />
              </div>
              <span className="absolute -bottom-0.5 -right-0.5 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-emerald-500 ring-2 ring-white dark:ring-bg-900">
                <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-white" />
              </span>
            </div>
            <div className="min-w-0 leading-tight">
              <div className="flex items-baseline gap-1 text-lg sm:text-[1.35rem] font-black tracking-tight text-slate-900 dark:text-white">
                <span className="text-brand-gold">°</span>
                <span>1111</span>
                <span className="gradient-text-gold">.TN</span>
              </div>
              <div className="hidden xs:flex sm:flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-500 sm:tracking-[0.22em] dark:text-white/45">
                <span>Prix</span>
                <span className="h-1 w-1 rounded-full bg-brand-gold/60" />
                <span>Comparateur</span>
                <span className="h-1 w-1 rounded-full bg-brand-gold/60" />
                <span className="text-brand-gold/70">IA</span>
              </div>
            </div>
          </Link>

          {/* Nav (desktop) — xl+ so the 6 links + auth buttons never overflow */}
          <nav className="hidden xl:flex items-center gap-0.5 rounded-2xl border border-slate-200 bg-slate-50 p-1 dark:border-white/5 dark:bg-white/[0.02]">
            {navLinks.map((n) => {
              const isActive = pathname === n.href || pathname.startsWith(n.href + "/");
              return (
                <Link
                  key={n.href}
                  href={n.href}
                  className={`group relative flex flex-col items-center rounded-xl px-3 py-1.5 transition ${
                    isActive
                      ? "bg-gradient-to-b from-slate-200 to-slate-100 text-slate-900 shadow-inner ring-1 ring-slate-300 dark:from-white/10 dark:to-white/[0.04] dark:text-white dark:ring-white/10"
                      : "text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-white/75 dark:hover:bg-white/[0.04] dark:hover:text-white"
                  }`}
                >
                  <span className="flex items-center gap-1 text-[13px] font-semibold">
                    {n.fr}
                    {n.caret && <ChevronDown className="h-3.5 w-3.5 opacity-60 transition group-hover:opacity-100" />}
                  </span>
                  <span
                    className={`font-arabic text-[10px] leading-tight transition ${
                      isActive ? "text-brand-gold" : "text-slate-400 group-hover:text-brand-gold/70 dark:text-white/40"
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

          {/* Actions */}
          <div className="flex items-center gap-1">

            <ThemeToggle />

            <NotificationBell />

            <div className="mx-1 hidden sm:block h-6 w-px bg-slate-200 dark:bg-white/10" />

            {user ? (
              <>
                <Link
                  href="/profil"
                  className="hidden md:flex h-9 items-center gap-2 rounded-xl border border-slate-300 bg-white px-3 text-sm font-medium text-slate-700 hover:border-slate-400 hover:bg-slate-50 hover:text-slate-900 transition dark:border-white/10 dark:bg-white/[0.03] dark:text-white/90 dark:hover:border-white/20 dark:hover:bg-white/[0.06] dark:hover:text-white"
                >
                  {user.avatar_url ? (
                    <img src={user.avatar_url} alt="" className="h-5 w-5 rounded-full object-cover" />
                  ) : (
                    <span className="flex h-5 w-5 items-center justify-center rounded-full bg-brand-gold/20 text-[10px] font-black text-brand-gold">
                      {user.full_name.charAt(0).toUpperCase()}
                    </span>
                  )}
                  <span className="max-w-[100px] truncate">{user.full_name.split(" ")[0]}</span>
                </Link>
                <button
                  onClick={handleLogout}
                  className="group relative h-9 overflow-hidden rounded-xl border border-slate-300 bg-white px-3 text-xs font-bold text-slate-700 transition hover:border-red-300 hover:bg-red-50 hover:text-red-600 dark:border-white/10 dark:bg-white/[0.03] dark:text-white/80 dark:hover:border-red-800/50 dark:hover:bg-red-950/30 dark:hover:text-red-300 sm:px-4"
                >
                  <span className="relative z-10 flex items-center gap-1.5">
                    <LogOut className="h-3.5 w-3.5" />
                    <span className="hidden sm:inline">Déconnexion</span>
                  </span>
                </button>
              </>
            ) : (
              <>
                {/* Login */}
                <Link
                  href="/login"
                  className="hidden sm:flex h-9 items-center gap-2 rounded-xl border border-slate-300 bg-white px-4 text-sm font-semibold text-slate-700 transition hover:border-slate-400 hover:bg-slate-50 dark:border-white/10 dark:bg-white/[0.05] dark:text-white/85 dark:hover:border-white/20 dark:hover:bg-white/[0.09]"
                >
                  <User className="h-4 w-4 text-slate-500 dark:text-white/50" />
                  Login
                </Link>
                {/* Icon-only on xs */}
                <Link
                  href="/login"
                  className="sm:hidden flex h-9 w-9 items-center justify-center rounded-xl border border-slate-300 bg-white text-slate-600 transition hover:bg-slate-50 dark:border-white/10 dark:bg-white/[0.05] dark:text-white/70"
                  aria-label="Login"
                >
                  <User className="h-4 w-4" />
                </Link>

                {/* S'inscrire */}
                <Link
                  href="/register"
                  className="group relative flex h-9 items-center justify-center overflow-hidden rounded-xl bg-gradient-to-r from-brand-red to-brand-redDark px-4 text-sm font-bold text-white shadow-[0_2px_10px_rgba(225,29,45,0.4)] transition-all duration-200 hover:brightness-110 hover:shadow-[0_4px_18px_rgba(225,29,45,0.55)] hover:scale-[1.03] active:scale-[0.98]"
                >
                  <span className="relative z-10 tracking-wide">S'inscrire</span>
                  <span className="pointer-events-none absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/20 to-transparent transition-transform duration-500 group-hover:translate-x-full" />
                </Link>
              </>
            )}

            {/* Hamburger — shown whenever the desktop nav is hidden (below xl) */}
            <button
              className="xl:hidden flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-700 transition hover:bg-slate-100 dark:border-white/10 dark:bg-white/[0.03] dark:text-white/80 dark:hover:bg-white/10 ml-1"
              aria-label="Menu"
              onClick={() => setMenuOpen(true)}
            >
              <Menu className="h-5 w-5" />
            </button>
          </div>
        </div>
      </header>

      {/* Mobile drawer overlay */}
      {menuOpen && (
        <div
          className="fixed inset-0 z-[60] bg-black/50 backdrop-blur-sm xl:hidden"
          onClick={() => setMenuOpen(false)}
        />
      )}

      {/* Mobile drawer */}
      <aside
        className={`fixed inset-y-0 right-0 z-[70] flex w-72 flex-col bg-white shadow-2xl transition-transform duration-300 ease-in-out dark:bg-[#0a0e1a] xl:hidden ${
          menuOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        {/* Drawer header */}
        <div className="flex items-center justify-between border-b border-slate-200 px-4 py-3 dark:border-white/10">
          <span className="font-black text-lg text-slate-900 dark:text-white">
            <span className="text-brand-gold">°</span>1111<span className="gradient-text-gold">.TN</span>
          </span>
          <button
            onClick={() => setMenuOpen(false)}
            className="flex h-8 w-8 items-center justify-center rounded-xl text-slate-500 hover:bg-slate-100 hover:text-slate-900 transition dark:text-white/60 dark:hover:bg-white/10 dark:hover:text-white"
            aria-label="Fermer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Gold hairline */}
        <div className="h-[2px] w-full bg-gradient-to-r from-transparent via-brand-gold/70 to-transparent" />

        {/* Nav links */}
        <nav className="flex-1 overflow-y-auto px-3 py-4">
          <div className="flex flex-col gap-1">
            {navLinks.map((n) => {
              const isActive = pathname === n.href || pathname.startsWith(n.href + "/");
              return (
                <Link
                  key={n.href}
                  href={n.href}
                  onClick={() => setMenuOpen(false)}
                  className={`flex items-center justify-between rounded-xl px-4 py-3 transition ${
                    isActive
                      ? "bg-gradient-to-r from-brand-red/10 to-brand-gold/5 text-slate-900 ring-1 ring-brand-gold/20 dark:from-brand-red/20 dark:to-brand-gold/10 dark:text-white"
                      : "text-slate-700 hover:bg-slate-100 hover:text-slate-900 dark:text-white/75 dark:hover:bg-white/[0.06] dark:hover:text-white"
                  }`}
                >
                  <div className="flex flex-col leading-tight">
                    <span className="text-sm font-semibold">{n.fr}</span>
                    <span className={`font-arabic text-xs ${isActive ? "text-brand-gold" : "text-slate-400 dark:text-white/40"}`}>
                      {n.ar}
                    </span>
                  </div>
                  {isActive && <span className="h-2 w-2 rounded-full bg-brand-gold" />}
                  {n.caret && !isActive && <ChevronDown className="h-4 w-4 text-slate-400 dark:text-white/30" />}
                </Link>
              );
            })}
          </div>
        </nav>

        {/* Drawer footer: auth buttons */}
        <div className="border-t border-slate-200 px-3 py-4 dark:border-white/10">
          {user ? (
            <div className="flex flex-col gap-2">
              <Link
                href="/profil"
                onClick={() => setMenuOpen(false)}
                className="flex items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium text-slate-700 transition hover:bg-slate-100 dark:border-white/10 dark:bg-white/[0.03] dark:text-white/90 dark:hover:bg-white/[0.06]"
              >
                {user.avatar_url ? (
                  <img src={user.avatar_url} alt="" className="h-8 w-8 rounded-full object-cover" />
                ) : (
                  <span className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-gold/20 font-black text-brand-gold">
                    {user.full_name.charAt(0).toUpperCase()}
                  </span>
                )}
                <span className="truncate">{user.full_name}</span>
              </Link>
              <button
                onClick={() => { setMenuOpen(false); handleLogout(); }}
                className="flex items-center justify-center gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-2.5 text-sm font-semibold text-red-600 transition hover:bg-red-100 dark:border-red-900/40 dark:bg-red-950/30 dark:text-red-400 dark:hover:bg-red-950/50"
              >
                <LogOut className="h-4 w-4" />
                Déconnexion
              </button>
            </div>
          ) : (
            <div className="flex flex-col gap-2">
              <Link
                href="/login"
                onClick={() => setMenuOpen(false)}
                className="flex items-center justify-center gap-2 rounded-xl border border-brand-gold/40 bg-gradient-to-br from-brand-gold/10 to-brand-gold/5 px-4 py-2.5 text-sm font-semibold text-slate-800 transition hover:border-brand-gold/70 hover:from-brand-gold/20 dark:border-brand-gold/30 dark:from-brand-gold/10 dark:to-transparent dark:text-white"
              >
                <User className="h-4 w-4 text-brand-gold" />
                Login
              </Link>
              <Link
                href="/register"
                onClick={() => setMenuOpen(false)}
                className="group relative overflow-hidden rounded-xl bg-gradient-to-r from-brand-red to-brand-redDark px-4 py-2.5 text-center text-sm font-bold text-white shadow-[0_2px_12px_rgba(225,29,45,0.45)] ring-1 ring-brand-red/30 transition-all duration-200 hover:brightness-110 hover:shadow-[0_4px_20px_rgba(225,29,45,0.6)] active:scale-[0.98]"
              >
                <span className="relative z-10 tracking-wide">S'inscrire</span>
                <span className="pointer-events-none absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/20 to-transparent transition-transform duration-500 group-hover:translate-x-full" />
              </Link>
            </div>
          )}
        </div>
      </aside>
    </>
  );
}
