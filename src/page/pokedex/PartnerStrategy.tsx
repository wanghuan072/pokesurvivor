import Image from "next/image";
import type { Pokemon } from "@/types/pokemon";
import { PokemonArt } from "@/components/common/PokemonArt";
import { pokemon } from "@/lib/data/pokemon";
import { moves } from "@/lib/data/moves";
import recommendations from "@/data/tier-list/recommendations.json";
import leaderboards from "@/data/game/leaderboards.json";
import s from "@/style/page/pokedex.module.css";

const time=(seconds:number)=>`${Math.floor(seconds/60)}:${String(Math.floor(seconds%60)).padStart(2,"0")}`;
export default function PartnerStrategy({partner:p}:{partner:Pokemon}) {
  const plan=p.detail?.strategy;
  if(!plan) return null;
  const grade=recommendations.picks.find(pick=>pick.id===p.id)?.tier;
  const boards=leaderboards.boards.filter(board=>board.period==="weekly");
  return <>
    <section className={s.detailSection} aria-labelledby="strength"><div className={s.detailHeading}><h2 id="strength">How strong is {p.name}?</h2>{grade&&<span className={s.grade}>{grade} · EDITORIAL SOLO GRADE</span>}</div>
      <h3 className={s.strategyTitle}>{plan.strength.headline}</h3><p>{plan.strength.verdict}</p><p>{plan.strength.tradeoff}</p>
      <div className={s.recordPanels}>{boards.map(board=>{
        const rows=board.rows.filter(row=>row.pokemon.some(partner=>partner.id===p.id));
        return <div key={board.key}><h4>{board.mode==="solo"?"Solo":"Group"} · Weekly</h4><strong>{rows.length} / {board.rows.length} records</strong>
          {rows.length>0?<ul>{rows.map(row=><li key={row.rank}>#{row.rank} · {time(row.seconds)}{board.mode==="group"&&` · ${row.pokemon.map(member=>pokemon.find(mon=>mon.id===member.id)?.name??`#${member.id}`).join(" + ")}`}</li>)}</ul>:<p>No {p.name} entry in this saved top {board.rows.length}. That alone does not establish a low tier.</p>}
          <small>Captured {board.capturedAt.slice(0,10)} · {new Date(board.capturedAt).toISOString().slice(11,16)} UTC</small>
        </div>;
      })}</div>
      <p className={s.strategyNote}>Our recommendation combines this partner’s move options and base stats with the records available. These saved boards predate the expanded move pool; they show recorded runs, not win rates or a current-patch build test. <a href="/rankings">Browse the records →</a>{grade&&<> · <a href="/tier-list#recommendations">Compare our tier recommendations →</a></>}</p>
    </section>
    <section className={s.detailSection} aria-labelledby="recommended-moves"><div className={s.detailHeading}><h2 id="recommended-moves">Moves we would choose</h2><span>ONE MAIN ROUTE FIRST</span></div>
      <p>These are priorities and alternatives, not three attacks you receive or fire together. The selected slot keeps casting; existing projectiles, placed fields and temporary buffs can remain after switching. Bonds let several moves keep casting from one selected group.</p>
      <p>A buff cast adds a stack rather than instantly granting the maximum bonus. Refresh it, return to damage before it expires, or combine it with damage in a Bond. It affects your player, not the whole team. Do not pass up a useful damage upgrade just to complete this list.</p>
      <div className={s.recommendedMoves}>{plan.moves.map(pick=>{
        const move=moves.find(move=>move.id===pick.id)!;
        return <div key={pick.id}><small>{pick.role}</small><div className={s.detailOpening}><Image src={`/game/moves/${move.id}.png`} alt="" width={44} height={44} unoptimized/><div><h3><a href={`/level-up?partner=${p.id}#move-${move.slug}`}>{move.name}</a></h3><span>{move.category} · {move.type}</span></div></div><p>{pick.reason}</p>{move.evolution&&<p className={s.detailRecipe}><strong>{move.evolution}</strong><span>Lv. {move.maxLevel} {move.name} + {move.requirement}</span></p>}</div>;
      })}</div>
      <h3 className={s.strategyTitle}>Upgrade order</h3><ol className={s.upgradeOrder}>{plan.order.map(step=><li key={step}>{step}</li>)}</ol><p className={s.strategyFallback}><strong>If the cards do not cooperate: </strong>{plan.fallback}</p>
    </section>
    <section className={s.detailSection} aria-labelledby="team-play"><div className={s.detailHeading}><h2 id="team-play">Who we would pair with {p.name}</h2><span>CO-OP PAIRINGS TO TRY</span></div><p>{plan.teamPlan}</p>
      <div className={s.teamPartners}>{plan.teammates.map(pick=>{
        const mate=pokemon.find(mate=>mate.id===pick.id)!,move=moves.find(move=>move.id===pick.moveId)!;
        return <div key={mate.id}><div className={s.detailOpening}><PokemonArt id={mate.id} name={mate.name} size={64}/><div><h3>{mate.hasDetailPage?<a href={`/pokedex/${mate.slug}`}>{mate.name}</a>:mate.name}</h3><a href={`/level-up?partner=${mate.id}#move-${move.slug}`}>Consider {move.name} →</a></div></div><p>{pick.reason}</p></div>;
      })}</div>
      <p className={s.strategyNote}>Kanto pairings to try, not an all-roster co-op ranking or a tested best team. Each player manages their own active slot and buffs. A partner knowing a move does not mean it keeps casting throughout the run.</p>
    </section>
    <section className={s.detailSection} aria-labelledby="practical-tips"><div className={s.detailHeading}><h2 id="practical-tips">Small decisions that help</h2><span>POSITION · SWITCH · UPGRADE</span></div><ol className={s.practicalTips}>{plan.techniques.map(tip=><li key={tip.title}><h3>{tip.title}</h3><p>{tip.text}</p></li>)}</ol></section>
  </>;
}
