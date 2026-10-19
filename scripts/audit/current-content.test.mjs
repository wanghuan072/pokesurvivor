import test from 'node:test';
import assert from 'node:assert/strict';
import crypto from 'node:crypto';
import {checkOfficial} from '../data/check-official.mjs';
const text='verified bundle';
const review={liveBuild:{v:'current'},bundleSha256:crypto.createHash('sha256').update(text).digest('hex')};
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
