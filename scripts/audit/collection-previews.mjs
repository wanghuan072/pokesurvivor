import fs from "node:fs";
import assert from "node:assert/strict";
import crypto from "node:crypto";
import sharp from "sharp";
const data=JSON.parse(fs.readFileSync("src/data/game/collection-previews.json","utf8"));
const roster=JSON.parse(fs.readFileSync("src/data/pokedex/pokemon.json","utf8"));
const assets=JSON.parse(fs.readFileSync("src/data/game/assets.json","utf8"));
const index=JSON.parse(fs.readFileSync("src/data/game/collection-preview-index.json","utf8"));
assert.deepEqual(index.normal,roster.map(p=>p.id));
assert.deepEqual(index.shiny,assets.filter(p=>p.shiny).map(p=>p.id));
assert.equal(data.previews.length,index.normal.length+index.shiny.length);
for(const preview of data.previews){
  const file="public"+preview.src,still="public"+preview.still;
  const metadata=await sharp(file,{animated:true}).metadata();
  assert.equal(metadata.width,96);assert.equal(metadata.pageHeight,96);
  assert.ok(metadata.pages>1,preview.src);
  assert.equal(metadata.delay.reduce((a,b)=>a+b,0),preview.durationMs);
  for(const [path,hash] of [[file,preview.sha256],[still,preview.stillSha256]]){
    assert.equal(crypto.createHash("sha256").update(fs.readFileSync(path)).digest("hex"),hash,path);
  }
  const first=await sharp(file).ensureAlpha().raw().toBuffer();
  let changed=false;
  for(let page=1;page<metadata.pages&&!changed;page++)changed=!first.equals(await sharp(file,{page}).ensureAlpha().raw().toBuffer());
  assert.ok(changed,`${preview.src}: animation must contain different rendered frames`);
  if(preview.shiny){
    let tips=0;
    for(let page=0;page<metadata.pages&&!tips;page++){
      const frame=await sharp(file,{page}).ensureAlpha().raw().toBuffer();
      for(let i=0;i<frame.length;i+=4)if(frame[i]===154&&frame[i+1]===230&&frame[i+2]===255&&frame[i+3]===255)tips++;
    }
    assert.ok(tips>0,`${preview.src}: original light-blue twinkle tips missing`);
  }
}
console.log(`PASS: ${index.normal.length} normal + ${index.shiny.length} shiny animated collection previews, original twinkle colors, distinct frames, 4-second loops, hashes and reduced-motion stills.`);
