import type { Metadata } from "next";
import { site } from "@/config/site";
import { tdk } from "@/seo/tdk";
import guides from "@/data/guides/guides.json";
import faq from "@/data/guides/faq.json";
export type SeoData = { title: string; description: string; targetKeywords?: string[] };
export function seoFor(path: string): SeoData {
  const record = (tdk as Record<string, SeoData>)[path]
    ?? (path === "/guides/faq" ? faq.seo : guides.find((g) => `/guides/${g.slug}` === path)?.seo);
  if (!record) throw new Error(`Missing SEO content: ${path}`);
  return record;
}
export function pageMetadata(path: string): Metadata {
  const { title, description } = seoFor(path);
  const url = site.url + (path === "/" ? "/" : path);
  return {
    title: { absolute: title }, description,
    alternates: { canonical: url },
    openGraph: {
      title, description, url, siteName: site.name,
      type: path.startsWith("/guides/") && path !== "/guides/faq" ? "article" : "website",
      locale: "en_US", images: [{ url: site.url + "/images/og-image.png", width: 1200, height: 630,
        alt: "PokeSurvivor.me — play, pick a partner and plan your next run" }],
    },
    twitter: { card: "summary_large_image", title, description, images: [site.url + "/images/og-image.png"] },
  };
}
