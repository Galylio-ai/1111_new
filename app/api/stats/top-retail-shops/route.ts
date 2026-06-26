import { NextResponse } from "next/server";
import { readFileSync } from "fs";
import path from "path";

type Product = {
  name: string;
  brand: string;
  category: string;
  img: string;
  minPrice: number;
  maxPrice: number;
  shopNames: string[];
  discount: number | null;
};

type ShopRow = {
  shop: string;
  displayName: string;
  logo: string | null;
  totalProducts: number;
  similarProducts: number;
  cheapestCount: number;
};

const DISPLAY_NAMES: Record<string, string> = {
  tunisianet: "Tunisianet",
  mytek: "Mytek",
  spacenet: "Spacenet",
  megapc: "MegaPC",
  sbs: "SBS Informatique",
  agora: "Agora",
  wiki: "Wiki",
  jumbo: "Jumbo",
  zoom: "Zoom",
  fnac: "Fnac",
  scoop: "Scoop",
  primini: "Primini",
};

const LOGO_FILES: Record<string, string> = {
  tunisianet: "/shop-logos/tunisianet.jpg",
  mytek: "/shop-logos/mytek.png",
  spacenet: "/shop-logos/spacenet.svg",
  megapc: "/shop-logos/megapc.png",
  sbs: "/shop-logos/sbs.png",
  agora: "/shop-logos/agora.png",
  wiki: "/shop-logos/wiki.png",
  jumbo: "/shop-logos/jumbo.jpg",
  zoom: "/shop-logos/zoom.jpg",
  scoop: "/shop-logos/scoop.png",
};

function pretty(key: string): string {
  return DISPLAY_NAMES[key.toLowerCase()] ?? key.charAt(0).toUpperCase() + key.slice(1);
}

let cache: ShopRow[] | null = null;

function compute(): ShopRow[] {
  if (cache) return cache;

  const file = path.join(process.cwd(), "app/api/retail-products/data.json");
  const products = JSON.parse(readFileSync(file, "utf8")) as Product[];

  // Pass 1: per-shop totals + cheapest count, to pick the top 5.
  const agg: Record<string, { total: number; cheapest: number }> = {};
  for (const p of products) {
    if (!Array.isArray(p.shopNames) || p.shopNames.length === 0) continue;
    const cheapest = p.shopNames[0];
    for (const shop of p.shopNames) {
      if (!agg[shop]) agg[shop] = { total: 0, cheapest: 0 };
      agg[shop].total += 1;
      if (shop === cheapest) agg[shop].cheapest += 1;
    }
  }

  // Top 5 by number of products where the shop offers the best price.
  const top5 = Object.entries(agg)
    .sort((a, b) => b[1].cheapest - a[1].cheapest)
    .slice(0, 5)
    .map(([shop]) => shop);
  const top5Set = new Set(top5);

  // Pass 2: "similar" = products this shop carries that are ALSO sold by at
  // least one OTHER top-5 shop.
  const similar: Record<string, number> = {};
  for (const shop of top5) similar[shop] = 0;

  for (const p of products) {
    if (!Array.isArray(p.shopNames) || p.shopNames.length === 0) continue;
    const top5Carriers = p.shopNames.filter((s) => top5Set.has(s));
    if (top5Carriers.length < 2) continue;
    for (const shop of top5Carriers) similar[shop] += 1;
  }

  const rows: ShopRow[] = top5.map((shop) => ({
    shop,
    displayName: pretty(shop),
    logo: LOGO_FILES[shop.toLowerCase()] ?? null,
    totalProducts: agg[shop].total,
    similarProducts: similar[shop] ?? 0,
    cheapestCount: agg[shop].cheapest,
  }));

  cache = rows;
  return cache;
}

export async function GET() {
  return NextResponse.json({ shops: compute() });
}
