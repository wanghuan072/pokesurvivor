import type { Pokemon } from "@/types/pokemon";
import { getMoveById } from "@/lib/data/moves";
import { gacha } from "@/lib/data/wiki";
import s from "@/style/common/content.module.css";
export default function PokemonFacts({ pokemon: p }: { pokemon: Pokemon }) {
  const start = getMoveById(p.startMove);
  const pool = gacha.banners.find((b) => b.region === p.region)!.counts[
    p.rarity - 1
  ];
  const rate = gacha.rates.find((r) => r.rarity === p.rarity)!.percent / pool;
  return (
    <>
      <h2>{p.name} base game stats</h2>
      <div className={s.tableWrap}>
        <table className={s.table}>
          <thead>
            <tr>
              <th>HP</th>
              <th>MOVE SPEED</th>
              <th>ATTACK FACTOR</th>
              <th>RARITY</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>{p.hp}</td>
              <td>{p.speed}</td>
              <td>{p.attack.toFixed(2)}×</td>
              <td>{p.rarity}★</td>
            </tr>
          </tbody>
        </table>
      </div>
      <p>
        These are PokeSurvivor’s starting values before permanent upgrades, run
        cards, held items and buffs. Attack factor is a damage multiplier, not a
        main-series Attack stat or a measured DPS score.
      </p>
      <h2>Starting move & unlock route</h2>
      <p>
        {p.name} begins with{" "}
        {start ? (
          <a href={"/level-up#move-" + start.slug}>{start.name}</a>
        ) : (
          p.startMove
        )}
        .{" "}
        {p.starter
          ? "It is one of the 29 starter choices and also appears in its regional banner."
          : "It belongs to the " +
            p.region[0].toUpperCase() +
            p.region.slice(1) +
            " regional gacha banner."}{" "}
        The {p.rarity}★ pool contains {pool} partners, giving a base per-pull
        chance of approximately <strong>{rate.toFixed(4)}%</strong> for this
        species before pity or the ten-pull guarantee.
      </p>
      <p>
        {p.rarity === 5
          ? "The 70-pull pity guarantees this rarity, not this particular Pokémon."
          : "A 5★ pity result does not guarantee this lower-rarity species."}{" "}
        <a href="/guides/gacha-and-tickets#guarantees">
          Understand banner odds and pity →
        </a>
      </p>
      <h2>All {p.learnset.length} learnable moves</h2>
      <p>
        Level-up cards draw from Normal moves and the partner’s types. A
        starting-move exception can add an attack outside that card pool; it is
        included below because it can still be upgraded. Four slots, card offers
        and bans limit the run.
      </p>
      <div className={s.tableWrap}>
        <table className={s.table}>
          <thead>
            <tr>
              <th>MOVE</th>
              <th>TYPE</th>
              <th>EVOLUTION</th>
              <th>CARD</th>
            </tr>
          </thead>
          <tbody>
            {p.learnset.map((id) => {
              const m = getMoveById(id)!;
              return (
                <tr key={id}>
                  <td>
                    <a href={"/level-up#move-" + m.slug}>
                      {m.name}
                      {id === p.startMove ? " · START" : ""}
                      {!p.cardPool.includes(id) ? " · STARTER EXCEPTION" : ""}
                    </a>
                  </td>
                  <td>{m.type}</td>
                  <td>{m.evolution || "Support move"}</td>
                  <td>{m.requirement || "—"}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </>
  );
}
