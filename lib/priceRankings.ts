/** Featured category rankings shown on the homepage + detail pages. */
export type PriceRankingCatalogEntry = {
  slug: string;
  scopeId: string;
  title: string;
  subtitle: string;
  image: string;
  retailCat: string;
};

export const PRICE_RANKING_CATALOG: PriceRankingCatalogEntry[] = [
  {
    slug: "electromenager",
    scopeId: "home_appliances/*",
    title: "Électroménager",
    subtitle: "Gros et petit électroménager",
    image: "/electromenager.png",
    retailCat: "petit-electromenager,gros-electromenager,climatisation-et-chauffage,froid-et-refrigeration,lavage,cuisson,aspirateurs-et-nettoyage",
  },
  {
    slug: "televisions",
    scopeId: "tv_audio_photo/televisions",
    title: "Télévisions",
    subtitle: "TV et écrans",
    image: "/televisions.jpg",
    retailCat: "televisions",
  },
  {
    slug: "smartphones",
    scopeId: "phones_tablets_wearables/smartphones",
    title: "Smartphones",
    subtitle: "Téléphones mobiles",
    image: "/Smartphone.png",
    retailCat: "smartphones",
  },
  {
    slug: "climatisation",
    scopeId: "home_appliances/ac_climate",
    title: "Climatisation",
    subtitle: "Climatiseurs et chauffage",
    image: "/ElectroBg.png",
    retailCat: "climatisation-et-chauffage",
  },
  {
    slug: "pc-portables",
    scopeId: "computing_it/laptops",
    title: "PC portables",
    subtitle: "Ordinateurs portables",
    image: "/informatique.png",
    retailCat: "pc-portables,pc-portables-gamer",
  },
  {
    slug: "informatique",
    scopeId: "computing_it/*",
    title: "Informatique",
    subtitle: "PC, composants et périphériques",
    image: "/InformatiqueBg.png",
    retailCat: "pc-portables,pc-de-bureau,composants,ecrans-et-moniteurs,accessoires-informatiques",
  },
];

export const FEATURED_SCOPE_IDS = new Set(
  PRICE_RANKING_CATALOG.map((c) => c.scopeId)
);

export function catalogBySlug(slug: string) {
  return PRICE_RANKING_CATALOG.find((c) => c.slug === slug);
}

export function catalogByScopeId(scopeId: string) {
  return PRICE_RANKING_CATALOG.find((c) => c.scopeId === scopeId);
}

export function shopDisplayName(key: string) {
  const special: Record<string, string> = {
    electrohadjkacem: "Electro Hadj Kacem",
    tunisianet: "Tunisianet",
    mytek: "Mytek",
    spacenet: "Spacenet",
    technopro: "Technopro",
    maalejaudio: "Maalej Audio",
    kamounhome: "Kamoun Home",
    affariyet: "Affariyet",
    tunewtec: "Tunewtec",
    gamershop: "Gamershop",
    bestbuytunisie: "Best Buy Tunisie",
    itechstore: "iTech Store",
    krichen: "Krichen",
  };
  if (special[key]) return special[key];
  return key
    .replace(/[_-]+/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

export function formatWinRate(rate: number) {
  return `${Math.round(rate * 1000) / 10}%`;
}

export function confidenceLabel(c: string) {
  return c === "enough_data" ? "Données solides" : "Échantillon limité";
}
