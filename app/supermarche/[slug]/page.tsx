import type { Metadata } from "next";
import { CatalogProductDetail } from "@/components/site/CatalogProductDetail";
import { JsonLd } from "@/components/seo/JsonLd";
import { breadcrumbSchema, pageMetadata, productSchema } from "@/lib/seo";
import { lookupSupermarcheProduct } from "@/lib/seoProductLookup";

export async function generateMetadata(
  { params }: { params: { slug: string } }
): Promise<Metadata> {
  const p = await lookupSupermarcheProduct(params.slug);
  const title = p ? `${p.name}${p.brand ? ` · ${p.brand}` : ""}` : "Produit Supermarché";
  const priceFragment = p?.minPrice != null
    ? ` à partir de ${p.minPrice.toLocaleString("fr-FR")} DT`
    : "";
  const shopFragment = p?.shopName ? ` chez ${p.shopName}` : "";
  const description = p
    ? `${p.name}${shopFragment}${priceFragment}. Comparez les prix dans tous les supermarchés tunisiens.`
    : "Produit suivi dans les supermarchés tunisiens.";
  return pageMetadata({
    title,
    description,
    path: `/supermarche/${params.slug}`,
    image: p?.image ?? null,
  });
}

export default async function SupermarcheProductPage({ params }: { params: { slug: string } }) {
  const p = await lookupSupermarcheProduct(params.slug);
  const path = `/supermarche/${params.slug}`;
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
              { name: "Supermarché", path: "/supermarche" },
              { name: p.name, path },
            ])}
          />
        </>
      )}
      <CatalogProductDetail
        slug={params.slug}
        apiBase="/api/super-products"
        backHref="/supermarche"
        backLabel="Supermarché"
        comparatorBase="/supermarche"
      />
    </>
  );
}
