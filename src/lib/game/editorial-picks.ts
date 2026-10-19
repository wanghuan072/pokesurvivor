import type { EditorialPick } from "@/types/leaderboard";

type Partner = { id: number; name: string; hp: number; speed: number; physicalAttack: number; specialAttack: number; defense: number; specialDefense: number };
type PickInput = { id: number; tier: string; reason: string; watchFor: string };
export function editorialPicks(partners: Partner[], picks: PickInput[]): EditorialPick[] {
  return picks.map(pick => {
    const p = partners.find(p => p.id === pick.id);
    if (!p) throw new Error("Unknown editorial tier-list partner");
    const tier = pick.tier;
    if (tier !== "S" && tier !== "A" && tier !== "B" && tier !== "C") throw new Error("Invalid tier");
    const attack = p.physicalAttack > p.specialAttack ? `Phys. ATK ${p.physicalAttack.toFixed(2)}` : `Sp. ATK ${p.specialAttack.toFixed(2)}`;
    return { ...pick, tier, name: p.name, statLine: `${p.hp} HP · ${attack} · Speed ${p.speed}` };
  });
}
