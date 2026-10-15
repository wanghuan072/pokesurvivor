import PartnerPlan from "./PartnerPlan";
import { getSpriteAssets } from "@/lib/data/game";
import SpriteGallery from "./SpriteGallery";
import EncounterFacts from "./EncounterFacts";
import type { Pokemon } from "@/types/pokemon";
import { PageHeader } from "@/components/common/PageHeader";
import { PokemonArt } from "@/components/common/PokemonArt";
import {
  relatedPartners,
  defensiveMatchups,
} from "@/lib/pokedex/related-partners";
import s from "@/style/common/content.module.css";
import PokemonFacts from "./PokemonFacts";
import { SourceNote } from "@/components/common/SourceNote";
export default function PokemonPage({ pokemon: p }: { pokemon: Pokemon }) {
  const matchups = defensiveMatchups(p.types),
    related = relatedPartners(p);
  return (
    <div className={s.wrap}>
      <PageHeader
        title={`${p.name} in PokeSurvivor`}
        description={`Meet ${p.name}, ${/^[AEIOU]/.test(p.types[0]) ? "an" : "a"} ${p.types.join(" / ")}-type partner from ${p.region[0].toUpperCase() + p.region.slice(1)}. Explore its role in the roster and plan your next survival run.`}
        path={`/pokedex/${p.slug}`}
        category={`POKÉDEX #${String(p.id).padStart(3, "0")}`}
      />
      <article className={`${s.article} prose`}>
        <div className={s.detailHero}>
          <PokemonArt id={p.id} name={p.name} size={160} />
          <div>
            <h2>{p.name}</h2>
            <div className={s.chips}>
              {p.types.map((t) => (
                <a href="/types" key={t}>
                  {t}
                </a>
              ))}
            </div>
            <p>
              Region:{" "}
              <strong>{p.region[0].toUpperCase() + p.region.slice(1)}</strong>
              <br />
              Roster category:{" "}
              <strong>
                {p.starter
                  ? "Starter partner"
                  : p.legendary
                    ? "Legendary partner"
                    : "Collectible partner"}
              </strong>
            </p>
          </div>
        </div>
        <PokemonFacts pokemon={p} />
        <PartnerPlan id={p.id} />
        <EncounterFacts pokemon={p} />
        <SpriteGallery name={p.name} {...getSpriteAssets(p.id)!} />
        <h2>How to play with {p.name}</h2>
        <p>
          {p.starter
            ? `${p.name} is marked as a starter in the official roster. Look for it in the starting partner selection before your run.`
            : `Find ${p.name} in the collection and check the corresponding regional gacha banner in the game. Tickets earned through play are used to expand your partner collection.`}
        </p>
        <p>
          When your run begins, inspect the starting move and choose upgrades
          that support your active attack. The Pokémon’s species typing helps
          you plan coverage, but the selected move’s type determines the attack
          matchup. Read the <a href="/types">type matchup chart</a>{" "}
          before choosing a new attack.
        </p>
        <h2>{p.name} type matchups</h2>
        <p>
          These base defensive factors use {p.types.join(" / ")} typing and the
          game’s reference chart. Values above 1 mean incoming attacks are
          stronger; values below 1 mean reduced effectiveness. Weather and
          upgrades are excluded.
        </p>
        <div className={s.chips}>
          {matchups.map((m) => (
            <span className="tag" key={m.type}>
              {m.type} {m.multiplier}×
            </span>
          ))}
        </div>
        <h2>A simple plan for your next run</h2>
        <ol>
          <li>
            Keep an escape route open and collect nearby experience without
            crossing the horde.
          </li>
          <li>
            Improve one primary attack before spreading upgrades across several
            moves.
          </li>
          <li>
            Check the <a href="/level-up#evolutions">move evolution table</a>{" "}
            for the required stat card.
          </li>
          <li>
            Use the game’s partner upgrade screen to inspect current,
            partner-specific upgrades.
          </li>
        </ol>
        <p className="notice">
          Data describes a pinned game build. Check the game’s current
          collection screen if an update changes a value or a move pool.
        </p>
        {related.length > 0 && (
          <>
            <h2>
              More {p.region[0].toUpperCase() + p.region.slice(1)} partners to
              explore
            </h2>
            <p>
              Other partners from the same region that share at least one type
              with {p.name}.
            </p>
            <div className={s.chips}>
              {related.map((partner) => (
                <a href={"/pokedex/" + partner.slug} key={partner.id}>
                  {partner.name} →
                </a>
              ))}
            </div>
          </>
        )}
        <div className={s.chips}>
          <a href="/pokedex">← All Pokémon</a>
          <a href="/builds">Explore builds →</a>
          <a href="/play">Play with a partner →</a>
        </div>
        <SourceNote
          files={[
            "js/data/pokedex.js",
            "js/data/starters.js",
            "js/data/moves.js",
            "js/systems/gacha.js",
          ]}
        />
      </article>
    </div>
  );
}
