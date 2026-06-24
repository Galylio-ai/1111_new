import type { Metadata } from "next";
import { CatalogProductDetail } from "@/components/site/CatalogProductDetail";
import { pageMetadata } from "@/lib/seo";
import { lookupParaProduct } from "@/lib/seoProductLookup";

export async function generateMetadata(
  { params }: { params: { slug: string } }
): Promise<Metadata> {
  const p = await lookupParaProduct(params.slug);
  const title = p ? `${p.name}${p.brand ? ` · ${p.brand}` : ""}` : "Produit Parapharmacie";
  const priceFragment = p?.minPrice != null
    ? ` à partir de ${p.minPrice.toLocaleString("fr-FR")} DT`
    : "";
  const shopFragment = p?.shopName ? ` chez ${p.shopName}` : "";
  const description = p
    ? `${p.name}${shopFragment}${priceFragment}. Comparez les prix dans les parapharmacies tunisiennes.`
    : "Produit suivi dans les parapharmacies tunisiennes.";
  return pageMetadata({
    title,
    description,
    path: `/parapharmacie/${params.slug}`,
    image: p?.image ?? null,
  });
}

export default function ParaProductPage({ params }: { params: { slug: string } }) {
  return (
    <CatalogProductDetail
      slug={params.slug}
      apiBase="/api/para-products"
      backHref="/parapharmacie"
      backLabel="Parapharmacie"
      comparatorBase="/parapharmacie"
    />
  );
}
