import pages from "@/data/site/pages.json";
export const sections = {
  "achievements": { title: pages["/achievements"].heading, description: pages["/achievements"].intro },
  "tier-list": { title: pages["/tier-list"].heading, description: pages["/tier-list"].intro },
  "builds": { title: pages["/builds"].heading, description: pages["/builds"].intro },
  "types": { title: pages["/types"].heading, description: pages["/types"].intro },
  "gacha": { title: pages["/gacha"].heading, description: pages["/gacha"].intro },
  "updates": { title: pages["/updates"].heading, description: pages["/updates"].intro },
  "sources": { title: pages["/sources"].heading, description: pages["/sources"].intro },
} as const;
export type Section = keyof typeof sections;
