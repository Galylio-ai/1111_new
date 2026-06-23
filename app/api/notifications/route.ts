import { NextRequest, NextResponse } from "next/server";
import { catalogPool } from "@/lib/db";
import { ensureEngagementSchema } from "@/lib/engagement";
import { getUserId } from "@/lib/engagementAuth";

export const dynamic = "force-dynamic";

// GET /api/notifications — list notifications + unread count for the navbar bell.
export async function GET(req: NextRequest) {
  const userId = getUserId(req);
  if (!userId) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  try {
    await ensureEngagementSchema();
    const pool = catalogPool();
    const [list, unread] = await Promise.all([
      pool.query(
        `SELECT id, type, title, body, slug, shop_slug, img, old_price, new_price, read, created_at
         FROM user_notifications WHERE user_id = $1 ORDER BY created_at DESC LIMIT 50`,
        [userId]
      ),
      pool.query(`SELECT COUNT(*)::int AS n FROM user_notifications WHERE user_id = $1 AND read = false`, [userId]),
    ]);
    return NextResponse.json({
      unread: unread.rows[0].n,
      items: list.rows.map((r) => ({
        id: r.id,
        type: r.type,
        title: r.title,
        body: r.body,
        slug: r.slug,
        shopSlug: r.shop_slug,
        img: r.img,
        oldPrice: r.old_price != null ? parseFloat(r.old_price) : null,
        newPrice: r.new_price != null ? parseFloat(r.new_price) : null,
        read: r.read,
        createdAt: r.created_at,
      })),
    });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}

// PATCH /api/notifications { id? } — mark one (id) or all (no id) as read.
export async function PATCH(req: NextRequest) {
  const userId = getUserId(req);
  if (!userId) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  try {
    const body = await req.json().catch(() => ({}));
    await ensureEngagementSchema();
    if (body.id) {
      await catalogPool().query(
        `UPDATE user_notifications SET read = true WHERE user_id = $1 AND id = $2`,
        [userId, body.id]
      );
    } else {
      await catalogPool().query(
        `UPDATE user_notifications SET read = true WHERE user_id = $1 AND read = false`,
        [userId]
      );
    }
    return NextResponse.json({ ok: true });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}

// DELETE /api/notifications?id=...  (or no id = clear all)
export async function DELETE(req: NextRequest) {
  const userId = getUserId(req);
  if (!userId) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  try {
    const id = req.nextUrl.searchParams.get("id");
    await ensureEngagementSchema();
    if (id) {
      await catalogPool().query(`DELETE FROM user_notifications WHERE user_id = $1 AND id = $2`, [userId, id]);
    } else {
      await catalogPool().query(`DELETE FROM user_notifications WHERE user_id = $1`, [userId]);
    }
    return NextResponse.json({ ok: true });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
