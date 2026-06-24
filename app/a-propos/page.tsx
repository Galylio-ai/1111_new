import Link from "next/link";
import {
  ChevronRight, Mail, MapPin, Briefcase, HelpCircle, Target, Users, Sparkles,
} from "lucide-react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";

export const metadata = { title: "À propos — 1111.tn" };

const faqs = [
  {
    q: "Comment 1111.tn obtient-il les prix ?",
    a: "Nos systèmes collectent automatiquement et en continu les prix publiés sur les sites e-commerce et enseignes tunisiennes, puis les normalisent pour permettre la comparaison.",
  },
  {
    q: "Les prix affichés sont-ils toujours à jour ?",
    a: "Nous mettons à jour les prix très régulièrement, mais ils restent indicatifs. Le prix faisant foi est celui affiché sur le site du marchand au moment de l'achat.",
  },
  {
    q: "Le service est-il gratuit ?",
    a: "Oui. La comparaison de prix, les favoris et les alertes de prix sont entièrement gratuits.",
  },
  {
    q: "Comment fonctionnent les alertes de prix ?",
    a: "Depuis une fiche produit, activez « M'alerter si le prix baisse ». Vous recevrez une notification dans votre profil et un e-mail dès qu'une baisse est détectée.",
  },
  {
    q: "Vendez-vous des produits directement ?",
    a: "Non. 1111.tn est un comparateur : nous vous orientons vers le marchand, mais la transaction se fait directement sur son site.",
  },
];

export default function AProposPage() {
  return (
    <main className="min-h-screen bg-slate-50 dark:bg-[#0a0e1a]">
      <Header />

      <div className="mx-auto max-w-[900px] px-4 pt-5 pb-16">
        <nav className="mb-5 flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-400 dark:text-white/40">
          <Link href="/" className="transition hover:text-brand-gold">Accueil</Link>
          <ChevronRight className="h-3 w-3 opacity-60" />
          <span className="text-brand-gold">À propos</span>
        </nav>

        {/* Hero */}
        <div className="relative overflow-hidden rounded-3xl border border-slate-200 bg-white p-7 sm:p-9 dark:border-white/[0.07] dark:bg-[#0d1220]">
          <div className="pointer-events-none absolute -left-16 -top-20 h-56 w-56 rounded-full bg-brand-gold/10 blur-3xl" />
          <div className="relative">
            <span className="mb-4 inline-flex items-center gap-1.5 rounded-full border border-brand-gold/30 bg-brand-gold/10 px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-brand-gold">
              <Sparkles className="h-3 w-3" /> À propos de 1111.tn
            </span>
            <h1 className="text-3xl font-black tracking-tight text-slate-900 sm:text-4xl dark:text-white">
              La police des <span className="gradient-text-gold">prix</span> en Tunisie
            </h1>
            <p className="mt-3 max-w-2xl text-sm leading-relaxed text-slate-600 dark:text-white/70">
              1111.tn aide les consommateurs tunisiens à acheter mieux : comparer les prix sur des
              centaines de milliers de produits, démasquer les fausses promotions et être alerté quand
              les prix baissent vraiment.
            </p>
          </div>
        </div>

        {/* Qui sommes-nous / Mission */}
        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
          <section id="qui-sommes-nous" className="scroll-mt-24 rounded-3xl border border-slate-200 bg-white p-6 dark:border-white/[0.07] dark:bg-[#0d1220]">
            <Users className="h-6 w-6 text-brand-gold" />
            <h2 className="mt-3 text-lg font-black text-slate-900 dark:text-white">Qui sommes-nous</h2>
            <p className="mt-2 text-sm leading-relaxed text-slate-600 dark:text-white/70">
              Une équipe tunisienne passionnée de tech et de données, convaincue que la transparence
              des prix profite à tout le monde. Nous construisons des outils simples pour un marché plus
              juste.
            </p>
          </section>

          <section id="mission" className="scroll-mt-24 rounded-3xl border border-slate-200 bg-white p-6 dark:border-white/[0.07] dark:bg-[#0d1220]">
            <Target className="h-6 w-6 text-brand-gold" />
            <h2 className="mt-3 text-lg font-black text-slate-900 dark:text-white">Notre mission</h2>
            <p className="mt-2 text-sm leading-relaxed text-slate-600 dark:text-white/70">
              Donner à chaque Tunisien le pouvoir d'acheter au meilleur prix, en rendant l'information
              tarifaire claire, fiable et accessible à tous, en temps réel.
            </p>
          </section>
        </div>

        {/* Carrières */}
        <section id="carrieres" className="mt-4 scroll-mt-24 rounded-3xl border border-slate-200 bg-white p-6 dark:border-white/[0.07] dark:bg-[#0d1220]">
          <div className="flex items-start gap-3">
            <Briefcase className="mt-0.5 h-6 w-6 shrink-0 text-brand-gold" />
            <div>
              <h2 className="text-lg font-black text-slate-900 dark:text-white">Carrières</h2>
              <p className="mt-2 text-sm leading-relaxed text-slate-600 dark:text-white/70">
                Vous voulez rejoindre l'aventure ? Nous sommes toujours à la recherche de talents
                (data, développement, produit). Écrivez-nous à{" "}
                <a href="mailto:jobs@1111.tn" className="font-semibold text-brand-gold hover:underline">jobs@1111.tn</a>{" "}
                avec votre CV et quelques mots sur vous.
              </p>
            </div>
          </div>
        </section>

        {/* Contact */}
        <section id="contact" className="mt-4 scroll-mt-24 rounded-3xl border border-slate-200 bg-white p-6 dark:border-white/[0.07] dark:bg-[#0d1220]">
          <h2 className="text-lg font-black text-slate-900 dark:text-white">Contact</h2>
          <div className="mt-3 flex flex-col gap-2 text-sm text-slate-600 dark:text-white/70">
            <span className="flex items-center gap-2"><Mail className="h-4 w-4 text-brand-gold" /> <a href="mailto:contact@1111.tn" className="hover:text-brand-gold">contact@1111.tn</a></span>
            <span className="flex items-center gap-2"><MapPin className="h-4 w-4 text-brand-gold" /> Tunis, Tunisie</span>
          </div>
        </section>

        {/* FAQ */}
        <section id="faq" className="mt-4 scroll-mt-24 rounded-3xl border border-slate-200 bg-white p-6 sm:p-7 dark:border-white/[0.07] dark:bg-[#0d1220]">
          <h2 className="flex items-center gap-2 text-lg font-black text-slate-900 dark:text-white">
            <HelpCircle className="h-5 w-5 text-brand-gold" /> Questions fréquentes
          </h2>
          <div className="mt-4 divide-y divide-slate-100 dark:divide-white/[0.06]">
            {faqs.map((f) => (
              <details key={f.q} className="group py-3">
                <summary className="flex cursor-pointer items-center justify-between gap-3 text-sm font-bold text-slate-800 dark:text-white/90">
                  {f.q}
                  <ChevronRight className="h-4 w-4 shrink-0 text-brand-gold transition group-open:rotate-90" />
                </summary>
                <p className="mt-2 text-sm leading-relaxed text-slate-600 dark:text-white/65">{f.a}</p>
              </details>
            ))}
          </div>
        </section>
      </div>

      <Footer />
    </main>
  );
}
