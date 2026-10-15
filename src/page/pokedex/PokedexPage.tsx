import { getEncounter } from "@/lib/data/game";
import { PageHeader } from "@/components/common/PageHeader";
import { pokemon } from "@/lib/data/pokemon";
import PokedexBrowser from "./PokedexBrowser";
import { pageMetadata } from "@/seo/metadata";
import s from "@/style/common/content.module.css";
export const metadata = pageMetadata("/pokedex");
export default function PokedexPage() {
  return (
    <div className={s.wrap}>
      <PageHeader
        title="PokeSurvivor Pokédex"
        description="Your next partner is out there. Explore all 966 playable Pokémon from Kanto to Paldea, and find a companion for every kind of run."
        path="/pokedex"
        category="PARTNER ATLAS"
      />
      <p className="notice">
        Browse all {pokemon.length} partners’ base stats in this roster.
        Filter by type, region or collection group, and compare normal and shiny
        sprites without leaving the list.
      </p>
      <PokedexBrowser
        pokemon={pokemon.map(
          ({
            hasDetailPage,
            id,
            slug,
            name,
            region,
            types,
            starter,
            legendary,
            hp,
            speed,
            attack,
            rarity,
          }) => ({
            hasShiny: !!getEncounter(id)?.hasShiny,
            hovering: !!getEncounter(id)?.hovering,
            hasDetailPage,
            id,
            slug,
            name,
            region,
            types,
            starter,
            legendary,
            hp,
            speed,
            attack,
            rarity,
          }),
        )}
      />
      <p className={s.source}>
        Roster and typing:{" "}
        <a href="https://pokesurvivor.com/en/pokedex/">official Pokédex</a>.
        Reviewed October 15, 2026. Sprites:{" "}
        <a href="/credits/spritecollab-artists.md">SpriteCollab artists</a> (CC
        BY-NC 4.0), extracted from the supplied game archive.
      </p>
    </div>
  );
}
