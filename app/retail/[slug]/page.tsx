import type { Metadata } from "next";
import { CatalogProductDetail } from "@/components/site/CatalogProductDetail";
import { pageMetadata } from "@/lib/seo";
import { lookupRetailProduct } from "@/lib/seoProductLookup";

export async function generateMetadata(
  { params }: { params: { slug: string } }
): Promise<Metadata> {
  const p = await lookupRetailProduct(params.slug);
  const title = p ? `${p.name}${p.brand ? ` · ${p.brand}` : ""}` : "Produit Magasin";
  const priceFragment = p?.minPrice != null
    ? ` à partir de ${p.minPrice.toLocaleString("fr-FR")} DT`
    : "";
  const shopFragment = p?.shopName ? ` chez ${p.shopName}` : "";
  const description = p
    ? `${p.name}${shopFragment}${priceFragment}. Comparez les prix dans tous les magasins retail tunisiens.`
    : "Produit suivi dans les magasins retail tunisiens.";
  return pageMetadata({
    title,
    description,
    path: `/retail/${params.slug}`,
    image: p?.image ?? null,
  });
}

export default function RetailProductPage({ params }: { params: { slug: string } }) {
  return (
    <CatalogProductDetail
      slug={params.slug}
      apiBase="/api/retail-products"
      backHref="/retail"
      backLabel="Magasins Retail"
      comparatorBase="/retail"
    />
  );
}
