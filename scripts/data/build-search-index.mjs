import fs from "node:fs";
const read = (p) => JSON.parse(fs.readFileSync(p, "utf8"));
const entries = [
  ...[
    [
      "Level-up cards",
      "/level-up",
      "move evolution stat cards Vigor Power Sprint",
    ],
    ["Achievements", "/achievements", "130 medals rewards titles"],
    ["Tier List Maker", "/tier-list", "make custom personal tier board S A B C D export image"],
    ["Partner Rankings", "/rankings", "rank compare base attack HP speed stats starters"],
  ].map(([label, href, keywords]) => ({ label, href, keywords, icon: "▤" })),
  ...read("src/data/pokedex/pokemon.json")
    .filter((p) => p.hasDetailPage)
    .map((p) => ({
      label: p.name,
      href: "/pokedex/" + p.slug,
      icon: "◓",
      keywords: `${p.id} #${p.id} ${p.types.join(" ")} ${p.region}`,
    })),
  ...read("src/data/moves/moves.json").map((m) => ({
    label: m.name,
    href: "/level-up#move-" + m.slug,
    icon: "ϟ",
    keywords: `${m.type} ${m.evolution || ""} ${m.requirement || ""}`,
  })),
  ...read("src/data/wiki/items.json").map(item => ({
    label: item.name,
    href: "/level-up#item-" + item.id,
    icon: "◇",
    keywords: `boss drop held item equipment ${item.description}`,
  })),
  {
    label: "Bond fusion",
    href: "/level-up#bond-fusion",
    icon: "⬡",
    keywords: "Rift legendary reward fuse combine learned moves active slot four moves",
  },
  {
    label: "Boss attack patterns",
    href: "/level-up#boss-patterns",
    icon: "▤",
    keywords: "enemy only not learnable " + read("src/data/game/boss-rewards.json").patterns.map(pattern => pattern.name).join(" "),
  },
  ...read("src/data/guides/guides.json").map((g) => ({
    label: g.title,
    href: "/guides/" + g.slug,
    icon: g.icon,
    keywords: g.description,
  })),
];
fs.writeFileSync("public/search-index.json", JSON.stringify(entries) + "\n");
console.log(`Generated ${entries.length} searchable entries.`);
