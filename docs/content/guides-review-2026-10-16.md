# Guides factual review — 16 October 2026

Reviewed all four published Guides, their rendered data sections and the FAQ. Checked the supplied 12 October archive, the developer's official documentation and revision `5bbc3b29288d6af4596f21188fb8b54e0e9b739f` of [JPTER78/pokesurvivor](https://github.com/JPTER78/pokesurvivor/tree/5bbc3b29288d6af4596f21188fb8b54e0e9b739f).

The official deployment reported build `919c6711dd` (15 October 2026). Its `js/app.min.js` and the checked repository's bundle had the same SHA-256: `493436d45801803c44e8ddc480da1b554b80dc302f534ca1c7810c0436420d49`. No downloaded game code was executed. No game server, local preview, account login or gameplay session was started for this review.

## Results by article

| Article | Checks | Corrections or clarifications |
| --- | --- | --- |
| Beginner Guide | Controls, starting moves, active-group casting, run cards, enemy casts, boss times, world objects, Rift outcomes | Distinguished active casting from lingering effects; added Choice Band's switching restriction; clarified failed Rifts return to the map and ordinary legendary wins do not grant the normal partner. |
| Cards, Evolutions and Bonds | 64 moves, 59 recipes, all prerequisite IDs, nine stat cards and caps, buff limit, rerolls, Ban, Repertoire, fusion | Explained that one Bond starts a two-move group or extends an unfinished group, rather than instantly fusing four; clarified the six-reroll maximum and absence of boss-earned rerolls. |
| Tickets, Gacha and Missions | Rarity weights, regional pools, exact pity boundary, ten-pull floor, duplicate branches, chest rewards, all 16 mission templates, Madrid calendar periods | Distinguished automatic achievement rewards from manually claimed mission rewards; added Rift shinies as a separate acquisition context. |
| How to Get Shiny Pokémon | Eligibility, ordinary and boss spawns, Rift selection, defeat reward, gacha redirection, theoretical odds, account commit, selector and co-op broadcast | Fixed the omitted 1/512 Rift route; expanded the comparison table, probability table, FAQ, cover and practical route advice. Retained the distinction between a successful shiny roll, a new shiny and a particular target. |
| FAQ | All 12 answers, including control keys, save mode, co-op limit, evolutions, rarity guarantees and Judgment | Added the timed-effect and Choice Band qualifications; explained that Judgment waits for an active Rift/card choice and new Rifts stop at 28:00. |

## Evidence map

Paths below are relative to the pinned developer repository.

| Claim | Evidence |
| --- | --- |
| Only the active group casts; timed buffs can persist | `js/systems/combat.js` (`tickMove` loop), `js/entities/player.js` (`activeGroup`, `setActive`, buff timers) |
| Evolution requires maximum move level and a run prerequisite; first ready evolution gets an offer | `js/data/moves.js` (`EVO`, `evoInfo`), `js/systems/levelup.js` (`candidates`, `offer`) |
| Per-run rerolls are one plus purchased extras, up to six | `js/ui/run-ui.js` (`rerollsLeft`), `js/data/upgrades.js` (`reroll.max`) |
| Bonds consume learned loose moves and cap a group at four | `js/entities/player.js` (`bondOptions`, `fuse`, `BOND_MAX`), `js/systems/rift.js` (`won`) |
| Normal wild casts: six tiers, seven species each; five scheduled map bosses | `js/data/enemies.js` (`TIERS`, `BOSS_SLOTS`, cast construction), `js/systems/spawner.js` |
| Locked chest takes 3.5 seconds; drops 1–3 singles, with separate extra ticket/item rolls | `js/systems/interact.js` (`CHEST_TIME`, update), `js/world/world.js` (`bigchest` reward branch) |
| Gacha: 45/30/17/6.5/1.5 percent, 70th forced five-star, last-result batch floor | `js/systems/gacha.js` (`RATES`, `PITY_5`, `pull`) |
| Existing shiny redirects within pool/rarity or becomes normal | `js/systems/gacha.js`, owned-shiny branch before the refund branch |
| Three daily and two weekly assignments from 10/6 templates; claims and automatic achievement grants differ | `js/data/missions.js`, `js/systems/progress.js` (`ensure`, `claim`, `checkAch`), `js/net/ranking.js` (`TZ`) |
| Wild 1/4096, Rift 1/512, gacha 1/100, all requiring shiny artwork | `js/systems/spawner.js` (`rollShiny`), `js/systems/rift.js` (`start`), `js/systems/gacha.js` (`pull`) |
| A Rift shiny must be defeated to unlock; normal legendary victory records are separate | `js/systems/rift.js` (`spawnLegend`, `won`), `js/entities/enemy.js` (`die`), `js/game.js` (`onShinyCaught`), `js/systems/progress.js` (`kill`) |
| A shiny grants the normal form too; duplicate enemy shiny gives 300 run coins | `js/core/db.js` (`grantShiny`), `js/game.js` (`onShinyCaught`) |
| Guest commits do nothing; account sync is asynchronous | `js/core/db.js` (`playAsGuest`, `commit`, `schedulePush`) |
| Co-op capture is broadcast; no live delivery guarantee was tested | `js/net/coop.js` (`shinyCaught`, `sh` event), `js/game.js` (`shiny`, `onShinyCaught`) |
| Judgment starts at 30 minutes; new Rift checks stop at 28 minutes | `js/systems/judgment.js` (`AT`, `update`), `js/systems/rift.js` (`update`) |

The first Rift opening check is after the 75-second eligibility threshold plus a 30-second eligible countdown (approximately 1:45). A living boss can delay it. The extracted `firstPossibleSeconds` field previously held only the threshold; the extractor and stored value were corrected to distinguish those quantities. A successful random opening attempt still needs a valid placement position.

## Limits and conflicting documentation

- [Official controls and general help](https://pokesurvivor.com/en/guide/), [move catalog](https://pokesurvivor.com/en/moves/), [shiny overview](https://pokesurvivor.com/en/shinies/) and [news](https://pokesurvivor.com/en/news/) were consulted. Web search also found independent editions and fan guides; those were not treated as authority for the official game's implementation.
- The official shiny overview says duplicate shinies give triple coins. The inspected gacha control flow redirects an owned shiny or falls back to normal before that branch. Do not promise the overview's payout. Rift shinies also have a distinct rate not detailed in that overview.
- Some code comments are stale: the comment above `rerollsLeft` still mentions bosses, while the function uses purchased bonuses. Checked behavior means the implemented branch, not the comment alone.
- Probability tables model independent eligible checks; they do not measure farming speed or guarantee an unlock. Strategy paragraphs are suggestions, not measured best builds or documented play records.
- Matching build identifiers and bundle hashes establish what files were inspected, not that account synchronization, multiplayer delivery or every runtime edge case works without bugs. This review does not promise permanent accuracy after future updates.

## Repeatable checks

`npm run audit:guides` compares the site's numerical data with the recorded review facts in `src/data/guides/review.json`. To review a newly downloaded, pinned developer snapshot, run `node scripts/audit/guide-content.mjs <reference-directory>` with the same flattened file naming used by this review; it reads JavaScript declarations and checks critical branches without importing or executing the game. Re-run human review whenever those branches or the game version change.
