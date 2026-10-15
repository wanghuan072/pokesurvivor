import Image from "next/image";
import { PageHeader } from "@/components/common/PageHeader";
import { guides } from "@/lib/data/guides";
import { pageMetadata } from "@/seo/metadata";
import s from "@/style/page/guides.module.css";
import c from "@/style/common/content.module.css";
export const metadata = pageMetadata("/guides");
export default function GuidesPage() {
  return (
    <div className={c.wrap}>
      <PageHeader
        title="A Better Run Starts Here"
        description="Three field guides for the decisions that matter: staying alive, building your loadout and growing your collection."
        path="/guides"
        category="THE PLAYER’S FIELD GUIDE"
      />
      <div className={s.intro}>
        <h2>Pick your next chapter.</h2>
        <span>03 GUIDES · ONE ADVENTURE</span>
      </div>
      <div className={s.grid}>
        {guides.map((g, index) => (
          <a href={`/guides/${g.slug}`} key={g.slug} className={s.card}>
            <div className={s.cover}>
              <Image
                src={g.image}
                alt={g.imageAlt}
                fill
                sizes="(max-width: 1024px) 90vw, 30vw"
              />
              <span className={s.number}>FIELD GUIDE 0{index + 1}</span>
              <span className={s.duration}>{g.readTime} MIN READ</span>
            </div>
            <div className={s.body}>
              <small className={s.category}>{g.category}</small>
              <h2>{g.cardTitle}</h2>
              <p>{g.description}</p>
              <ul className={s.outcomes}>
                {g.outcomes.map((outcome) => (
                  <li key={outcome}>{outcome}</li>
                ))}
              </ul>
              <footer>
                <span>Read the field guide</span>
                <span>→</span>
              </footer>
            </div>
          </a>
        ))}
      </div>
      <div className={s.help}>
        <span>
          Choose a guide for the next decision you need to make. Move choices and
          run conditions can change the best plan.
        </span>
        <a href="/sources">How these guides are checked →</a>
      </div>
    </div>
  );
}
