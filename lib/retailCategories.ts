import hierarchyJson from "@/lib/data/retailCategoryHierarchy.fr.json";
import slugMapJson from "@/lib/data/retailSubSlugMap.json";
import type { LucideIcon } from "lucide-react";
import {
  BatteryCharging,
  Gamepad2,
  Home,
  Laptop,
  Monitor,
  Printer,
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
  energy_power: BatteryCharging,
};

const TOP_SHORT_LABELS: Record<string, string> = {
  computing_it: "Informatique",
  phones_tablets_wearables: "Téléphonie",
  gaming_consoles: "Gaming",
  home_appliances: "Électroménager",
  tv_audio_photo: "TV & Son",
  office_printing_school: "Bureau",
  home_garden_diy: "Maison",
  energy_power: "Énergie",
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
    img: "/informatique.png",
  },
  {
    topId: "phones_tablets_wearables",
    fr: "Téléphonie",
    ar: "الهاتف والأجهزة اللوحية",
    img: "/Smartphone.png",
  },
  {
    topId: "gaming_consoles",
    fr: "Gaming",
    ar: "الألعاب",
    img: "/gaming.png",
  },
  {
    topId: "home_appliances",
    fr: "Électroménager",
    ar: "الأجهزة المنزلية",
    img: "/electromenager.png",
  },
  {
    topId: "tv_audio_photo",
    fr: "TV & Son",
    ar: "تلفزيون وصوت",
    img: "/Ecran.png",
  },
  {
    topId: "office_printing_school",
    fr: "Bureau",
    ar: "المكتب",
    img: "/info.png",
  },
  {
    topId: "home_garden_diy",
    fr: "Maison",
    ar: "المنزل",
    img: "/electro2.png",
  },
  {
    topId: "energy_power",
    fr: "Énergie",
    ar: "الطاقة",
    img: "/electromenager.png",
  },
] as const;

export function retailPageCardSlug(topId: string): string {
  return slugsForTop(topId);
}
