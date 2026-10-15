import faq from "@/data/guides/faq.json";
import { PageSchema } from "@/seo/PageSchema";
import pages from "@/data/site/pages.json";
import { GameIcon } from "@/components/common/GameIcon";
import FeaturedContent from "./sections/FeaturedContent";
import PlayPreview from "./sections/PlayPreview";
import HeroSection from "./sections/HeroSection";
import Image from "next/image";
import { Panel } from "@/components/common/Panel";
import { pageMetadata } from "@/seo/metadata";
import s from "@/style/page/home.module.css";
export const metadata = pageMetadata("/");
const quick = [
  ["◓", "Pokédex", "Browse all Pokémon", "/pokedex"],
  ["♛", "Tier List", "Find your next partner", "/tier-list"],
  ["ϟ", "Level-up Cards", "Choose your next upgrade", "/level-up"],
  ["⬡", "Builds", "Better build ideas", "/builds"],
  ["◉", "Gacha", "Tickets & probability", "/gacha"],
  ["▣", "Guides", "Tips & strategies", "/guides"],
];
const faqs = faq.questions.slice(0, 6);
export default function HomePage() {
  return (
    <>
      <PageSchema path="/" title={pages["/"].heading} description={pages["/"].intro} />
      <HeroSection />
      <div className={s.dashboard}>
        <div className={s.stats}>
          {[
            ["◓", "Pokémon", "966", "Discover every partner", "/pokedex"],
            ["ϟ", "Move Cards", "64", "Plan your upgrades", "/level-up"],
            ["❧", "Types", "18", "Master matchups", "/types"],
            [
              "♜",
              "Achievements",
              "130",
              "Complete your journey",
              "/achievements",
            ],
          ].map(([icon, label, value, caption, href]) => (
            <a href={href} key={label}>
              <span className={s.statIcon}>{icon}</span>
              <div>
                <span>{label}</span>
                <strong>{value}</strong>
                <small>{caption}</small>
              </div>
            </a>
          ))}
        </div>
        <PlayPreview />

        <Panel title="Quick Access" icon="ϟ" href="/guides" more="View All">
          <div className={s.quick}>
            {quick.map(([icon, title, caption, href]) => (
              <a key={href} href={href}>
                <span>{icon}</span>
                <div>
                  <strong>{title}</strong>
                  <small>{caption}</small>
                </div>
              </a>
            ))}
          </div>
        </Panel>
        <Panel
          title="Explore the Game Systems"
          icon="▤"
          href="/guides"
          more="All Guides"
        >
          <div className={s.systems}>
            {[
              [
                "shield",
                "Your First Stronger Run",
                "Controls, routes & survival decisions",
                "/guides/beginner-guide#waves",
              ],
              [
                "ticket",
                "Tickets, Gacha & Missions",
                "Plan pulls and claim useful rewards",
                "/guides/gacha-and-tickets#missions",
              ],
              [
                "coin",
                "Cards, Evolutions & Bonds",
                "Build a compatible evolution plan",
                "/guides/move-evolutions",
              ],
            ].map(([icon, title, description, href]) => (
              <a key={href} href={href}>
                <GameIcon name={icon} size={32} />
                <div>
                  <h3>{title}</h3>
                  <p>{description}</p>
                </div>
                <span>→</span>
              </a>
            ))}
          </div>
        </Panel>
        <FeaturedContent />
        <div className={s.bottom}>
          <section className={s.release}>
            <span className={s.database}>▤</span>
            <div>
              <h2>Before your next run</h2>
              <strong>One move. One goal.</strong>
            </div>
            <span className={s.snapshot}>START HERE</span>
            <p>
              Choose a partner, then focus your first evolution.
              <br />
              Keep an escape route open while collecting experience.
            </p>
            <a href="/guides/beginner-guide">Start with the basics →</a>
          </section>
          <Panel
            title="Frequently Asked Questions"
            icon="?"
            href="/guides/faq"
            more="View All FAQs"
          >
            <div className={s.faqs}>
              {faqs.map(([q, a]) => (
                <details key={q}>
                  <summary>
                    {q}
                    <span>⌄</span>
                  </summary>
                  <p>{a}</p>
                </details>
              ))}
            </div>
          </Panel>
          <section className={s.community}>
            <Image
              src="/art/community.webp"
              alt="Pokémon companions resting beside a campfire beneath the moon"
              fill
              sizes="(max-width: 768px) 90vw, 30vw"
            />
            <div>
              <h2>♟ Join the Adventure</h2>
              <p>
                Follow the game’s development.
                <br />
                See changes and community discussions.
              </p>
              <a
                href="https://github.com/JPTER78/pokesurvivor"
                target="_blank"
                rel="noopener noreferrer"
              >
                Meet the game’s community ↗
              </a>
            </div>
          </section>
        </div>
        <section className={s.about}>
          <h2>What is PokeSurvivor?</h2>
          <p>PokeSurvivor is a free browser survival game: move through enemy waves, collect experience and choose upgrades while your selected attack fires automatically. Picking the next card is part of the challenge. You might improve your main move, take its evolution card or choose health when a risky fight has left you exposed.</p>
          <p>This independent fan guide keeps those choices easy to look up. Compare partners in the Pokédex, check move requirements on the Level-up page and use the builds as plans you can adjust. The guides cover first-run survival, evolving a loadout and collecting partners with tickets. The Play page loads the official game only when you choose to launch it.</p>
          <a href="/guides/beginner-guide">Learn how to play →</a>
          <a href="/sources">How we check game details →</a>
        </section>
      </div>
    </>
  );
}
