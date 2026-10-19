import fs from "node:fs";
import path from "node:path";
import vm from "node:vm";
import ts from "typescript";

// Evaluate this repository's pure metadata helper with public production inputs.
// No real process environment, credentials, network or arbitrary require is exposed.
export function metadataInput(root, routes) {
  const read=file=>JSON.parse(fs.readFileSync(path.join(root,file),"utf8"));
  function compile(file,require) {
    const exports={};
    const output=ts.transpileModule(fs.readFileSync(path.join(root,file),"utf8"),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022,esModuleInterop:false}}).outputText;
    vm.runInNewContext(output,{exports,require,URL,process:{env:{SITE_INDEXABLE:"true",VERCEL_ENV:"production"}}},{timeout:1000,filename:file});
    return exports;
  }
  const site=compile("src/config/site.ts",()=>{throw new Error("Unexpected site-config import");});
  const tdk=Object.fromEntries(routes.filter(r=>!r.path.startsWith("/guides/")).map(r=>[r.path,r.seo]));
  const metadata=compile("src/seo/metadata.ts",name=>{
    if(name==="@/config/site")return site;
    if(name==="@/seo/tdk")return {tdk};
    if(name==="@/data/guides/guides.json")return {default:read("src/data/guides/guides.json")};
    if(name==="@/data/guides/faq.json")return {default:read("src/data/guides/faq.json")};
    throw new Error(`Unregistered metadata dependency: ${name}`);
  });
  return route=>{
    const result=metadata.pageMetadata(route);
    return JSON.parse(JSON.stringify({...result,robots:result.robots??{index:true,follow:true}}));
  };
}
