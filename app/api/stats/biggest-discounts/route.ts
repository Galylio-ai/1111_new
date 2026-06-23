import { NextResponse } from "next/server";
import { alimentPool, paraPool, retailPool } from "@/lib/db";

export const revalidate = 600;

type Item = {
  name: string;
  catalog: "Supermarché" | "Parapharmacie" | "Retail";
  catalogPath: "/supermarche" | "/parapharmacie" | "/retail";
  slug: string;
  shop: string;
  img: string | null;
  currentPrice: number;
  regularPrice: number;
  discountPct: number;
  saving: number;
};

async function queryCatalog(
  pool: ReturnType<typeof alimentPool>,
  catalog: Item["catalog"],
  catalogPath: Item["catalogPath"]
): Promise<Item[]> {
  try {
    const r = await pool.query<{
      name: string; slug: string; shop: string; img: string | null;
      current_price: string; regular_price: string;
    }>(
      `SELECT p.name,
              p.slug,
              s.name AS shop,
              sp.current_price::text,
              sp.regular_price::text,
              (
                SELECT image_url FROM product_images
                WHERE product_id = p.id AND image_url ~ '^https?://'
                ORDER BY id ASC LIMIT 1
              ) AS img
       FROM shop_prices sp
       JOIN products p ON p.id = sp.product_id
       JOIN shops s ON s.id = sp.shop_id
       WHERE sp.current_price > 0
         AND sp.regular_price > 0
         AND sp.current_price < sp.regular_price
         AND (sp.regular_price - sp.current_price) / sp.regular_price BETWEEN 0.15 AND 0.70
       ORDER BY (sp.regular_price - sp.current_price) / sp.regular_price DESC
       LIMIT 4`
    );
    return r.rows.map((row) => {
      const current = parseFloat(row.current_price);
      const regular = parseFloat(row.regular_price);
      const saving = regular - current;
      const pct = regular > 0 ? Math.round((saving / regular) * 100) : 0;
      return {
        name: row.name,
        catalog,
        catalogPath,
        slug: row.slug,
        shop: row.shop,
        img: row.img,
        currentPrice: current,
        regularPrice: regular,
        discountPct: pct,
        saving,
      };
    });
  } catch {
    return [];
  }
}

export async function GET() {
  const [aliRows, paraRows, retailRows] = await Promise.all([
    queryCatalog(alimentPool(), "Supermarché", "/supermarche"),
    queryCatalog(paraPool(), "Parapharmacie", "/parapharmacie"),
    queryCatalog(retailPool(), "Retail", "/retail"),
  ]);

  const merged = [...aliRows, ...paraRows, ...retailRows]
    .sort((a, b) => b.discountPct - a.discountPct)
    .slice(0, 5);

  return NextResponse.json({ items: merged });
}
