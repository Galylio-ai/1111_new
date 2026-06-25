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

  const agg: Record<string, { total: number; similar: number; cheapest: number }> = {};

  for (const p of products) {
    if (!Array.isArray(p.shopNames) || p.shopNames.length === 0) continue;
    const cheapest = p.shopNames[0];
    const isShared = p.shopNames.length > 1;
    for (const shop of p.shopNames) {
      if (!agg[shop]) agg[shop] = { total: 0, similar: 0, cheapest: 0 };
      agg[shop].total += 1;
      if (isShared) agg[shop].similar += 1;
      if (shop === cheapest) agg[shop].cheapest += 1;
    }
  }

  const rows: ShopRow[] = Object.entries(agg).map(([shop, a]) => ({
    shop,
    displayName: pretty(shop),
    logo: LOGO_FILES[shop.toLowerCase()] ?? null,
    totalProducts: a.total,
    similarProducts: a.similar,
    cheapestCount: a.cheapest,
  }));

  rows.sort((a, b) => b.cheapestCount - a.cheapestCount);
  cache = rows.slice(0, 5);
  return cache;
}

export async function GET() {
  return NextResponse.json({ shops: compute() });
}
