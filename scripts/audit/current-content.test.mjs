import test from 'node:test';
import assert from 'node:assert/strict';
import crypto from 'node:crypto';
import fs from 'node:fs';
import {checkOfficial} from '../data/check-official.mjs';
import {moveDefaults} from '../data/move-defaults.mjs';
const text='verified bundle';
const review={liveBuild:{v:'current'},bundleSha256:crypto.createHash('sha256').update(text).digest('hex')};

test('projectile defaults preserve explicit values and leave other behaviors alone',()=>{
  const raw={kind:'homing',dmg:19};
  assert.deepEqual(moveDefaults(raw),{kind:'homing',dmg:19,count:1,spread:.12});
  assert.deepEqual(raw,{kind:'homing',dmg:19},'Do not mutate parsed source literals');
  assert.deepEqual(moveDefaults({kind:'projectile',count:4,spread:.3}),{kind:'projectile',count:4,spread:.3});
  assert.deepEqual(moveDefaults({kind:'buff',amount:.2}),{kind:'buff',amount:.2});
});

test('released projectile fixes are reflected in all twelve move progressions',()=>{
  const read=file=>JSON.parse(fs.readFileSync(file,'utf8'));
  const issues=read('src/data/game/move-issues.json'),moves=read('src/data/moves/moves.json');
  assert.equal(issues.build,read('src/data/guides/review.json').liveBuild.v);
  assert.equal(issues.status,'resolved');
  const ids=issues.groups.flatMap(group=>group.ids);
  assert.equal(ids.length,12);assert.equal(new Set(ids).size,12);
  for(const group of issues.groups)for(const id of group.ids){
    const move=moves.find(m=>m.id===id);assert.ok(move,id);
    assert.equal(move.kind.toLowerCase(),group.kind,id);
    const before=move.levels.find(l=>l.level===group.level-1),after=move.levels.find(l=>l.level===group.level);
    assert.equal(Math.max(1,before.count??0),1,id);
    assert.equal(after.count,2,id);
    assert.ok(Math.abs(after.spread-.156)<1e-10,id);
    if(group.kind==='bounce')assert.equal(after.bounce,before.bounce+1,id);
    if(group.kind==='homing')assert.equal(move.levels.at(-1).count,3,id);
  }
  const confusion=moves.find(m=>m.id==='confusion');
  assert.equal(confusion.levels[1].count-confusion.levels[0].count,1);
  assert.ok(!ids.includes('confusion'));
});

test('current help follows manual cloud uploads and verified upgrade prices',()=>{
  const read=file=>JSON.parse(fs.readFileSync(file,'utf8'));
  const mechanics=read('src/data/game/mechanics.json');
  assert.deepEqual(mechanics.saving,{autoUploadMinutes:null,uploadMode:'manual',minimumUploadGapSeconds:65});
  const faq=read('src/data/guides/faq.json');
  assert.match(faq.questions.find(([q])=>q==='Will guest progress be saved?')[1],/no timed automatic cloud upload/);
  const guides=read('src/data/guides/guides.json');
  const current=JSON.stringify({faq,guides});
  assert.doesNotMatch(current,/uploads are scheduled after about 30 minutes|first extra-projectile upgrade currently leaves one shot/);
  assert.ok(guides.find(g=>g.slug==='move-evolutions').sections.some(s=>s.id==='permanent-upgrades'));
  const upgrades=read('src/data/wiki/upgrades.json');
  assert.equal(upgrades.length,14);
  const cost=(u,level)=>Math.round(u.baseCost*u.growth**level/10)*10;
  const strength=upgrades.find(u=>u.id==='atk');
  assert.equal(cost(strength,0),80);assert.equal(cost(strength,1),110);
  assert.equal(upgrades.reduce((sum,u)=>sum+Array.from({length:u.max},(_,i)=>cost(u,i)).reduce((a,b)=>a+b,0),0),40400);
});
test('official freshness check compares the live version and exact bundle without modifying data',async()=>{
  const calls=[];
  const result=await checkOfficial(review,async url=>{calls.push(url);return url.endsWith('version.json')?Response.json({v:'current'}):new Response(text);});
  assert.equal(result.changed,false);assert.equal(calls.length,2);
  assert.equal((await checkOfficial(review,async url=>url.endsWith('version.json')?Response.json({v:'current'}):new Response('different bundle'))).changed,true);
});
test('a changed version is flagged before reading the bundle; network failures are not treated as unchanged',async()=>{
  let calls=0;
  assert.equal((await checkOfficial(review,async()=>{calls++;return Response.json({v:'new'});})).changed,true);
  assert.equal(calls,1);
  await assert.rejects(checkOfficial(review,async()=>new Response('',{status:403})),/HTTP 403/);
  await assert.rejects(checkOfficial(review,async()=>{throw new Error('offline');}),/offline/);
});
