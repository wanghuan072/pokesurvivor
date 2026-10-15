import data from "@/data/pokedex/pokemon.json";
import type { Pokemon } from "@/types/pokemon";
export const pokemon: Pokemon[] = data;
export const getPokemon = (slug: string) =>
  pokemon.find((p) => p.slug === slug);
