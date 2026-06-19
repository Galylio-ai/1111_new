import { CatalogProductDetail } from "@/components/site/CatalogProductDetail";

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
