import { NextResponse } from "next/server";
import { Pool } from "pg";

const retailPool = new Pool({
  host: "localhost",
  port: 5433,
  user: "retail_user",
  password: "galylio-ai",
  database: "retail_db",
  max: 3,
});

const paraPool = new Pool({
  host: "localhost",
  port: 5434,
  user: "para_user",
  password: "galylio-ai",
  database: "para_db",
  max: 3,
});

export async function GET() {
  try {
    const [retailRes, paraRes] = await Promise.all([
      retailPool.query<{ id: number; name: string; sub_count: string }>(
        `SELECT tc.id, tc.name, COUNT(lc.id)::int AS sub_count
         FROM top_categories tc
         LEFT JOIN low_categories lc ON lc.top_category_id = tc.id
         GROUP BY tc.id, tc.name
         ORDER BY sub_count DESC, tc.name`
      ),
      paraPool.query<{ id: number; name: string; sub_count: string }>(
        `SELECT tc.id, tc.name, COUNT(lc.id)::int AS sub_count
         FROM top_categories tc
         LEFT JOIN low_categories lc ON lc.top_category_id = tc.id
         GROUP BY tc.id, tc.name
         ORDER BY sub_count DESC, tc.name`
      ),
    ]);

    return NextResponse.json({
      retail: retailRes.rows,
      para: paraRes.rows,
    });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
