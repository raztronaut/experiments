#!/usr/bin/env node

/**
 * export-component-preview-slugs.mjs
 *
 * Reads src/components/registry/ui-component-previews.tsx and extracts the
 * keys of UI_COMPONENT_PREVIEWS. Writes a JSON array to scripts/component-preview-slugs.json
 * so generate-registry-mdx.mjs can use it without importing TS.
 * Single source of truth: the TS file; this script runs before MDX generation.
 */

import { readFile, writeFile } from "node:fs/promises";
import { join, resolve } from "node:path";

const ROOT = resolve(import.meta.dirname, "..");
const SOURCE = join(
  ROOT,
  "src",
  "components",
  "registry",
  "ui-component-previews.tsx"
);
const OUT = join(ROOT, "scripts", "component-preview-slugs.json");

const content = await readFile(SOURCE, "utf-8");

// Restrict to the UI_COMPONENT_PREVIEWS object body (between "= {" and its closing "};").
const startMarker = "UI_COMPONENT_PREVIEWS: Record";
const startIdx = content.indexOf(startMarker);
if (startIdx === -1) {
  throw new Error(`UI_COMPONENT_PREVIEWS not found in ${SOURCE}`);
}
const blockStart = content.indexOf("= {", startIdx) + 3;
let depth = 1;
let i = blockStart;
while (i < content.length && depth > 0) {
  const c = content[i];
  if (c === "{") {
    depth++;
  } else if (c === "}") {
    depth--;
  }
  i++;
}
const block = content.slice(blockStart, i - 1);

// Top-level keys only: exactly 2 spaces, then "key" or 'key', then ": {"
const keyRegex = /^ {2}(?:"([^"]+)"|([a-zA-Z0-9_-]+))\s*:\s*\{/gm;
const slugs = [];
let match;
while ((match = keyRegex.exec(block)) !== null) {
  slugs.push(match[1] ?? match[2]);
}

await writeFile(OUT, `${JSON.stringify(slugs, null, 2)}\n`, "utf-8");
console.log(
  `export-component-preview-slugs: wrote ${slugs.length} slugs to ${OUT}`
);
