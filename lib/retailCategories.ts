import hierarchyJson from "@/lib/data/retailCategoryHierarchy.fr.json";
import slugMapJson from "@/lib/data/retailSubSlugMap.json";
import type { LucideIcon } from "lucide-react";
import {
  Baby,
  BatteryCharging,
  BookOpen,
  Car,
  Dumbbell,
  Gamepad2,
  Gift,
  Heart,
  Home,
  Laptop,
  MoreHorizontal,
  PawPrint,
  Printer,
  Shirt,
  ShoppingBasket,
  Smartphone,
  Tv,
  Zap,
} from "lucide-react";

export type RetailSubCategory = { id: string; nom: string };
export type RetailTopCategory = {
  id: string;
  nom: string;
  sous_categories: RetailSubCategory[];
};

/** Top groups shown under Magasins (tech / électro scope). */
export const MAGASINS_HIERARCHY = hierarchyJson as RetailTopCategory[];

/** Maps JSON sous_category id → retail_db top_category slug(s). */
export const RETAIL_SUB_SLUG_MAP: Record<string, string> = slugMapJson;

export const RETAIL_CATEGORY_SLUGS: readonly string[] = [
  ...new Set(Object.values(RETAIL_SUB_SLUG_MAP)),
];

const TOP_ICONS: Record<string, LucideIcon> = {
  computing_it: Laptop,
  phones_tablets_wearables: Smartphone,
  gaming_consoles: Gamepad2,
  home_appliances: Home,
  tv_audio_photo: Tv,
  office_printing_school: Printer,
  home_garden_diy: Home,
  auto_moto_mobility: Car,
  sports_leisure: Dumbbell,
  health_beauty_pharmacy: Heart,
  fashion_accessories: Shirt,
  baby_kids: Baby,
  books_culture: BookOpen,
  grocery_consumables: ShoppingBasket,
  energy_power: BatteryCharging,
  pets: PawPrint,
  gifts_collections: Gift,
  other: MoreHorizontal,
};

const TOP_SHORT_LABELS: Record<string, string> = {
  computing_it: "Informatique",
  phones_tablets_wearables: "Téléphonie",
  gaming_consoles: "Gaming",
  home_appliances: "Électroménager",
  tv_audio_photo: "TV & Son",
  office_printing_school: "Bureau",
  home_garden_diy: "Maison & Jardin",
  auto_moto_mobility: "Auto & Moto",
  sports_leisure: "Sports",
  health_beauty_pharmacy: "Beauté & Santé",
  fashion_accessories: "Mode",
  baby_kids: "Bébé",
  books_culture: "Livres",
  grocery_consumables: "Épicerie",
  energy_power: "Énergie",
  pets: "Animalerie",
  gifts_collections: "Cadeaux",
  other: "Autre",
};

export type NavRetailTop = RetailTopCategory & {
  icon: LucideIcon;
  shortLabel: string;
  subs: { id: string; nom: string; slug: string | null }[];
};

export function slugForSub(subId: string): string | null {
  return RETAIL_SUB_SLUG_MAP[subId] ?? null;
}

export function slugsForTop(topId: string): string {
  const top = MAGASINS_HIERARCHY.find((t) => t.id === topId);
  if (!top) return "";
  const slugs = top.sous_categories
    .map((s) => slugForSub(s.id))
    .filter((s): s is string => Boolean(s));
  return slugs.join(",");
}

export function retailCatHref(slugs: string): string {
  if (!slugs) return "/retail";
  return `/retail?cat=${encodeURIComponent(slugs)}`;
}

export function getMagasinsNavCategories(): NavRetailTop[] {
  return MAGASINS_HIERARCHY.map((top) => ({
    ...top,
    icon: TOP_ICONS[top.id] ?? Zap,
    shortLabel: TOP_SHORT_LABELS[top.id] ?? top.nom,
    subs: top.sous_categories.map((sub) => ({
      id: sub.id,
      nom: sub.nom,
      slug: slugForSub(sub.id),
    })),
  }));
}

/** Category cards on /retail — one per top group with image. */
export const RETAIL_PAGE_CARDS = [
  {
    topId: "computing_it",
    fr: "Informatique",
    ar: "المعلوماتية",
    img: "/categories/informatique.jpg",
  },
  {
    topId: "phones_tablets_wearables",
    fr: "Téléphonie",
    ar: "الهاتف والأجهزة اللوحية",
    img: "/categories/telephonie.jpg",
  },
  {
    topId: "gaming_consoles",
    fr: "Gaming",
    ar: "الألعاب",
    img: "/categories/gaming.jpg",
  },
  {
    topId: "home_appliances",
    fr: "Électroménager",
    ar: "الأجهزة المنزلية",
    img: "/categories/electromenager.jpg",
  },
  {
    topId: "tv_audio_photo",
    fr: "TV & Son",
    ar: "تلفزيون وصوت",
    img: "/categories/tv-son.jpg",
  },
  {
    topId: "office_printing_school",
    fr: "Imprimante et Bureau",
    ar: "طابعة ومكتب",
    img: "/categories/imprimante-bureau.jpg",
  },
  {
    topId: "home_garden_diy",
    fr: "Jardinage",
    ar: "البستنة",
    img: "/categories/jardinage.jpg",
  },
  {
    topId: "energy_power",
    fr: "Onduleur",
    ar: "أوندولور",
    img: "/categories/onduleur.jpg",
  },
] as const;

export function retailPageCardSlug(topId: string): string {
  return slugsForTop(topId);
}

/** Visual theme per top group (homepage category cards). */
const HOME_CARD_THEMES: Record<string, { badge: string; text: string }> = {
  computing_it: {
    badge: "bg-cyan-500/20 text-cyan-200 border-cyan-400/30",
    text: "text-cyan-300",
  },
  phones_tablets_wearables: {
    badge: "bg-blue-500/20 text-blue-200 border-blue-400/30",
    text: "text-blue-300",
  },
  gaming_consoles: {
    badge: "bg-indigo-500/20 text-indigo-200 border-indigo-400/30",
    text: "text-indigo-300",
  },
  home_appliances: {
    badge: "bg-purple-500/20 text-purple-200 border-purple-400/30",
    text: "text-purple-300",
  },
  tv_audio_photo: {
    badge: "bg-violet-500/20 text-violet-200 border-violet-400/30",
    text: "text-violet-300",
  },
  office_printing_school: {
    badge: "bg-slate-500/20 text-slate-200 border-slate-400/30",
    text: "text-slate-300",
  },
  home_garden_diy: {
    badge: "bg-amber-500/20 text-amber-200 border-amber-400/30",
    text: "text-amber-300",
  },
  energy_power: {
    badge: "bg-yellow-500/20 text-yellow-200 border-yellow-400/30",
    text: "text-yellow-300",
  },
  auto_moto_mobility: {
    badge: "bg-orange-500/20 text-orange-200 border-orange-500/30",
    text: "text-orange-300",
  },
  sports_leisure: {
    badge: "bg-green-500/20 text-green-200 border-green-500/30",
    text: "text-green-300",
  },
  health_beauty_pharmacy: {
    badge: "bg-rose-500/20 text-rose-200 border-rose-500/30",
    text: "text-rose-300",
  },
  fashion_accessories: {
    badge: "bg-fuchsia-500/20 text-fuchsia-200 border-fuchsia-500/30",
    text: "text-fuchsia-300",
  },
  baby_kids: {
    badge: "bg-sky-500/20 text-sky-200 border-sky-500/30",
    text: "text-sky-300",
  },
  books_culture: {
    badge: "bg-stone-500/20 text-stone-200 border-stone-400/30",
    text: "text-stone-300",
  },
  grocery_consumables: {
    badge: "bg-lime-500/20 text-lime-200 border-lime-400/30",
    text: "text-lime-300",
  },
  pets: {
    badge: "bg-teal-500/20 text-teal-200 border-teal-400/30",
    text: "text-teal-300",
  },
  gifts_collections: {
    badge: "bg-red-500/20 text-red-200 border-red-400/30",
    text: "text-red-300",
  },
};

export type HomeCompareCategory = {
  id: string;
  fr: string;
  ar: string;
  href: string;
  image: string;
  badge: string;
  text: string;
};

/** Homepage « Comparez par catégorie » — retail nav + catalogues principaux. */
export function getHomeCompareCategories(): HomeCompareCategory[] {
  const retail: HomeCompareCategory[] = RETAIL_PAGE_CARDS.map((card) => {
    const theme = HOME_CARD_THEMES[card.topId] ?? {
      badge: "bg-brand-gold/20 text-brand-gold border-brand-gold/30",
      text: "text-brand-gold",
    };
    return {
      id: card.topId,
      fr: card.fr,
      ar: card.ar,
      href: retailCatHref(retailPageCardSlug(card.topId)),
      image: card.img,
      ...theme,
    };
  });

  const catalogs: HomeCompareCategory[] = [
    {
      id: "supermarche",
      fr: "Supermarchés",
      ar: "سوبرماركت",
      href: "/supermarche",
      image: "/categories/supermarche.jpg",
      badge: "bg-emerald-500/20 text-emerald-200 border-emerald-400/30",
      text: "text-emerald-300",
    },
    {
      id: "parapharmacie",
      fr: "Parapharmacie",
      ar: "بارافارمسي",
      href: "/parapharmacie",
      image: "/categories/parapharmacie.jpg",
      badge: "bg-pink-500/20 text-pink-200 border-pink-400/30",
      text: "text-pink-300",
    },
  ];

  return [...retail, ...catalogs];
}
