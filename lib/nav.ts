export type NavLink = { fr: string; ar: string; href: string; caret?: boolean };

export const navLinks: NavLink[] = [
  { fr: "Catégories", ar: "الفئات", href: "/categories", caret: true },
  { fr: "Comparateur", ar: "مقارنة الأسعار", href: "/comparateur" },
  { fr: "Qoffa Tounsi", ar: "قفة التونسي", href: "/qoffa" },
  { fr: "IA Prédictive", ar: "الذكاء الاصطناعي", href: "/ia-predictive" },
  { fr: "Magasins", ar: "المتاجر", href: "/magasins" },
  { fr: "Promotions", ar: "العروض", href: "/promotions" },
];
