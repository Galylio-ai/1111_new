import { NextResponse } from "next/server";
import { Pool } from "pg";

const pool = new Pool({
  connectionString: process.env.RETAIL_DB_URL,
  max: 3,
});

function formatPrice(n: number): string {
  return Math.round(n).toLocaleString("fr-FR").replace(/ /g, " ");
}

export async function GET() {
  try {
    // Find a climatiseur where one shop advertises a huge "regular_price → current_price" drop,
    // but the *real* market floor (min current_price across all shops) is at or below that "discounted" price.
    // The illogical signal: the shop's claimed discount is much larger than the true market discount.
    const { rows } = await pool.query<{
      product_id: number;
      name: string;
      slug: string;
      shop: string;
      shop_product_url: string;
      current_price: string;
      regular_price: string;
      market_min: string;
      market_max: string;
      img: string | null;
    }>(`
      WITH market AS (
        SELECT product_id,
               MIN(current_price) AS market_min,
               MAX(current_price) AS market_max
        FROM shop_prices
        GROUP BY product_id
      )
      SELECT p.id AS product_id,
             p.name,
             p.slug,
             s.name AS shop,
             sp.shop_product_url,
             sp.current_price,
             sp.regular_price,
             m.market_min,
             m.market_max,
             (
               SELECT image_url
               FROM product_images
               WHERE product_id = p.id
                 AND image_url NOT LIKE '%loading%'
                 AND image_url NOT LIKE '%placeholder%'
                 AND image_url NOT LIKE '%home_default%'
               ORDER BY
                 CASE
                   WHEN image_url ILIKE '%.webp' THEN 1
                   WHEN image_url ILIKE '%.jpg'  THEN 2
                   WHEN image_url ILIKE '%.jpeg' THEN 2
                   WHEN image_url ILIKE '%.png'  THEN 3
                   ELSE 9
                 END
               LIMIT 1
             ) AS img
      FROM products p
      JOIN shop_prices sp ON sp.product_id = p.id
      JOIN shops s ON s.id = sp.shop_id
      JOIN market m ON m.product_id = p.id
      WHERE (
              lower(p.name) LIKE '%refrigerateur%'
           OR lower(p.name) LIKE '%réfrigérateur%'
           OR lower(p.name) LIKE '%frigo%'
        )
        AND sp.regular_price IS NOT NULL
        AND sp.regular_price > sp.current_price
        AND sp.regular_price > m.market_min * 1.3
      ORDER BY (sp.regular_price - m.market_min) DESC
      LIMIT 1
    `);

    if (rows.length === 0) {
      return NextResponse.json({ promo: null });
    }

    const r = rows[0];
    const current = parseFloat(r.current_price);
    const regular = parseFloat(r.regular_price);
    const marketMin = parseFloat(r.market_min);
    const claimedDiscount = regular - current;
    const realDiscount = Math.max(0, marketMin - current); // negative ⇒ this shop is *more expensive* than the market floor

    return NextResponse.json({
      promo: {
        productId: r.product_id,
        name: r.name,
        slug: r.slug,
        shop: r.shop,
        shopProductUrl: r.shop_product_url,
        img: r.img,
        currentPrice: formatPrice(current),
        regularPrice: formatPrice(regular),
        marketMin: formatPrice(marketMin),
        marketMax: formatPrice(parseFloat(r.market_max)),
        claimedDiscount: formatPrice(claimedDiscount),
        realDiscount: formatPrice(realDiscount),
        currentPriceRaw: current,
        marketMinRaw: marketMin,
        href: `/retail/${r.slug}`,
      },
    });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
