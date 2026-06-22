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

// GET /api/catalog/products/[slug]?shop=tunisianet
// Single product detail: listing + details + price history + related.
export async function GET(
  req: NextRequest,
  { params }: { params: { slug: string } }
) {
  const shop = (req.nextUrl.searchParams.get("shop") ?? "").trim().toLowerCase();
  const slug = params.slug;

  try {
    const pool = catalogPool();

    const prodRes = await pool.query(
      `SELECT p.id, p.name, p.brand, p.image, p.url, p.price, p.old_price, p.available,
              p.availability, p.top_category, p.low_category, p.subcategory,
              s.name AS shop_name, s.slug AS shop_slug, s.id AS shop_id
       FROM products p
       JOIN shops s ON s.id = p.shop_id
       WHERE p.slug = $1 ${shop ? "AND (s.slug = $2 OR s.shop_key = $2)" : ""}
       LIMIT 1`,
      shop ? [slug, shop] : [slug]
    );
    if (!prodRes.rows.length) return NextResponse.json({ error: "not found" }, { status: 404 });
    const p = prodRes.rows[0];

    const [detRes, histRes, relRes] = await Promise.all([
      pool.query(
        `SELECT title, brand, sku, barcode, overview, description, specifications, images, store_availability
         FROM product_details WHERE product_id = $1`,
        [p.id]
      ),
      pool.query<{ price: string; recorded_at: string }>(
        `SELECT price, recorded_at FROM price_history
         WHERE product_id = $1 AND price IS NOT NULL
         ORDER BY recorded_at ASC LIMIT 365`,
        [p.id]
      ),
      pool.query(
        `SELECT slug, name, image, price, old_price FROM products
         WHERE shop_id = $1 AND top_category IS NOT DISTINCT FROM $2 AND id <> $3
         ORDER BY (image IS NOT NULL) DESC, random() LIMIT 8`,
        [p.shop_id, p.top_category, p.id]
      ),
    ]);

    const d = detRes.rows[0] ?? {};
    const price = p.price != null ? parseFloat(p.price) : null;
    const old   = p.old_price != null ? parseFloat(p.old_price) : null;

    const cleanImg = sanitizeImage(p.image);
    const cleanImages = Array.isArray(d.images) && d.images.length
      ? d.images.map((x: string) => sanitizeImage(x)).filter(Boolean)
      : (cleanImg ? [cleanImg] : []);

    return NextResponse.json({
      name: sanitizeText(p.name),
      brand: sanitizeText(d.brand ?? p.brand),
      shop: p.shop_name,
      shopSlug: p.shop_slug,
      url: p.url,
      img: cleanImg,
      images: cleanImages,
      price,
      oldPrice: old,
      discount: old && price && old > price ? Math.round((1 - price / old) * 100) : null,
      available: p.available,
      availability: p.availability,
      category: {
        top: sanitizeText(p.top_category),
        low: sanitizeText(p.low_category),
        sub: sanitizeText(p.subcategory),
      },
      sku: d.sku ?? null,
      barcode: d.barcode ?? null,
      overview: d.overview ?? null,
      description: d.description ?? null,
      specifications: d.specifications ?? null,
      storeAvailability: d.store_availability ?? null,
      priceHistory: histRes.rows.map(h => ({ price: parseFloat(h.price), date: h.recorded_at })),
      related: relRes.rows.map(r => ({
        slug: r.slug,
        name: sanitizeText(r.name),
        img: sanitizeImage(r.image),
        price: r.price != null ? parseFloat(r.price) : null,
      })),
    });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
