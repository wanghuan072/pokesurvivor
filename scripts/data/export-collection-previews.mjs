// SpriteCollab sprites: CC BY-NC 4.0. Original game code: MIT (supplied archive).
// Collection positioning/timing: js/ui/ui.js; twinkle below: js/ui/icons.js.
// Full notices are retained in public/credits/pokesurvivor-license.txt.
import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import sharp from "sharp";
import ts from "typescript";
const root=process.argv[2];
if(!root)throw Error("Pass the supplied game source directory.");
const read=file=>JSON.parse(fs.readFileSync(file,"utf8"));
const sha=bytes=>crypto.createHash("sha256").update(bytes).digest("hex");
const meta=read("src/data/game/sprite-metadata.json");

// Verbatim from the supplied game's G.Icons.twinkle. No replacement star design.
function twinkle(ctx, x, y, phase, px = 2) {
    const st = phase < 0.15 ? 0 : phase < 0.32 ? 1 : phase < 0.62 ? 2 : phase < 0.82 ? 1 : 0;
    const X = Math.round(x / px) * px, Y = Math.round(y / px) * px;
    const dot = (dx, dy, c) => { ctx.fillStyle = c; ctx.fillRect(X + dx * px, Y + dy * px, px, px); };
    const ARM = '#fff3a8', TIP = '#9ae6ff';
    dot(0, 0, '#ffffff');
    if (st >= 1) for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) dot(dx, dy, ARM);
    if (st >= 2) {
      for (const [dx, dy] of [[2, 0], [-2, 0], [0, 2], [0, -2]]) dot(dx, dy, ARM);
      for (const [dx, dy] of [[3, 0], [-3, 0], [0, 3], [0, -3]]) dot(dx, dy, TIP);
      for (const [dx, dy] of [[1, 1], [-1, 1], [1, -1], [-1, -1]]) dot(dx, dy, TIP);
    }
}
const iconFile=path.join(root,"js/ui/icons.js");
const ast=ts.createSourceFile(iconFile,fs.readFileSync(iconFile,"utf8"),ts.ScriptTarget.Latest,true);
let original;
function find(n){if(ts.isFunctionDeclaration(n)&&n.name?.text==="twinkle")original=n.getText(ast);ts.forEachChild(n,find);}
find(ast);
if(original?.replace(/\s/g,"")!==twinkle.toString().replace(/\s/g,""))throw Error("Original twinkle changed: review before exporting.");
const output="public/game/collection";fs.mkdirSync(output,{recursive:true});
const selected=process.argv.slice(3).map(Number);
if(selected.some(id=>!Number.isInteger(id)||id<=0))throw Error("Optional species IDs must be positive integers.");
const records=selected.length?read("src/data/game/collection-previews.json").previews.filter(p=>!selected.includes(p.id)):[];
const S=96,N=120,dt=1/30;
const roster=read("src/data/pokedex/pokemon.json");
for(const {id} of roster)for(const shiny of [false,true]){
  if(selected.length&&!selected.includes(id))continue;
  if(shiny&&!meta[id].sh)continue;
  const m=meta[id],folder=`assets/pokemon/${id}/${shiny?"s/":""}`;
  const idle=shiny?(m.sa?.Idle??m.a.Idle):m.a.Idle;
  const walk=shiny?(m.sa?.Walk??m.a.Walk):m.a.Walk;
  // A few species have a single-frame Idle; use their real Walk cycle instead.
  let name=fs.existsSync(path.join(root,folder,"Idle.png"))&&!(idle.n<2&&walk?.n>1&&fs.existsSync(path.join(root,folder,"Walk.png")))?"Idle":"Walk";
  // Some multi-frame Idle sheets repeat the same pixels. Their real Walk
  // animation is the honest moving preview, rather than inventing motion.
  if(name==="Idle"&&walk?.n>1&&fs.existsSync(path.join(root,folder,"Walk.png"))){
    const geometry=shiny?(m.sa?.Idle??m.a.Idle):m.a.Idle;
    const sheet=fs.readFileSync(path.join(root,folder,"Idle.png"));
    const raw=[];for(let i=0;i<geometry.n;i++)raw.push(await sharp(sheet).extract({left:i*geometry.w,top:0,width:geometry.w,height:geometry.h}).raw().toBuffer());
    if(raw.every(frame=>frame.equals(raw[0])))name="Walk";
  }
  const g=shiny?(m.sa?.[name]??m.a[name]):m.a[name];
  const source=folder+name+".png",bytes=fs.readFileSync(path.join(root,source));
  // Original collection UI's scale=2, hero=true, front-facing geometry.
  const k=Math.max(1,Math.min(2,Math.floor(S*0.8/g.ay)));
  const fx=S/2,fy=g.ay*k>S*0.8?S/2+g.ay*k*0.45:S*0.88;
  const left=Math.round(fx-g.ax*k),top=Math.round(fy-g.ay*k);
  const frames=[];
  for(let i=0;i<g.n;i++)frames.push(await sharp(bytes).extract({left:i*g.w,top:0,width:g.w,height:g.h}).resize(g.w*k,g.h*k,{kernel:"nearest"}).ensureAlpha().raw().toBuffer());
  let seed=id*31+(shiny?1:0),frame=0,time=0,sparkT=0;
  const rand=(a,b)=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return a+(seed/4294967296)*(b-a);};
  const stars=[],exported=[];
  for(let n=-30;n<N;n++){
    time+=dt*60;while(time>=g.d[frame]){time-=g.d[frame];frame=(frame+1)%g.n;}
    const raw=Buffer.alloc(S*S*4),sprite=frames[frame];
    for(let y=Math.max(0,-top);y<Math.min(g.h*k,S-top);y++){
      const x=Math.max(0,-left),width=Math.min(g.w*k-x,S-Math.max(0,left));
      if(width>0)sprite.copy(raw,((top+y)*S+Math.max(0,left))*4,(y*g.w*k+x)*4,(y*g.w*k+x+width)*4);
    }
    if(shiny){
      // Original UI spawn ranges, frequency, maximum and lifetime; fixed seed only
      // makes the exported random sequence repeatable, not a new effect.
      sparkT-=dt;
      if(sparkT<=0&&stars.length<4){sparkT=rand(0.18,0.45);stars.push({x:fx+rand(-0.32,0.32)*S,y:rand(0.12,0.7)*S,t:0,life:rand(0.5,0.8)});}
      const ctx={fillStyle:"",fillRect(x,y,w,h){const color=this.fillStyle;for(let Y=y;Y<y+h;Y++)for(let X=x;X<x+w;X++){if(X<0||Y<0||X>=S||Y>=S)continue;const p=(Y*S+X)*4;for(let c=0;c<3;c++)raw[p+c]=parseInt(color.slice(1+c*2,3+c*2),16);raw[p+3]=255;}}};
      for(let i=stars.length-1;i>=0;i--){const w=stars[i];w.t+=dt;if(w.t>=w.life){stars.splice(i,1);continue;}twinkle(ctx,w.x,w.y,w.t/w.life,Math.max(2,k));}
    }
    if(n>=0)exported.push(raw);
  }
  const stem=`${id}-${shiny?"shiny":"normal"}`,src=`/game/collection/${stem}.webp`,still=`/game/collection/${stem}-still.webp`;
  await sharp(Buffer.concat(exported),{raw:{width:S,height:S*N,channels:4,pageHeight:S}}).webp({lossless:true,loop:0,delay:Array.from({length:N},(_,i)=>i%3===2?34:33)}).toFile("public"+src);
  await sharp(exported[0],{raw:{width:S,height:S,channels:4}}).webp({lossless:true}).toFile("public"+still);
  records.push({id,shiny,src,still,animation:name,frames:N,durationMs:4000,source,sourceSha256:sha(bytes),sha256:sha(fs.readFileSync("public"+src)),stillSha256:sha(fs.readFileSync("public"+still))});
  if(records.length%100===0)console.log(`Exported ${records.length} collection variants...`);
}
records.sort((a,b)=>a.id-b.id||Number(a.shiny)-Number(b.shiny));
fs.writeFileSync("src/data/game/collection-previews.json",JSON.stringify({archiveVersion:read(path.join(root,"version.json")),effectFiles:["js/ui/ui.js","js/ui/icons.js","js/core/sprites.js"].map(file=>({file,sha256:sha(fs.readFileSync(path.join(root,file)))})),method:"Original front-facing Idle sheets (Walk for missing or visually static Idle) and original collection twinkle function/timing; repeatable offline render, no invented sparkle overlay.",previews:records},null,2)+"\n");
fs.writeFileSync("src/data/game/collection-preview-index.json",JSON.stringify({normal:records.filter(p=>!p.shiny).map(p=>p.id),shiny:records.filter(p=>p.shiny).map(p=>p.id)})+"\n");
console.log(`Exported ${records.length} original-game collection previews with motion-reduced stills.`);
