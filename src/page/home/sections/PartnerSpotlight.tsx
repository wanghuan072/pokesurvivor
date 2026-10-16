import home from "@/data/site/home.json";
import pokemon from "@/data/pokedex/pokemon.json";
import { CollectionPokemonArt } from "@/components/common/CollectionPokemonArt";
import s from "@/style/page/home.module.css";

const partners = home.partners.map((id) => pokemon.find((partner) => partner.id === id)!);

export default function PartnerSpotlight() {
  return (
    <section aria-labelledby="partners-title">
      <div className={s.sectionHead}>
        <span className={s.sectionNumber} aria-hidden="true">03</span>
        <h2 id="partners-title">A few familiar faces</h2>
        <span className={s.headingRule} />
        <a href="/pokedex">View all {pokemon.length} →</a>
      </div>
      <ul className={s.partners}>
        {partners.map((partner) => (
          <li key={partner.id}>
            <CollectionPokemonArt id={partner.id} name={partner.name} size={96} />
            <div className={s.typeTags}>{partner.types.map((type) => <span className="type" data-type={type} key={type}>{type}</span>)}</div>
            <h3>{partner.name}</h3>
          </li>
        ))}
      </ul>
    </section>
  );
}
