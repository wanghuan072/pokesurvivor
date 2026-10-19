"use client";
import { useState } from "react";
import { periodLabel, survivalTime } from "@/lib/game/leaderboard-format";
import { tierColors } from "@/lib/game/leaderboards";
import type { RecommendationBoard, RecommendationSelection, RecommendationCohort, TierBoardRow, TierPreset, EditorialPick, TierLabel, TeamRecord } from "@/types/leaderboard";
import { TierArt } from "./TierArt";
import s from "@/style/page/tier-maker.module.css";

const capturedDate = new Intl.DateTimeFormat("en-GB", { dateStyle: "medium", timeStyle: "short", timeZone: "UTC" });
const tierLabels = ["S", "A", "B", "C"] as const;
type Props = {
  board?: RecommendationBoard; cohort?: RecommendationCohort;
  partners: { id: number; name: string }[]; personalRows: TierBoardRow[]; picks: EditorialPick[];
  review: { date: string; version: string }; selection: RecommendationSelection;
  onChange: (selection: RecommendationSelection) => void;
  onApply: (tiers: TierPreset[]) => boolean; canUndo: boolean; onUndo: () => void; status: string;
};
export default function TierRecommendations({ board, cohort, partners, personalRows, picks, review, selection, onChange, onApply, canUndo, onUndo, status }: Props) {
  const names = new Map(partners.map(p => [p.id, p.name]));
  const positions = new Map(personalRows.flatMap(row => row.partners.map(id => [id, row.label] as const)));
  const [showAll, setShowAll] = useState(false);
  return <section id="recommendations" className={s.recommendations} aria-labelledby="recommended-heading">
    <header className={s.recommendationHeader}><div className={s.recommendationTitle}><h2 id="recommended-heading">Recommended picks</h2><div className={s.toggleGroup} role="group" aria-label="Recommendation mode">{(["solo", "group"] as const).map(mode => <button key={mode} aria-pressed={selection.mode === mode} onClick={() => onChange({ ...selection, mode })}>{mode === "solo" ? "Solo" : "Group"}</button>)}</div></div><div className={s.reviewStamp}>Rules checked <time dateTime={review.date}>{review.date}</time><small>Game {review.version}</small></div></header>
    <p className={s.recommendationIntro}>{selection.mode === "solo" ? "General Solo shortlist · Editor’s judgement, not an official rating." : "Recorded lineups to explore. Team times do not prove individual strength or synergy."}</p>
    <div className={s.snapshotStatus}>{board ? <><span>Saved {periodLabel(board)} · {board.records} {selection.mode === "solo" ? "Solo" : "Group"} records</span><span>Captured {capturedDate.format(new Date(board.capturedAt))} UTC · not live</span></> : <span>No saved weekly board is available. No results from other periods are substituted.</span>}</div>
    {selection.mode === "solo" ? <>
      <div className={s.pickList} data-expanded={showAll}>
        <table><caption className={s.srOnly}>Eight editorial Solo recommendations with strengths, trade-offs and saved weekly evidence</caption><thead><tr><th>Tier</th><th>Partner</th><th>Why consider it</th><th>Keep in mind</th><th>Saved evidence</th><th>My list</th></tr></thead><tbody>{picks.map(pick => {
          const evidence = cohort?.partners.find(p => p.id === pick.id);
          const inTier = positions.get(pick.id), applied = inTier?.trim().toUpperCase() === pick.tier;
          return <tr key={pick.id} data-pick-id={pick.id}>
            <td><span className={s.tierBadge} style={{backgroundColor:tierColors[pick.tier]}}>{pick.tier}</span></td>
            <th scope="row"><span className={s.pickIdentity}><TierArt id={pick.id} name={pick.name} size={40}/><span>{pick.name}<small>{pick.statLine}</small></span></span></th>
            <td className={s.pickReason}>{pick.reason}</td><td className={s.pickCaveat}>{pick.watchFor}</td>
            <td className={s.pickEvidence}>{evidence ? <><span>{evidence.count} {evidence.count === 1 ? "record" : "records"}</span><small>Best <time dateTime={`PT${Math.floor(evidence.bestSeconds)}S`}>{survivalTime(evidence.bestSeconds)}</time></small></> : <span>No saved weekly record</span>}</td>
            <td className={s.pickAction}><button disabled={applied} aria-label={applied?`${pick.name} is in your ${pick.tier} tier`:`Add ${pick.name} to my ${pick.tier} tier`} onClick={()=>onApply([{label:pick.tier,color:tierColors[pick.tier],picks:[{id:pick.id}]}])}>{applied?`✓ In my ${pick.tier}`:`Add to ${pick.tier}`}</button>{inTier&&!applied&&<small>Moves from your {inTier} tier</small>}</td>
          </tr>;
        })}</tbody></table>
      </div>
      <button className={s.showAll} aria-expanded={showAll} onClick={()=>setShowAll(!showAll)}>{showAll?"Show fewer picks":"Show all 8 picks"}</button>
      <div className={s.recommendationFooter}><button className={s.secondaryButton} onClick={()=>onApply(tierLabels.map(label=>({label,color:tierColors[label],picks:picks.filter(p=>p.tier===label).map(p=>({id:p.id}))})))}>Use this shortlist in my list</button><a href="#tier-method">How we rank these picks ↓</a></div>
    </> : <>
      <div className={s.groupFilter}><label>Team size<select aria-label="Team size" value={selection.size} onChange={event=>onChange({...selection,size:Number(event.target.value)})}><option value={0}>All teams</option>{[2,3,4].map(size=><option key={size} value={size}>{size}-player</option>)}</select></label><span>{cohort?.records ?? 0} matching team records</span></div>
      <GroupLineups key={`${board?.key}-${selection.size}`} teams={cohort?.teams ?? []} names={names} onApply={onApply}/>
      <p className={s.groupNote}>Composition and team size are context, not a build recommendation. The saved records do not show upgrade cards or teammate roles. Choose your own tier for each partner you add.</p>
    </>}
    <div className={s.applicationBar}><span>{status || "Your personal list changes only when you add a recommendation."}</span><button disabled={!canUndo} onClick={onUndo}>Undo last recommendation</button><a href="#create-tier-list">View my list ↑</a></div>
  </section>;
}
function GroupLineups({teams,names,onApply}:{teams:TeamRecord[];names:Map<number,string>;onApply:(tiers:TierPreset[])=>boolean}) {
  const [choosing,setChoosing]=useState<string|null>(null);
  const [assignments,setAssignments]=useState<Record<number,TierLabel|"">>({});
  if(!teams.length)return <p className={s.groupNote}>No saved lineups match this team size. Your personal list is unchanged.</p>;
  return <div className={s.groupList}>{teams.map(team=><article key={team.key} className={s.groupRow}>
    <div className={s.groupSummary}><span className={s.recordRank}>#{team.bestRank}</span><div className={s.groupMembers}>{team.ids.map((id,index)=><span key={`${id}-${index}`}><TierArt id={id} name={names.get(id)??`Pokémon ${id}`} size={36}/><b>{names.get(id)??`Pokémon ${id}`}</b></span>)}</div><span className={s.teamSize}>{team.ids.length}-player<small>{team.count} {team.count===1?"record":"records"}</small></span><time className={s.teamTime} dateTime={`PT${Math.floor(team.bestSeconds)}S`}>{survivalTime(team.bestSeconds)}</time><button className={s.outlineButton} aria-expanded={choosing===team.key} onClick={()=>{setChoosing(choosing===team.key?null:team.key);setAssignments({});}}>Choose partners…</button></div>
    {choosing===team.key&&<form className={s.lineupForm} onSubmit={event=>{event.preventDefault();const tiers=tierLabels.map(label=>({label,color:tierColors[label],picks:[...new Set(team.ids)].filter(id=>assignments[id]===label).map(id=>({id}))}));if(onApply(tiers))setChoosing(null);}}><fieldset><legend>Choose a tier for each partner you want in your personal list.</legend><div className={s.lineupChoices}>{[...new Set(team.ids)].map(id=><label key={id}>{names.get(id)}<select aria-label={`Tier for ${names.get(id)}`} value={assignments[id]??""} onChange={event=>setAssignments({...assignments,[id]:event.target.value as TierLabel|""})}><option value="">Do not add</option>{tierLabels.map(label=><option key={label} value={label}>{label} tier</option>)}</select></label>)}</div></fieldset><div><button className={s.outlineButton} disabled={!Object.values(assignments).some(Boolean)} type="submit">Add selected partners to my list</button><button className={s.secondaryButton} type="button" onClick={()=>setChoosing(null)}>Cancel</button></div></form>}
  </article>)}</div>;
}
