"use client";
import { useAuth } from "@/lib/auth";
import { Lock, LogIn, UserPlus } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

// Pages accessible without authentication.
// Match: exact match OR prefix-with-slash (so `/register/foo` is still gated unless explicitly allowed).
const PUBLIC_PATHS = new Set<string>([
  "/",
  "/login",
  "/register",
  "/mot-de-passe-oublie",
  "/verify-email",
]);

function isPublic(pathname: string): boolean {
  if (PUBLIC_PATHS.has(pathname)) return true;
  // Match nested under verify-email or mot-de-passe-oublie (token routes etc.)
  if (pathname.startsWith("/verify-email/") || pathname.startsWith("/mot-de-passe-oublie/")) return true;
  return false;
}

export function AuthGate({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);

  // Avoid hydration flash: only gate after client mount
  useEffect(() => { setMounted(true); }, []);

  if (!mounted || loading) return <>{children}</>;
  if (isPublic(pathname)) return <>{children}</>;
  if (user) return <>{children}</>;

  // Locked: show modal with backdrop, render children blurred behind
  return (
    <>
      {/* Blurred / pointer-disabled content behind */}
      <div className="pointer-events-none select-none blur-sm" aria-hidden>
        {children}
      </div>

      {/* Modal */}
      <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
        {/* Backdrop */}
        <div className="absolute inset-0 bg-slate-900/70 backdrop-blur-md" />

        {/* Card */}
        <div className="relative w-full max-w-md overflow-hidden rounded-2xl border border-brand-gold/30 bg-white shadow-[0_24px_64px_-12px_rgba(0,0,0,0.5)] dark:bg-bg-700">
          {/* Decorative glow */}
          <div className="pointer-events-none absolute -right-12 -top-12 h-40 w-40 rounded-full bg-brand-gold/25 blur-3xl" />
          <div className="pointer-events-none absolute -left-12 -bottom-12 h-40 w-40 rounded-full bg-brand-red/20 blur-3xl" />

          <div className="relative p-6 sm:p-7 text-center">
            {/* Lock icon */}
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-brand-gold/30 via-brand-gold/15 to-transparent ring-1 ring-brand-gold/40">
              <Lock className="h-7 w-7 text-brand-gold" />
            </div>

            {/* Heading */}
            <h2 className="mt-4 text-xl font-black tracking-tight text-slate-900 dark:text-white">
              Connexion requise
            </h2>
            <p className="mt-1 font-arabic text-xs text-slate-500 dark:text-white/55" dir="rtl">
              يلزم تسجيل الدخول
            </p>

            {/* Message */}
            <p className="mt-3 text-sm leading-relaxed text-slate-600 dark:text-white/70">
              Pour accéder à cette page et profiter de toutes les fonctionnalités de
              <span className="font-bold text-brand-gold"> 1111.tn</span>, veuillez vous connecter à votre compte.
            </p>

            {/* Highlights */}
            <ul className="mt-4 space-y-1.5 rounded-xl border border-slate-200 bg-slate-50 p-3 text-left text-[11px] text-slate-600 dark:border-white/5 dark:bg-bg-800 dark:text-white/70">
              <li className="flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                Comparez les prix sur tous les sites
              </li>
              <li className="flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-blue-500" />
                Recevez des alertes sur vos produits favoris
              </li>
              <li className="flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-brand-red" />
                Profitez des prédictions IA
              </li>
            </ul>

            {/* CTAs */}
            <div className="mt-5 space-y-2">
              <Link
                href={`/login?redirect=${encodeURIComponent(pathname)}`}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-brand-gold to-amber-500 px-4 py-2.5 text-sm font-bold text-black shadow-[0_4px_18px_-4px_rgba(246,196,83,0.6)] transition hover:from-amber-400 hover:to-amber-500"
              >
                <LogIn className="h-4 w-4" />
                Se connecter
              </Link>

              <Link
                href={`/register?redirect=${encodeURIComponent(pathname)}`}
                className="flex w-full items-center justify-center gap-2 rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:border-brand-gold/40 hover:text-brand-gold dark:border-white/10 dark:bg-bg-800 dark:text-white/80 dark:hover:border-brand-gold/40"
              >
                <UserPlus className="h-4 w-4" />
                Créer un compte
              </Link>
            </div>

            {/* Footer link */}
            <Link
              href="/"
              className="mt-4 inline-block text-[11px] font-medium text-slate-500 transition hover:text-brand-gold dark:text-white/50"
            >
              ← Retour à l&apos;accueil
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}
