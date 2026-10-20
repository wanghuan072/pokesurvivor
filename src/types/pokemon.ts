export type Pokemon = {
  id: number;
  hasDetailPage: boolean;
  detail?: {
    intro: string;
    tips: string[];
    strategy?: {
      strength: { headline: string; verdict: string; tradeoff: string };
      moves: { id: string; role: string; reason: string }[];
      order: string[];
      fallback: string;
      teammates: { id: number; moveId: string; reason: string }[];
      teamPlan: string;
      techniques: { title: string; text: string }[];
    };
    seo: { title: string; description: string; targetKeywords: string[] };
  };
  slug: string;
  name: string;
  region: string;
  types: string[];
  starter: boolean;
  legendary: boolean;
  hp: number;
  speed: number;
  attack: number;
  physicalAttack: number;
  specialAttack: number;
  defense: number;
  specialDefense: number;
  baseStatTotal: number;
  rarity: number;
  generation: number;
  startMove: string;
  learnset: string[];
  cardPool: string[];
};

export type MovePartner = Pick<Pokemon, "id" | "name" | "types" | "startMove" | "cardPool" | "learnset" | "attack" | "physicalAttack" | "specialAttack">;
export type PokemonSummary = Pick<
  Pokemon,
  | "hasDetailPage"
  | "id"
  | "slug"
  | "name"
  | "region"
  | "types"
  | "starter"
  | "legendary"
  | "hp"
  | "speed"
  | "attack"
  | "physicalAttack"
  | "specialAttack"
  | "defense"
  | "specialDefense"
  | "rarity"
> & { hasShiny: boolean; hovering: boolean };
