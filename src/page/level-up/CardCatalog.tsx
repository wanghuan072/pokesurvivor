"use client";
import { useEffect, useState } from "react";
import { MoveIcon } from "@/components/common/GameIcon";
import type { Move } from "@/types/move";
import s from "@/style/page/level-up.module.css";
import c from "@/style/common/content.module.css";

type Card = Move & {
  description: string;
  levelEffects: { level: number; text: string }[];
  evolutionEffect: string | null;
  partnerCount: number;
};
export default function CardCatalog({ moves }: { moves: Card[] }) {
  const [query, setQuery] = useState(""),
    [type, setType] = useState(""),
    [recipe, setRecipe] = useState(""),
    [evolutions, setEvolutions] = useState(false);
  // A cross-reference may target a card hidden by the current filters.
  useEffect(() => {
    let frame = 0;
    function revealCard() {
      // Card IDs are ASCII slugs; do not decode untrusted percent escapes.
      const id = window.location.hash.slice(1);
      if (!moves.some((move) => id === `move-${move.slug}`)) return;
      setQuery("");
      setType("");
      setRecipe("");
      setEvolutions(false);
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() =>
        document.getElementById(id)?.scrollIntoView({ block: "center" }),
      );
    }
    window.addEventListener("hashchange", revealCard);
    return () => {
      window.removeEventListener("hashchange", revealCard);
      cancelAnimationFrame(frame);
    };
  }, [moves]);
  const filtered = moves.filter(
    (m) =>
      (!evolutions || m.evolution) &&
      (!type || m.type === type) &&
      (!recipe || m.requirement === recipe) &&
      `${m.name} ${m.evolution || ""} ${m.kind} ${m.description}`
        .toLowerCase()
        .includes(query.toLowerCase()),
  );
  return (
    <>
      <div className={s.catalogTabs}>
        <button aria-pressed={!evolutions} onClick={() => setEvolutions(false)}>
          All move cards <span>{moves.length}</span>
        </button>
        <button aria-pressed={evolutions} onClick={() => setEvolutions(true)}>
          ◆ Evolution recipes{" "}
          <span>{moves.filter((m) => m.evolution).length}</span>
        </button>
      </div>
      <div className={c.toolbar}>
        <label>
          Find a card
          <input
            type="search"
            placeholder="Move, evolution or attack style…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </label>
        <label>
          Type
          <select value={type} onChange={(e) => setType(e.target.value)}>
            <option value="">All 18 types</option>
            {[...new Set(moves.map((m) => m.type))].sort().map((t) => (
              <option key={t}>{t}</option>
            ))}
          </select>
        </label>
        <label>
          Required stat card
          <select value={recipe} onChange={(e) => setRecipe(e.target.value)}>
            <option value="">Any requirement</option>
            {[
              ...new Set(
                moves.flatMap((m) => (m.requirement ? [m.requirement] : [])),
              ),
            ]
              .sort()
              .map((t) => (
                <option key={t}>{t}</option>
              ))}
          </select>
        </label>
        <button
          onClick={() => {
            setQuery("");
            setType("");
            setRecipe("");
          }}
        >
          Reset filters
        </button>
      </div>
      <p className={c.count} aria-live="polite">
        {filtered.length} cards found
      </p>
      <div className={s.moveList}>
        {filtered.map((m) => (
          <article
            className={s.moveRow}
            id={`move-${m.slug}`}
            key={m.id}
            data-evolution={evolutions}
          >
            <div className={s.moveArtwork} data-type={m.type}>
              <MoveIcon id={m.id} size={64} />
              <small>{m.kind.toUpperCase()}</small>
              <span>Lv.1 → {m.maxLevel}</span>
            </div>
            <div className={s.moveBody}>
              <div className={s.moveHeader}>
                <h3>{m.name}</h3>
                <span className="type" data-type={m.type}>
                  {m.type}
                </span>
                <span className={s.rowCategory}>
                  {m.evolution ? "MOVE CARD" : "SUPPORT CARD"}
                </span>
              </div>
              <p className={s.rowDescription}>{m.description}</p>
              <div className={s.rowStats}>
                <span>
                  BASE DAMAGE <b>{m.base.dmg ?? "—"}</b>
                </span>
                <span>
                  COOLDOWN <b>{m.base.cd}s</b>
                </span>
                <span>
                  AVAILABLE TO <b>{m.partnerCount} partners</b>
                </span>
              </div>
              <div className={s.rowEvolution}>
                {m.evolution ? (
                  <>
                    <strong>◆ {m.evolution}</strong>
                    <span>
                      Level {m.maxLevel} + {m.requirement} card
                    </span>
                    <p>{m.evolutionEffect}</p>
                  </>
                ) : (
                  <>
                    <strong>Buff · No evolution</strong>
                    <span>
                      This support move upgrades to level {m.maxLevel}.
                    </span>
                  </>
                )}
              </div>
              <details className={s.inlineUpgrades}>
                <summary>Level-up effects & values</summary>
                <ol start={2}>
                  {m.levelEffects.map((effect) => (
                    <li key={effect.level}>
                      <b>Lv.{effect.level}</b> {effect.text}
                    </li>
                  ))}
                </ol>
                <div className={c.tableWrap}>
                  <table className={c.table}>
                    <caption className="sr-only">
                      {m.name} unmodified values by level
                    </caption>
                    <thead>
                      <tr>
                        <th>LEVEL</th>
                        <th>
                          {m.base.dmg === undefined
                            ? "BUFF / STACK"
                            : "DAMAGE / HIT"}
                        </th>
                        <th>COOLDOWN</th>
                      </tr>
                    </thead>
                    <tbody>
                      {m.levels.map((level) => (
                        <tr key={level.level}>
                          <td>{level.level}</td>
                          <td>
                            {Number(
                              (level.dmg ?? level.amount ?? 0).toFixed(3),
                            )}
                          </td>
                          <td>{Number((level.cd ?? 0).toFixed(3))}s</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <p>
                  Base values before partner attack, typing, weather and run
                  modifiers. Damage is per hit or tick, not measured DPS.
                </p>
              </details>
            </div>
          </article>
        ))}
      </div>
      {!filtered.length && (
        <p className={c.empty}>
          No cards match. Try another type or reset your filters.
        </p>
      )}
    </>
  );
}
