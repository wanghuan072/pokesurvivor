"use client";
import { useState } from "react";
import { PokemonArt } from "@/components/common/PokemonArt";
import { gacha } from "@/lib/data/wiki";
import s from "@/style/common/content.module.css";

type Partner = {id:number;name:string;region:string;rarity:number};
export default function GachaTarget({partners}:{partners:Partner[]}) {
  const [query,setQuery]=useState("Pikachu");
  const term=query.trim().toLowerCase();
  const target=partners.find(p=>p.name.toLowerCase()===term||String(p.id)===term.replace(/^#/,""));
  const banner=target?gacha.banners.find(b=>b.region===target.region):undefined;
  const pool=target&&banner?banner.counts[target.rarity-1]:0;
  const rate=target?gacha.rates.find(r=>r.rarity===target.rarity)!.percent/pool:0;
  return <section id="target-partner" className={s.article} aria-labelledby="target-title">
    <h2 id="target-title">Find your target’s banner</h2>
    <div className={s.toolbar}><label>Pokémon name or number<input type="search" list="gacha-partners" value={query} onChange={e=>setQuery(e.target.value)} placeholder="Pikachu or #25" autoComplete="off" /></label><datalist id="gacha-partners">{partners.map(p=><option key={p.id} value={p.name}>#{p.id}</option>)}</datalist></div>
    {target&&banner?<div className={s.card} aria-live="polite">
      <PokemonArt id={target.id} name={target.name} size={80}/><h3>{target.name}</h3>
      <p><strong>{target.region[0].toUpperCase()+target.region.slice(1)} banner · {target.rarity}★</strong> · {pool} partners in this rarity pool.</p>
      <p>Ordinary single-pull chance: {gacha.rates.find(r=>r.rarity===target.rarity)!.percent}% ÷ {pool} = <strong>{rate.toFixed(4)}%</strong>.</p>
      <p>This is the species chance before pity and the restricted last result of a ten-pull. The 5★ guarantee promises a rarity, not {target.name}; it does not guarantee a shiny.</p>
      <a href="/guides/gacha-and-tickets#guarantees">Understand both guarantees →</a>
    </div>:<p className={s.empty} role="status">Enter a complete name or Pokédex number to see its banner and base chance.</p>}
  </section>;
}
