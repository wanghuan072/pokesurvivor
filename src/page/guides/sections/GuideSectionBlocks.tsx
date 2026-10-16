import type { GuideSection } from "@/types/guide";
import { CollectionPokemonArt } from "@/components/common/CollectionPokemonArt";
import s from "@/style/page/guides.module.css";
import c from "@/style/common/content.module.css";

export default function GuideSectionBlocks({ section }: { section: GuideSection }) {
  return <>
    {section.steps && <ol>{section.steps.map(text => <li key={text}>{text}</li>)}</ol>}
    {section.bullets && <ul>{section.bullets.map(text => <li key={text}>{text}</li>)}</ul>}
    {section.table && <div className={c.tableWrap}><table className={c.table}>
      <caption>{section.table.caption}</caption>
      <thead><tr>{section.table.columns.map(column => <th scope="col" key={column}>{column}</th>)}</tr></thead>
      <tbody>{section.table.rows.map(row => <tr key={row.join("\u001f")}>{row.map((cell, index) => index === 0
        ? <th scope="row" key={index}>{cell}</th> : <td key={index}>{cell}</td>)}</tr>)}</tbody>
    </table></div>}
    {section.comparisons && <><div className={s.recipeGrid}>{section.comparisons.map(p => <figure key={p.id}>
      <h3>{p.name}</h3>
      <div><span><CollectionPokemonArt id={p.id} name={p.name} size={96} /><small>Normal</small></span>
        <span aria-hidden="true">→</span><span><CollectionPokemonArt id={p.id} name={p.name} size={96} shiny /><small>Shiny</small></span></div>
      <figcaption>{p.note}</figcaption>
    </figure>)}</div><p className={c.source}>Game sprites: SpriteCollab, CC BY-NC 4.0. <a href="/legal/copyright">Artwork credits and license →</a></p></>}
    {section.callout && <aside className={s.takeaways}><h3>{section.callout.title}</h3><p>{section.callout.text}</p></aside>}
    {section.questions?.map(q => <details className={s.referenceToggle} key={q.question}><summary>{q.question}</summary><div><p>{q.answer}</p></div></details>)}
    {section.links && <nav className={c.chips} aria-label={`Related pages for ${section.title}`}>{section.links.map(link => <a href={link.href} key={link.href}>{link.label} →</a>)}</nav>}
  </>;
}
