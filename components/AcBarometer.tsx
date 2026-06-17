"use client";
import { Sparkles, Sun } from "lucide-react";
import Link from "next/link";

const parapharSites = [
  { rank: 1, rankBg: "bg-yellow-500", name: "Beauty Shop", position: "92/100", positionColor: "text-emerald-400", evolution: "-2", evolutionColor: "text-red-400", avgPrice: "12.500 DT", promotions: "35%", disponibilite: "95%", visitors: "248 320", visitorsTrend: "+12.4%", visitorsUp: true },
  { rank: 2, rankBg: "bg-blue-500", name: "Parashop", position: "89/100", positionColor: "text-emerald-400", evolution: "+1", evolutionColor: "text-emerald-400", avgPrice: "14.200 DT", promotions: "30%", disponibilite: "93%", visitors: "187 540", visitorsTrend: "+8.1%", visitorsUp: true },
  { rank: 3, rankBg: "bg-red-600", name: "Darty", position: "86/100", positionColor: "text-red-400", evolution: "-", evolutionColor: "text-white/60", avgPrice: "9.750 DT", promotions: "28%", disponibilite: "90%", visitors: "142 980", visitorsTrend: "−2.3%", visitorsUp: false },
  { rank: 4, rankBg: "bg-emerald-600", name: "Mytek", position: "82/100", positionColor: "text-emerald-400", evolution: "+3", evolutionColor: "text-emerald-400", avgPrice: "18.300 DT", promotions: "25%", disponibilite: "88%", visitors: "118 460", visitorsTrend: "+5.2%", visitorsUp: true },
  { rank: 5, rankBg: "bg-purple-600", name: "Parapharma", position: "78/100", positionColor: "text-red-400", evolution: "-1", evolutionColor: "text-red-400", avgPrice: "11.640 DT", promotions: "20%", disponibilite: "85%", visitors: "94 210", visitorsTrend: "−4.7%", visitorsUp: false },
];

export function AcBarometer() {
  return (
    <section className="mx-auto mt-5 max-w-[1600px] px-3 sm:px-4">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-[2.5fr_1.5fr]">
        {/* COMPARATEUR PARAPHARMACIE — spans first 2 columns */}
        <div className="card card-pad flex flex-col">
          {/* Title */}
          <div className="mb-4 flex flex-wrap items-baseline gap-3">
            <span className="text-base font-black uppercase tracking-wide text-brand-gold">
              Comparateur de position des sites Parapharmacie
            </span>
            <span className="font-arabic text-sm font-semibold text-brand-gold/80" dir="rtl">
              مقارنة ترتيب مواقع البازفارماسي
            </span>
          </div>

          {/* Table */}
          <div className="overflow-x-auto flex-1">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-slate-500 text-xs dark:text-white/40">
                  <th className="pb-3 text-left font-medium">Sitees</th>
                  <th className="pb-3 text-center font-medium">Position</th>
                  <th className="pb-3 text-center font-medium">Évolution</th>
                  <th className="pb-3 text-center font-medium">Prix moyens</th>
                  <th className="pb-3 text-center font-medium">Promotions</th>
                  <th className="pb-3 text-center font-medium">Disponibilité</th>
                  <th className="pb-3 text-center font-medium">Nombre de visiteurs</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-white/5">
                {parapharSites.map((s) => (
                  <tr key={s.name} className="hover:bg-slate-50 transition dark:hover:bg-white/[0.02]">
                    <td className="py-3">
                      <div className="flex items-center gap-3">
                        <span className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-xs font-black text-white ${s.rankBg}`}>
                          {s.rank}
                        </span>
                        <span className="font-semibold text-slate-900 dark:text-white">{s.name}</span>
                      </div>
                    </td>
                    <td className={`py-3 text-center font-bold tabular-nums ${s.positionColor}`}>{s.position}</td>
                    <td className={`py-3 text-center font-semibold tabular-nums ${s.evolutionColor}`}>{s.evolution}</td>
                    <td className="py-3 text-center font-semibold tabular-nums text-slate-900 dark:text-white">{s.avgPrice}</td>
                    <td className="py-3 text-center font-semibold text-slate-900 dark:text-white">{s.promotions}</td>
                    <td className="py-3 text-center font-bold text-emerald-600 dark:text-emerald-400">{s.disponibilite}</td>
                    <td className="py-3 text-center">
                      <div className="inline-flex flex-col items-center leading-tight">
                        <span className="font-bold tabular-nums text-slate-900 dark:text-white">{s.visitors}</span>
                        <span className={`text-[10px] font-semibold tabular-nums ${s.visitorsUp ? "text-emerald-600 dark:text-emerald-400" : "text-red-500 dark:text-red-400"}`}>
                          {s.visitorsUp ? "▲" : "▼"} {s.visitorsTrend}
                        </span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Bottom button */}
          <div className="mt-4 flex justify-center">
            <Link
              href="/barometres"
              className="rounded-full border border-brand-gold/60 px-8 py-2.5 text-sm font-semibold text-brand-gold hover:bg-brand-gold/10 transition"
            >
              Voir le classement complet
            </Link>
          </div>
        </div>

        {/* MEILLEURES OFFRES — ÉCRAN SOLAIRE */}
        <div className="card card-pad relative overflow-hidden flex flex-col">
          {/* watermark sun */}
          <Sun
            className="pointer-events-none absolute -right-4 -top-4 h-32 w-32 text-white/[0.04]"
            strokeWidth={1.2}
            aria-hidden
          />

          {/* Title */}
          <div className="relative mb-1 flex items-start gap-2.5">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-amber-400/30 to-orange-500/10 ring-1 ring-amber-400/30">
              <Sun className="h-4.5 w-4.5 text-amber-300" strokeWidth={2.2} />
            </span>
            <div className="leading-tight flex-1">
              <div className="text-base font-black tracking-tight text-brand-gold">
                Où acheter ton écran solaire au meilleur prix ?
              </div>
              <div className="font-arabic text-xs font-semibold text-brand-gold/70 mt-0.5" dir="rtl">
                أين تشتري واقي الشمس بأفضل سعر؟
              </div>
            </div>
          </div>

          {/* Product hero */}
          <div className="relative mt-4 flex items-center gap-3 rounded-xl border border-amber-400/20 bg-gradient-to-r from-amber-500/10 via-orange-500/5 to-transparent p-3">
            <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-lg bg-white shadow-md ring-1 ring-amber-300/40">
              <img
                src="/ecran.jpg"
                alt="Écran solaire"
                className="absolute inset-0 h-full w-full object-cover"
              />
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-sm font-bold text-slate-900 dark:text-white">Avène Très Haute Protection SPF 50+</div>
              <div className="text-[11px] text-slate-500 dark:text-white/55">Crème solaire visage · 50ml</div>
              <div className="mt-1 flex items-center gap-2 text-[10px]">
                <span className="rounded-md bg-emerald-500/20 px-1.5 py-0.5 font-bold text-emerald-600 dark:text-emerald-300">En stock</span>
                <span className="text-slate-300 dark:text-white/40">·</span>
                <span className="text-slate-500 dark:text-white/60">3 parapharmacies suivies</span>
              </div>
            </div>
          </div>

          {/* Offers list */}
          <ul className="relative mt-3 flex-1 space-y-2">
            {[
              { rank: 1, name: "Parashop",   logo: "/logos/parashop.png",   url: "https://www.parashop.tn/",  price: "39.500 DT", delta: "−12%", deltaColor: "text-emerald-600 dark:text-emerald-400", best: true },
              { rank: 2, name: "ParaHouse",  logo: "/logos/parahouse.jpg",  url: "https://www.parahouse.tn/", price: "42.300 DT", delta: "−6%",  deltaColor: "text-emerald-600 dark:text-emerald-400", best: false },
              { rank: 3, name: "ParaFendri", logo: "/logos/parafendri.png", url: "https://parafendri.tn/",    price: "44.800 DT", delta: "−0%",  deltaColor: "text-slate-400 dark:text-white/55",    best: false },
            ].map((o) => (
              <li
                key={o.name}
                className={`grid grid-cols-[24px_40px_1fr_auto_auto] items-center gap-2.5 rounded-xl border px-2.5 py-2 transition ${
                  o.best
                    ? "border-brand-gold/40 bg-gradient-to-r from-brand-gold/15 via-brand-gold/5 to-transparent shadow-[0_0_18px_-8px_rgba(246,196,83,0.55)]"
                    : "border-slate-200 bg-slate-50 hover:border-slate-300 hover:bg-slate-100 dark:border-white/[0.05] dark:bg-bg-800 dark:hover:border-white/15 dark:hover:bg-bg-700"
                }`}
              >
                {/* rank */}
                <span className={`flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-black tabular-nums ${
                  o.rank === 1 ? "bg-gradient-to-br from-yellow-300 to-amber-600 text-yellow-950 ring-1 ring-yellow-200/50 shadow-md"
                  : o.rank === 2 ? "bg-gradient-to-br from-slate-200 to-slate-500 text-slate-950 ring-1 ring-slate-200/40 shadow-md"
                  : o.rank === 3 ? "bg-gradient-to-br from-amber-500 to-orange-700 text-amber-50 ring-1 ring-orange-300/40 shadow-md"
                  : "border border-slate-300 text-slate-500 dark:border-white/10 dark:text-white/55"
                }`}>
                  {o.rank}
                </span>
                {/* logo */}
                <span className="flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-md bg-white p-1 shadow-sm ring-1 ring-slate-200 dark:ring-white/10">
                  <img src={o.logo} alt={`${o.name} logo`} className="h-full w-full object-contain" />
                </span>
                {/* name */}
                <span className={`min-w-0 truncate text-sm font-semibold ${o.best ? "text-brand-gold" : "text-slate-800 dark:text-white/90"}`}>
                  {o.name}
                </span>
                {/* price + delta */}
                <div className="text-right leading-tight">
                  <div className={`text-sm font-bold tabular-nums ${o.best ? "text-brand-gold" : "text-slate-900 dark:text-white"}`}>{o.price}</div>
                  <div className={`text-[10px] font-semibold tabular-nums ${o.deltaColor}`}>{o.delta} vs marché</div>
                </div>
                {/* CTA */}
                <a
                  href={o.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`shrink-0 rounded-lg px-3 py-1 text-xs font-black transition ${
                    o.best
                      ? "bg-brand-gold text-black hover:bg-brand-gold/90"
                      : "border border-slate-300 text-slate-700 hover:border-brand-gold/40 hover:bg-brand-gold/10 hover:text-brand-gold dark:border-white/15 dark:text-white/80"
                  }`}
                >
                  Voir
                </a>
              </li>
            ))}
          </ul>

          {/* Savings footer */}
          <div className="relative mt-3 flex items-center justify-between gap-2 rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-3 py-2">
            <div className="flex items-center gap-1.5 text-[11px] text-slate-600 dark:text-white/75">
              <Sparkles className="h-3 w-3 text-emerald-500 dark:text-emerald-300" />
              Économie max en choisissant Parashop
            </div>
            <div className="text-sm font-extrabold tabular-nums text-emerald-600 dark:text-emerald-300">
              −5.300 DT
            </div>
          </div>

          {/* Bottom button */}
          <div className="mt-3 flex justify-center">
            <Link
              href="/barometres"
              className="rounded-full border border-brand-gold/60 px-8 py-2 text-sm font-semibold text-brand-gold hover:bg-brand-gold/10 transition"
            >
              Voir toutes les offres
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

