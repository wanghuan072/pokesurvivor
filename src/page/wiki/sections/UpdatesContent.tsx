import { changes } from "@/lib/data/wiki";
import { SourceNote } from "@/components/common/SourceNote";
import releases from "@/data/site/releases.json";
import { GameIcon } from "@/components/common/GameIcon";
import s from "@/style/page/updates.module.css";
export default function Updates() {
  return (
    <>
      <nav className={s.jump} aria-label="Update sections"><a href="#site-updates"><GameIcon name="book" size={24} /> Fan guide updates <span>02 entries →</span></a><a href="#game-updates"><GameIcon name="clock" size={24} /> Game change archive <span>{String(changes.length).padStart(2,"0")} entries →</span></a></nav>
      <section id="site-updates" className={s.section}>
        <header className={s.heading}><div><small>THE FAN GUIDE</small><h2>What’s new on the site</h2></div><span>Website changes, not game patches</span></header>
        <div className={s.releases}>{releases.map((release,index) => <article key={release.date} className={s.release} data-latest={index===0}>
          <div className={s.date}><time dateTime={release.date}>{release.date}</time><span>{index===0 ? "LATEST SITE UPDATE" : "SITE UPDATE"}</span></div>
          <div className={s.copy}><h3>{release.title}</h3><p>{release.summary}</p><ul>{release.changes.map(change => <li key={change}>{change}</li>)}</ul><div className={s.links}>{release.links.map(link => <a href={link.href} key={link.href}>{link.label} →</a>)}</div></div>
        </article>)}</div>
      </section>
      <section id="game-updates" className={s.section}>
        <header className={s.heading}><div><small>DATED GAME HISTORY</small><h2>Game change archive</h2></div><span>Recorded entries through 14 October 2026</span></header>
        <p className={s.notice}>These are dated entries retained by this guide, not a live patch feed. Later changes may exist. Check the official game’s “What’s new” panel before following an older rule.</p>
        <div className={s.archive}>{changes.map((change,index) => <details key={change.date} open={index===0}>
          <summary><time dateTime={change.date}>{change.date}</time><h3>{change.title}</h3><span aria-hidden="true">+</span></summary>
          <div className={s.changeGroups}>{[["Added",change.added],["Changed",change.changed],["Fixed",change.fixed]].map(([label,items]) => (items as string[]).length > 0 && <section key={label as string}><h4>{label}</h4><ul>{(items as string[]).map(item => <li key={item}>{item}</li>)}</ul></section>)}</div>
        </details>)}</div>
      </section>
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
