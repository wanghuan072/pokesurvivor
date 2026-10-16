import { PokemonArt } from "./PokemonArt";

export function CollectionPokemonArt({ id, name, size = 96, shiny = false }: {
  id: number; name: string; size?: number; shiny?: boolean;
}) {
  return <PokemonArt id={id} name={name} size={size} shiny={shiny} />;
}
