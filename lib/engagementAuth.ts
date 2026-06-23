import { NextRequest } from "next/server";
import jwt from "jsonwebtoken";
import { catalogPool } from "@/lib/db";

// The frontend sends the auth-service access token (HS256, signed with the same
// JWT_SECRET the gateway uses) as `Authorization: Bearer <token>`. We verify it
// locally to identify the user — no round-trip to the backend needed.
type JwtPayload = { sub: string; role?: string; jti?: string };

export function getUserId(req: NextRequest): string | null {
  const auth = req.headers.get("authorization");
  if (!auth?.startsWith("Bearer ")) return null;
  const token = auth.slice(7);
  const secret = process.env.JWT_SECRET;
  if (!secret) return null;
  try {
    const payload = jwt.verify(token, secret, { algorithms: ["HS256"] }) as JwtPayload;
    return payload.sub ?? null;
  } catch {
    return null;
  }
}

// Best (lowest) current price for a product slug across all shops that carry it,
// plus a representative listing for display. Used by alerts + the cron checker.
export type ProductPrice = {
  slug: string;
  name: string;
  brand: string;
  img: string;
  shopSlug: string | null;
  price: number | null;
};

export async function resolveProductPrice(slug: string): Promise<ProductPrice | null> {
  const { rows } = await catalogPool().query(
    `SELECT p.slug, p.name, p.brand, p.image, p.price, s.slug AS shop_slug
     FROM products p
     JOIN shops s ON s.id = p.shop_id
     WHERE p.slug = $1
     ORDER BY p.price ASC NULLS LAST
     LIMIT 1`,
    [slug]
  );
  if (!rows.length) return null;
  const r = rows[0];
  return {
    slug: r.slug,
    name: r.name,
    brand: r.brand ?? "",
    img: r.image ?? "",
    shopSlug: r.shop_slug ?? null,
    price: r.price != null ? parseFloat(r.price) : null,
  };
}
