import { NextRequest, NextResponse } from "next/server";
import { FEATURED_SCOPE_IDS } from "@/lib/priceRankings";
import { attachCatalog, getFeaturedRankings, getRankingBySlug } from "@/lib/priceRankingsServer";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const slug = req.nextUrl.searchParams.get("slug");
  const featured = req.nextUrl.searchParams.get("featured") === "1";

  try {
    if (slug) {
      const data = await getRankingBySlug(slug, 50);
      if (!data) {
        return NextResponse.json({ error: "Catégorie introuvable" }, { status: 404 });
      }
      return NextResponse.json(data);
    }

    const scopes = await getFeaturedRankings(featured ? 3 : 50);
    const filtered = featured
      ? attachCatalog(scopes.filter((s) => FEATURED_SCOPE_IDS.has(s.scope_id)))
      : scopes;

    return NextResponse.json({ scopes: filtered });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
