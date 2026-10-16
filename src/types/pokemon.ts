export type Pokemon = {
  id: number;
  hasDetailPage: boolean;
  slug: string;
  name: string;
  region: string;
  types: string[];
  starter: boolean;
  legendary: boolean;
  hp: number;
  speed: number;
  attack: number;
  baseStatTotal: number;
  rarity: number;
  generation: number;
  startMove: string;
  learnset: string[];
  cardPool: string[];
};

export type MovePartner = Pick<Pokemon, "id" | "name" | "types" | "startMove" | "cardPool" | "learnset">;
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
  | "rarity"
> & { hasShiny: boolean; hovering: boolean };
