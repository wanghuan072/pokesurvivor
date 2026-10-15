import Image from "next/image";
import { builds } from "@/lib/data/builds";
import { pokemon } from "@/lib/data/pokemon";
import { getMove, getMoveById } from "@/lib/data/moves";
import { items } from "@/lib/data/wiki";
import { buildLeads } from "@/config/builds";
import { PageHeader } from "@/components/common/PageHeader";
import { MoveIcon } from "@/components/common/GameIcon";
import { SourceNote } from "@/components/common/SourceNote";
import type { BuildPreview } from "@/types/build";
import BuildCollection from "./components/BuildCollection";
import s from "@/style/page/builds.module.css";
import c from "@/style/common/content.module.css";

export default function Builds() {
  const previews: BuildPreview[] = builds.map((b) => {
    const move = getMove(b.move)!;
    const lead = pokemon.find((p) => p.id === buildLeads[b.slug])!;
    return {
      slug: b.slug,
      title: b.title.split(" — ")[0],
      description: b.description,
      lead: { id: lead.id, name: lead.name },
      partners: b.partners.map((id) => {
        const p = pokemon.find((p) => p.id === id)!;
        return { id: p.id, name: p.name };
      }),
      move: {
        id: move.id, name: move.name, type: move.type,
        evolution: move.evolution!, requirement: move.requirement!
      },
      support: b.supportMoves.map((id) => {
        const move = getMoveById(id)!;
        return { id: move.id, name: move.name, slug: move.slug,
          evolution: move.evolution, requirement: move.requirement };
      }),
      tips: b.tips,
      items: b.items.map((id) => {
        const item = items.find((item) => item.id === id)!;
        return { id: item.id, name: item.name, description: item.description };
      }),
    };
  });
  const featured = previews.find((build) => build.slug === "charizard")!;
  return (
    <div className={c.wrap}>
      <PageHeader
        title="PokeSurvivor Builds"
        description="Pick a partner. Find your evolution path. Turn the next card offer into a stronger run."
        path="/builds"
        category="THE LOADOUT FIELD GUIDE"
      />
      <div className={s.spotlight}>
        <section className={s.featured} aria-label="Featured fire build">
          <div className={s.featureArt}>
            <Image src="/art/build.webp" alt="Charizard surrounded by blazing pixel-art flames"
              fill sizes="(max-width: 768px) 90vw, 35vw" />
            <span className={s.featureBadge}>✦ FEATURED LOADOUT</span>
            <span className={s.artCaption}>CHARIZARD / FIRE</span>
          </div>
          <div className={s.featureCopy}>
            <span className={s.eyebrow}>ONE CLEAR EVOLUTION GOAL</span>
            <h2>Bring the fire.</h2>
            <p>Build around Ember, pick up Power and work toward Fire Blast. Your first evolution starts with a plan.</p>
            <div className={s.featureRecipe}>
              <MoveIcon id={featured.move.id} size={30} />
              <span>Ember <small>LV. 5 + POWER</small></span>
              <b aria-hidden="true">→</b>
              <strong>Fire Blast</strong>
            </div>
            <a className={s.featureCta} href="#build-library">Browse the build collection <span aria-hidden="true">↓</span></a>
          </div>
        </section>
        <aside className={s.fieldNotes} aria-labelledby="build-field-notes">
          <span className={s.eyebrow}>BEFORE YOU DROP IN</span>
          <h2 id="build-field-notes">A loadout, in three steps.</h2>
          <ol>
            <li><span>01</span><div><strong>Choose your partner</strong><p>Check its move pool before committing.</p></div></li>
            <li><span>02</span><div><strong>Focus one evolution</strong><p>Level the move and take its required card.</p></div></li>
            <li><span>03</span><div><strong>Adapt to the run</strong><p>Switch for coverage; a Rift Bond can combine learned attacks.</p></div></li>
          </ol>
          <a href="/guides/move-evolutions">Read the build fundamentals →</a>
        </aside>
      </div>
      <BuildCollection builds={previews} />
      <div className={s.notes}>
        <span aria-hidden="true">◇</span>
        <p><strong>Plans to explore. Room to improvise.</strong> Each plan uses moves its listed partners can learn. Prioritize an evolution, then adapt to the cards you receive. Separate active slots do not fire together without a Bond; these plans are suggestions, not damage rankings.</p>
        <a href="/level-up">Browse upgrade cards →</a>
      </div>
      <SourceNote files={["js/data/moves.js", "js/data/pokedex.js", "js/data/items.js"]} />
    </div>
  );
}
