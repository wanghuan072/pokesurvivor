import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { contentHashes } from "./content-inputs.mjs";
import { discoverRoutes, SITE_URL } from "./routes.mjs";
import { assertManifest } from "./manifest-contract.mjs";
import { buildManifest, fingerprint, MANIFEST_PATH } from "./manifest.mjs";
import { sitemapParts } from "./sitemap-xml.mjs";
import { PROJECT_ID } from "./config.mjs";

const read = file => JSON.parse(fs.readFileSync(file,"utf8"));
const output = path.join("public",MANIFEST_PATH);
async function get(url,fetcher) {
  const response = await fetcher(url,{redirect:"error",signal:AbortSignal.timeout(12000),cache:"no-store"});
  if (response.status === 404) return null;
  if (!response.ok) throw new Error(`Cannot read production SEO baseline: HTTP ${response.status}`);
  return response;
}
export async function productionBaseline(seed, fetcher = fetch) {
  const response = await get(SITE_URL+MANIFEST_PATH,fetcher);
  if (response) {
    if (!response.headers.get("content-type")?.includes("application/json")) throw new Error("Production Manifest is not JSON (check deployment protection)");
    const previous = await response.json();
    assertManifest(previous,"production baseline");
    if (previous.siteUrl !== SITE_URL) throw new Error("Production baseline host mismatch");
    return previous;
  }
  // One-time migration only: preserve the dates verified against the deployed site.
  const sitemap = await get(SITE_URL+"/sitemap.xml",fetcher);
  if (!sitemap) throw new Error("Existing production sitemap is unavailable; refusing to reset dates");
  const xml = await sitemap.text();
  const live = new Map([...xml.matchAll(/<loc>(.*?)<\/loc>\s*<lastmod>(.*?)<\/lastmod>/g)].map(m=>[m[1],m[2]]));
  if (live.size !== seed.manifest.entries.length || seed.manifest.entries.some(e=>live.get(e.canonicalUrl)!==e.lastModified)) throw new Error("Production dates differ from the migration baseline; refresh the verified migration first");
  const home = await get(SITE_URL+"/",fetcher);
  if (!home || !(await home.text()).includes(`data-dpl-id="${seed.verifiedDeploymentId}"`)) throw new Error("Production deployment changed before SEO migration; re-audit the migration baseline");
  console.log("SEO migration: preserved verified production dates (first Manifest deployment).");
  return {...seed.manifest,deletedUrls:seed.deletedUrls};
}
export async function prepareManifest({check=false,env=process.env,fetcher=fetch}={}) {
  const seed=read("src/data/seo/migration-baseline.json");
  const production=env.VERCEL_ENV === "production";
  const indexable=env.SITE_INDEXABLE === "true" && env.VERCEL_ENV !== "preview";
  if (production && (!/^[a-f0-9]{40}$/.test(env.VERCEL_GIT_COMMIT_SHA ?? "") || !/^dpl_[A-Za-z0-9]+$/.test(env.VERCEL_DEPLOYMENT_ID ?? ""))) throw new Error("Vercel system variables are missing. Enable automatic system variables; no custom token or Secret is needed.");
  const hashes=contentHashes(),routes=discoverRoutes();
  if (check) {
    if (!fs.existsSync(output)) throw new Error("SEO Manifest missing. Run npm run content:sync or npm run build.");
    const manifest=read(output);assertManifest(manifest);
    if (manifest.entries.length !== routes.length || routes.some(r=>!manifest.entries.some(e=>e.path===r.path && e.indexable===(indexable&&r.indexable) && e.contentFingerprint===fingerprint(hashes[r.path],r.indexable)))) throw new Error("SEO content changed. Run npm run content:sync or npm run build.");
    console.log(`PASS: ${routes.length} page dates and fingerprints in sync.`);return manifest;
  }
  let previous;
  if (production) previous=await productionBaseline(seed,fetcher);
  else previous=fs.existsSync(output)?read(output):{...seed.manifest,deletedUrls:seed.deletedUrls};
  previous={...previous,deletedUrls:[...new Set([...(previous.deletedUrls??[]),...seed.deletedUrls])]};
  const now=new Date().toISOString();
  const manifest=buildManifest(previous,hashes,routes,now,indexable);
  manifest.projectId=PROJECT_ID;
  manifest.environment=env.VERCEL_ENV ?? "development";
  if (/^[a-f0-9]{40}$/.test(env.VERCEL_GIT_COMMIT_SHA ?? "")) manifest.gitSha=env.VERCEL_GIT_COMMIT_SHA;
  if (/^dpl_[A-Za-z0-9]+$/.test(env.VERCEL_DEPLOYMENT_ID ?? "")) manifest.deploymentId=env.VERCEL_DEPLOYMENT_ID;
  fs.mkdirSync(path.dirname(output),{recursive:true});fs.writeFileSync(output,JSON.stringify(manifest,null,2)+"\n");
  const sitemap=sitemapParts(manifest);fs.writeFileSync("src/app/sitemap.xml",sitemap.xml);
  fs.mkdirSync("public/sitemaps",{recursive:true});
  for(const name of fs.readdirSync("public/sitemaps"))if(/^\d+\.xml$/.test(name))fs.unlinkSync(path.join("public/sitemaps",name));
  for(const child of sitemap.children)fs.writeFileSync(path.join("public/sitemaps",child.name),child.xml);
  const changed=manifest.entries.filter(e=>previous.entries.find(p=>p.canonicalUrl===e.canonicalUrl)?.contentFingerprint!==e.contentFingerprint).length;
  console.log(`SEO Manifest: ${routes.length} pages, ${changed} changed, ${manifest.entries.filter(e=>e.indexable).length} indexable. No search-engine requests sent.`);
  return manifest;
}
if (process.argv[1] && path.resolve(process.argv[1])===fileURLToPath(import.meta.url)) await prepareManifest({check:process.argv.includes("--check")});
