/**
 * Patches r3f-perf's roboto.woff.mjs source map so Turbopack doesn't
 * try to read the binary .woff file (which causes a UTF-8 decode error).
 *
 * The fix: embed the generated JS in `sourcesContent` so the bundler
 * never resolves the binary `../src/roboto.woff` source reference.
 */
import { existsSync, readFileSync, writeFileSync } from "node:fs";

const mapPath = "node_modules/r3f-perf/dist/roboto.woff.mjs.map";
const mjsPath = "node_modules/r3f-perf/dist/roboto.woff.mjs";

if (!existsSync(mapPath)) {
  process.exit(0);
}

const mjsContent = readFileSync(mjsPath, "utf-8").replace(
  /\/\/# sourceMappingURL=.*$/m,
  ""
);

const map = JSON.parse(readFileSync(mapPath, "utf-8"));

if (map.sourcesContent) {
  process.exit(0);
}

map.sourcesContent = [mjsContent];
writeFileSync(mapPath, JSON.stringify(map));

console.log("[patch-r3f-perf] fixed roboto.woff.mjs source map");
