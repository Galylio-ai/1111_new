import { NextRequest, NextResponse } from "next/server";
import { catalogPool } from "@/lib/db";

function sanitizeImage(raw: string | null | undefined): string {
  if (!raw) return "";
  const matches = String(raw).match(/https?:\/\/\S+\.(?:jpg|jpeg|png|webp|gif|avif)(?:\?[^\s"']*)?/gi);
  if (matches && matches.length) return matches[matches.length - 1];
  return String(raw).trim().split(/\s+/).pop() ?? "";
}
function sanitizeText(raw: string | null | undefined): string {
  if (!raw) return "";
  return String(raw).replace(/chevron_right/gi, "").replace(/\s+/g, " ").trim();
}

// GET /api/catalog/compare/search?q=oneplus&limit=10
// Searches the catalog for TECH products only (smartphones / PC / informatique)
// to power the versus-style "Comparaison" pickers. Returns the cheapest listing
// per distinct product name so the same model from many shops shows once.

// Keywords that mark a product as "tech". Matched case-insensitively against
// top_category / low_category / subcategory / name.
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

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const q = (searchParams.get("q") ?? "").trim().toLowerCase();
  const limit = Math.min(20, Math.max(1, parseInt(searchParams.get("limit") ?? "10", 10)));

  if (q.length < 2) return NextResponse.json({ items: [] });

  try {
    const pool = catalogPool();

    // $1 = name search pattern, $2 = tech-keyword array, $3 = limit.
    // The tech filter is a single ANY(array) test against a concatenated
    // haystack of the category fields + name — far simpler and faster than
    // 200 individual LIKE clauses, and avoids placeholder-index bugs.
    const sql = `
      SELECT slug, name, brand, image, price, top_category, shop_count
      FROM (
        SELECT DISTINCT ON (lower(p.name))
               p.slug, p.name, p.brand, p.image, p.price, p.top_category,
               COUNT(*) OVER (PARTITION BY lower(p.name)) AS shop_count
        FROM products p
        WHERE p.name IS NOT NULL
          AND p.image IS NOT NULL
          AND lower(p.name) LIKE $1
          AND lower(coalesce(p.top_category,'') || ' ' ||
                    coalesce(p.low_category,'') || ' ' ||
                    coalesce(p.subcategory,'') || ' ' ||
                    coalesce(p.name,'')) LIKE ANY ($2::text[])
        ORDER BY lower(p.name), p.price ASC NULLS LAST
      ) t
      ORDER BY t.shop_count DESC, t.price ASC NULLS LAST
      LIMIT $3
    `;

    const patterns = TECH_KEYWORDS.map((k) => `%${k}%`);
    const res = await pool.query(sql, [`%${q}%`, patterns, limit]);

    const items = res.rows.map((r: {
      slug: string; name: string; brand: string | null; image: string | null;
      price: string | null; top_category: string | null; shop_count: string;
    }) => ({
      slug: r.slug,
      name: sanitizeText(r.name),
      brand: sanitizeText(r.brand),
      img: sanitizeImage(r.image),
      price: r.price != null ? parseFloat(r.price) : null,
      category: sanitizeText(r.top_category),
      shopCount: parseInt(r.shop_count, 10) || 1,
    }));

    return NextResponse.json({ items });
  } catch (err) {
    return NextResponse.json({ error: String(err), items: [] }, { status: 500 });
  }
}
