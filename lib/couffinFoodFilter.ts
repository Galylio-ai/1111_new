// Filter to keep only food (alimentation) products in the Couffin comparator.
// Supermarkets index many non-food items (hygiene, cleaning, bazar, pet food,
// cosmetics). We exclude them by matching well-known French keywords in the
// product name or category label.

// Keywords that indicate a NON-food product. Matched case-insensitively against
// the product name. Broad but conservative — designed to prefer excluding a
// non-food than accidentally excluding food.
const NON_FOOD_PATTERNS: RegExp[] = [
  // Hygiène corporelle
  /\b(shampoo?ing|shampooing|apr[eè]s[- ]shampooing|conditioner|gel douche|savon|d[eé]odorant|deodorant|antitranspirant)\b/i,
  /\b(dentifrice|brosse[- ]?[aà]?[- ]?dents?|bain de bouche|fil dentaire)\b/i,
  /\b(rasoir|rasage|lame|mousse [aà] raser|apr[eè]s[- ]rasage|aftershave)\b/i,
  /\b(serviettes? hygi[eé]niques?|tampons?|protection[s]? f[eé]minine|coupe menstruelle)\b/i,
  /\b(couches?|couche[- ]culotte|lingettes?|coton[- ]tiges?)\b/i,
  /\b(papier toilette|papier hygi[eé]nique|essuie[- ]tout|mouchoirs?)\b/i,
  /\b(cr[eè]me hydratante|lait corporel|gel intime|talc|eau de cologne|parfum)\b/i,

  // Cosm[eé]tique / soins
  /\b(maquillage|rouge [aà] l[eè]vres|mascara|fond de teint|vernis|nail|manucure)\b/i,
  /\b(cr[eè]me visage|s[eé]rum|masque visage|contour des yeux|anti[- ]rides?)\b/i,

  // Nettoyage / entretien
  /\b(lessive|d[eé]tergent|adoucissant|assouplissant|d[eé]tach|javel|eau de javel)\b/i,
  /\b(liquide vaisselle|tablettes? lave[- ]vaisselle|d[eé]sinfect|d[eé]tartr|anti[- ]calcaire)\b/i,
  /\b(nettoyant|d[eé]poussi[eé]rant|cirage|cire|shampoing tapis|d[eé]bouch)\b/i,
  /\b(insecticide|anti[- ]moustique|anti[- ]nuisible|raticide|antimites)\b/i,
  /\b(sacs? poubelle|sacs? cong[eé]lation|film alimentaire|papier aluminium|aluminium m[eé]nager)\b/i,

  // Bazar / m[eé]nager
  /\b(vaisselle|assiettes?|verres?|couverts?|cuill[eè]res?|fourchettes?|couteaux? de cuisine|casseroles?|po[eê]les?|marmites?)\b/i,
  /\b(ampoules?|piles?|batterie|chargeur|adaptateur|c[aâ]ble|multiprise)\b/i,
  /\b(cintres?|balais?|serpill[iè]re|[eé]ponge|torchon|gants? m[eé]nagers?)\b/i,

  // Animalerie
  /\b(nourriture (chat|chien|animaux)|croquettes?|liti[eè]re|niche|laisse|collier chien|pipette anti[- ]puces?)\b/i,

  // Textile / v[eê]tement / accessoires
  /\b(chaussettes?|chaussures?|t[- ]shirts?|pantalons?|robes?|jupe|maillot)\b/i,
  /\b(cahiers?|stylos?|crayons?|classeurs?|feutres?|effaceur|gomme scolaire)\b/i,
];

// Additional exclusion by top-level category label (matched case-insensitively).
const NON_FOOD_CATEGORY_TERMS = [
  "hygiene",
  "hygiène",
  "entretien",
  "nettoyage",
  "beaute",
  "beauté",
  "cosmetique",
  "cosmétique",
  "parapharmacie",
  "bazar",
  "menage",
  "ménage",
  "animalerie",
  "textile",
  "papeterie",
  "electromenager",
  "électroménager",
  "electronique",
  "électronique",
  "bricolage",
  "jardin",
  "auto",
];

export function isFoodName(name: string): boolean {
  if (!name) return true;
  for (const re of NON_FOOD_PATTERNS) if (re.test(name)) return false;
  return true;
}

export function isFoodCategory(category: string | null | undefined): boolean {
  if (!category) return true;
  const c = category.toLowerCase();
  for (const term of NON_FOOD_CATEGORY_TERMS) if (c.includes(term)) return false;
  return true;
}

export function isFoodProduct(name: string, category?: string | null): boolean {
  return isFoodName(name) && isFoodCategory(category);
}

// SQL fragment: excludes non-food products by matching the name against the
// non-food keyword patterns. Uses ILIKE for simplicity.
export function nonFoodSqlExclusion(pAlias = "p"): string {
  const terms = [
    "shampooing", "shampoing", "gel douche", "dentifrice", "rasoir",
    "d[eé]odorant", "deodorant",
    "serviette hygi[eé]nique", "couches", "lingettes", "papier toilette",
    "papier hygi[eé]nique", "essuie-tout", "essuie tout", "mouchoir",
    "lessive", "d[eé]tergent", "adoucissant", "assouplissant", "javel",
    "liquide vaisselle", "d[eé]sinfectant",
    "nettoyant", "insecticide", "anti-moustique", "anti moustique",
    "sac poubelle", "sac cong[eé]lation", "film alimentaire",
    "papier aluminium", "aluminium m[eé]nager",
    "ampoule", "pile ", "batterie ", "chargeur", "c[aâ]ble ",
    "balai", "serpilli[eè]re", "[eé]ponge", "torchon",
    "croquette", "liti[eè]re",
    "maquillage", "rouge [aà] l[eè]vres", "mascara", "fond de teint",
    "vernis", "parfum",
    "cahier", "stylo", "crayon", "classeur",
  ];
  const clauses = terms.map((t) => `${pAlias}.name !~* '${t}'`);
  return clauses.join(" AND ");
}
