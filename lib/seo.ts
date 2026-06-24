// Central SEO config — single source of truth for the site's canonical host,
// brand strings, default OG image, etc. Pages import what they need so we
// stay consistent across every metadata block.

export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://production.1111.tn";

export const SITE_NAME = "1111.tn";

export const SITE_BRAND_TAGLINE = "Comparateur de prix Tunisie";

export const SITE_DEFAULT_TITLE = `${SITE_NAME} — ${SITE_BRAND_TAGLINE}`;

export const SITE_DEFAULT_DESCRIPTION =
  "Comparez plus de 350 000 produits, surveillez les prix, détectez les vraies promotions et économisez sur tous vos achats en Tunisie.";

export const SITE_LOCALE = "fr_TN";
export const SITE_LANG = "fr";

export const SITE_KEYWORDS = [
  "comparateur de prix tunisie",
  "1111.tn",
  "promotions tunisie",
  "supermarché tunisie",
  "parapharmacie tunisie",
  "comparer prix tunisie",
  "meilleur prix tunisie",
  "tunisie shopping",
  "carrefour aziza monoprix géant",
];

// Default OpenGraph image — sits at /public/og.png if present, otherwise we
// fall back to the existing banner. Next.js will serve whichever exists.
export const SITE_OG_IMAGE = "/og.png";
export const SITE_OG_IMAGE_FALLBACK = "/banner.png";
export const SITE_OG_IMAGE_WIDTH = 1200;
export const SITE_OG_IMAGE_HEIGHT = 630;

// Twitter handle for the site (empty for now — site card still works).
export const SITE_TWITTER = "";

// Absolute URL helper. Pass a path like "/supermarche/foo" and get back
// "https://production.1111.tn/supermarche/foo".
export function absoluteUrl(path: string): string {
  if (!path) return SITE_URL;
  if (/^https?:\/\//.test(path)) return path;
  return `${SITE_URL}${path.startsWith("/") ? path : `/${path}`}`;
}

import type { Metadata } from "next";

// DRY helper for generating per-page Metadata blocks. Pass the page title,
// description and canonical path; everything else (OG, Twitter, canonical
// URL) is filled in consistently.
export function pageMetadata(opts: {
  title: string;
  description: string;
  path: string;
  image?: string | null;
  imageWidth?: number;
  imageHeight?: number;
  noindex?: boolean;
  keywords?: string[];
}): Metadata {
  const {
    title,
    description,
    path,
    image,
    imageWidth = SITE_OG_IMAGE_WIDTH,
    imageHeight = SITE_OG_IMAGE_HEIGHT,
    noindex,
    keywords,
  } = opts;

  const ogImage = image && /^https?:\/\//.test(image) ? image : absoluteUrl(image ?? SITE_OG_IMAGE);

  return {
    title,
    description,
    keywords,
    alternates: { canonical: path, languages: { "fr-TN": path } },
    openGraph: {
      type: "website",
      siteName: SITE_NAME,
      title,
      description,
      url: absoluteUrl(path),
      locale: SITE_LOCALE,
      images: [{ url: ogImage, width: imageWidth, height: imageHeight, alt: title }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [ogImage],
    },
    robots: noindex
      ? { index: false, follow: false, googleBot: { index: false, follow: false } }
      : undefined,
  };
}

// JSON-LD builders. Each returns a plain object ready to be rendered with
// <JsonLd data={...} />. They follow schema.org vocabulary.

export function organizationSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: SITE_NAME,
    url: SITE_URL,
    logo: absoluteUrl("/favicon.svg"),
    description: SITE_DEFAULT_DESCRIPTION,
    sameAs: [],
  };
}

export function websiteSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: SITE_NAME,
    url: SITE_URL,
    inLanguage: "fr-TN",
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: `${SITE_URL}/comparateur?q={search_term_string}`,
      },
      "query-input": "required name=search_term_string",
    },
  };
}

export function breadcrumbSchema(items: Array<{ name: string; path: string }>) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((it, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: it.name,
      item: absoluteUrl(it.path),
    })),
  };
}

export function productSchema(opts: {
  name: string;
  description?: string | null;
  image?: string | null;
  brand?: string | null;
  sku?: string | null;
  url: string;
  minPrice: number | null;
  maxPrice: number | null;
  offerCount?: number;
  availability?: "InStock" | "OutOfStock" | "PreOrder";
  currency?: string;
}) {
  const {
    name, description, image, brand, sku, url,
    minPrice, maxPrice, offerCount, availability = "InStock",
    currency = "TND",
  } = opts;

  // Build the offers field. When we have multiple shops carrying the same
  // product we ship an AggregateOffer; for a single price we just emit
  // a flat Offer.
  let offers: Record<string, unknown> | undefined;
  if (minPrice != null && maxPrice != null && minPrice !== maxPrice) {
    offers = {
      "@type": "AggregateOffer",
      priceCurrency: currency,
      lowPrice: minPrice,
      highPrice: maxPrice,
      offerCount: offerCount ?? 2,
      availability: `https://schema.org/${availability}`,
      url: absoluteUrl(url),
    };
  } else if (minPrice != null) {
    offers = {
      "@type": "Offer",
      priceCurrency: currency,
      price: minPrice,
      availability: `https://schema.org/${availability}`,
      url: absoluteUrl(url),
    };
  }

  const base: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "Product",
    name,
    url: absoluteUrl(url),
  };
  if (description) base.description = description;
  if (image) base.image = /^https?:\/\//.test(image) ? image : absoluteUrl(image);
  if (brand) base.brand = { "@type": "Brand", name: brand };
  if (sku) base.sku = sku;
  if (offers) base.offers = offers;
  return base;
}
