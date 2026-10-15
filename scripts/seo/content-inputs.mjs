import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import ts from "typescript";
import { tdk } from "../../src/seo/tdk.js";
const hash = (value) => crypto.createHash("sha256").update(value).digest("hex");
export function contentInputs(root = process.cwd()) {
  const read = (file) => JSON.parse(fs.readFileSync(path.join(root, file), "utf8"));
  const fileHash = (file) => hash(fs.readFileSync(path.join(root, file)));
  const guides = read("src/data/guides/guides.json"), faq = read("src/data/guides/faq.json");
  const heroes = read("src/data/site/pages.json"), legal = read("src/data/legal/pages.json");
  const pokemon = read("src/data/pokedex/pokemon.json"), moves = read("src/data/moves/moves.json");
  const builds = read("src/data/builds/builds.json");
  const encounters = read("src/data/game/encounters.json");
  const shinyIds = new Set([6, 25, 54, 94, 133, 448]);
  const shinySamples = {
    partners: pokemon.filter(p => shinyIds.has(p.id)).map(({id,name})=>({id,name})),
    sprites: read("src/data/game/assets.json").filter(p => shinyIds.has(p.id)).map(({id,shiny})=>({id,shiny})),
  };
  const cardPokemon = (p) => Object.fromEntries(["id", "hasDetailPage", "slug", "name", "region", "types", "starter", "legendary", "hp", "speed", "attack", "rarity"].map(k => [k,p[k]]));
  const roots = {
    "/": "src/page/home/HomePage.tsx", "/play": "src/page/play/PlayPage.tsx",
    "/pokedex": "src/page/pokedex/PokedexPage.tsx", "/level-up": "src/page/level-up/LevelUpPage.tsx",
    "/tier-list": "src/page/wiki/sections/TierListContent.tsx", "/builds": "src/page/builds/BuildsContent.tsx",
    "/types": "src/page/wiki/sections/TypesContent.tsx", "/gacha": "src/page/wiki/sections/GachaContent.tsx",
    "/achievements": "src/page/wiki/sections/ReferenceContent.tsx", "/updates": "src/page/wiki/sections/UpdatesContent.tsx",
    "/sources": "src/page/legal/EditorialPolicy.tsx", "/guides": "src/page/guides/GuidesPage.tsx",
  };
  function sources(entry, seen = new Set()) {
    if (seen.has(entry)) return; seen.add(entry);
    const source = fs.readFileSync(path.join(root, entry), "utf8");
    const ast = ts.createSourceFile(entry, source, ts.ScriptTarget.Latest, true);
    for (const statement of ast.statements) {
      if ((!ts.isImportDeclaration(statement) && !ts.isExportDeclaration(statement)) || !statement.moduleSpecifier) continue;
      const spec = statement.moduleSpecifier.text;
      const base = spec.startsWith("@/") ? "src/" + spec.slice(2) : spec.startsWith(".") ? path.posix.join(path.posix.dirname(entry), spec) : null;
      if (!base || base === "src/seo/tdk" || base === "src/seo/tdk.js") continue;
      const resolved = [base, base + ".tsx", base + ".ts", base + ".js", base + "/index.ts"].find(f => /\.[cm]?[jt]sx?$/.test(f) && fs.existsSync(path.join(root, f)) && fs.statSync(path.join(root,f)).isFile());
      if (resolved) sources(resolved, seen);
    }
    return seen;
  }
  const inputs = {};
  const allMeta = { ...tdk, ...Object.fromEntries(guides.map(g => [`/guides/${g.slug}`,g.seo])), "/guides/faq": faq.seo };
  for (const [url,seo] of Object.entries(allMeta)) {
    let entry = roots[url], data = {};
    if (url.startsWith("/legal/")) { entry = "src/page/legal/LegalPage.tsx"; data = legal[url.split("/").at(-1)]; }
    if (url === "/") data = { faq: faq.questions.slice(0,6) };
    if (url === "/pokedex" || url === "/tier-list") data = pokemon.map(cardPokemon);
    if (url === "/pokedex") data = { pokemon: data, appearances: encounters.map(({id,hasShiny,hovering})=>({id,hasShiny,hovering})) };
    if (url === "/level-up") data = { moves, cards: read("src/data/wiki/run-cards.json"), notes: read("src/data/game/move-notes.json"), pokemon: pokemon.map(p=>({id:p.id,learnset:p.learnset})) };
    if (url === "/builds") { const ids = new Set(builds.flatMap(b=>b.partners)); data = { builds, moves: moves.filter(m=>builds.some(b=>b.move===m.slug || b.supportMoves.includes(m.id))), partners: pokemon.filter(p=>ids.has(p.id)).map(p=>({id:p.id,name:p.name})), items: read("src/data/wiki/items.json") }; }
    if (url === "/types") data = { chart: read("src/data/tools/type-chart.json"), weather: read("src/data/wiki/weather.json") };
    if (url === "/gacha") data = { gacha: read("src/data/wiki/gacha.json"), shinySamples };
    if (url === "/achievements") data = read("src/data/wiki/achievements.json");
    if (url === "/updates") data = read("src/data/wiki/changes.json").slice(0,4);
    if (url === "/sources") { const version = read("src/data/wiki/source-snapshot.json"); data = { build: version.build, sourceBase: version.sourceBase }; }
    if (url === "/guides") data = guides.map(({slug,cardTitle,description,image,imageAlt,category,readTime,outcomes})=>({slug,cardTitle,description,image,imageAlt,category,readTime,outcomes}));
    if (url === "/guides/faq") { entry = "src/page/guides/FaqPage.tsx"; data = faq; }
    else if (url.startsWith("/guides/")) {
      entry = "src/page/guides/GuidePage.tsx";
      const i = guides.findIndex(g=>url === `/guides/${g.slug}`), g = guides[i], next = guides[(i+1)%guides.length];
      data = { guide:g, next:{slug:next.slug,cardTitle:next.cardTitle} };
      if (g.slug === "beginner-guide") data.game = { waves:read("src/data/game/waves.json"), world:read("src/data/game/world-rules.json"), encounters:encounters.map(({id,wildTiers,bossSlots})=>({id,wildTiers,bossSlots})), partners:pokemon.filter(p=>encounters.some(e=>e.id===p.id&&(e.wildTiers.length||e.bossSlots.length))).map(({id,name})=>({id,name})) };
      if (g.slug === "move-evolutions") data.moves = moves.filter(m=>["ember","water-gun","vine-whip","thunder-shock","confusion","shadow-ball"].includes(m.id));
      if (g.slug === "gacha-and-tickets") data.game = { missions:read("src/data/game/missions.json"), shinySamples };
    }
    const implementationFiles = sources(entry);
    implementationFiles.add("src/seo/metadata.ts");
    const implementation = [...implementationFiles].sort().map(file => [file,fileHash(file)]);
    const assets = { og: fileHash("public/images/og-image.png") };
    if (url === "/legal/copyright") assets.credits = fileHash("public/credits/spritecollab-artists.md");
    inputs[url] = { seo, hero: heroes[url] ?? null, implementation, data, assets };
  }
  return inputs;
}
export function contentHashes(root = process.cwd()) {
  return Object.fromEntries(Object.entries(contentInputs(root)).sort(([a],[b])=>a.localeCompare(b)).map(([url,payload])=>[url,hash(JSON.stringify(payload))]));
}
