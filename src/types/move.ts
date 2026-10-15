export type Move = {
  id: string;
  name: string;
  slug: string;
  type: string;
  kind: string;
  evolution: string | null;
  requirement: string | null;
  behavior: string;
  maxLevel: number;
  base: Record<string, number | undefined>;
  levels: (Record<string, number | undefined> & { level: number })[];
  evolutionModifiers: Record<string, number | undefined> | null;
};
