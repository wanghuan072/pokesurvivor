import Image from "next/image";
import { Panel } from "@/components/common/Panel";
import s from "@/style/page/home.module.css";
export default function FeaturedContent() {
  return (
    <div className={s.featured}>
      <Panel
        title="Partner Spotlight"
        icon="♛"
        href="/tier-list"
        more="View Tier List"
      >
        <a href="/tier-list" className={s.story}>
          <div className={s.storyImage}>
            <Image
              src="/art/tier.webp"
              fill
              sizes="(max-width: 768px) 90vw, 30vw"
              alt="Charizard, Gengar, Lucario and Gardevoir in pixel art"
            />
          </div>
          <h3>Compare Starting Partners</h3>
          <p>
            Compare starting attack, HP and speed,
            <br />
            then choose a Pokémon to try next.
          </p>
          <div className={s.tags}>
            <span>Partners</span>
            <span>Tier List</span>
            <span>Base stats</span>
          </div>
        </a>
      </Panel>
      <Panel title="Featured Build" icon="⚒" href="/builds" more="View More">
        <a href="/builds#build-charizard" className={s.story}>
          <div className={s.storyImage}>
            <Image
              src="/art/build.webp"
              fill
              sizes="(max-width: 768px) 90vw, 30vw"
              alt="Charizard surrounded by blazing pixel art flames"
            />
          </div>
          <h3>Blazing Fury — Fire Move Build</h3>
          <p>
            Build toward Fire Blast with Ember and Power.
            <br />A clear evolution goal for your next adventure.
          </p>
          <div className={s.tags}>
            <span>Fire</span>
            <span>Evolution</span>
            <span>Build idea</span>
            <span>Level 5</span>
          </div>
        </a>
      </Panel>
      <Panel title="Beginner Guide" icon="▥" href="/guides" more="View More">
        <a href="/guides/beginner-guide" className={s.story}>
          <div className={s.storyImage}>
            <Image
              src="/art/guide.webp"
              fill
              sizes="(max-width: 768px) 90vw, 30vw"
              alt="Trainer and Eevee begin a journey through ancient ruins"
            />
          </div>
          <h3>Survive Your First Waves</h3>
          <p>
            Learn movement, choose an early upgrade and start your
            <br />
            next PokeSurvivor run with a clear goal.
          </p>
          <div className={s.tags}>
            <span>Beginner</span>
            <span>Tips</span>
            <span>Progression</span>
            <span>Essentials</span>
          </div>
        </a>
      </Panel>
    </div>
  );
}
