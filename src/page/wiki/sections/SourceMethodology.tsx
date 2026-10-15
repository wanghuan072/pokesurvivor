import { snapshot } from "@/lib/data/wiki";
import { SourceNote } from "@/components/common/SourceNote";
export default function SourceMethodology() {
  return (
    <>
      <h2>Which version do these numbers describe?</h2>
      <p>
        The numeric reference is pinned to game build{" "}
        <strong>{snapshot.build}</strong>, source commit{" "}
        <code>{snapshot.revision.slice(0, 12)}</code>, reviewed{" "}
        {snapshot.reviewed}. Import scripts read literal data using a syntax
        parser; downloaded game code is not executed.
      </p>
      <h2>Resolve sources in this order</h2>
      <ol>
        <li>
          Use the pinned data definitions and implemented rule for exact values
          in this snapshot.
        </li>
        <li>
          Cross-check the official dedicated reference pages and dated
          changelog.
        </li>
        <li>
          Use the general guide for an introduction; it can lag newer dedicated
          pages.
        </li>
        <li>
          Use independent wikis and community discussions to identify questions,
          then verify numeric claims before publishing.
        </li>
      </ol>
      <h2>Known differences and corrections</h2>
      <ul>
        <li>
          The general guide still says 127 achievements; the dedicated page and
          this build contain 130 after the three Judgment additions.
        </li>
        <li>
          Gacha pity checks the incremented counter: from 69, the next pull is
          5★. “70 failures, then the next pull” is an off-by-one description.
        </li>
        <li>
          A Rift victory is not an unconditional ×10-ticket promise. Some
          third-party summaries disagree.
        </li>
        <li>
          Current shiny rerouting normally converts an exhausted shiny pool to
          normal results; the old triple-refund description does not fully
          explain that path.
        </li>
        <li>
          Raw move IDs <code>leaf-storm</code> and <code>giga-drain</code>{" "}
          display as Petal Blizzard and Grass Knot in English. Page URLs use
          display-name slugs; move-pool checks use source IDs.
        </li>
      </ul>
      <p>
        Base-stat rankings are derived comparisons. Build priorities and
        survival advice are editorial, with compatibility checked against the
        data. We have not labeled suggestions as measured DPS results.
      </p>
      <SourceNote
        files={[
          "version.json",
          "js/data/pokedex.js",
          "js/data/moves.js",
          "js/systems/gacha.js",
          "js/data/achievements.js",
        ]}
      />
    </>
  );
}
