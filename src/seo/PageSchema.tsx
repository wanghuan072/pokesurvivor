import { JsonLd } from "@/seo/JsonLd";
import { site } from "@/config/site";
import { pageUpdatedAt } from "@/seo/revisions";
export function PageSchema({ path, title, description }: { path: string; title: string; description: string }) {
  const url = site.url + path;
  const type = path === "/legal/about-us" ? "AboutPage" : path === "/legal/contact-us" ? "ContactPage"
    : ["/pokedex", "/level-up", "/tier-list", "/rankings", "/guides", "/achievements", "/updates"].includes(path) ? "CollectionPage" : "WebPage";
  return <JsonLd data={{ "@graph": [
    { "@type": "Organization", "@id": site.url + "/#publisher", name: site.name, url: site.url,
      logo: { "@type": "ImageObject", url: site.url + "/images/logo.svg" } },
    { "@type": "WebSite", "@id": site.url + "/#website", name: site.name, url: site.url,
      inLanguage: "en", publisher: { "@id": site.url + "/#publisher" } },
    { "@type": type, "@id": url + "#webpage", name: title, description, url, inLanguage: "en",
      dateModified: pageUpdatedAt(path), isPartOf: { "@id": site.url + "/#website" } },
  ] }} />;
}
