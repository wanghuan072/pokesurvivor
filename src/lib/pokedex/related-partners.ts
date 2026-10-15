import { pokemon } from "@/lib/data/pokemon";
import type { Pokemon } from "@/types/pokemon";
import { typeNames, typeMultiplier } from "@/lib/tools/calculators";
export function relatedPartners(partner: Pokemon) {
  return pokemon
    .filter(
      (p) =>
        p.hasDetailPage &&
        p.id !== partner.id &&
        p.region === partner.region &&
        p.types.some((t) => partner.types.includes(t)),
    )
    .slice(0, 6);
}
export function defensiveMatchups(types: string[]) {
  return typeNames
    .map((type) => ({
      type,
      multiplier: typeMultiplier(type, types[0], types[1]),
    }))
    .filter((x) => x.multiplier !== 1)
    .sort((a, b) => b.multiplier - a.multiplier);
}
