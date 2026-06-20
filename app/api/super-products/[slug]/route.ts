import { NextRequest, NextResponse } from "next/server";
import { Pool } from "pg";

const pool = new Pool({
  connectionString: process.env.ALIMENTATION_DB_URL,
  max: 5,
});

function toSlug(name: string) {
  return name
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

export async function GET(
  _req: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const { rows } = await pool.query<{
      id: number;
      name: string;
      brand: string;
      img: string;
      min_price: string;
      max_price: string;
      shop_names: string[];
    }>(`
      SELECT
        p.id,
        p.name,
        COALESCE(b.name, '') AS brand,
        MIN(sp.current_price) AS min_price,
        MAX(sp.current_price) AS max_price,
        (SELECT image_url FROM product_images WHERE product_id = p.id LIMIT 1) AS img,
        array_agg(DISTINCT s.name ORDER BY s.name) AS shop_names
      FROM products p
      LEFT JOIN brands b ON b.id = p.brand_id
      JOIN shop_prices sp ON sp.product_id = p.id
      JOIN shops s ON s.id = sp.shop_id
      GROUP BY p.id, p.name, b.name
    `);

    const product = rows.find(r => toSlug(r.name) === params.slug);
    if (!product) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    const minPrice = parseFloat(product.min_price) || 0;
    const maxPrice = parseFloat(product.max_price) || 0;
    const discount =
      maxPrice > minPrice
        ? Math.round((1 - minPrice / maxPrice) * 100)
        : null;

    // Fetch per-shop URLs/prices, all images, and source reference
    const client = await pool.connect();
    let shopUrls: Record<string, string> = {};
    let shopPrices: Record<string, number> = {};
    let images: string[] = [];
    let reference: string | null = null;
    try {
      const [pricesRes, imagesRes, refRes] = await Promise.all([
        client.query(
          `SELECT s.shop_key, s.name AS shop_name, sp.shop_product_url, sp.current_price
           FROM products p
           JOIN shop_prices sp ON sp.product_id = p.id
           JOIN shops s ON s.id = sp.shop_id
           WHERE p.slug = $1
           ORDER BY sp.current_price ASC`,
          [params.slug]
        ),
        client.query(
          `SELECT pi.image_url
           FROM products p
           JOIN product_images pi ON pi.product_id = p.id
           WHERE p.slug = $1
           ORDER BY pi.id ASC`,
          [params.slug]
        ),
        client.query(
          `SELECT source_product_id FROM products WHERE slug = $1 LIMIT 1`,
          [params.slug]
        ),
      ]);
      for (const row of pricesRes.rows) {
        const price = parseFloat(row.current_price);
        const url = row.shop_product_url;
        for (const key of [row.shop_key, row.shop_name, row.shop_name?.toLowerCase()].filter(Boolean)) {
          shopPrices[key] = price;
          if (url) shopUrls[key] = url;
        }
      }
      images = imagesRes.rows.map(r => r.image_url).filter(Boolean);
      reference = refRes.rows[0]?.source_product_id ?? null;
    } finally {
      client.release();
    }

    // Related: same first-word of name (rough category match), different product
    const firstWord = product.name.split(" ")[0].toLowerCase();
    const related = rows
      .filter(
        r => r.name.toLowerCase().startsWith(firstWord) && r.name !== product.name
      )
      .slice(0, 6)
      .map(r => ({
        name: r.name,
        brand: r.brand,
        img: r.img ?? "",
        minPrice: parseFloat(r.min_price) || 0,
        slug: toSlug(r.name),
        discount:
          parseFloat(r.max_price) > parseFloat(r.min_price)
            ? Math.round((1 - parseFloat(r.min_price) / parseFloat(r.max_price)) * 100)
            : null,
      }));

    return NextResponse.json({
      name: product.name,
      brand: product.brand,
      category: "Supermarché",
      img: product.img ?? "",
      images,
      reference,
      minPrice,
      maxPrice,
      shopNames: product.shop_names ?? [],
      discount,
      slug: params.slug,
      shopUrls,
      shopPrices,
      related,
    });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
