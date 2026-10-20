import Image from "next/image";
import type { Pokemon } from "@/types/pokemon";
import { pokemon } from "@/lib/data/pokemon";
import { moves } from "@/lib/data/moves";
import { getEncounter, getMoveNotes } from "@/lib/data/game";
import { PokemonArt } from "@/components/common/PokemonArt";
import PartnerStrategy from "./PartnerStrategy";
import { PageSchema } from "@/seo/PageSchema";
import { JsonLd } from "@/seo/JsonLd";
import { site } from "@/config/site";
import mechanics from "@/data/game/mechanics.json";
import c from "@/style/common/content.module.css";
import s from "@/style/page/pokedex.module.css";

const rarities=["","Common","Uncommon","Rare","Epic","Legendary"];
export default function PokemonDetailPage({partner:p}:{partner:Pokemon}) {
  if(!p.detail) return null;
  const path=`/pokedex/${p.slug}`, encounter=getEncounter(p.id);
  const start=moves.find(m=>m.id===p.startMove)!;
  const pool=moves.filter(m=>p.learnset.includes(m.id));
  const neighbours=pokemon.filter(other=>other.hasDetailPage && Math.abs(other.id-p.id)===1);
  const stats=[["HP",p.hp],["Physical ATK",`×${p.physicalAttack.toFixed(2)}`],["Special ATK",`×${p.specialAttack.toFixed(2)}`],["Defense",p.defense],["Special defense",p.specialDefense],["Speed",p.speed]] as const;
  return <div className={c.wrap}>
    <nav className={c.breadcrumb} aria-label="Breadcrumb"><a href="/">Home</a><span>›</span><a href="/pokedex">Pokédex</a><span>›</span><span>{p.name}</span></nav>
    <header className={s.detailHero}>
      <div><p className={s.detailEyebrow}>PARTNER FILE / #{String(p.id).padStart(3,"0")} · KANTO</p><h1>{p.name}</h1>
        <div className={s.detailTags}><span className={s.rarity} data-rarity={p.rarity}>{rarities[p.rarity]}</span>{p.types.map(t=><span className="type" data-type={t} key={t}>{t}</span>)}{p.starter&&<span>Starter partner</span>}</div>
        <p>{p.detail.intro}</p><a className="btn" href={`/level-up?partner=${p.id}#move-cards`}>Explore {p.name}’s move cards →</a>
      </div>
      <div className={s.detailArt}><figure><PokemonArt id={p.id} name={p.name} size={160}/><figcaption>Normal</figcaption></figure>{encounter?.hasShiny&&<figure><PokemonArt id={p.id} name={p.name} shiny size={160}/><figcaption>Shiny</figcaption></figure>}</div>
    </header>
    <PageSchema path={path} title={p.name} description={p.detail.intro}/>
    <JsonLd data={{"@type":"BreadcrumbList",itemListElement:[{name:"Home",item:site.url},{name:"Pokédex",item:site.url+"/pokedex"},{name:p.name,item:site.url+path}].map((item,index)=>({"@type":"ListItem",position:index+1,...item}))}}/>
    {p.detail.strategy&&<nav className={s.detailJumps} aria-label="Partner guide sections"><a href="#base-stats">Stats</a><a href="#strength">Strength</a><a href="#recommended-moves">Recommended moves</a><a href="#team-play">Team play</a><a href="#practical-tips">Tips</a><a href="#move-pool">All cards</a></nav>}
    <section className={s.detailSection} aria-labelledby="base-stats"><div className={s.detailHeading}><h2 id="base-stats">Before the run</h2><span>BASE STATS · BEFORE UPGRADES</span></div>
      <dl className={s.detailStats}>{stats.map(([label,value])=><div key={label}><dt>{label}</dt><dd>{value}</dd></div>)}</dl>
      <p>Physical and special attacks use different attack factors. Defense and special defense affect the matching incoming damage category; they are not flat percentages of damage blocked. Speed is the game’s base movement value.</p>
    </section>
    <div className={s.detailColumns}>
      <section className={s.detailSection} aria-labelledby="starting-move"><div className={s.detailHeading}><h2 id="starting-move">Your opening move</h2><span>DEFAULT LOADOUT</span></div>
        <div className={s.detailOpening}><Image src={`/game/moves/${start.id}.png`} alt="" width={56} height={56} unoptimized/><div><h3>{start.name}</h3><span>{start.type} · {start.category} · {start.kind}</span></div></div>
        <p>{getMoveNotes(start.id)?.description}</p>
        <p>The <strong>{mechanics.startingMove.cost}-coin Starting move upgrade</strong> is bought separately for each partner. It lets you choose a legal non-buff opening; the default remains available. Learning another attack during a run does not automatically change the active slot.</p>
        <p>{p.types.length===1?`As a single-type ${p.types[0]} partner, ${p.name} gets ×${mechanics.combat.monoTypeMultiplier.toFixed(2)} damage on damaging ${p.types[0]} moves. Normal alternatives and buffs do not inherit that bonus.`:`${p.name} has two types and does not receive the single-type ×${mechanics.combat.monoTypeMultiplier.toFixed(2)} damage bonus.`}</p>
      </section>
      <section className={s.detailSection} aria-labelledby="choosing-cards"><div className={s.detailHeading}><h2 id="choosing-cards">Choosing your cards</h2><span>WHAT TO CHECK FIRST</span></div><ul className={s.detailTips}>{p.detail.tips.map(tip=><li key={tip}>{tip}</li>)}</ul>
        <p>Move evolutions below upgrade an attack. They do not mean this partner changes into another Pokémon. For upgrade rules and slot choices, read the <a href="/guides/move-evolutions">move evolution guide</a>.</p>
      </section>
    </div>
    <PartnerStrategy partner={p}/>
    <section className={s.detailSection} aria-labelledby="move-pool"><div className={s.detailHeading}><h2 id="move-pool">{p.name}’s move pool</h2><span>{pool.length} CARDS · DEFAULT START INCLUDED</span></div>
      <p>These are the cards this partner can learn, including its default attack. They are choices, not a loadout you receive at once. An evolution requires the base move at its maximum level and the listed stat card; attack names alone do not imply extra effects such as healing.</p>
      {(["physical","special","buff"] as const).map(category=>{
        const cards=pool.filter(m=>m.category===category);
        return cards.length>0&&<div key={category} className={s.detailCategory}><h3>{category==="buff"?"Buff cards":`${category==="physical"?"Physical":"Special"} attacks`} <span>{cards.length}</span></h3><div className={s.detailMoves}>{cards.map(move=><article key={move.id}>
          <div className={s.detailOpening}><Image src={`/game/moves/${move.id}.png`} alt="" width={40} height={40} unoptimized/><div><h4><a href={`/level-up?partner=${p.id}#move-${move.slug}`}>{move.name}</a>{move.id===p.startMove&&<small>DEFAULT</small>}</h4><span>{move.type} · {move.kind}</span></div></div>
          <p>{getMoveNotes(move.id)?.description}</p>
          {move.evolution&&<p className={s.detailRecipe}><strong>{move.evolution}</strong><span>Lv. {move.maxLevel} {move.name} + {move.requirement}</span></p>}
        </article>)}</div></div>;
      })}
    </section>
    <section className={s.detailSection} aria-labelledby="collection"><div className={s.detailHeading}><h2 id="collection">Collection notes</h2><span>KANTO · {rarities[p.rarity].toUpperCase()}</span></div>
      <p>{p.starter?`${p.name} is one of the starter partners. `:""}{p.name} belongs to the Kanto collection and has {rarities[p.rarity].toLowerCase()} rarity. Check the Kanto pool when choosing a regional Gacha pull; a pull does not guarantee a specific species. <a href="/gacha">Compare Gacha pools and pity rules →</a></p>
      {encounter?.hasShiny&&<p>The shiny appearance shown above uses the game’s collection animation and sparkle effect. It is an appearance, not a separate stat row on this page. See <a href="/guides/shiny-pokemon">how shiny Pokémon are obtained</a> before spending tickets.</p>}
      <p>Your owned partners and selected starting move are stored by the game. This fan guide cannot read or change your collection.</p>
    </section>
    <nav className={s.detailNeighbours} aria-label="More partners">{neighbours.map(other=><a href={`/pokedex/${other.slug}`} key={other.id}><PokemonArt id={other.id} name={other.name} size={48}/><span>{other.id<p.id?"← Previous partner":"Next partner →"}<strong>{other.name}</strong></span></a>)}<a href="/pokedex">Back to all 966 Pokémon →</a></nav>
    <p className={c.source}>Base values and card pools follow the game data reviewed for build {mechanics.build}. <a href="https://pokesurvivor.com/en/pokedex/">Official Pokédex</a> · <a href="/credits/spritecollab-artists.md">SpriteCollab artwork credits</a> · <a href="mailto:support@pokesurvivor.me">Report a correction</a>.</p>
  </div>;
}
