import snapshot from "@/data/game/leaderboards.json";
import pokemon from "@/data/pokedex/pokemon.json";
import SurvivalRankings from "./SurvivalRankings";
const ids = new Set(snapshot.boards.flatMap(board => board.rows.flatMap(row => row.pokemon.map(p => p.id))));
export default function RankingsContent() {
  return <SurvivalRankings boards={snapshot.boards} partners={pokemon.filter(p => ids.has(p.id)).map(({id, name}) => ({id, name}))} />;
}
