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
  const file = path.join(process.cwd(), "app/api/retail-products/data.json");
  cache = JSON.parse(readFileSync(file, "utf8")) as Product[];
  return cache;
}

function toSlug(name: string) {
  return name.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

export async function GET(_req: NextRequest, { params }: { params: { slug: string } }) {
  const data = loadData();
  const product = data.find(p => toSlug(p.name) === params.slug);
  if (!product) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const related = data
    .filter(p => p.category === product.category && p.name !== product.name)
    .slice(0, 6)
    .map(p => ({ ...p, slug: toSlug(p.name) }));

  return NextResponse.json({ ...product, slug: params.slug, related });
}
