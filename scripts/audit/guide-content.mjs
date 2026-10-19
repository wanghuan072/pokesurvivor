import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import assert from "node:assert/strict";
import { gameLiterals } from "../data/game-literals.mjs";

const read = file => JSON.parse(fs.readFileSync(file, "utf8"));
const digest = value => crypto.createHash("sha256").update(JSON.stringify(value)).digest("hex");
const reviewFile = "src/data/guides/review.json";
const source = process.argv[2];
if (source) {
  // Read declarations and inspect control flow; never execute downloaded game code.
  const file = name => path.join(source, name.replaceAll("/", "-"));
  const text = name => fs.readFileSync(file(name), "utf8");
  const data = name => gameLiterals(file(name));
  const hash = name => crypto.createHash("sha256").update(fs.readFileSync(file(name))).digest("hex");
  const match = (name, pattern) => assert.match(text(name), pattern, name);
  const roster = data("js/data/pokedex.js").get("G.DEX");
  const moves = data("js/data/moves.js");
  const levelup = data("js/systems/levelup.js");
  const rift = data("js/systems/rift.js");
  match("js/systems/rift.js", /shiny:\s*G\.Sprites\.hasShiny\(mon\.dex\)\s*&&\s*Math\.random\(\)\s*<\s*1\s*\/\s*512/);
  match("js/systems/rift.js", /if \(arena\.shiny\) e\.makeShiny\(\)/);
  match("js/entities/enemy.js", /if \(G\.onShinyCaught\) G\.onShinyCaught\(this\)/);
  match("js/systems/rift.js", /time < G\.Judgment\.AT - 120/);
  match("js/systems/rift.js", /pl\.bonds\+\+/);
  match("js/entities/player.js", /static get BOND_MAX\(\) \{ return 4;/);
  match("js/entities/player.js", /loose\.length >= 2 \? \{ mode: 'pair'/);
  match("js/ui/run-ui.js", /1 \+ \(p\.rerollBonus \|\| 0\) - \(p\.rerolls \|\| 0\)/);
  match("js/systems/levelup.js", /const evo = pool\.findIndex\(c => c\.type === 'evo'\)/);
  match("js/systems/gacha.js", /if \(shiny && save\.shiny\[mon\.dex\]\)/);
  match("js/systems/gacha.js", /else shiny = false/);
  match("js/systems/progress.js", /s\.ach\[a\.id\] = Date\.now\(\);\s*grant\(a\.reward\)/);
  match("js/systems/progress.js", /function claim\(m, weekly = false\)/);
  match("js/systems/progress.js", /pickSet\(G\.MissionDefs\.daily, 3,/);
  match("js/systems/progress.js", /pickSet\(G\.MissionDefs\.weekly, 2,/);
  match("js/net/ranking.js", /const TZ = 'Europe\/Madrid'/);
  match("js/core/db.js", /if \(guest \|\| !key \|\| !save\) return false/);
  match("js/game.js", /G\.DB\.grantShiny\(e\.dex, 'wild'\)/);
  match("js/game.js", /if \(!isNew\) pl\.coins \+= 300/);
  match("js/systems/judgment.js", /const AT = 30 \* 60/);
  match("js/core/db.js", /const PUSH_EVERY = 30 \* 60 \* 1000/);
  match("js/core/db.js", /schedulePush\(PUSH_EVERY\)/);
  match("js/core/db.js", /async function saveNow\(/);
  match("js/systems/levelup.js", /G\.Stats\.fit\(pl\.mon, d\.cat\) >= 0\.999 \? 2 : 1/);
  match("js/systems/judgment.js", /Math\.max\(0, arenaT - 420\) \/ 180/);
  assert.equal(hash("live-app.min.js"), hash("repository-app.min.js"), "Live game bundle differs from the checked repository bundle");
  const facts = {
    rosterCount:roster.length,
    rosterSha256:digest(roster.map(({dex,hp,spd,atk,rarity,gen}) => ({id:dex,hp,speed:spd,attack:atk,rarity,generation:gen}))),
    combatStatsSha256:digest(roster.map(({dex,pa,sa,df,sd})=>({id:dex,physicalAttack:pa,specialAttack:sa,defense:df,specialDefense:sd}))),
    physicalMoves:moves.get("PHYSICAL"),
    saving:{autoUploadMinutes:data("js/core/db.js").get("PUSH_EVERY")/60000,minimumUploadGapSeconds:data("js/core/db.js").get("MIN_GAP")/1000},
    defense:{reference:data("js/systems/stats.js").get("REF"),exponent:data("js/systems/stats.js").get("EXP"),minimum:data("js/systems/stats.js").get("LO"),maximum:data("js/systems/stats.js").get("HI")},
    judgment:{startsMinutes:data("js/systems/judgment.js").get("AT")/60,speedSoftCap:data("js/systems/judgment.js").get("SPD_SOFT"),excessSpeedFactor:data("js/systems/judgment.js").get("SPD_OVER"),touchRampAfterSeconds:420,fullTouchAfterSeconds:600},
    moves: moves.get("RAW").map(({id,dmg,cd}) => ({id,...(dmg===undefined?{}:{dmg}),cd})),
    evolutions: Object.fromEntries(Object.entries(moves.get("EVO")).map(([id,[,needs]]) => [id,needs])),
    starters: data("js/data/starters.js").get("G.STARTERS").map(({dex,start})=>({id:dex,start})),
    statCaps: levelup.get("STATS").map(({id,max})=>({id,max:max??null})),
    upgrades: data("js/data/upgrades.js").get("LIST").map(({id,max})=>({id,max})),
    waves: {tiers:data("js/data/enemies.js").get("TIERS"),bosses:data("js/data/enemies.js").get("BOSS_SLOTS")},
    missions: ["daily","weekly"].flatMap(period=>data("js/data/missions.js").get(period).map(m=>({id:m.id,period,event:m.ev,goals:m.goals,reward:m.reward,mode:m.mode??"add",typeSpecific:m.param==="type"}))),
    gacha: {rates:data("js/systems/gacha.js").get("RATES"),pity:data("js/systems/gacha.js").get("PITY_5"),shinyRate:data("js/systems/gacha.js").get("SHINY_RATE")},
    wildShinyRate:data("js/systems/spawner.js").get("SHINY_RATE"),riftShinyRate:1/512,
    rift:{eligibilityStartsSeconds:rift.get("FROM"),firstPossibleSeconds:rift.get("FROM")+rift.get("CHECK"),arenaSeconds:rift.get("ARENA_TIME"),portalSeconds:rift.get("TTL"),newPortalCutoffSeconds:28*60},
    chestSeconds:data("js/systems/interact.js").get("CHEST_TIME"),
  };
  const files = fs.readdirSync(source).filter(f=>f.startsWith("js-")&&f.endsWith(".js")).sort();
  const review = {
    reviewed:read(file("revision.json")).reviewed,revision:read(file("revision.json")).revision,
    liveBuild:read(file("deployed-version.json")),bundleSha256:hash("live-app.min.js"),
    method:"Official documentation, static code inspection and literal-data comparison. No gameplay sessions or cloud-save/multiplayer tests performed.",
    files:files.map(name=>({file:name.replace(/^js-(core|data|entities|net|systems|ui|world)-/,"js/$1/").replace(/^js-game/,"js/game"),sha256:hash(name)})),
    facts,
  };
  fs.writeFileSync(reviewFile,JSON.stringify(review,null,2)+"\n");
}
const review=read(reviewFile), f=review.facts;
const pokemon=read("src/data/pokedex/pokemon.json"), moves=read("src/data/moves/moves.json");
assert.equal(read("src/data/wiki/source-snapshot.json").counts.moves,moves.length);
assert.equal(pokemon.length,f.rosterCount);
assert.equal(digest(pokemon.map(({id,hp,speed,attack,rarity,generation})=>({id,hp,speed,attack,rarity,generation}))),f.rosterSha256);
assert.equal(digest(pokemon.map(({id,physicalAttack,specialAttack,defense,specialDefense})=>({id,physicalAttack,specialAttack,defense,specialDefense}))),f.combatStatsSha256);
for(const move of moves)assert.equal(move.category,move.behavior==='buff'?'buff':f.physicalMoves.includes(move.id)?'physical':'special',move.id);
assert.ok(pokemon.every(p=>p.cardPool.includes('nasty-plot')));
assert.equal(moves.filter(m=>m.category==='buff').length,6);
const mechanics=read("src/data/game/mechanics.json");
assert.deepEqual(mechanics.saving,f.saving);assert.deepEqual(mechanics.defense,f.defense);assert.deepEqual(mechanics.judgment,f.judgment);
assert.equal(mechanics.build,review.liveBuild.v);assert.equal(mechanics.revision,review.revision);
for(const m of f.moves){const actual=moves.find(x=>x.id===m.id);assert.ok(actual,m.id);assert.equal(actual.base.cd,m.cd,m.id);if(m.dmg!==undefined)assert.equal(actual.base.dmg,m.dmg,m.id);}
assert.equal(moves.length,f.moves.length);
const statNames=Object.fromEntries(read("src/data/wiki/run-cards.json").map(s=>[s.id,s.name]));
for(const [id,needs] of Object.entries(f.evolutions)){const actual=moves.find(m=>m.id===id);assert.ok(actual?.evolution,id);assert.equal(actual.requirement,statNames[needs],id);}
for(const {id,start} of f.starters)assert.equal(pokemon.find(p=>p.id===id).startMove,start,String(id));
assert.deepEqual(read("src/data/wiki/run-cards.json").map(({id,max})=>({id,max})),f.statCaps);
const waves=read("src/data/game/waves.json");assert.deepEqual({tiers:waves.tiers,bosses:waves.bosses},f.waves);
for(const m of read("src/data/game/missions.json")){
  const {id,period,event,goals,reward,mode,typeSpecific}=m;
  assert.deepEqual({id,period,event,goals,reward,mode,typeSpecific},f.missions.find(x=>x.id===id),id);
}
const shiny=read("src/data/game/shiny-rules.json").mechanics;
const gacha=read("src/data/wiki/gacha.json");assert.deepEqual(gacha.rates.map(r=>[r.rarity,r.percent]),f.gacha.rates);assert.equal(gacha.pity,f.gacha.pity);
assert.equal(shiny.wildRate,f.wildShinyRate);assert.equal(shiny.riftRate,f.riftShinyRate);assert.equal(shiny.gachaRate,f.gacha.shinyRate);
assert.equal(read("src/data/game/world-rules.json").rift.firstPossibleSeconds,f.rift.firstPossibleSeconds);
const guide=read("src/data/guides/guides.json").find(g=>g.slug==="shiny-pokemon");
assert.ok(guide.sections.some(s=>s.id==="rifts"),"Rift shiny route must not disappear from the guide");
assert.ok(guide.sections.find(s=>s.id==="start").table.rows.some(row=>row[0]==="Rift legendary" && row[1].includes("512")));
console.log(`PASS: guide data matches the recorded ${review.reviewed} review (${review.liveBuild.v}); ${pokemon.length} partners, ${moves.length} moves, physical/special stats, 59 recipes, wave schedules, stat caps, missions and all three shiny rates. No gameplay test claimed.`);
