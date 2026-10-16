"use client";
import { useEffect, useRef, useState } from "react";
import { MoveIcon } from "@/components/common/GameIcon";
import { PokemonArt } from "@/components/common/PokemonArt";
import type { Move } from "@/types/move";
import type { MovePartner } from "@/types/pokemon";
import PartnerPicker from "./PartnerPicker";
import s from "@/style/page/level-up.module.css";
import c from "@/style/common/content.module.css";
type Card=Move&{description:string;levelEffects:{level:number;text:string}[];evolutionEffect:string|null;partnerCount:number};
export default function CardCatalog({moves,partners}:{moves:Card[];partners:MovePartner[]}) {
  const [partnerId,setPartnerId]=useState<number|null>(partners[0]?.id??null);
  const [query,setQuery]=useState(""),[type,setType]=useState(""),[recipe,setRecipe]=useState(""),[evolutions,setEvolutions]=useState(false);
  const viewport=useRef<HTMLDivElement>(null);
  const firstHash=useRef<string|null>(null);
  const partner=partners.find(p=>p.id===partnerId);
  const available=partner?moves.filter(m=>partner.learnset.includes(m.id)):moves;
  useEffect(()=>{
    let frame=0;
    function revealCard(){
      const target=moves.find(m=>location.hash===`#move-${m.slug}`);if(!target)return;
      setQuery("");setType("");setRecipe("");setEvolutions(false);
      const selected=partner?.learnset.includes(target.id)?partner:undefined;
      if(!selected)setPartnerId(null);
      cancelAnimationFrame(frame);
      frame=requestAnimationFrame(()=>document.getElementById(`move-${target.slug}`)?.scrollIntoView({block:"center"}));
    }
    window.addEventListener("hashchange",revealCard);
    if(firstHash.current===null)firstHash.current=location.hash;
    if(firstHash.current)frame=requestAnimationFrame(()=>{revealCard();firstHash.current="";});
    return()=>{window.removeEventListener("hashchange",revealCard);cancelAnimationFrame(frame);};
  },[moves,partner]);
  function reset(){setQuery("");setType("");setRecipe("");setEvolutions(false);if(viewport.current)viewport.current.scrollTop=0;}
  const filtered=available.filter(m=>(!evolutions||m.evolution)&&(!type||m.type===type)&&(!recipe||m.requirement===recipe)&&`${m.name} ${m.evolution||""} ${m.kind} ${m.description}`.toLowerCase().includes(query.toLowerCase())).sort((a,b)=>Number(b.id===partner?.startMove)-Number(a.id===partner?.startMove));
  const starting=moves.find(m=>m.id===partner?.startMove);
  return <div className={s.catalogWorkspace}>
    <PartnerPicker partners={partners} selected={partner} onSelect={id=>{setPartnerId(id);reset();}}/>
    <section id="partner-move-panel" className={s.catalogPanel} aria-label="Selected partner moves">
    <header className={s.partnerLoadout}>
      {partner?<><div className={s.partnerIdentity}><PokemonArt id={partner.id} name={partner.name} size={48}/><div><small>#{String(partner.id).padStart(3,"0")} · {partner.types.join(" / ")}</small><h3>{partner.name}</h3></div></div><span className={s.poolCount}>{partner.cardPool.length} level-up choices</span></>:<div className={s.partnerIdentity}><h3>All move cards</h3><span className={s.poolCount}>64 MOVES</span></div>}
      {starting&&<a className={s.openingMove} href={`#move-${starting.slug}`} onClick={()=>{reset();requestAnimationFrame(()=>document.getElementById(`move-${starting.slug}`)?.scrollIntoView({block:"nearest"}));}}><MoveIcon id={starting.id} size={22}/><span>Starts with <strong>{starting.name} ↓</strong></span></a>}
    </header>
    {partner&&starting&&!partner.cardPool.includes(starting.id)&&<p className={s.startException}>{starting.name} is a special starting move. It can be upgraded while held, but is not offered as a new move for {partner.name}.</p>}
    <div className={s.catalogTabs}><button aria-pressed={!evolutions} onClick={()=>setEvolutions(false)}>Move cards <span>{available.length}</span></button><button aria-pressed={evolutions} onClick={()=>setEvolutions(true)}>Evolutions <span>{available.filter(m=>m.evolution).length}</span></button></div>
    <div className={s.catalogTools}>
      <label>Find a card<input type="search" value={query} placeholder="Name or evolution…" onChange={e=>setQuery(e.target.value)}/></label>
      <label>Type<select value={type} onChange={e=>setType(e.target.value)}><option value="">All types</option>{[...new Set(moves.map(m=>m.type))].sort().map(t=><option key={t}>{t}</option>)}</select></label>
      <label>Stat card<select value={recipe} onChange={e=>setRecipe(e.target.value)}><option value="">Any card</option>{[...new Set(moves.flatMap(m=>m.requirement?[m.requirement]:[]))].sort().map(t=><option key={t}>{t}</option>)}</select></label>
      <button onClick={reset}>Reset filters</button>
    </div>
    <p className={s.cardCount} aria-live="polite">{filtered.length} cards{partner?` for ${partner.name} · Starting move first`:" · All partners"}</p>
    <div className={s.moveViewport} ref={viewport} tabIndex={0} aria-label="Scrollable move list">
    <div className={s.moveList}>{filtered.map(m=><article className={s.moveRow} id={`move-${m.slug}`} key={m.id} data-starting={partner?.startMove===m.id}>
      <div className={s.moveArtwork} data-type={m.type}><MoveIcon id={m.id} size={32}/></div>
      <div className={s.moveBody}>
        <div className={s.moveHeader}><h3>{m.name}</h3><span className="type" data-type={m.type}>{m.type}</span>{partner?.startMove===m.id&&<span className={s.startBadge}>STARTING MOVE{!partner.cardPool.includes(m.id)?" · STARTING ONLY":""}</span>}</div>
        <p className={s.rowDescription}>{m.description}</p>
        <div className={s.rowStats}><span>BASE HIT <b>{m.base.dmg??"—"}</b></span><span>COOLDOWN <b>{m.base.cd}s</b></span><span>MAX <b>Lv. {m.maxLevel}</b></span>{partner&&!partner.cardPool.includes(m.id)&&<span>NEW CARDS <b>Not in pool</b></span>}</div>
        <div className={s.rowEvolution}>{m.evolution?<><strong>→ {m.evolution}</strong><span>Lv. {m.maxLevel} + {m.requirement}</span></>:<span>Buff move · No evolution</span>}</div>
        <details className={s.inlineUpgrades}><summary>Upgrade levels &amp; evolution effect</summary><ol start={2}>{m.levelEffects.map(effect=><li key={effect.level}><b>Lv.{effect.level}</b> {effect.text}</li>)}</ol>{m.evolutionEffect&&<p className={s.note}>{m.evolutionEffect}</p>}
          <div className={c.tableWrap}><table className={c.table}><caption className="sr-only">{m.name} unmodified values by level</caption><thead><tr><th>LEVEL</th><th>{m.base.dmg===undefined?"BUFF / STACK":"DAMAGE / HIT"}</th><th>COOLDOWN</th></tr></thead><tbody>{m.levels.map(level=><tr key={level.level}><td>{level.level}</td><td>{Number((level.dmg??level.amount??0).toFixed(3))}</td><td>{Number((level.cd??0).toFixed(3))}s</td></tr>)}</tbody></table></div>
          <p>Base values before partner attack, typing, weather and run modifiers. Damage is per hit or tick, not measured DPS.</p>
        </details>
      </div>
    </article>)}</div>
    {!filtered.length&&<p className={c.empty}>No cards match. Try another type or reset your filters.</p>}
    </div>
    <p className={s.panelFootnote}>New cards need a free slot. At most two buff moves can be learned; owned and banned moves are excluded from new-card offers.</p>
    </section>
  </div>;
}
