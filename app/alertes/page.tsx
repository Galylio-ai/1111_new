import { Bell, ArrowDownRight, MapPin } from "lucide-react";
import { PageShell } from "@/components/site/PageShell";
import { Reveal } from "@/components/site/Reveal";

export const metadata = { title: "Alertes prix — 1111.tn" };

const alerts = [
  { emoji: "🥛", name: "Lait Délice 1L", sub: "Demi-écrémé · UHT", price: "2.080", old: "2.250", drop: "−7.5%", save: "0.17 DT", store: "Aziza", dist: "2 km · Stock OK", time: "il y a 6 min" },
  { emoji: "📱", name: "iPhone 15 128Go", sub: "Apple · Noir", price: "3.499", old: "4.629", drop: "−24.4%", save: "1130 DT", store: "Mytek", dist: "Livraison 48h", time: "il y a 12 min" },
  { emoji: "🫒", name: "Huile El Mazraa 1L", sub: "Olive extra vierge", price: "6.890", old: "7.050", drop: "−2.3%", save: "0.16 DT", store: "Carrefour", dist: "5 km · Stock OK", time: "il y a 22 min" },
  { emoji: "🎮", name: "PS5 Console", sub: "Édition disque · 1To", price: "1.899", old: "2.299", drop: "−17.4%", save: "400 DT", store: "Spacenet", dist: "Livraison 72h", time: "il y a 31 min" },
  { emoji: "🧴", name: "Lessive OMO 3Kg", sub: "Détergent", price: "16.900", old: "17.460", drop: "−3.2%", save: "0.56 DT", store: "Monoprix", dist: "3 km · Stock OK", time: "il y a 48 min" },
  { emoji: "💻", name: "MacBook Air M1", sub: "8Go · 256Go SSD", price: "2.499", old: "3.899", drop: "−35.9%", save: "1400 DT", store: "Mytek", dist: "Livraison 48h", time: "il y a 1 h" },
];

export default function AlertesPage() {
  return (
    <PageShell
      icon="bell"
      title="Alertes prix"
      arabic="تنبيه فوري للأسعار"
      live
      description="Les baisses de prix détectées en direct sur vos produits et le marché — agissez avant que le stock parte."
      chips={[
        { label: "Alertes aujourd'hui", value: "37", tone: "red" },
        { label: "Économie cumulée", value: "3 947 DT", tone: "emerald" },
      ]}
    >
      <section className="mx-auto mt-6 max-w-[1600px] px-3 sm:px-4">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {alerts.map((a, i) => (
            <Reveal key={a.name} delay={i * 0.05}>
              <div className="card card-pad relative flex h-full flex-col overflow-hidden border-brand-red/30">
                <div className="pointer-events-none absolute -right-6 -top-6 h-24 w-24 rounded-full bg-brand-red/15 blur-2xl" />
                <div className="relative flex items-center justify-between">
                  <span className="inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-brand-red">
                    <Bell className="h-3.5 w-3.5" /> Alerte prix
                  </span>
                  <span className="rounded-full border border-emerald-400/30 bg-emerald-500/10 px-2 py-0.5 text-[10px] font-semibold text-emerald-300">● Live</span>
                </div>

                <div className="relative mt-3 flex items-center gap-3 rounded-xl border border-white/5 bg-bg-800/50 p-2.5">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-white/10 to-white/[0.03] text-2xl ring-1 ring-white/5">{a.emoji}</div>
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-sm font-semibold text-white">{a.name}</div>
                    <div className="truncate text-[11px] text-white/50">{a.sub}</div>
                  </div>
                </div>

                <div className="relative mt-3">
                  <div className="text-[10px] font-semibold uppercase tracking-wider text-white/40">Prix actuel</div>
                  <div className="mt-0.5 flex items-baseline gap-2">
                    <span className="text-3xl font-black tabular-nums text-white">{a.price}</span>
                    <span className="text-sm font-bold text-brand-gold">DT</span>
                    <span className="ml-auto inline-flex items-center gap-0.5 rounded-md bg-emerald-500/15 px-1.5 py-0.5 text-[11px] font-bold text-emerald-300">
                      <ArrowDownRight className="h-3 w-3" /> {a.drop}
                    </span>
                  </div>
                  <div className="text-[11px] text-white/50">
                    Ancien : <span className="line-through">{a.old} DT</span>
                    <span className="mx-1.5 text-white/20">·</span>
                    <span className="text-emerald-300">Économie {a.save}</span>
                  </div>
                </div>

                <div className="relative mt-3 flex items-center justify-between rounded-xl border border-white/5 bg-bg-800/70 p-2 text-sm">
                  <span className="flex items-center gap-2">
                    <span className="flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-br from-red-500 to-red-700 text-xs font-black text-white ring-1 ring-white/10">{a.store.charAt(0)}</span>
                    <span className="leading-tight">
                      <span className="block text-sm font-semibold text-white">{a.store}</span>
                      <span className="flex items-center gap-1 text-[10px] text-white/50"><MapPin className="h-2.5 w-2.5" /> {a.dist}</span>
                    </span>
                  </span>
                  <span className="text-[10px] text-white/40">{a.time}</span>
                </div>

                <div className="relative mt-auto pt-3">
                  <button className="btn-primary w-full">Voir l'offre</button>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </section>
    </PageShell>
  );
}
