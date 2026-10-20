export type RankingPeriod = "daily" | "weekly" | "monthly" | "all-time";
export type RankingMode = "solo" | "group";
export type LeaderboardEntry = {
  rank: number;
  names: string[];
  pokemon: { id: number; shiny: boolean }[];
  seconds: number;
  level: number;
  defeated: number;
};
export type LeaderboardBoard = {
  key: string;
  capturedAt: string;
  mode: string;
  period: string;
  rows: LeaderboardEntry[];
};
export type PartnerRecord = { id: number; count: number; bestSeconds: number; bestRank: number };
export type TeamRecord = { key: string; ids: number[]; count: number; bestSeconds: number; bestRank: number };
export type TierLabel = "S" | "A" | "B" | "C" | "D";
export type TierPreset = { label: TierLabel; color: string; picks: { id: number }[] };
export type TierBoardRow = { id: string; label: string; color: string; partners: number[] };
export type RecommendationSelection = { mode: RankingMode; period: RankingPeriod; size: number };
export type RecommendationCohort = { size: number; records: number; partners: PartnerRecord[]; teams: TeamRecord[] };
export type RecommendationBoard = Omit<LeaderboardBoard, "rows"> & { records: number; cohorts: RecommendationCohort[] };

export type EditorialPick = { id: number; name: string; tier: TierLabel; reason: string; watchFor: string; statLine: string };
