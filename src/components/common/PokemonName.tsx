import type { Pokemon } from "@/types/pokemon";

export function PokemonName({
  pokemon: p,
}: {
  pokemon: Pick<Pokemon, "hasDetailPage" | "slug" | "name">;
}) {
  return p.hasDetailPage ? (
    <a href={`/pokedex/${p.slug}`}>{p.name}</a>
  ) : (
    <span>{p.name}</span>
  );
}
