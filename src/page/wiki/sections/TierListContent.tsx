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
const recordedIds = new Set(snapshot.boards.flatMap(board => board.rows.flatMap(row => row.pokemon.map(partner => partner.id))));
const picks = editorialPicks(pokemon, editorial.picks.filter(pick => recordedIds.has(pick.id)));
export default function TierList() {
  return <div className={`${c.wrap} ${s.page}`}>
    <PageHeader path="/tier-list" title="PokeSurvivor Tier List" description="Not sure who to take into your next run? See who we'd pick, check the trade-offs, then build a tier list of your own." />
    <nav className={s.jumpLinks} aria-label="Tier list sections"><a href="#create-tier-list">My list</a><a href="#recommendations">Recommended picks</a></nav>
    <TierMaker boards={boards} picks={picks} review={{ date: editorial.reviewed, version: editorial.gameVersion }} partners={pokemon.map(({id,name,types,region})=>({id,name,types,region}))} />
    <section className={s.criteria} aria-labelledby="tier-method"><h2 id="tier-method">How we rank these picks</h2>
      <div className={s.criteriaGrid}><article><h3>What do we start with?</h3><p>We look for an opening move that fits the partner&apos;s stronger attack stat, then consider what we&apos;d upgrade next.</p></article><article><h3>How much room for mistakes?</h3><p>Damage matters, but so do getting out of a closing gap and surviving a hit. We weigh speed, HP and both defenses together.</p></article><article><h3>What do the boards tell us?</h3><p>We include saved results so you can compare our picks with recorded runs. A popular partner doesn&apos;t automatically get our highest grade.</p></article></div>
      <p className={s.legend}><b>S</b>: our first picks · <b>A</b>: strong alternatives · <b>B</b>: picks we&apos;d take with a plan · <b>C</b>: lower priority · <b>D</b>: picks we&apos;d avoid at comparable investment.</p>
      <p className={s.methodNote}>We compare these {picks.length} species from the current saved boards for general Solo progression at similar permanent investment, including the 400-coin Starting move upgrade. A heavily upgraded favorite may suit your save better than an untouched S-tier pick. D is available but empty; we do not force a low grade to fill it. The selection changes as the captured top 50 changes, while earlier assessments remain on file. Falling out of a board does not lower a partner&apos;s grade. Within each tier, partners use Pokédex order.</p>
      <p className={s.methodNote}>We weigh legal move routes, player discussions and recorded results together. The capture date tells you when we read the board, not when every run happened. Records do not include the build, cards or permanent upgrades used, so even a freshly captured board cannot prove a current-patch best build. New entries receive a move-route assessment rather than a grade calculated from their time. Single-type partners gain 20% damage with their own-type attacks. Defense factors are softened to 0.78–1.25× incoming damage, and active melee reduces non-pure damage by 25%. Group records describe whole teams; they do not establish individual roles or synergy. No controlled playtest or community vote is claimed.</p>
      <div className={s.methodLinks}><a href="https://www.reddit.com/r/pokesurvivor/comments/1x40y7j/how_important_is_the_pokemon_you_choose_best_ones/" rel="noopener noreferrer">Player picks &amp; discussion ↗</a><a href="https://github.com/JPTER78/pokesurvivor/tree/68452288808481af75fd27cfff0de458f3d6b6d4" rel="noopener noreferrer">Current game rules ↗</a><a href="/level-up">Compare move cards →</a><a href="/rankings">View survival records →</a></div>
      <p className={s.methodNote}>For now, we would keep a dependable main attack while trying the newer homing and bouncing moves: twelve still fire only one projectile after their first projectile-count upgrade. We account for the moves available today without treating an unmerged fix as a damage increase. This limitation alone does not justify changing every affected partner&apos;s grade. <a href="/level-up#current-move-notes">Check the affected cards →</a></p>
    </section>
  </div>;
}
