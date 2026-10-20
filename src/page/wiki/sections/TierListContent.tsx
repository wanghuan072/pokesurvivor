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
    <PageHeader path="/tier-list" title="PokeSurvivor Tier List" description="Not sure who to take into your next run? See who we'd pick, check the trade-offs, then build a tier list of your own." />
    <nav className={s.jumpLinks} aria-label="Tier list sections"><a href="#create-tier-list">My list</a><a href="#recommendations">Recommended picks</a></nav>
    <TierMaker boards={boards} picks={picks} review={{ date: editorial.reviewed, version: editorial.gameVersion }} partners={pokemon.map(({id,name,types,region})=>({id,name,types,region}))} />
    <section className={s.criteria} aria-labelledby="tier-method"><h2 id="tier-method">How we rank these picks</h2>
      <div className={s.criteriaGrid}><article><h3>What do we start with?</h3><p>We look for an opening move that fits the partner&apos;s stronger attack stat, then consider what we&apos;d upgrade next.</p></article><article><h3>How much room for mistakes?</h3><p>Damage matters, but so do getting out of a closing gap and surviving a hit. We weigh speed, HP and both defenses together.</p></article><article><h3>What do the boards tell us?</h3><p>We include saved results so you can compare our picks with recorded runs. A popular partner doesn&apos;t automatically get our highest grade.</p></article></div>
      <p className={s.legend}><b>S</b>: our first picks · <b>A</b>: strong alternatives · <b>B</b>: picks we&apos;d take with a plan · <b>C</b>: lower priority · <b>D</b>: picks we&apos;d avoid at comparable investment.</p>
      <p className={s.methodNote}>We compare these {picks.length} species for general Solo progression at similar permanent investment, including access to the 400-coin Starting move upgrade. A heavily upgraded favorite may still suit your save better than an untouched S-tier pick. These species already appeared on saved leaderboards, so the selection leans toward capable partners. D is available but empty; we don&apos;t force partners into it or treat missing feedback as weakness. Within a tier, partners use Pokédex order. Other species remain unassessed.</p>
      <p className={s.methodNote}>We weigh current move routes, player discussions and recorded results together. None of this is a controlled playtest or a community vote. The saved boards predate the 38-move update, so their times are historical context, not proof of the current best build. Single-type partners now gain 20% damage with their own-type attacks. Defense factors are softened to 0.78–1.25× incoming damage; a low defense number alone is not a reason to drop a partner several tiers. Active melee reduces non-pure damage by 25%. For Group, we show whole recorded teams without inventing roles or synergy.</p>
      <div className={s.methodLinks}><a href="https://www.reddit.com/r/pokesurvivor/comments/1x40y7j/how_important_is_the_pokemon_you_choose_best_ones/" rel="noopener noreferrer">Player picks &amp; discussion ↗</a><a href="https://github.com/JPTER78/pokesurvivor/tree/018e986f4c12f414dfa84193ee35b2959b1e325c" rel="noopener noreferrer">Current game rules ↗</a><a href="/level-up">Compare move cards →</a><a href="/rankings">View survival records →</a></div>
    </section>
  </div>;
}
