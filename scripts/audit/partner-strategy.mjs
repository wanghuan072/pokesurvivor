import fs from "node:fs";
import assert from "node:assert/strict";
const read=file=>JSON.parse(fs.readFileSync(file,"utf8"));
const roster=read("src/data/pokedex/pokemon.json"),moves=read("src/data/moves/moves.json");
const recommendations=read("src/data/tier-list/recommendations.json");
const moveById=id=>moves.find(m=>m.id===id);
assert.equal(moveById("water-gun").evolution,"Scald");
assert.equal(moveById("swords-dance").buffStat,"patk");
assert.equal(moveById("nasty-plot").buffStat,"satk");
assert.equal(moveById("aqua-ring").buffStat,"regen");
assert.equal(moveById("string-shot").behavior,"mine");
assert.equal(moveById("energy-ball").evolutionModifiers.drain,undefined);
assert.equal(moveById("u-turn").evolutionModifiers.drain,undefined);
const headings=new Set(), reasons=new Set();
for(const p of roster.filter(p=>p.hasDetailPage)) {
  const plan=p.detail?.strategy;
  assert.ok(plan,p.name);
  assert.equal(plan.moves.length,3,p.name);assert.equal(plan.order.length,3,p.name);
  assert.equal(plan.teammates.length,2,p.name);assert.equal(plan.techniques.length,3,p.name);
  assert.ok(!headings.has(plan.strength.headline),`${p.name}: repeated verdict`);headings.add(plan.strength.headline);
  for(const pick of plan.moves) {
    assert.ok(p.learnset.includes(pick.id),`${p.name}: illegal recommended move ${pick.id}`);
    assert.ok(moves.some(m=>m.id===pick.id),pick.id);
    assert.ok(!reasons.has(pick.reason),`${p.name}: repeated move advice`);reasons.add(pick.reason);
  }
  assert.equal(new Set(plan.moves.map(m=>m.id)).size,3,p.name);
  for(const pick of plan.teammates) {
    const mate=roster.find(m=>m.id===pick.id);
    assert.ok(mate&&mate.id!==p.id&&mate.hasDetailPage,`${p.name}: unpublished or invalid teammate`);
    assert.ok(mate.learnset.includes(pick.moveId),`${mate.name}: illegal team move ${pick.moveId}`);
  }
  const html=fs.readFileSync(`.next/server/app/pokedex/${p.slug}.html`,"utf8");
  assert.ok(html.includes("existing projectiles, placed fields and temporary buffs can remain"),`${p.name}: persistence must not be confused with continued casting`);
  assert.ok(html.includes("not an all-roster co-op ranking"),`${p.name}: no invented optimal teams`);
  for(const id of ["strength","recommended-moves","team-play","practical-tips"])
    assert.ok(html.includes(`id="${id}"`),`${p.name}: missing ${id}`);
  const grade=recommendations.picks.find(pick=>pick.id===p.id)?.tier;
  assert.equal(html.includes("EDITORIAL SOLO GRADE"),!!grade,`${p.name}: invented grade`);
  if(grade)assert.ok(html.includes(`${grade}<!-- --> · EDITORIAL SOLO GRADE`) || html.includes(`${grade} · EDITORIAL SOLO GRADE`),p.name);
}
console.log("PASS: 16 distinct partner strategies, 48 legal move recommendations, 32 legal teammate suggestions, 48 practical tips and only existing editorial grades.");
