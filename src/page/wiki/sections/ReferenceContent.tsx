"use client";
import { useState } from "react";
import { achievements, snapshot } from "@/lib/data/wiki";
import { SourceNote } from "@/components/common/SourceNote";
import { GameIcon } from "@/components/common/GameIcon";
import s from "@/style/common/content.module.css";

const categories = [...new Set(achievements.map(achievement => achievement.category))];
const categoryId = (category: string) => "achievement-" + category.toLowerCase().replace(/[^a-z0-9]+/g, "-");
const singleRun=new Set(['time5','time10','time15','time20','lvl20','lvl40','judge','judge60','judgeBoss']);

export default function ReferenceContent() {
  const [query,setQuery]=useState(""),[reward,setReward]=useState(""),[scope,setScope]=useState("");
  const visible=achievements.filter(a=>`${a.name} ${a.description} ${a.title??''}`.toLowerCase().includes(query.trim().toLowerCase())&&(!reward||Number(a.reward[reward as keyof typeof a.reward]??0)>0)&&(!scope||(scope==='run')===singleRun.has(a.id)));
  return (
    <>
      <p className="notice">
        Choose among {snapshot.counts.achievements} achievement goals. Check whether a requirement
        applies to one run or your overall progress as you earn rewards in the game.
        The Judgment challenges reward survival; defeating an invulnerable Arceus is not the objective.
      </p>
      <div className={s.toolbar}>
        <label>Find a goal<input type="search" value={query} onChange={e=>setQuery(e.target.value)} placeholder="Shiny, survive, Articuno…"/></label>
        <label>Reward<select aria-label="Reward" value={reward} onChange={e=>setReward(e.target.value)}><option value="">All rewards</option><option value="coins">Coins</option><option value="t1">Single tickets</option><option value="t10">×10 tickets</option></select></label>
        <label>Progress<select aria-label="Progress" value={scope} onChange={e=>setScope(e.target.value)}><option value="">All goals</option><option value="run">Single-run record</option><option value="overall">Overall collection or progress</option></select></label>
        <button onClick={()=>{setQuery("");setReward("");setScope("");}}>Reset filters</button>
      </div>
      <p className={s.count} aria-live="polite">{visible.length} / {achievements.length} goals. Achievement rewards are automatic; mission rewards must be claimed separately.</p>
      <nav className={s.chips} aria-label="Achievement categories">
        {categories.map(category => <a href={"#" + categoryId(category)} key={category}>
          {category} · {achievements.filter(achievement => achievement.category === category).length}
        </a>)}
      </nav>
      {categories.map(category => (
        <section key={category}>
          <h2 className={s.sectionTitle} id={categoryId(category)}>{category}</h2>
          <ul className={s.achievementList}>
            {visible.filter(a => a.category === category).map(achievement => (
              <li key={achievement.id}>
                <article className={s.achievementCard}>
                  <GameIcon name={achievement.tier ? `medal${achievement.tier}` : "medalOff"} size={40} />
                  <div>
                    <h3>{achievement.name}</h3>
                    <p>{achievement.description}</p>
                    <small>{singleRun.has(achievement.id)?'Single-run record':'Overall collection or progress'}</small>
                    <div className={s.achievementReward}>
                      <span>{Object.entries(achievement.reward).map(([key, value]) =>
                        `${value} ${key === "t10" ? "×10 ticket" : key === "t1" ? "ticket" : "coins"}`
                      ).join(" · ")}</span>
                      <small>{["", "Bronze", "Silver", "Gold"][achievement.tier]}{achievement.title ? " · " + achievement.title : ""}</small>
                    </div>
                  </div>
                </article>
              </li>
            ))}
          </ul>
          {!visible.some(a=>a.category===category)&&<p className={s.count}>No matching goals in this category.</p>}
        </section>
      ))}
      <SourceNote files={["js/data/achievements.js", "js/data/pokedex.js"]} />
    </>
  );
}
