import { pageUpdatedAt } from "@/seo/revisions";
import Image from "next/image";
import type { Guide } from "@/types/guide";
import { PageHeader } from "@/components/common/PageHeader";
import { MoveIcon } from "@/components/common/GameIcon";
import { LocalSourceNote } from "@/components/common/LocalSourceNote";
import { SourceNote } from "@/components/common/SourceNote";
import { JsonLd } from "@/seo/JsonLd";
import { site } from "@/config/site";
import { guides } from "@/lib/data/guides";
import { getMoveById } from "@/lib/data/moves";
import WaveReference from "./sections/WaveReference";
import MissionReference from "./sections/MissionReference";
import WorldReference from "./sections/WorldReference";
import ShinyReference from "./sections/ShinyReference";
import GuideSectionBlocks from "./sections/GuideSectionBlocks";
import GuideArtwork from "./sections/GuideArtwork";
import s from "@/style/page/guides.module.css";
import c from "@/style/common/content.module.css";
function RecipeExamples() {
  return (
    <div className={s.recipeGrid}>
      {[
        "ember",
        "water-gun",
        "vine-whip",
        "thunder-shock",
        "confusion",
        "shadow-ball",
      ].map((id) => {
        const m = getMoveById(id)!;
        return (
          <a href={`/level-up#move-${m.slug}`} key={id}>
            <MoveIcon id={id} size={36} />
            <div>
              <h3>{m.name}</h3>
              <small>Level 5 + {m.requirement}</small>
              <strong>→ {m.evolution}</strong>
            </div>
          </a>
        );
      })}
    </div>
  );
}
export default function GuidePage({ guide: g }: { guide: Guide }) {
  const next =
    guides[
      (guides.findIndex((guide) => guide.slug === g.slug) + 1) % guides.length
    ];
  return (
    <div className={c.wrap}>
      <PageHeader
        title={g.heading}
        description={g.description}
        path={`/guides/${g.slug}`}
        category={g.category}
      />
      <JsonLd
        data={{
          "@type": "Article",
          headline: g.heading,
          description: g.description,
          image: site.url + g.image,
          dateModified: pageUpdatedAt(`/guides/${g.slug}`),
          author: {
            "@type": "Organization",
            name: "PokeSurvivor.me",
            url: site.url + "/legal/about-us",
          },
          mainEntityOfPage: { "@id": site.url + "/guides/" + g.slug + "#webpage" },
          publisher: { "@id": site.url + "/#publisher" },
        }}
      />
      <div className={s.readingLayout}>
        <aside className={s.toc}>
          <small>IN THIS FIELD GUIDE</small>
          <nav aria-label="In this guide">
            {g.sections.map((section) => (
              <a href={`#${section.id}`} key={section.id}>
                {section.title.replace(/^\d+\. /, "")}
              </a>
            ))}
          </nav>
          <a href="/guides">← All guides</a>
        </aside>
        <article className={s.article}>
          <div className={s.articleCover}>
            <Image
              src={g.image}
              alt={g.imageAlt}
              fill
              sizes="(max-width: 1024px) 90vw, 65vw"
              loading="eager"
              fetchPriority="high"
            />
            <GuideArtwork slug={g.slug} />
          </div>
          <div className={s.articleBody}>
            <div className={s.byline}>
              <span>{g.readTime} MIN READ</span>
              <span>UPDATED <time dateTime={pageUpdatedAt(`/guides/${g.slug}`)}>{pageUpdatedAt(`/guides/${g.slug}`).slice(0, 10)}</time></span>
              <a href="/legal/about-us">BY POKESURVIVOR.ME</a>
            </div>
            <div className={s.takeaways}>
              <h2>What you’ll learn</h2>
              <ul className={s.outcomes}>
                {g.outcomes.map((outcome) => (
                  <li key={outcome}>{outcome}</li>
                ))}
              </ul>
            </div>
            {g.sections.map((section) => (
              <section className={s.chapter} id={section.id} key={section.id}>
                <h2>{section.title}</h2>
                {section.paragraphs.map((p) => (
                  <p key={p}>{p}</p>
                ))}
                <GuideSectionBlocks section={section} />
                {g.slug === "beginner-guide" && section.id === "waves" && (
                  <details className={s.referenceToggle}>
                    <summary>
                      Explore the data: 6 wild tiers & 5 boss slots
                    </summary>
                    <div>
                      <WaveReference />
                      <WaveReference bosses />
                      <LocalSourceNote
                        files={["js/data/enemies.js", "js/systems/spawner.js"]}
                      />
                    </div>
                  </details>
                )}
                {g.slug === "beginner-guide" && section.id === "world" && (
                  <details className={s.referenceToggle}>
                    <summary>
                      Compare world events, chests, springs & altars
                    </summary>
                    <div>
                      <WorldReference />
                      <LocalSourceNote
                        files={[
                          "js/systems/events.js",
                          "js/systems/interact.js",
                          "js/world/world.js",
                        ]}
                      />
                    </div>
                  </details>
                )}
                {g.slug === "move-evolutions" && section.id === "recipes" && (
                  <RecipeExamples />
                )}
                {g.slug === "move-evolutions" && section.id === "rerolls" && (
                  <a className="btn" href="/level-up">
                    Compare move cards →
                  </a>
                )}
                {g.slug === "gacha-and-tickets" &&
                  section.id === "missions" && (
                    <details className={s.referenceToggle}>
                      <summary>
                        Compare all 16 mission templates & rewards
                      </summary>
                      <div>
                        <MissionReference />
                        <LocalSourceNote
                          files={[
                            "js/data/missions.js",
                            "js/systems/progress.js",
                            "js/net/ranking.js",
                          ]}
                        />
                      </div>
                    </details>
                  )}
                {g.slug === "gacha-and-tickets" && section.id === "shiny" && (
                  <ShinyReference />
                )}
                {g.slug === "gacha-and-tickets" &&
                  section.id === "checklist" && (
                    <a className="btn" href="/gacha">
                      Review banner rules & odds →
                    </a>
                  )}
              </section>
            ))}
            <SourceNote files={g.sources} />
            <a className={s.nextGuide} href={`/guides/${next.slug}`}>
              <div>
                <small>YOUR NEXT FIELD GUIDE</small>
                <h2>{next.cardTitle}</h2>
              </div>
              <span>→</span>
            </a>
          </div>
        </article>
      </div>
    </div>
  );
}
