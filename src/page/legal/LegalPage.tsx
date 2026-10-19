import legal from "@/data/legal/pages.json";
import { PageHeader } from "@/components/common/PageHeader";
import { pageUpdatedAt } from "@/seo/revisions";
import { legalLinks } from "@/config/legal";
import s from "@/style/common/content.module.css";
export type LegalSlug = keyof typeof legal;
export default function LegalPage({ slug }: { slug: LegalSlug }) {
  const path = `/legal/${slug}`;
  const page = legal[slug];
  return <div className={s.wrap}>
    <PageHeader title={slug} description="" path={path} category="POKESURVIVOR.ME" />
    <article className={`${s.article} prose`}>
      <p>Last updated: <time dateTime={pageUpdatedAt(path)}>{pageUpdatedAt(path).slice(0, 10)}</time></p>
      {page.sections.map((section) => <section key={section.heading}>
        <h2>{section.heading}</h2>{section.paragraphs.map((text) => <p key={text}>{text}</p>)}
      </section>)}
      {slug === "copyright" && <p><a href="/credits/spritecollab-artists.md">SpriteCollab artist credits</a> · <a href="https://creativecommons.org/licenses/by-nc/4.0/">CC BY-NC 4.0</a> · <a href="/credits/pokesurvivor-license.txt">Historical archive license</a> · <a href="/credits/pokesurvivor-current-license.txt">Current game license notice</a> · <a href="/credits/pokesurvivor-noncommercial.md">PolyForm Noncommercial 1.0.0</a></p>}
      <p><a href="mailto:support@pokesurvivor.me">support@pokesurvivor.me</a></p>
      <nav className={s.chips} aria-label="Legal pages">{legalLinks.filter((link) => link.href !== path).map((link) => <a href={link.href} key={link.href}>{link.label}</a>)}</nav>
    </article>
  </div>;
}
