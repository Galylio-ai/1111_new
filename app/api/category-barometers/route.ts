import { NextResponse } from "next/server";
import { readFileSync } from "fs";
import path from "path";
import { Pool } from "pg";
import { PROMO_REFERENCE_PRICE_SQL } from "@/lib/marketPromoStats";

// Real per-category barometers for the homepage "Baromètres par catégorie".
// Every number is computed from real data — no hardcoded values:
//   • products    — how many products we track in that category
//   • avgDiscount — mean discount % across products currently on promo
//   • topShops    — the 3 shops carrying the most products in that category,
//                   with that product count (used in place of fake star ratings)
export const revalidate = 600;

type JsonProduct = {
  name: string;
  brand: string;
  category: string;
  img: string;
  minPrice: number;
  maxPrice: number;
  shopNames: string[];
  discount: number | null;
};

const fileCache = new Map<string, JsonProduct[]>();
function loadJson(rel: string): JsonProduct[] {
  const cached = fileCache.get(rel);
  if (cached) return cached;
  const file = path.join(process.cwd(), rel);
  const data = JSON.parse(readFileSync(file, "utf8")) as JsonProduct[];
  fileCache.set(rel, data);
  return data;
}

type CatStat = {
  name: string;
  products: number;
  avgDiscount: number; // % across on-promo products
  promoShare: number;  // % of products in this category on promo
  topShops: { name: string; products: number }[];
};

// Aggregate a slice of JSON products into a category stat.
function statFromJson(name: string, rows: JsonProduct[]): CatStat {
  const discounts: number[] = [];
  let promo = 0;
  const shopCount = new Map<string, number>();
  for (const p of rows) {
    if (p.discount != null && p.discount > 0) { discounts.push(p.discount); promo++; }
    for (const s of p.shopNames ?? []) {
      const key = s.trim();
      if (key) shopCount.set(key, (shopCount.get(key) ?? 0) + 1);
    }
  }
  const avgDiscount = discounts.length
    ? Math.round(discounts.reduce((a, b) => a + b, 0) / discounts.length)
    : 0;
  const topShops = [...shopCount.entries()]
    .map(([n, c]) => ({ name: n, products: c }))
    .sort((a, b) => b.products - a.products)
    .slice(0, 3);
  return {
    name,
    products: rows.length,
    avgDiscount,
    promoShare: rows.length ? Math.round((promo / rows.length) * 100) : 0,
    topShops,
  };
}

const aliPool = new Pool({ connectionString: process.env.ALIMENTATION_DB_URL, max: 2 });

// Supermarché (grande distribution) stat straight from the alimentation DB.
async function supermarcheStat(): Promise<CatStat> {
  const client = await aliPool.connect();
  try {
    const agg = await client.query<{ products: string; promos: string; avg_disc: string; price_entries: string }>(`
      WITH priced AS (
        SELECT
          p.id AS product_id,
          sp.current_price,
          (${PROMO_REFERENCE_PRICE_SQL}) AS ref_price
        FROM products p
        JOIN shop_prices sp ON sp.product_id = p.id
        WHERE sp.current_price IS NOT NULL AND sp.current_price > 0
      )
      SELECT
        COUNT(DISTINCT product_id)::int AS products,
        COUNT(*)::int AS price_entries,
        COUNT(CASE WHEN ref_price IS NOT NULL AND ref_price > current_price THEN 1 END)::int AS promos,
        COALESCE(AVG(CASE WHEN ref_price IS NOT NULL AND ref_price > current_price
                           THEN (ref_price - current_price) / ref_price * 100 END), 0)
          ::numeric(10,1) AS avg_disc
      FROM priced
    `);
    const shops = await client.query<{ name: string; products: string }>(`
      SELECT s.name, COUNT(DISTINCT sp.product_id)::int AS products
      FROM shop_prices sp
      JOIN shops s ON s.id = sp.shop_id
      WHERE s.status = 'active'
      GROUP BY s.name
      ORDER BY products DESC
      LIMIT 3
    `);
    const a = agg.rows[0];
    const products = parseInt(a.products, 10) || 0;
    const promos = parseInt(a.promos, 10) || 0;
    const priceEntries = parseInt(a.price_entries, 10) || 0;
    return {
      name: "Supermarché",
      products,
      avgDiscount: Math.round(parseFloat(a.avg_disc) || 0),
      promoShare: priceEntries ? Math.round((promos / priceEntries) * 100) : 0,
      topShops: shops.rows.map((r) => ({ name: r.name.trim(), products: parseInt(r.products, 10) || 0 })),
    };
  } finally {
    client.release();
  }
}

export async function GET() {
  try {
    const retail = loadJson("app/api/retail-products/data.json");
    const para = loadJson("app/api/para-products/data.json");

    const inCat = (rows: JsonProduct[], ...needles: string[]) =>
      rows.filter((p) => {
        const c = (p.category ?? "").toLowerCase();
        return needles.some((n) => c.includes(n));
      });

    // Supermarché needs the DB; if it's unreachable, fall back to an empty stat
    // rather than dropping every (JSON-backed) category.
    const supermarche = await supermarcheStat().catch(
      (): CatStat => ({ name: "Supermarché", products: 0, avgDiscount: 0, promoShare: 0, topShops: [] })
    );

    const categories: CatStat[] = [
      statFromJson("Informatique", inCat(retail, "informatique")),
      statFromJson("Électroménager", inCat(retail, "electromenager", "électroménager")),
      supermarche,
      statFromJson("Beauté & Visage", inCat(para, "visage", "maquillage", "solaire")),
      statFromJson("Cheveux & Soins", inCat(para, "cheveux", "capillaire", "corps", "soin")),
      statFromJson("Bébé & Maman", inCat(para, "bébé", "bebe", "maman")),
    ];

    return NextResponse.json({ categories });
  } catch (err) {
    return NextResponse.json({ error: String(err), categories: [] }, { status: 500 });
  }
}
