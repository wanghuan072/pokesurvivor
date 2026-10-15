// Read literal data through TypeScript's parser. Downloaded game code is never executed.
import fs from "node:fs";
import ts from "typescript";
const { revision, reviewed } = JSON.parse(
  fs.readFileSync("scripts/data/source-revision.json", "utf8"),
);
const dir = process.argv[2] || ".cache/research";
function source(file) {
  return ts.createSourceFile(
    file,
    fs.readFileSync(`${dir}/${file.replaceAll("/", "-")}`, "utf8"),
    ts.ScriptTarget.Latest,
    true,
    ts.ScriptKind.JS,
  );
}
function literal(n) {
  if (ts.isStringLiteral(n) || ts.isNoSubstitutionTemplateLiteral(n))
    return n.text;
  if (ts.isNumericLiteral(n)) return Number(n.text);
  if (n.kind === ts.SyntaxKind.TrueKeyword) return true;
  if (n.kind === ts.SyntaxKind.FalseKeyword) return false;
  if (n.kind === ts.SyntaxKind.NullKeyword) return null;
  if (ts.isPrefixUnaryExpression(n)) {
    const v = literal(n.operand);
    return n.operator === ts.SyntaxKind.MinusToken ? -v : v;
  }
  if (ts.isBinaryExpression(n)) {
    const a = literal(n.left),
      b = literal(n.right);
    if (typeof a === "number" && typeof b === "number") {
      if (n.operatorToken.kind === ts.SyntaxKind.SlashToken) return a / b;
      if (n.operatorToken.kind === ts.SyntaxKind.AsteriskToken) return a * b;
    }
  }
  if (ts.isArrayLiteralExpression(n)) return n.elements.map(literal);
  if (ts.isObjectLiteralExpression(n)) {
    const obj = {};
    for (const p of n.properties) {
      if (!ts.isPropertyAssignment(p)) continue;
      const v = literal(p.initializer);
      if (v !== undefined) obj[p.name.text] = v;
    }
    return obj;
  }
  return undefined;
}
function find(file, name) {
  let result;
  function visit(n) {
    if (
      ts.isVariableDeclaration(n) &&
      n.name.getText() === name &&
      n.initializer
    )
      result = literal(n.initializer);
    if (ts.isBinaryExpression(n) && n.left.getText() === name)
      result = literal(n.right);
    ts.forEachChild(n, visit);
  }
  visit(source(file));
  if (result === undefined) throw new Error(`Missing literal ${file}:${name}`);
  return result;
}
let dictionary = {};
const en = source("js/data/lang-en.js");
function visitEn(n) {
  if (ts.isCallExpression(n) && n.expression.getText() === "G.I18n.add")
    dictionary = { ...dictionary, ...literal(n.arguments[0]) };
  ts.forEachChild(n, visitEn);
}
visitEn(en);
const translate = (text) => dictionary[text] || text;
const existing = JSON.parse(
  fs.readFileSync("src/data/pokedex/pokemon.json", "utf8"),
);
const oldMoves = JSON.parse(
  fs.readFileSync("src/data/moves/moves.json", "utf8"),
);
const dex = find("js/data/pokedex.js", "G.DEX"),
  rawMoves = find("js/data/moves.js", "RAW"),
  ladders = find("js/data/moves.js", "LADDERS"),
  evoMods = find("js/data/moves.js", "EVO_MODS"),
  evo = find("js/data/moves.js", "EVO"),
  starts = find("js/data/moves.js", "START"),
  starters = find("js/data/starters.js", "G.STARTERS");
const pokemon = existing.map((p) => {
  const raw = dex.find((x) => x.dex === p.id);
  if (!raw) throw new Error(`Missing species ${p.id}`);
  const learned = rawMoves
    .filter((m) => m.type === "normal" || raw.types.includes(m.type))
    .map((m) => m.id);
  const startMove =
    starters.find((s) => s.dex === p.id)?.start ||
    raw.start ||
    starts[raw.types[0]] ||
    "tackle";
  return {
    ...p,
    name: p.id === 772 ? "Type: Null" : p.name,
    hp: raw.hp,
    speed: raw.spd,
    attack: raw.atk,
    baseStatTotal: raw.bst,
    rarity: raw.rarity,
    generation: raw.gen,
    startMove,
    cardPool: learned,
    learnset: [...new Set([startMove, ...learned])],
  };
});
const moves = oldMoves.map((m) => {
  const raw = rawMoves.find((r) => translate(r.name) === m.name);
  if (!raw) throw new Error(`Missing move ${m.name}`);
  const levels = [
    {
      level: 1,
      ...Object.fromEntries(
        Object.entries(raw).filter(([, v]) => typeof v === "number"),
      ),
    },
  ];
  for (const step of ladders[raw.kind]) {
    const next = { ...levels.at(-1), level: levels.length + 1 };
    for (const [k, v] of Object.entries(step.m)) {
      if (["count", "pierce", "stacks"].includes(k))
        next[k] = (next[k] || 0) + v;
      else if (
        [
          "dmg",
          "cd",
          "speed",
          "radius",
          "dur",
          "amount",
          "arc",
          "width",
          "spread",
          "life",
          "size",
          "rate",
        ].includes(k) &&
        next[k] !== undefined
      )
        next[k] *= v;
      else next[k] = v;
    }
    levels.push(next);
  }
  return {
    ...m,
    id: raw.id,
    behavior: raw.kind,
    maxLevel: levels.length,
    base: levels[0],
    levels,
    evolutionModifiers: evo[raw.id] ? evoMods[raw.kind]?.m || null : null,
  };
});
const items = find("js/data/items.js", "LIST").map((i) => ({
  id: i.id,
  name: translate(i.name),
  description: translate(i.desc),
}));
const upgrades = find("js/data/upgrades.js", "LIST").map((u) => ({
  id: u.id,
  name: translate(u.name),
  effect: translate(u.unit),
  max: u.max,
  baseCost: u.base,
  growth: u.grow,
}));
const cards = find("js/systems/levelup.js", "STATS").map((c) => ({
  id: c.id,
  name: translate(c.title),
  description: translate(c.desc),
  max: c.max || null,
}));
const cats = {
  coleccion: "Collection",
  supervivencia: "Survival",
  combate: "Combat",
  grietas: "Rifts",
  legendarios: "Legendary encounters",
  otros: "Missions & more",
};
const achievements = find("js/data/achievements.js", "LIST").map((a) => ({
  id: a.id,
  category: cats[a.cat],
  name: translate(a.name),
  description: translate(a.desc),
  tier: a.tier,
  goal: a.goal,
  reward: a.reward,
  title: a.title ? translate(a.title) : null,
}));
for (const p of pokemon.filter((p) => p.legendary))
  achievements.push({
    id: "leg_" + p.id,
    category: "Legendary encounters",
    name: `Defeat ${p.name}`,
    description: `Defeat ${p.name} in a Rift.`,
    tier: 2,
    goal: 1,
    reward: { t1: 1 },
    title: null,
    pokemonId: p.id,
  });
for (const a of achievements) {
  if (a.id === "ownAll") {
    a.goal = pokemon.length;
    a.description = `Own ${pokemon.length} different Pokémon.`;
  }
  if (a.id === "evoAll") {
    a.goal = Object.keys(evo).length;
    a.description = `Evolve ${a.goal} different moves.`;
  }
  if (a.id === "legAll") {
    a.goal = pokemon.filter((p) => p.legendary).length;
    a.description = `Defeat all ${a.goal} Rift legendary partners.`;
  }
}
const weather = Object.entries(find("js/systems/weather.js", "KINDS")).map(
  ([id, w]) => ({
    id,
    name: {
      sun: "Sun",
      rain: "Rain",
      sand: "Sandstorm",
      snow: "Snow",
      fog: "Fog",
    }[id],
    multipliers: w.mult,
    safeTypes: w.safe || [],
    slowsOtherTypes: !!w.slow,
  }),
);
const changeSummaries = JSON.parse(
  fs.readFileSync("src/data/wiki/change-summaries.json", "utf8"),
);
const changes = find("js/data/changelog.js", "G.CHANGELOG")
  .filter((c) => changeSummaries[c.d])
  .map((c) => ({ date: c.d, title: c.title[1], ...changeSummaries[c.d] }));
const gacha = {
  rates: find("js/systems/gacha.js", "RATES").map(([rarity, percent]) => ({
    rarity,
    percent,
  })),
  pity: find("js/systems/gacha.js", "PITY_5"),
  shinyRate: find("js/systems/gacha.js", "SHINY_RATE"),
  refund: find("js/systems/gacha.js", "REFUND"),
  banners: [...new Set(pokemon.map((p) => p.region))].map((region, i) => ({
    region,
    generation: i + 1,
    counts: [1, 2, 3, 4, 5].map(
      (rarity) =>
        pokemon.filter((p) => p.region === region && p.rarity === rarity)
          .length,
    ),
  })),
};
const version = JSON.parse(fs.readFileSync(`${dir}/version.json`, "utf8"));
const snapshot = {
  reviewed,
  revision,
  build: version.v,
  builtAt: version.at,
  counts: {
    pokemon: pokemon.length,
    moves: moves.length,
    evolutions: moves.filter((m) => m.evolution).length,
    starters: starters.length,
    items: items.length,
    upgrades: upgrades.length,
    achievements: achievements.length,
    legendaries: pokemon.filter((p) => p.legendary).length,
  },
  sourceBase: `https://github.com/JPTER78/pokesurvivor/blob/${revision}/`,
};
if (
  pokemon.length !== 966 ||
  moves.length !== 64 ||
  achievements.length !== 130
)
  throw new Error("Unexpected source counts; inspect before importing.");
const output = {
  "pokedex/pokemon": pokemon,
  "moves/moves": moves,
  "wiki/items": items,
  "wiki/upgrades": upgrades,
  "wiki/run-cards": cards,
  "wiki/achievements": achievements,
  "wiki/weather": weather,
  "wiki/changes": changes,
  "wiki/gacha": gacha,
  "wiki/source-snapshot": snapshot,
};
for (const [name, data] of Object.entries(output)) {
  fs.mkdirSync("src/data/" + name.split("/")[0], { recursive: true });
  fs.writeFileSync(
    "src/data/" + name + ".json",
    JSON.stringify(data, null, 2) + "\n",
  );
}
console.log(snapshot);
