"use client";
import { Facebook, Instagram, Music2, Star, Youtube } from "lucide-react";

const columns = [
  {
    title: "À propos",
    links: ["Qui sommes-nous", "Notre mission", "Équipe", "Carrières"],
  },
  {
    title: "Aide",
    links: ["FAQ", "Contact", "Support technique", "Signaler un problème"],
  },
  {
    title: "Mentions légales",
    links: ["CGU", "Confidentialité", "Cookies", "Mentions"],
  },
];

export function Footer() {
  return (
    <footer className="mx-auto mt-8 max-w-[1600px] px-3 pb-10 sm:px-4">
      <div className="card card-pad">
        <div className="grid grid-cols-1 gap-6 md:grid-cols-[1.2fr_2fr_1fr]">
          <div>
            <div className="flex items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-brand-red to-brand-redDark">
                <span className="font-black text-white">11</span>
              </div>
              <div className="text-xl font-black text-slate-900 dark:text-white">
                °1111<span className="text-brand-gold">.TN</span>
              </div>
            </div>
            <p className="mt-2 text-xs text-slate-500 dark:text-white/60">
              Le moteur d'intelligence des prix en Tunisie.
              <br />
              <span className="font-arabic">محرك ذكاء الأسعار في تونس</span>
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
            {columns.map((c) => (
              <div key={c.title}>
                <div className="mb-2 text-sm font-semibold text-slate-900 dark:text-white">{c.title}</div>
                <ul className="space-y-1.5 text-xs text-slate-500 dark:text-white/60">
                  {c.links.map((l) => (
                    <li key={l}>
                      <a className="hover:text-brand-gold" href="#">
                        {l}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <div>
            <div className="text-sm font-semibold text-slate-900 dark:text-white">Suivez-nous</div>
            <div className="mt-2 flex items-center gap-2">
              {[Facebook, Instagram, Youtube, Music2].map((I, idx) => (
                <a
                  key={idx}
                  href="#"
                  className="rounded-lg border border-bg-border bg-bg-700 p-2 text-slate-600 hover:border-slate-400 hover:text-slate-900 dark:bg-bg-800 dark:text-white/80 dark:hover:border-white/30 dark:hover:text-white"
                >
                  <I className="h-4 w-4" />
                </a>
              ))}
            </div>

            <div className="mt-4 flex items-center gap-2 rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-3">
              <div className="text-xs">
                <div className="font-semibold text-emerald-600 dark:text-emerald-300">Excellent</div>
                <div className="flex items-center gap-0.5 text-brand-gold">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star key={i} className="h-3 w-3 fill-current" />
                  ))}
                </div>
              </div>
              <div className="text-lg font-extrabold text-slate-900 dark:text-white">4.8/5</div>
            </div>
          </div>
        </div>

        <div className="mt-5 flex flex-col items-start justify-between gap-2 border-t border-bg-border pt-4 text-[11px] text-slate-400 md:flex-row md:items-center dark:text-white/50">
          <div>© {new Date().getFullYear()} 1111.tn — Tous droits réservés.</div>
          <div>Fait avec passion en Tunisie 🇹🇳</div>
        </div>
      </div>
    </footer>
  );
}
