import { CatalogProductDetail } from "@/components/site/CatalogProductDetail";

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
