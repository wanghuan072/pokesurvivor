import Image from "next/image";
import previewIndex from "@/data/game/collection-preview-index.json";
const normalPreviews = new Set(previewIndex.normal);
const shinyPreviews = new Set(previewIndex.shiny);
/* Original-game collection animation/effects; notices retained in public/credits. */
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
  const isShiny = shiny && shinyPreviews.has(id);
  const animated = (isShiny ? shinyPreviews : normalPreviews).has(id);
  const stem = `${id}-${isShiny ? "shiny" : "normal"}`;
  const fallback = `/game/pokemon/${id}${isShiny ? "-shiny" : ""}.webp`;
  const art = (
    <Image
      className="pokemon-art"
      src={animated ? `/game/collection/${stem}.webp` : fallback}
      width={size}
      height={size}
      alt={isShiny ? `Shiny ${name}` : name}
      loading="lazy"
      decoding="async"
      unoptimized
    />
  );
  return animated ? <picture>
    <source media="(prefers-reduced-motion: reduce)" srcSet={`/game/collection/${stem}-still.webp`} />
    {art}
  </picture> : art;
}
