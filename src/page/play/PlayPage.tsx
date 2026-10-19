"use client";
import { useRef, useState } from "react";
import { PageSchema } from "@/seo/PageSchema";
import pages from "@/data/site/pages.json";
import { site } from "@/config/site";
import { CollectionPokemonArt } from "@/components/common/CollectionPokemonArt";
import s from "@/style/page/play.module.css";
export default function PlayPage() {
  const container = useRef<HTMLDivElement>(null);
  const [started, setStarted] = useState(false),
    [loaded, setLoaded] = useState(false),
    [message, setMessage] = useState("");
  async function fullscreen() {
    try {
      if (!document.fullscreenElement)
        await container.current?.requestFullscreen();
      else await document.exitFullscreen();
    } catch {
      setMessage(
        "Fullscreen is unavailable in this browser. You can open the official game in a new tab.",
      );
    }
  }
  return (
    <div ref={container} className={s.player}>
      <PageSchema path="/play" title={pages["/play"].heading} description={pages["/play"].intro} />
      <header>
        <a href="/">
          ←{" "}
          <span>
            PokeSurvivor
          </span>
        </a>
        <div>
          <a href={site.game} target="_blank" rel="noopener noreferrer">
            Official game ↗
          </a>
          <button onClick={fullscreen}>⛶ Fullscreen</button>
        </div>
      </header>
      <h1 className={s.title}>Play <em>PokeSurvivor</em> Online</h1>
      <main id="main" className={s.stage}>
        {started ? (
          <>
            <iframe
              title="Play PokeSurvivor — official browser game"
              src={site.game}
              allow="fullscreen; autoplay; gamepad"
              allowFullScreen
              onLoad={() => setLoaded(true)}
              referrerPolicy="strict-origin-when-cross-origin"
            />
            {!loaded && (
              <div className={s.loading}>Loading the official game…</div>
            )}
          </>
        ) : (
          <div className={s.launch}>
            <span aria-hidden="true"><CollectionPokemonArt id={25} name="Pikachu" size={120} /></span>
            <p>YOUR NEXT ADVENTURE STARTS HERE</p>
            <h2>Ready for your next run?</h2>
            <p>Move with WASD or arrow keys. Your selected move attacks automatically.</p>
            <button className="btn" onClick={() => setStarted(true)}>
              ▶ Launch Game
            </button>
            <small>
              Loads the official game from pokesurvivor.com.
              <br />
              Guest progress is not saved. Use the official game’s account
              options for cloud saves; this fan site never asks for your game
              password.
            </small>
            <details>
              <summary>Controls, aiming and saving</summary>
              <p>Keyboard: WASD or arrows to move, 1–4 or Q/E to switch moves, Esc to pause. On touch screens, use landscape, drag to move and tap a move. Controllers are configured in Settings → Controls.</p>
              <p>Attacks fire automatically. Optional Manual aim in Settings → Accessibility changes their direction using a mouse or right stick; it is off by default.</p>
              <p>Account progress is recorded locally before uploading. Automatic cloud uploads are scheduled after about 30 minutes with pending changes. Before leaving or changing devices, use Save at the top right and confirm the pending status clears. A recent upload can briefly delay the next one.</p>
            </details>
          </div>
        )}
      </main>
      <footer>
        <p>
          <b>MOVE</b> WASD / ↑ ← ↓ → <b>SWITCH</b> 1–4 / Q E <b>PAUSE</b> Esc{" "}
          <span>Mobile: landscape · drag to move</span>
        </p>
        <a href="/guides/beginner-guide">How to play →</a>
      </footer>
      {started && (
        <div className={s.fallback}>
          Before leaving, use Save inside the game and check its status.{" "}
          If the game stays blank or sign-in does not work,{" "}
          <a href={site.game} target="_blank" rel="noopener noreferrer">
            open the official game in a new tab ↗
          </a>
          . The game is hosted by its creator.
        </div>
      )}
      {message && (
        <p role="status" className={s.fallback}>
          {message}
        </p>
      )}
    </div>
  );
}
