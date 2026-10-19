import data from "@/data/moves/moves.json";
import type { Move } from "@/types/move";
export const moves: Move[] = data.map(move=>{
  if(!['physical','special','buff'].includes(move.category))throw new Error(`Unknown move category: ${move.id}`);
  return {...move,category:move.category as Move['category']};
});
export const getMove = (slug: string) => moves.find((m) => m.slug === slug);
export const getMoveById = (id: string) => moves.find((m) => m.id === id);
