# Tier recommendations review — 19 October 2026

## Scope and judgement

All 73 distinct species in the eight saved leaderboard snapshots now have an explicit editorial S/A/B/C grade. These are recommendations for general Solo progression at comparable permanent upgrades, rather than measured win rates, maximum-damage rankings or claimed personal playtests. The selected population is already biased toward species appearing on leaderboards. Consequently A is a large group: S 5, A 39, B 26, C 3. These proportions must not be presented as the distribution of the entire 966-partner roster.

S prioritizes coherent openings, usable damage routes and sufficient movement or bulk. A includes strong alternatives with a meaningful defensive, opening or upgrade trade-off. B includes viable partners needing more careful setup or positioning. C identifies less convenient options in this reviewed population, not an inability to complete a good run. Within-tier order is Pokédex number, not another hidden strength ranking.

The five S recommendations are Gengar, Mewtwo, Palkia, Giratina and Eternatus. Gengar trades safety for a piercing Special start and a status/Hex route. Mewtwo pairs homing Special damage with mobility. Palkia has an aligned Water start, Special damage and Water/Dragon alternatives. Giratina prioritizes bulk around a ranged opening. Eternatus combines a matched poison opening, HP and speed. These are editorial comparisons, not proof that they outperform every A partner in every situation.

Group retains all distinct recorded lineups, with team-size and period filters. Individual Solo grades do not become Group synergy scores. The snapshots omit cards, permanent upgrades and teammate decisions; assigning healing, tank or damage roles from species names would exceed the evidence. A species appearing only in Group still receives an assessment of its actual Solo opening and pool, with an honest absence of Solo records for the chosen period.

## Evidence inspected

- [Official guide](https://pokesurvivor.com/en/guide/): active attacks, positioning, upgrade choices and co-op context.
- [Official moves](https://pokesurvivor.com/en/moves/): current displayed move names and Physical/Special buff distinction.
- [Official Pokédex](https://pokesurvivor.com/en/pokedex/): partner context, checked against the project's extracted roster.
- [Pinned original game source](https://github.com/JPTER78/pokesurvivor/tree/e4ba0e173cb7e415f9815c924a48c5c25f516962): inspected data/moves, entities/player and systems/combat in the locally checked bundle. Live build check reports `7c1976458d`, unchanged from the recorded review.
- [Community-pick roundup](https://pokesurvivortierlist.com/best-pokemon/): discovery of discussions favoring Mewtwo and Gengar. Linked videos were not independently watched or successfully retrieved, so their quoted build claims are not treated as verified primary evidence.
- Other searched tier pages used old attack-only formulas or main-series base-stat totals. These do not establish current survival performance and were not copied into grades.

## Corrections that affected the evaluation

- Physical and Special attacks use separate factors. Swords Dance is not a universal buff for Mewtwo's Confusion or Gengar's Shadow Ball. Starting move fit matters for Dialga, Groudon, Gholdengo, Cinderace and others whose highest factor is not the starter's category.
- An active melee move grants 25% reduction against non-pure damage. Slaking and Marshadow move from the old brief's B to A after including this rule; close positioning and defensive weak sides still matter.
- The legacy `giga-drain` ID is currently displayed as Grass Knot and has no drain parameter. No Grass-based healing route is assumed for Appletun, Celebi, Venusaur or Whimsicott. Appletun's A instead reflects HP, its melee opening and available area/Dragon alternatives, with speed explicitly a drawback.
- Hex receives its status multiplier for burn, poison or slow on the target. Merely owning a status move does not mean it and Hex are firing simultaneously.
- Shell Bell healing is capped at 4 HP per second in the inspected player logic. Poison access must not be described as unlimited sustain.
- Main-series abilities and relationships such as Truant, Defeatist, Prankster or Tatsugiri/Dondozo are not imported into these recommendations.
- Flutter Mane, Iron Moth and Iron Valiant have explicit English display names in the editorial data because the extracted roster currently holds Spanish names for those IDs.

## Presentation and regression checks

The personal editor remains empty on fresh load. Recommendations are added only by an explicit single-pick or clearly counted bulk action, with undo. All 73 are searchable and tier-filterable, with 12 per page on every device. Group uses 10 lineups per page without discarding the rest. Each mode and period uses its own saved records; record counts are not unique-player counts or merged-period totals.

The tier-list fingerprint includes every displayed period and all assessed partners' mechanics. Regressions check exact roster coverage, no duplicate IDs, ordinary/shiny grouping, full Group coverage, key numerical facts and the misleading Grass Knot identifier. Browser verification uses intercepted built artifacts without starting a server.
