import { NextResponse } from "next/server";
import { Pool } from "pg";

const pool = new Pool({
  connectionString: process.env.ALIMENTATION_DB_URL,
  max: 5,
});

const BASKET_SIZE = 29;
const VEILLE_SIZE = 5;

function formatMillimes(n: number): string {
  return n.toFixed(3);
}

function formatPrice(n: number): string {
  const rounded = Math.round(n);
  return rounded.toLocaleString("fr-FR").replace(/ |,/g, " ");
}

export async function GET() {
  try {
    // 1. Pick the BASKET_SIZE products that appear in the most shops (most universal items)
    const basketProductsRes = await pool.query<{ id: number; name: string }>(
      `SELECT p.id, p.name
       FROM products p
       JOIN shop_prices sp ON sp.product_id = p.id
       GROUP BY p.id, p.name
       ORDER BY COUNT(DISTINCT sp.shop_id) DESC, p.id
       LIMIT $1`,
      [BASKET_SIZE]
    );
    const basketIds = basketProductsRes.rows.map((r) => r.id);

    // 2. For each shop, sum the price of these basket products (use min when shop has duplicates)
    let enseignes: Array<{ name: string; total: number }> = [];
    if (basketIds.length > 0) {
      const basketRes = await pool.query<{ shop: string; total: string; covered: string }>(
        `SELECT s.name AS shop,
                SUM(min_price) AS total,
                COUNT(*)::text AS covered
         FROM (
           SELECT sp.shop_id, sp.product_id, MIN(sp.current_price) AS min_price
           FROM shop_prices sp
           WHERE sp.product_id = ANY($1::int[])
           GROUP BY sp.shop_id, sp.product_id
         ) t
         JOIN shops s ON s.id = t.shop_id
         GROUP BY s.name
         HAVING COUNT(*) >= $2
         ORDER BY total ASC
         LIMIT 6`,
        [basketIds, Math.ceil(basketIds.length * 0.5)]
      );

      enseignes = basketRes.rows.map((r) => ({
        name: r.shop,
        total: parseFloat(r.total) || 0,
      }));
    }

    const cheapest = enseignes[0]?.total ?? 0;
    const mostExpensive = enseignes.length ? enseignes[enseignes.length - 1].total : 0;
    const economy = mostExpensive - cheapest;

    const enseigneList = enseignes.map((e, i) => ({
      name: e.name,
      price: formatPrice(e.total),
      diff: i === 0 ? "Meilleur prix" : `+${formatPrice(e.total - cheapest)} DT`,
      best: i === 0,
    }));

    // 3. Veille: pick VEILLE_SIZE most-universal products and show min current price.
    //    Change% is derived from spread (min vs max) as a proxy — flagged "down" when min < avg.
    const veilleRes = await pool.query<{
      id: number;
      name: string;
      min_price: string;
      max_price: string;
      avg_price: string;
    }>(
      `SELECT p.id, p.name,
              MIN(sp.current_price) AS min_price,
              MAX(sp.current_price) AS max_price,
              AVG(sp.current_price) AS avg_price
       FROM products p
       JOIN shop_prices sp ON sp.product_id = p.id
       GROUP BY p.id, p.name
       HAVING COUNT(DISTINCT sp.shop_id) >= 2
       ORDER BY COUNT(DISTINCT sp.shop_id) DESC, p.id
       LIMIT $1`,
      [VEILLE_SIZE]
    );

    const veille = veilleRes.rows.map((r) => {
      const min = parseFloat(r.min_price) || 0;
      const avg = parseFloat(r.avg_price) || 0;
      const pct = avg > 0 ? Math.round(((min - avg) / avg) * 1000) / 10 : 0;
      const down = pct <= 0;
      return {
        name: r.name,
        price: formatMillimes(min),
        change: `${pct > 0 ? "+" : ""}${pct.toFixed(1)}%`,
        down,
      };
    });

    // 4. Cheapest "Lait 1/2 écrémé" (slug: lait-1-2-ecreme) for the price-alert card.
    //    Find the product whose slug matches, then return the cheapest shop offer.
    const TARGET_SLUG = "lait-1-2-ecreme";
    const slugify = (s: string) =>
      s
        .toLowerCase()
        .normalize("NFD")
        .replace(/[̀-ͯ]/g, "")
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-|-$/g, "");

    const candidates = await pool.query<{ id: number; name: string }>(
      `SELECT id, name FROM products WHERE lower(name) LIKE '%lait%'`
    );
    const target = candidates.rows.find((r) => slugify(r.name) === TARGET_SLUG);

    let milkRes: { rows: Array<{ name: string; brand: string; shop: string; min_price: string; max_price: string; avg_price: string; img: string | null }> } = { rows: [] };
    if (target) {
      milkRes = await pool.query(
        `SELECT p.name,
                COALESCE(b.name, '') AS brand,
                s.name AS shop,
                sp.current_price AS min_price,
                (SELECT MAX(sp2.current_price) FROM shop_prices sp2 WHERE sp2.product_id = p.id) AS max_price,
                (SELECT AVG(sp2.current_price) FROM shop_prices sp2 WHERE sp2.product_id = p.id) AS avg_price,
                (SELECT image_url FROM product_images WHERE product_id = p.id LIMIT 1) AS img
         FROM products p
         LEFT JOIN brands b ON b.id = p.brand_id
         JOIN shop_prices sp ON sp.product_id = p.id
         JOIN shops s ON s.id = sp.shop_id
         WHERE p.id = $1
         ORDER BY sp.current_price ASC
         LIMIT 1`,
        [target.id]
      );
    }

    let alert: {
      name: string;
      brand: string;
      shop: string;
      price: string;
      oldPrice: string;
      change: string;
      down: boolean;
      saved: string;
      min: string;
      max: string;
      slug: string;
      href: string;
      img: string | null;
    } | null = null;

    if (milkRes.rows.length > 0) {
      const r = milkRes.rows[0];
      const min = parseFloat(r.min_price) || 0;
      const max = parseFloat(r.max_price) || min;
      const avg = parseFloat(r.avg_price) || min;
      const pct = avg > 0 ? ((min - avg) / avg) * 100 : 0;
      const saved = avg - min;
      alert = {
        name: r.name,
        brand: r.brand,
        shop: r.shop,
        price: formatMillimes(min),
        oldPrice: formatMillimes(avg),
        change: `${pct > 0 ? "+" : ""}${pct.toFixed(1)}%`,
        down: pct <= 0,
        saved: formatMillimes(Math.max(saved, 0)),
        min: formatMillimes(min),
        max: formatMillimes(max),
        slug: TARGET_SLUG,
        href: `/supermarche/${TARGET_SLUG}`,
        img: r.img ?? null,
      };
    }

    return NextResponse.json({
      enseignes: enseigneList,
      basketSize: basketIds.length,
      economy: formatPrice(economy),
      veille,
      alert,
    });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
