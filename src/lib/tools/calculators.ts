import chart from "@/data/tools/type-chart.json";
export const typeNames = Object.keys(chart);
export function typeMultiplier(attack: string, defense: string, second = "") {
  const row = chart[attack as keyof typeof chart];
  if (!row) return 1;
  return Number(
    (
      row[typeNames.indexOf(defense)] *
      (second && second !== defense ? row[typeNames.indexOf(second)] : 1)
    ).toFixed(3),
  );
}
export function pullProbability(rate: number, pulls: number) {
  if (
    !Number.isFinite(rate) ||
    !Number.isFinite(pulls) ||
    rate < 0 ||
    rate > 100 ||
    pulls < 0
  )
    return null;
  return (1 - Math.pow(1 - rate / 100, Math.floor(pulls))) * 100;
}
