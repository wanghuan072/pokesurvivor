import type { MetadataRoute } from "next";
import { site } from "@/config/site";
import revisions from "@/data/seo/page-revisions.json";
import { tdk } from "@/seo/tdk";
import { guides } from "@/lib/data/guides";
import { pageUpdatedAt } from "@/seo/revisions";
export default function sitemap(): MetadataRoute.Sitemap {
  const published = new Set([...Object.keys(tdk), ...guides.map(g=>`/guides/${g.slug}`), "/guides/faq"]);
  return Object.keys(revisions).filter(path=>published.has(path)).map(path=>({
    url: site.url + path, lastModified: pageUpdatedAt(path),
  }));
}
