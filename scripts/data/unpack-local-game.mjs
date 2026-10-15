import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import { execFileSync } from "node:child_process";
import { gameLiterals } from "./game-literals.mjs";

const source = process.argv[2];
if (!source || !fs.existsSync(path.join(source, "js/data/pokedex.js")))
  throw new Error("Usage: npm run data:unpack -- <game-source-directory>");
const load = (file) => gameLiterals(path.join(source, file));
const read = (file) => JSON.parse(fs.readFileSync(file, "utf8"));
const write = (name, data) =>
  fs.writeFileSync(
    `src/data/game/${name}.json`,
    JSON.stringify(data, null, 2) + "\n",
  );
fs.mkdirSync("src/data/game", { recursive: true });
fs.mkdirSync("public/credits", { recursive: true });
const pokemon = read("src/data/pokedex/pokemon.json"),
  moves = read("src/data/moves/moves.json");
const en = load("js/data/lang-en.js").dictionary();
const translate = (s) => en[s] || s;
const sprites = load("js/data/sprites-meta.js").get("G.SPRITE_META");
const enemy = load("js/data/enemies.js");
const tiers = enemy.get("TIERS"),
  bosses = enemy.get("BOSS_SLOTS");
const raw = load("js/data/moves.js"),
  rawMoves = raw.get("RAW"),
  ladders = raw.get("LADDERS"),
  evo = raw.get("EVO_MODS");
const noteMoves = moves.map((m) => {
  const original = rawMoves.find((r) => r.id === m.id);
  if (!original || original.dmg !== m.base.dmg || original.cd !== m.base.cd)
    throw new Error(`Move version mismatch: ${m.id}`);
  return {
    id: m.id,
    description: translate(original.desc),
    levelEffects: ladders[original.kind].map((l, i) => ({
      level: i + 2,
      text: translate(l.t),
    })),
    evolutionEffect: m.evolution ? translate(evo[original.kind].t) : null,
  };
});
write("move-notes", noteMoves);
write(
  "sprite-metadata",
  Object.fromEntries(pokemon.map((p) => [p.id, sprites[p.id]])),
);
write(
  "encounters",
  pokemon.map((p) => ({
    id: p.id,
    hovering: !!sprites[p.id]?.hv,
    hasShiny: !!sprites[p.id]?.sh,
    wildTiers: tiers.flatMap((t, i) =>
      p.rarity < 5 &&
      sprites[p.id] &&
      p.baseStatTotal >= t.bst[0] &&
      p.baseStatTotal <= t.bst[1]
        ? [i]
        : [],
    ),
    bossSlots: bosses.flatMap((b, i) =>
      !p.legendary &&
      sprites[p.id] &&
      p.baseStatTotal >= b.bst[0] &&
      p.baseStatTotal <= b.bst[1]
        ? [i]
        : [],
    ),
  })),
);
const missionNames = {
  kill: "Defeat wild Pokémon",
  killType: "Defeat a chosen type",
  survive: "Survive in one run",
  level: "Reach a level in one run",
  boss: "Defeat bosses",
  chest: "Open locked chests",
  coins: "Collect run coins",
  playType: "Survive with a chosen type",
  item: "Find a held item",
  evolve: "Evolve a move",
  wkill: "Defeat wild Pokémon",
  wrift: "Win Rift battles",
  wboss: "Defeat bosses",
  wsurvive: "Survive in one run",
  wevolve: "Evolve moves",
  wdaily: "Complete daily missions",
};
const defs = load("js/data/missions.js");
write(
  "missions",
  ["daily", "weekly"].flatMap((period) =>
    defs.get(period).map((m) => ({
      id: m.id,
      period,
      name: missionNames[m.id],
      event: m.ev,
      mode: m.mode || "add",
      typeSpecific: m.param === "type",
      goals: m.goals,
      reward: m.reward,
    })),
  ),
);
write("waves", {
  tiers,
  bosses,
  healers: enemy.get("HEAL"),
  shielders: enemy.get("SHIELD"),
  bombers: enemy.get("BOMB"),
  summoners: enemy.get("SUMMON"),
});
const icons = load("js/ui/icons.js");
write("icon-definitions", {
  colors: load("js/core/util.js").get("G.U").TYPE_COLOR,
  ui: icons.get("UI"),
  types: icons.get("TYPE_GLYPH"),
  families: icons.get("KIND_GLYPH"),
});
const interact = load("js/systems/interact.js"),
  events = load("js/systems/events.js"),
  rift = load("js/systems/rift.js");
write("world-rules", {
  chestSeconds: interact.get("CHEST_TIME"),
  powerSeconds: interact.get("POWER_TIME"),
  trapRadius: interact.get("TRAP_R"),
  eventInterval: events.get("EVERY"),
  eventDuration: events.get("DUR"),
  lostSeconds: events.get("LOST_TIME"),
  thiefFirst: events.get("THIEF_FIRST"),
  thiefNext: events.get("THIEF_NEXT"),
  thiefLife: events.get("THIEF_LIFE"),
  rift: {
    checkSeconds: rift.get("CHECK"),
    initialChance: rift.get("CHANCE"),
    portalSeconds: rift.get("TTL"),
    arenaSeconds: rift.get("ARENA_TIME"),
    firstPossibleSeconds: rift.get("FROM"),
  },
});
const files = [
  "version.json",
  "js/data/pokedex.js",
  "js/data/moves.js",
  "js/data/sprites-meta.js",
  "js/data/enemies.js",
  "js/data/missions.js",
  "js/data/lang-en.js",
  "js/ui/icons.js",
  "js/core/util.js",
  "js/systems/interact.js",
  "js/systems/events.js",
  "js/systems/rift.js",
  "js/systems/progress.js",
  "js/systems/spawner.js",
  "js/world/world.js",
  "js/net/ranking.js",
];
write("source-release", {
  reviewed: "2026-10-15",
  kind: "local-source-archive",
  version: read(path.join(source, "version.json")),
  baseline: read("src/data/wiki/source-snapshot.json").build,
  files: files.map((file) => ({
    file,
    sha256: crypto
      .createHash("sha256")
      .update(fs.readFileSync(path.join(source, file)))
      .digest("hex"),
    matchesPinnedCache: fs.existsSync(
      `.cache/research/${file.replaceAll("/", "-")}`,
    )
      ? fs
          .readFileSync(path.join(source, file))
          .equals(
            fs.readFileSync(`.cache/research/${file.replaceAll("/", "-")}`),
          )
      : null,
  })),
});
for (const [from, to] of [
  ["LICENSE", "pokesurvivor-license.txt"],
  ["CREDITS.md", "spritecollab-artists.md"],
])
  fs.copyFileSync(path.join(source, from), `public/credits/${to}`);
execFileSync(
  process.env.PYTHON || "python",
  ["scripts/data/unpack-game-images.py", source],
  { stdio: "inherit" },
);
console.log(
  `Parsed ${pokemon.length} species, ${noteMoves.length} move descriptions, ${tiers.length} wave tiers, ${bosses.length} boss slots and 16 mission templates. Existing roster publication flags and newer gameplay data preserved.`,
);
