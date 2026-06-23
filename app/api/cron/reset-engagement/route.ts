import { NextRequest, NextResponse } from "next/server";
import { resetEngagementSchema } from "@/lib/engagement";

export const dynamic = "force-dynamic";

// GET /api/cron/reset-engagement?key=CRON_SECRET
// One-time maintenance: drops the engagement tables (so an old UUID-typed
// user_id schema is rebuilt as TEXT) and recreates them via the bootstrap.
// Protected by CRON_SECRET. Safe to remove after running once.
function authorized(req: NextRequest): boolean {
  const secret = process.env.CRON_SECRET;
  if (!secret) return false;
  return req.headers.get("x-cron-key") === secret || req.nextUrl.searchParams.get("key") === secret;
}

export async function GET(req: NextRequest) {
  if (!authorized(req)) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  try {
    await resetEngagementSchema(); // drop + recreate with the current (TEXT user_id) schema
    return NextResponse.json({ ok: true, message: "engagement tables reset" });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
