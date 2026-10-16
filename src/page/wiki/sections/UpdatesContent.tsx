import { changes } from "@/lib/data/wiki";
import { SourceNote } from "@/components/common/SourceNote";
import s from "@/style/common/content.module.css";
export default function Updates() {
  return (
    <>
      <article className={`${s.article} prose`}>
        <span className="tag">OCTOBER 15, 2026 · SITE UPDATE</span>
        <h2>Find the next choice without opening another page</h2>
        <p>Pokédex entries stay in the partner list, move upgrades expand on the Level-up page and partner rankings compare the roster’s starting stats. The guides cover survival, evolutions and collecting partners, including shiny hunting.</p>
        <p>Partner rankings compare base attack, HP and speed rather than assigning untested strength ratings. Page descriptions and FAQs now explain the decisions each section helps you make. Version differences are explained alongside the affected rules.</p>
      </article>
      <h2 className={s.sectionTitle}>Dated game changes</h2>
      {changes.slice(0, 4).map((c) => (
        <article className={`${s.article} prose`} key={c.date}>
          <span className="tag">{c.date} · GAME CHANGE</span>
          <h2>{c.title}</h2>
          {c.added.length > 0 && (
            <>
              <h3>Added</h3>
              <ul>
                {c.added.slice(0, 3).map((t) => (
                  <li key={t}>{t}</li>
                ))}
              </ul>
            </>
          )}
          {c.changed.length > 0 && (
            <>
              <h3>Changed</h3>
              <ul>
                {c.changed.slice(0, 3).map((t) => (
                  <li key={t}>{t}</li>
                ))}
              </ul>
            </>
          )}
          {c.fixed.length > 0 && (
            <>
              <h3>Fixed</h3>
              <ul>
                {c.fixed.slice(0, 3).map((t) => (
                  <li key={t}>{t}</li>
                ))}
              </ul>
            </>
          )}
        </article>
      ))}
      <SourceNote
        files={[
          "version.json",
          "js/data/changelog.js",
          "js/data/achievements.js",
        ]}
      />
    </>
  );
}
