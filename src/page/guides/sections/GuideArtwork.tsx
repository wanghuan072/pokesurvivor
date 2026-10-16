import { CollectionPokemonArt } from "@/components/common/CollectionPokemonArt";
import { GameIcon } from "@/components/common/GameIcon";
import s from "@/style/page/guides.module.css";

export default function GuideArtwork({ slug }: { slug: string }) {
  if (slug !== "beginner-guide" && slug !== "gacha-and-tickets") return null;
  const partners = slug === "beginner-guide"
    ? [{ id: 1, name: "Bulbasaur" }, { id: 4, name: "Charmander" }, { id: 7, name: "Squirtle" }]
    : [{ id: 25, name: "Pikachu" }, { id: 133, name: "Eevee" }, { id: 94, name: "Gengar" }];
  return <div className={s.originalArt} aria-hidden="true">
    {partners.map(partner => <CollectionPokemonArt {...partner} size={120} key={partner.id} />)}
    {slug === "gacha-and-tickets" && <GameIcon name="ticket10" size={48} />}
  </div>;
}
