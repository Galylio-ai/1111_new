import { NextResponse } from "next/server";
import { CATALOGS } from "@/lib/db";

export const revalidate = 300;

export async function GET() {
  try {
    const counts = await Promise.all(
      CATALOGS.map(async (cat) => {
        try {
          const r = await cat.getPool().query<{ total: string }>(
            "SELECT COUNT(DISTINCT p.id) AS total FROM products p JOIN shop_prices sp ON sp.product_id = p.id"
          );
          return { key: cat.key, label: cat.label, total: parseInt(r.rows[0]?.total ?? "0", 10) };
        } catch {
          return { key: cat.key, label: cat.label, total: 0 };
        }
      }),
    );

    const total = counts.reduce((s, c) => s + c.total, 0);
    const breakdown = Object.fromEntries(counts.map(c => [c.key, c.total]));

    return NextResponse.json({ total, breakdown });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
