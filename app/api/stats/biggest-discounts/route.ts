import { NextResponse } from "next/server";
import { retailPool } from "@/lib/db";

export const revalidate = 600;

type Item = {
  name: string;
  catalog: "Retail";
  catalogPath: "/retail";
  slug: string;
  shop: string;
  img: string | null;
  currentPrice: number;
  regularPrice: number;
  discountPct: number;
  saving: number;
};

// Only trusted shop image hosts (retail informatique stores)
const RETAIL_IMG_WHITELIST = `
  image_url ~ '^https?://'
  AND (
    image_url ILIKE 'https://www.tunisianet.com.tn/%'
    OR image_url ILIKE 'https://www.mytek.tn/%'
    OR image_url ILIKE 'https://spacenet.tn/%'
    OR image_url ILIKE 'https://agora.tn/%'
    OR image_url ILIKE 'https://www.sbsinformatique.com/%'
  )
`;

// Informatique keywords — narrows to PCs, laptops, printers, monitors, components
const INFO_KEYWORDS = `(
  lower(p.name) ~ '\\m(pc|laptop|portable|ordinateur|notebook)\\M'
  OR lower(p.name) ~ '\\m(imprimante|imprimantes|printer)\\M'
  OR lower(p.name) ~ '\\m(écran|ecran|moniteur|monitor)\\M'
  OR lower(p.name) ~ '\\m(clavier|souris|webcam|casque|écouteur|ecouteur)\\M'
  OR lower(p.name) ~ '\\m(ssd|disque dur|hdd|nvme|ram|barrette)\\M'
  OR lower(p.name) ~ '\\m(carte graphique|gpu|cpu|processeur|carte mère|carte mere|alimentation pc)\\M'
  OR lower(p.name) ~ '\\m(routeur|router|switch|onduleur|ups)\\M'
)`;

export async function GET() {
  try {
    const pool = retailPool();
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
                WHERE product_id = p.id AND ${RETAIL_IMG_WHITELIST}
                ORDER BY id ASC LIMIT 1
              ) AS img
       FROM shop_prices sp
       JOIN products p ON p.id = sp.product_id
       JOIN shops s ON s.id = sp.shop_id
       WHERE sp.current_price > 0
         AND sp.regular_price > 0
         AND sp.current_price < sp.regular_price
         AND (sp.regular_price - sp.current_price) / sp.regular_price BETWEEN 0.05 AND 0.60
         AND sp.current_price >= 100
         AND ${INFO_KEYWORDS}
         AND EXISTS (
           SELECT 1 FROM product_images
           WHERE product_id = p.id AND ${RETAIL_IMG_WHITELIST}
         )
       ORDER BY (sp.regular_price - sp.current_price) DESC
       LIMIT 5`
    );

    const items: Item[] = r.rows.map((row) => {
      const current = parseFloat(row.current_price);
      const regular = parseFloat(row.regular_price);
      const saving = regular - current;
      const pct = regular > 0 ? Math.round((saving / regular) * 100) : 0;
      return {
        name: row.name,
        catalog: "Retail",
        catalogPath: "/retail",
        slug: row.slug,
        shop: row.shop,
        img: row.img,
        currentPrice: current,
        regularPrice: regular,
        discountPct: pct,
        saving,
      };
    });

    return NextResponse.json({ items });
  } catch (err) {
    return NextResponse.json({ items: [], error: String(err) }, { status: 200 });
  }
}
