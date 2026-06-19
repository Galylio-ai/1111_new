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

type ProductWithUrl = Product & { bestUrl: string | null };

let cache: Product[] | null = null;

function loadData(): Product[] {
  if (cache) return cache;
  const file = path.join(process.cwd(), "app/api/para-products/data.json");
  cache = JSON.parse(readFileSync(file, "utf8")) as Product[];
  return cache;
}

const pool = new Pool({ connectionString: process.env.PARA_DB_URL, max: 3 });

async function fetchBestUrls(names: string[]): Promise<Map<string, string>> {
  const result = new Map<string, string>();
  if (names.length === 0) return result;
  try {
    const client = await pool.connect();
    try {
      const { rows } = await client.query<{ name: string; shop_product_url: string }>(
        `SELECT DISTINCT ON (lower(p.name)) lower(p.name) AS name, sp.shop_product_url
         FROM products p
         JOIN shop_prices sp ON sp.product_id = p.id
         WHERE lower(p.name) = ANY($1::text[])
           AND sp.shop_product_url IS NOT NULL
         ORDER BY lower(p.name), sp.current_price ASC`,
        [names.map(n => n.toLowerCase())]
      );
      for (const r of rows) result.set(r.name, r.shop_product_url);
    } finally {
      client.release();
    }
  } catch {
    // DB unavailable: return empty map, cards will fall back to internal slug
  }
  return result;
}

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const page     = Math.max(0, parseInt(searchParams.get("page")  ?? "0", 10));
  const limit    = Math.min(48, Math.max(1, parseInt(searchParams.get("limit") ?? "24", 10)));
  const cat      = (searchParams.get("cat")   ?? "").trim().toLowerCase();
  const q        = (searchParams.get("q")     ?? "").trim().toLowerCase();
  const shop     = (searchParams.get("shop")  ?? "").trim().toLowerCase();

  let data = loadData();

  if (cat)  data = data.filter(p => p.category.toLowerCase().includes(cat));
  if (shop) data = data.filter(p => p.shopNames.some(s => s.toLowerCase().includes(shop)));
  if (q)    data = data.filter(p =>
    p.name.toLowerCase().includes(q) || p.brand.toLowerCase().includes(q)
  );

  const total = data.length;
  const slice = data.slice(page * limit, (page + 1) * limit);
  const urls = await fetchBestUrls(slice.map(p => p.name));
  const items: ProductWithUrl[] = slice.map(p => ({
    ...p,
    bestUrl: urls.get(p.name.toLowerCase()) ?? null,
  }));

  return NextResponse.json({ total, page, limit, items });
}
