import { NextRequest, NextResponse } from "next/server";
import { searchCompareProducts } from "@/lib/compareProduct";
import { normalizeSearchText } from "@/lib/productSearch";

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const q = normalizeSearchText(searchParams.get("q") ?? "");
  const limit = Math.min(20, Math.max(1, parseInt(searchParams.get("limit") ?? "10", 10)));

  if (q.length < 2) return NextResponse.json({ items: [] });

  try {
    const items = await searchCompareProducts(q, limit);
    return NextResponse.json({ items });
  } catch (err) {
    return NextResponse.json({ error: String(err), items: [] }, { status: 500 });
  }
}
