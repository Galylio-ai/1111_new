import { NextResponse } from "next/server";
import { readFileSync } from "fs";
import path from "path";
import { Pool } from "pg";

const pool = new Pool({
  connectionString: process.env.ALIMENTATION_DB_URL,
  max: 5,
});

let paraCache: number | null = null;
let retailCache: number | null = null;

function countJson(file: string): number {
  const full = path.join(process.cwd(), file);
  const data = JSON.parse(readFileSync(full, "utf8")) as unknown[];
  return data.length;
}

export async function GET() {
  try {
    if (paraCache === null) paraCache = countJson("app/api/para-products/data.json");
    if (retailCache === null) retailCache = countJson("app/api/retail-products/data.json");

    const superRes = await pool.query<{ total: string }>(
      "SELECT COUNT(DISTINCT p.id) AS total FROM products p JOIN shop_prices sp ON sp.product_id = p.id"
    );
    const superCount = parseInt(superRes.rows[0]?.total ?? "0", 10);

    const total = paraCache + retailCache + superCount;

    return NextResponse.json({
      total,
      breakdown: { para: paraCache, retail: retailCache, super: superCount },
    });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
