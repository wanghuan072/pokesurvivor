import Image from "next/image";
import s from "@/style/page/home.module.css";
export default function PlayPreview() {
  return (
    <section className={s.playPanel}>
      <div className={s.playHeading}>
        <h2>
          <span>🎮</span> Play PokeSurvivor Online
        </h2>
        <p>
          A Pokémon-inspired survival roguelike <i>•</i> Free to play <i>•</i>{" "}
          Play in your browser
        </p>
      </div>
      <div className={s.playBody}>
        <a href="/play" className={s.battle}>
          <Image
            src="/art/battle.webp"
            alt="Illustrated preview of a Pokémon survival battlefield"
            fill
            sizes="(max-width: 768px) 90vw, 45vw"
          />
          <span className={s.previewBadge}>◓ &nbsp; A WORLD OF ADVENTURE</span>
          <span className={s.battlePlay}>
            ▶<small>Start your adventure</small>
          </span>
        </a>
        <div className={s.playCopy}>
          <h3>Move, collect experience and evolve.</h3>
          <p>
            Choose your partner and face the horde. Collect experience, upgrade
            your active move, and keep a route open as the horde grows.
          </p>
          <div className={s.features}>
            <span>
              <b>ϟ</b>
              <span>
                <strong>Free to Play</strong>
                <small>No download required</small>
              </span>
            </span>
            <span>
              <b>▣</b>
              <span>
                <strong>Play in Browser</strong>
                <small>Desktop & mobile</small>
              </span>
            </span>
            <span>
              <b>♟</b>
              <span>
                <strong>Team Up</strong>
                <small>Up to 4 players</small>
              </span>
            </span>
          </div>
          <a className="btn" href="/play">
            🎮 &nbsp;Play Now <span>→</span>
          </a>
        </div>
        <div className={s.friends}>
          <Image
            src="/art/friends.webp"
            alt="Pixel art Charmander, Squirtle and Bulbasaur gathered in a forest"
            fill
            sizes="20vw"
          />
        </div>
      </div>
    </section>
  );
}
