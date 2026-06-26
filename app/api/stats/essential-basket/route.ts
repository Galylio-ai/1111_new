import { NextResponse } from "next/server";
import { getEssentialBasketData, getQoffaBasketItems } from "@/lib/essentialBasket";

export const dynamic = "force-static";
export const revalidate = 3600;

export async function GET() {
  const data = getEssentialBasketData();
  const qoffaItems = getQoffaBasketItems();
  return NextResponse.json(
    { ...data, qoffaItems },
    {
      headers: {
        "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400",
      },
    }
  );
}
