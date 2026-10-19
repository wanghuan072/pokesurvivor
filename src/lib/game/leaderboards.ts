import type { LeaderboardBoard, LeaderboardEntry, PartnerRecord, RecommendationBoard, TeamRecord, TierPreset, TierBoardRow } from "@/types/leaderboard";

export function partnerRecords(rows: LeaderboardEntry[]): PartnerRecord[] {
  const records = new Map<number, PartnerRecord>();
  for (const row of rows) for (const id of new Set(row.pokemon.map(p => p.id))) {
    const record = records.get(id);
    if (!record) records.set(id, { id, count: 1, bestSeconds: row.seconds, bestRank: row.rank });
    else {
      record.count++;
      if (row.seconds > record.bestSeconds || (row.seconds === record.bestSeconds && row.rank < record.bestRank)) {
        record.bestSeconds = row.seconds; record.bestRank = row.rank;
      }
    }
  }
  return [...records.values()].sort((a, b) => b.count - a.count || b.bestSeconds - a.bestSeconds || a.id - b.id);
}
export function teamRecords(rows: LeaderboardEntry[]): TeamRecord[] {
  const records = new Map<string, TeamRecord>();
  for (const row of rows) {
    const ids = row.pokemon.map(p => p.id).sort((a, b) => a - b), key = ids.join(",");
    const record = records.get(key);
    if (!record) records.set(key, { key, ids, count: 1, bestSeconds: row.seconds, bestRank: row.rank });
    else {
      record.count++;
      if (row.seconds > record.bestSeconds || (row.seconds === record.bestSeconds && row.rank < record.bestRank)) {
        record.bestSeconds = row.seconds; record.bestRank = row.rank;
      }
    }
  }
  return [...records.values()].sort((a, b) => b.bestSeconds - a.bestSeconds || a.bestRank - b.bestRank || a.key.localeCompare(b.key));
}
export function recommendationBoard(board: LeaderboardBoard): RecommendationBoard {
  return {
    key: board.key, mode: board.mode, period: board.period, capturedAt: board.capturedAt, records: board.rows.length,
    cohorts: (board.mode === "group" ? [0, 2, 3, 4] : [0]).map(size => {
      const rows = size ? board.rows.filter(row => row.pokemon.length === size) : board.rows;
      const partners = partnerRecords(rows);
      return {
        size, records: rows.length, partners,
        teams: board.mode === "group" ? teamRecords(rows).slice(0, 3) : [],
      };
    }),
  };
}

export const tierColors = { S: "#e59781", A: "#e8be73", B: "#dfd780", C: "#9ec994" };
export function isTierLabel(value: string): value is keyof typeof tierColors {
  return value === "S" || value === "A" || value === "B" || value === "C";
}

/** Add recommended partners, preserving other picks, row names and row colors. */
export function applyTierPicks(rows: TierBoardRow[], tiers: TierPreset[]): TierBoardRow[] | null {
  const seen = new Set<number>();
  tiers = tiers.map(tier => ({ ...tier, picks: tier.picks.filter(p => { if (seen.has(p.id)) return false; seen.add(p.id); return true; }) }));
  const picks = new Set(tiers.flatMap(tier => tier.picks.map(p => p.id)));
  const next = rows.map(row => ({ ...row, partners: row.partners.filter(id => !picks.has(id)) }));
  for (const tier of tiers) {
    if (!tier.picks.length) continue;
    const row = next.find(row => row.label.trim().toUpperCase() === tier.label);
    if (row) row.partners.push(...tier.picks.map(p => p.id));
    else {
      if (next.length >= 10) return null;
      let id = `recommended-${tier.label}`;
      while (next.some(row => row.id === id)) id += "-new";
      next.push({ id, label: tier.label, color: tier.color, partners: tier.picks.map(p => p.id) });
    }
  }
  return next;
}
