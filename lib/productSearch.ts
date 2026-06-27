import { Pool } from "pg";
import { productCoverImageSql } from "@/lib/productImages";

export type SearchProduct = {
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

const SKU_SPEC_KEYS = ["gtin", "sku", "reference", "normalized_sku", "ean", "barcode"];

export { SKU_SPEC_KEYS };

export function normalizeSearchText(q: string): string {
  return q.trim().replace(/\s+/g, " ");
}

export function slugifySearch(q: string): string {
  return normalizeSearchText(q)
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

function coverImageSql(source: "para" | "retail" | "super"): string {
  if (source === "super") return productCoverImageSql("p.id");
  return `(SELECT pi.image_url FROM product_images pi WHERE pi.product_id = p.id ORDER BY pi.id ASC LIMIT 1)`;
}

type DbRow = {
  id: number;
  name: string;
  slug: string;
  brand: string;
  min_price: string;
  max_price: string;
  img: string | null;
  shop_name: string | null;
};

function mapRow(row: DbRow, source: "para" | "retail" | "super"): SearchProduct {
  const min = parseFloat(row.min_price) || 0;
  const max = parseFloat(row.max_price) || min;
  return {
    id: `${source}-${row.slug}-${row.id}`,
    slug: row.slug,
    name: row.name,
    brand: row.brand || "",
    img: row.img || "",
    price: min,
    oldPrice: max,
    store: row.shop_name || "",
    rating: 4.5,
    source,
  };
}

export async function searchProductsInPool(
  pool: Pool,
  source: "para" | "retail" | "super",
  rawQuery: string,
  limit: number,
): Promise<SearchProduct[]> {
  const q = normalizeSearchText(rawQuery);
  const imgSql = coverImageSql(source);

  if (!q) {
    const { rows } = await pool.query<DbRow>(
      `
      SELECT
        p.id, p.name, p.slug,
        COALESCE(b.name, '') AS brand,
        MIN(sp.current_price) AS min_price,
        MAX(sp.current_price) AS max_price,
        ${imgSql} AS img,
        (array_agg(DISTINCT s.name ORDER BY s.name))[1] AS shop_name
      FROM products p
      LEFT JOIN brands b ON b.id = p.brand_id
      JOIN shop_prices sp ON sp.product_id = p.id
      JOIN shops s ON s.id = sp.shop_id
      GROUP BY p.id, p.name, p.slug, b.name
      ORDER BY COUNT(DISTINCT s.id) DESC, p.id DESC
      LIMIT $1
      `,
      [limit],
    );
    return rows.map((r) => mapRow(r, source));
  }

  const qLower = q.toLowerCase();
  const slugQ = slugifySearch(q);
  const like = `%${qLower}%`;
  const prefix = `${qLower}%`;

  const { rows } = await pool.query<DbRow>(
    `
    SELECT
      p.id, p.name, p.slug,
      COALESCE(b.name, '') AS brand,
      MIN(sp.current_price) AS min_price,
      MAX(sp.current_price) AS max_price,
      ${imgSql} AS img,
      (array_agg(DISTINCT s.name ORDER BY s.name))[1] AS shop_name,
      MIN(
        CASE
          WHEN lower(regexp_replace(trim(p.name), '\\s+', ' ', 'g')) = $1 THEN 0
          WHEN lower(coalesce(p.source_product_id, '')) = $1 THEN 1
          WHEN lower(p.slug) = $2 THEN 2
          WHEN EXISTS (
            SELECT 1 FROM product_specs ps
            WHERE ps.product_id = p.id
              AND lower(ps.spec_value) = $1
          ) THEN 3
          WHEN lower(p.name) LIKE $5 THEN 4
          WHEN lower(p.name) LIKE $3 THEN 5
          WHEN lower(coalesce(b.name, '')) LIKE $3 THEN 6
          WHEN lower(coalesce(p.source_product_id, '')) LIKE $3 THEN 7
          WHEN EXISTS (
            SELECT 1 FROM product_specs ps
            WHERE ps.product_id = p.id
              AND ps.spec_key = ANY($4::text[])
              AND lower(ps.spec_value) LIKE $3
          ) THEN 8
          ELSE 9
        END
      ) AS relevance
    FROM products p
    LEFT JOIN brands b ON b.id = p.brand_id
    JOIN shop_prices sp ON sp.product_id = p.id
    JOIN shops s ON s.id = sp.shop_id
    WHERE (
      lower(regexp_replace(trim(p.name), '\\s+', ' ', 'g')) = $1
      OR lower(coalesce(p.source_product_id, '')) = $1
      OR lower(p.slug) = $2
      OR lower(p.name) LIKE $3
      OR lower(coalesce(b.name, '')) LIKE $3
      OR lower(coalesce(p.source_product_id, '')) LIKE $3
      OR EXISTS (
        SELECT 1 FROM product_specs ps
        WHERE ps.product_id = p.id
          AND (
            lower(ps.spec_value) = $1
            OR (ps.spec_key = ANY($4::text[]) AND lower(ps.spec_value) LIKE $3)
          )
      )
    )
    GROUP BY p.id, p.name, p.slug, b.name
    ORDER BY relevance ASC, length(p.name) ASC, p.name ASC
    LIMIT $6
    `,
    [qLower, slugQ, like, SKU_SPEC_KEYS, prefix, limit],
  );

  return rows.map((r) => mapRow(r, source));
}

export function rankSearchResults(items: SearchProduct[], rawQuery: string): SearchProduct[] {
  const q = normalizeSearchText(rawQuery).toLowerCase();
  const slugQ = slugifySearch(rawQuery);

  const score = (p: SearchProduct) => {
    const name = normalizeSearchText(p.name).toLowerCase();
    if (name === q) return 0;
    if (p.slug === slugQ) return 1;
    if (name.startsWith(q)) return 2;
    if (name.includes(q)) return 3;
    return 4;
  };

  return [...items].sort((a, b) => {
    const d = score(a) - score(b);
    if (d !== 0) return d;
    return a.name.length - b.name.length;
  });
}
