import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import ts from "typescript";
import { discoverRoutes } from "./routes.mjs";
import { semanticSource } from "./semantic-source.mjs";
import { metadataInput } from "./metadata-input.mjs";
const hash = (value) => crypto.createHash("sha256").update(value).digest("hex");
export function contentInputs(root = process.cwd()) {
  const read = (file) => JSON.parse(fs.readFileSync(path.join(root, file), "utf8"));
  const fileHash = (file) => {
    const bytes = fs.readFileSync(path.join(root, file));
    if (/\.[cm]?[jt]sx?$/.test(file)) return hash(semanticSource(bytes.toString("utf8"), file));
    return hash(/\.(?:[cm]?[jt]sx?|md|txt|svg|css)$/.test(file)
      ? bytes.toString("utf8").replace(/\r\n/g, "\n") : bytes);
  };
  const guides = read("src/data/guides/guides.json"), faq = read("src/data/guides/faq.json");
  const heroes = read("src/data/site/pages.json"), legal = read("src/data/legal/pages.json");
  const pokemon = read("src/data/pokedex/pokemon.json"), moves = read("src/data/moves/moves.json");
  const encounters = read("src/data/game/encounters.json");
  const previewIndex=read("src/data/game/collection-preview-index.json");
  const collectionPreviews = read("src/data/game/collection-previews.json").previews.map(({id,shiny,src,still})=>({
    id,shiny,available:(shiny?previewIndex.shiny:previewIndex.normal).includes(id),animation:fileHash("public"+src),still:fileHash("public"+still),
  }));
  const shinyIds = new Set([6, 25, 54, 94, 133, 448]);
  const shinySamples = {
    partners: pokemon.filter(p => shinyIds.has(p.id)).map(({id,name})=>({id,name})),
    sprites: read("src/data/game/assets.json").filter(p => shinyIds.has(p.id)).map(({id,shiny})=>({id,shiny})),
  };
  const cardPokemon = (p) => Object.fromEntries(["id", "hasDetailPage", "slug", "name", "region", "types", "starter", "legendary", "hp", "speed", "attack", "physicalAttack", "specialAttack", "defense", "specialDefense", "rarity"].map(k => [k,p[k]]));
  const roots = {
    "/": "src/page/home/HomePage.tsx", "/play": "src/page/play/PlayPage.tsx",
    "/pokedex": "src/page/pokedex/PokedexPage.tsx", "/level-up": "src/page/level-up/LevelUpPage.tsx",
    "/tier-list": "src/page/wiki/sections/TierListContent.tsx",
    "/rankings": "src/page/rankings/RankingsContent.tsx",
    "/types": "src/page/wiki/sections/TypesContent.tsx", "/gacha": "src/page/wiki/sections/GachaContent.tsx",
    "/achievements": "src/page/wiki/sections/ReferenceContent.tsx", "/updates": "src/page/wiki/sections/UpdatesContent.tsx",
    "/guides": "src/page/guides/GuidesPage.tsx",
  };
  function sources(entry, seen = new Set()) {
    if (seen.has(entry)) return; seen.add(entry);
    const source = fs.readFileSync(path.join(root, entry), "utf8");
    if (entry.endsWith(".css")) return seen;
    const ast = ts.createSourceFile(entry, source, ts.ScriptTarget.Latest, true);
    for (const statement of ast.statements) {
      if ((!ts.isImportDeclaration(statement) && !ts.isExportDeclaration(statement)) || !statement.moduleSpecifier) continue;
      const spec = statement.moduleSpecifier.text;
      const base = spec.startsWith("@/") ? "src/" + spec.slice(2) : spec.startsWith(".") ? path.posix.join(path.posix.dirname(entry), spec) : null;
      if (!base || ["src/seo/tdk", "src/seo/tdk.js", "src/seo/revisions", "src/seo/manifest", "src/seo/metadata"].includes(base)) continue;
      const resolved = [base, base + ".tsx", base + ".ts", base + ".js", base + "/index.ts"].find(f => /(?:\.[cm]?[jt]sx?|\.css)$/.test(f) && fs.existsSync(path.join(root, f)) && fs.statSync(path.join(root,f)).isFile());
      if (resolved && !resolved.endsWith(".css")) sources(resolved, seen);
    }
    return seen;
  }
  const inputs = {};
  const routes=discoverRoutes(root), collectMetadata=metadataInput(root,routes);
  const allMeta = Object.fromEntries(routes.map(route => [route.path, route.seo]));
  for (const [url,seo] of Object.entries(allMeta)) {
    let entry = roots[url], data = {};
    if (url.startsWith("/legal/")) { entry = "src/page/legal/LegalPage.tsx"; data = legal[url.split("/").at(-1)]; }
    if (url === "/") {
      const home = read("src/data/site/home.json");
      const ids = new Set(home.partners);
      data = {
        home,
        faq: [0,2,4,3].map(i=>faq.questions[i]),
        partners: pokemon.filter(p=>ids.has(p.id)).map(({id,name,types,rarity,physicalAttack,specialAttack})=>({id,name,types,rarity,physicalAttack,specialAttack})),
        counts: {pokemon:pokemon.length, moves:moves.length, types:Object.keys(read("src/data/tools/type-chart.json")).length, achievements:read("src/data/wiki/achievements.json").length},
        collectionPreviews: collectionPreviews.filter(p=>(!p.shiny&&ids.has(p.id))||(p.shiny&&p.id===133)),
      };
    }
    if (url === "/pokedex" || url === "/tier-list" || url === "/rankings") data = pokemon.map(cardPokemon);
    if (url === "/pokedex") data = { pokemon: data, appearances: encounters.map(({id,hasShiny,hovering})=>({id,hasShiny,hovering})), collectionPreviews };
    if (url === "/tier-list") data = { snapshot:read("src/data/game/leaderboards.json").boards.map(({key,capturedAt,mode,period,rows})=>({key,capturedAt,mode,period,rows:rows.map(({rank,pokemon,seconds})=>({rank,pokemon:pokemon.map(({id})=>({id})),seconds}))})), pokemon:pokemon.map(({id,name,types,region})=>({id,name,types,region})), collectionPreviews:collectionPreviews.filter(p=>!p.shiny), exportSprites:pokemon.map(p=>({id:p.id,image:fileHash(`public/game/pokemon/${p.id}.webp`)})) };
    if (url === "/tier-list") {
      const editorial = read("src/data/tier-list/recommendations.json"), ids = new Set(editorial.picks.map(p=>p.id));
      data.editorial = editorial;
      data.editorialPartners = pokemon.filter(p=>ids.has(p.id)).map(({id,hp,speed,physicalAttack,specialAttack,defense,specialDefense,startMove,cardPool})=>({id,hp,speed,physicalAttack,specialAttack,defense,specialDefense,startMove,cardPool}));
      data.heroBackground = fileHash("public/game/screenshots/forest.webp");
    }
    if (url === "/rankings" && fs.existsSync(path.join(root,"src/data/game/leaderboards.json"))) {
      const snapshot = read("src/data/game/leaderboards.json");
      const ids = new Set(snapshot.boards.flatMap(b=>b.rows.flatMap(r=>r.pokemon.map(p=>p.id))));
      data = { snapshot, pokemon:pokemon.filter(p=>ids.has(p.id)).map(({id,name})=>({id,name})), collectionPreviews:collectionPreviews.filter(p=>ids.has(p.id)) };
    }
    if (url === "/level-up") data = { moves, cards: read("src/data/wiki/run-cards.json"), notes: read("src/data/game/move-notes.json"), pokemon: pokemon.map(p=>({id:p.id,name:p.name,types:p.types,startMove:p.startMove,cardPool:p.cardPool,learnset:p.learnset,attack:p.attack,physicalAttack:p.physicalAttack,specialAttack:p.specialAttack})), collectionPreviews:collectionPreviews.filter(p=>!p.shiny) };
    if (url === "/level-up") {
      const bossRewards = read("src/data/game/boss-rewards.json");
      delete bossRewards.review;
      data.bossRewards = bossRewards;
      data.items = read("src/data/wiki/items.json");
    }
    if (url === "/types") data = { chart: read("src/data/tools/type-chart.json"), weather: read("src/data/wiki/weather.json") };
    if (url === "/gacha") data = { gacha: read("src/data/wiki/gacha.json"), partners:pokemon.map(({id,name,region,rarity})=>({id,name,region,rarity})), shinySamples, collectionPreviews:collectionPreviews.filter(p=>shinyIds.has(p.id)) };
    if (url === "/achievements") data = read("src/data/wiki/achievements.json");
    if (url === "/updates") data = { game:read("src/data/wiki/changes.json"), site:fs.existsSync(path.join(root,"src/data/site/releases.json")) ? read("src/data/site/releases.json") : [] };

    if (url === "/guides") data = {
      guides: guides.map(({slug,cardTitle,description,image,imageAlt,category,readTime,outcomes})=>({slug,cardTitle,description,image,imageAlt,category,readTime,outcomes})),
      covers: collectionPreviews.filter(p=>!p.shiny&&[1,4,7,25,133,94].includes(p.id)),
    };
    if (url === "/guides/faq") { entry = "src/page/guides/FaqPage.tsx"; data = faq; }
    else if (url.startsWith("/guides/")) {
      entry = "src/page/guides/GuidePage.tsx";
      const i = guides.findIndex(g=>url === `/guides/${g.slug}`), g = guides[i], next = guides[(i+1)%guides.length];
      data = { guide:g, next:{slug:next.slug,cardTitle:next.cardTitle} };
      if (g.slug === "beginner-guide") data.game = { waves:read("src/data/game/waves.json"), world:read("src/data/game/world-rules.json"), encounters:encounters.map(({id,wildTiers,bossSlots})=>({id,wildTiers,bossSlots})), partners:pokemon.filter(p=>encounters.some(e=>e.id===p.id&&(e.wildTiers.length||e.bossSlots.length))).map(({id,name})=>({id,name})) };
      if (g.slug === "beginner-guide") {
        const waves=read("src/data/game/waves.json");
        const ids=new Set(["wildTiers","bossSlots"].flatMap((kind,k)=>(k?waves.bosses:waves.tiers).flatMap((_,index)=>pokemon.filter(p=>encounters.find(e=>e.id===p.id)[kind].includes(index)).slice(0,7).map(p=>p.id))));
        data.game.collectionPreviews=collectionPreviews.filter(p=>!p.shiny&&(ids.has(p.id)||[1,4,7].includes(p.id)));
      }
      if (g.slug === "move-evolutions") data.moves = moves.filter(m=>["ember","water-gun","vine-whip","thunder-shock","confusion","shadow-ball"].includes(m.id));
      if (g.slug === "gacha-and-tickets") data.game = { missions:read("src/data/game/missions.json"), shinySamples, collectionPreviews:collectionPreviews.filter(p=>shinyIds.has(p.id)) };
      if (g.slug === "shiny-pokemon") data.game = {
        mechanics:read("src/data/game/shiny-rules.json").mechanics,
        sprites:shinySamples.sprites.filter(p=>[6,94,133,448].includes(p.id)),
        collectionPreviews:collectionPreviews.filter(p=>[6,94,133,448].includes(p.id)),
      };
    }
    const implementationFiles = sources(entry);
    sources("src/components/layout/SiteFooter.tsx", implementationFiles);
    if (url !== "/play") sources("src/components/layout/SiteShell.tsx", implementationFiles);
    if(url!=="/play")data={...data,sharedMoveCount:moves.length};
    if (url !== "/" && url !== "/play")
      sources("src/components/common/PageHeader.tsx", implementationFiles);
    const mechanics=read("src/data/game/mechanics.json");
    if(implementationFiles.has("src/components/common/SourceNote.tsx")) data={...data,rulesReviewed:{reviewed:mechanics.reviewed,build:mechanics.build}};
    if(url==="/guides")data.rulesReviewed={reviewed:mechanics.reviewed,build:mechanics.build};
    if(url==="/types")data={...data,defenseRule:mechanics.defense};
    const implementation = [...implementationFiles].sort().map(file => [file,fileHash(file)]);
    const assets = { og: fileHash("public/images/og-image.png") };
    assets.gameForest = fileHash("public/game/screenshots/forest.webp");
    if (url === "/play") assets.gamePreview = fileHash("public/game/screenshots/level-up.webp");
    if (url === "/guides")
      for (const guide of guides) assets[`cover:${guide.slug}`] = fileHash("public" + guide.image);
    if (url === "/") {
      for (const name of ["level-up", "card-choices", "forest", "battlefield"])
        assets[name] = fileHash(`public/game/screenshots/${name}.webp`);
    }
    if (data.guide?.image) assets.cover = fileHash("public" + data.guide.image);
    if(data.guide)for(const section of data.guide.sections)if(section.figure)assets[`figure:${section.id}`]=fileHash("public"+section.figure.src);
    if (url === "/legal/copyright") assets.credits = fileHash("public/credits/spritecollab-artists.md");
    inputs[url] = { seo, metadata:collectMetadata(url), hero: heroes[url] ?? null, implementation, data, assets };
  }
  return inputs;
}
export function contentHashes(root = process.cwd()) {
  const canonical=value=>Array.isArray(value)?value.map(canonical):value && typeof value === "object"?Object.fromEntries(Object.keys(value).sort().map(key=>[key,canonical(value[key])])):value;
  return Object.fromEntries(Object.entries(contentInputs(root)).sort(([a],[b])=>a.localeCompare(b)).map(([url,payload])=>[url,hash(JSON.stringify(canonical(payload)))]));
}
