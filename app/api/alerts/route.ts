import { NextRequest, NextResponse } from "next/server";
import { catalogPool } from "@/lib/db";
import { ensureEngagementSchema } from "@/lib/engagement";
import { getUserId, getUserEmail, resolveProductPrice } from "@/lib/engagementAuth";

export const dynamic = "force-dynamic";

// GET /api/alerts — list the signed-in user's price-drop alerts.
export async function GET(req: NextRequest) {
  const userId = getUserId(req);
  if (!userId) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  try {
    await ensureEngagementSchema();
    const { rows } = await catalogPool().query(
      `SELECT id, slug, shop_slug, name, img, brand, baseline_price, last_price,
              active, created_at, last_notified_at
       FROM user_alerts WHERE user_id = $1 ORDER BY created_at DESC`,
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
        baselinePrice: r.baseline_price != null ? parseFloat(r.baseline_price) : null,
        lastPrice: r.last_price != null ? parseFloat(r.last_price) : null,
        active: r.active,
        createdAt: r.created_at,
        lastNotifiedAt: r.last_notified_at,
      })),
    });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}

// POST /api/alerts { slug, shopSlug?, email?, fullName? } — watch a product for a price drop.
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
      `INSERT INTO user_alerts
         (user_id, email, full_name, slug, shop_slug, name, img, brand, baseline_price, last_price)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$9)
       ON CONFLICT (user_id, slug) DO UPDATE
         SET active = true, email = EXCLUDED.email, full_name = EXCLUDED.full_name,
             baseline_price = EXCLUDED.baseline_price, last_price = EXCLUDED.last_price,
             name = EXCLUDED.name, img = EXCLUDED.img
       RETURNING id`,
      [userId, body.email ?? getUserEmail(req) ?? null, body.fullName ?? null, slug,
       body.shopSlug ?? prod.shopSlug, prod.name, prod.img, prod.brand, prod.price]
    );
    return NextResponse.json({ ok: true, id: rows[0].id, baselinePrice: prod.price });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}

// DELETE /api/alerts?slug=... — stop watching a product.
export async function DELETE(req: NextRequest) {
  const userId = getUserId(req);
  if (!userId) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  try {
    const slug = req.nextUrl.searchParams.get("slug");
    if (!slug) return NextResponse.json({ error: "slug required" }, { status: 400 });
    await ensureEngagementSchema();
    await catalogPool().query(`DELETE FROM user_alerts WHERE user_id = $1 AND slug = $2`, [userId, slug]);
    return NextResponse.json({ ok: true });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
