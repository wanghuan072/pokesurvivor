"use client";
import { useMemo, useState, useSyncExternalStore } from "react";
import { PokemonArt } from "@/components/common/PokemonArt";
import { useTierDragScroll } from "./useTierDragScroll";
import s from "@/style/page/tier-maker.module.css";
import c from "@/style/common/content.module.css";
type Partner={id:number;name:string;types:string[];region:string};
type Row={id:string;label:string;color:string;partners:number[]};
const key="pokesurvivor-tier-board-v1";
const defaults:Row[]=["S","A","B","C","D"].map((label,i)=>({id:`tier-${i}`,label,color:["#e59781","#e8be73","#dfd780","#9ec994","#8fbad4"][i],partners:[]}));
let memory:string|null=null;
function snapshot(){if(memory!==null)return memory;try{return localStorage.getItem(key)||"";}catch{return "";}}
function subscribe(listener:()=>void){const external=()=>{memory=null;listener();};window.addEventListener("storage",external);window.addEventListener("tier-board-change",listener);return()=>{window.removeEventListener("storage",external);window.removeEventListener("tier-board-change",listener);};}
const serverSnapshot=()=>"";
function persistBoard(rows:Row[]) {
  memory=JSON.stringify(rows);
  let persisted=true;
  try { localStorage.setItem(key,memory); } catch { persisted=false; }
  window.dispatchEvent(new Event("tier-board-change"));
  return persisted;
}
export default function TierMaker({partners}:{partners:Partner[]}){
  const saved=useSyncExternalStore(subscribe,snapshot,serverSnapshot);
  const drag = useTierDragScroll();
  const [editing, setEditing] = useState<string | null>(null);
  const [dropTarget, setDropTarget] = useState<string | null>(null);
  const [selected,setSelected]=useState<number|null>(null),[query,setQuery]=useState(""),[type,setType]=useState(""),[region,setRegion]=useState(""),[page,setPage]=useState(1),[status,setStatus]=useState(""),[exporting,setExporting]=useState(false);
  const rows=useMemo(()=>{
    try{
      const parsed:unknown=JSON.parse(saved), used=new Set<number>(), ids=new Set(partners.map(p=>p.id)), rowIds=new Set<string>();
      if(!Array.isArray(parsed)||!parsed.length||parsed.length>10) return defaults;
      return parsed.map((r):Row=>{
        if(!r||typeof r.id!=="string"||rowIds.has(r.id)||typeof r.label!=="string"||typeof r.color!=="string"||!/^#[0-9a-f]{6}$/i.test(r.color)||!Array.isArray(r.partners))throw Error("Invalid saved board");
        rowIds.add(r.id);
        return {id:r.id,label:r.label.slice(0,24),color:r.color,partners:r.partners.filter((id:unknown)=>{if(typeof id!=="number"||!ids.has(id)||used.has(id))return false;used.add(id);return true;})};
      });
    }catch{return defaults;}
  },[saved,partners]);
  function update(next:Row[],message?:string){setStatus(persistBoard(next)?message||"Board saved in this browser.":"Changes are available in this tab. Browser storage is unavailable; export an image to keep them.");}
  function assign(id:number,rowId:string|null){drag.stop();setDropTarget(null);if(!partners.some(p=>p.id===id))return;update(rows.map(r=>({...r,partners:[...r.partners.filter(p=>p!==id),...(r.id===rowId?[id]:[])]})),`${partners.find(p=>p.id===id)!.name} ${rowId?"added to "+rows.find(r=>r.id===rowId)!.label:"returned to the pool"}.`);setSelected(null);}
  const ranked=new Set(rows.flatMap(r=>r.partners));
  const result=partners.filter(p=>!ranked.has(p.id)&&(!query||p.name.toLowerCase().includes(query.toLowerCase())||String(p.id)===query.replace("#",""))&&(!type||p.types.includes(type))&&(!region||p.region===region));
  const pages=Math.max(1,Math.ceil(result.length/60)),current=Math.min(page,pages);
  const selectedPartner=partners.find(p=>p.id===selected);
  async function exportImage(){
    if(!ranked.size){setStatus("Place at least one partner in a tier before exporting.");return;}
    setExporting(true);
    try{
      const canvas=document.createElement("canvas"),width=1200,tile=80;
      canvas.width=width;canvas.height=160+rows.reduce((h,r)=>h+Math.max(100,Math.ceil(r.partners.length/13)*tile+20),0);
      const ctx=canvas.getContext("2d");if(!ctx)throw Error("Canvas unavailable");
      ctx.fillStyle="#071c28";ctx.fillRect(0,0,width,canvas.height);ctx.fillStyle="#edda9d";ctx.font="bold 28px sans-serif";ctx.fillText("PokeSurvivor — My Tier List",24,45);ctx.font="16px sans-serif";ctx.fillStyle="#b0c6b6";ctx.fillText("Personal rankings · pokesurvivor.me",24,78);
      const images=new Map(await Promise.all([...ranked].map(async id=>{const image=new Image();image.src=`/game/pokemon/${id}.webp`;await image.decode();return [id,image] as const;})));
      ctx.imageSmoothingEnabled=false;
      let y=100;
      for(const row of rows){const h=Math.max(100,Math.ceil(row.partners.length/13)*tile+20);ctx.fillStyle=row.color;ctx.fillRect(16,y,100,h-8);ctx.fillStyle="#152229";ctx.font="bold 20px sans-serif";ctx.fillText(row.label,25,y+45,82);ctx.fillStyle="#102d36";ctx.fillRect(122,y,width-138,h-8);row.partners.forEach((id,i)=>{const x=130+(i%13)*tile,top=y+10+Math.floor(i/13)*tile;ctx.drawImage(images.get(id)!,x,top,64,64);ctx.font="10px sans-serif";ctx.fillStyle="#e7e4c8";ctx.fillText(partners.find(p=>p.id===id)!.name,x,top+73,74);});y+=h;}
      ctx.fillStyle="#9cb7a6";ctx.font="12px sans-serif";ctx.fillText("Sprites: SpriteCollab artists · CC BY-NC 4.0 · pokesurvivor.me/credits/spritecollab-artists.md",24,canvas.height-18);
      const blob=await new Promise<Blob|null>(resolve=>canvas.toBlob(resolve,"image/png"));if(!blob)throw Error("Export unavailable");const url=URL.createObjectURL(blob),a=document.createElement("a");a.href=url;a.download="pokesurvivor-tier-list.png";a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);setStatus("Your tier list image is ready.");
    }catch{setStatus("The image could not be created. Please try exporting again.");}finally{setExporting(false);}
  }
  function sprite(p:Partner,inRow=false){return <button type="button" key={p.id} className={s.sprite} draggable aria-pressed={selected===p.id} aria-label={`Select ${p.name}${inRow?" in tier":""}`} onDragStart={e=>{e.dataTransfer.setData("text/plain",String(p.id));e.dataTransfer.effectAllowed="move";drag.start(e.clientY);setSelected(p.id);}} onClick={()=>setSelected(selected===p.id?null:p.id)}><PokemonArt id={p.id} name={p.name} size={56}/><span>{p.name}</span></button>;}
  return <div translate="no" className="notranslate">
    <div className={s.boardActions}><span><b>{ranked.size}</b><span>{` / ${partners.length} ranked`}</span></span><div><button disabled={exporting} onClick={exportImage}>{exporting?"Creating image…":"Save as image"}</button><button onClick={()=>{if(window.confirm("Clear your tier list and restore the default rows?")){update(defaults,"Board reset.");setSelected(null);}}}>Reset board</button></div></div>
    <div className={s.selection} aria-live="polite">
      <strong>{selectedPartner?`${selectedPartner.name} selected`:"Make it your own."}</strong>
      <span>{selectedPartner?"Choose a tier, or drag near the screen edge to scroll.":"Drag a sprite, or tap one and choose a row. Use Tab and Enter with a keyboard."}</span>
      <div className={s.quickTiers} hidden={!selectedPartner}>{rows.map(row=><button key={row.id} disabled={!selectedPartner} onClick={()=>{if(selectedPartner)assign(selectedPartner.id,row.id);}} aria-label={`Place ${selectedPartner?.name??"partner"} in ${row.label}`}>{row.label}</button>)}</div>
      <button hidden={!selectedPartner} onClick={()=>{if(selectedPartner)assign(selectedPartner.id,null);}}>Return to pool</button>
      <button hidden={!selectedPartner} onClick={()=>setSelected(null)}>Cancel</button>
    </div>
    <div className={s.board} data-dragging={drag.dragging}>{rows.map(row=><section className={s.row} key={row.id} aria-label={`Tier ${row.label}`} data-tier-row={row.id} data-drop-target={drag.dragging&&dropTarget===row.id} onDragOver={e=>{e.preventDefault();setDropTarget(row.id);}} onDrop={e=>{e.preventDefault();assign(Number(e.dataTransfer.getData("text/plain")),row.id);}}>
      <div className={s.rowLabel} style={{borderColor:row.color}}><span className={s.tierName} style={{color:row.color}}>{row.label || "Tier"}</span><small>{`${row.partners.length} partners`}</small><button className={s.editTier} aria-label={`Edit tier ${row.label}`} aria-expanded={editing===row.id} onClick={()=>setEditing(editing===row.id?null:row.id)}>Edit</button></div>
      <div className={s.rowPool}>{row.partners.map(id=>sprite(partners.find(p=>p.id===id)!,true))}{selectedPartner?<button className={s.place} onClick={()=>assign(selectedPartner.id,row.id)}>+ Place here</button>:!row.partners.length?<span className={s.emptyTier}>Drop a partner here</span>:null}</div>
      {editing===row.id&&<div className={s.rowEditor}><label>Tier name<input aria-label={`Rename tier ${row.label}`} maxLength={24} value={row.label} onChange={e=>update(rows.map(r=>r.id===row.id?{...r,label:e.target.value}:r))}/></label><label>Row color<input aria-label={`Color for tier ${row.label}`} type="color" value={row.color} onChange={e=>update(rows.map(r=>r.id===row.id?{...r,color:e.target.value}:r))}/></label><button disabled={rows.length===1} onClick={()=>{update(rows.filter(r=>r.id!==row.id),"Tier removed; its partners returned to the pool.");setEditing(null);}} aria-label={`Remove tier ${row.label}`}>Remove row</button><button onClick={()=>setEditing(null)}>Done</button></div>}
    </section>)}</div>
    <div className={s.boardActions}><button disabled={rows.length>=10} onClick={()=>update([...rows,{id:`tier-${(crypto.randomUUID?.() ?? Date.now().toString(36)+Math.random().toString(36).slice(2))}`,label:"New tier",color:"#b4a3d4",partners:[]}])}>+ Add a tier row</button><span role="status">{status||"Saved locally. No account needed."}</span></div>
    <div className={c.toolbar}><label>Search partners<input type="search" placeholder="Charizard, #006…" value={query} onChange={e=>{setQuery(e.target.value);setPage(1);}}/></label><label>Type<select value={type} onChange={e=>{setType(e.target.value);setPage(1);}}><option value="">All types</option>{[...new Set(partners.flatMap(p=>p.types))].sort().map(t=><option key={t}>{t}</option>)}</select></label><label>Region<select value={region} onChange={e=>{setRegion(e.target.value);setPage(1);}}><option value="">All regions</option>{[...new Set(partners.map(p=>p.region))].map(r=><option key={r}>{r}</option>)}</select></label></div>
    <p className={c.count} aria-live="polite">{result.length} partners left to rank · Page {current} of {pages}</p>
    <div className={s.pool} role="group" aria-label="Unranked partners" onDragOver={e=>e.preventDefault()} onDrop={e=>{e.preventDefault();assign(Number(e.dataTransfer.getData("text/plain")),null);}}>{result.slice((current-1)*60,current*60).map(p=>sprite(p))}</div>
    {!result.length&&<p className={c.empty}>No partners match. Change the filters or return a ranked partner to the pool.</p>}
    <div className={c.pagination}><button disabled={current===1} onClick={()=>setPage(current-1)}>← Previous</button><span>{current} / {pages}</span><button disabled={current===pages} onClick={()=>setPage(current+1)}>Next →</button></div>
  </div>;
}
