import { waves, getEncounter } from "@/lib/data/game";
import { pokemon } from "@/lib/data/pokemon";
import { PokemonArt } from "@/components/common/PokemonArt";
import { PokemonName } from "@/components/common/PokemonName";
import s from "@/style/page/game-data.module.css";
const clock = (t: number) =>
  `${Math.floor(t / 60)}:${String(t % 60).padStart(2, "0")}`;
export default function WaveReference({
  bosses = false,
}: {
  bosses?: boolean;
}) {
  return (
    <section className={s.reference}>
      <div className={s.heading}>
        <div>
          <small>{bosses ? "BOSS ENCOUNTERS" : "WILD ENCOUNTERS"}</small>
          <h2>
            {bosses
              ? "Boss timeline & eligible partners"
              : "Six wave tiers, different casts"}
          </h2>
        </div>
      </div>
      <p>
        The game selects candidates by base-stat-total (BST) bands. These pools
        are possibilities, not guaranteed appearances. Wild tiers exclude rarity
        5; bosses exclude legendary partners. Later wild tiers join the pool
        instead of replacing every earlier enemy.
      </p>
      <div className={s.timeline}>
        {(bosses ? waves.bosses : waves.tiers).map((row, index) => {
          const candidates = pokemon.filter((p) =>
            (bosses
              ? getEncounter(p.id)?.bossSlots
              : getEncounter(p.id)?.wildTiers
            )?.includes(index),
          );
          const time = "at" in row ? row.at : row.from;
          return (
            <article key={index}>
              <div className={s.timelineTitle}>
                <b>{clock(time)}</b>
                <h3>{bosses ? `Boss ${index + 1}` : `Tier ${index + 1}`}</h3>
                <span>{candidates.length} candidates</span>
              </div>
              <div className={s.factStrip}>
                <span>
                  BST BAND<b>{row.bst.join("–")}</b>
                </span>
                <span>
                  {bosses ? "TEMPLATE HP" : "BASE HP"}
                  <b>{row.hp.toLocaleString("en-US")}</b>
                </span>
                <span>
                  TEMPLATE DAMAGE<b>{row.dmg}</b>
                </span>
                <span>
                  TEMPLATE XP<b>{row.xp}</b>
                </span>
              </div>
              <p className={s.caption}>
                {bosses
                  ? "The archive multiplies boss template HP by 1.35 and damage by 1.2 before time and co-op scaling. Template values below are not final combat stats."
                  : `A run selects ${"cast" in row ? row.cast : 7} partners for this tier. Template stats are further adjusted by species, behavior, time and spawner multipliers.`}
              </p>
              <div className={s.candidatePreview}>
                {candidates.slice(0, 7).map((p) => (
                  <div key={p.id}>
                    <PokemonArt id={p.id} name={p.name} size={56} />
                    <small>{p.name}</small>
                  </div>
                ))}
              </div>
              <details>
                <summary>
                  Browse all {candidates.length} possible partners
                </summary>
                <div className={s.nameGrid}>
                  {candidates.map((p) => (
                    <span key={p.id}>
                      <small>#{p.id}</small> <PokemonName pokemon={p} />
                    </span>
                  ))}
                </div>
              </details>
            </article>
          );
        })}
      </div>
    </section>
  );
}
