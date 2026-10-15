import { localRelease } from "@/lib/data/game";
import s from "@/style/common/content.module.css";
export default function LocalArchiveCredits() {
  return (
    <section id="local-archive">
      <h2>Local source archive & extracted artwork</h2>
      <p>
        The supplied archive identifies itself as build{" "}
        <strong>{localRelease.version.v}</strong>, dated{" "}
        {localRelease.version.at.slice(0, 10)}. It supplements the newer{" "}
        {localRelease.baseline} reference instead of replacing it. The roster
        and move definitions match the pinned reference byte for byte; new wave,
        mission and world-object sections are explicitly labeled with the
        archive build.
      </p>
      <p>
        966 normal sprite previews, 958 shiny previews and 140 action animations
        were extracted from the game’s SpriteCollab atlases. Every image is
        served locally. Move and UI icons were reconstructed from the source’s
        pixel grids. No supplied game JavaScript was executed during extraction.
      </p>
      <p>
        SpriteCollab artwork uses <strong>CC BY-NC 4.0</strong> (attribution and
        noncommercial use), as specified by the archive. Its full artist list is
        retained in{" "}
        <a href="/credits/spritecollab-artists.md">
          SpriteCollab artist credits
        </a>
        . The code and icon definitions are covered by the archive’s MIT terms;
        see the{" "}
        <a href="/credits/pokesurvivor-license.txt">original license notice</a>.
        Pokémon characters and names remain their owners’ property.
      </p>
      <details>
        <summary>Imported source files & SHA-256 fingerprints</summary>
        <div className={s.tableWrap}>
          <table className={s.table}>
            <thead>
              <tr>
                <th>FILE</th>
                <th>PINNED CACHE MATCH</th>
                <th>SHA-256</th>
              </tr>
            </thead>
            <tbody>
              {localRelease.files.map((f) => (
                <tr key={f.file}>
                  <td>{f.file}</td>
                  <td>
                    {f.matchesPinnedCache === null
                      ? "Not previously imported"
                      : f.matchesPinnedCache
                        ? "Identical"
                        : "Different archive"}
                  </td>
                  <td>
                    <code>{f.sha256}</code>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </details>
    </section>
  );
}
