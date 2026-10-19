import Image from "next/image";
import home from "@/data/site/home.json";
import { CollectionPokemonArt } from "@/components/common/CollectionPokemonArt";
import s from "@/style/page/home.module.css";

const starters = [
  { id: 25, name: "Pikachu" }, { id: 6, name: "Charizard" },
  { id: 282, name: "Gardevoir" }, { id: 149, name: "Dragonite" },
];

export default function HeroSection() {
  return (
    <section className={s.hero} aria-labelledby="home-title">
      <div className={s.heroContent}>
        <p className={s.eyebrow}>{home.eyebrow}</p>
        <h1 id="home-title"><span>Poke</span>Survivor<span className="sr-only"> - Play Online and Plan Your Next Run</span></h1>
        <p className={s.heroTagline}>{home.tagline[0]}<br />{home.tagline[1]}</p>
        <p className={s.heroIntro}>{home.intro}</p>
        <div className={s.heroButtons}>
          <a href="/play" className="btn"><span aria-hidden="true">▶</span> Play Now</a>
          <a href="/guides/beginner-guide">Start with the guide <span aria-hidden="true">→</span></a>
        </div>
        <div className={s.heroPartners} aria-hidden="true">
          {starters.map((partner) => <CollectionPokemonArt key={partner.id} {...partner} size={72} />)}
        </div>
      </div>
      <figure className={s.heroScreen}>
        <Image
          src="/game/screenshots/level-up.webp"
          alt="The official PokeSurvivor game offering Armor, Razor Leaf and Vine Whip as level-up choices"
          width={1280}
          height={720}
          sizes="(max-width: 768px) 100vw, (max-width: 1024px) 65vw, 850px"
          loading="eager"
          fetchPriority="high"
        />
        <figcaption>Actual game screen</figcaption>
      </figure>
    </section>
  );
}
