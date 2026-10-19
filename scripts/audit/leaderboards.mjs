import fs from "node:fs";
import assert from "node:assert/strict";

const snapshot = JSON.parse(fs.readFileSync("src/data/game/leaderboards.json", "utf8"));
const pokemon = new Set(JSON.parse(fs.readFileSync("src/data/pokedex/pokemon.json", "utf8")).map(p => p.id));
assert.equal(snapshot.origin, "https://pokesurvivor.com/en/");
assert.equal(snapshot.kind, "official-leaderboard-snapshot");
assert.equal(snapshot.boards.length, 8);
assert.equal(new Set(snapshot.boards.map(b => `${b.mode}:${b.period}`)).size, 8);
for (const board of snapshot.boards) {
  assert.ok(["solo", "group"].includes(board.mode));
  assert.ok(["daily", "weekly", "monthly", "all-time"].includes(board.period));
  assert.ok(Number.isFinite(Date.parse(board.capturedAt)));
  assert.ok(board.rows.length > 0 && board.rows.length <= 50);
  for (const [index, row] of board.rows.entries()) {
    // Only the public fields displayed by the game may be persisted here.
    assert.deepEqual(Object.keys(row).sort(), ["defeated", "level", "names", "pokemon", "rank", "seconds"]);
    assert.equal(row.rank, index + 1);
    assert.ok(Number.isFinite(row.seconds) && row.seconds >= 0);
    assert.ok(Number.isInteger(row.level) && row.level > 0);
    assert.ok(Number.isInteger(row.defeated) && row.defeated >= 0);
    assert.ok(row.names.every(name => typeof name === "string" && name.length > 0));
    assert.equal(row.names.length, row.pokemon.length);
    assert.ok(board.mode === "solo" ? row.names.length === 1 : row.names.length >= 2 && row.names.length <= 4);
    for (const partner of row.pokemon) {
      assert.deepEqual(Object.keys(partner).sort(), ["id", "shiny"]);
      assert.ok(pokemon.has(partner.id));
      assert.equal(typeof partner.shiny, "boolean");
    }
    if (index) assert.ok(board.rows[index - 1].seconds >= row.seconds);
  }
}
console.log(`PASS: 8 official board snapshots, ${snapshot.boards.reduce((sum,b)=>sum+b.rows.length,0)} records; modes, periods, rank order, species, shiny flags and public-only fields.`);
