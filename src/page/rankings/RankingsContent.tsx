import { pokemon } from "@/lib/data/pokemon";
import PartnerRankings from "@/page/wiki/sections/PartnerRankings";
export default function RankingsContent() {
  return <>
    <p className="notice">Compare base attack factor, HP or movement speed across the full roster. These are starting stats, not recorded run results or an overall power score. Move pools, upgrades and positioning change how a partner performs.</p>
    <PartnerRankings partners={pokemon.map(({id,name,hp,speed,attack,rarity,starter,types}) => ({id,name,hp,speed,attack,rarity,starter,types}))} />
    <div className="notice">Attack multiplies move damage; HP gives more room for mistakes; speed helps you reposition. Equal values share a rank. <a href="/tier-list">Make your own tier list →</a></div>
  </>;
}
