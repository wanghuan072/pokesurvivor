import mechanics from "@/data/game/mechanics.json";

type AttackStats = { attack: number; physicalAttack: number; specialAttack: number };
export function attackSide(partner: AttackStats) {
  return partner.specialAttack > partner.physicalAttack ? "special" : "physical";
}
export function attackFit(partner: AttackStats, category: "physical" | "special" | "buff") {
  if (category === "buff") return 1;
  return (category === "physical" ? partner.physicalAttack : partner.specialAttack) / partner.attack;
}
export function defenseFactor(defense: number) {
  const rule = mechanics.defense;
  return Math.max(rule.minimum, Math.min(rule.maximum, (rule.reference / Math.max(5, defense || rule.reference)) ** rule.exponent));
}
export function ownTypeMultiplier(types: string[], moveType: string, category: "physical" | "special" | "buff") {
  return category !== "buff" && types.length === 1 && types[0].toLowerCase() === moveType.toLowerCase()
    ? mechanics.combat.monoTypeMultiplier : 1;
}
export function startingMoveChoices(partner: {cardPool:string[];startMove:string}, moves: {id:string;category:string}[]) {
  return [...new Set([...partner.cardPool.filter(id=>moves.some(m=>m.id===id&&m.category!=="buff")),partner.startMove])];
}
