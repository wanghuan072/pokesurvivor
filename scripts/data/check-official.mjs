import fs from "node:fs";
import crypto from "node:crypto";
import path from "node:path";
import { fileURLToPath } from "node:url";

// Explicit, read-only maintenance check. Never run network checks during builds.
export async function checkOfficial(review, fetcher=fetch) {
  const get=async url=>{
    const response=await fetcher(url,{redirect:"error",cache:"no-store",signal:AbortSignal.timeout(20000)});
    if(!response.ok)throw new Error(`Official version check: HTTP ${response.status}`);
    return response;
  };
  const current=await (await get("https://pokesurvivor.com/version.json")).json();
  if(current.v!==review.liveBuild.v)return {current:current.v,reviewed:review.liveBuild.v,changed:true};
  const bytes=await (await get("https://pokesurvivor.com/js/app.min.js")).arrayBuffer();
  const hash=crypto.createHash("sha256").update(Buffer.from(bytes)).digest("hex");
  return {current:current.v,reviewed:review.liveBuild.v,changed:hash!==review.bundleSha256};
}
if(process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url)){
  const result=await checkOfficial(JSON.parse(fs.readFileSync("src/data/guides/review.json","utf8")));
  console.log(JSON.stringify(result));
  if(result.changed){console.error("The live game differs from the checked mechanics. Review its changes before updating data or marking guides reviewed.");process.exitCode=1;}
}
