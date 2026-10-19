"use client";
import { useEffect, useRef, useState, type CSSProperties } from "react";
import { createPortal } from "react-dom";
import type { PokemonSummary } from "@/types/pokemon";
import { PokemonArt } from "@/components/common/PokemonArt";
import s from "@/style/page/pokedex.module.css";
import c from "@/style/common/content.module.css";
import { attackSide } from "@/lib/game/mechanics";
const rarities=["","Common","Uncommon","Rare","Epic","Legendary"];
export default function PokedexBrowser({pokemon}:{pokemon:PokemonSummary[]}) {
  const [query,setQuery]=useState(""),[type,setType]=useState(""),[region,setRegion]=useState(""),[group,setGroup]=useState(""),[rarity,setRarity]=useState(0),[page,setPage]=useState(1),[sort,setSort]=useState("id"),[shiny,setShiny]=useState(false);
  const [preview,setPreview]=useState<{id:number;left:number;top:number;pinned:boolean}|null>(null);
  const anchor=useRef<HTMLButtonElement|null>(null),timer=useRef<ReturnType<typeof setTimeout>|null>(null);
  const dismissed=useRef<number|null>(null);
  const cancelClose=()=>{if(timer.current)clearTimeout(timer.current);};
  const closeSoon=()=>{cancelClose();timer.current=setTimeout(()=>setPreview(p=>p?.pinned?p:null),160);};
  useEffect(()=>{const close=()=>setPreview(null);const outside=(event:PointerEvent)=>{if(event.target instanceof Element&&!event.target.closest("[data-pokemon-preview], [data-pokemon]"))close();};const key=(event:KeyboardEvent)=>{if(event.key==="Escape"){dismissed.current=Number(anchor.current?.dataset.pokemon);anchor.current?.focus();setPreview(null);}};window.addEventListener("resize",close);window.addEventListener("keydown",key);window.addEventListener("pointerdown",outside);return()=>{window.removeEventListener("resize",close);window.removeEventListener("keydown",key);window.removeEventListener("pointerdown",outside);if(timer.current)clearTimeout(timer.current);};},[]);
  function show(p:PokemonSummary,button:HTMLButtonElement,pinned=false){cancelClose();if(dismissed.current===p.id&&!pinned)return;anchor.current=button;const r=button.getBoundingClientRect(),width=Math.min(284,innerWidth-24);setPreview({id:p.id,pinned,left:Math.max(12,Math.min(innerWidth-width-12,r.right+12+width<innerWidth?r.right+12:r.left-width-12)),top:Math.max(70,Math.min(r.top,innerHeight-490))});}
  const result=pokemon.filter(p=>(p.name.toLowerCase().includes(query.toLowerCase())||String(p.id)===query.replace("#",""))&&(!type||p.types.includes(type))&&(!region||p.region===region)&&(!rarity||p.rarity===rarity)&&(!group||(group==="starter"?p.starter:p.legendary))).sort((a,b)=>sort==="id"?a.id-b.id:b[sort as "hp"|"attack"|"speed"]-a[sort as "hp"|"attack"|"speed"]||a.id-b.id);
  const pages=Math.max(1,Math.ceil(result.length/60)),current=Math.min(page,pages),active=pokemon.find(p=>p.id===preview?.id);
  function reset(){setQuery("");setType("");setRegion("");setRarity(0);setGroup("");setSort("id");setShiny(false);setPage(1);setPreview(null);}
  return <>
    <div className={c.toolbar}>
      <label>Search Pokémon<input type="search" placeholder="Name or Pokédex number…" value={query} onChange={e=>{setQuery(e.target.value);setPage(1);setPreview(null);}}/></label>
      <label>Type<select value={type} onChange={e=>{setType(e.target.value);setPage(1);setPreview(null);}}><option value="">All types</option>{[...new Set(pokemon.flatMap(p=>p.types))].sort().map(t=><option key={t}>{t}</option>)}</select></label>
      <label>Region<select value={region} onChange={e=>{setRegion(e.target.value);setPage(1);setPreview(null);}}><option value="">All regions</option>{[...new Set(pokemon.map(p=>p.region))].map(r=><option key={r}>{r}</option>)}</select></label>
      <label>Sort by<select value={sort} onChange={e=>{setSort(e.target.value);setPage(1);setPreview(null);}}><option value="id">Pokédex number</option><option value="attack">Highest attack factor</option><option value="hp">Highest HP</option><option value="speed">Highest speed</option></select></label>
      <button onClick={reset}>Reset</button>
    </div>
    <div className={s.chips} role="group" aria-label="Collection filters">
      <button aria-pressed={!group&&!rarity} onClick={()=>{setGroup("");setRarity(0);setPage(1);setPreview(null);}}>All partners</button>
      <button aria-pressed={group==="starter"} onClick={()=>{setGroup(group==="starter"?"":"starter");setPage(1);setPreview(null);}}>Starters</button>
      <button aria-pressed={shiny} onClick={()=>setShiny(!shiny)}>✦ Shiny</button>
      {[5,4,3,2,1].map(r=><button key={r} aria-pressed={rarity===r} onClick={()=>{setRarity(rarity===r?0:r);setPage(1);setPreview(null);}}>{rarities[r]}</button>)}
    </div>
    <div className={s.collectionHead}><span>PARTNER COLLECTION</span><span aria-live="polite">{result.length} Pokémon · Page {current} / {pages}</span></div>
    <div className={s.grid}>{result.slice((current-1)*60,current*60).map(p=><button className={s.tile} key={p.id} data-pokemon={p.id} data-active={preview?.id===p.id} aria-label={`Preview ${p.name}`} aria-expanded={preview?.id===p.id} aria-controls={preview?.id===p.id?"pokemon-preview":undefined} onMouseEnter={e=>show(p,e.currentTarget)} onMouseLeave={()=>{dismissed.current=null;closeSoon();}} onFocus={e=>show(p,e.currentTarget)} onBlur={e=>{if(!(e.relatedTarget instanceof Element&&e.relatedTarget.closest("[data-pokemon-preview]")))closeSoon();}} onClick={e=>{if(preview?.id===p.id&&preview.pinned)setPreview(null);else show(p,e.currentTarget,true);}}>
      <span className={s.number}>{String(p.id).padStart(3,"0")}</span>{p.starter&&<span className={s.starter} title="Starter">◆</span>}
      <PokemonArt id={p.id} name={p.name} shiny={shiny&&p.hasShiny} size={72}/><span className={s.name}>{p.name}</span><span className={s.rarity} data-rarity={p.rarity}>{rarities[p.rarity]}</span>
    </button>)}</div>
    {!result.length&&<p className={c.empty}>No Pokémon match these filters. Try another name or reset.</p>}
    <p className={s.hint}>Hover or focus a partner for a quick look. Tap to keep its stats open. Owned and missing filters belong to your game save and are not tracked here.</p>
    <div className={c.pagination}><button disabled={current===1} onClick={()=>{setPage(current-1);setPreview(null);}}>← Previous</button><span>{current} / {pages}</span><button disabled={current===pages} onClick={()=>{setPage(current+1);setPreview(null);}}>Next →</button></div>
    {active&&preview&&createPortal(<aside data-pokemon-preview id="pokemon-preview" className={s.preview} role="dialog" aria-label={`${active.name} quick stats`} style={{left:preview.left,top:preview.top,'--preview-top':`${preview.top}px`} as CSSProperties} onMouseEnter={cancelClose} onMouseLeave={closeSoon}>
      <button className={s.close} aria-label="Close Pokémon preview" onClick={()=>{dismissed.current=active.id;anchor.current?.focus();setPreview(null);}}>×</button>
      <div className={s.portrait} data-rarity={active.rarity}><PokemonArt id={active.id} name={active.name} shiny={shiny&&active.hasShiny} size={144}/></div>
      <small>#{String(active.id).padStart(3,"0")} · {active.region}</small><h2>{active.name}</h2>
      <strong className={s.rarity} data-rarity={active.rarity}>{rarities[active.rarity]}</strong>
      <div className={s.types}>{active.types.map(t=><span key={t} className="type" data-type={t}>{t}</span>)}</div>
      <dl className={s.stats}>{([['HP',active.hp,Math.max(...pokemon.map(p=>p.hp)),false],['Phys. ATK',active.physicalAttack,Math.max(...pokemon.map(p=>p.physicalAttack)),true],['Sp. ATK',active.specialAttack,Math.max(...pokemon.map(p=>p.specialAttack)),true],['Defense',active.defense,Math.max(...pokemon.map(p=>p.defense)),false],['Sp. DEF',active.specialDefense,Math.max(...pokemon.map(p=>p.specialDefense)),false],['Speed',active.speed,Math.max(...pokemon.map(p=>p.speed)),false]] as const).map(([label,value,max,factor])=><div key={label}><dt>{label}</dt><dd><span className={s.statBar}><i style={{width:`${value/max*100}%`}}/></span><b>{factor?`×${value.toFixed(2)}`:value}</b></dd></div>)}</dl>
      <p>{active.physicalAttack===active.specialAttack?"Equal physical and special attack factors.":`${attackSide(active)==="physical"?"Physical":"Special"} moves use this partner’s stronger attack factor.`} Defense affects incoming physical hits; Sp. DEF affects special hits. These values are before run upgrades.</p>
      <a href={`/level-up?partner=${active.id}#move-cards`}>View {active.name}’s move cards →</a>
      <p>{active.starter?"STARTER PARTNER":"BASE PARTNER STATS"}{active.hovering?" · HOVERING":""}</p>
      {shiny&&!active.hasShiny&&<p>Normal art shown; no shiny sprite is available.</p>}
    </aside>,document.body)}
  </>;
}
