import { achievements, snapshot } from "@/lib/data/wiki";
import { SourceNote } from "@/components/common/SourceNote";
import { GameIcon } from "@/components/common/GameIcon";
import s from "@/style/common/content.module.css";

const categories = [...new Set(achievements.map(achievement => achievement.category))];
const categoryId = (category: string) => "achievement-" + category.toLowerCase().replace(/[^a-z0-9]+/g, "-");

export default function ReferenceContent() {
  return (
    <>
      <p className="notice">
        Choose among {snapshot.counts.achievements} achievement goals. Check whether a requirement
        applies to one run or your overall progress as you earn rewards in the game.
        The Judgment challenges reward survival; defeating an invulnerable Arceus is not the objective.
      </p>
      <nav className={s.chips} aria-label="Achievement categories">
        {categories.map(category => <a href={"#" + categoryId(category)} key={category}>
          {category} · {achievements.filter(achievement => achievement.category === category).length}
        </a>)}
      </nav>
      {categories.map(category => (
        <section key={category}>
          <h2 className={s.sectionTitle} id={categoryId(category)}>{category}</h2>
          <ul className={s.achievementList}>
            {achievements.filter(a => a.category === category).map(achievement => (
              <li key={achievement.id}>
                <article className={s.achievementCard}>
                  <GameIcon name={achievement.tier ? `medal${achievement.tier}` : "medalOff"} size={40} />
                  <div>
                    <h3>{achievement.name}</h3>
                    <p>{achievement.description}</p>
                    <div className={s.achievementReward}>
                      <span>{Object.entries(achievement.reward).map(([key, value]) =>
                        `${value} ${key === "t10" ? "×10 ticket" : key === "t1" ? "ticket" : "coins"}`
                      ).join(" · ")}</span>
                      <small>{["", "Bronze", "Silver", "Gold"][achievement.tier]}{achievement.title ? " · " + achievement.title : ""}</small>
                    </div>
                  </div>
                </article>
              </li>
            ))}
          </ul>
        </section>
      ))}
      <SourceNote files={["js/data/achievements.js", "js/data/pokedex.js"]} />
    </>
  );
}
