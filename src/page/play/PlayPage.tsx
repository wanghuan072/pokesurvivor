import { PageSchema } from "@/seo/PageSchema";
import pages from "@/data/site/pages.json";
import { site } from "@/config/site";
import { CollectionPokemonArt } from "@/components/common/CollectionPokemonArt";
import s from "@/style/page/play.module.css";

export default function PlayPage() {
  return (
    <div className={s.player}>
      <PageSchema path="/play" title={pages["/play"].heading} description={pages["/play"].intro} />
      <header>
        <a href="/">← <span>PokeSurvivor</span></a>
        <a href={site.game} target="_blank" rel="noopener noreferrer">Official game ↗</a>
      </header>
      <h1 className={s.title}>Play <em>PokeSurvivor</em> Online</h1>
      <main id="main" className={s.stage}>
        <div className={s.launch}>
          <span aria-hidden="true"><CollectionPokemonArt id={25} name="Pikachu" size={120} /></span>
          <p>YOUR NEXT ADVENTURE STARTS HERE</p>
          <h2>Ready for your next run?</h2>
          <p>Open Poke Survivor on its official website. Move with WASD or arrow keys; your selected move attacks automatically.</p>
          <a className="btn" href={site.game} target="_blank" rel="noopener noreferrer">▶ Play on the official site ↗</a>
          <small>
            Opens pokesurvivor.com in a new tab. The game now runs only on its official website.
            <br />
            Guest progress is not saved. Use the official game’s account options for cloud saves;
            this fan site never asks for your game password.
          </small>
          <details>
            <summary>Controls, aiming and saving</summary>
            <p>Keyboard: WASD or arrows to move, 1–4 or Q/E to switch moves, Esc to pause. On touch screens, use landscape, drag to move and tap a move. Controllers are configured in Settings → Controls.</p>
            <p>Touch controls can be repositioned in Settings → Controls → Place the buttons; a fixed joystick is optional. This can improve the layout but does not guarantee a fix for every touch-input problem.</p>
            <p>Attacks fire automatically. On desktop, optional Manual aim in Settings → Accessibility uses a mouse or right stick; it is off by default. Touch devices always aim automatically.</p>
            <p>Account progress is recorded in this browser immediately. Cloud uploads require Save at the top right; there is no timed automatic upload. Press Save and wait for confirmation before closing, clearing browser data or changing devices. A recent upload can delay the next one by up to about 65 seconds.</p>
            <p>For an official offline download, use the creator’s <a href="https://jpter78.itch.io/pokesurvivor">itch.io page</a>. That copy is solo only with browser-local saving; co-op, cloud saves and leaderboards use the official online game.</p>
          </details>
        </div>
      </main>
      <footer>
        <p><b>MOVE</b> WASD / ↑ ← ↓ → <b>SWITCH</b> 1–4 / Q E <b>PAUSE</b> Esc <span>Mobile: landscape · drag to move</span></p>
        <a href="/guides/beginner-guide">How to play →</a>
      </footer>
      <div className={s.fallback}>Before leaving the game, use Save and check its status. Accounts, multiplayer and cloud saves are managed on pokesurvivor.com.</div>
    </div>
  );
}
