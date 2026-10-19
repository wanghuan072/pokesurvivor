# Mechanics and content review — 19 October 2026

- Official repository revision: `e4ba0e173cb7e415f9815c924a48c5c25f516962`.
- Live build: `7c1976458d`; repository and live bundle SHA-256 matched before import.
- Evidence: `src/data/guides/review.json` records the inspected file hashes and literal-data comparisons. Downloaded game code was not executed.
- This was static code/documentation review, not a gameplay, cloud-save or multiplayer session. Browser QA uses this site's built files with requests intercepted; it does not start a server or launch the official game.

## Changes verified

The roster remains 966; previous HP, movement speed, maximum attack factor and rarity values are unchanged. Physical/special attack factors and defenses are now included. The 65 move definitions include Nasty Plot; 59 moves evolve and six are buffs. All partner card pools were regenerated from Normal plus species types, preserving starting exceptions.

Physical/special categories follow `PHYSICAL` in `js/data/moves.js`; support buffs do not deal direct damage. Attack fit and softened defense follow `js/systems/stats.js`. The preferred-side weight applies to the initial sample of up to six new moves, not the final three-card probability.

Saving instructions follow `PUSH_EVERY`, `MIN_GAP` and `saveNow()` in `js/core/db.js`: local recording is separate from cloud upload, pending changes schedule an upload after about 30 minutes, and manual Save can wait for the minimum upload interval. The changelog's 10-minute text is superseded by this executable logic; the 19 October entry is explicitly a verified behavior note.

Judgment still starts at minute 30. Speed above 130 contributes at 25%; contact damage increases after seven minutes of the encounter and reaches full HP after ten. This is not a hard 40-minute end timer. Shiny acquisition rates, pity boundaries, evolution prerequisites, stat-card caps and mission templates were rechecked and retained.

Existing animated artwork and historical archive attribution remain intact. The new Normal/Buff move uses the same original type/family emblem as other Normal buffs. Current game license notices are retained separately from the historical MIT archive notice.

## Maintenance

Run `npm run data:check-official` explicitly to compare the live version and bundle with this review. It reports drift without modifying content, runs no game code, and is not called during builds. A successful local data audit means consistency with the reviewed version; it is not a promise that the game will never change.

Page update dates remain driven by actual content inputs; changing a CSS rule or rebuilding does not mark gameplay facts newly checked. No removed routes or game detail pages were restored. No deployment or IndexNow submission is part of this local review.
