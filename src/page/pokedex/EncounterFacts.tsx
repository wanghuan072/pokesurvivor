import { getEncounter, waves } from "@/lib/data/game";
import { LocalSourceNote } from "@/components/common/LocalSourceNote";
import s from "@/style/page/game-data.module.css";
import type { Pokemon } from "@/types/pokemon";
export default function EncounterFacts({ pokemon: p }: { pokemon: Pokemon }) {
  const entry = getEncounter(p.id)!;
  return (
    <section className={s.encounter}>
      <h2>Where can you encounter {p.name}?</h2>
      <div className={s.factStrip}>
        <span>
          BASE STAT TOTAL <b>{p.baseStatTotal}</b>
        </span>
        <span>
          SPRITE MOVEMENT <b>{entry.hovering ? "Hovering" : "Grounded"}</b>
        </span>
        <span>
          SHINY ART <b>{entry.hasShiny ? "Available" : "Not in archive"}</b>
        </span>
      </div>
      <p>
        These are eligible encounter pools in the archived build, rather than
        guaranteed spawns. Each run draws a different cast.
      </p>
      {entry.wildTiers.length ? (
        <ul>
          {entry.wildTiers.map((index) => (
            <li key={index}>
              Wild tier {index + 1}: available from{" "}
              {Math.floor(waves.tiers[index].from / 60)}:
              {String(waves.tiers[index].from % 60).padStart(2, "0")} · BST band{" "}
              {waves.tiers[index].bst.join("–")}.
            </li>
          ))}
        </ul>
      ) : (
        <p>
          {p.legendary
            ? "Legendary partners are encountered through Rifts instead of the normal wild tier pools."
            : "This partner is outside the ordinary wild tier pools in this archive."}
        </p>
      )}
      {entry.bossSlots.length > 0 && (
        <p>
          Eligible for boss selection at{" "}
          {entry.bossSlots
            .map((i) => `${waves.bosses[i].at / 60}:00`)
            .join(", ")}{" "}
          based on BST. Bosses are drawn without repeating the same species; an
          empty pool uses a fallback.
        </p>
      )}
      <p>
        Hovering is a sprite metadata flag used for passing over terrain. It is
        separate from the Flying type.
      </p>
      <a href="/guides/beginner-guide#waves">
        Explore all wave tiers and boss candidates →
      </a>
      <LocalSourceNote
        files={["js/data/enemies.js", "js/data/sprites-meta.js"]}
      />
    </section>
  );
}
