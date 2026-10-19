import { pokemon } from "@/lib/data/pokemon";
import TierMaker from "@/page/tier-list/TierMaker";
import snapshot from "@/data/game/leaderboards.json";
import editorial from "@/data/tier-list/recommendations.json";
import { recommendationBoard } from "@/lib/game/leaderboards";
import { editorialPicks } from "@/lib/game/editorial-picks";
import { PageHeader } from "@/components/common/PageHeader";
import s from "@/style/page/tier-maker.module.css";
import c from "@/style/common/content.module.css";
const boards = snapshot.boards.filter(board => board.period === "weekly").map(recommendationBoard);
const picks = editorialPicks(pokemon, editorial.picks);
export default function TierList() {
  return <div className={`${c.wrap} ${s.page}`}>
    <PageHeader path="/tier-list" title="PokeSurvivor Tier List" description="Build your own rankings. Compare our picks, then make the list yours." />
    <nav className={s.jumpLinks} aria-label="Tier list sections"><a href="#create-tier-list">My list</a><a href="#recommendations">Recommended picks</a></nav>
    <TierMaker boards={boards} picks={picks} review={{ date: editorial.reviewed, version: editorial.gameVersion }} partners={pokemon.map(({id,name,types,region})=>({id,name,types,region}))} />
    <section className={s.criteria} aria-labelledby="tier-method"><h2 id="tier-method">How we rank these picks</h2>
      <div className={s.criteriaGrid}><article><h3>Move fit</h3><p>Starting move, Physical or Special attack fit, and available upgrades.</p></article><article><h3>Survival trade-offs</h3><p>HP, defenses, speed and the positioning a partner’s starting move asks of you.</p></article><article><h3>Recorded results</h3><p>Saved survival boards add context. They are not win rates or equal-condition tests.</p></article></div>
      <p className={s.legend}><b>S</b>: first picks · <b>A</b>: strong alternatives · <b>B</b>: plan-around picks · <b>C</b>: lower priority for this brief.</p>
      <p className={s.methodNote}>These are editorial priorities for general Solo progression within this eight-partner shortlist. Permanent upgrades, cards, weather and player decisions can change a run. Unlisted partners are not assessed. No gameplay test results are claimed. Group records are considered separately.</p>
      <div className={s.methodLinks}><a href="/level-up">Compare move cards →</a><a href="/rankings">View survival records →</a></div>
    </section>
  </div>;
}
