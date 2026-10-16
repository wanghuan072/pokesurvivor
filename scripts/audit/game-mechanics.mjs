import fs from "node:fs";
import assert from "node:assert/strict";
import ts from "typescript";
const read = (p) => JSON.parse(fs.readFileSync(p, "utf8"));
const gacha = read("src/data/wiki/gacha.json");
// Run only this repository's own pure calculation module, never downloaded game code.
const output = ts.transpileModule(
  fs.readFileSync("src/lib/tools/gacha-probability.ts", "utf8"),
  {
    compilerOptions: {
      module: ts.ModuleKind.CommonJS,
      target: ts.ScriptTarget.ES2020,
    },
  },
).outputText;
const calculationModule = { exports: {} };
Function(
  "require",
  "exports",
  output,
)((id) => {
  assert.equal(id, "@/lib/data/wiki");
  return { gacha };
}, calculationModule.exports);
const { gachaProbability: odds } = calculationModule.exports;
const near = (actual, expected) =>
  assert.ok(Math.abs(actual - expected) < 1e-10, `${actual} != ${expected}`);
near(odds(0, 0, false), 0);
near(odds(1, 0, false), 0.015);
near(odds(1, 69, false), 1);
near(odds(70, 0, false), 1);
near(odds(1, 69, false, { rarity: 5, poolSize: 6 }), 1 / 6);
near(odds(1, 0, false, { rarity: 5, poolSize: 6 }), 0.015 / 6);
const tenExpected = 1 - ((0.985 ** 9 - 0.92 ** 9) * 0.985 + 0.92 ** 9 * 0.8125);
near(odds(10, 0, true), tenExpected);
assert.ok(odds(10, 0, true) > odds(10, 0, false));
assert.equal(odds(9, 0, true), null);
assert.equal(odds(1, 70, false), null);
assert.equal(odds(-1, 0, false), null);
assert.equal(odds(1.5, 0, false), null);
const pokemon = read("src/data/pokedex/pokemon.json"),
  moves = read("src/data/moves/moves.json"),
  builds = read("src/data/builds/builds.json"),
  achievements = read("src/data/wiki/achievements.json");
assert.equal(achievements.length, 130);
assert.equal(pokemon.filter((p) => p.starter).length, 29);
assert.equal(pokemon.filter((p) => p.legendary).length, 87);
for (const p of pokemon) {
  assert.ok(p.hp > 0 && p.speed > 0 && p.attack > 0);
  assert.deepEqual(
    [...p.cardPool].sort(),
    moves.filter(m => m.type.toLowerCase() === "normal" || p.types.some(type => type.toLowerCase() === m.type.toLowerCase())).map(m => m.id).sort(),
    `${p.name}: ordinary move pool must match Normal plus the species' types`,
  );
  assert.deepEqual(p.learnset, [...new Set([p.startMove, ...p.cardPool])], `${p.name}: incomplete move list`);
  assert.ok(
    p.learnset.includes(p.startMove),
    `${p.name}: starting move outside pool`,
  );
  for (const id of p.learnset)
    assert.ok(
      moves.some((m) => m.id === id),
      `${p.name}: unknown move ${id}`,
    );
}
assert.equal(pokemon.find(p => p.id === 54).startMove, "confusion");
assert.ok(!pokemon.find(p => p.id === 54).cardPool.includes("confusion"), "Psyduck's special opening move must not be offered as an ordinary new card");
for (const b of builds) {
  const ids = [moves.find((m) => m.slug === b.move).id, ...b.supportMoves];
  for (const partnerId of b.partners) {
    const p = pokemon.find((p) => p.id === partnerId);
    assert.ok(p, `Missing partner ${partnerId}`);
    for (const id of ids)
      assert.ok(
        p.learnset.includes(id),
        `${b.slug}: ${p.name} cannot learn ${id}`,
      );
  }
}
const ember = moves.find((m) => m.id === "ember");
const shiny = read("src/data/game/shiny-rules.json");
assert.equal(shiny.mechanics.wildRate, 1 / 4096);
assert.equal(shiny.mechanics.riftRate, 1 / 512);
assert.equal(shiny.mechanics.gachaRate, gacha.shinyRate);
assert.equal(shiny.mechanics.wildHpMultiplier, 2);
assert.equal(shiny.mechanics.wildXpMultiplier, 5);
assert.equal(shiny.mechanics.wildDuplicateCoins, 300);
assert.equal(shiny.mechanics.rarityPity, gacha.pity);
assert.match(shiny.officialRevision, /^[a-f0-9]{40}$/);
const shinyGuide = read("src/data/guides/guides.json").find(g => g.slug === "shiny-pokemon");
assert.ok(shinyGuide);
const samples = shinyGuide.sections.find(s => s.comparisons).comparisons;
const assets = read("src/data/game/assets.json");
for (const sample of samples) {
  assert.equal(pokemon.find(p => p.id === sample.id)?.name, sample.name);
  assert.ok(assets.find(p => p.id === sample.id)?.shiny, `${sample.name}: missing shiny art`);
  assert.ok(fs.existsSync(`public/game/pokemon/${sample.id}-shiny.webp`));
}
assert.equal(pokemon.find(p => p.id === 25).rarity, 2);
assert.equal(pokemon.find(p => p.id === 6).rarity, 4);
assert.equal(pokemon.filter(p => p.region === "kanto" && p.rarity === 2).length, 41);
for (const [route, attempts, expected] of shinyGuide.sections.find(s => s.id === "odds").table.rows) {
  const n = Number(attempts.replaceAll(",", ""));
  const rate = route === "Gacha" ? shiny.mechanics.gachaRate : route === "Rift" ? shiny.mechanics.riftRate : shiny.mechanics.wildRate;
  assert.equal((100 * (1 - (1 - rate) ** n)).toFixed(2) + "%", expected);
}
near(ember.levels[4].dmg, 26.1);
near(ember.levels[4].cd, 0.39);
assert.equal(ember.levels[4].count, 3);
assert.equal(ember.evolutionModifiers.dmg, 1.8);
for (const banner of gacha.banners) {
  assert.ok(banner.counts.every((n) => n > 0));
  assert.equal(
    banner.counts.reduce((a, b) => a + b, 0),
    pokemon.filter((p) => p.region === banner.region).length,
  );
}
console.log(
  "PASS: exact pity boundaries, specific-target odds, ten-pull probability, invalid inputs, 966 move pools, 6 compatible builds and move level values.",
);
