"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import {
  ChevronRight, FlaskConical, Monitor, Search, X,
} from "lucide-react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Reveal } from "@/components/site/Reveal";

type RawCat = { id: string; name: string; sub_count: number };

/* ── Logical groupings for Para ─────────────────────────────────────────── */
const PARA_GROUPS: { label: string; ar: string; color: string; keys: string[] }[] = [
  {
    label: "Visage & Soins", ar: "الوجه والعناية",
    color: "from-rose-500/20 to-pink-500/10 border-rose-400/30",
    keys: ["visage","soins visage","anti-âge","anti-tâches","antirougeurs","cicatrisation","démaquillants","scrub exfoliants","masques","contours des yeux","accessoires visage","acné"],
  },
  {
    label: "Maquillage", ar: "مستحضرات التجميل",
    color: "from-fuchsia-500/20 to-purple-500/10 border-fuchsia-400/30",
    keys: ["maquillage","teint","yeux","lèvres","fonds de teint","rouges à lèvres","gloss à lèvres","crayons à lèvres","fards à joues","poudres maquillage","highlighter","primer","contouring","correcteur et anti-cernes","fixateurs de maquillage","poudres bronzantes","accessoires maquillage","sèche-ongles"],
  },
  {
    label: "Cheveux & Capillaire", ar: "الشعر والعناية به",
    color: "from-amber-500/20 to-yellow-500/10 border-amber-400/30",
    keys: ["cheveux","capillaire","cheveux secs","cheveux gras","cheveux normaux","soins kératine","soins antichute","soins antipelliculaires","coiffants","coloration","compléments alimentaires cheveux","solaires cheveux","traitements anti-poux"],
  },
  {
    label: "Corps & Bain", ar: "الجسم والحمام",
    color: "from-blue-500/20 to-cyan-500/10 border-blue-400/30",
    keys: ["corps & bain","corps","bain douche","soins anti-vergetures","circulation & jambes lourdes","soins intimes","déodorants","désodorisant","épilation","lingettes"],
  },
  {
    label: "Solaire", ar: "الحماية الشمسية",
    color: "from-orange-500/20 to-yellow-500/10 border-orange-400/30",
    keys: ["solaire","solaires adultes","solaires enfants","solaires enfant","solaires corps","solaires","crèmes solaires","spray solaire","huile solaire et bronzante","ecrans solaires invisible","soins après-solaires","après-soleil","autobronzants"],
  },
  {
    label: "Bébé & Maman", ar: "الأم والطفل",
    color: "from-sky-500/20 to-teal-500/10 border-sky-400/30",
    keys: ["bébé & maman","bébé & maternité","bébé et maman","maman et bébé","maman & bébé","hygiène et toilette bébé","accessoires bébé","alimentation bébé","soins bébé","coffrets bébé","change","allaitement","test de grossesse"],
  },
  {
    label: "Hygiène", ar: "النظافة الشخصية",
    color: "from-emerald-500/20 to-green-500/10 border-emerald-400/30",
    keys: ["hygiène","soins buccaux","dentifrices","bains de bouche","brosses à dents","brosses à dents et appareils électriques","fils dentaires & brossettes","soins blanchissants","rasage après rasage","désinfectant","antiseptiques & antibactériens","désinfection & protection","nez & oreilles","nez, gorge & oreilles"],
  },
  {
    label: "Santé & Bien-être", ar: "الصحة والعافية",
    color: "from-teal-500/20 to-cyan-500/10 border-teal-400/30",
    keys: ["santé & bien-être","santé","matériel médical","compléments alimentaires","forme energie, immunité & compléments alimentaires","compléments alimentaires minceur","stress sommeil & mémoire","constipation digestion & transit","rhumatisme","orthopédie","chaussures orthopediques","auto-mesure","thermomètres","entretien des lentilles","consommables","dentaire"],
  },
  {
    label: "Parfums", ar: "العطور",
    color: "from-violet-500/20 to-indigo-500/10 border-violet-400/30",
    keys: ["parfums"],
  },
  {
    label: "Homme", ar: "العناية بالرجل",
    color: "from-slate-500/20 to-zinc-500/10 border-slate-400/30",
    keys: ["hommes","homme","soins visage homme"],
  },
  {
    label: "Accessoires & Ongles", ar: "الإكسسوارات والأظافر",
    color: "from-pink-500/20 to-rose-500/10 border-pink-400/30",
    keys: ["accessoires","soins ongles","vernis à ongles","faux ongles","outils de manucure","accessoires et déco ongles","soins mains & lèvres","mains pieds podologie"],
  },
  {
    label: "Nature & Bio", ar: "الطبيعي والعضوي",
    color: "from-lime-500/20 to-green-500/10 border-lime-400/30",
    keys: ["nature & bio","bio & naturel","eaux thermales"],
  },
];

/* ── Retail groups ───────────────────────────────────────────────────────── */
const RETAIL_GROUPS: { label: string; ar: string; color: string; img: string; href: string; keys: string[] }[] = [
  {
    label: "Informatique", ar: "المعلوماتية",
    color: "from-blue-500/20 to-indigo-500/10 border-blue-400/30",
    img: "/informatique.png", href: "/retail",
    keys: ["informatique"],
  },
  {
    label: "Électroménager", ar: "الأجهزة المنزلية",
    color: "from-purple-500/20 to-violet-500/10 border-purple-400/30",
    img: "/electromenager.png", href: "/retail",
    keys: ["electromenager"],
  },
  {
    label: "Gaming", ar: "الألعاب الإلكترونية",
    color: "from-red-500/20 to-orange-500/10 border-red-400/30",
    img: "/gaming.png", href: "/retail",
    keys: ["gaming"],
  },
  {
    label: "Divers", ar: "متنوعات",
    color: "from-emerald-500/20 to-teal-500/10 border-emerald-400/30",
    img: "/divers.png", href: "/retail",
    keys: ["divers"],
  },
];

function normKey(s: string) {
  return s.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "");
}

export default function CategoriesPage() {
  const [paraAll, setParaAll]     = useState<RawCat[]>([]);
  const [retailAll, setRetailAll] = useState<RawCat[]>([]);
  const [loading, setLoading]     = useState(true);
  const [search, setSearch]       = useState("");

  useEffect(() => {
    fetch("/api/categories")
      .then(r => r.json())
      .then(d => { setParaAll(d.para ?? []); setRetailAll(d.retail ?? []); })
      .finally(() => setLoading(false));
  }, []);

  const q = normKey(search.trim());

  /* assign each para category to its group */
  const paraGrouped = PARA_GROUPS.map(g => ({
    ...g,
    items: paraAll.filter(c => {
      const n = normKey(c.name);
      return g.keys.some(k => normKey(k) === n || n.includes(normKey(k)));
    }).filter(c => !q || normKey(c.name).includes(q)),
  })).filter(g => g.items.length > 0);

  /* ungrouped para items */
  const grouped = new Set(paraGrouped.flatMap(g => g.items.map(i => i.id)));
  const paraUngrouped = paraAll.filter(c =>
    !grouped.has(c.id) && (!q || normKey(c.name).includes(q))
  );

  const retailFiltered = retailAll.filter(c => !q || normKey(c.name).includes(q));

  const totalPara   = paraAll.length;
  const totalRetail = retailAll.length;

  return (
    <main className="min-h-screen bg-white dark:bg-[#0a0e1a]">
      <Header />

      {/* ── Breadcrumb ──────────────────────────────────────────────────── */}
      <div className="mx-auto max-w-[1600px] px-4 pt-5">
        <nav className="mb-4 flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-400 dark:text-white/40">
          <Link href="/" className="transition hover:text-brand-gold">Accueil</Link>
          <ChevronRight className="h-3 w-3 opacity-60" />
          <span className="text-brand-gold">Catégories</span>
        </nav>

        {/* ── Hero ────────────────────────────────────────────────────────── */}
        <Reveal>
          <div className="relative overflow-hidden rounded-2xl border border-slate-200 bg-gradient-to-br from-slate-50 via-white to-brand-gold/5 p-6 sm:p-8 dark:border-white/5 dark:from-[#0f1422] dark:via-[#0f1422] dark:to-[#0f1422]">
            <div className="pointer-events-none absolute -left-12 -top-12 h-56 w-56 rounded-full bg-brand-gold/10 blur-3xl" />
            <div className="relative flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
              <div>
                <h1 className="text-3xl font-black tracking-tight text-slate-900 sm:text-4xl dark:text-white">
                  Toutes les <span className="gradient-text-gold">catégories</span>
                </h1>
                <p className="mt-1 font-arabic text-base text-slate-500 dark:text-white/50" dir="rtl">
                  تصفح حسب الفئة — جميع الأقسام
                </p>
                <p className="mt-2 max-w-xl text-sm text-slate-600 dark:text-white/60">
                  {loading ? "Chargement…" : `${totalPara} catégories parapharmacie · ${totalRetail} catégories magasins`}
                </p>
              </div>
              <div className="flex gap-2 flex-wrap shrink-0">
                {[
                  { label: "Para", value: String(totalPara), cls: "border-rose-400/25 bg-rose-400/10 text-rose-500 dark:text-rose-300" },
                  { label: "Retail", value: String(totalRetail), cls: "border-blue-400/25 bg-blue-400/10 text-blue-500 dark:text-blue-300" },
                ].map(c => (
                  <div key={c.label} className={`rounded-xl border px-4 py-2.5 ${c.cls}`}>
                    <div className="text-xl font-black tabular-nums leading-none">{c.value}</div>
                    <div className="mt-0.5 text-[10px] uppercase tracking-wider opacity-80">{c.label}</div>
                  </div>
                ))}
              </div>
            </div>
            <div className="mt-6 h-px w-full bg-gradient-to-r from-transparent via-brand-gold/35 to-transparent" />
          </div>
        </Reveal>
      </div>

      {/* ── Search ──────────────────────────────────────────────────────────── */}
      <div className="mx-auto mt-6 max-w-[1600px] px-4">
        <div className="relative max-w-lg">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400 dark:text-white/30" />
          <input
            type="search"
            placeholder="Filtrer les catégories…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full rounded-xl border border-slate-300 bg-white py-2.5 pl-9 pr-9 text-sm text-slate-900 placeholder:text-slate-400 outline-none transition focus:border-brand-gold/50 focus:ring-2 focus:ring-brand-gold/20 dark:border-white/10 dark:bg-white/[0.04] dark:text-white dark:placeholder:text-white/30"
          />
          {search && (
            <button onClick={() => setSearch("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:text-white/30 dark:hover:text-white/60">
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-32">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-brand-gold border-t-transparent" />
        </div>
      ) : (
        <>
          {/* ══ RETAIL SECTION ════════════════════════════════════════════════ */}
          <section className="mx-auto mt-10 max-w-[1600px] px-4">
            <Reveal>
              <div className="mb-5 flex items-center gap-3">
                <Monitor className="h-5 w-5 text-blue-400" />
                <h2 className="text-xl font-black text-slate-900 dark:text-white">
                  Magasins <span className="gradient-text-gold">Tech & Électroménager</span>
                </h2>
                <span className="rounded-full border border-blue-400/25 bg-blue-400/10 px-2.5 py-0.5 text-[10px] font-bold text-blue-500 dark:text-blue-300">
                  {totalRetail} catégories
                </span>
              </div>
            </Reveal>
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
              {(retailFiltered.length > 0 ? RETAIL_GROUPS.filter(g =>
                g.keys.some(k => retailFiltered.some(c => normKey(c.name) === normKey(k)))
              ) : RETAIL_GROUPS).map((g, i) => {
                const cat = retailAll.find(c => g.keys.some(k => normKey(k) === normKey(c.name)));
                return (
                  <Reveal key={g.label} delay={i * 0.06}>
                    <Link
                      href={`${g.href}?cat=${g.keys[0]}`}
                      className={`group relative flex flex-col overflow-hidden rounded-2xl border bg-gradient-to-br ${g.color} transition hover:-translate-y-0.5 hover:shadow-lg`}
                    >
                      <div className="relative h-36 overflow-hidden bg-slate-100 dark:bg-white/[0.04]">
                        <img src={g.img} alt={g.label} className="h-full w-full object-cover transition duration-500 group-hover:scale-105" loading="lazy" />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                        <div className="absolute bottom-3 left-3 right-3">
                          <div className="text-sm font-black text-white drop-shadow">{g.label}</div>
                          <div className="font-arabic text-[11px] text-white/60 mt-0.5" dir="rtl">{g.ar}</div>
                          {cat && <div className="mt-1 text-[10px] text-white/50">{cat.sub_count} sous-catégories</div>}
                        </div>
                      </div>
                    </Link>
                  </Reveal>
                );
              })}
            </div>
          </section>

          {/* ══ PARAPHARMACIE SECTION ════════════════════════════════════════ */}
          <section className="mx-auto mt-12 max-w-[1600px] px-4 pb-12">
            <Reveal>
              <div className="mb-5 flex items-center gap-3">
                <FlaskConical className="h-5 w-5 text-rose-400" />
                <h2 className="text-xl font-black text-slate-900 dark:text-white">
                  Parapharmacie <span className="gradient-text-gold">& Santé</span>
                </h2>
                <span className="rounded-full border border-rose-400/25 bg-rose-400/10 px-2.5 py-0.5 text-[10px] font-bold text-rose-500 dark:text-rose-300">
                  {totalPara} catégories
                </span>
              </div>
            </Reveal>

            <div className="space-y-8">
              {paraGrouped.map((group, gi) => (
                <Reveal key={group.label} delay={gi * 0.04}>
                  <div className={`rounded-2xl border bg-gradient-to-br ${group.color} p-4`}>
                    <div className="mb-3 flex items-center gap-2">
                      <h3 className="text-sm font-black text-slate-900 dark:text-white">{group.label}</h3>
                      <span className="font-arabic text-[11px] text-slate-500 dark:text-white/40" dir="rtl">{group.ar}</span>
                      <span className="ml-auto text-[10px] font-bold text-slate-400 dark:text-white/30 tabular-nums">{group.items.length}</span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {group.items.map(c => (
                        <Link
                          key={c.id}
                          href={`/parapharmacie?cat=${encodeURIComponent(c.name)}`}
                          className="flex items-center gap-1.5 rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-semibold text-slate-700 transition hover:border-brand-gold/50 hover:bg-brand-gold/5 hover:text-brand-gold dark:border-white/10 dark:bg-white/[0.05] dark:text-white/75 dark:hover:border-brand-gold/40 dark:hover:text-brand-gold"
                        >
                          {c.name}
                          <span className="rounded-full bg-slate-100 px-1.5 py-0.5 text-[9px] font-bold text-slate-500 dark:bg-white/[0.08] dark:text-white/40">
                            {c.sub_count}
                          </span>
                        </Link>
                      ))}
                    </div>
                  </div>
                </Reveal>
              ))}

              {/* Ungrouped / Other */}
              {paraUngrouped.length > 0 && (
                <Reveal delay={0.5}>
                  <div className="rounded-2xl border border-slate-200/60 bg-slate-50/50 p-4 dark:border-white/[0.06] dark:bg-white/[0.02]">
                    <div className="mb-3 flex items-center gap-2">
                      <h3 className="text-sm font-black text-slate-900 dark:text-white">Autres catégories</h3>
                      <span className="ml-auto text-[10px] font-bold text-slate-400 dark:text-white/30 tabular-nums">{paraUngrouped.length}</span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {paraUngrouped.map(c => (
                        <Link
                          key={c.id}
                          href={`/parapharmacie?cat=${encodeURIComponent(c.name)}`}
                          className="flex items-center gap-1.5 rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-semibold text-slate-700 transition hover:border-brand-gold/50 hover:bg-brand-gold/5 hover:text-brand-gold dark:border-white/10 dark:bg-white/[0.05] dark:text-white/75 dark:hover:border-brand-gold/40 dark:hover:text-brand-gold"
                        >
                          {c.name}
                          <span className="rounded-full bg-slate-100 px-1.5 py-0.5 text-[9px] font-bold text-slate-500 dark:bg-white/[0.08] dark:text-white/40">
                            {c.sub_count}
                          </span>
                        </Link>
                      ))}
                    </div>
                  </div>
                </Reveal>
              )}
            </div>
          </section>
        </>
      )}

      <Footer />
    </main>
  );
}
