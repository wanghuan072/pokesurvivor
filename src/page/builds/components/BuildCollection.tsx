"use client";
import { useEffect, useState } from "react";
import { PokemonArt } from "@/components/common/PokemonArt";
import { GameIcon, MoveIcon } from "@/components/common/GameIcon";
import type { BuildPreview } from "@/types/build";
import s from "@/style/page/builds.module.css";

export default function BuildCollection({ builds }: { builds: BuildPreview[]; }) {
  const [selected, setSelected] = useState("All builds");
  useEffect(() => {
    let scrollFrame = 0;
    const revealTarget = () => {
      const target = builds.find((b) => window.location.hash === `#build-${b.slug}`);
      if (target) {
        setSelected("All builds");
        window.cancelAnimationFrame(scrollFrame);
        scrollFrame = window.requestAnimationFrame(() => {
          document.getElementById(`build-${target.slug}`)?.scrollIntoView({ block: "start" });
        });
      }
    };
    window.addEventListener("hashchange", revealTarget);
    return () => {
      window.removeEventListener("hashchange", revealTarget);
      window.cancelAnimationFrame(scrollFrame);
    };
  }, [builds]);
  const filters = ["All builds", ...new Set(builds.map((b) => b.move.requirement))];
  const visible = builds.filter((b) => selected === "All builds" || b.move.requirement === selected);
  return (
    <section aria-labelledby="build-library">
      <div className={s.libraryHead}>
        <div><span className={s.eyebrow}>FIND YOUR NEXT PLAY STYLE</span><h2 id="build-library">Choose your game plan.</h2></div>
        <span className={s.resultCount} aria-live="polite">{String(visible.length).padStart(2, "0")} / {String(builds.length).padStart(2, "0")} BUILDS</span>
      </div>
      <div className={s.toolbar}>
        <span>CORE UPGRADE CARD</span>
        <div role="group" aria-label="Filter builds by required upgrade card">
          {filters.map((filter) => <button type="button" key={filter}
            aria-pressed={selected === filter} onClick={() => {
              setSelected(filter);
              if (builds.some((b) => window.location.hash === `#build-${b.slug}`)) {
                window.history.replaceState(null, "", window.location.pathname + window.location.search);
              }
            }}>
            {filter}<span>{filter === "All builds" ? builds.length : builds.filter((b) => b.move.requirement === filter).length}</span>
          </button>)}
        </div>
      </div>
      <div className={s.grid}>
        {visible.map((b) => (
          <article key={b.slug} id={`build-${b.slug}`} className={s.card} data-type={b.move.type}>
            <div className={s.cardTop}>
              <div className={s.portrait}>
                <div className={s.orbit} aria-hidden="true" />
                <PokemonArt id={b.lead.id} name={b.lead.name} size={104} />
              </div>
              <div className={s.cardIntro}>
                <span className={s.type}><GameIcon name={`type-${b.move.type.toLowerCase()}`} size={16} />{b.move.type} <span>/ {b.lead.name}</span></span>
                <h3>{b.title}</h3>
                <p>{b.description}</p>
              </div>
            </div>
            <div className={s.evolution}>
              <MoveIcon id={b.move.id} size={32} />
              <div><strong>{b.move.name}</strong><small>LEVEL 5 + {b.move.requirement.toUpperCase()}</small></div>
              <span aria-hidden="true">→</span>
              <b>{b.move.evolution}</b>
            </div>
            <div className={s.support}>
              <span>FOLLOW-UP OPTIONS</span>
              <div>{b.support.map((m) => <span key={m.id}><MoveIcon id={m.id} size={23} />{m.name}</span>)}</div>
            </div>
            <div className={s.cardFoot}>
              <div className={s.partners}>{b.partners.map((p) => <PokemonArt key={p.id} id={p.id} name={p.name} size={28} />)}</div>
              <span>{b.partners.length} compatible partners</span>
            </div>
            <details className={s.plan}>
              <summary>Upgrade plan &amp; item choices <span aria-hidden="true">+</span></summary>
              <div className={s.planBody}>
                <h4>Upgrade priorities</h4>
                <ol>{b.tips.map((tip) => <li key={tip}>{tip}</li>)}</ol>
                <h4>Compatible partners</h4>
                <p>{b.partners.map((p) => p.name).join(" · ")}</p>
                <h4>Follow-up evolution paths</h4>
                <ul>{b.support.map((m) => (
                  <li key={m.id}><a href={`/level-up#move-${m.slug}`}>{m.name}</a>
                    {m.evolution ? ` → ${m.evolution} · Level 5 + ${m.requirement}` : " · Support move"}</li>
                ))}</ul>
                <h4>Held items: choose one</h4>
                <ul className={s.itemChoices}>{b.items.map((item) => (
                  <li key={item.id}><GameIcon name={item.id} size={23} /><div><strong>{item.name}</strong><p>{item.description}</p></div></li>
                ))}</ul>
                <p className={s.itemNote}>These are alternatives. Only one held item can be equipped at a time.</p>
              </div>
            </details>
          </article>
        ))}
      </div>
    </section>
  );
}
