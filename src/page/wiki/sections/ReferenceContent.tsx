import { achievements, snapshot } from "@/lib/data/wiki";
import { SourceNote } from "@/components/common/SourceNote";
import s from "@/style/common/content.module.css";
export default function ReferenceContent() {
  return (
    <>
      <p className="notice">
        Choose among {snapshot.counts.achievements} achievement goals. Check
        whether a requirement applies to one run or your overall progress, then
        claim rewards in the game. The Judgment challenges reward survival;
        defeating an invulnerable Arceus is not the objective.
      </p>
      {[...new Set(achievements.map((a) => a.category))].map((cat) => (
        <section key={cat}>
          <h2 className={s.sectionTitle}>{cat}</h2>
          <div className={s.tableWrap}>
            <table className={s.table}>
              <thead>
                <tr>
                  <th>ACHIEVEMENT</th>
                  <th>REQUIREMENT</th>
                  <th>REWARD</th>
                  <th>MEDAL / TITLE</th>
                </tr>
              </thead>
              <tbody>
                {achievements
                  .filter((a) => a.category === cat)
                  .map((a) => (
                    <tr key={a.id}>
                      <td>{a.name}</td>
                      <td className={s.wrapCell}>{a.description}</td>
                      <td>
                        {Object.entries(a.reward)
                          .map(
                            ([k, v]) =>
                              `${v} ${k === "t10" ? "×10 ticket" : k === "t1" ? "ticket" : "coins"}`,
                          )
                          .join(" · ")}
                      </td>
                      <td>
                        {["", "Bronze", "Silver", "Gold"][a.tier]}
                        {a.title ? " · " + a.title : ""}
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </section>
      ))}
      <SourceNote files={["js/data/achievements.js", "js/data/pokedex.js"]} />
    </>
  );
}
