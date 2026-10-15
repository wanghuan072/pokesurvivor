import { pokemon } from "@/lib/data/pokemon";
import PartnerRankings from "./PartnerRankings";
import { SourceNote } from "@/components/common/SourceNote";
import s from "@/style/common/content.module.css";
export default function TierList() {
  return (
    <>
      <p className="notice">
        Choose a stat to compare starting partners, or narrow the list to the
        29 starter choices. Higher HP gives more room for mistakes, attack
        multiplies move damage and speed helps with repositioning. Ties use
        Pokédex number; your loadout and movement still matter during a run.
      </p>
      <PartnerRankings
        partners={pokemon.map(
          ({
            id,
            slug,
            name,
            hp,
            speed,
            attack,
            rarity,
            starter,
            types,
            hasDetailPage,
          }) => ({
            hasDetailPage,
            id,
            slug,
            name,
            hp,
            speed,
            attack,
            rarity,
            starter,
            types,
          }),
        )}
      />
      <article className={`${s.article} prose`}>
        <h2>How to interpret a tier list</h2>
        <p>
          Attack factor multiplies move damage but does not describe a move’s
          coverage, cooldown or ease of positioning. HP helps absorb mistakes;
          movement speed helps reposition. Permanent upgrades, run cards, items,
          weather and your available moves can change the practical result.
        </p>
        <h2>Choosing a first partner</h2>
        <p>
          Charmander starts with Ember, Squirtle with Water Gun and Bulbasaur
          with Vine Whip. These introduce projectile, piercing projectile and
          melee styles. Slowpoke and Psyduck begin with Confusion. Filter to
          starters above and compare the actual numbers before deciding which
          style you prefer.
        </p>
        <p>
          Choose a main whose move pool supports a clear evolution path. Invest
          coins in that partner and practice moving around the edge of groups. A
          stronger baseline alone does not solve positioning mistakes.
        </p>
        <div className={s.chips}>
          <a href="/builds">Verified-compatible build ideas →</a>
          <a href="/pokedex">Browse full partner data →</a>
        </div>
      </article>
      <SourceNote
        files={[
          "js/data/pokedex.js",
          "js/data/starters.js",
          "js/data/moves.js",
        ]}
      />
    </>
  );
}
