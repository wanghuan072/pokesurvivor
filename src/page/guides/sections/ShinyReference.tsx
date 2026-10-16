import { CollectionPokemonArt } from "@/components/common/CollectionPokemonArt";
import { pokemon } from "@/lib/data/pokemon";
import { getSpriteAssets } from "@/lib/data/game";
import s from "@/style/page/game-data.module.css";
export default function ShinyReference() {
  return (
    <section className={s.reference}>
      <div className={s.heading}>
        <div>
          <small>IN-GAME SPRITE COMPARISON</small>
          <h2>Normal & shiny appearances</h2>
        </div>
        <span>958 SHINY SHEETS</span>
      </div>
      <p>
        A color variant does not change a partner’s base stats. Artwork
        availability is separate from the chance of rolling a shiny.
      </p>
      <div className={s.shinyGrid}>
        {[6, 25, 54, 94, 133, 448].map((id) => {
          const p = pokemon.find((p) => p.id === id)!;
          if (!getSpriteAssets(id)?.shiny) return null;
          return (
            <figure key={id}>
              <div>
                <CollectionPokemonArt id={id} name={p.name} />
                <span>→</span>
                <CollectionPokemonArt id={id} name={p.name} shiny />
              </div>
              <figcaption>
                {p.name}
                <small>Normal / Shiny</small>
              </figcaption>
            </figure>
          );
        })}
      </div>
      <p className={s.caption}>
        Game Idle animation and original collection star effect · SpriteCollab ·{" "}
        <a href="/credits/spritecollab-artists.md">Artist credits</a> · CC BY-NC
        4.0.
      </p>
    </section>
  );
}
