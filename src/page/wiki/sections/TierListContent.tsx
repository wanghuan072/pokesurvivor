import { pokemon } from "@/lib/data/pokemon";
import TierMaker from "@/page/tier-list/TierMaker";
import snapshot from "@/data/game/leaderboards.json";
import editorial from "@/data/tier-list/recommendations.json";
import { recommendationBoard } from "@/lib/game/leaderboards";
import { editorialPicks } from "@/lib/game/editorial-picks";
import { PageHeader } from "@/components/common/PageHeader";
import s from "@/style/page/tier-maker.module.css";
import c from "@/style/common/content.module.css";
const boards = snapshot.boards.map(recommendationBoard);
const picks = editorialPicks(pokemon, editorial.picks);
export default function TierList() {
  return <div className={`${c.wrap} ${s.page}`}>
    <PageHeader path="/tier-list" title="PokeSurvivor Tier List" description="Build your own rankings. Compare our picks, then make the list yours." />
    <nav className={s.jumpLinks} aria-label="Tier list sections"><a href="#create-tier-list">My list</a><a href="#recommendations">Recommended picks</a></nav>
    <TierMaker boards={boards} picks={picks} review={{ date: editorial.reviewed, version: editorial.gameVersion }} partners={pokemon.map(({id,name,types,region})=>({id,name,types,region}))} />
    <section className={s.criteria} aria-labelledby="tier-method"><h2 id="tier-method">How we rank these picks</h2>
      <div className={s.criteriaGrid}><article><h3>Move fit</h3><p>Starting move, Physical or Special attack fit, and available upgrades.</p></article><article><h3>Survival trade-offs</h3><p>HP, defenses, speed and the positioning a partner’s starting move asks of you.</p></article><article><h3>Recorded results</h3><p>Saved survival boards add context. They are not win rates or equal-condition tests.</p></article></div>
      <p className={s.legend}><b>S</b>: first picks · <b>A</b>: strong alternatives · <b>B</b>: stronger with a planned route or careful play · <b>C</b>: lower priority at comparable investment.</p>
      <p className={s.methodNote}>We reviewed all {picks.length} species appearing in the saved Solo and Group boards. Grades compare general Solo progression at similar permanent upgrades, not maximum damage or a specific boss matchup. They weigh the starting move, attack-category fit, usable upgrades, bulk and movement together; they are not calculated from leaderboard frequency. Partners inside a tier are ordered by Pokédex number. B and C picks can still produce long runs. Other species remain unassessed.</p>
      <p className={s.methodNote}>Our judgement uses the checked game build and saved results, not claimed personal playtests. Older advice may predate the Physical/Special split. Active melee grants 25% damage reduction against non-pure damage; Hex benefits from burn, poison or slow on its target. Group results show whole teams, not individual roles, healing support or proven synergy.</p>
      <div className={s.methodLinks}><a href="https://pokesurvivor.com/en/moves/" rel="noopener noreferrer">Official move descriptions ↗</a><a href="https://github.com/JPTER78/pokesurvivor/tree/e4ba0e173cb7e415f9815c924a48c5c25f516962" rel="noopener noreferrer">Reviewed game rules ↗</a><a href="/level-up">Compare move cards →</a><a href="/rankings">View survival records →</a></div>
    </section>
  </div>;
}
