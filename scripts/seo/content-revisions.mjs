import fs from "node:fs";
import { contentHashes } from "./content-inputs.mjs";
export function reconcile(previous, hashes, now) {
  return Object.fromEntries(Object.entries(hashes).map(([url,hash])=>[url, previous[url]?.hash === hash ? previous[url] : { hash, lastModified: now }]));
}
if (process.argv[1]?.endsWith("content-revisions.mjs")) {
  const file = "src/data/seo/page-revisions.json";
  const previous = fs.existsSync(file) ? JSON.parse(fs.readFileSync(file,"utf8")) : {};
  const hashes = contentHashes();
  const next = reconcile(previous, hashes, new Date().toISOString());
  const changed = Object.keys(next).filter(url=>previous[url]?.hash!==next[url].hash);
  const removed = Object.keys(previous).filter(url=>!next[url]);
  if (changed.length || removed.length) {
    if (!process.argv.includes("--write")) {
      console.error(`Content revisions need syncing: ${changed.join(", ")}${removed.length ? "; removed: " + removed.join(", ") : ""}. Run npm run content:sync and keep the updated manifest with your content.`);
      process.exitCode = 1;
    } else {
      fs.writeFileSync(file,JSON.stringify(next,null,2)+"\n");
      console.log(`Updated ${changed.length} page dates; removed ${removed.length} retired entries.`);
    }
  } else console.log(`PASS: ${Object.keys(hashes).length} page dates unchanged and in sync.`);
}
