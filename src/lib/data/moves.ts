import data from "@/data/moves/moves.json";
import type { Move } from "@/types/move";
export const moves: Move[] = data;
export const getMove = (slug: string) => moves.find((m) => m.slug === slug);
export const getMoveById = (id: string) => moves.find((m) => m.id === id);
