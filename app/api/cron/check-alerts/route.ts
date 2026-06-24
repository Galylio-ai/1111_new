import { NextRequest, NextResponse } from "next/server";
import { catalogPool } from "@/lib/db";
import { ensureEngagementSchema } from "@/lib/engagement";
import { resolveProductPrice } from "@/lib/engagementAuth";
import { priceChangeEmail, sendEmail } from "@/lib/mailer";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

// GET/POST /api/cron/check-alerts
// Protected by a shared secret (CRON_SECRET) sent as `x-cron-key` header or
// `?key=`. For every active alert, compare the product's current best price
// against the stored baseline; on a DROP, create a notification, email the user
// (French), and reset the baseline so they're only notified once per drop.

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://production.1111.tn";

function authorized(req: NextRequest): boolean {
  const secret = process.env.CRON_SECRET;
  if (!secret) return false; // must be configured
  const headerKey = req.headers.get("x-cron-key");
  const queryKey = req.nextUrl.searchParams.get("key");
  return headerKey === secret || queryKey === secret;
}

async function run() {
  await ensureEngagementSchema();
  const pool = catalogPool();

  const { rows: alerts } = await pool.query(
    `SELECT id, user_id, email, full_name, slug, shop_slug, name, img, baseline_price
     FROM user_alerts WHERE active = true`
  );

  let checked = 0;
  let dropped = 0;
  let raised = 0;
  let emailed = 0;

  for (const a of alerts) {
    checked++;
    const prod = await resolveProductPrice(a.slug);
    const now = new Date();

    // Always record we checked + the latest price seen.
    const current = prod?.price ?? null;

    if (current == null) {
      await pool.query(`UPDATE user_alerts SET last_checked_at = $2, last_price = NULL WHERE id = $1`, [a.id, now]);
      continue;
    }

    const baseline = a.baseline_price != null ? parseFloat(a.baseline_price) : null;

    // No baseline yet (first scan) — just seed it.
    if (baseline == null) {
      await pool.query(
        `UPDATE user_alerts SET last_price = $2, baseline_price = $2, last_checked_at = $3 WHERE id = $1`,
        [a.id, current, now]
      );
      continue;
    }

    const diff = current - baseline;
    const direction: "drop" | "rise" | "same" =
      diff < -0.0001 ? "drop" : diff > 0.0001 ? "rise" : "same";

    if (direction === "same") {
      await pool.query(
        `UPDATE user_alerts SET last_price = $2, last_checked_at = $3 WHERE id = $1`,
        [a.id, current, now]
      );
      continue;
    }

    const productUrl = a.shop_slug
      ? `${SITE_URL}/boutiques/${a.shop_slug}/${a.slug}`
      : `${SITE_URL}/comparaison?a=${encodeURIComponent(a.slug)}`;

    const isDrop = direction === "drop";
    if (isDrop) dropped++;
    else raised++;

    const title = isDrop ? `Baisse de prix : ${a.name}` : `Hausse de prix : ${a.name}`;
    const body = `Le prix est passé de ${baseline.toLocaleString("fr-FR")} DT à ${current.toLocaleString("fr-FR")} DT.`;

    // 1) In-app notification
    await pool.query(
      `INSERT INTO user_notifications
         (user_id, type, title, body, slug, shop_slug, img, old_price, new_price)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)`,
      [
        a.user_id,
        isDrop ? "price_drop" : "price_rise",
        title,
        body,
        a.slug, a.shop_slug, a.img, baseline, current,
      ]
    );

    // 2) Email (French — drop or rise variant)
    if (a.email) {
      const { subject, html } = priceChangeEmail({
        kind: isDrop ? "drop" : "rise",
        fullName: a.full_name,
        productName: a.name,
        oldPrice: baseline,
        newPrice: current,
        img: a.img,
        productUrl,
      });
      const ok = await sendEmail(a.email, subject, html);
      if (ok) emailed++;
    }

    // 3) Update baseline to the new price so we don't re-notify until it
    //    changes again (in either direction).
    await pool.query(
      `UPDATE user_alerts
       SET baseline_price = $2, last_price = $2, last_checked_at = $3, last_notified_at = $3
       WHERE id = $1`,
      [a.id, current, now]
    );
  }

  return { checked, dropped, raised, emailed };
}

export async function GET(req: NextRequest) {
  if (!authorized(req)) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  try {
    return NextResponse.json({ ok: true, ...(await run()) });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  return GET(req);
}
