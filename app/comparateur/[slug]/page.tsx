import { ProductComparison } from "@/components/site/ProductComparison";

export default function ComparerProductPage({
  params,
  searchParams,
}: {
  params: { slug: string };
  searchParams: { from?: string };
}) {
  const from = searchParams.from === "retail" ? "retail" : "parapharmacie";
  return (
    <ProductComparison
      slug={params.slug}
      apiBase={from === "retail" ? "/api/retail-products" : "/api/para-products"}
      backHref={`/${from}/${params.slug}`}
      backLabel="Retour au produit"
      sourceLabel={from === "retail" ? "Retail" : "Parapharmacie"}
      sourceHref={`/${from}`}
    />
  );
}
