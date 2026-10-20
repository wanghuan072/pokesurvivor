import { useState } from "react";
import { PokemonArt } from "@/components/common/PokemonArt";
import type { MovePartner } from "@/types/pokemon";
import s from "@/style/page/level-up.module.css";

export default function PartnerPicker({partners,selected,onSelect}: {
  partners:MovePartner[];
  selected?:MovePartner;
  onSelect:(id:number|null)=>void;
}) {
  const [search,setSearch]=useState("");
  const [focusId,setFocusId]=useState(selected?.id??partners[0]?.id);
  const term=search.trim().toLowerCase();
  const matches=partners.filter(p=>!term||p.name.toLowerCase().includes(term)||String(p.id)===term.replace(/^#/,""));
  const tabbableId=matches.some(p=>p.id===focusId)?focusId:matches[0]?.id;
  return <section className={s.partnerPlanner} aria-label="Choose a partner for move cards">
    <div className={s.partnerSearch}><small className={s.plannerEyebrow}>PARTNER ROSTER</small><h3>Choose a Pokémon</h3><label className={s.partnerInput}>Find your partner<input type="search" value={search} placeholder="Name or # number…" onChange={e=>setSearch(e.target.value)}/></label></div>
    <div className={s.pickHeading}><span aria-live="polite">{`${matches.length} / ${partners.length}`}</span><button aria-pressed={!selected} onClick={()=>onSelect(null)}>All move cards</button></div>
    <div className={s.rosterScroll} tabIndex={0} aria-label="Scrollable Pokémon roster">
      <div className={s.partnerPicks}>{matches.map((p,index)=><button key={p.id} title={p.name} tabIndex={p.id===tabbableId?0:-1} aria-label={`Choose ${p.name}`} aria-pressed={selected?.id===p.id} aria-controls="partner-move-panel" onFocus={()=>setFocusId(p.id)} onKeyDown={event=>{
        const grid=event.currentTarget.parentElement!;
        const columns=getComputedStyle(grid).gridTemplateColumns.split(" ").length;
        const offsets:Record<string,number>={ArrowLeft:-1,ArrowRight:1,ArrowUp:-columns,ArrowDown:columns,Home:-index,End:matches.length-1-index};
        if(!(event.key in offsets))return;
        event.preventDefault();
        const next=Math.max(0,Math.min(matches.length-1,index+offsets[event.key]));
        (grid.children[next] as HTMLButtonElement).focus();
      }} onClick={()=>onSelect(p.id)}><PokemonArt id={p.id} name={p.name} size={48}/></button>)}</div>
      {!matches.length&&<p className={s.intro}>No partners found. Try a name or Pokédex number.</p>}
    </div>
    <p key={selected?.id??"all"} className={s.rosterHint}>{selected?`Selected: ${selected.name}`:"Browsing all move cards"}<span>Hover for names · Click to view moves</span></p>
  </section>;
}
