"use client";
import { ArrowRight, Facebook, Instagram, Mail, MapPin, Music2, ShieldCheck, Star, TrendingUp, Youtube } from "lucide-react";
import Link from "next/link";

const columns = [
  {
    title: "Explorer",
    links: [
      { label: "Catégories", href: "/categories" },
      { label: "Supermarché", href: "/supermarche" },
      { label: "Parapharmacie", href: "/parapharmacie" },
      { label: "Magasins", href: "/retail" },
      { label: "Promotions", href: "/promotions" },
    ],
  },
  {
    title: "Outils",
    links: [
      { label: "Comparateur", href: "/comparateur" },
      { label: "Indice du marché", href: "/indice" },
      { label: "Baromètres", href: "/barometres" },
      { label: "Observatoire", href: "/observatoire" },
      { label: "Alertes prix", href: "/alertes" },
    ],
  },
  {
    title: "À propos",
    links: [
      { label: "Qui sommes-nous", href: "#" },
      { label: "Notre mission", href: "#" },
      { label: "Carrières", href: "#" },
      { label: "Contact", href: "#" },
      { label: "FAQ", href: "#" },
    ],
  },
];

const socials = [
  { Icon: Facebook, label: "Facebook", hover: "hover:bg-[#1877f2] hover:border-[#1877f2]" },
  { Icon: Instagram, label: "Instagram", hover: "hover:bg-gradient-to-br hover:from-[#feda75] hover:via-[#d62976] hover:to-[#4f5bd5] hover:border-transparent" },
  { Icon: Youtube, label: "YouTube", hover: "hover:bg-[#ff0000] hover:border-[#ff0000]" },
  { Icon: Music2, label: "TikTok", hover: "hover:bg-black hover:border-black" },
];

export function Footer() {
  return (
    <footer className="mx-auto mt-12 max-w-[1600px] px-3 pb-10 sm:px-4">
      <div className="relative overflow-hidden rounded-3xl border border-slate-200 bg-gradient-to-b from-white to-slate-50 shadow-card dark:border-white/10 dark:from-bg-800 dark:to-[#0a0e1a]">
        {/* Ambient glows */}
        <div className="pointer-events-none absolute -left-20 -top-24 h-64 w-64 rounded-full bg-brand-red/10 blur-3xl" />
        <div className="pointer-events-none absolute -right-16 top-1/3 h-56 w-56 rounded-full bg-brand-gold/10 blur-3xl" />

        {/* Gold hairline top */}
        <div className="h-[2px] w-full bg-gradient-to-r from-transparent via-brand-gold/70 to-transparent" />

        {/* Newsletter band */}
        <div className="relative flex flex-col items-start justify-between gap-5 border-b border-slate-200 px-6 py-7 md:flex-row md:items-center md:px-10 dark:border-white/10">
          <div className="max-w-md">
            <h3 className="flex items-center gap-2 text-lg font-black tracking-tight text-slate-900 dark:text-white">
              <TrendingUp className="h-5 w-5 text-brand-gold" />
              Ne ratez plus jamais une vraie promo
            </h3>
            <p className="mt-1 text-sm text-slate-500 dark:text-white/60">
              Recevez les meilleures baisses de prix et alertes du marché tunisien, chaque semaine.
            </p>
          </div>
          <form
            className="flex w-full max-w-md items-center gap-2 md:w-auto"
            onSubmit={(e) => e.preventDefault()}
          >
            <div className="relative flex-1 md:w-72">
              <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400 dark:text-white/40" />
              <input
                type="email"
                required
                placeholder="Votre adresse e-mail"
                className="w-full rounded-xl border border-slate-300 bg-white py-2.5 pl-9 pr-3 text-sm text-slate-900 placeholder:text-slate-400 outline-none transition focus:border-brand-gold/50 focus:ring-2 focus:ring-brand-gold/20 dark:border-white/10 dark:bg-white/[0.04] dark:text-white dark:placeholder:text-white/35"
              />
            </div>
            <button
              type="submit"
              className="group flex shrink-0 items-center gap-1.5 rounded-xl bg-gradient-to-r from-brand-red to-brand-redDark px-4 py-2.5 text-sm font-bold text-white shadow-[0_2px_12px_rgba(225,29,45,0.4)] transition-all hover:brightness-110 hover:shadow-[0_4px_18px_rgba(225,29,45,0.55)] active:scale-[0.98]"
            >
              S'abonner
              <ArrowRight className="h-4 w-4 transition group-hover:translate-x-0.5" />
            </button>
          </form>
        </div>

        {/* Main grid */}
        <div className="relative grid grid-cols-1 gap-8 px-6 py-9 md:grid-cols-[1.4fr_2.2fr_1fr] md:px-10">
          {/* Brand block */}
          <div>
            <Link href="/" className="flex items-center gap-2.5">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-brand-red to-brand-redDark shadow-glow ring-1 ring-white/10">
                <span className="text-lg font-black text-white">11</span>
              </div>
              <div className="text-2xl font-black tracking-tight text-slate-900 dark:text-white">
                <span className="text-brand-gold">°</span>1111<span className="gradient-text-gold">.TN</span>
              </div>
            </Link>
            <p className="mt-4 text-sm leading-relaxed text-slate-500 dark:text-white/60">
              Le moteur d'intelligence des prix en Tunisie. Comparez, surveillez et économisez sur plus de 250 000 produits.
            </p>
            <p className="mt-2 font-arabic text-sm text-slate-500 dark:text-white/60" dir="rtl">
              محرك ذكاء الأسعار في تونس
            </p>

            <div className="mt-5 flex flex-col gap-2 text-sm text-slate-500 dark:text-white/55">
              <span className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-brand-gold" /> Tunis, Tunisie
              </span>
              <span className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-brand-gold" /> contact@1111.tn
              </span>
            </div>
          </div>

          {/* Link columns */}
          <div className="grid grid-cols-2 gap-6 sm:grid-cols-3">
            {columns.map((c) => (
              <div key={c.title}>
                <div className="mb-3 text-sm font-bold uppercase tracking-wider text-slate-900 dark:text-white">
                  {c.title}
                </div>
                <ul className="space-y-2.5 text-sm">
                  {c.links.map((l) => (
                    <li key={l.label}>
                      <Link
                        href={l.href}
                        className="group inline-flex items-center gap-1.5 text-slate-500 transition hover:text-brand-gold dark:text-white/60 dark:hover:text-brand-gold"
                      >
                        <span className="h-1 w-1 rounded-full bg-slate-300 transition group-hover:bg-brand-gold dark:bg-white/20" />
                        {l.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          {/* Social + trust */}
          <div>
            <div className="mb-3 text-sm font-bold uppercase tracking-wider text-slate-900 dark:text-white">Suivez-nous</div>
            <div className="flex items-center gap-2.5">
              {socials.map(({ Icon, label, hover }) => (
                <a
                  key={label}
                  href="#"
                  aria-label={label}
                  className={`flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 transition-all hover:-translate-y-0.5 hover:text-white dark:border-white/10 dark:bg-white/[0.04] dark:text-white/80 ${hover}`}
                >
                  <Icon className="h-4 w-4" />
                </a>
              ))}
            </div>

            {/* Trust rating */}
            <div className="mt-5 rounded-2xl border border-emerald-500/30 bg-gradient-to-br from-emerald-500/10 to-transparent p-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-bold text-emerald-600 dark:text-emerald-300">Excellent</span>
                <span className="text-xl font-black text-slate-900 dark:text-white">4.8<span className="text-sm text-slate-400 dark:text-white/40">/5</span></span>
              </div>
              <div className="mt-1.5 flex items-center gap-0.5 text-brand-gold">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} className="h-4 w-4 fill-current" />
                ))}
              </div>
              <p className="mt-1.5 text-xs text-slate-500 dark:text-white/50">Basé sur 2 400+ avis vérifiés</p>
            </div>

            {/* Trust badge */}
            <div className="mt-3 flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-xs text-slate-500 dark:border-white/10 dark:bg-white/[0.03] dark:text-white/60">
              <ShieldCheck className="h-4 w-4 shrink-0 text-brand-gold" />
              Données vérifiées en temps réel
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="relative flex flex-col items-center justify-between gap-3 border-t border-slate-200 px-6 py-5 text-xs text-slate-400 md:flex-row md:px-10 dark:border-white/10 dark:text-white/50">
          <div>© {new Date().getFullYear()} 1111.tn — Tous droits réservés.</div>
          <div className="flex items-center gap-4">
            <Link href="#" className="transition hover:text-brand-gold">CGU</Link>
            <Link href="#" className="transition hover:text-brand-gold">Confidentialité</Link>
            <Link href="#" className="transition hover:text-brand-gold">Cookies</Link>
          </div>
          <div className="flex items-center gap-1.5">
            Fait avec passion en Tunisie <span className="text-base leading-none">🇹🇳</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
