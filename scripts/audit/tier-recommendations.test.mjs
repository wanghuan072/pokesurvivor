import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import ts from "typescript";

// Execute only our pure TypeScript module, without a server or downloaded game code.
const calculations = { exports: {} };
const source = ts.transpileModule(fs.readFileSync("src/lib/game/leaderboards.ts", "utf8"), {
  compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 },
}).outputText;
Function("exports", source)(calculations.exports);
const { partnerRecords, teamRecords, recommendationBoard, applyTierPicks } = calculations.exports;
const formatting = { exports: {} };
Function("exports", ts.transpileModule(fs.readFileSync("src/lib/game/leaderboard-format.ts", "utf8"), {
  compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 },
}).outputText)(formatting.exports);
const { survivalTime, periodLabel } = formatting.exports;
const row = (ids, seconds = 60, rank = 1, shiny = false) => ({
  rank, names: ids.map((_, i) => `player-${i}`), pokemon: ids.map(id => ({ id, shiny })), seconds, level: 10, defeated: 100,
});
const board = (mode, rows) => ({ mode, rows, period: "weekly", key: `${mode === "solo" ? "s" : "g"}_w2026-43r`, capturedAt: "2026-10-19T01:32:35.024Z" });

test("partner counts merge shiny appearances and count a species once per record", () => {
  const rows = [row([150, 150], 80, 3), row([150, 94], 90, 2, true), row([94], 90, 1)];
  const original = JSON.stringify(rows);
  assert.deepEqual(partnerRecords(rows), [
    { id: 94, count: 2, bestSeconds: 90, bestRank: 1 },
    { id: 150, count: 2, bestSeconds: 90, bestRank: 2 },
  ]);
  assert.equal(JSON.stringify(rows), original);
  assert.deepEqual(partnerRecords([row([150]), row([94])]).map(p => p.id), [94, 150]);
});
test("teams ignore order and shiny flags but retain repeated members and team size", () => {
  const rows = [row([150, 94], 80, 4), row([94, 150], 90, 2, true), row([150, 150], 85, 3), row([94, 150, 150], 90, 1)];
  const original = JSON.stringify(rows);
  assert.deepEqual(teamRecords(rows), [
    { key: "94,150,150", ids: [94, 150, 150], count: 1, bestSeconds: 90, bestRank: 1 },
    { key: "94,150", ids: [94, 150], count: 2, bestSeconds: 90, bestRank: 2 },
    { key: "150,150", ids: [150, 150], count: 1, bestSeconds: 85, bestRank: 3 },
  ]);
  assert.equal(JSON.stringify(rows), original);
});
test("summary preserves cohort denominators and handles empty boards without fallback", () => {
  const result = recommendationBoard(board("group", [row([150, 94]), row([150, 94, 94]), row([150, 94, 6, 842])]));
  assert.equal(result.records, 3);
  assert.deepEqual(result.cohorts.map(c => [c.size, c.records]), [[0, 3], [2, 1], [3, 1], [4, 1]]);
  const empty = recommendationBoard(board("group", []));
  assert.ok(empty.cohorts.every(c => !c.records && !c.partners.length && !c.teams.length));
  assert.deepEqual(partnerRecords([]), []);
  assert.deepEqual(teamRecords([]), []);
  const noThree = recommendationBoard(board("group", [row([150, 94])]));
  assert.equal(noThree.cohorts.find(c => c.size === 3).records, 0);
});
test("partner ordering stays deterministic without assigning automatic strength tiers", () => {
  const result = recommendationBoard(board("solo", [row([25], 60, 4), row([25], 59, 5), row([94], 80, 2), row([6], 80, 1)]));
  assert.deepEqual(result.cohorts[0].partners.map(p => p.id), [25, 6, 94]);
  assert.ok(!("tiers" in result.cohorts[0]));
});
test("saved weekly regression: Solo frequencies and Group leading lineup", () => {
  const snapshot = JSON.parse(fs.readFileSync("src/data/game/leaderboards.json", "utf8"));
  const solo = recommendationBoard(snapshot.boards.find(b => b.mode === "solo" && b.period === "weekly"));
  assert.equal(solo.records, 50);
  assert.equal(solo.cohorts[0].partners.find(p => p.id === 94).count, 10);
  assert.equal(solo.cohorts[0].partners.find(p => p.id === 150).count, 9);
  assert.equal(solo.cohorts[0].partners.find(p=>p.id===842).bestSeconds, 2700);
  const group = recommendationBoard(snapshot.boards.find(b => b.mode === "group" && b.period === "weekly"));
  assert.deepEqual(group.cohorts[0].teams[0].ids, [94, 150]);
  assert.equal(survivalTime(group.cohorts[0].teams[0].bestSeconds), "40:50");
  assert.equal(group.cohorts[0].teams.length, 49);
  assert.equal(group.cohorts[0].teams.reduce((sum,team)=>sum+team.count,0),50);
  assert.equal(periodLabel(solo), "Week 43, 2026");
  assert.equal(periodLabel({ key: "s_d20261019r" }), "2026-10-19");
  assert.equal(periodLabel({ key: "s_m202610r" }), "2026-10");
  assert.equal(periodLabel({ key: "s_all3" }), "All-time · post-reset board");
  assert.equal(survivalTime(3601), "1:00:01");
  assert.equal(survivalTime(59.9), "0:59");
});

const roster = JSON.parse(fs.readFileSync("src/data/pokedex/pokemon.json", "utf8"));
const moves = JSON.parse(fs.readFileSync("src/data/moves/moves.json", "utf8"));
const editorial = JSON.parse(fs.readFileSync("src/data/tier-list/recommendations.json", "utf8"));
const editorialCode = { exports: {} };
Function("exports", ts.transpileModule(fs.readFileSync("src/lib/game/editorial-picks.ts", "utf8"), {compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020}}).outputText)(editorialCode.exports);
test("editorial grades cover every recorded species without duplicates and retain checked mechanics", () => {
  const picks = editorialCode.exports.editorialPicks(roster, editorial.picks);
  const snapshot=JSON.parse(fs.readFileSync("src/data/game/leaderboards.json","utf8"));
  const recorded=[...new Set(snapshot.boards.flatMap(b=>b.rows.flatMap(r=>r.pokemon.map(p=>p.id))))].sort((a,b)=>a-b);
  assert.equal(picks.length,73);
  assert.deepEqual(picks.map(p=>p.id).sort((a,b)=>a-b),recorded,"Every species in every saved mode/period is reviewed exactly once");
  for(const p of picks){assert.ok(["S","A","B","C","D"].includes(p.tier));assert.ok(p.reason.length>35);assert.ok(p.watchFor.length>35);}
  for(const [id,tier] of [[150,"S"],[94,"S"],[73,"A"],[842,"A"],[289,"S"],[802,"A"],[798,"A"],[100,"C"],[113,"B"],[386,"A"],[409,"A"],[484,"A"],[487,"A"],[890,"A"]])assert.equal(picks.find(p=>p.id===id).tier,tier);
  assert.equal(picks.filter(p=>p.tier==='D').length,0,'Empty D is deliberate; no species is downgraded to fill a quota');
  assert.equal(picks.find(p=>p.id===987).name,"Flutter Mane");
  assert.equal(picks.find(p=>p.id===994).name,"Iron Moth");
  assert.equal(picks.find(p=>p.id===1006).name,"Iron Valiant");
  const mon = id => roster.find(p=>p.id===id);
  assert.equal(mon(150).startMove,"confusion");assert.equal(mon(150).specialAttack,1.55);
  assert.equal(mon(94).startMove,"shadow-ball");assert.equal(mon(94).hp,97);assert.equal(mon(94).defense,60);
  assert.equal(mon(73).startMove,"water-gun");assert.equal(mon(73).specialDefense,120);assert.equal(mon(73).defense,65);
  assert.equal(mon(1015).startMove,"sludge");assert.equal(mon(1015).specialAttack,1.42);assert.equal(mon(1015).defense,66);
  assert.equal(mon(842).hp,120);assert.equal(mon(842).speed,91);assert.ok(mon(842).physicalAttack<mon(842).specialAttack);assert.ok(mon(842).cardPool.includes("giga-drain"));assert.ok(mon(842).cardPool.includes("razor-leaf"));
  assert.equal(mon(289).hp,138);assert.equal(mon(289).physicalAttack,1.58);assert.equal(mon(289).startMove,"tackle");assert.ok(mon(289).specialDefense<mon(289).defense);
  assert.equal(mon(802).speed,130);assert.ok(mon(802).physicalAttack>mon(802).specialAttack);assert.equal(mon(802).startMove,"karate-chop");assert.ok(mon(802).cardPool.includes("shadow-ball"));
  assert.equal(mon(100).hp,88);assert.equal(mon(100).specialAttack,1);assert.equal(mon(100).startMove,"thunder-shock");assert.ok(mon(100).cardPool.includes("discharge"));assert.ok(mon(100).cardPool.includes("thunderbolt"));
  assert.equal(moves.find(m=>m.id==="shadow-ball").base.pierce,2);
  assert.equal(moves.find(m=>m.id==="confusion").base.homing,2);
  assert.equal(moves.find(m=>m.id==="thunder-shock").base.cd,.4);
  const review=JSON.parse(fs.readFileSync("src/data/guides/review.json","utf8"));assert.equal(editorial.gameVersion,review.liveBuild.v);assert.equal(editorial.reviewed,review.reviewed);
  assert.ok(picks.find(p=>p.id===150).statLine.includes("1.55"));
  const grassKnot=moves.find(m=>m.id==="giga-drain");
  assert.equal(grassKnot.name,"Grass Knot");
  assert.ok(!grassKnot.base.drain,"Legacy internal move IDs must not imply healing");
  assert.equal(grassKnot.category,"special");
  assert.throws(()=>editorialCode.exports.editorialPicks(roster,[{...editorial.picks[0],id:-1}]));
  assert.throws(()=>editorialCode.exports.editorialPicks(roster,[{...editorial.picks[0],tier:"Z"}]));
});
test("D grades are supported, sorted last and can be applied without touching other rows",()=>{
  const rows=[{id:'s',label:'S',color:'#123456',partners:[150]},{id:'d',label:'D',color:'#8fbad4',partners:[]}];
  const result=applyTierPicks(rows,[{label:'D',color:'#8fbad4',picks:[{id:100}]}]);
  assert.deepEqual(result[0],rows[0]);assert.deepEqual(result[1].partners,[100]);
  const picks=editorialCode.exports.editorialPicks(roster,[{...editorial.picks[0],id:100,tier:'D'},{...editorial.picks[0],id:150,tier:'S'}]);
  assert.deepEqual(picks.map(p=>p.tier),['S','D']);
});
test("applying recommendations moves only selected picks and preserves custom choices and colors", () => {
  const rows = [{ id: "custom-s", label: "s", color: "#123456", partners: [25, 94] }, { id: "custom", label: "Favorites", color: "#234567", partners: [6, 150] }];
  const original = JSON.stringify(rows);
  const tiers = [{label:"S",color:"#e59781",picks:[{id:150}]},{label:"C",color:"#9ec994",picks:[{id:94}]}];
  const result = applyTierPicks(rows, tiers);
  assert.deepEqual(result[0], { id: "custom-s", label: "s", color: "#123456", partners: [25, 150] });
  assert.deepEqual(result[1].partners, [6]);
  assert.deepEqual(result[2].partners, [94]);
  assert.equal(result[2].label, "C");
  assert.equal(new Set(result.flatMap(r => r.partners)).size, result.flatMap(r => r.partners).length);
  assert.equal(JSON.stringify(rows), original);
  assert.deepEqual(applyTierPicks(result, tiers), result, "Re-applying does not duplicate picks");
  const single = applyTierPicks(rows, [{ ...tiers[0], picks: [tiers[0].picks[0]] }]);
  assert.deepEqual(single[0].partners, [25, 94, 150], "Single click preserves the rest of its target row");
});
test("custom boards at the row limit remain unchanged if recommended labels cannot be added", () => {
  const rows = Array.from({ length: 10 }, (_, i) => ({ id: `custom-${i}`, label: `Favorites ${i}`, color: "#123456", partners: i ? [] : [25] }));
  const original = JSON.stringify(rows);
  const tiers = [{label:"S",color:"#e59781",picks:[{id:25}]}];
  assert.equal(applyTierPicks(rows, tiers), null);
  assert.equal(JSON.stringify(rows), original);
});

test("repeated species from Group lineups are added only once", () => {
  const result=applyTierPicks([{id:"s",label:"S",color:"#123456",partners:[6]}],[{label:"S",color:"#123456",picks:[{id:150},{id:150}]}]);
  assert.deepEqual(result[0].partners,[6,150]);
});
