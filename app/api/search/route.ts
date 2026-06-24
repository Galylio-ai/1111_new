import { NextRequest, NextResponse } from "next/server";
import { readFileSync } from "fs";
import path from "path";
import { Pool } from "pg";
import { productCoverImageSql } from "@/lib/productImages";

const pool = new Pool({
  connectionString: process.env.ALIMENTATION_DB_URL,
  max: 5,
});

type Product = {
  id: string;
  slug: string;
  name: string;
  brand: string;
  img: string;
  price: number;
  oldPrice: number;
  store: string;
  rating: number;
  source: "para" | "retail" | "super";
};

type JsonProduct = {
  name: string;
  brand: string;
  img: string;
  minPrice: number;
  maxPrice: number;
  shopNames: string[];
};

let paraCache: JsonProduct[] | null = null;
let retailCache: JsonProduct[] | null = null;

function loadJson(file: string): JsonProduct[] {
  const full = path.join(process.cwd(), file);
  return JSON.parse(readFileSync(full, "utf8"));
}

function slugify(name: string): string {
  return name
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

function searchJson(data: JsonProduct[], q: string, source: "para" | "retail", limit: number): Product[] {
  const ql = q.toLowerCase();
  const matches = ql
    ? data.filter(
        (p) =>
          p.name.toLowerCase().includes(ql) ||
          (p.brand && p.brand.toLowerCase().includes(ql)) ||
          p.shopNames.some((s) => s.toLowerCase().includes(ql))
      )
    : data;
  return matches.slice(0, limit).map((p, i) => {
    const slug = slugify(p.name);
    return {
      id: `${source}-${slug}-${i}`,
      slug,
      name: p.name,
      brand: p.brand || "",
      img: p.img || "",
      price: p.minPrice || 0,
      oldPrice: p.maxPrice || p.minPrice || 0,
      store: p.shopNames[0] || "",
      rating: 4.5 + Math.random() * 0.5,
      source,
    };
  });
}

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const q = (searchParams.get("q") ?? "").trim();
  const limit = Math.min(60, Math.max(1, parseInt(searchParams.get("limit") ?? "20", 10)));
  const perSource = Math.ceil(limit / 3);

  try {
    if (paraCache === null) paraCache = loadJson("app/api/para-products/data.json");
    if (retailCache === null) retailCache = loadJson("app/api/retail-products/data.json");

    const paraItems = searchJson(paraCache, q, "para", perSource);
    const retailItems = searchJson(retailCache, q, "retail", perSource);

    let superItems: Product[] = [];
    const conditions: string[] = [];
    const params: (string | number)[] = [];
    if (q) {
      conditions.push(`(lower(p.name) LIKE $1 OR lower(b.name) LIKE $1)`);
      params.push(`%${q.toLowerCase()}%`);
    }
    const where = conditions.length ? `WHERE ${conditions.join(" AND ")}` : "";
    const sql = `
      SELECT
        p.id,
        p.name,
        COALESCE(b.name, '') AS brand,
        MIN(sp.current_price) AS min_price,
        MAX(sp.current_price) AS max_price,
        ${productCoverImageSql("p.id")} AS img,
        (array_agg(DISTINCT s.name ORDER BY s.name))[1] AS shop_name
      FROM products p
      LEFT JOIN brands b ON b.id = p.brand_id
      JOIN shop_prices sp ON sp.product_id = p.id
      JOIN shops s ON s.id = sp.shop_id
      ${where}
      GROUP BY p.id, p.name, b.name
      ORDER BY COUNT(DISTINCT s.id) DESC, p.id
      LIMIT $${params.length + 1}
    `;
    const superRes = await pool.query(sql, [...params, perSource]);
    superItems = superRes.rows.map((r: { id: number; name: string; brand: string; min_price: string; max_price: string; img: string | null; shop_name: string | null }) => {
      const slug = slugify(r.name);
      return {
        id: `super-${slug}-${r.id}`,
        slug,
        name: r.name,
        brand: r.brand || "",
        img: r.img || "",
        price: parseFloat(r.min_price) || 0,
        oldPrice: parseFloat(r.max_price) || parseFloat(r.min_price) || 0,
        store: r.shop_name || "",
        rating: 4.5 + Math.random() * 0.5,
        source: "super" as const,
      };
    });

    const merged = [...paraItems, ...retailItems, ...superItems].slice(0, limit);
    return NextResponse.json({ total: merged.length, items: merged });
  } catch (err) {
    return NextResponse.json({ error: String(err), items: [] }, { status: 500 });
  }
}
