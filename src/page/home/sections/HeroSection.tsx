import pages from "@/data/site/pages.json";
import Image from "next/image";
import s from "@/style/page/home.module.css";
export default function HeroSection() {
  return (
    <div className={s.hero}>
      <Image
        className={s.heroArt}
        src="/art/hero.webp"
        alt="Pixel art Pokémon companions exploring a moonlit lake and castle"
        fill
        priority
        sizes="(max-width: 768px) 100vw, 75vw"
      />
      <div className={s.heroContent}>
        <p className={s.eyebrow}>
          PLAY <span>•</span> EXPLORE <span>•</span> LEARN <span>•</span>{" "}
          BUILD <span>•</span> SURVIVE
        </p>
        <h1>{pages["/"].heading}</h1>
        <p className={s.heroIntro}>{pages["/"].intro}</p>
        <div className={s.heroButtons}>
          <a href="/play" className="btn">
            <span className={s.playTriangle}>▶</span>
            <span>
              Play Now <b>→</b>
              <small>Jump into the game</small>
            </span>
          </a>
          <a href="/guides/beginner-guide" className="btn btn-secondary">
            <span className={s.book}>▥</span>
            <span>
              Beginner Guide<small>Start your adventure</small>
            </span>
          </a>
        </div>
      </div>
    </div>
  );
}
