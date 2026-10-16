import pages from "@/data/site/pages.json";
import { PageSchema } from "@/seo/PageSchema";
import { JsonLd } from "@/seo/JsonLd";
import { site } from "@/config/site";
import { GameIcon } from "./GameIcon";
import s from "@/style/common/content.module.css";
export function PageHeader({
  title,
  description,
  path,
  category = "FIELD GUIDE",
}: {
  title: string;
  description: string;
  path: string;
  category?: string;
}) {
  const hero = (pages as Record<string, { heading: string; intro: string }>)[path];
  title = hero?.heading ?? title;
  description = hero?.intro ?? description;
  return (
    <>
      <nav className={s.breadcrumb} aria-label="Breadcrumb">
        <a href="/">Home</a>
        <span>›</span>
        <span>{title}</span>
      </nav>
      <header className={s.pageHeader}>
        <div>
          <p>
            {category} <span> / POKESURVIVOR</span>
          </p>
          <h1>{title}</h1>
          <div className={s.description}>{description}</div>
        </div>
        <span className={s.headerIcon} aria-hidden="true">
          <GameIcon name={({
            "/pokedex": "ball", "/level-up": "cards", "/tier-list": "crown", "/rankings": "crown",
            "/guides": "book", "/types": "type-grass",
            "/gacha": "ticket10", "/achievements": "trophy", "/updates": "clock",
          } as Record<string, string>)[path] ?? "book"} size={72} />
        </span>
      </header>
      <PageSchema path={path} title={title} description={description} />
      <JsonLd
        data={{
          "@type": "BreadcrumbList",
          itemListElement: [
            { "@type": "ListItem", position: 1, name: "Home", item: site.url },
            {
              "@type": "ListItem",
              position: 2,
              name: title,
              item: site.url + path,
            },
          ],
        }}
      />
    </>
  );
}
