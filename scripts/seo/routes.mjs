import fs from "node:fs";
import path from "node:path";
import ts from "typescript";

import { SITE_URL } from "./config.mjs";
export { SITE_URL };
export function discoverRoutes(root = process.cwd()) {
  const read = file => JSON.parse(fs.readFileSync(path.join(root, file), "utf8"));
  const file = "src/seo/tdk.js";
  const source = ts.createSourceFile(file, fs.readFileSync(path.join(root, file), "utf8"), ts.ScriptTarget.Latest, true);
  const declaration = source.statements.flatMap(s => ts.isVariableStatement(s) ? [...s.declarationList.declarations] : []).find(d => d.name.getText(source) === "tdk");
  if (!declaration?.initializer) throw new Error("Missing static-page metadata");
  const metadata = JSON.parse(declaration.initializer.getText(source));
  const guides = read("src/data/guides/guides.json").filter(g => g.published !== false);
  const all = { ...metadata, ...Object.fromEntries(guides.map(g => [`/guides/${g.slug}`, g.seo])), "/guides/faq": read("src/data/guides/faq.json").seo };
  return Object.entries(all).sort(([a],[b]) => a < b ? -1 : a > b ? 1 : 0).map(([route, seo]) => {
    const canonical = new URL(route, SITE_URL);
    if (canonical.origin !== SITE_URL || canonical.pathname !== route || canonical.search || canonical.hash || (route !== "/" && route.endsWith("/"))) throw new Error(`Invalid canonical path: ${route}`);
    if (!seo.title || !seo.description) throw new Error(`Missing SEO text: ${route}`);
    return { path: route, canonicalUrl: canonical.href, seo, indexable: seo.indexable !== false };
  });
}
