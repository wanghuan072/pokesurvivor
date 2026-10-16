"use client";
import { PokemonArt } from "@/components/common/PokemonArt";
import { useState } from "react";
import type { Pokemon } from "@/types/pokemon";
import s from "@/style/page/rankings.module.css";
import c from "@/style/common/content.module.css";
type RankedPartner = Pick<Pokemon, "id" | "name" | "hp" | "speed" | "attack" | "rarity" | "starter" | "types">;
export default function PartnerRankings({ partners }: {partners: RankedPartner[]}) {
  const [metric, setMetric] = useState<"attack" | "hp" | "speed">("attack");
  const [pool,setPool]=useState("all"), [query,setQuery]=useState(""), [page,setPage]=useState(1);
  const sorted=partners.filter(p=>pool!=="starters"||p.starter).sort((a,b)=>b[metric]-a[metric]||a.id-b.id);
  const ranks=new Map<number,number>();
  sorted.forEach((p,i)=>ranks.set(p.id,i>0&&p[metric]===sorted[i-1][metric]?ranks.get(sorted[i-1].id)!:i+1));
  const result=sorted.filter(p=>p.name.toLowerCase().includes(query.toLowerCase())||String(p.id)===query.replace("#",""));
  const pages=Math.max(1,Math.ceil(result.length/50)), current=Math.min(page,pages);
  const label={attack:"ATTACK FACTOR",hp:"BASE HP",speed:"MOVEMENT SPEED"}[metric];
  return <>
    <div className={s.tabs} role="group" aria-label="Ranking metric">{(["attack","hp","speed"] as const).map(key=><button key={key} aria-pressed={metric===key} onClick={()=>{setMetric(key);setPage(1);}}>{key==="attack"?"Attack factor":key==="hp"?"HP":"Speed"}</button>)}</div>
    <div className={c.toolbar}>
      <label>Find a partner<input type="search" value={query} placeholder="Name or Pokédex number…" onChange={e=>{setQuery(e.target.value);setPage(1);}} /></label>
      <label>Partner pool<select value={pool} onChange={e=>{setPool(e.target.value);setPage(1);}}><option value="all">All 966 partners</option><option value="starters">29 starters only</option></select></label>
    </div>
    <section className={s.board} aria-label="Partner stat rankings">
      <header className={s.boardHeader}><strong>{label} RANKINGS</strong><span aria-live="polite">{result.length} partners · Equal values share a rank</span></header>
      <ol className={s.list}>{result.slice((current-1)*50,current*50).map(p=><li key={p.id} className={s.row} data-podium={ranks.get(p.id)!<=3}>
        <span className={s.place} aria-label={`Rank ${ranks.get(p.id)}`}>{ranks.get(p.id)}</span>
        <PokemonArt id={p.id} name={p.name} size={36} />
        <div className={s.identity}><h2 title={p.name}>{p.name}</h2><small>#{String(p.id).padStart(3,"0")} · {p.starter?"Starter":"Partner"} · {p.rarity}★</small><div className={s.types}>{p.types.map(t=><span key={t} className="type" data-type={t}>{t}</span>)}</div></div>
        <div className={s.bar} aria-hidden="true"><span style={{width:`${p[metric]/sorted[0][metric]*100}%`}} /></div>
        <div className={s.value}><b>{metric==="attack"?`${p.attack.toFixed(2)}×`:p[metric]}</b><small className="sr-only">{label}</small></div>
      </li>)}</ol>
      {!result.length&&<p className={c.empty}>No partners match this search.</p>}
    </section>
    <div className={c.pagination}><button disabled={current===1} onClick={()=>setPage(current-1)}>← Previous</button><span>{current} / {pages}</span><button disabled={current===pages} onClick={()=>setPage(current+1)}>Next →</button></div>
  </>;
}
