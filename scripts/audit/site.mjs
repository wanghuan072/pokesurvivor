import fs from "node:fs";
import path from "node:path";
import assert from "node:assert/strict";
const read = (p) => JSON.parse(fs.readFileSync(p, "utf8"));
const pokemon = read("src/data/pokedex/pokemon.json"),
  moves = read("src/data/moves/moves.json"),
  chart = read("src/data/tools/type-chart.json");
assert.equal(pokemon.length, 966);
assert.equal(new Set(pokemon.map((p) => p.slug)).size, 966);
assert.equal(new Set(pokemon.map((p) => p.id)).size, 966);
assert.equal(moves.length, 103);
assert.equal(moves.filter((m) => m.evolution).length, 97);
assert.equal(new Set(moves.map((m) => m.slug)).size, moves.length);
assert.equal(pokemon.find((p) => p.id === 29).slug, "nidoran-female");
assert.equal(pokemon.find((p) => p.id === 32).slug, "nidoran-male");
assert.equal(Object.keys(chart).length, 18);
for (const row of Object.values(chart)) {
  assert.equal(row.length, 18);
  assert.ok(row.every((x) => [1, 0.6, 0.3, 1.6].includes(x)));
}
const files = [];
const bossRewards = read("src/data/game/boss-rewards.json");
const levelUpHtml = fs.readFileSync(".next/server/app/level-up.html", "utf8");
for (const item of read("src/data/wiki/items.json")) {
  assert.ok(bossRewards.heldItemIds.includes(item.id), `Missing Boss drop: ${item.id}`);
  assert.ok(levelUpHtml.includes(`id="item-${item.id}"`), `Unpublished Boss drop: ${item.id}`);
  assert.ok(fs.existsSync(`public/game/icons/${item.id}.png`));
}
const initialPartnerMoves=moves.filter(move=>pokemon[0].learnset.includes(move.id));
assert.equal((levelUpHtml.match(/<article\b[^>]*\bid="move-[^"]+"/g) || []).length, initialPartnerMoves.length, "The move panel must initially show the first partner's complete move pool");
for(const move of initialPartnerMoves) assert.ok(levelUpHtml.includes(`id="move-${move.slug}"`), `Missing initial partner move: ${move.name}`);
for (const id of ["boss-rewards", "bond-fusion", "boss-items", "boss-patterns"])
  assert.ok(levelUpHtml.includes(`id="${id}"`), `Missing Boss section: ${id}`);
assert.ok(levelUpHtml.includes("ENEMY ATTACKS") && levelUpHtml.includes("NOT LEARNABLE"));
for (const pattern of bossRewards.patterns)
  assert.ok(levelUpHtml.includes(pattern.name), `Missing Boss attack reference: ${pattern.id}`);
function walk(dir) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const file = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(file);
    else if (
      file.endsWith(".html") &&
      !file.includes("[") &&
      !file.endsWith("_global-error.html")
    )
      files.push(file);
  }
}
if (!fs.existsSync(".next/server/app"))
  throw new Error("Run npm run build before the audit.");
walk(".next/server/app");
const known = new Set(
  files.map(
    (f) =>
      "/" +
      path
        .relative(".next/server/app", f)
        .replaceAll("\\", "/")
        .replace(/\.html$/, "")
        .replace(/^index$/, ""),
  ),
);
const hrefs = new Set();
const pageIds = new Map();
const links = [];
const removedRoutes = ["/wiki", "/items", "/upgrades", "/tools", "/sources", "/builds"];
const retiredTarget = (pathname) =>
  ["/about", "/contact", "/privacy-policy"].includes(pathname) ||
  removedRoutes.some((route) => pathname === route || pathname.startsWith(route + "/")) ||
  pathname === "/moves" || pathname.startsWith("/moves/") ||
  pathname.startsWith("/builds/") ||
  pathname.startsWith("/pokedex/") ||
  pathname.startsWith("/level-up/") ||
  pathname.startsWith("/tier-list/") ||
  pathname === "/evolutions" || pathname.startsWith("/evolutions/");
const routeForFile = (file) => "/" + path.relative(".next/server/app", file)
  .replaceAll("\\", "/").replace(/\.html$/, "").replace(/^index$/, "");
let checked = 0;
for (const file of files) {
  const html = fs.readFileSync(file, "utf8");
  pageIds.set(routeForFile(file), new Set([...html.matchAll(/\bid="([^"]+)"/g)].map((m) => m[1])));
}
// Move anchors reveal the matching pool before scrolling inside the move panel.
for (const move of moves) pageIds.get("/level-up")?.add(`move-${move.slug}`);
for (const file of files) {
  if (["/_not-found", "/moves", "/evolutions", "/about", "/contact", "/privacy-policy"].includes(routeForFile(file))) continue;
  const html = fs.readFileSync(file, "utf8");
  const route = routeForFile(file);
  for (const match of html.matchAll(/<a\b[^>]*\bhref="([^"]+)"/g))
    links.push({ from: route, href: match[1].replaceAll("&amp;", "&") });
  assert.equal(
    (html.match(/<h1[\s>]/g) || []).length,
    1,
    `${file}: expected one h1`,
  );
  assert.match(html, /<title>[^<]+<\/title>/, file);
  assert.match(html, /<meta name="description" content="[^"]+"/, file);
  assert.match(html, /<link rel="canonical" href="[^"]+"/, file);
  assert.ok(!html.includes('class="undefined'), `${file}: broken CSS module`);
  for (const match of html.matchAll(/<img[^>]+src="(\/game\/[^"?]+)/g))
    assert.ok(
      fs.existsSync("public" + match[1]),
      `Missing game image: ${match[1]}`,
    );
  assert.ok(
    !html.includes("raw.githubusercontent.com/PokeAPI/sprites"),
    `${file}: stale remote sprite request`,
  );
  for (const match of html.matchAll(/href="(\/[^"#?]*)/g))
    if (!match[1].startsWith("/_next")) hrefs.add(match[1]);
  checked++;
}
for (const href of hrefs)
  assert.ok(
    known.has(href) || fs.existsSync(path.join("public", href)),
    `Broken internal target: ${href}`,
  );
function checkLink(from, href) {
  const url = new URL(href, `https://audit.invalid${from}`);
  if (url.origin !== "https://audit.invalid") return;
  const pathname = decodeURIComponent(url.pathname);
  assert.ok(!retiredTarget(pathname), `${from}: retired page entry ${href}`);
  assert.ok(known.has(pathname) || fs.existsSync(path.join("public", pathname)),
    `${from}: broken target ${href}`);
  if (url.hash && pageIds.has(pathname))
    assert.ok(pageIds.get(pathname).has(decodeURIComponent(url.hash.slice(1))),
      `${from}: broken anchor ${href}`);
}
for (const { from, href } of links) checkLink(from, href);
assert.ok(!known.has("/items"), "Removed Items page must not be generated");
assert.ok(!hrefs.has("/items"), "Removed Items page must not be linked");
assert.ok(
  !known.has("/upgrades"),
  "Removed Upgrades page must not be generated",
);
assert.ok(!hrefs.has("/upgrades"), "Removed Upgrades page must not be linked");
const search = read("public/search-index.json");
assert.ok(
  !search.some((x) => x.href === "/upgrades"),
  "Removed Upgrades page must not be searchable",
);
assert.ok(
  !search.some((x) => x.href === "/items"),
  "Removed Items page must not be searchable",
);
const sitemap = fs.readFileSync(".next/server/app/sitemap.xml.body", "utf8");

for (const route of removedRoutes) {
  assert.ok(!known.has(route), `Removed page generated: ${route}`);
  assert.ok(![...known].some((p) => p.startsWith(route + "/")), `Removed detail generated: ${route}`);
}
for (const entry of search) checkLink("/search-index.json", entry.href);
for (const [, location] of sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)) {
  const url = new URL(location);
  checkLink("/sitemap.xml", url.pathname + url.search + url.hash);
}
assert.ok(
  !sitemap.includes("/items</loc>"),
  "Removed Items page must not be in sitemap",
);
assert.ok(
  !sitemap.includes("/upgrades</loc>"),
  "Removed Upgrades page must not be in sitemap",
);
const publishedGuides = read("src/data/guides/guides.json");
for (const route of ["pokedex", "tier-list", "rankings", "gacha", "guides/shiny-pokemon"]) {
  const html=fs.readFileSync(`.next/server/app/${route}.html`,"utf8");
  assert.match(html, /src="\/game\/collection\/\d+-(normal|shiny)\.webp"/, `${route}: original collection animations must be rendered`);
  assert.match(html, /media="\(prefers-reduced-motion: reduce\)"/, `${route}: reduced-motion still missing`);
  assert.ok(!/src="\/game\/pokemon\/\d+(?:-shiny)?\.webp"/.test(html), `${route}: stale static-only roster art`);
}
assert.equal(publishedGuides.length, 4, "Four published guides");
for (const guide of publishedGuides) {
  assert.ok(known.has(`/guides/${guide.slug}`), guide.slug);
  assert.ok(
    fs.existsSync("public" + guide.image),
    `Missing guide cover: ${guide.image}`,
  );
  const guideHtml = fs.readFileSync(
    `.next/server/app/guides/${guide.slug}.html`,
    "utf8",
  );
  assert.equal(
    new Set(guide.sections.map((section) => section.id)).size,
    guide.sections.length,
  );
  for (const section of guide.sections)
    assert.ok(
      guideHtml.includes(`id="${section.id}"`),
      `Missing guide chapter anchor: ${guide.slug}#${section.id}`,
    );
}
for (const guide of read("src/data/guides/archive.json")) {
  assert.ok(
    !known.has(`/guides/${guide.slug}`),
    `Archived guide is published: ${guide.slug}`,
  );
  assert.ok(
    !search.some((x) => x.href === `/guides/${guide.slug}`),
    `Archived guide is searchable: ${guide.slug}`,
  );
}
for (const m of moves) {
  assert.ok(
    !known.has(`/moves/${m.slug}`),
    `Move detail must not be published: ${m.slug}`,
  );
  assert.ok(
    !hrefs.has(`/moves/${m.slug}`),
    `Move detail must not be linked: ${m.slug}`,
  );
  assert.ok(
    !sitemap.includes(`/moves/${m.slug}</loc>`),
    `Move detail must not be in sitemap: ${m.slug}`,
  );
  assert.ok(
    pageIds.get("/level-up").has(`move-${m.slug}`),
    `Missing move-panel target: ${m.slug}`,
  );
  assert.ok(
    search.some((x) => x.href === `/level-up#move-${m.slug}`),
    `Missing card search anchor: ${m.slug}`,
  );
}
for (const p of pokemon) {
  assert.equal(typeof p.hasDetailPage, "boolean", p.slug);
  assert.equal(p.hasDetailPage, false, "Pokédex details are temporarily unpublished");
  const url = `/pokedex/${p.slug}`;
  assert.equal(
    known.has(url),
    p.hasDetailPage,
    `${url}: generated route publication mismatch`,
  );
  assert.equal(
    search.some((x) => x.href === url),
    p.hasDetailPage,
    `${url}: search publication mismatch`,
  );
  assert.equal(
    sitemap.includes(url + "</loc>"),
    p.hasDetailPage,
    `${url}: sitemap publication mismatch`,
  );
}
console.log(
  `PASS: ${pokemon.filter((p) => p.hasDetailPage).length} published Pokédex pages; unpublished entries excluded from generated routes, search and sitemap.`,
);
console.log(
  `PASS: ${pokemon.length} unique Pokémon, ${moves.length} moves, 97 evolutions, 18×18 type chart.`,
);
console.log(
  `PASS: ${checked} built HTML pages checked for H1, title, description, canonical, CSS module classes and ${hrefs.size} internal targets.`,
);
console.log(`PASS: ${links.length} page links and anchors, ${search.length} search entries, sitemap and all retired page entries checked.`);
const base = process.env.AUDIT_URL;
for (const route of known) {
  assert.ok(!/^\/(pokedex|level-up|tier-list|builds)\//.test(route),
    `Only guide detail routes may be published: ${route}`);
}
if (base) {
  const routes = [...known, "/robots.txt", "/sitemap.xml"].filter(
    (route) => !["/_not-found", "/_global-error", "/moves", "/evolutions", "/about", "/contact", "/privacy-policy"].includes(route),
  );
  async function checkStatuses(paths, expected) {
    let next = 0;
    await Promise.all(Array.from({ length: Math.min(6, paths.length) }, async () => {
      while (next < paths.length) {
        const route = paths[next++];
        const response = await fetch(base + route, { signal: AbortSignal.timeout(15000) });
        await response.arrayBuffer();
        assert.equal(response.status, expected, route);
      }
    }));
  }
  await checkStatuses(routes, 200);
  for (const [from, to] of [
    ["/moves", "/level-up#move-cards"],
    ["/evolutions", "/level-up#evolutions"],
    ["/about", "/legal/about-us"],
    ["/privacy-policy", "/legal/privacy-policy"],
    ["/contact", "/legal/contact-us"],
  ]) {
    const response = await fetch(base + from, { redirect: "manual" });
    assert.equal(response.status, 308, from);
    assert.equal(response.headers.get("location"), to, from);
  }
  const missingRoutes = [...new Set([
    "/level-up/ember",
    "/tier-list/pikachu",
    ...read("src/data/builds/builds.json").map((build) => `/builds/${build.slug}`),
    "/builds/not-a-build",
    "/builds",
    "/sources",
    "/tools",
    "/tools/build-planner",
    "/tools/type-calculator",
    "/tools/gacha-calculator",
    "/upgrades",
    "/items",
    "/wiki",
    "/pokedex/nidoran-female",
    "/pokedex/nidoran-male",
    "/pokedex/mewtwo",
    "/not-a-real-page",
    "/pokedex/not-a-pokemon",
    ...pokemon.filter((p) => !p.hasDetailPage).map((p) => `/pokedex/${p.slug}`),
    ...moves.map((m) => `/moves/${m.slug}`),
    "/moves/not-a-move",
    ...read("src/data/guides/archive.json").map((g) => `/guides/${g.slug}`),
    "/guides/not-a-guide",
    "/tools/not-a-tool",
  ])];
  await checkStatuses(missingRoutes, 404);
  console.log(
    `PASS: ${routes.length} live routes return 200; ${missingRoutes.length} removed/unpublished/unknown URLs return 404; 5 legacy redirects verified.`,
  );
}
