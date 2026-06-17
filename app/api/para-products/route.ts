import { NextRequest, NextResponse } from "next/server";
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

let cache: Product[] | null = null;

function loadData(): Product[] {
  if (cache) return cache;
  const file = path.join(process.cwd(), "app/api/para-products/data.json");
  cache = JSON.parse(readFileSync(file, "utf8")) as Product[];
  return cache;
}

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const page     = Math.max(0, parseInt(searchParams.get("page")  ?? "0", 10));
  const limit    = Math.min(48, Math.max(1, parseInt(searchParams.get("limit") ?? "24", 10)));
  const cat      = (searchParams.get("cat")   ?? "").trim().toLowerCase();
  const q        = (searchParams.get("q")     ?? "").trim().toLowerCase();
  const shop     = (searchParams.get("shop")  ?? "").trim().toLowerCase();

  let data = loadData();

  if (cat)  data = data.filter(p => p.category.toLowerCase().includes(cat));
  if (shop) data = data.filter(p => p.shopNames.some(s => s.toLowerCase().includes(shop)));
  if (q)    data = data.filter(p =>
    p.name.toLowerCase().includes(q) || p.brand.toLowerCase().includes(q)
  );

  const total = data.length;
  const items = data.slice(page * limit, (page + 1) * limit);

  return NextResponse.json({ total, page, limit, items });
}
