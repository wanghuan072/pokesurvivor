import { pokemon } from "@/lib/data/pokemon";
import TierMaker from "@/page/tier-list/TierMaker";
export default function TierList() {
  return <>
    <p className="notice">Build your own PokeSurvivor tier list. Drag a partner into a tier, or select a Pokémon and choose a row. Rename tiers, change their colors and save your board as an image. Your choices stay in this browser.</p>
    <TierMaker partners={pokemon.map(({id,name,types,region})=>({id,name,types,region}))} />
    <div className="notice">This board records your choices; it is not an official rating. Compare a partner’s move pool, ease of positioning and the upgrades you use. <a href="/rankings">Compare base stats in Partner Rankings →</a></div>
  </>;
}
