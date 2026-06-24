import type { Metadata } from "next";
import BoutiquesProductView from "./BoutiquesProductView";
import { pageMetadata } from "@/lib/seo";
import { lookupBoutiqueProduct } from "@/lib/seoProductLookup";

export async function generateMetadata(
  { params }: { params: { shop: string; slug: string } }
): Promise<Metadata> {
  const p = await lookupBoutiqueProduct(params.shop, params.slug);
  const title = p ? `${p.name}${p.brand ? ` · ${p.brand}` : ""}` : "Produit Boutique";
  const priceFragment = p?.minPrice != null
    ? ` à ${p.minPrice.toLocaleString("fr-FR")} DT`
    : "";
  const shopFragment = p?.shopName ? ` chez ${p.shopName}` : "";
  const description = p
    ? `${p.name}${shopFragment}${priceFragment}. Détails, caractéristiques et historique des prix sur 1111.tn.`
    : "Produit suivi en continu chez les boutiques tunisiennes.";
  return pageMetadata({
    title,
    description,
    path: `/boutiques/${params.shop}/${params.slug}`,
    image: p?.image ?? null,
  });
}

export default function BoutiquesProductPage() {
  return <BoutiquesProductView />;
}
