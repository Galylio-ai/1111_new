import { NextRequest, NextResponse } from "next/server";
import { fetchCompareProduct } from "@/lib/compareProduct";

export async function GET(
  _req: NextRequest,
  { params }: { params: { slug: string } },
) {
  try {
    const product = await fetchCompareProduct(params.slug);
    if (!product) return NextResponse.json({ error: "not found" }, { status: 404 });
    return NextResponse.json(product);
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
