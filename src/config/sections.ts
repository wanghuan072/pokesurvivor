import pages from "@/data/site/pages.json";
export const sections = {
  "achievements": { title: pages["/achievements"].heading, description: pages["/achievements"].intro },
  "tier-list": { title: pages["/tier-list"].heading, description: pages["/tier-list"].intro },
  "rankings": { title: pages["/rankings"].heading, description: pages["/rankings"].intro },
  "types": { title: pages["/types"].heading, description: pages["/types"].intro },
  "gacha": { title: pages["/gacha"].heading, description: pages["/gacha"].intro },
  "updates": { title: pages["/updates"].heading, description: pages["/updates"].intro },
} as const;
export type Section = keyof typeof sections;
