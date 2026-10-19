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
