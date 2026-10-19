import Image from "next/image";
import home from "@/data/site/home.json";
import { CollectionPokemonArt } from "@/components/common/CollectionPokemonArt";
import s from "@/style/page/home.module.css";

export default function FeaturedContent() {
  return (
    <section aria-labelledby="guides-title">
      <div className={s.sectionHead}>
        <span className={s.sectionNumber} aria-hidden="true">02</span>
        <h2 id="guides-title">Guides for your next run</h2>
        <span className={s.headingRule} />
        <a href="/guides">All guides →</a>
      </div>
      <div className={s.featured}>
        {home.guides.map((guide, index) => (
          <a href={`/guides/${guide.slug}`} key={guide.slug} className={`${s.story} ${index === 0 ? s.leadStory : ""} ${index === 2 ? s.shinyStory : ""}`}>
            <div className={s.storyImage}>
              {guide.image ? (
                <Image src={guide.image} alt={guide.imageAlt ?? ""} fill sizes={index === 0 ? "(max-width: 768px) 100vw, 50vw" : "(max-width: 768px) 35vw, 220px"} />
              ) : (
                <div className={s.shinyPair}>
                  <CollectionPokemonArt id={133} name="Eevee" size={88} />
                  <CollectionPokemonArt id={133} name="Eevee" shiny size={88} />
                </div>
              )}
            </div>
            <div className={s.storyCopy}>
              <span className={s.category}>{guide.category}</span>
              <h3>{guide.title}</h3>
              <p>{guide.description}</p>
              <span className={index === 0 ? s.outlineLink : s.readLink}>Read the guide →</span>
            </div>
          </a>
        ))}
      </div>
    </section>
  );
}
