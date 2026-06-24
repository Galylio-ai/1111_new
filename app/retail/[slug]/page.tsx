import type { Metadata } from "next";
import { CatalogProductDetail } from "@/components/site/CatalogProductDetail";
import { JsonLd } from "@/components/seo/JsonLd";
import { breadcrumbSchema, pageMetadata, productSchema } from "@/lib/seo";
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

export default async function RetailProductPage({ params }: { params: { slug: string } }) {
  const p = await lookupRetailProduct(params.slug);
  const path = `/retail/${params.slug}`;
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
              { name: "Magasins", path: "/retail" },
              { name: p.name, path },
            ])}
          />
        </>
      )}
      <CatalogProductDetail
        slug={params.slug}
        apiBase="/api/retail-products"
        backHref="/retail"
        backLabel="Magasins Retail"
        comparatorBase="/retail"
      />
    </>
  );
}
