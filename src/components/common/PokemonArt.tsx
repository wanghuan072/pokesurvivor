import Image from "next/image";
/* Locally extracted SpriteCollab frames; credits and license are served by the site. */
export function PokemonArt({
  id,
  name,
  size = 80,
  shiny = false,
}: {
  id: number;
  name: string;
  size?: number;
  shiny?: boolean;
}) {
  return (
    <Image
      className="pokemon-art"
      src={`/game/pokemon/${id}${shiny ? "-shiny" : ""}.webp`}
      width={size}
      height={size}
      alt={shiny ? `Shiny ${name}` : name}
      loading="lazy"
      decoding="async"
      unoptimized
    />
  );
}
