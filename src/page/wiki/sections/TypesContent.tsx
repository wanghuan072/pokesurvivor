import { GameIcon } from "@/components/common/GameIcon";
import { weather } from "@/lib/data/wiki";
import { typeNames, typeMultiplier } from "@/lib/tools/calculators";
import { SourceNote } from "@/components/common/SourceNote";
import s from "@/style/common/content.module.css";
export default function Types() {
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
      </article>
      <h2 className={s.sectionTitle}>Complete 18-type matchup chart</h2>
      <div className={s.tableWrap}>
        <table className={s.table}>
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
                  <td key={d}>{typeMultiplier(a, d)}×</td>
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
