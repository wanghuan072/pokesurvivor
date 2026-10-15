import fs from "node:fs";
import { execFileSync } from "node:child_process";
const { revision } = JSON.parse(
  fs.readFileSync("scripts/data/source-revision.json", "utf8"),
);
if (!/^[a-f0-9]{40}$/.test(revision))
  throw new Error("Expected a pinned source commit.");
const curl = process.platform === "win32" ? "curl.exe" : "curl";
const download = (url) =>
  execFileSync(
    curl,
    [
      "--fail",
      "--silent",
      "--show-error",
      "--location",
      "--retry",
      "2",
      "--max-time",
      "45",
      url,
    ],
    { encoding: "utf8", maxBuffer: 8 * 1024 * 1024 },
  );
fs.mkdirSync(".cache/sources", { recursive: true });
fs.mkdirSync(".cache/research", { recursive: true });
const root = `https://raw.githubusercontent.com/JPTER78/pokesurvivor/${revision}/`;
for (const page of ["pokedex", "moves", "types"])
  fs.writeFileSync(
    `.cache/sources/${page}-temp.html`,
    download(root + `en/${page}/index.html`),
  );
const files = [
  "js/data/pokedex.js",
  "js/data/moves.js",
  "js/data/starters.js",
  "js/data/lang-en.js",
  "js/data/items.js",
  "js/data/upgrades.js",
  "js/data/achievements.js",
  "js/data/changelog.js",
  "js/systems/gacha.js",
  "js/systems/levelup.js",
  "js/systems/weather.js",
  "version.json",
];
for (const file of files)
  fs.writeFileSync(
    ".cache/research/" + file.replaceAll("/", "-"),
    download(root + file),
  );
const tracked = [];
function collect(dir) {
  for (const item of fs.readdirSync(dir, { withFileTypes: true })) {
    const path = dir + "/" + item.name;
    if (item.isDirectory()) collect(path);
    else if (path.endsWith(".json"))
      tracked.push([path, fs.readFileSync(path)]);
  }
}
collect("src/data");
try {
  execFileSync(process.execPath, ["scripts/data/import-official.mjs"], {
    stdio: "inherit",
  });
  execFileSync(process.execPath, ["scripts/data/import-pinned-game.mjs"], {
    stdio: "inherit",
  });
  execFileSync(process.execPath, ["scripts/data/build-search-index.mjs"], {
    stdio: "inherit",
  });
} catch (error) {
  for (const [path, contents] of tracked) fs.writeFileSync(path, contents);
  throw error;
}
