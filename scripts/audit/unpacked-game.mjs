import fs from "node:fs";
import assert from "node:assert/strict";
const read = (path) => JSON.parse(fs.readFileSync(path, "utf8"));
const pokemon = read("src/data/pokedex/pokemon.json"),
  moves = read("src/data/moves/moves.json"),
  assets = read("src/data/game/assets.json"),
  encounters = read("src/data/game/encounters.json"),
  waves = read("src/data/game/waves.json"),
  notes = read("src/data/game/move-notes.json"),
  missions = read("src/data/game/missions.json"),
  profiles = read("src/data/game/partner-guides.json");
function asset(url) {
  assert.ok(url.startsWith("/game/") && !url.includes(".."), url);
  const bytes = fs.readFileSync("public" + url);
  if (url.endsWith(".webp")) {
    assert.equal(bytes.toString("ascii", 0, 4), "RIFF", url);
    assert.equal(bytes.toString("ascii", 8, 12), "WEBP", url);
  } else assert.equal(bytes.toString("hex", 0, 8), "89504e470d0a1a0a", url);
}
assert.equal(assets.length, pokemon.length);
assert.equal(encounters.length, pokemon.length);
assert.equal(new Set(assets.map((a) => a.id)).size, pokemon.length);
let images = 0,
  animations = 0;
for (const p of pokemon) {
  const a = assets.find((a) => a.id === p.id),
    e = encounters.find((e) => e.id === p.id);
  assert.ok(a && e, p.slug);
  assert.equal(a.normal, `/game/pokemon/${p.id}.webp`);
  assert.equal(!!a.shiny, e.hasShiny, p.slug);
  asset(a.normal);
  images++;
  if (a.shiny) {
    asset(a.shiny);
    images++;
  }
  for (const animation of a.animations) {
    assert.ok(animation.frames > 0 && animation.durationMs > 0);
    asset(animation.src);
    asset(animation.still);
    animations++;
  }
  if (p.hasDetailPage)
    assert.ok(
      a.animations.some((x) => x.name === "Idle" && !x.shiny),
      p.slug,
    );
  const expected = waves.tiers.flatMap((t, i) =>
    p.rarity < 5 && p.baseStatTotal >= t.bst[0] && p.baseStatTotal <= t.bst[1]
      ? [i]
      : [],
  );
  assert.deepEqual(e.wildTiers, expected, p.slug);
  const boss = waves.bosses.flatMap((t, i) =>
    !p.legendary && p.baseStatTotal >= t.bst[0] && p.baseStatTotal <= t.bst[1]
      ? [i]
      : [],
  );
  assert.deepEqual(e.bossSlots, boss, p.slug);
}
for (const m of moves) {
  const n = notes.find((n) => n.id === m.id);
  assert.ok(n?.description && n.description !== "undefined", m.id);
  assert.equal(n.levelEffects.length, m.maxLevel - 1);
  assert.ok(
    n.levelEffects.every(
      (n) => typeof n.text === "string" && n.text.length > 0,
    ),
  );
  assert.equal(!!n.evolutionEffect, !!m.evolution, m.id);
  asset(`/game/moves/${m.id}.png`);
}
for (const profile of profiles) {
  const p = pokemon.find((p) => p.id === profile.id);
  assert.ok(p, `Partner plan must reference a roster Pokémon: ${profile.id}`);
  for (const id of profile.goals)
    assert.ok(
      p.learnset.includes(id),
      `${p.name}: incompatible editorial goal ${id}`,
    );
}
assert.equal(missions.filter((m) => m.period === "daily").length, 10);
assert.equal(missions.filter((m) => m.period === "weekly").length, 6);
for (const m of missions)
  assert.ok(
    m.goals.every((n) => n > 0) && Object.values(m.reward).every((n) => n > 0),
  );
for (const name of [
  "heart",
  "fist",
  "boot",
  "clock",
  "shield",
  "sprout",
  "magnet",
  "book",
  "berry",
  "coin",
  "star",
  "ticket",
])
  asset(`/game/icons/${name}.png`);
for (const filename of ["pokesurvivor-license.txt", "spritecollab-artists.md"])
  assert.ok(fs.statSync(`public/credits/${filename}`).size > 1000);
const release = read("src/data/game/source-release.json");
for (const file of ["js/data/moves.js", "js/data/pokedex.js"])
  assert.equal(
    release.files.find((f) => f.file === file).matchesPinnedCache,
    true,
  );
console.log(
  `PASS: ${images} local sprite previews, ${animations} animations + still frames, ${moves.length} move icons/upgrade descriptions, 966 encounter pools, 16 mission templates and ${profiles.length} compatible partner plans.`,
);
