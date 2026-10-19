import faq from "@/data/guides/faq.json";
import pages from "@/data/site/pages.json";
import pokemon from "@/data/pokedex/pokemon.json";
import moves from "@/data/moves/moves.json";
import achievements from "@/data/wiki/achievements.json";
import typeChart from "@/data/tools/type-chart.json";
import { PageSchema } from "@/seo/PageSchema";
import { GameIcon } from "@/components/common/GameIcon";
import { CollectionPokemonArt } from "@/components/common/CollectionPokemonArt";
import { pageMetadata } from "@/seo/metadata";
import FeaturedContent from "./sections/FeaturedContent";
import HeroSection from "./sections/HeroSection";
import RunPlanner from "./sections/RunPlanner";
import PartnerSpotlight from "./sections/PartnerSpotlight";
import s from "@/style/page/home.module.css";

export const metadata = pageMetadata("/");

const stats = [
  { id: 151, name: "Mew", label: "Pokémon", value: pokemon.length, href: "/pokedex" },
  { id: 65, name: "Alakazam", label: "Move Cards", value: moves.length, href: "/level-up" },
  { id: 493, name: "Arceus", label: "Types", value: Object.keys(typeChart).length, href: "/types" },
  { id: 494, name: "Victini", label: "Achievements", value: achievements.length, href: "/achievements" },
];
const faqs = [0, 2, 4, 3].map((index) => faq.questions[index]);

export default function HomePage() {
  return (
    <div className={s.dashboard}>
      <PageSchema path="/" title={pages["/"].heading} description={pages["/"].intro} />
      <HeroSection />
      <nav className={s.stats} aria-label="Explore game data">
        {stats.map(({ id, name, label, value, href }) => (
          <a href={href} key={href}>
            <CollectionPokemonArt id={id} name={name} size={56} />
            <span><strong>{value}</strong><small>{label}</small></span>
            <span className={s.statArrow} aria-hidden="true">↗</span>
          </a>
        ))}
      </nav>
      <RunPlanner />
      <FeaturedContent />
      <PartnerSpotlight />
      <div className={s.bottom}>
        <section className={s.about} aria-labelledby="about-game">
          <h2 id="about-game"><CollectionPokemonArt id={251} name="Celebi" size={40} /> What is PokeSurvivor?</h2>
          <p>PokeSurvivor is a free browser survival game. Move through the horde, collect experience and choose upgrades while your active attack fires automatically.</p>
          <p>This independent fan guide helps you compare partners, check evolution requirements and adjust your build when the next card changes your plans.</p>
          <a className={s.release} href="/play">
            <strong>Play. Learn. Try another run.</strong>
            <span>A new run is a chance to try a different plan. <b aria-hidden="true">→</b></span>
          </a>
          <a className={s.editorialLink} href="/legal/contact-us">Questions or corrections? Contact us →</a>
        </section>
        <section className={s.panel} aria-labelledby="home-faq">
          <div className={s.panelHead}>
            <h2 id="home-faq"><GameIcon name="book" size={26} /> Before you start</h2>
            <a href="/guides/faq">All FAQs →</a>
          </div>
          <div className={s.faqs}>
            {faqs.map(([question, answer]) => (
              <details key={question}>
                <summary>{question}<span aria-hidden="true">+</span></summary>
                <p>{answer}</p>
              </details>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
