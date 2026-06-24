import type { MetadataRoute } from "next";
import { SITE_DEFAULT_DESCRIPTION, SITE_NAME } from "@/lib/seo";


export default function manifest(): MetadataRoute.Manifest {
  return {
    name: `${SITE_NAME} — Comparateur de prix intelligent Tunisie`,
    short_name: SITE_NAME,
    description: SITE_DEFAULT_DESCRIPTION,
    start_url: "/",
    display: "standalone",
    background_color: "#0a0d18",
    theme_color: "#e11d2d",
    lang: "fr-TN",
    dir: "ltr",
    categories: ["shopping", "lifestyle", "finance"],
    icons: [
      {
        src: "/favicon.svg",
        sizes: "any",
        type: "image/svg+xml",
        purpose: "any",
      },
    ],
  };
}
