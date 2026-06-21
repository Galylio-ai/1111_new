import { NextRequest, NextResponse } from "next/server";
import { catalogPool } from "@/lib/db";

// GET /api/catalog/compare/search?q=oneplus&limit=10
// Searches the catalog for TECH products only (smartphones / PC / informatique)
// to power the versus-style "Comparaison" pickers. Returns the cheapest listing
// per distinct product name so the same model from many shops shows once.

// Category / name keywords that mark a product as "tech" (smartphone, PC, informatique).
// Matched case-insensitively against top_category, low_category, subcategory and name.
const TECH_KEYWORDS = [
  "smartphone", "telephone", "téléphone", "phone", "mobile", "gsm",
  "tablette", "tablet", "ipad",
  "pc portable", "ordinateur", "laptop", "notebook", "macbook",
  "pc bureau", "pc de bureau", "desktop", "all in one",
  "informatique", "composant", "processeur", "cpu", "carte graphique", "gpu",
  "carte mere", "carte mère", "motherboard", "ram", "memoire", "mémoire",
  "ssd", "disque dur", "stockage", "alimentation pc", "boitier", "boîtier",
  "ecran", "écran", "moniteur", "monitor",
  "clavier", "souris", "casque gaming", "peripherique", "périphérique",
  "imprimante", "scanner", "gaming",
];

function buildTechFilter(startIdx: number): { sql: string; params: string[]; nextIdx: number } {
  const fields = ["lower(p.top_category)", "lower(p.low_category)", "lower(p.subcategory)", "lower(p.name)"];
  const ors: string[] = [];
  const params: string[] = [];
  let i = startIdx;
  for (const kw of TECH_KEYWORDS) {
    const ph = `$${i++}`;
    params.push(`%${kw}%`);
    ors.push(`(${fields.map((f) => `${f} LIKE ${ph}`).join(" OR ")})`);
  }
  return { sql: `(${ors.join(" OR ")})`, params, nextIdx: i };
}

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const q = (searchParams.get("q") ?? "").trim().toLowerCase();
  const limit = Math.min(20, Math.max(1, parseInt(searchParams.get("limit") ?? "10", 10)));

  if (q.length < 2) return NextResponse.json({ items: [] });

  try {
    const pool = catalogPool();

    const where: string[] = ["lower(p.name) LIKE $1"];
    const params: (string | number)[] = [`%${q}%`];
    const tech = buildTechFilter(2);
    where.push(tech.sql);
    params.push(...tech.params);

    // Group by normalized name so the same model across shops collapses to one
    // pickable entry. We keep the row with the lowest price as the representative.
    const sql = `
      SELECT DISTINCT ON (lower(p.name))
             p.slug, p.name, p.brand, p.image, p.price, p.top_category,
             COUNT(*) OVER (PARTITION BY lower(p.name)) AS shop_count
      FROM products p
      WHERE ${where.join(" AND ")} AND p.image IS NOT NULL
      ORDER BY lower(p.name), p.price ASC NULLS LAST
      LIMIT ${tech.nextIdx}
    `;
    const res = await pool.query(sql, [...params, limit]);

    const items = res.rows.map((r: {
      slug: string; name: string; brand: string | null; image: string | null;
      price: string | null; top_category: string | null; shop_count: string;
    }) => ({
      slug: r.slug,
      name: r.name,
      brand: r.brand ?? "",
      img: r.image ?? "",
      price: r.price != null ? parseFloat(r.price) : null,
      category: r.top_category ?? "",
      shopCount: parseInt(r.shop_count, 10) || 1,
    }));

    return NextResponse.json({ items });
  } catch (err) {
    return NextResponse.json({ error: String(err), items: [] }, { status: 500 });
  }
}
