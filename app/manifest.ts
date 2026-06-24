import type { MetadataRoute } from "next";
import { SITE_DEFAULT_DESCRIPTION, SITE_NAME } from "@/lib/seo";

// /manifest.webmanifest — basic PWA manifest so the site can be added to
// the home screen on mobile and shows up with our brand colour + name.
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: `${SITE_NAME} — Comparateur de prix Tunisie`,
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
