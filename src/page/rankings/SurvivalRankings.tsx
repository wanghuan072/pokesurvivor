"use client";
import { useState } from "react";
import { PokemonArt } from "@/components/common/PokemonArt";
import { GameIcon } from "@/components/common/GameIcon";
import s from "@/style/page/rankings.module.css";

type Entry = { rank: number; names: string[]; pokemon: { id: number; shiny: boolean }[]; seconds: number; level: number; defeated: number };
type Board = { key: string; capturedAt: string; mode: string; period: string; rows: Entry[] };
const periods = ["daily", "weekly", "monthly", "all-time"] as const;
const labels = { daily: "Daily", weekly: "Weekly", monthly: "Monthly", "all-time": "All-time" };
const number = new Intl.NumberFormat("en-US");
const date = new Intl.DateTimeFormat("en-GB", { dateStyle: "medium", timeStyle: "short", timeZone: "UTC" });
function survivalTime(seconds: number) {
  const whole = Math.floor(seconds), minutes = Math.floor(whole / 60), remaining = String(whole % 60).padStart(2, "0");
  return minutes >= 60 ? `${Math.floor(minutes / 60)}:${String(minutes % 60).padStart(2, "0")}:${remaining}` : `${minutes}:${remaining}`;
}
function periodLabel(board:Board) {
  const day=board.key.match(/_d(\d{4})(\d{2})(\d{2})/);
  if(day)return `${day[1]}-${day[2]}-${day[3]}`;
  const week=board.key.match(/_w(\d{4})-(\d+)/);
  if(week)return `Week ${week[2]}, ${week[1]}`;
  const month=board.key.match(/_m(\d{4})(\d{2})/);
  if(month)return `${month[1]}-${month[2]}`;
  return 'All-time · post-reset board';
}
export default function SurvivalRankings({boards, partners}: { boards: Board[]; partners: {id: number; name: string}[] }) {
  const [mode, setMode] = useState("solo");
  const [period, setPeriod] = useState<(typeof periods)[number]>("weekly");
  const [query, setQuery] = useState("");
  const [species, setSpecies] = useState("");
  const names = new Map(partners.map(p => [p.id, p.name]));
  const board = boards.find(b => b.mode === mode && b.period === period)!;
  const rows = board.rows.filter(row => (!species || row.pokemon.some(p => p.id === Number(species))) && row.names.join(" ").toLowerCase().includes(query.trim().toLowerCase()));
  const availablePartners = partners.filter(p => board.rows.some(row => row.pokemon.some(member => member.id === p.id))).sort((a,b) => a.name.localeCompare(b.name));
  return <>
    <section className={s.board} aria-label="Survival time leaderboard" translate="no">
      <header className={s.boardHeader}>
        <div><GameIcon name="trophy" size={28} /><h2>Leaderboard <span>· survival time</span></h2></div>
        <a href="https://pokesurvivor.com/en/" target="_blank" rel="noopener noreferrer">Official leaderboard ↗</a>
      </header>
      <div className={s.tabs} role="group" aria-label="Run mode">
        {["solo", "group"].map(value => <button key={value} aria-pressed={mode === value} onClick={() => { setMode(value); setSpecies(""); }}>{value === "solo" ? "Solo" : "Group"}</button>)}
      </div>
      <div className={s.tabs} role="group" aria-label="Ranking period">
        {periods.map(value => <button key={value} aria-pressed={period === value} onClick={() => { setPeriod(value); setSpecies(""); }}>{labels[value]}</button>)}
      </div>
      <div className={s.filters}>
        <label>Find a player<input type="search" placeholder="Player nickname…" value={query} onChange={event => setQuery(event.target.value)} /></label>
        <label>Pokémon in this board<select value={species} onChange={event => setSpecies(event.target.value)}><option value="">All Pokémon</option>{availablePartners.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}</select></label>
        <button onClick={() => { setQuery(""); setSpecies(""); }}>Reset filters</button>
      </div>
      <div className={s.status} aria-live="polite"><span>{mode === "solo" ? "Solo" : "Group"} · {periodLabel(board)} · {rows.length} / {board.rows.length} records</span><span>Captured {date.format(new Date(board.capturedAt))} UTC</span></div>
      <div className={s.viewport} tabIndex={0} role="region" aria-label="Scroll leaderboard records">
        <ol className={s.list}>
          {rows.map(row => <li key={row.rank} value={row.rank} className={s.row} data-podium={row.rank <= 3}>
            <span className={s.place} aria-label={`Rank ${row.rank}`}>{row.rank <= 3 && <GameIcon name="trophy" size={19} />}<b>{row.rank}</b></span>
            <span className={s.mons}>{row.pokemon.map((p,index) => <PokemonArt key={`${p.id}-${index}`} id={p.id} name={names.get(p.id) ?? `Pokémon ${p.id}`} shiny={p.shiny} size={40} />)}</span>
            <div className={s.identity}><h3 title={row.names.join(" · ")}>{row.names.join(" · ")}</h3><small>Lv. {number.format(row.level)} · {number.format(row.defeated)} defeated</small></div>
            <time className={s.value} dateTime={`PT${Math.floor(row.seconds)}S`}>{survivalTime(row.seconds)}</time>
          </li>)}
        </ol>
        {!rows.length && <p className={s.empty}>No records match these filters. Try another nickname or reset the filters.</p>}
      </div>
      <footer className={s.boardFooter}>Saved official board · not live. Daily, weekly and monthly tabs refer to the displayed period, not today’s live board. Game calendar: Europe/Madrid. Filtering keeps the original positions.</footer>
    </section>
    <div className={s.notes}>
      <article><h2>What these records show</h2><p>The game orders these boards by survival time. Each row shows the player or team, their partners, level and defeated count. A listed record is not a strength rating or an independently verified run.</p></article>
      <article><h2>Find your own rank</h2><p>Open the official game, sign in and choose Leaderboard. Your personal position, friends-only boards and Pokémon-specific All-time boards stay in the game. This fan site does not access your account.</p></article>
    </div>
  </>;
}
