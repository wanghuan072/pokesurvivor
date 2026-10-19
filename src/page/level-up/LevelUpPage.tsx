import { pokemon } from "@/lib/data/pokemon";
import { getMoveNotes } from "@/lib/data/game";
import { GameIcon } from "@/components/common/GameIcon";
import { PageHeader } from "@/components/common/PageHeader";
import { SourceNote } from "@/components/common/SourceNote";
import { moves } from "@/lib/data/moves";
import { runCards } from "@/lib/data/wiki";
import { pageMetadata } from "@/seo/metadata";
import CardCatalog from "./CardCatalog";
import BossRewards from "./BossRewards";
import s from "@/style/page/level-up.module.css";
import c from "@/style/common/content.module.css";

export const metadata = pageMetadata("/level-up");
const symbols = [
  "heart",
  "fist",
  "boot",
  "clock",
  "shield",
  "sprout",
  "magnet",
  "book",
  "berry",
];
export default function LevelUpPage() {
  return (
    <div className={c.wrap}>
      <PageHeader
        title="PokeSurvivor Level-up Cards"
        category="CHOOSE YOUR NEXT UPGRADE"
        path="/level-up"
        description="Three cards. One choice. Learn a move, strengthen your loadout or collect the stat card that unlocks your next evolution."
      />
      <nav className={s.jump} aria-label="On this page">
        <a href="#move-cards">01 / Move library</a>
        <a href="#stat-cards">02 / Stat cards</a>
        <a href="#evolutions">03 / Evolution rules</a>
        <a href="#boss-rewards">04 / Boss rewards</a>
      </nav>
      <section id="move-cards" className={s.section}>
        <div className={s.sectionHead}>
          <div>
            <small>PLAN YOUR LOADOUT</small>
            <h2>Move & evolution cards</h2>
          </div>
          <span>{moves.length} MOVES · {moves.filter(m=>m.evolution).length} RECIPES</span>
        </div>
        <CardCatalog
          partners={pokemon.map(({id, name, types, startMove, cardPool, learnset, attack, physicalAttack, specialAttack}) =>
            ({id, name, types, startMove, cardPool, learnset, attack, physicalAttack, specialAttack}))}
          moves={moves.map((m) => ({
            ...m,
            ...getMoveNotes(m.id)!,
            partnerCount: pokemon.filter((p) => p.learnset.includes(m.id))
              .length,
          }))}
        />
      </section>
      <section id="stat-cards" className={s.section}>
        <div className={s.sectionHead}>
          <div>
            <small>BUILD YOUR FOUNDATION</small>
            <h2>Stat card collection</h2>
          </div>
          <span>09 CARDS</span>
        </div>
        <p className={s.intro}>
          These cards apply during the current run. One copy of a required card
          can unlock several move evolutions.
        </p>
        <div className={s.statGrid}>
          {runCards.map((card, i) => {
            const recipes = moves.filter((m) => m.requirement === card.name);
            return (
              <article
                className={s.statCard}
                id={`card-${card.id}`}
                key={card.id}
              >
                <div className={s.statArtwork}>
                  <GameIcon name={symbols[i]} size={24} />
                  <small>STAT CARD</small>
                </div>
                <div className={s.statBody}>
                  <div className={s.statHeader}>
                    <h3>{card.name}</h3>
                    <span className={s.cap}>
                      {card.max ? `${card.max} / RUN` : "NO PICK LIMIT"}
                    </span>
                  </div>
                  <p>{card.description}</p>
                  <footer>
                    {recipes.length ? (
                      <a href={`#requires-${card.id}`}>
                        ◆ Unlocks {recipes.length} evolutions ↓
                      </a>
                    ) : (
                      <span>
                        {card.id === "heal"
                          ? "Instant recovery"
                          : "Run progression"}
                      </span>
                    )}
                  </footer>
                </div>
              </article>
            );
          })}
        </div>
        <p className={s.note}>
          Power, Sprint, Reflexes, Magnet and Learning compound with each pick.
          Armor adds damage reduction with a 70% cap when applied; its 12-pick
          limit is separate from that cap. Permanent upgrades and held items can
          affect the starting value.
        </p>
      </section>
      <section id="evolutions" className={s.recipe}>
        <div>
          <small>THE GOLD CARD MOMENT</small>
          <h2>The evolution recipe.</h2>
          <p>
            {moves.filter(m=>m.evolution).length} moves can evolve. The {moves.filter(m=>m.category==='buff').length} buff moves cannot. Meet both requirements
            during the same run, then select the gold card at a level-up.
          </p>
        </div>
        <div className={s.formula}>
          <span>
            <b>ϟ</b>Move level 5
          </span>
          <i>+</i>
          <span>
            <b>♥</b>Required stat card
          </span>
          <i>→</i>
          <span>
            <b>◆</b>Gold evolution card
          </span>
        </div>
        <p>
          The stat card can be taken before or after level 5. When at least one
          evolution is ready, the first ready evolution is guaranteed a place
          among the offered cards.
        </p>
      </section>
      <section className={s.section} aria-label="Evolutions by stat card">
        <div className={s.sectionHead}>
          <div>
            <small>ONE PICK, MORE POSSIBILITIES</small>
            <h2>What does each card unlock?</h2>
          </div>
        </div>
        <div className={s.unlocks}>
          {runCards
            .filter((card) => moves.some((m) => m.requirement === card.name))
            .map((card) => (
              <details id={`requires-${card.id}`} key={card.id}>
                <summary>
                  {card.name}
                  <span>
                    {moves.filter((m) => m.requirement === card.name).length}{" "}
                    recipes
                  </span>
                </summary>
                <div>
                  {moves
                    .filter((m) => m.requirement === card.name)
                    .map((m) => (
                      <a key={m.id} href={`#move-${m.slug}`}>
                        {m.name} <span>→ {m.evolution}</span>
                      </a>
                    ))}
                </div>
              </details>
            ))}
        </div>
      </section>
      <BossRewards />
      <section id="card-rules" className={s.rules}>
        <h2>Make every level count</h2>
        <details>
          <summary>Why am I offered these three cards?</summary>
          <p>
            The game draws distinct cards from a weighted candidate pool. New
            move cards need a free slot and respect the partner’s move pool and
            bans. At most two buff moves can be learned. Owned moves below level
            5 can offer upgrades. Stat cards usually stop appearing at their
            pick limit; a missing evolution requirement is explicitly added to
            the pool.
          </p>
          <p>
            Weights are relative, not fixed probabilities. New moves have weight
            10, move upgrades 8, normal stat cards 4 with room or 7 when slots
            are full. A missing evolution stat card has weight 14; ready
            evolutions have weight 40, with the first one guaranteed.
          </p>
          <p>Before those offers are drawn, the game samples up to six new moves. A move that matches your partner’s stronger attack side has sampling weight 2 instead of 1; buff moves also get weight 2. This favors suitable attacks but does not double their final card probability.</p>
        </details>
        <details>
          <summary>What happens when my four move slots are full?</summary>
          <p>
            New move cards stop appearing until a slot opens. A bond earned from
            defeating a rift legendary can fuse moves into one slot, making room
            for another move. A bonded slot can contain up to four moves.
          </p>
          <a href="/guides/move-evolutions#bonds">Read the bond guide →</a>
        </details>
        <details>
          <summary>How do rerolls and permanent upgrades help?</summary>
          <p>
            Each run has one free reroll. Card reroll adds up to five more; Ban
            can exclude up to three new moves per partner. Repertoire starts you
            with one extra eligible attack move. These are purchased between
            runs and are separate from the stat cards above.
          </p>
        </details>
        <details>
          <summary>Which card should I pick first?</summary>
          <p>
            Choose one or two evolution goals before
            spreading levels across your whole loadout. Take a required stat
            card when it appears; it can support multiple recipes. Save a reroll
            for a choice that does not help your build or survival.
          </p>
          <a href="/guides/move-evolutions">Read the evolution guide →</a>
        </details>
      </section>
      <SourceNote
        files={[
          "js/systems/levelup.js",
          "js/data/moves.js",
          "js/data/upgrades.js",
          "js/data/items.js",
          "js/entities/enemy.js",
          "js/entities/player.js",
          "js/systems/rift.js",
          "js/game.js",
        ]}
      />
    </div>
  );
}
