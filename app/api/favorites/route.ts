import { NextRequest, NextResponse } from "next/server";
import { catalogPool } from "@/lib/db";
import { ensureEngagementSchema } from "@/lib/engagement";
import { getUserId, resolveProductPrice } from "@/lib/engagementAuth";

export const dynamic = "force-dynamic";

// GET /api/favorites — list the signed-in user's saved products.
export async function GET(req: NextRequest) {
  const userId = getUserId(req);
  if (!userId) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  try {
    await ensureEngagementSchema();
    const { rows } = await catalogPool().query(
      `SELECT id, slug, shop_slug, name, img, brand, price, created_at
       FROM user_favorites WHERE user_id = $1 ORDER BY created_at DESC`,
      [userId]
    );
    return NextResponse.json({
      items: rows.map((r) => ({
        id: r.id,
        slug: r.slug,
        shopSlug: r.shop_slug,
        name: r.name,
        img: r.img,
        brand: r.brand,
        price: r.price != null ? parseFloat(r.price) : null,
        createdAt: r.created_at,
      })),
    });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}

// POST /api/favorites { slug, shopSlug? } — add a favorite (snapshot captured now).
export async function POST(req: NextRequest) {
  const userId = getUserId(req);
  if (!userId) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  try {
    const body = await req.json();
    const slug = String(body.slug ?? "").trim();
    if (!slug) return NextResponse.json({ error: "slug required" }, { status: 400 });

    await ensureEngagementSchema();
    const prod = await resolveProductPrice(slug);
    if (!prod) return NextResponse.json({ error: "product not found" }, { status: 404 });

    const { rows } = await catalogPool().query(
      `INSERT INTO user_favorites (user_id, slug, shop_slug, name, img, brand, price)
       VALUES ($1,$2,$3,$4,$5,$6,$7)
       ON CONFLICT (user_id, slug) DO UPDATE
         SET price = EXCLUDED.price, img = EXCLUDED.img, name = EXCLUDED.name
       RETURNING id`,
      [userId, slug, body.shopSlug ?? prod.shopSlug, prod.name, prod.img, prod.brand, prod.price]
    );
    return NextResponse.json({ ok: true, id: rows[0].id });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}

// DELETE /api/favorites?slug=... — remove a favorite.
export async function DELETE(req: NextRequest) {
  const userId = getUserId(req);
  if (!userId) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  try {
    const slug = req.nextUrl.searchParams.get("slug");
    if (!slug) return NextResponse.json({ error: "slug required" }, { status: 400 });
    await ensureEngagementSchema();
    await catalogPool().query(`DELETE FROM user_favorites WHERE user_id = $1 AND slug = $2`, [userId, slug]);
    return NextResponse.json({ ok: true });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
