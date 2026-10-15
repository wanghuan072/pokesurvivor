import { snapshot } from "@/lib/data/wiki";
import s from "@/style/common/content.module.css";
export default function EditorialPolicy() {
  return <article className={`${s.article} prose`}>
    <h2>What gets checked</h2>
    <p>Game values and rules are checked against the developer’s game definitions and official explanations. That includes partner stats, move pools, evolution cards, type factors and gacha guarantees. A statement about a rule should be traceable to the version that implements it.</p>
    <p>A build plan is a different kind of claim. The listed moves are checked for compatibility, but an upgrade priority is a suggestion to try. This site does not present those suggestions as measured damage rankings or claim a record of play sessions that has not been documented.</p>
    <section id="version-notes">
      <h2>Which game version do these pages describe?</h2>
      <p>The main game details describe build <strong>{snapshot.build}</strong> from October 14, 2026. Wave, mission and world-event explanations also use an October 12 build where noted. A later live update can change a number or requirement.</p>
      <p>The older general game guide lists 127 achievements; the dedicated achievement page and the October 14 build contain 130. For gacha, a counter at 69 means the next pull reaches the 70-pull guarantee. These differences matter when choosing a goal or planning tickets.</p>
      <p>A 5-star guarantee does not select a species. An exhausted shiny pool may return a normal result rather than a triple duplicate refund. If your game shows something different, include its version when reporting it.</p>
    </section>
    <h2>Who writes and revises the guides?</h2>
    <p>Content is published under the PokeSurvivor.me site identity and maintained by the site maintainer. There is no claim of an official relationship, a professional testing team or individual expert credentials. Articles are written to explain a decision a player can make, not to repeat a list of search terms.</p>
    <h2>Corrections and update dates</h2>
    <p>Send a correction to <a href="mailto:support@pokesurvivor.me">support@pokesurvivor.me</a> with the page URL, the statement and the game version. A clear example or an official game link helps resolve a disagreement. Verified corrections are reflected in the affected explanation.</p>
    <p>Page dates change when the main content, relevant game data or search description changes. Rebuilding the site or changing the copyright year does not make every page newly updated. A revision date is not a claim that all gameplay was retested that day.</p>
    <h2>Official game pages</h2>
    <ul><li><a href="https://pokesurvivor.com/en/guide/">Controls and game help</a></li><li><a href="https://pokesurvivor.com/en/pokedex/">Partner roster</a></li><li><a href="https://pokesurvivor.com/en/moves/">Moves and evolution requirements</a></li><li><a href="https://pokesurvivor.com/en/types/">Game type chart</a></li><li><a href={snapshot.sourceBase + "version.json"}>The checked game version</a></li></ul>
    <section id="local-archive"><h2>Artwork and permissions</h2><p>Sprite artwork keeps its original credits and noncommercial license notice. Decorative scenes illustrate the site; they are not screenshots proving a gameplay result. See <a href="/legal/copyright">Copyright and Credits</a> for ownership, licenses and artist notices.</p></section>
  </article>;
}
