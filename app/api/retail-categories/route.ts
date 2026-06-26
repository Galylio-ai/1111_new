import { NextResponse } from "next/server";
import { Pool } from "pg";

const pool = new Pool({ connectionString: process.env.RETAIL_DB_URL, max: 2 });

type Cat = { id: number; name: string; slug: string; subcategories: { name: string; slug: string }[] };
let cache: Cat[] | null = null;
// Bust stale cache on module reload
cache = null;

// Only top-level categories that belong to tech / electroménager retail shops.
// Matched by slug keywords — anything else (alimentation, parapharmacie, etc.) is excluded.
const ALLOWED_SLUGS = new Set([
  "informatique","pc-portables","ordinateurs","smartphones","telephonie",
  "tablettes","accessoires-informatiques","composants","stockage","reseaux",
  "imprimantes","moniteurs","ecrans","peripheriques","gaming","jeux-video",
  "consoles","audio","tv-home-cinema","television","son","cameras",
  "electromenager","gros-electromenager","petit-electromenager","climatisation",
  "refrigerateurs","congelateurs","lave-linge","seche-linge","lave-vaisselle",
  "cuisinieres","fours","hottes","aspirateurs","accessoires-electromenager",
  "batteries-chargeurs","cables-adaptateurs","protection-telephone",
  "accessoires-audio","accessoires-gaming","accessoires-gamer",
  "accessoires-informatiques","accessoires-telephonie","chargeurs",
]);

// Also allow by keyword match in the category name
const ALLOWED_KEYWORDS = [
  "informati","ordinat","portable","smartphone","téléphone","tablette",
  "gaming","console","audio","casque","haut-parleur","enceinte","tv","télé",
  "écran","moniteur","composant","stockage","réseau","imprimante","périphérique",
  "électroménager","electromenager","réfrigérateur","congélateur","lave",
  "climatiseur","aspirateur","four","cuisinière","batterie","chargeur","câble",
  "accessoire","camera","photo",
];

function isAllowed(name: string, slug: string): boolean {
  const n = name.toLowerCase();
  const s = slug.toLowerCase();
  if (ALLOWED_SLUGS.has(s)) return true;
  return ALLOWED_KEYWORDS.some(kw => n.includes(kw) || s.includes(kw));
}

export async function GET() {
  if (cache) return NextResponse.json({ categories: cache });

  const client = await pool.connect();
  try {
    const res = await client.query(`
      SELECT
        tc.id        AS top_id,
        tc.name      AS top_name,
        tc.slug      AS top_slug,
        sc.name      AS sub_name,
        sc.slug      AS sub_slug
      FROM top_categories tc
      LEFT JOIN low_categories lc ON lc.top_category_id = tc.id
      LEFT JOIN subcategories sc ON sc.low_category_id = lc.id
      WHERE EXISTS (
        SELECT 1 FROM product_subcategories psc
        JOIN subcategories sc2 ON sc2.id = psc.subcategory_id
        JOIN low_categories lc2 ON lc2.id = sc2.low_category_id
        WHERE lc2.top_category_id = tc.id
      )
      AND tc.slug ~* '(informati|ordinat|portable|smartphone|telephone|tablette|gaming|console|audio|casque|haut.parleur|enceinte|tv|televi|ecran|moniteur|composant|stockage|reseau|imprimante|peripherique|electromenager|refriger|congelat|lave|climatiseur|climatisation|aspirateur|four|cuisiniere|batterie|chargeur|cable|accessoire|camera|photo|scanner|onduleur|clavier|souris|processeur|ram|carte.graphique|boitier|alimentation|refroidissement|disque|ssd|usb|hdmi|gamer|gaming)'
      ORDER BY tc.name ASC, sc.name ASC
    `);

    const map = new Map<number, Cat>();
    for (const row of res.rows) {
      if (!map.has(row.top_id)) {
        map.set(row.top_id, { id: row.top_id, name: row.top_name, slug: row.top_slug, subcategories: [] });
      }
      if (row.sub_name && row.sub_slug) {
        const entry = map.get(row.top_id)!;
        if (!entry.subcategories.find((s: { slug: string }) => s.slug === row.sub_slug)) {
          entry.subcategories.push({ name: row.sub_name, slug: row.sub_slug });
        }
      }
    }

    cache = [...map.values()];
    return NextResponse.json({ categories: cache });
  } finally {
    client.release();
  }
}
