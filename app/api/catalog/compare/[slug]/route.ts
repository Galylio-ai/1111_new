import { NextRequest, NextResponse } from "next/server";
import { catalogPool } from "@/lib/db";

// GET /api/catalog/compare/[slug]
// One side of a versus comparison: the product, its merged specs, and every
// shop that carries it (cheapest first) so the UI can show specs + where to buy.

type SpecMap = Record<string, string>;

// product_details.specifications can be an object {key:val}, or an array of
// {name,value} / {label,value} / {key,value}. Normalize to a flat string map.
function normalizeSpecs(raw: unknown): SpecMap {
  const out: SpecMap = {};
  if (!raw) return out;
  if (Array.isArray(raw)) {
    for (const e of raw) {
      if (e && typeof e === "object") {
        const o = e as Record<string, unknown>;
        const k = (o.name ?? o.label ?? o.key ?? o.title) as string | undefined;
        const v = (o.value ?? o.val ?? o.text) as unknown;
        if (k != null && v != null && String(v).trim()) out[String(k).trim()] = String(v).trim();
      }
    }
    return out;
  }
  if (typeof raw === "object") {
    for (const [k, v] of Object.entries(raw as Record<string, unknown>)) {
      if (v == null) continue;
      const val = typeof v === "object" ? JSON.stringify(v) : String(v);
      if (val.trim()) out[k.trim()] = val.trim();
    }
  }
  return out;
}

export async function GET(
  _req: NextRequest,
  { params }: { params: { slug: string } }
) {
  const slug = params.slug;

  try {
    const pool = catalogPool();

    // Every shop listing for this slug (same model carried by multiple shops).
    const rows = await pool.query(
      `SELECT p.id, p.name, p.brand, p.image, p.url, p.price, p.old_price,
              p.top_category, p.low_category, p.subcategory,
              s.name AS shop_name, s.slug AS shop_slug, s.logo_url AS shop_logo
       FROM products p
       JOIN shops s ON s.id = p.shop_id
       WHERE p.slug = $1
       ORDER BY p.price ASC NULLS LAST`,
      [slug]
    );
    if (!rows.rows.length) return NextResponse.json({ error: "not found" }, { status: 404 });

    const main = rows.rows[0];

    // Pull details (specs/description) from any listing that has them.
    const ids = rows.rows.map((r) => r.id);
    const detRes = await pool.query(
      `SELECT product_id, brand, overview, description, specifications
       FROM product_details
       WHERE product_id = ANY($1::bigint[])`,
      [ids]
    );

    let specs: SpecMap = {};
    let description: string | null = null;
    let brand: string | null = main.brand ?? null;
    for (const d of detRes.rows) {
      const s = normalizeSpecs(d.specifications);
      // Merge, preferring the listing with the richest spec set.
      if (Object.keys(s).length > Object.keys(specs).length) specs = s;
      if (!description && (d.overview || d.description)) description = d.overview ?? d.description;
      if (!brand && d.brand) brand = d.brand;
    }

    const offers = rows.rows
      .filter((r) => r.price != null)
      .map((r) => ({
        shop: r.shop_name,
        shopSlug: r.shop_slug,
        logo: r.shop_logo ?? null,
        price: parseFloat(r.price),
        url: r.url ?? null,
      }));

    const prices = offers.map((o) => o.price);
    const minPrice = prices.length ? Math.min(...prices) : null;
    const maxPrice = prices.length ? Math.max(...prices) : null;

    return NextResponse.json({
      slug,
      name: main.name,
      brand: brand ?? "",
      img: main.image ?? "",
      category: { top: main.top_category, low: main.low_category, sub: main.subcategory },
      minPrice,
      maxPrice,
      offers,
      shopCount: offers.length,
      description,
      specs,
    });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
