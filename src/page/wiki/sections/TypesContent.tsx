import { GameIcon } from "@/components/common/GameIcon";
import { weather } from "@/lib/data/wiki";
import { typeNames, typeMultiplier } from "@/lib/tools/calculators";
import { SourceNote } from "@/components/common/SourceNote";
import s from "@/style/common/content.module.css";
import { defenseFactor } from "@/lib/game/mechanics";
export default function Types() {
  const rainFire = weather.find(w=>w.id==='rain')!.multipliers.fire!;
  return (
    <>
      <article className={`${s.article} prose`}>
        <h2>The game uses softened type factors</h2>
        <p>
          A weakness is 1.6×, a resistance is 0.6×, and a main-series immunity
          becomes 0.3×. Neutral is 1×. Two defending types multiply together:
          1.6 × 1.6 = 2.56× for a double weakness, while 1.6 × 0.6 = 0.96× for a
          mixed matchup.
        </p>
        <p>
          Use the active move’s type, not the attacking partner’s species types.
          Read the chart by row (attack) and column (defense). It lists one
          defending type at a time.
        </p>
        <h3>Two examples you can use during a run</h3>
        <p>A Fire move against a Grass / Steel target gets 1.6 × 1.6 = 2.56× from typing. At full rain intensity, Fire’s {rainFire}× weather factor changes that part of the calculation to {Number((2.56*rainFire).toFixed(3))}×. This is before attack stats, defenses and other modifiers.</p>
        <p>An Electric move against Water / Ground gets 1.6 × 0.3 = 0.48×. Ground’s main-series immunity is softened here; it does not make the attack deal zero damage.</p>
        <h3>Physical and special defenses are a separate step</h3>
        <p>Physical attacks use the target’s Defense; special attacks use Special Defense. A base defense of 75 gives a 1× defense factor; 150 gives about {defenseFactor(150).toFixed(2)}× incoming damage. The factor is softened and capped between 0.78× and 1.25×. Armor cards and held items are separate modifiers. Arceus’s pure damage and map hazards do not follow this defense rule.</p>
        <p><a href="/level-up">Check the move’s category and partner fit →</a></p>
      </article>
      <h2 className={s.sectionTitle}>Complete 18-type matchup chart</h2>
      <div className={s.tableWrap} tabIndex={0} role="region" aria-label="Type chart, scroll horizontally to compare defending types">
        <table className={s.table} data-chart="types">
          <caption className="sr-only">
            Rows are attacking types; columns are defending types.
          </caption>
          <thead>
            <tr>
              <th>ATTACK ↓ / DEFENSE →</th>
              {typeNames.map((t) => (
                <th key={t}>
                  <GameIcon name={`type-${t.toLowerCase()}`} size={18} /> {t}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {typeNames.map((a) => (
              <tr key={a}>
                <th scope="row">
                  <GameIcon name={`type-${a.toLowerCase()}`} size={18} /> {a}
                </th>
                {typeNames.map((d) => (
                  <td key={d} data-factor={typeMultiplier(a, d)}>{typeMultiplier(a, d)}×</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <h2 className={s.sectionTitle}>Weather at full intensity</h2>
      <div className={s.tableWrap}>
        <table className={s.table}>
          <thead>
            <tr>
              <th>WEATHER</th>
              <th>ATTACK MODIFIERS</th>
              <th>ENVIRONMENTAL EFFECT</th>
            </tr>
          </thead>
          <tbody>
            {weather.map((w) => (
              <tr key={w.id}>
                <td>{w.name}</td>
                <td className={s.wrapCell}>
                  {Object.entries(w.multipliers)
                    .map(([type, value]) => type + " " + value + "×")
                    .join(" · ")}
                </td>
                <td className={s.wrapCell}>
                  {w.safeTypes.length
                    ? `Partners without ${w.safeTypes.join(" / ")} typing take weather chip damage.${w.slowsOtherTypes ? " Snow also slows affected partners." : ""}`
                    : "No chip-damage safe-type rule in this weather definition."}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="notice">
        Weather fades in and out over three seconds; these are peak factors.
        Weather affects both sides’ attack types. Multiply the type matchup
        factor by the weather factor to estimate damage before partner stats
        and items.
      </p>
      <SourceNote files={["js/data/types.js", "js/systems/weather.js"]} />
    </>
  );
}
