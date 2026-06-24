import { NextResponse } from "next/server";
import { Pool } from "pg";

export const revalidate = 300;

const aliPool    = new Pool({ connectionString: process.env.ALIMENTATION_DB_URL, max: 3 });
const paraPool   = new Pool({ connectionString: process.env.PARA_DB_URL,         max: 3 });
const retailPool = new Pool({ connectionString: process.env.RETAIL_DB_URL,       max: 3 });

type LatestProduct = {
  id: number;
  name: string;
  slug: string;
  brand: string | null;
  category: string | null;
  catalog: "alimentation" | "para" | "retail";
  img: string | null;
  shop: string | null;
  price: number | null;
  createdAt: string;
};

const LIMIT_PER_CATALOG = 12;

async function queryLatest(
  pool: Pool,
  catalog: LatestProduct["catalog"]
): Promise<LatestProduct[]> {
  const client = await pool.connect();
  try {
    const { rows } = await client.query<{
      id: number;
      name: string;
      slug: string;
      brand: string | null;
      category: string | null;
      img: string | null;
      shop: string | null;
      price: string | null;
      created_at: string;
    }>(
      `
      WITH cheapest AS (
        SELECT DISTINCT ON (sp.product_id)
          sp.product_id,
          s.name AS shop,
          sp.current_price
        FROM shop_prices sp
        JOIN shops s ON s.id = sp.shop_id
        ORDER BY sp.product_id, sp.current_price ASC NULLS LAST
      ),
      cover AS (
        SELECT DISTINCT ON (product_id) product_id, image_url
        FROM product_images
        WHERE image_url NOT ILIKE '%loading%'
          AND image_url NOT ILIKE '%placeholder%'
          AND image_url NOT ILIKE '%home_default%'
        ORDER BY product_id,
          CASE
            WHEN image_url ILIKE '%.webp' THEN 1
            WHEN image_url ILIKE '%.jpg'  THEN 2
            WHEN image_url ILIKE '%.jpeg' THEN 2
            WHEN image_url ILIKE '%.png'  THEN 3
            ELSE 9
          END
      ),
      product_top_cat AS (
        SELECT DISTINCT ON (ps.product_id) ps.product_id, tc.name AS category
        FROM product_subcategories ps
        JOIN subcategories sc ON sc.id = ps.subcategory_id
        JOIN low_categories lc ON lc.id = sc.low_category_id
        JOIN top_categories tc ON tc.id = lc.top_category_id
        ORDER BY ps.product_id, tc.id
      )
      SELECT
        p.id,
        p.name,
        p.slug,
        b.name AS brand,
        tc.category,
        img.image_url AS img,
        ch.shop,
        ch.current_price::text AS price,
        p.created_at::text AS created_at
      FROM products p
      LEFT JOIN brands b ON b.id = p.brand_id
      LEFT JOIN product_top_cat tc ON tc.product_id = p.id
      LEFT JOIN cover img ON img.product_id = p.id
      LEFT JOIN cheapest ch ON ch.product_id = p.id
      WHERE p.status = 'active'
      ORDER BY p.created_at DESC
      LIMIT $1
      `,
      [LIMIT_PER_CATALOG]
    );

    return rows.map((r) => ({
      id: r.id,
      name: r.name,
      slug: r.slug,
      brand: r.brand,
      category: r.category,
      catalog,
      img: r.img,
      shop: r.shop,
      price: r.price ? parseFloat(r.price) : null,
      createdAt: r.created_at,
    }));
  } finally {
    client.release();
  }
}

export async function GET() {
  try {
    const [ali, para, retail] = await Promise.allSettled([
      queryLatest(aliPool, "alimentation"),
      queryLatest(paraPool, "para"),
      queryLatest(retailPool, "retail"),
    ]);

    const all: LatestProduct[] = [
      ...(ali.status === "fulfilled" ? ali.value : []),
      ...(para.status === "fulfilled" ? para.value : []),
      ...(retail.status === "fulfilled" ? retail.value : []),
    ];

    // Sort globally by createdAt DESC and keep the top 30 most recent
    all.sort((a, b) => (b.createdAt < a.createdAt ? -1 : b.createdAt > a.createdAt ? 1 : 0));
    const items = all.slice(0, 30);

    return NextResponse.json({ items });
  } catch (err) {
    return NextResponse.json({ items: [], error: String(err) }, { status: 200 });
  }
}
