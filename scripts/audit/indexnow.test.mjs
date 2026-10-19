import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import {createRequire} from "node:module";
import {execFileSync} from "node:child_process";
import {buildManifest,manifestDiff,FINGERPRINT_VERSION} from "../seo/manifest.mjs";
import {sitemapParts} from "../seo/sitemap-xml.mjs";
import {SITE_URL,PROJECT_ID,REPOSITORY} from "../seo/config.mjs";
import {productionBaseline,prepareManifest} from "../seo/build-manifest.mjs";
import {deploymentInput,publishedSite,deliver,submitBatches,submissionUrls,latestReceipt,prepare,RECEIPT_PREFIX} from "../seo/indexnow.mjs";
import {semanticSource} from "../seo/semantic-source.mjs";
import {assertManifest} from "../seo/manifest-contract.mjs";

const before="2026-10-16T00:00:00.000Z",after="2026-10-19T00:00:00.000Z";
const routes=paths=>paths.map(path=>({path,canonicalUrl:new URL(path,SITE_URL).href,indexable:true}));
const make=(hashes,previous=null,date=before,indexable=true)=>buildManifest(previous,hashes,routes(Object.keys(hashes)),date,indexable);
const json=data=>new Response(JSON.stringify(data),{headers:{"Content-Type":"application/json"}});
const key=JSON.parse(fs.readFileSync("src/data/seo/indexnow.json","utf8")).key;
const input={id:"dpl_testProduction",sha:"a".repeat(40),url:"https://verified-build.vercel.app"};

test("stable dates, additions, edits, deletion, rename and noindex changes",()=>{
  const first=make({"/":"home","/old":"old"});
  const same=make({"/":"home","/old":"old"},first,after);
  assert.deepEqual(same.entries,first.entries);assert.equal(manifestDiff(first,same).unchanged.length,2);
  const next=make({"/":"new home","/new":"new"},first,after);
  assert.deepEqual(manifestDiff(first,next),{added:[SITE_URL+"/new"],updated:[SITE_URL+"/"],deleted:[SITE_URL+"/old"],unchanged:[]});
  assert.deepEqual(next.deletedUrls,[SITE_URL+"/old"]);
  const hidden=buildManifest(next,{"/":"new home","/new":"new"},routes(["/","/new"]).map(r=>({...r,indexable:r.path!=="/new"})),"2026-10-20T00:00:00.000Z");
  assert.deepEqual(manifestDiff(next,hidden).deleted,[SITE_URL+"/new"]);
  assert.equal(sitemapParts(hidden).xml.includes("/new</loc>"),false);
  const preview=make({"/":"home","/old":"old"},first,after,false);
  assert.deepEqual(preview.entries.map(e=>e.lastModified),first.entries.map(e=>e.lastModified));
  assert.equal((sitemapParts(preview).xml.match(/<url>/g)||[]).length,0);
});
test("reject older timestamps and fingerprint algorithms; reverted content is still a pending update",()=>{
  const first=make({"/":"a"});
  assert.throws(()=>make({"/":"a"},first,"2026-10-15T00:00:00.000Z"),/backward/);
  assert.throws(()=>make({"/":"b"},first,before),/advance/);
  assert.throws(()=>manifestDiff({...first,fingerprintVersion:"seo-v0"},first),/version/i);
  assert.throws(()=>make({"/":"a"},{...first,fingerprintVersion:"seo-v0"},after),/migration/);
  const changed=make({"/":"b"},first,after);
  const restored=make({"/":"a"},changed,"2026-10-20T00:00:00.000Z");
  assert.deepEqual(manifestDiff(first,restored).updated,[SITE_URL+"/"]);
});
test("code formatting, classes, inline styling and copyright year are not content changes",()=>{
  const a='import s from "a.css"; export const X = () => <h1 className="red" style={{color:"red"}}>Hello</h1>;';
  const b="// comment\nimport s from 'a.css';\nexport const X=()=> <h1 className='blue' style={{color:'blue'}}>Hello</h1>;";
  assert.equal(semanticSource(a,"example.tsx"),semanticSource(b,"example.tsx"));
  assert.notEqual(semanticSource(a,"example.tsx"),semanticSource(a.replace("h1","h2"),"example.tsx"));
});
test("XML contains all four fields and automatically splits 50,001 URLs",()=>{
  const manifest=make({"/":"home","/legal/about-us":"about"});
  const xml=sitemapParts(manifest).xml;
  assert.match(xml,/xmlns="http:\/\/www.sitemaps.org\/schemas\/sitemap\/0.9"/);
  for(const row of xml.matchAll(/<url>(.*?)<\/url>/g))assert.match(row[1],/^<loc>.*<\/loc><lastmod>.*<\/lastmod><changefreq>(monthly|yearly)<\/changefreq><priority>(1\.0|0\.4)<\/priority>$/);
  const many={...manifest,entries:Array.from({length:50001},(_,i)=>({...manifest.entries[0],path:`/p/${i}`,canonicalUrl:`${SITE_URL}/p/${i}`}))};
  const split=sitemapParts(many);assert.equal(split.children.length,2);assert.match(split.xml,/<sitemapindex/);assert.ok(!split.xml.includes("<priority>"));
  assert.equal((split.children[0].xml.match(/<url>/g)||[]).length,50000);assert.equal((split.children[1].xml.match(/<url>/g)||[]).length,1);
  const escaped=sitemapParts({...manifest,entries:[{...manifest.entries[0],canonicalUrl:SITE_URL+"/?a=1&b=2"}]}).xml;assert.ok(escaped.includes("&amp;"));
});
test("first migration preserves verified dates; network, protection or identity failures stop the build",async()=>{
  const seed={verifiedDeploymentId:"dpl_seed",manifest:make({"/":"home"}),deletedUrls:[SITE_URL+"/retired"]};
  const fetcher=async url=>url.endsWith("seo-url-manifest.json")?new Response("",{status:404}):url.endsWith("sitemap.xml")?new Response(sitemapParts(seed.manifest).xml):new Response('<html data-dpl-id="dpl_seed">');
  assert.deepEqual((await productionBaseline(seed,fetcher)).entries,seed.manifest.entries);
  await assert.rejects(productionBaseline(seed,async()=>new Response("",{status:403})),/403/);
  await assert.rejects(productionBaseline(seed,async()=>new Response("login",{headers:{"content-type":"text/html"}})),/not JSON/);
  await assert.rejects(productionBaseline(seed,async()=>{throw new Error("network unavailable");}),/network/);
});

test("production requires platform-provided version fields before reading a baseline or writing output",async()=>{
  await assert.rejects(prepareManifest({env:{VERCEL_ENV:'production',SITE_INDEXABLE:'true'},fetcher:async()=>{throw new Error('Unexpected request');}}),/system variables/);
});

function production(manifest) {
  return {...manifest,projectId:PROJECT_ID,environment:"production",gitSha:input.sha,deploymentId:input.id};
}
function event(payload={}) {
  return {repository:{full_name:REPOSITORY},sender:{login:"vercel[bot]",type:"Bot"},action:"vercel.deployment.success",client_payload:{project:{id:PROJECT_ID},environment:"production",state:{type:"success"},id:input.id,url:input.url,git:{sha:input.sha},...payload}};
}
function fixture(manifest,{statuses=[202],deleted=[],pageStatus={},changeAt=Infinity}={}) {
  const sent=[],requests=[];
  const current={id:input.id,manifest:production(manifest)};
  let reads=0,posts=0;
  const fetcher=async(url,options={})=>{
    requests.push({url,options});
    if(url===SITE_URL+"/.well-known/seo-url-manifest.json")return json(++reads>=changeAt?{...current.manifest,gitSha:"b".repeat(40)}:current.manifest);
    if(url===`${SITE_URL}/${key}.txt`)return new Response(key);
    if(url==="https://api.indexnow.org/indexnow"){
      sent.push(JSON.parse(options.body));return new Response("",{status:statuses[Math.min(posts++,statuses.length-1)]});
    }
    if(url.startsWith("https://api.github.com/"))return json({artifacts:[]});
    if(pageStatus[url])return new Response(pageStatus[url].html??"",{status:pageStatus[url].status,headers:pageStatus[url].headers});
    if(deleted.includes(url))return new Response("",{status:404});
    return new Response(`<html><link rel="canonical" href="${url}"><meta name="robots" content="index, follow"></html>`);
  };
  return {current,fetcher,sent,requests};
}
function receipt(manifest){return {projectId:PROJECT_ID,environment:"production",deploymentId:"dpl_previous",manifest:production(manifest)};}

test("only authentic Vercel production events from this repository are eligible",()=>{
  assert.deepEqual(deploymentInput("repository_dispatch",event()),{id:input.id,sha:input.sha});
  for(const override of [{environment:"preview"},{project:{id:"another-project"}},{state:{type:"error"}}])assert.equal(deploymentInput("repository_dispatch",event(override)),null);
  assert.equal(deploymentInput("repository_dispatch",{...event(),action:"vercel.deployment.error"}),null);
  assert.equal(deploymentInput("repository_dispatch",{...event(),sender:{login:"a-human",type:"User"}}),null);
  assert.equal(deploymentInput("repository_dispatch",{...event(),repository:{full_name:"other/repo"}}),null);
  assert.throws(()=>deploymentInput("repository_dispatch",event({url:"https://evil.test"})),/URL/);
  assert.deepEqual(deploymentInput("workflow_dispatch",{repository:{full_name:REPOSITORY}}),{});
});

test("published identity uses the fixed public domain without API credentials",async()=>{
  const f=fixture(make({"/":"home"}));
  assert.deepEqual(await publishedSite(f.fetcher),f.current);
  assert.ok(f.requests.every(r=>r.url!==SITE_URL+'/'),'Deployment identity must come from our public Manifest, not framework HTML');
  delete f.current.manifest.deploymentId;
  await assert.rejects(publishedSite(f.fetcher),/deployment identity/);
  f.current.manifest.deploymentId=input.id;
  f.current.manifest.projectId="wrong";
  await assert.rejects(publishedSite(f.fetcher),/production project/);
  await assert.rejects(publishedSite(async()=>new Response("login",{status:403})),/unavailable/);
  assert.ok(f.requests.every(r=>!r.options.headers?.Authorization && !r.options.headers?.["x-vercel-protection-bypass"]));
});

test("only added, edited and retired URLs are notified; duplicate events do nothing",async()=>{
  const old=make({"/":"home","/keep":"keep","/old":"old"});
  const current=make({"/":"edited","/keep":"keep","/new":"new"},old,after);
  const f=fixture(current,{deleted:[SITE_URL+"/old"]});
  const result=await deliver({...f,previous:receipt(old)});
  assert.deepEqual(f.sent[0].urlList,[SITE_URL+"/",SITE_URL+"/new",SITE_URL+"/old"]);
  assert.deepEqual([result.added,result.updated,result.deleted,result.unchanged],[1,1,1,1]);
  assert.equal(result.receipt.deploymentId,input.id);
  const again=await deliver({...f,previous:result.receipt});
  assert.match(again.skipped,/already notified/);assert.equal(f.sent.length,1);
  assert.ok(f.requests.every(r=>!r.options.headers?.Authorization));
});

test("failed notifications retain the prior receipt and retry pending changes next time",async()=>{
  const old=make({"/":"home","/retired":"old"});
  const changed=make({"/":"edited"},old,after);
  const previous=receipt(old), snapshot=JSON.stringify(previous);
  const failed=fixture(changed,{statuses:[422],deleted:[SITE_URL+"/retired"]});
  await assert.rejects(deliver({...failed,previous}),/422/);
  assert.equal(JSON.stringify(previous),snapshot);
  const next=make({"/":"edited","/new":"new"},changed,"2026-10-20T00:00:00.000Z");
  const retry=fixture(next,{deleted:[SITE_URL+"/retired"]});
  const result=await deliver({...retry,previous});
  assert.equal(result.updated,1);assert.equal(result.deleted,1);assert.equal(result.added,1);
  assert.deepEqual(retry.sent[0].urlList,[SITE_URL+"/",SITE_URL+"/new",SITE_URL+"/retired"]);
});

test("bootstrap includes known deletions; content changes in a newer deployment still compare to the successful receipt",async()=>{
  const first=make({"/":"a"});first.deletedUrls=[SITE_URL+"/retired"];
  const f=fixture(first,{deleted:first.deletedUrls});
  assert.equal((await deliver(f)).deleted,1);
  const changed=make({"/":"b"},first,after);
  const reverted=make({"/":"a"},changed,"2026-10-20T00:00:00.000Z");
  assert.deepEqual(submissionUrls(first,reverted).diff.updated,[SITE_URL+"/"]);
  const stale=fixture(first);
  await assert.rejects(deliver({...stale,previous:receipt(changed)}),/backward/);
  assert.equal(stale.sent.length,0);
});

test("a new page accepted without a saved receipt is still notified when the next deployment deletes it",async()=>{
  const first=make({'/':'home'});
  const added=make({'/':'home','/temporary':'new'},first,after);
  const unconfirmed=fixture(added,{changeAt:3});
  const interrupted=await deliver({...unconfirmed,previous:receipt(first)});
  assert.ok(interrupted.skipped);assert.equal(interrupted.receipt,undefined);
  assert.deepEqual(unconfirmed.sent[0].urlList,[SITE_URL+'/temporary']);
  const removed=make({'/':'home'},added,'2026-10-20T00:00:00.000Z');
  const retired=SITE_URL+'/temporary';
  assert.equal(removed.deletedAt[retired],removed.generatedAt);
  const retry=fixture(removed,{deleted:[retired]});
  const accepted=await deliver({...retry,previous:receipt(first)});
  assert.equal(accepted.deleted,1);assert.equal(accepted.added,0);
  assert.deepEqual(retry.sent[0].urlList,[retired]);
  const unchanged=make({'/':'home'},removed,'2026-10-21T00:00:00.000Z');
  assert.deepEqual(unchanged.entries,removed.entries);
  assert.deepEqual(unchanged.deletedAt,removed.deletedAt);
  const later=fixture(unchanged,{deleted:[retired]});
  await deliver({...later,previous:accepted.receipt});assert.equal(later.sent.length,0);
});

test("restoring and deleting an acknowledged URL creates a fresh deletion event",async()=>{
  const url=SITE_URL+'/temporary';
  const active=make({'/':'home','/temporary':'new'});
  const retired=make({'/':'home'},active,after);
  const acknowledged=receipt(retired);
  const restored=make({'/':'home','/temporary':'new'},retired,'2026-10-20T00:00:00.000Z');
  assert.equal(restored.deletedUrls.includes(url),false);assert.equal(restored.deletedAt[url],undefined);
  const retiredAgain=make({'/':'home'},restored,'2026-10-21T00:00:00.000Z');
  assert.ok(retiredAgain.deletedAt[url]>retired.deletedAt[url]);
  const f=fixture(retiredAgain,{deleted:[url]});
  assert.equal((await deliver({...f,previous:acknowledged})).deleted,1);
  assert.deepEqual(f.sent[0].urlList,[url]);
});

test("legacy deletion records migrate without refreshing dates or re-notifying acknowledged removals",()=>{
  const retired=SITE_URL+'/retired';
  const legacy=make({'/':'home'});legacy.deletedUrls=[retired];delete legacy.deletedAt;
  const migrated=make({'/':'home'},legacy,after);
  assert.deepEqual(migrated.entries,legacy.entries);
  assert.equal(migrated.deletedAt[retired],legacy.generatedAt);
  assert.deepEqual(submissionUrls(legacy,migrated).urls,[]);
  assert.throws(()=>assertManifest({...migrated,deletedUrls:['https://other.test/retired']}),/retired/);
  assert.throws(()=>assertManifest({...migrated,deletedAt:{[retired]:'2099-01-01T00:00:00.000Z'}}),/event time/);
});

test("retired pages must really be deleted, redirected or explicitly noindex",async()=>{
  const old=make({"/":"home","/retired":"old"});
  const current=make({"/":"home"},old,after),previous=receipt(old);
  const wrong=fixture(current);
  await assert.rejects(deliver({...wrong,previous}),/indexing policy/);assert.equal(wrong.sent.length,0);
  const redirected=fixture(current,{pageStatus:{[SITE_URL+"/retired"]:{status:308,headers:{location:SITE_URL+"/"}}}});
  assert.equal((await deliver({...redirected,previous})).deleted,1);
  const hidden=buildManifest(old,{"/":"home","/retired":"old"},routes(["/","/retired"]).map(r=>({...r,indexable:r.path!=="/retired"})),after);
  const noindex=fixture(hidden,{pageStatus:{[SITE_URL+"/retired"]:{status:200,html:'<meta name="robots" content="noindex">'}}});
  assert.equal((await deliver({...noindex,previous})).deleted,1);
});

test("a superseded or preview deployment never advances the notification receipt",async()=>{
  const manifest=make({"/":"home"});
  const old=fixture(manifest);const stale={...old.current,id:"dpl_old"};
  assert.ok((await deliver({...old,current:stale})).skipped);assert.equal(old.sent.length,0);
  const beforePost=fixture(manifest,{changeAt:2});
  assert.ok((await deliver(beforePost)).skipped);assert.equal(beforePost.sent.length,0);
  const afterPost=fixture(manifest,{changeAt:3});
  const result=await deliver(afterPost);assert.ok(result.skipped);assert.equal(result.receipt,undefined);
  const hidden=fixture(make({"/":"home"},null,before,false));
  assert.ok((await deliver(hidden)).skipped);assert.equal(hidden.sent.length,0);
});

test("10,001 URLs use two batches; 429 retry is bounded; partial failure never completes",async()=>{
  const urls=Array.from({length:10001},(_,i)=>`${SITE_URL}/p/${i}`),sizes=[];
  assert.equal(await submitBatches(urls,key,{fetcher:async(url,options)=>{sizes.push(JSON.parse(options.body).urlList.length);return new Response("",{status:202});}}),2);
  assert.deepEqual(sizes,[10000,1]);
  let count=0;
  await assert.rejects(submitBatches(urls,key,{fetcher:async()=>new Response("",{status:++count===1?200:500})}),/batch 2/);
  count=0;
  await assert.rejects(submitBatches(urls.slice(0,1),key,{fetcher:async()=>{count++;return new Response("",{status:429});},sleep:async()=>{}}),/429/);
  assert.equal(count,4);
});

test("receipt history only uses unexpired artifacts from successful runs of this workflow",async()=>{
  const artifacts=[
    {name:RECEIPT_PREFIX+"-5-1",expired:true,workflow_run:{id:5}},
    {name:"another-project-4-1",workflow_run:{id:4}},
    {name:RECEIPT_PREFIX+"-3-1",workflow_run:{id:3}},
    {name:RECEIPT_PREFIX+"-2-1",workflow_run:{id:2}},
  ];
  const requests=[];
  const fetcher=async(url,options)=>{
    assert.ok(url.startsWith(`https://api.github.com/repos/${REPOSITORY}/`));
    assert.equal(options.headers.Authorization,"Bearer built-in-token");requests.push(url);
    if(url.includes("/actions/artifacts?"))return json({artifacts});
    return json({path:'.github/workflows/indexnow.yml',head_branch:'main',status:'completed',conclusion:url.includes('/3/')?'failure':'success',event:'repository_dispatch'});
  };
  assert.deepEqual(await latestReceipt("built-in-token",fetcher),{name:RECEIPT_PREFIX+"-2-1",runId:"2"});
  assert.equal(requests.length,3);
  const unordered=[
    {id:2,name:RECEIPT_PREFIX+'-2-1',created_at:'2026-10-17T00:00:00Z',workflow_run:{id:2}},
    {id:7,name:RECEIPT_PREFIX+'-7-1',created_at:'2026-10-19T00:00:00Z',workflow_run:{id:7}},
  ];
  const newest=await latestReceipt('built-in-token',async url=>url.includes('/actions/artifacts?')?json({artifacts:unordered}):json({path:'.github/workflows/indexnow.yml',head_branch:'main',status:'completed',conclusion:'success',event:'repository_dispatch'}));
  assert.equal(newest.runId,'7','API ordering must not cause an older receipt to be selected');
  assert.equal(await latestReceipt("built-in-token",async()=>json({artifacts:[]})),null);
  await assert.rejects(latestReceipt("built-in-token",async()=>new Response("",{status:403})),/history/);
});

test("prepare stages published data only; expired or absent history bootstraps without custom configuration",async()=>{
  const root=path.resolve('.cache');fs.mkdirSync(root,{recursive:true});
  const dir=fs.mkdtempSync(path.join(root,'indexnow-test-'));
  try{
    const eventPath=path.join(dir,'event.json');fs.writeFileSync(eventPath,JSON.stringify(event()));
    const env={GITHUB_EVENT_PATH:eventPath,GITHUB_EVENT_NAME:'repository_dispatch',GH_TOKEN:'built-in-token',GITHUB_RUN_ID:'123',GITHUB_RUN_ATTEMPT:'1',INDEXNOW_DIR:dir};
    const f=fixture(make({"/":"home"}));
    const result=await prepare({env,fetcher:f.fetcher});
    assert.equal(result.eligible,true);assert.equal(result.previous_artifact,undefined);
    assert.equal(result.receipt_name,RECEIPT_PREFIX+'-123-1');
    assert.deepEqual(JSON.parse(fs.readFileSync(path.join(dir,'current.json'))),f.current);
    assert.equal(fs.existsSync(path.join(dir,'receipt.json')),false);assert.equal(f.sent.length,0);
    fs.writeFileSync(eventPath,JSON.stringify(event({environment:'preview'})));
    assert.deepEqual(await prepare({env,fetcher:async()=>{throw new Error('Preview must not make requests');}}),{eligible:false});
    fs.writeFileSync(eventPath,JSON.stringify(event({git:{sha:'b'.repeat(40)}})));
    assert.deepEqual(await prepare({env,fetcher:f.fetcher}),{eligible:false});
  }finally{assert.ok(path.resolve(dir).startsWith(root+path.sep));fs.rmSync(dir,{recursive:true,force:true});}
});

test("workflow has one serialized job, only built-in permissions and no user-managed secrets",()=>{
  const text=fs.readFileSync('.github/workflows/indexnow.yml','utf8');
  const workflow=createRequire(import.meta.url)('js-yaml').load(text);
  assert.deepEqual(workflow.on.repository_dispatch.types,['vercel.deployment.success','vercel.deployment.promoted']);
  assert.equal(workflow.on.push,undefined);assert.equal(workflow.on.pull_request,undefined);
  assert.equal(workflow.permissions.contents,'read');assert.equal(workflow.permissions.actions,'read');
  assert.equal(Object.keys(workflow.jobs).length,1);assert.equal(workflow.concurrency['cancel-in-progress'],false);
  // runner is not an allowed context in jobs.<job_id>.env.
  assert.equal(workflow.jobs.notify.env.INDEXNOW_DIR,'${{ github.workspace }}/.cache/indexnow');
  assert.ok(!text.includes('secrets.'));assert.ok(!text.includes('VERCEL_READ_TOKEN'));assert.ok(!text.includes('UPSTASH_'));
  const steps=workflow.jobs.notify.steps;
  for(const step of steps.filter(s=>s.uses))assert.match(step.uses,/@[a-f0-9]{40}$/);
  assert.equal(steps[0].with.ref,'${{ github.workflow_sha }}');
  assert.equal(steps.at(-1).if,"steps.submit.outputs.save == 'true'");assert.equal(steps.at(-1).with['retention-days'],90);
});

test("build verification accepts local and platform adapter prerenders but rejects missing pages",()=>{
  const root=path.resolve('.cache');fs.mkdirSync(root,{recursive:true});
  const script=path.resolve('scripts/seo/verify-output.mjs');
  for(const adapter of [false,true]){
    const dir=fs.mkdtempSync(path.join(root,'verify-output-'));
    try{
      const write=(file,text)=>{const target=path.join(dir,file);fs.mkdirSync(path.dirname(target),{recursive:true});fs.writeFileSync(target,text);return target;};
      const manifest=make({'/':'home','/guides':'guides'});
      write('public/.well-known/seo-url-manifest.json',JSON.stringify(manifest));
      write('src/data/seo/indexnow.json',JSON.stringify({key}));write(`public/${key}.txt`,key);
      const pageRoot=adapter?'.next/server/route-cache/APP_PAGE/hash/$':'.next/server/app';
      write(pageRoot+'/index.html','<html><h1>Home</h1></html>');
      const guide=write(pageRoot+'/guides.html','<html><h1>Guides</h1></html>');
      const sitemapRoot=adapter?'.next/server/route-cache/APP_ROUTE/hash/$':'.next/server/app';
      write(sitemapRoot+'/sitemap.xml.body',sitemapParts(manifest).xml);
      assert.match(execFileSync(process.execPath,[script],{cwd:dir,encoding:'utf8'}),/PASS: 2 published pages/);
      fs.unlinkSync(guide);
      assert.throws(()=>execFileSync(process.execPath,[script],{cwd:dir,stdio:'pipe'}),/Command failed/);
    }finally{assert.ok(path.resolve(dir).startsWith(root+path.sep));fs.rmSync(dir,{recursive:true,force:true});}
  }
});

test("public local Manifest and verification key contain no private data",()=>{
  const manifest=JSON.parse(fs.readFileSync("public/.well-known/seo-url-manifest.json","utf8"));
  assert.equal(manifest.fingerprintVersion,FINGERPRINT_VERSION);assert.equal(manifest.entries.length,21);
  assert.ok(!manifest.entries.some(e=>/\/(builds|sources|tools|wiki)(\/|$)/.test(e.path)));
  assert.equal(fs.readFileSync(`public/${key}.txt`,"utf8").trim(),key);
});
