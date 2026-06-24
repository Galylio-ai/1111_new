import Link from "next/link";
import { ChevronRight, ShieldCheck } from "lucide-react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";

// Shared layout for legal / informational pages (CGU, Confidentialité, Cookies).
export function LegalShell({
  title,
  arabic,
  updated,
  intro,
  children,
}: {
  title: string;
  arabic?: string;
  updated: string;
  intro?: string;
  children: React.ReactNode;
}) {
  return (
    <main className="min-h-screen bg-slate-50 dark:bg-[#0a0e1a]">
      <Header />

      <div className="mx-auto max-w-[900px] px-4 pt-5 pb-16">
        <nav className="mb-5 flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-400 dark:text-white/40">
          <Link href="/" className="transition hover:text-brand-gold">Accueil</Link>
          <ChevronRight className="h-3 w-3 opacity-60" />
          <span className="text-brand-gold">{title}</span>
        </nav>

        {/* Hero */}
        <div className="relative overflow-hidden rounded-3xl border border-slate-200 bg-white p-7 sm:p-9 dark:border-white/[0.07] dark:bg-[#0d1220]">
          <div className="pointer-events-none absolute -left-16 -top-20 h-56 w-56 rounded-full bg-brand-gold/10 blur-3xl" />
          <div className="relative">
            <span className="mb-4 inline-flex items-center gap-1.5 rounded-full border border-brand-gold/30 bg-brand-gold/10 px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-brand-gold">
              <ShieldCheck className="h-3 w-3" /> Mentions légales
            </span>
            <h1 className="text-3xl font-black tracking-tight text-slate-900 sm:text-4xl dark:text-white">{title}</h1>
            {arabic && (
              <p className="mt-1 font-arabic text-base text-slate-500 dark:text-white/50" dir="rtl">{arabic}</p>
            )}
            <p className="mt-3 text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-white/40">
              Dernière mise à jour : {updated}
            </p>
            {intro && <p className="mt-4 max-w-2xl text-sm leading-relaxed text-slate-600 dark:text-white/70">{intro}</p>}
          </div>
        </div>

        {/* Body */}
        <article className="mt-6 space-y-6 rounded-3xl border border-slate-200 bg-white p-7 sm:p-9 dark:border-white/[0.07] dark:bg-[#0d1220]">
          {children}
        </article>
      </div>

      <Footer />
    </main>
  );
}

// A titled section with body content.
export function LegalSection({ n, title, children }: { n: number; title: string; children: React.ReactNode }) {
  return (
    <section>
      <h2 className="flex items-center gap-2.5 text-lg font-black text-slate-900 dark:text-white">
        <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-brand-gold/15 text-sm font-black text-brand-gold">
          {n}
        </span>
        {title}
      </h2>
      <div className="mt-2.5 space-y-2.5 pl-9 text-sm leading-relaxed text-slate-600 dark:text-white/70">
        {children}
      </div>
    </section>
  );
}
