import Link from "next/link";
import {
  ChevronRight,
  Activity,
  Bell,
  Bot,
  Eye,
  Flame,
  Gauge,
  LayoutGrid,
  Scale,
  ShoppingBasket,
  ShoppingCart,
  Store,
} from "lucide-react";
import { Header } from "../Header";
import { Footer } from "../Footer";
import { PageContainer } from "./PageContainer";

/* Icons are mapped by string key so server pages stay serializable
   (functions can't cross the server→client boundary). */
const iconMap = {
  activity: Activity,
  bell: Bell,
  bot: Bot,
  eye: Eye,
  flame: Flame,
  gauge: Gauge,
  grid: LayoutGrid,
  scale: Scale,
  basket: ShoppingBasket,
  cart: ShoppingCart,
  store: Store,
} as const;

export type PageIcon = keyof typeof iconMap;

export type Chip = { label: string; value: string; tone?: "gold" | "red" | "emerald" | "blue" };

const toneMap: Record<NonNullable<Chip["tone"]>, string> = {
  gold: "text-brand-gold border-brand-gold/25 bg-brand-gold/10",
  red: "text-red-600 border-red-500/25 bg-red-500/10 dark:text-red-300",
  emerald: "text-emerald-600 border-emerald-500/25 bg-emerald-500/10 dark:text-emerald-300",
  blue: "text-blue-600 border-blue-500/25 bg-blue-500/10 dark:text-blue-300",
};

export function PageShell({
  icon,
  title,
  accent,
  arabic,
  description,
  chips,
  live,
  children,
}: {
  icon: PageIcon;
  title: string;
  accent?: string;
  arabic?: string;
  description?: string;
  chips?: Chip[];
  live?: boolean;
  children: React.ReactNode;
}) {
  const Icon = iconMap[icon];
  return (
    <main className="min-h-screen bg-bg-900">
      <Header />

      <PageContainer className="pt-5">
        {/* Breadcrumb */}
        <nav className="reveal-up mb-3 flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-400 dark:text-white/40">
          <Link href="/" className="transition hover:text-brand-gold">Accueil</Link>
          <ChevronRight className="h-3 w-3 opacity-60" />
          <span className="text-brand-gold">{title}</span>
        </nav>

        {/* Hero header */}
        <div
          className="reveal-up relative overflow-hidden rounded-2xl border border-bg-border bg-gradient-to-br from-bg-700 to-bg-800 p-5 sm:p-7"
          style={{ animationDelay: "0.06s" }}
        >
          {/* ambient glow */}
          <div className="pointer-events-none absolute -left-10 -top-10 h-48 w-48 rounded-full bg-brand-red/15 blur-3xl" />
          <div className="pointer-events-none absolute right-0 top-0 h-44 w-44 rounded-full bg-brand-gold/10 blur-3xl" />

          <div className="relative flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
            <div className="flex min-w-0 items-start gap-3 sm:gap-4">
              <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-brand-gold/25 to-brand-gold/5 ring-1 ring-brand-gold/30 shadow-[0_0_30px_-8px_rgba(246,196,83,0.5)] sm:h-14 sm:w-14">
                <Icon className="h-6 w-6 text-brand-gold sm:h-7 sm:w-7" strokeWidth={2} />
              </span>

              <div className="min-w-0">
                <h1 className="text-xl font-black leading-[1.08] tracking-tight text-slate-900 sm:text-3xl md:text-4xl dark:text-white">
                  {title} {accent && <span className="gradient-text-gold">{accent}</span>}
                  {live && (
                    <span className="ml-2 inline-flex translate-y-[-4px] items-center gap-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-1 align-middle text-[11px] font-semibold text-emerald-600 dark:text-emerald-300">
                      <span className="live-dot" /> Live
                    </span>
                  )}
                </h1>
                {arabic && (
                  <p className="mt-1 font-arabic text-base text-slate-500 dark:text-white/55" dir="rtl">{arabic}</p>
                )}
                {description && (
                  <p className="mt-2 max-w-2xl text-sm leading-relaxed text-slate-600 dark:text-white/70">{description}</p>
                )}
              </div>
            </div>

            {chips && chips.length > 0 && (
              <div className="flex w-full flex-wrap gap-2 md:w-auto md:max-w-md md:justify-end lg:max-w-none">
                {chips.map((c) => (
                  <div key={c.label} className={`min-w-[5.5rem] flex-1 rounded-xl border px-3 py-2 sm:min-w-0 sm:flex-none ${toneMap[c.tone ?? "gold"]}`}>
                    <div className="text-lg font-black leading-none tabular-nums">{c.value}</div>
                    <div className="mt-0.5 text-[10px] uppercase tracking-wider opacity-80">{c.label}</div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* gold hairline */}
          <div className="mt-5 h-px w-full bg-gradient-to-r from-transparent via-brand-gold/40 to-transparent" />
        </div>
      </PageContainer>

      <PageContainer className="mt-5 space-y-5 pb-10 sm:mt-6 sm:space-y-6 sm:pb-14">
        {children}
      </PageContainer>

      <Footer />
    </main>
  );
}
