// Filter to keep only "couffin" (grocery basket) products for the comparator.
// Based on the real top_categories taxonomy in alimentation_db (verified 2026-07).
//
// INCLUDE = food + drinks + household consumables (cleaning, hygiene, paper)
// EXCLUDE = beauty/cosmetics, apparel, electronics, home appliances,
//           furniture, bricolage/jardinage, papeterie, animalerie durables,
//           sports/loisirs, decoration.

// Case-insensitive substring match against the top_category name in DB.
// Match is: exclude wins over include. Everything not matched defaults to include
// (so newly-added food subcategories don't accidentally get filtered out).

const EXCLUDE_TOP_KEYWORDS = [
  // Beauty / cosmetics / hair styling (NOT hygiene basics)
  "beauty",
  "maquillage",
  "coloration",
  "eau de parfum",
  "eau de toilette",
  "eaux de toilette",
  "eau de cologne",
  "brume",
  "vernis",
  "onglerie",
  "ongles",
  "autobronzant",
  "epilation",
  "épilation",
  "dépilat",
  "depilat",
  "hygiene et beaute maquillage",
  "hygiene et beaute colorations",
  "hygiene et beaute cremes de jour",

  // Apparel / textile / bags
  "vêtements",
  "vetements",
  "sous vêtements",
  "sous-vetements",
  "collants",
  "chaussettes",
  "chaussures",
  "sacs à dos",
  "sacs a dos",
  "bagagerie",
  "valises",
  "linge de maison",
  "linge de lit",
  "linge de bain",
  "linge de cuisine",
  "tapis et paillassons",

  // Electronics / electromenager / tv
  "electroménager",
  "electromenager",
  "électroménager",
  "high-tech",
  "high tech",
  "smartphones",
  "tablette",
  "ordinateur",
  "tv samsung",
  "telefunken tv",
  "diverses marques de tv",
  "accessoires tv",
  "récepteur",
  "recepteur",
  "casques et écouteurs",
  "casques et ecouteurs",
  "enceinte",
  "image et son",
  "multimédia",
  "multimedia",
  "informatique",
  "imprimante",
  "objets connectés",
  "objets connectes",
  "console",
  "accessoires gaming",
  "gaming",
  "climatisation",
  "chauffage",
  "réfrigérateur",
  "refrigerateur",
  "aspirateur",
  "friteuse",
  "blender",
  "mixeur",
  "grille pain",
  "bouilloire",
  "batteur",
  "hachoir",
  "moulin",
  "presse agrumes",
  "robot pétrin",
  "robot petrin",
  "raclette gaufrier",
  "micro-onde",
  "micro onde",
  "four encastrable",
  "plaque de cuisson",
  "cuisinière",
  "cuisiniere",
  "mini-four",
  "mini four",
  "lave vaisselle",
  "fer à repasser",
  "fer a repasser",
  "sèche cheveux",
  "seche cheveux",
  "lisseur",
  "tondeuses",
  "épilateurs électrique",
  "epilateurs electrique",
  "pèse personne",
  "pese personne",
  "hotte",
  "congélateur",
  "congelateur",
  "machine à filtre",
  "machine a filtre",
  "machine à capsules",
  "machine a capsules",
  "grand électroménager",
  "grand electromenager",
  "barbecue",

  // Piles / ampoules / electricity
  "piles et ampoules",
  "électricité",
  "electricite",
  "lampes et piles",

  // Bricolage / jardinage / mobilier
  "bricolage",
  "jardinage",
  "jardin",
  "mobilier",
  "meuble",
  "meubles de jardin",
  "salons de jardin",
  "chaises de jardin",
  "chaises longues",
  "tables de jardin",
  "parasols",
  "engrais",
  "outillage",
  "outils",
  "peinture",
  "chlore et produits",
  "décoration",
  "decoration",
  "festif",
  "déco et fêtes",
  "deco et fetes",
  "tableaux, cadres",
  "luminaires",

  // Auto / moto
  "auto et moto",
  "automobile",
  "lubrifiant",
  "entretien et accessoires automobiles",
  "entretien des chaussures",

  // Papeterie / school
  "cahier",
  "stylo",
  "crayon",
  "feutre",
  "surligneur",
  "classeur",
  "gomme",
  "papier à dessin",
  "papier a dessin",
  "papier dessin",
  "dessin",
  "trousse scolaire",
  "porte-vue",
  "porte vue",
  "bloc-notes",
  "bloc notes",
  "colles",
  "marqueurs",
  "livres",
  "magazines",
  "journaux",
  "écriture",
  "ecriture",
  "fournitures de bureau",

  // Animal / pet (food + accessories)
  "animalerie",
  "alimentation pour chats",
  "alimentation pour chiens",
  "hygiène et accessoires pour chats",
  "hygiene et accessoires pour chats",
  "hygiène et accessoires pour chiens",
  "hygiene et accessoires pour chiens",
  "pâtés et aliments humides chats",
  "pates et aliments humides chats",
  "pâtés et aliments humides chiens",
  "pates et aliments humides chiens",
  "chats",
  "chiens",
  "autres animaux",

  // Loisir / sport / plein air / plage
  "sport",
  "fitness",
  "musculation",
  "plage et plein air",
  "loisir",
  "jouet",
  "jeux",
  "figurines",
  "poupées",
  "poupees",
  "pâte à modeler",
  "pate a modeler",
  "gourdes",
  "glacières",
  "glacieres",
  "sacs isothermes",
  "bouées",
  "bouees",

  // Vaisselle durable / batterie de cuisine
  "vaisselle en verre",
  "vaisselle en porcelaine",
  "vaisselle en céramique",
  "vaisselle en ceramique",
  "vaisselle jetable",
  "vaisselle en carton",
  "art de la table",
  "couverts et plateaux",
  "couverts et ménagères",
  "couverts et menageres",
  "carafes",
  "verres",
  "portes assiettes",
  "moules, plats à four",
  "moules, plats a four",
  "ustensiles de cuisine",
  "couteau et couperet",
  "cuisson au feu",
  "brochettes et grille",
  "barbecue grill",
  "paniers à pains",
  "paniers a pains",
  "accessoires de la table",
  "accessoires repas",
  "portes goûter",
  "portes gouter",

  // Rangement / stockage
  "boites en verre",
  "boites en plastique",
  "bacs de rangement",
  "housses et sacs de rangement",
  "meuble de rangement",
  "pots et bacs",
  "seaux et bassines",
  "cintres",
  "poubelles",
  "panier à linge",
  "panier a linge",
  "stockage",

  // Miscellaneous non-basket
  "puériculture",
  "puericulture",
  "univers bébé",
  "univers bebe",
  "aliments pour bébé",
  "aliments pour bebe",
  "univers bebe aliments pour bebe",

  // Text categories
  "textile",
  "sous-vêtements homme",
  "sous vetements homme",
];

// Explicit include (food + consumables) — matched with higher priority than
// exclude. Used to whitelist ambiguous top-level names that would otherwise be
// caught by an exclude keyword. Currently kept short on purpose.
const INCLUDE_FIRST_KEYWORDS = [
  "aliments pour bébé", // baby food is edible → include
  "aliments pour bebe",
  "univers bebe aliments pour bebe",
];

function normalize(s: string): string {
  return s.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "");
}

export function isFoodCategoryName(topCategory: string | null | undefined): boolean {
  if (!topCategory) return true; // unknown → keep (default include)
  const c = normalize(topCategory);
  for (const w of INCLUDE_FIRST_KEYWORDS) if (c.includes(normalize(w))) return true;
  for (const w of EXCLUDE_TOP_KEYWORDS) if (c.includes(normalize(w))) return false;
  return true;
}

// Legacy name-based fallback (still exported for safety, but not required with
// category filtering).
export function isFoodProduct(name: string, category?: string | null): boolean {
  return isFoodCategoryName(category);
}

// SQL fragment producing a boolean expression that is TRUE for products whose
// top_category is NOT excluded. Requires join to top_categories via
// product_subcategories → subcategories → low_categories → top_categories.
//
// Usage:
//   SELECT p.* FROM products p
//   WHERE EXISTS (
//     SELECT 1 FROM product_subcategories psc
//     JOIN subcategories sc ON sc.id = psc.subcategory_id
//     JOIN low_categories lc ON lc.id = sc.low_category_id
//     JOIN top_categories tc ON tc.id = lc.top_category_id
//     WHERE psc.product_id = p.id
//       AND (${foodTopCategorySqlWhere('tc.name')})
//   )
export function foodTopCategorySqlWhere(colExpr = "tc.name"): string {
  // We emit a NOT ILIKE ALL(...) filter using an array literal.
  const patterns = EXCLUDE_TOP_KEYWORDS.map((w) => `%${w.replace(/'/g, "''")}%`);
  const arr = `ARRAY[${patterns.map((p) => `'${p}'`).join(",")}]::text[]`;
  return `NOT EXISTS (SELECT 1 FROM unnest(${arr}) AS pat WHERE lower(${colExpr}) ILIKE lower(pat))`;
}
