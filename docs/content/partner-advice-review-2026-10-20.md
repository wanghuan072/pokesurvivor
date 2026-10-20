# Partner advice review — October 20, 2026

Scope: the 16 published Pokédex profiles, #001–#016. Read-only official freshness check matched live build `ae1820f65b` and repository revision `018e986f4c12f414dfa84193ee35b2959b1e325c`. The bundle hash matched the existing reviewed snapshot. No gameplay benchmarks were performed.

## Mechanism checks

- [Move definitions](https://github.com/JPTER78/pokesurvivor/blob/018e986f4c12f414dfa84193ee35b2959b1e325c/js/data/moves.js): all 48 suggested moves belong to their partner pools; 32 suggested teammates can learn the move mentioned. Water Gun evolves to Scald. Physical and special buffs are separate; Aqua Ring is a Water regeneration buff. Move names alone do not establish a drain effect.
- [Combat implementation](https://github.com/JPTER78/pokesurvivor/blob/018e986f4c12f414dfa84193ee35b2959b1e325c/js/systems/combat.js): only the active group continues casting. Projectiles and placed fields have their own lifetimes; switching does not immediately erase them. Auto-targeting advice needs an automatic-aim qualifier. Supported attacks can be manually aimed.
- [Player implementation](https://github.com/JPTER78/pokesurvivor/blob/018e986f4c12f414dfa84193ee35b2959b1e325c/js/entities/player.js): each buff cast adds a stack, refreshes its duration, and applies to that player. Stacks expire on a timer after switching. The single-type damage multiplier is 1.2 on matching damaging moves, not on buffs or dual-type partners.
- [Co-op implementation](https://github.com/JPTER78/pokesurvivor/blob/018e986f4c12f414dfa84193ee35b2959b1e325c/js/net/coop.js): players manage their own attacks. No party healing or tank/aggro ability is inferred from species names.

## Player reports and their limits

[A direct player discussion](https://www.reddit.com/r/pokesurvivor/comments/1x40y7j/how_important_is_the_pokemon_you_choose_best_ones/) contains positive opinions on Water/Aqua Ring, Gengar and Mewtwo. It does not establish optimal builds or teammates for every Kanto partner. [A balance discussion](https://www.reddit.com/r/pokesurvivor/comments/1x59l9k/issues_with_game_balance/) illustrates that a player's damage experience does not establish survival strength; older physical-buff suggestions must be checked against the category split.

No sufficiently specific first-hand evidence was found to call the 16 profile plans optimal, or to grade all 16 by community consensus. The named Kanto pairings remain editorial suggestions based on legal move patterns. The only displayed letter grades are the existing site grades for Venusaur and Charizard. These are not official or consensus grades.

Leaderboard evidence uses the saved Weekly Solo and Group boards separately, with their actual capture dates and record counts. The same appearance across periods is not counted as an independent run. Saved records predate the expanded move pool and do not prove a current-patch loadout.

## Corrections made

- Distinguished continued casting from persisting traps, projectiles and temporary buffs.
- Clarified String Shot placement and buff stacking.
- Qualified Ember's nearest-target advice as automatic aiming.
- Labelled teammate choices as Kanto examples rather than an all-roster best-team claim.

Secondary fan pages were used to locate claims, not as independent proof. Some still describe older move counts or incorrectly call Aqua Ring a shared Normal card or damaging move. Those claims were not adopted.
