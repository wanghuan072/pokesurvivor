import type { MetadataRoute } from "next";
import { site } from "@/config/site";
export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      ...(site.production ? { allow: "/" } : { disallow: "/" }),
    },
    sitemap: site.production ? site.url + "/sitemap.xml" : undefined,
  };
}
