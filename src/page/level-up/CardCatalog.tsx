"use client";
import { useEffect, useRef, useState } from "react";
import { MoveIcon } from "@/components/common/GameIcon";
import { PokemonArt } from "@/components/common/PokemonArt";
import type { Move } from "@/types/move";
import type { MovePartner } from "@/types/pokemon";
import PartnerPicker from "./PartnerPicker";
import s from "@/style/page/level-up.module.css";
import c from "@/style/common/content.module.css";
import { attackFit, attackSide, ownTypeMultiplier, startingMoveChoices } from "@/lib/game/mechanics";
import mechanics from "@/data/game/mechanics.json";
type Card=Move&{description:string;levelEffects:{level:number;text:string}[];evolutionEffect:string|null;partnerCount:number};
export default function CardCatalog({moves,partners}:{moves:Card[];partners:MovePartner[]}) {
  const [partnerId,setPartnerId]=useState<number|null>(partners[0]?.id??null);
  const [query,setQuery]=useState(""),[type,setType]=useState(""),[recipe,setRecipe]=useState(""),[category,setCategory]=useState(""),[evolutions,setEvolutions]=useState(false);
  const viewport=useRef<HTMLDivElement>(null);
  const firstHash=useRef<string|null>(null);
  const partner=partners.find(p=>p.id===partnerId);
  const available=partner?moves.filter(m=>partner.learnset.includes(m.id)):moves;
  useEffect(()=>{
    const frame=requestAnimationFrame(()=>{
      const id=Number(new URLSearchParams(location.search).get("partner"));
      if(partners.some(p=>p.id===id))setPartnerId(id);
    });
    return()=>cancelAnimationFrame(frame);
  },[partners]);
  useEffect(()=>{
    let frame=0;
    function revealCard(){
      const target=moves.find(m=>location.hash===`#move-${m.slug}`);if(!target)return;
      setQuery("");setType("");setRecipe("");setCategory("");setEvolutions(false);
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
  function reset(){setQuery("");setType("");setRecipe("");setCategory("");setEvolutions(false);if(viewport.current)viewport.current.scrollTop=0;}
  const filtered=available.filter(m=>(!evolutions||m.evolution)&&(!type||m.type===type)&&(!recipe||m.requirement===recipe)&&(!category||m.category===category)&&`${m.name} ${m.evolution||""} ${m.kind} ${m.description}`.toLowerCase().includes(query.toLowerCase())).sort((a,b)=>Number(b.id===partner?.startMove)-Number(a.id===partner?.startMove));
  const starting=moves.find(m=>m.id===partner?.startMove);
  return <div className={s.catalogWorkspace}>
    <PartnerPicker partners={partners} selected={partner} onSelect={id=>{setPartnerId(id);reset();}}/>
    <section id="partner-move-panel" className={s.catalogPanel} aria-label="Selected partner moves">
    <header className={s.partnerLoadout}>
      {partner?<><div className={s.partnerIdentity}><PokemonArt id={partner.id} name={partner.name} size={48}/><div><small>#{String(partner.id).padStart(3,"0")} · {partner.types.join(" / ")}</small><h3>{partner.name}</h3></div></div><span className={s.poolCount}>{partner.cardPool.length} level-up choices</span></>:<div className={s.partnerIdentity}><h3>All move cards</h3><span className={s.poolCount}>{moves.length} MOVES</span></div>}
      {starting&&<a className={s.openingMove} href={`#move-${starting.slug}`} onClick={()=>{reset();requestAnimationFrame(()=>document.getElementById(`move-${starting.slug}`)?.scrollIntoView({block:"nearest"}));}}><MoveIcon id={starting.id} size={22}/><span>Default start <strong>{starting.name} ↓</strong></span></a>}
    </header>
    {partner&&<p className={s.startException}>{partner.physicalAttack===partner.specialAttack?"Equal physical and special attack factors.":`${attackSide(partner)==='physical'?'Physical':'Special'} attacks use ${partner.name}’s stronger side.`} Physical ×{partner.physicalAttack.toFixed(2)} · Special ×{partner.specialAttack.toFixed(2)}. Swords Dance and Dragon Dance boost physical attacks; Nasty Plot boosts special attacks. All six buff moves are support effects, not direct damage.</p>}
    {partner&&<p className={s.startException}>Starting move costs {mechanics.startingMove.cost} coins once for this partner. After buying it, choose from {startingMoveChoices(partner,moves).length} non-buff openings, including the default. This page shows the default, not your account selection. {partner.types.length===1?`${partner.name} also gets +20% damage with ${partner.types[0]} attacks; other move types do not get that bonus.`:"Dual-type partners do not receive the single-type damage bonus."}</p>}
    {partner&&starting&&!partner.cardPool.includes(starting.id)&&<p className={s.startException}>{starting.name} is a special starting move. It can be upgraded while held, but is not offered as a new move for {partner.name}.</p>}
    <div className={s.catalogTabs}><button aria-pressed={!evolutions} onClick={()=>setEvolutions(false)}>Move cards <span>{available.length}</span></button><button aria-pressed={evolutions} onClick={()=>setEvolutions(true)}>Evolutions <span>{available.filter(m=>m.evolution).length}</span></button></div>
    <div className={s.catalogTools}>
      <label>Find a card<input type="search" value={query} placeholder="Name or evolution…" onChange={e=>setQuery(e.target.value)}/></label>
      <label>Type<select value={type} onChange={e=>setType(e.target.value)}><option value="">All types</option>{[...new Set(moves.map(m=>m.type))].sort().map(t=><option key={t}>{t}</option>)}</select></label>
      <label>Stat card<select value={recipe} onChange={e=>setRecipe(e.target.value)}><option value="">Any card</option>{[...new Set(moves.flatMap(m=>m.requirement?[m.requirement]:[]))].sort().map(t=><option key={t}>{t}</option>)}</select></label>
      <label>Category<select aria-label="Category" value={category} onChange={e=>setCategory(e.target.value)}><option value="">All categories</option><option value="physical">Physical</option><option value="special">Special</option><option value="buff">Buff</option></select></label>
      <button onClick={reset}>Reset filters</button>
    </div>
    <p className={s.cardCount} aria-live="polite">{filtered.length} cards{partner?` for ${partner.name} · Starting move first`:" · All partners"}</p>
    <div className={s.moveViewport} ref={viewport} tabIndex={0} aria-label="Scrollable move list">
    <div className={s.moveList}>{filtered.map(m=><article className={s.moveRow} id={`move-${m.slug}`} key={m.id} data-starting={partner?.startMove===m.id}>
      <div className={s.moveArtwork} data-type={m.type}><MoveIcon id={m.id} size={32}/></div>
      <div className={s.moveBody}>
        <div className={s.moveHeader}><h3>{m.name}</h3><span className="type" data-type={m.type}>{m.type}</span><span className={s.startBadge}>{m.category.toUpperCase()}</span>{partner?.startMove===m.id&&<span className={s.startBadge}>STARTING MOVE{!partner.cardPool.includes(m.id)?" · STARTING ONLY":""}</span>}</div>
        <p className={s.rowDescription}>{m.description}</p>
        <div className={s.rowStats}><span>BASE HIT <b>{m.base.dmg??"—"}</b></span><span>COOLDOWN <b>{m.base.cd}s</b></span><span>MAX <b>Lv. {m.maxLevel}</b></span>{partner&&!partner.cardPool.includes(m.id)&&<span>NEW CARDS <b>Not in pool</b></span>}</div>
        {partner&&m.category!=='buff'&&<p className={s.rowDescription}>{Math.round(attackFit(partner,m.category)*100)}% of {partner.name}’s stronger attack factor{ownTypeMultiplier(partner.types,m.type,m.category)>1?" · Single-type bonus ×1.20":""}, before run upgrades, enemy defenses and other damage modifiers.</p>}
        <div className={s.rowEvolution}>{m.evolution?<><strong>→ {m.evolution}</strong><span>Lv. {m.maxLevel} + {m.requirement}</span></>:<span>Buff move · No evolution</span>}</div>
        <details className={s.inlineUpgrades}><summary>Upgrade levels &amp; evolution effect</summary><ol start={2}>{m.levelEffects.map(effect=><li key={effect.level}><b>Lv.{effect.level}</b> {effect.text}</li>)}</ol>{m.category==='buff'&&<p>Buff values below are per stack: {m.buffStat==='regen'?'HP regenerated per second':m.buffStat==='def'?'damage reduction':m.buffStat==='spd'?'movement speed':m.buffStat==='patk'?'physical attack':'special attack'}. Stacks expire; the cooldown is the interval between applications while active.</p>}{m.evolutionEffect&&<p className={s.note}>{m.evolutionEffect}</p>}
          <div className={c.tableWrap}><table className={c.table}><caption className="sr-only">{m.name} unmodified values by level</caption><thead><tr><th>LEVEL</th><th>{m.category==='buff'?(m.buffStat==='regen'?'HP / SEC / STACK':'% / STACK'):"DAMAGE / HIT"}</th><th>COOLDOWN</th></tr></thead><tbody>{m.levels.map(level=><tr key={level.level}><td>{level.level}</td><td>{Number((m.category==='buff'&&m.buffStat!=='regen'?(level.amount??0)*100:level.dmg??level.amount??0).toFixed(3))}{m.category==='buff'&&m.buffStat!=='regen'?'%':''}</td><td>{Number((level.cd??0).toFixed(3))}s</td></tr>)}</tbody></table></div>
          <p>Base values before the partner’s physical or special attack, defending stats, typing, weather and run modifiers. Damage is per hit or tick, not measured DPS. <a href="/types">Check damage factors →</a></p>
        </details>
      </div>
    </article>)}</div>
    {!filtered.length&&<p className={c.empty}>No cards match. Try another type or reset your filters.</p>}
    </div>
    <p className={s.panelFootnote}>New cards need a free slot. At most two buff moves can be learned; owned and banned moves are excluded from new-card offers.</p>
    </section>
  </div>;
}
