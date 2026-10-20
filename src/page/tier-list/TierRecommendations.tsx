"use client";
import { useState } from "react";
import { periodLabel, survivalTime } from "@/lib/game/leaderboard-format";
import { tierColors } from "@/lib/game/leaderboards";
import type { RankingPeriod, RecommendationBoard, RecommendationSelection, RecommendationCohort, TierBoardRow, TierPreset, EditorialPick, TierLabel, TeamRecord } from "@/types/leaderboard";
import { TierArt } from "./TierArt";
import s from "@/style/page/tier-maker.module.css";

const capturedDate = new Intl.DateTimeFormat("en-GB", { dateStyle: "medium", timeStyle: "short", timeZone: "UTC" });
const tierLabels = ["S", "A", "B", "C", "D"] as const;
type Props = {
  board?: RecommendationBoard; cohort?: RecommendationCohort;
  partners: { id: number; name: string }[]; personalRows: TierBoardRow[]; picks: EditorialPick[];
  review: { date: string; version: string }; selection: RecommendationSelection;
  onChange: (selection: RecommendationSelection) => void;
  onApply: (tiers: TierPreset[]) => boolean; canUndo: boolean; onUndo: () => void; status: string;
};
export default function TierRecommendations({ board, cohort, partners, personalRows, picks, review, selection, onChange, onApply, canUndo, onUndo, status }: Props) {
  const names = new Map([...partners, ...picks].map(p => [p.id, p.name]));
  const positions = new Map(personalRows.flatMap(row => row.partners.map(id => [id, row.label] as const)));
  const [query, setQuery] = useState("");
  const [tier, setTier] = useState("");
  const [page, setPage] = useState(1);
  const filtered = picks.filter(p => (!tier || p.tier === tier) && p.name.toLowerCase().includes(query.trim().toLowerCase()));
  const pages = Math.max(1, Math.ceil(filtered.length / 12));
  const currentPage = Math.min(page, pages);
  const visible = filtered.slice((currentPage-1)*12, currentPage*12);
  return <section id="recommendations" className={s.recommendations} aria-labelledby="recommended-heading">
    <header className={s.recommendationHeader}><div className={s.recommendationTitle}><h2 id="recommended-heading">Recommended picks</h2><div className={s.toggleGroup} role="group" aria-label="Recommendation mode">{(["solo", "group"] as const).map(mode => <button key={mode} aria-pressed={selection.mode === mode} onClick={() => onChange({ ...selection, mode })}>{mode === "solo" ? "Solo" : "Group"}</button>)}</div></div><div className={s.reviewStamp}>Rules checked <time dateTime={review.date}>{review.date}</time><small>Game {review.version}</small></div></header>
    <p className={s.recommendationIntro}>{selection.mode === "solo" ? `${picks.length} reviewed partners. Here's who we'd pick for a Solo run at similar permanent upgrades, and what we'd watch out for.` : "Looking for a team to try? Start with the recorded lineups below, then choose the partners you want in your own list."}</p>
    <div className={s.groupFilter}><label>Record period<select aria-label="Record period" value={selection.period} onChange={event=>onChange({...selection,period:event.target.value as RankingPeriod})}>{(["daily","weekly","monthly","all-time"] as const).map(period=><option key={period} value={period}>{period === "all-time" ? "All-time" : period[0].toUpperCase()+period.slice(1)}</option>)}</select></label><span>{selection.mode === "solo" ? "Compare different boards without changing our grades." : "Each period has its own saved board."}</span></div>
    <div className={s.snapshotStatus}>{board ? <><span>Saved {periodLabel(board)} · {board.records} {selection.mode === "solo" ? "Solo" : "Group"} records</span><span>Captured {capturedDate.format(new Date(board.capturedAt))} UTC · not live</span></> : <span>No saved board is available for this period. No other period is substituted.</span>}</div>
    {selection.mode === "solo" ? <>
      <div className={s.poolTools}><label className={s.poolSearch}><span className={s.srOnly}>Search reviewed partners</span><input aria-label="Search reviewed partners" placeholder="Find a reviewed partner…" value={query} onChange={event=>{setQuery(event.target.value);setPage(1);}}/></label><label><span className={s.srOnly}>Recommended tier</span><select aria-label="Recommended tier" value={tier} onChange={event=>{setTier(event.target.value);setPage(1);}}><option value="">All tiers</option>{tierLabels.map(label=><option key={label} value={label}>{label} · {picks.filter(p=>p.tier===label).length}</option>)}</select></label></div>
      <p className={s.groupNote} role="status">{filtered.length} partners{tier ? ` in ${tier} tier` : " across S / A / B / C / D"} · 12 per page. Same-tier order is by Pokédex number.</p>
      <div className={s.pickList}>
        <table><caption className={s.srOnly}>Our Solo recommendations, what to watch out for, and saved results from the selected period</caption><thead><tr><th>Tier</th><th>Partner</th><th>Why we&apos;d pick it</th><th>What to watch for</th><th>Saved results</th><th>My list</th></tr></thead><tbody>{visible.map(pick => {
          const evidence = cohort?.partners.find(p => p.id === pick.id);
          const inTier = positions.get(pick.id), applied = inTier?.trim().toUpperCase() === pick.tier;
          return <tr key={pick.id} data-pick-id={pick.id}>
            <td><span className={s.tierBadge} style={{backgroundColor:tierColors[pick.tier]}}>{pick.tier}</span></td>
            <th scope="row"><span className={s.pickIdentity}><TierArt id={pick.id} name={pick.name} size={40}/><span>{pick.name}<small>{pick.statLine}</small></span></span></th>
            <td className={s.pickReason}>{pick.reason}</td><td className={s.pickCaveat}>{pick.watchFor}</td>
            <td className={s.pickEvidence}>{evidence ? <><span>{evidence.count} / {cohort?.records} records</span><small>Best <time dateTime={`PT${Math.floor(evidence.bestSeconds)}S`}>{survivalTime(evidence.bestSeconds)}</time> · #{evidence.bestRank}</small></> : <span>No record in this period</span>}</td>
            <td className={s.pickAction}><button disabled={applied} aria-label={applied?`${pick.name} is in your ${pick.tier} tier`:`Add ${pick.name} to my ${pick.tier} tier`} onClick={()=>onApply([{label:pick.tier,color:tierColors[pick.tier],picks:[{id:pick.id}]}])}>{applied?`✓ In my ${pick.tier}`:`Add to ${pick.tier}`}</button>{inTier&&!applied&&<small>Moves from your {inTier} tier</small>}</td>
          </tr>;
        })}</tbody></table>
      </div>
      {!filtered.length&&<p className={s.groupNote}>{tier === "D" && !picks.some(p=>p.tier==="D") ? `D is reserved for partners we would avoid at comparable investment. None of these ${picks.length} leaderboard species is assigned to D; missing player feedback is not a low grade.` : "No reviewed partners match. Clear the search or choose another tier."}</p>}
      <Pagination page={currentPage} pages={pages} count={filtered.length} label="Recommended partners" onChange={setPage}/>
      <div className={s.recommendationFooter}><button className={s.secondaryButton} disabled={!filtered.length} onClick={()=>onApply(tierLabels.map(label=>({label,color:tierColors[label],picks:filtered.filter(p=>p.tier===label).map(p=>({id:p.id}))})))}>Add all {filtered.length} matching picks to my list</button><a href="#tier-method">How we rank these picks ↓</a></div>
    </> : <>
      <div className={s.groupFilter}><label>Team size<select aria-label="Team size" value={selection.size} onChange={event=>onChange({...selection,size:Number(event.target.value)})}><option value={0}>All teams</option>{[2,3,4].map(size=><option key={size} value={size}>{size}-player</option>)}</select></label><span>{cohort?.records ?? 0} matching team records</span></div>
      <GroupLineups key={`${board?.key}-${selection.size}`} teams={cohort?.teams ?? []} names={names} onApply={onApply}/>
      <p className={s.groupNote}>We&apos;d use these lineups as a place to start, not a recipe to copy blindly. The records don&apos;t show upgrade cards or teammate roles, and two-player times aren&apos;t a like-for-like comparison with four-player times. Choose a tier for each partner you want to add.</p>
    </>}
    <div className={s.applicationBar}><span>{status || "Your personal list changes only when you add a recommendation."}</span><button disabled={!canUndo} onClick={onUndo}>Undo last recommendation</button><a href="#create-tier-list">View my list ↑</a></div>
  </section>;
}
function GroupLineups({teams,names,onApply}:{teams:TeamRecord[];names:Map<number,string>;onApply:(tiers:TierPreset[])=>boolean}) {
  const [choosing,setChoosing]=useState<string|null>(null);
  const [assignments,setAssignments]=useState<Record<number,TierLabel|"">>({});
  const [page,setPage]=useState(1);
  const pages=Math.max(1,Math.ceil(teams.length/10));
  const visible=teams.slice((page-1)*10,page*10);
  if(!teams.length)return <p className={s.groupNote}>No saved lineups match this team size. Your personal list is unchanged.</p>;
  return <><p className={s.groupNote}>{teams.length} distinct lineups · 10 per page · identical member sets are grouped together.</p><div className={s.groupList}>{visible.map(team=><article key={team.key} className={s.groupRow}>
    <div className={s.groupSummary}><span className={s.recordRank}>#{team.bestRank}</span><div className={s.groupMembers}>{team.ids.map((id,index)=><span key={`${id}-${index}`}><TierArt id={id} name={names.get(id)??`Pokémon ${id}`} size={36}/><b>{names.get(id)??`Pokémon ${id}`}</b></span>)}</div><span className={s.teamSize}>{team.ids.length}-player<small>{team.count} {team.count===1?"record":"records"}</small></span><time className={s.teamTime} dateTime={`PT${Math.floor(team.bestSeconds)}S`}>{survivalTime(team.bestSeconds)}</time><button className={s.outlineButton} aria-expanded={choosing===team.key} onClick={()=>{setChoosing(choosing===team.key?null:team.key);setAssignments({});}}>Choose partners…</button></div>
    {choosing===team.key&&<form className={s.lineupForm} onSubmit={event=>{event.preventDefault();const tiers=tierLabels.map(label=>({label,color:tierColors[label],picks:[...new Set(team.ids)].filter(id=>assignments[id]===label).map(id=>({id}))}));if(onApply(tiers))setChoosing(null);}}><fieldset><legend>Choose a tier for each partner you want in your personal list.</legend><div className={s.lineupChoices}>{[...new Set(team.ids)].map(id=><label key={id}>{names.get(id)}<select aria-label={`Tier for ${names.get(id)}`} value={assignments[id]??""} onChange={event=>setAssignments({...assignments,[id]:event.target.value as TierLabel|""})}><option value="">Do not add</option>{tierLabels.map(label=><option key={label} value={label}>{label} tier</option>)}</select></label>)}</div></fieldset><div><button className={s.outlineButton} disabled={!Object.values(assignments).some(Boolean)} type="submit">Add selected partners to my list</button><button className={s.secondaryButton} type="button" onClick={()=>setChoosing(null)}>Cancel</button></div></form>}
  </article>)}</div><Pagination page={page} pages={pages} count={teams.length} label="Group lineups" onChange={value=>{setPage(value);setChoosing(null);setAssignments({});}}/></>;
}
function Pagination({page,pages,count,label,onChange}:{page:number;pages:number;count:number;label:string;onChange:(page:number)=>void}) {
  return <nav className={s.pagination} aria-label={`${label} pages`}><button disabled={page<=1} aria-label={`Previous ${label.toLowerCase()} page`} onClick={()=>onChange(page-1)}>←</button><span role="status">Page {page} / {pages} · {count} total</span><button disabled={page>=pages} aria-label={`Next ${label.toLowerCase()} page`} onClick={()=>onChange(page+1)}>→</button></nav>;
}
