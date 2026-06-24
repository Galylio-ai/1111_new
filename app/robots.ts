import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/seo";

// /robots.txt — controls which routes search engines may crawl.
// We allow the public site and explicitly disallow user-only / API surfaces
// so crawlers don't waste budget on routes they cannot meaningfully index.
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: [
          "/api/",        
          "/profil",       
          "/alertes",      
          "/login",
          "/register",
          "/mot-de-passe-oublie",
          "/verify-email",  
        ],
      },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  };
}
