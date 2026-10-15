import { gacha } from "@/lib/data/wiki";
export type GachaTarget = { rarity: number; poolSize: number } | null;
/** Exact no-hit probability over pity state and the current ten-pull's 4★ flag. */
export function gachaProbability(
  pulls: number,
  pity: number,
  tenPull: boolean,
  target: GachaTarget = null,
) {
  if (
    !Number.isInteger(pulls) ||
    pulls < 0 ||
    pulls > 1000 ||
    !Number.isInteger(pity) ||
    pity < 0 ||
    pity >= gacha.pity ||
    (target &&
      (!Number.isInteger(target.poolSize) ||
        target.poolSize < 1 ||
        target.rarity < 1 ||
        target.rarity > 5))
  )
    return null;
  if (tenPull && pulls % 10 !== 0) return null;
  let state = new Float64Array(gacha.pity * 2);
  state[pity * 2] = 1;
  for (let step = 0; step < pulls; step++) {
    const next = new Float64Array(state.length),
      last = tenPull && step % 10 === 9;
    for (let count = 0; count < gacha.pity; count++)
      for (let high = 0; high < 2; high++) {
        const weight = state[count * 2 + high];
        if (!weight) continue;
        const rates =
          count + 1 >= gacha.pity
            ? [{ rarity: 5, percent: 100 }]
            : last && !high
              ? gacha.rates
                  .filter((r) => r.rarity >= 4)
                  .map((r) => ({ ...r, percent: (r.percent / 8) * 100 }))
              : gacha.rates;
        for (const { rarity, percent } of rates) {
          const hit = target
            ? rarity === target.rarity
              ? 1 / target.poolSize
              : 0
            : rarity === 5
              ? 1
              : 0;
          const c = rarity === 5 ? 0 : count + 1;
          const h = last ? 0 : tenPull && (high || rarity >= 4) ? 1 : 0;
          next[c * 2 + h] += ((weight * percent) / 100) * (1 - hit);
        }
      }
    state = next;
  }
  return Math.max(0, Math.min(1, 1 - state.reduce((a, b) => a + b, 0)));
}
