import { CatalogProductDetail } from "@/components/site/CatalogProductDetail";

export default function SupermarcheProductPage({ params }: { params: { slug: string } }) {
  return (
    <CatalogProductDetail
      slug={params.slug}
      apiBase="/api/super-products"
      backHref="/supermarche"
      backLabel="Supermarché"
      comparatorBase="/supermarche"
    />
  );
}
