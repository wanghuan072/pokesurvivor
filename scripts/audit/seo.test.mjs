import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { tdk } from "../../src/seo/tdk.js";
import { contentHashes } from "../seo/content-inputs.mjs";
import { reconcile } from "../seo/content-revisions.mjs";
const read = file => JSON.parse(fs.readFileSync(file,"utf8"));
const guides = read("src/data/guides/guides.json"), faq = read("src/data/guides/faq.json");
const all = {...tdk,...Object.fromEntries(guides.map(g=>[`/guides/${g.slug}`,g.seo])),"/guides/faq":faq.seo};
const decode = text => text.replace(/&(?:amp|quot|apos|lt|gt|#x27|#39);/g,e=>({"&amp;":"&","&quot;":'"',"&apos;":"'","&#x27;":"'","&#39;":"'","&lt;":"<","&gt;":">"}[e]));
test("all published HTML has unique exact metadata, canonical and visible schema",()=>{
  const titles = new Set(), descriptions = new Set();
  assert.equal(Object.keys(all).length,21);
  const revisions = read("src/data/seo/page-revisions.json");
  const sitemap = fs.readFileSync(".next/server/app/sitemap.xml.body","utf8");
  for (const [route,seo] of Object.entries(all)) {
    const html = fs.readFileSync(`.next/server/app/${route === "/" ? "index" : route.slice(1)}.html`,"utf8");
    const title = decode(html.match(/<title>([^<]+)<\/title>/)[1]);
    const desc = decode(html.match(/<meta name="description" content="([^"]+)"/)[1]);
    assert.equal(title,seo.title,route);assert.equal(desc,seo.description,route);
    assert.ok(title.length>=40 && title.length<=60,`${route}: title ${title.length}`);
    assert.ok(desc.length>=140 && desc.length<=160,`${route}: description ${desc.length}`);
    assert.ok(/PokeSurvivor/i.test(title) && /PokeSurvivor/i.test(desc),route);
    assert.ok(!titles.has(title),`Duplicate title: ${route}`);assert.ok(!descriptions.has(desc),`Duplicate description: ${route}`);
    titles.add(title);descriptions.add(desc);
    const canonical = `https://pokesurvivor.me${route}`;
    assert.equal(new URL(html.match(/rel="canonical" href="([^"]+)"/)[1]).href, new URL(canonical).href, route);
    assert.ok(html.includes('property="og:image" content="https://pokesurvivor.me/images/og-image.png"'),route);
    assert.ok(html.includes('name="twitter:image" content="https://pokesurvivor.me/images/og-image.png"'),route);
    assert.ok(!html.includes('name="keywords"'),route);
    assert.ok(html.includes('href="/legal/contact-us"'),route);
    assert.ok(html.includes('Copyright © <!-- -->2026') || html.includes('Copyright © 2026'),route);
    const schemas = [...html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)].map(m=>JSON.parse(m[1]));
    const graph = schemas.flatMap(s=>s['@graph']??[s]);
    const page = graph.find(s=>s['@id']===canonical+'#webpage');
    assert.ok(page,`${route}: missing page schema`);
    assert.equal(page.dateModified,revisions[route].lastModified,route);
    assert.ok(sitemap.replace(/\s+</g, "<").includes(`<loc>${canonical}</loc><lastmod>${revisions[route].lastModified}</lastmod>`),route);
    assert.ok(!html.includes('PokeSurvivor Wiki editors'),route);
    if(process.env.AUDIT_EXPECT_INDEXABLE) {
      const expected=process.env.AUDIT_EXPECT_INDEXABLE==='true'?'index, follow':'noindex, follow';
      assert.ok(html.includes(`name="robots" content="${expected}"`),`${route}: incorrect indexing policy`);
    }
  }
  assert.equal((sitemap.match(/<url>/g)||[]).length,21);
  const png=fs.readFileSync("public/images/og-image.png");
  assert.equal(png.readUInt32BE(16),1200);assert.equal(png.readUInt32BE(20),630);
});
test("lastmod is stable, selective, and independent of footer year changes",()=>{
  const dir=fs.mkdtempSync(path.join(os.tmpdir(),'pokesurvivor-seo-'));
  try {
    fs.cpSync('src',path.join(dir,'src'),{recursive:true});
    fs.mkdirSync(path.join(dir,'public/images'),{recursive:true});
    fs.mkdirSync(path.join(dir,'public/credits'),{recursive:true});
    fs.copyFileSync('public/images/og-image.png',path.join(dir,'public/images/og-image.png'));
    fs.copyFileSync('public/credits/spritecollab-artists.md',path.join(dir,'public/credits/spritecollab-artists.md'));
    const base=contentHashes(dir), first=reconcile({},base,'2026-10-15T00:00:00.000Z');
    assert.deepEqual(reconcile(first,contentHashes(dir),'2026-10-16T00:00:00.000Z'),first);
    const templateFile=path.join(dir,'src/seo/PageSchema.tsx'), template=fs.readFileSync(templateFile,'utf8');
    fs.writeFileSync(templateFile,template.replace(/\r?\n/g,'\r\n'));
    assert.deepEqual(contentHashes(dir),base,'Windows checkout must preserve content fingerprints');
    fs.writeFileSync(templateFile,template.replace(/\r\n/g,'\n'));
    assert.deepEqual(contentHashes(dir),base,'Linux checkout must preserve content fingerprints');
    fs.writeFileSync(templateFile,template);
    const changedRoutes=(next)=>Object.keys(next).filter(url=>next[url]!==base[url]);
    const heroFile=path.join(dir,'src/data/site/pages.json'), heroes=read(heroFile);
    heroes['/types'].intro += ' Check the weather before choosing coverage.';
    fs.writeFileSync(heroFile,JSON.stringify(heroes));
    assert.deepEqual(changedRoutes(contentHashes(dir)),['/types']);
    fs.copyFileSync('src/data/site/pages.json',heroFile);
    const guideFile=path.join(dir,'src/data/guides/guides.json'), articles=read(guideFile);
    articles[0].sections[0].paragraphs[0]+=' Keep an exit route open.';
    fs.writeFileSync(guideFile,JSON.stringify(articles));
    assert.deepEqual(changedRoutes(contentHashes(dir)),['/guides/beginner-guide']);
    fs.copyFileSync('src/data/guides/guides.json',guideFile);
    const encounterFile=path.join(dir,'src/data/game/encounters.json'), encounters=read(encounterFile);
    encounters[0].hasShiny=!encounters[0].hasShiny;
    assert.ok(typeof encounters[0].hovering==='boolean');
    encounters[0].hovering=!encounters[0].hovering;
    fs.writeFileSync(encounterFile,JSON.stringify(encounters));
    assert.deepEqual(changedRoutes(contentHashes(dir)),['/pokedex']);
    fs.copyFileSync('src/data/game/encounters.json',encounterFile);
    const assetFile=path.join(dir,'src/data/game/assets.json'), assets=read(assetFile);
    assets.find(p=>p.id===6).shiny=null;
    fs.writeFileSync(assetFile,JSON.stringify(assets));
    assert.deepEqual(changedRoutes(contentHashes(dir)),['/gacha','/guides/gacha-and-tickets']);
    fs.copyFileSync('src/data/game/assets.json',assetFile);
    const pokemonFile=path.join(dir,'src/data/pokedex/pokemon.json'), partners=read(pokemonFile);
    partners[0].learnset=partners[0].learnset.filter(id=>id!=='tackle');
    fs.writeFileSync(pokemonFile,JSON.stringify(partners));
    assert.deepEqual(changedRoutes(contentHashes(dir)),['/level-up']);
    fs.copyFileSync('src/data/pokedex/pokemon.json',pokemonFile);
    const metadataFile=path.join(dir,'src/seo/metadata.ts');
    fs.writeFileSync(metadataFile,fs.readFileSync(metadataFile,'utf8').replace('locale: "en_US"','locale: "en_GB"'));
    assert.deepEqual(changedRoutes(contentHashes(dir)),Object.keys(base));
    fs.copyFileSync('src/seo/metadata.ts',metadataFile);
    const footer=path.join(dir,'src/components/layout/SiteFooter.tsx');
    fs.writeFileSync(footer,fs.readFileSync(footer,'utf8').replaceAll('2026','2027'));
    assert.deepEqual(changedRoutes(contentHashes(dir)),[]);
    const extended={...base,'/new-page':'new-hash'}, added=reconcile(first,extended,'2026-10-17T00:00:00.000Z');
    assert.equal(added['/new-page'].lastModified,'2026-10-17T00:00:00.000Z');
    assert.deepEqual(reconcile(added,base,'2026-10-18T00:00:00.000Z'),first);
  } finally { fs.rmSync(dir,{recursive:true,force:true}); }
});
test("width media queries use only 1024 and 768, preserving accessibility rules",()=>{
  function walk(dir){return fs.readdirSync(dir,{withFileTypes:true}).flatMap(e=>e.isDirectory()?walk(path.join(dir,e.name)):[path.join(dir,e.name)]);}
  for(const file of walk('src/style').filter(f=>f.endsWith('.css'))) {
    const css=fs.readFileSync(file,'utf8');
    for(const [,width] of css.matchAll(/@media[^{}]*(?:min|max)-width:\s*(\d+)px/g))assert.ok(['1024','768'].includes(width),file);
  }
  assert.match(fs.readFileSync('src/style/globals.css','utf8'),/prefers-reduced-motion/);
});
