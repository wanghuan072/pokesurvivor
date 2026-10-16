import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import assert from "node:assert/strict";
import { gameLiterals } from "./game-literals.mjs";

const archive = process.argv[2];
const reference = process.argv[3];
if (!archive || !reference) throw new Error("Pass the local game archive and pinned official reference directory.");
const local = file => path.join(archive, file);
const official = file => path.join(reference, file.replaceAll("/", "-"));
const files = ["js/systems/gacha.js", "js/systems/spawner.js", "js/systems/rift.js", "js/entities/enemy.js", "js/game.js", "js/core/db.js", "js/ui/menu.js", "js/net/coop.js", "js/systems/progress.js"];
const matchNumber = (file, pattern) => {
  const match = fs.readFileSync(official(file), "utf8").match(pattern);
  assert.ok(match, `Unrecognized shiny rule in ${file}`);
  return Number(match[1]);
};
const rate = file => gameLiterals(official(file)).get("SHINY_RATE");
const wildRate = rate("js/systems/spawner.js"), gachaRate = rate("js/systems/gacha.js");
const riftDenominator = /shiny:\s*G\.Sprites\.hasShiny\(mon\.dex\)\s*&&\s*Math\.random\(\)\s*<\s*1\s*\/\s*(\d+)/;
const riftRate = 1 / matchNumber("js/systems/rift.js", riftDenominator);
assert.equal(riftRate, 1 / Number(fs.readFileSync(local("js/systems/rift.js"), "utf8").match(riftDenominator)?.[1]));
assert.equal(wildRate, gameLiterals(local("js/systems/spawner.js")).get("SHINY_RATE"));
assert.equal(gachaRate, gameLiterals(local("js/systems/gacha.js")).get("SHINY_RATE"));
const revision = JSON.parse(fs.readFileSync(path.join(reference, "revision.json"), "utf8"));
const data = {
  reviewed: "2026-10-16",
  archiveVersion: JSON.parse(fs.readFileSync(local("version.json"), "utf8")),
  officialRevision: revision.revision,
  mechanics: {
    wildRate, riftRate, gachaRate,
    wildHpMultiplier: matchNumber("js/entities/enemy.js", /this\.maxHp\s*\*=\s*(\d+)/),
    wildXpMultiplier: matchNumber("js/entities/enemy.js", /this\.xp\s*\*=\s*(\d+)/),
    wildDuplicateCoins: matchNumber("js/game.js", /if\s*\(!isNew\)\s*pl\.coins\s*\+=\s*(\d+)/),
    rarityPity: gameLiterals(official("js/systems/gacha.js")).get("PITY_5"),
    duplicateRule: "missing shiny in the same banner and rarity; normal result when none remain",
    normalAlsoUnlocked: true,
    guestProgressSaved: false,
  },
  files: files.map(file => ({
    file,
    archiveSha256: crypto.createHash("sha256").update(fs.readFileSync(local(file))).digest("hex"),
    officialSha256: crypto.createHash("sha256").update(fs.readFileSync(official(file))).digest("hex"),
  })),
};
fs.writeFileSync("src/data/game/shiny-rules.json", JSON.stringify(data, null, 2) + "\n");
console.log(`Extracted shiny rules without executing game code; official revision ${revision.revision.slice(0, 10)}.`);
