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

type ShopStat = {
  shop: string;          // raw key from data
  displayName: string;   // pretty name
  products: number;      // how many products this shop carries
  avgPrice: number;      // average price of products it carries
  cheapestCount: number; // products where this shop has the minimum price
  promoCount: number;    // products with a discount that this shop carries
  promoPct: number;      // percent of its catalog that's on promo
  availability: number;  // % of total catalog this shop covers
  score: number;         // 0..100 score based on visible ranking signals
  rank: number;
  logo: string | null;   // /shop-logos/<key>.<ext> if we scraped one
  visitors: number;      // estimated monthly visitors (derived from catalog size)
};

// para shops with a scraped logo file in /public/shop-logos.
// Keys are NORMALIZED (lowercase, non-alphanumerics → ""), so "El Farabi",
// "el_farabi" and "el-farabi" all resolve to the same "elfarabi" key.
const LOGO_FILES: Record<string, string> = {
  mapara: "/shop-logos/mapara.png",
  paraexpert: "/shop-logos/parashop.webp",   // ParaExpert shares the parashop catalog
  parashop: "/shop-logos/parashop.webp",
  parafendri: "/shop-logos/parafendri.png",
  pharmashop: "/shop-logos/pharmashop.png",
  pharmacieplus: "/shop-logos/pharmacieplus.png",
  elfarabi: "/shop-logos/el_farabi.jpg",
  beautystore: "/shop-logos/beautystore.jpg",
};

function logoKey(s: string): string {
  return s.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[^a-z0-9]/g, "");
}

let cache: ShopStat[] | null = null;

const DISPLAY_NAMES: Record<string, string> = {
  beautystore: "BeautyStore",
  el_farabi: "El Farabi",
  mapara: "MaPara",
  paraexpert: "ParaExpert",
  parafendri: "ParaFendri",
  parashop: "ParaShop",
  cosmetique: "Cosmétique",
  pharmashop: "PharmaShop",
  parahouse: "ParaHouse",
  paraland: "ParaLand",
};

function pretty(key: string): string {
  return DISPLAY_NAMES[key.toLowerCase()] ?? key.charAt(0).toUpperCase() + key.slice(1);
}

function compute(): ShopStat[] {
  if (cache) return cache;

  const file = path.join(process.cwd(), "app/api/para-products/data.json");
  const products = JSON.parse(readFileSync(file, "utf8")) as Product[];

  // Aggregate per shop
  const agg: Record<
    string,
    {
      products: number;
      priceSum: number;
      cheapestCount: number;
      promoCount: number;
    }
  > = {};

  for (const p of products) {
    if (!Array.isArray(p.shopNames) || p.shopNames.length === 0) continue;
    const cheapest = p.shopNames[0]; // data is consistently ordered cheapest-first for per-product API

    // Approximate per-shop price for this product:
    // - cheapest shop gets minPrice
    // - last shop gets maxPrice
    // - intermediate shops get a linear interpolation
    const n = p.shopNames.length;
    p.shopNames.forEach((shop, i) => {
      const price =
        n === 1
          ? p.minPrice
          : p.minPrice + ((p.maxPrice - p.minPrice) * i) / Math.max(1, n - 1);
      if (!agg[shop]) {
        agg[shop] = { products: 0, priceSum: 0, cheapestCount: 0, promoCount: 0 };
      }
      agg[shop].products += 1;
      agg[shop].priceSum += price;
      if (shop === cheapest) agg[shop].cheapestCount += 1;
      if (p.discount && p.discount > 0) agg[shop].promoCount += 1;
    });
  }

  const totalProducts = products.length || 1;
  const maxShopProducts = Math.max(
    ...Object.values(agg).map((a) => a.products),
    1
  );
  const maxCheapestCount = Math.max(
    ...Object.values(agg).map((a) => a.cheapestCount),
    1
  );
  const avgPrices = Object.values(agg).map((a) => (a.products > 0 ? a.priceSum / a.products : 0));
  const minAvgPrice = Math.min(...avgPrices);
  const maxAvgPrice = Math.max(...avgPrices);
  const visitorEstimate = (a: { products: number; cheapestCount: number }) =>
    Math.round(a.products * 48 + a.cheapestCount * 120);
  const maxVisitors = Math.max(...Object.values(agg).map(visitorEstimate), 1);

  const stats: ShopStat[] = Object.entries(agg).map(([shop, a]) => {
    const avgPrice = a.products > 0 ? a.priceSum / a.products : 0;
    const promoPct = a.products > 0 ? (a.promoCount / a.products) * 100 : 0;
    const availability = (a.products / totalProducts) * 100;
    const visitors = visitorEstimate(a);
    // Composite score based on columns shown in the ranking:
    // best-price wins, price level, catalog depth, and estimated audience.
    const bestPriceScore = (a.cheapestCount / maxCheapestCount) * 100;
    const priceLevelScore =
      maxAvgPrice === minAvgPrice
        ? 100
        : ((maxAvgPrice - avgPrice) / (maxAvgPrice - minAvgPrice)) * 100;
    const catalogScore = (a.products / maxShopProducts) * 100;
    const audienceScore = (visitors / maxVisitors) * 100;
    const score =
      bestPriceScore * 0.45 +
      priceLevelScore * 0.25 +
      catalogScore * 0.15 +
      audienceScore * 0.15;

    return {
      shop,
      displayName: pretty(shop),
      products: a.products,
      avgPrice,
      cheapestCount: a.cheapestCount,
      promoCount: a.promoCount,
      promoPct,
      availability,
      score: Math.round(score),
      rank: 0,
      logo: LOGO_FILES[logoKey(shop)] ?? null,
      // estimated monthly visitors, scaled from catalog size (stable, deterministic)
      visitors,
    };
  });

  stats.sort((a, b) => b.score - a.score);
  stats.forEach((s, i) => (s.rank = i + 1));

  cache = stats;
  return cache;
}

export async function GET() {
  return NextResponse.json({ shops: compute() });
}
