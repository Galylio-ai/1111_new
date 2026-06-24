import type { Metadata } from "next";
import { CatalogProductDetail } from "@/components/site/CatalogProductDetail";
import { JsonLd } from "@/components/seo/JsonLd";
import { breadcrumbSchema, pageMetadata, productSchema } from "@/lib/seo";
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

export default async function ParaProductPage({ params }: { params: { slug: string } }) {
  const p = await lookupParaProduct(params.slug);
  const path = `/parapharmacie/${params.slug}`;
  return (
    <>
      {p && (
        <>
          <JsonLd
            data={productSchema({
              name: p.name,
              brand: p.brand,
              image: p.image,
              url: path,
              minPrice: p.minPrice,
              maxPrice: p.maxPrice,
            })}
          />
          <JsonLd
            data={breadcrumbSchema([
              { name: "Accueil", path: "/" },
              { name: "Parapharmacie", path: "/parapharmacie" },
              { name: p.name, path },
            ])}
          />
        </>
      )}
      <CatalogProductDetail
        slug={params.slug}
        apiBase="/api/para-products"
        backHref="/parapharmacie"
        backLabel="Parapharmacie"
        comparatorBase="/parapharmacie"
      />
    </>
  );
}
