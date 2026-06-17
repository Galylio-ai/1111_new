export type NavLink = { fr: string; ar: string; href: string; caret?: boolean };

export const navLinks: NavLink[] = [
  { fr: "Catégories", ar: "الفئات", href: "/categories", caret: true },
  { fr: "Supermarché", ar: "السوبرماركت", href: "/supermarche" },
  { fr: "Parapharmacie", ar: "شبه الصيدلية", href: "/parapharmacie" },
  { fr: "Magasins", ar: "المتاجر", href: "/retail" },
  { fr: "IA Prédictive", ar: "الذكاء الاصطناعي", href: "/ia-predictive" },
  { fr: "Promotions", ar: "العروض", href: "/promotions" },
];
