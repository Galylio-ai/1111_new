import { NextRequest, NextResponse } from "next/server";
import { Pool } from "pg";

const pool = new Pool({ connectionString: process.env.RETAIL_DB_URL, max: 4 });

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const page    = Math.max(0, parseInt(searchParams.get("page")  ?? "0", 10));
  const limit   = Math.min(48, Math.max(1, parseInt(searchParams.get("limit") ?? "24", 10)));
  const cat     = (searchParams.get("cat")     ?? "").trim().toLowerCase();
  const q       = (searchParams.get("q")       ?? "").trim().toLowerCase();
  const shop    = (searchParams.get("shop")    ?? "").trim().toLowerCase();
  const matched = searchParams.get("matched"); // "true" | "false" | null = all

  const conditions: string[] = [];
  const params: (string | number | boolean)[] = [];

  if (matched === "true") {
    conditions.push(`p.is_matched = TRUE`);
  } else if (matched === "false") {
    conditions.push(`p.is_matched = FALSE`);
  }

  if (cat) {
    // Support comma-separated slugs for multi-category matching (e.g. gaming card)
    const slugs = cat.split(",").map(s => s.trim()).filter(Boolean);
    if (slugs.length === 1) {
      params.push(slugs[0]);
      conditions.push(`(tc.slug = $${params.length} OR lc.slug = $${params.length} OR sc.slug = $${params.length})`);
    } else {
      const placeholders = slugs.map((s, i) => {
        params.push(s);
        return `$${params.length}`;
      });
      const inList = placeholders.join(",");
      conditions.push(`(tc.slug IN (${inList}) OR lc.slug IN (${inList}) OR sc.slug IN (${inList}))`);
    }
  }
  if (q) {
    params.push(`%${q}%`);
    conditions.push(`(lower(p.name) LIKE $${params.length} OR lower(b.name) LIKE $${params.length})`);
  }
  if (shop) {
    params.push(shop);
    conditions.push(`p.id IN (
      SELECT sp2.product_id FROM shop_prices sp2
      JOIN shops s2 ON s2.id = sp2.shop_id
      WHERE s2.shop_key = $${params.length}
    )`);
  }

  const where = conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";

  const client = await pool.connect();
  try {
    const [countRes, shopCountRes, allShopsRes, allCatsRes] = await Promise.all([
      client.query(
        `SELECT COUNT(DISTINCT p.id) AS total
         FROM products p
         LEFT JOIN brands b ON b.id = p.brand_id
         LEFT JOIN product_subcategories psc ON psc.product_id = p.id
         LEFT JOIN subcategories sc ON sc.id = psc.subcategory_id
         LEFT JOIN low_categories lc ON lc.id = sc.low_category_id
         LEFT JOIN top_categories tc ON tc.id = lc.top_category_id
         ${where}`,
        params
      ),
      client.query(`SELECT COUNT(*) AS cnt FROM shops`),
      client.query(`
        SELECT s.shop_key, s.name
        FROM shops s
        WHERE EXISTS (SELECT 1 FROM shop_prices sp WHERE sp.shop_id = s.id)
        ORDER BY s.name ASC
      `),
      client.query(`
        SELECT tc.id, tc.name, tc.slug
        FROM top_categories tc
        WHERE EXISTS (
          SELECT 1 FROM product_subcategories psc
          JOIN subcategories sc ON sc.id = psc.subcategory_id
          JOIN low_categories lc ON lc.id = sc.low_category_id
          WHERE lc.top_category_id = tc.id
        )
        AND (
          tc.slug ~* '(informati|ordinat|portable|smartphone|telephone|tablette|gaming|console|audio|casque|haut.parleur|enceinte|tv|televi|ecran|moniteur|composant|stockage|reseau|imprimante|peripherique|electromenager|refriger|congelat|lave|climatiseur|climatisation|aspirateur|four|cuisiniere|batterie|chargeur|cable|accessoire|camera|photo|scanner|onduleur|clavier|souris|processeur|ram|carte.graphique|boitier|alimentation|refroidissement|disque|ssd|usb|hdmi)'
        )
        ORDER BY tc.name ASC
      `),
    ]);

    const total     = parseInt(countRes.rows[0].total, 10);
    const shopCount = parseInt(shopCountRes.rows[0].cnt, 10);
    const allShops  = allShopsRes.rows.map(r => ({ key: r.shop_key, name: r.name }));
    const allCats   = allCatsRes.rows.map(r => ({ id: r.id, name: r.name, slug: r.slug }));

    params.push(limit, page * limit);
    const dataRes = await client.query(
      `SELECT
         p.id, p.name, p.slug, p.is_matched,
         b.name AS brand,
         tc.name AS category,
         MIN(sp.current_price) AS min_price,
         MAX(sp.current_price) AS max_price,
         array_agg(DISTINCT s.shop_key ORDER BY s.shop_key) AS shop_keys,
         (SELECT pi.image_url FROM product_images pi WHERE pi.product_id = p.id ORDER BY pi.id ASC OFFSET 1 LIMIT 1) AS img2,
         (SELECT pi.image_url FROM product_images pi WHERE pi.product_id = p.id ORDER BY pi.id ASC LIMIT 1) AS img1
       FROM products p
       LEFT JOIN brands b ON b.id = p.brand_id
       LEFT JOIN product_subcategories psc ON psc.product_id = p.id
       LEFT JOIN subcategories sc ON sc.id = psc.subcategory_id
       LEFT JOIN low_categories lc ON lc.id = sc.low_category_id
       LEFT JOIN top_categories tc ON tc.id = lc.top_category_id
       LEFT JOIN shop_prices sp ON sp.product_id = p.id
       LEFT JOIN shops s ON s.id = sp.shop_id
       ${where}
       GROUP BY p.id, p.name, p.slug, p.is_matched, b.name, tc.name
       ORDER BY p.id ASC
       LIMIT $${params.length - 1} OFFSET $${params.length}`,
      params
    );

    const items = dataRes.rows.map((r) => ({
      name: r.name,
      slug: r.slug,
      brand: r.brand ?? "",
      category: r.category ?? "",
      img: r.img2 ?? r.img1 ?? null,
      minPrice: r.min_price ? parseFloat(r.min_price) : null,
      maxPrice: r.max_price ? parseFloat(r.max_price) : null,
      shopNames: r.shop_keys ?? [],
      isMatched: r.is_matched,
      discount: null,
    }));

    return NextResponse.json({ total, page, limit, items, shopCount, allShops, allCats });
  } finally {
    client.release();
  }
}
