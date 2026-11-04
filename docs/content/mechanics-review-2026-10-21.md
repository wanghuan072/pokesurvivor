# 2026-10-21 current-content corrections

The checked live game is `d2dfaee739`, matching repository commit `3c9641c9e782cf74afbde490f39cd60adf59e32b`. Its complete live bundle has SHA-256 `382a49c1714d744f7804d8a34baed1d0fb29fec47171a07fbb1e7a6a5a4145dc`; its Git blob identity matches that commit. `src/data/guides/review.json` records inspected source hashes and facts. Unchanged source files were verified against the previous recorded review; updated files were read from the pinned commit.

This is static source and literal-data verification. No game sessions, account recovery, cloud saves, TURN eligibility or multiplayer connectivity were tested. The user did not authorize starting a project server; no service was started or restarted. Browser navigation and mobile layout checks therefore remain unperformed for this change.

## Corrections

| Area | Current behavior and project change | Pinned source |
| --- | --- | --- |
| Cloud saving | Local changes remain immediate. No periodic cloud-upload timer. Use Save and confirm success before leaving or changing devices; 65-second upload spacing can queue the request. Update/sign-out flushes are attempts, not a recovery promise. Avoid simultaneous progress on two devices. | `js/core/db.js` |
| Projectiles | Apply `count ?? 1` and `spread ?? 0.12` before modifiers for projectile/homing/bounce kinds. Six homing moves now have counts 1/2/2/2/3 across levels 1–5; six bouncing moves gain their second projectile at level 5. Their added-shot spread is 0.156. | `js/data/moves.js` |
| Co-op | Limited authenticated TURN rollout, with direct STUN fallback. Guest vortex attraction and Hex state damage fixed; level choices reopen after premature closure. Friends have no online indicator; invitations expire after three minutes. | `js/net/net.js`, `js/systems/combat.js`, `js/net/coop.js`, `js/net/social.js` |
| Touch aiming | Touch devices always auto-aim. Desktop manual aim remains optional. Button layout and fixed joystick instructions are available in current help, without promising to fix every input report. | `js/entities/player.js`, `js/ui/settings-ui.js` |
| Rankings | Pokémon-specific boards require at least 300 seconds; other boards require at least 120 seconds. Original snapshot capture dates remain unchanged. | `js/net/ranking.js` |
| Permanent upgrades | Fourteen upgrades cost 40,400 coins in total when all levels are purchased for one partner. The guide renders level prices from the existing imported data using the official rounding formula. | `js/data/upgrades.js` |

The projectile fix was released separately even though the community PR remained open. Current behavior is determined by the deployed code, not PR status. Evolution requirements, tier grades, leaderboard records and the number of published profiles were not changed on the basis of the fix.

## Maintenance

- `scripts/data/move-defaults.mjs` supplies explicit defaults to the literal importer without executing downloaded game code. Re-importing only `RAW` would otherwise preserve the bug in generated values.
- `scripts/audit/current-content.test.mjs` covers defaults, all twelve repaired progressions, explicit-value preservation and current save/cost facts.
- SEO content inputs include the permanent upgrade dataset only for the guide displaying the price table. The selective-date regression verifies that a price change updates that guide.
- Historical dated change entries are retained, with the former timed-upload rule explicitly marked as superseded. Current help does not repeat it as current behavior.
- The cost table is a Server Component, uses existing styles and native disclosure, has captions/headers and keyboard-focusable scroll regions. No new route or browser-side data fetch was added.

Build, TypeScript, ESLint, the full audit (41 regression tests, zero failures) and the content-fingerprint check passed. The audit checked 37 built pages, 2,185 internal links/anchors and 140 search entries. Generated projectile values also match the independently calculated patrol comparison. Detailed scope is recorded in `docs/verification.md`. No remote repository state or deployment was modified.
