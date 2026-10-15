import fs from "node:fs";
import path from "node:path";
const sourceDir = process.argv[2] || ".cache/sources";
const clean = (s) =>
  s
    .replace(/<[^>]*>/g, "")
    .replaceAll("&amp;", "&")
    .replaceAll("&#39;", "'")
    .trim();
const slug = (s) =>
  s
    .toLowerCase()
    .replace("♀", "-female")
    .replace("♂", "-male")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
const dex = fs.readFileSync(path.join(sourceDir, "pokedex-temp.html"), "utf8");
const previousPath = "src/data/pokedex/pokemon.json";
const publication = new Map(
  (fs.existsSync(previousPath)
    ? JSON.parse(fs.readFileSync(previousPath, "utf8"))
    : []
  ).map((p) => [p.id, p.hasDetailPage === true]),
);
const pokemon = [];
for (const region of dex.matchAll(
  /<section id="([^"]+)">([\s\S]*?)<\/section>/g,
)) {
  for (const entry of region[2].matchAll(/<li id="p(\d+)">([\s\S]*?)<\/li>/g)) {
    const body = entry[2],
      name = clean(body.match(/class="nm">(.*?)<\/span>/)[1]);
    pokemon.push({
      id: Number(entry[1]),
      hasDetailPage: publication.get(Number(entry[1])) ?? false,
      slug: slug(name),
      name,
      region: region[1],
      types: [...body.matchAll(/class="ty"[^>]*>([^<]+)/g)].map((x) => x[1]),
      starter: body.includes('class="st"'),
      legendary: body.includes('class="leg"'),
    });
  }
}
const moves = [];
for (const row of fs
  .readFileSync(path.join(sourceDir, "moves-temp.html"), "utf8")
  .matchAll(/<tr>([\s\S]*?)<\/tr>/g)) {
  const cells = [...row[1].matchAll(/<td[^>]*>([\s\S]*?)<\/td>/g)].map(
    (x) => x[1],
  );
  if (cells.length !== 5) continue;
  const name = clean(cells[0]),
    evolution = cells[4].match(/<b>(.*?)<\/b>/)?.[1] || null;
  moves.push({
    name,
    slug: slug(name),
    type: clean(cells[1]),
    kind: clean(cells[2]),
    evolution,
    requirement: cells[4].match(/with ([A-Za-z]+)/)?.[1] || null,
  });
}
const typeHtml = fs.readFileSync(
  path.join(sourceDir, "types-temp.html"),
  "utf8",
);
const table = typeHtml.match(
  /<table[^>]*id="chart"[^>]*>([\s\S]*?)<\/table>/,
)[1];
const chart = {};
for (const row of table.matchAll(/<tr>([\s\S]*?)<\/tr>/g)) {
  const name = row[1].match(/<th[^>]*>([\s\S]*?)<\/th>/)?.[1];
  const cells = [...row[1].matchAll(/<td[^>]*>([\s\S]*?)<\/td>/g)].map(
    (x) => Number(clean(x[1]).replace("×", "")) || 1,
  );
  if (cells.length === 18) chart[clean(name)] = cells;
}
if (
  pokemon.length < 900 ||
  moves.length < 60 ||
  Object.keys(chart).length !== 18
)
  throw new Error(
    "Unexpected source format; review the source before replacing data.",
  );
if (new Set(pokemon.map((p) => p.slug)).size !== pokemon.length)
  throw new Error("Duplicate Pokémon slugs");
if (
  Object.values(chart).some(
    (row) =>
      row.length !== 18 || row.some((v) => ![1, 0.3, 0.6, 1.6].includes(v)),
  )
)
  throw new Error("Invalid type chart");
for (const dir of ["src/data/pokedex", "src/data/moves", "src/data/tools"])
  fs.mkdirSync(dir, { recursive: true });
fs.writeFileSync(
  "src/data/pokedex/pokemon.json",
  JSON.stringify(pokemon, null, 2) + "\n",
);
fs.writeFileSync(
  "src/data/moves/moves.json",
  JSON.stringify(moves, null, 2) + "\n",
);
fs.writeFileSync(
  "src/data/tools/type-chart.json",
  JSON.stringify(chart, null, 2) + "\n",
);
console.log({
  pokemon: pokemon.length,
  moves: moves.length,
  types: Object.keys(chart),
});
