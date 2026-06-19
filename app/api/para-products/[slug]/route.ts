import { NextRequest, NextResponse } from "next/server";
import { readFileSync } from "fs";
import path from "path";
import { Pool } from "pg";

type Product = {
  name: string;
  brand: string;
  category: string;
  img: string;
  minPrice: number;
  maxPrice: number;
  shopNames: string[];
  discount: number | null;
};

let cache: Product[] | null = null;
function loadData(): Product[] {
  if (cache) return cache;
  const file = path.join(process.cwd(), "app/api/para-products/data.json");
  cache = JSON.parse(readFileSync(file, "utf8")) as Product[];
  return cache;
}

function toSlug(name: string) {
  return name.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

const pool = new Pool({ connectionString: process.env.PARA_DB_URL, max: 3 });

async function getDbData(productName: string, slug: string): Promise<{
  description: string | null;
  specs: Record<string, string>;
  shopUrls: Record<string, string>;
  shopPrices: Record<string, number>;
}> {
  try {
    const client = await pool.connect();
    try {
      const [descRes, specsRes, pricesRes] = await Promise.all([
        client.query(`SELECT p.description FROM products p WHERE p.slug = $1 LIMIT 1`, [slug]),
        client.query(
          `SELECT ps.spec_key, ps.spec_value
           FROM products p
           JOIN product_specs ps ON ps.product_id = p.id
           WHERE p.slug = $1
             AND ps.spec_key NOT IN ('data_quality_score','shop_count')`,
          [slug]
        ),
        client.query(
          `SELECT s.shop_key, s.name AS shop_name, sp.shop_product_url, sp.current_price
           FROM products p
           JOIN shop_prices sp ON sp.product_id = p.id
           JOIN shops s ON s.id = sp.shop_id
           WHERE lower(p.name) = lower($1)
           ORDER BY sp.current_price ASC`,
          [productName]
        ),
      ]);

      const description = descRes.rows[0]?.description ?? null;
      const specs: Record<string, string> = {};
      for (const row of specsRes.rows) {
        if (row.spec_key && row.spec_value) specs[row.spec_key] = row.spec_value;
      }
      const shopUrls: Record<string, string> = {};
      const shopPrices: Record<string, number> = {};
      for (const row of pricesRes.rows) {
        const key = row.shop_key || row.shop_name;
        if (row.shop_product_url) shopUrls[key] = row.shop_product_url;
        shopPrices[key] = parseFloat(row.current_price);
      }
      return { description, specs, shopUrls, shopPrices };
    } finally {
      client.release();
    }
  } catch {
    return { description: null, specs: {}, shopUrls: {}, shopPrices: {} };
  }
}

export async function GET(_req: NextRequest, { params }: { params: { slug: string } }) {
  const data = loadData();
  const product = data.find(p => toSlug(p.name) === params.slug);
  if (!product) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const [dbData, related] = await Promise.all([
    getDbData(product.name, params.slug),
    Promise.resolve(
      data
        .filter(p => p.category === product.category && p.name !== product.name)
        .slice(0, 6)
        .map(p => ({ ...p, slug: toSlug(p.name) }))
    ),
  ]);

  return NextResponse.json({
    ...product,
    slug: params.slug,
    description: dbData.description,
    specs: dbData.specs,
    shopUrls: dbData.shopUrls,
    shopPrices: dbData.shopPrices,
    related,
  });
}
