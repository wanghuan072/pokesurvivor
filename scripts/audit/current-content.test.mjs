import test from 'node:test';
import assert from 'node:assert/strict';
import crypto from 'node:crypto';
import fs from 'node:fs';
import {checkOfficial} from '../data/check-official.mjs';
const text='verified bundle';
const review={liveBuild:{v:'current'},bundleSha256:crypto.createHash('sha256').update(text).digest('hex')};

test('projectile-count caveats match actual upgrade values and exclude working moves',()=>{
  const read=file=>JSON.parse(fs.readFileSync(file,'utf8'));
  const issues=read('src/data/game/move-issues.json'),moves=read('src/data/moves/moves.json');
  assert.equal(issues.build,read('src/data/guides/review.json').liveBuild.v);
  const ids=issues.groups.flatMap(group=>group.ids);
  assert.equal(ids.length,12);assert.equal(new Set(ids).size,12);
  for(const group of issues.groups)for(const id of group.ids){
    const move=moves.find(m=>m.id===id);assert.ok(move,id);
    assert.equal(move.kind.toLowerCase(),group.kind,id);
    const before=move.levels.find(l=>l.level===group.level-1),after=move.levels.find(l=>l.level===group.level);
    assert.equal(Math.max(1,before.count??0),1,id);
    assert.equal(Math.max(1,after.count??0),1,id);
    assert.equal(after.count,1,id);
    if(group.kind==='bounce')assert.equal(after.bounce,before.bounce+1,id);
    if(group.kind==='homing')assert.equal(move.levels.at(-1).count,2,id);
  }
  const confusion=moves.find(m=>m.id==='confusion');
  assert.equal(confusion.levels[1].count-confusion.levels[0].count,1);
  assert.ok(!ids.includes('confusion'));
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
