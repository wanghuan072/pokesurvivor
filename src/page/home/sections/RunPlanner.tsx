import Image from "next/image";
import { GameIcon } from "@/components/common/GameIcon";
import { CollectionPokemonArt } from "@/components/common/CollectionPokemonArt";
import s from "@/style/page/home.module.css";

export default function RunPlanner() {
  return (
    <section aria-labelledby="plan-title">
      <div className={s.sectionHead}>
        <span className={s.sectionNumber} aria-hidden="true">01</span>
        <h2 id="plan-title">Find your next advantage</h2>
        <span className={s.headingRule} />
      </div>
      <p className={s.sectionIntro}>Choose what you need for your next run.</p>
      <div className={s.systems}>
        <a className={s.partnerFeature} href="/pokedex">
          <span className={s.dexNumber} aria-hidden="true">001</span>
          <h3>Pick your partner</h3>
          <p>Compare base stats and find your favourites.</p>
          <div className={s.starterLineup} aria-hidden="true">
            <CollectionPokemonArt id={1} name="Bulbasaur" size={128} />
            <CollectionPokemonArt id={4} name="Charmander" size={128} />
            <CollectionPokemonArt id={7} name="Squirtle" size={128} />
          </div>
          <span className={s.outlineLink}>Explore Pokédex <span aria-hidden="true">→</span></span>
        </a>
        <div className={s.buildFeature}>
          <Image src="/game/screenshots/card-choices.webp" alt="Agility, Power and Poison Sting upgrade cards in PokeSurvivor" fill sizes="(max-width: 768px) 100vw, 60vw" />
          <div>
            <h3><GameIcon name="cards" size={26} /> Build around your cards</h3>
            <p>Different upgrades. Different runs.</p>
            <div className={s.tags}><a href="/level-up">Level-up Cards →</a><a href="/guides/move-evolutions">Evolution guide →</a></div>
          </div>
        </div>
        <a className={s.tierFeature} href="/rankings">
          <h3>Chase a longer run</h3>
          <p>See the players and partners on the survival boards.</p>
          <div className={s.statBars} aria-hidden="true"><CollectionPokemonArt id={448} name="Lucario" size={88} /><GameIcon name="trophy" size={30} /></div>
          <span className={s.outlineLink}>Survival Rankings →</span>
        </a>
        <a className={s.collectionFeature} href="/gacha">
          <h3>Plan your collection</h3>
          <p>Understand pools, tickets and shiny rolls.</p>
          <div className={s.shinyPair} aria-hidden="true">
            <CollectionPokemonArt id={197} name="Umbreon" size={80} />
            <CollectionPokemonArt id={196} name="Espeon" shiny size={80} />
          </div>
          <span className={s.outlineLink}>Gacha →</span>
        </a>
      </div>
    </section>
  );
}
