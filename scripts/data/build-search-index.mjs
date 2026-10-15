import fs from "node:fs";
const read = (p) => JSON.parse(fs.readFileSync(p, "utf8"));
const entries = [
  ...read("src/data/builds/builds.json").map((b) => ({
    label: b.title,
    href: "/builds#build-" + b.slug,
    icon: "⬡",
    keywords: b.description,
  })),
  ...[
    [
      "Level-up cards",
      "/level-up",
      "move evolution stat cards Vigor Power Sprint",
    ],
    ["Achievements", "/achievements", "130 medals rewards titles"],
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
  ...read("src/data/guides/guides.json").map((g) => ({
    label: g.title,
    href: "/guides/" + g.slug,
    icon: g.icon,
    keywords: g.description,
  })),
];
fs.writeFileSync("public/search-index.json", JSON.stringify(entries) + "\n");
console.log(`Generated ${entries.length} searchable entries.`);
