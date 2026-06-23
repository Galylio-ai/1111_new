import { NextRequest, NextResponse } from "next/server";
import { catalogPool } from "@/lib/db";
import { ensureEngagementSchema } from "@/lib/engagement";
import { resolveProductPrice } from "@/lib/engagementAuth";
import { priceDropEmail, sendEmail } from "@/lib/mailer";

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

    // Price DROP detected: current strictly lower than baseline.
    if (baseline != null && current < baseline - 0.0001) {
      dropped++;
      const productUrl = a.shop_slug
        ? `${SITE_URL}/boutiques/${a.shop_slug}/${a.slug}`
        : `${SITE_URL}/comparaison?a=${encodeURIComponent(a.slug)}`;

      // 1) Notification (profile + navbar bell)
      await pool.query(
        `INSERT INTO user_notifications
           (user_id, type, title, body, slug, shop_slug, img, old_price, new_price)
         VALUES ($1,'price_drop',$2,$3,$4,$5,$6,$7,$8)`,
        [
          a.user_id,
          `Baisse de prix : ${a.name}`,
          `Le prix est passé de ${baseline.toLocaleString("fr-FR")} DT à ${current.toLocaleString("fr-FR")} DT.`,
          a.slug, a.shop_slug, a.img, baseline, current,
        ]
      );

      // 2) Email (French)
      if (a.email) {
        const { subject, html } = priceDropEmail({
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

      // 3) Reset baseline to the new (lower) price so we don't re-notify until
      //    it drops again.
      await pool.query(
        `UPDATE user_alerts
         SET baseline_price = $2, last_price = $2, last_checked_at = $3, last_notified_at = $3
         WHERE id = $1`,
        [a.id, current, now]
      );
    } else {
      // No drop. If price went UP, raise the baseline so a later dip from the
      // new high still counts as a drop.
      const newBaseline = baseline == null ? current : Math.max(baseline, current);
      await pool.query(
        `UPDATE user_alerts SET last_price = $2, baseline_price = $3, last_checked_at = $4 WHERE id = $1`,
        [a.id, current, newBaseline, now]
      );
    }
  }

  return { checked, dropped, emailed };
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
