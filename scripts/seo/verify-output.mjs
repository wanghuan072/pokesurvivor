import fs from "node:fs";
import path from "node:path";
import assert from "node:assert/strict";
import { assertManifest } from "./manifest-contract.mjs";
import { sitemapParts } from "./sitemap-xml.mjs";

const read=file=>JSON.parse(fs.readFileSync(file,"utf8"));
const manifest=read("public/.well-known/seo-url-manifest.json");assertManifest(manifest);
const routes=new Set(manifest.entries.map(e=>e.path));
const redirectRoutes=new Set(["/moves","/evolutions","/about","/contact","/privacy-policy"]);
const seen=new Set();
function walk(directory) {
  for(const item of fs.readdirSync(directory,{withFileTypes:true})) {
    const file=path.join(directory,item.name);
    if(item.isDirectory()){walk(file);continue;}
    if(!file.endsWith(".html") || file.includes("["))continue;
    const route="/"+path.relative(".next/server/app",file).replaceAll("\\","/").replace(/\.html$/,"").replace(/^index$/,"");
    if(route.startsWith("/_") || redirectRoutes.has(route))continue;
    const html=fs.readFileSync(file,"utf8");
    if(!routes.has(route) && /name="robots" content="[^"]*noindex/.test(html))continue;
    assert.ok(routes.has(route),`Unregistered built page: ${route}. Add its SEO metadata and template mapping.`);seen.add(route);
  }
}
walk(".next/server/app");assert.deepEqual([...seen].sort(),[...routes].sort(),"Manifest and published routes differ");
const sitemap=sitemapParts(manifest);
assert.equal(fs.readFileSync(".next/server/app/sitemap.xml.body","utf8"),sitemap.xml);
for(const child of sitemap.children)assert.equal(fs.readFileSync(`public/sitemaps/${child.name}`,"utf8"),child.xml);
const key=read("src/data/seo/indexnow.json").key;
assert.match(key,/^[a-zA-Z0-9-]{8,128}$/);assert.equal(fs.readFileSync(`public/${key}.txt`,"utf8").trim(),key);
console.log(`PASS: ${routes.size} published pages match the Manifest; XML, stable dates, exclusions and public IndexNow key validated.`);
