import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import assert from "node:assert/strict";
import ts from "typescript";
import { gameLiterals } from "./game-literals.mjs";

// Parse the supplied source; never import or execute downloaded game code.
const source = process.argv[2] ?? ".cache/levelup-review";
const revision = process.argv[3] ?? (
  path.resolve(source) === path.resolve(".cache/levelup-review") && fs.existsSync(path.join(source, "commits.json"))
    ? JSON.parse(fs.readFileSync(path.join(source, "commits.json"), "utf8"))[0].sha
    : null
);
assert.ok(revision === null || /^[a-f0-9]{40}$/.test(revision), "Expected a full source commit SHA");
const files = ["js/data/moves.js", "js/data/items.js", "js/entities/enemy.js", "js/entities/player.js", "js/systems/rift.js", "js/game.js", "js/systems/levelup.js"];
const resolve = file => {
  const nested = path.join(source, file);
  return fs.existsSync(nested) ? nested : path.join(source, file.replaceAll("/", "-"));
};
const code = Object.fromEntries(files.map(file => [file, fs.readFileSync(resolve(file), "utf8")]));
function method(file, name) {
  const ast = ts.createSourceFile(file, code[file], ts.ScriptTarget.Latest, true, ts.ScriptKind.JS);
  let found;
  function visit(node) {
    if ((ts.isMethodDeclaration(node) || ts.isGetAccessor(node) || ts.isFunctionDeclaration(node)) && node.name?.getText(ast) === name)
      found = node.getText(ast);
    ts.forEachChild(node, visit);
  }
  visit(ast);
  assert.ok(found, `Missing ${name}; review the updated source.`);
  return found;
}
const bossStart = method("js/entities/enemy.js", "bossStart");
const ids = [...bossStart.matchAll(/case '([a-z]+)'/g)].map(match => match[1]);
assert.deepEqual(ids, ["slam", "dash", "leap", "rain", "beam", "volley", "nova"]);
const maxMoves = Number(method("js/entities/player.js", "BOND_MAX").match(/return\s+(\d+)/)?.[1]);
assert.equal(maxMoves, 4);
assert.match(method("js/systems/rift.js", "won"), /pl\.bonds\+\+/);
assert.ok(!code["js/entities/enemy.js"].includes(".bonds++"), "Map Bosses must not be presented as Bond rewards");
assert.match(code["js/entities/enemy.js"], /if \(this\.boss && !this\.judge\)/);
assert.match(code["js/entities/enemy.js"], /G\.Pickups\.drop\('item'/);
assert.match(method("js/entities/player.js", "bondOptions"), /loose\.length >= 2/);
assert.match(method("js/entities/player.js", "bondOptions"), /s\.length > 1 && s\.length < Player\.BOND_MAX/);
assert.match(method("js/game.js", "offerBond"), /if \(!opt\)/);
assert.match(method("js/entities/enemy.js", "bossMove"), /this\.hp < this\.maxHp \* 0\.5/);
assert.match(bossStart, /ai\.fury \? 6 : 4/);
assert.match(bossStart, /ai\.fury \? 5 : 3/);
const bossCast = method("js/entities/enemy.js", "bossCast");
assert.match(bossCast, /ai\.fury \? 9 : 7/);
assert.match(bossCast, /ai\.fury \? 18 : 14/);
const moveData = gameLiterals(resolve("js/data/moves.js"));
assert.equal(moveData.get("RAW").length, 64);
assert.equal(Object.keys(moveData.get("EVO")).length, 59);
const itemIds = gameLiterals(resolve("js/data/items.js")).get("LIST").map(item => item.id);
const items = JSON.parse(fs.readFileSync("src/data/wiki/items.json", "utf8"));
assert.deepEqual(itemIds, items.map(item => item.id));
assert.match(method("js/entities/player.js", "onDealt"), /Math\.min\(4, this\.bellHeal \+ dmg \* 0\.04\)/);
assert.match(code["js/entities/player.js"], /Math\.min\(this\.bellHeal, 4 \* dt\)/);
const patterns = [
  { id: "slam", icon: "fist", name: "Area slam", description: "A circular shockwave around the Boss. Leave the marked area before the hit.", normal: "Close-range circle", enraged: "Shorter warning" },
  { id: "dash", icon: "boot", name: "Straight charge", description: "The Boss charges along the line aimed at you when the cast starts. Move sideways out of that line.", normal: "Straight-line charge", enraged: "Shorter warning" },
  { id: "leap", icon: "up", name: "Leaping strike", description: "A jump toward your marked position, followed by an area hit on landing. Keep moving away from the landing circle.", normal: "Marked landing circle", enraged: "Shorter launch delay" },
  { id: "rain", icon: "wrain", name: "Falling zones", description: "Several delayed impact circles appear around your position. Move into clear ground instead of crossing another marker.", normal: "4 impact zones", enraged: "6 impact zones" },
  { id: "beam", icon: "type-electric", name: "Beam fan", description: "Long beams spread toward your position. Read the lines on the ground and step into a gap before they fire.", normal: "3 beams", enraged: "5 beams" },
  { id: "volley", icon: "type-water", name: "Projectile volley", description: "A fan of projectiles fires toward you after the charge-up. Keep an open escape route across the fan.", normal: "7 projectiles", enraged: "9 projectiles" },
  { id: "nova", icon: "type-fire", name: "Radial burst", description: "Projectiles spread outward in a ring. Keep enough distance to see a gap and move through it.", normal: "14 projectiles", enraged: "18 projectiles" },
];
const data = {
  review: {
    reviewed: "2026-10-16",
    revision,
    method: "Official documentation and static source inspection, including Boss death, Rift victory, Bond selection and fusion. No gameplay session claimed.",
    officialPages: ["https://pokesurvivor.com/en/moves/", "https://pokesurvivor.com/en/items/", "https://pokesurvivor.com/en/news/"],
    files: files.map(file => ({file, sha256: crypto.createHash("sha256").update(code[file]).digest("hex")})),
  },
  counts: { moveCards: 64, evolutionRecipes: 59, heldItems: itemIds.length, bossPatterns: ids.length },
  heldItemIds: itemIds,
  itemNotes: {
    choiceband: "Locks ordinary slot switching. If your active slot is a Bond group, its linked moves can still run together.",
    shellbell: "Damage dealt adds 4% to a healing reserve capped at 4 HP. That reserve is released at up to 4 HP per second.",
    lifeorb: "Each affected cast costs the larger of 1 HP and 1% of max HP, stopping at 1 HP. Orbit and trail casts are excluded from this charge.",
    assaultvest: "Adds 20 percentage points of damage reduction. Total player damage reduction is capped at 80%.",
  },
  bond: {
    maxGroupSize: maxMoves,
    rewardPerRiftVictory: 1,
    mapBossReward: false,
    savedUntilUsable: true,
    steps: [
      { title: "Win the Rift fight", description: "Defeat the legendary inside its Rift arena. Each victory adds one Bond. An ordinary map Boss does not grant one." },
      { title: "Return to the main map", description: "The fusion choice opens after you leave the arena. If another choice screen is open, it waits until that screen closes." },
      { title: "Pair two learned moves", description: "Without an unfinished group, choose two moves currently in separate slots. They become one slot and both run while that slot is active." },
      { title: "Grow the unfinished group", description: "If a group already contains two or three moves, the next Bond adds one loose move to it. Four is the group limit. Once a group is full, another Bond can start a new pair if two loose moves remain." }
    ],
    notes: [
      "A Bond combines learned moves. It does not teach a Boss attack, add a fifth ordinary move slot or automatically evolve either move.",
      "Fusion keeps the existing move objects, including their levels and evolution state. Their attacks use their own cooldowns; they do not share one new cooldown.",
      "With only one loose move and no unfinished group, the Bond is saved until you learn another eligible move. Returning without a victory does not award a Bond.",
      "Choice Band still blocks ordinary slot switching. Fusion keeps the current active slot if that slot survives the merge; otherwise it selects the fused group."
    ],
  },
  equipment: {
    limit: 1,
    scope: "current run",
    description: "Standard map Bosses and Rift legendaries drop a held item. Chests can also provide equipment. You can carry only one at a time; finding another opens a choice to keep your current item or replace it.",
    exclusions: "Judgment enemies are excluded from the standard Boss equipment-drop branch. Equipment is separate from move slots, evolution stat-card requirements and Rift Bonds.",
  },
  patterns,
};
for (const pattern of patterns) assert.ok(fs.existsSync(`public/game/icons/${pattern.icon}.png`));
for (const id of itemIds) assert.ok(fs.existsSync(`public/game/icons/${id}.png`));
fs.writeFileSync("src/data/game/boss-rewards.json", JSON.stringify(data, null, 2) + "\n");
console.log(`Parsed ${itemIds.length} Boss equipment drops, Bond rules and ${ids.length} enemy-only Boss patterns; 64 move cards and 59 recipes unchanged.`);
