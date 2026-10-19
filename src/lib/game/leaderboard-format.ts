import type { LeaderboardBoard } from "@/types/leaderboard";

export const rankingPeriods = ["daily", "weekly", "monthly", "all-time"] as const;
export const periodNames = { daily: "Daily", weekly: "Weekly", monthly: "Monthly", "all-time": "All-time" };
export function survivalTime(seconds: number) {
  const whole = Math.floor(seconds), minutes = Math.floor(whole / 60), remaining = String(whole % 60).padStart(2, "0");
  return minutes >= 60 ? `${Math.floor(minutes / 60)}:${String(minutes % 60).padStart(2, "0")}:${remaining}` : `${minutes}:${remaining}`;
}
export function periodLabel(board: Pick<LeaderboardBoard, "key">) {
  const day = board.key.match(/_d(\d{4})(\d{2})(\d{2})/);
  if (day) return `${day[1]}-${day[2]}-${day[3]}`;
  const week = board.key.match(/_w(\d{4})-(\d+)/);
  if (week) return `Week ${week[2]}, ${week[1]}`;
  const month = board.key.match(/_m(\d{4})(\d{2})/);
  if (month) return `${month[1]}-${month[2]}`;
  return "All-time · post-reset board";
}
