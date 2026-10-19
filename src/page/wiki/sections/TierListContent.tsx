import { pokemon } from "@/lib/data/pokemon";
import TierMaker from "@/page/tier-list/TierMaker";
export default function TierList() {
  return <>
    <p className="notice">Build your own PokeSurvivor tier list. Drag a partner into a tier, or select a Pokémon and choose a row. Rename tiers, change their colors and save your board as an image. Your choices stay in this browser.</p>
    <TierMaker partners={pokemon.map(({id,name,types,region})=>({id,name,types,region}))} />
    <div className="notice">Rank partners for a consistent goal: early survival, reaching Judgment or a particular upgrade setup. Compare their move categories, range and ease of positioning under the same conditions. Your board is personal, not an official strength rating. <a href="/level-up">Compare partner move cards →</a> · <a href="/rankings">View saved survival records →</a></div>
  </>;
}
