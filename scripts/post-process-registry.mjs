#!/usr/bin/env node

/**
 * Post-process registry: read built per-item JSON files and registry.json manifest,
 * validate schemas, then generate index.json (content-stripped) and index-slim.json
 * (lightweight grid index).
 *
 * Step 3 of the registry pipeline:
 *   generate-registry-json.mjs → build-registry.mjs → post-process-registry.mjs
 */

import { readdir, readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";

const ROOT_DIR = process.cwd();
const REGISTRY_DIR = join(ROOT_DIR, "public", "registry");
const MANIFEST_PATH = join(ROOT_DIR, "registry.json");

const EXCLUDED_FILES = new Set([
  "index.json",
  "index-slim.json",
  "razi-style.json",
]);

// ---------------------------------------------------------------------------
// Validation
// ---------------------------------------------------------------------------

function validateItem(item, filename) {
  const warnings = [];
  const required = ["$schema", "name", "type", "title", "description", "files"];

  for (const field of required) {
    if (item[field] === undefined || item[field] === null) {
      warnings.push(`${filename}: missing required field "${field}"`);
    }
  }

  if (!Array.isArray(item.files)) {
    warnings.push(`${filename}: "files" is not an array`);
    return warnings;
  }

  for (let i = 0; i < item.files.length; i++) {
    const file = item.files[i];
    for (const field of ["name", "type", "content"]) {
      if (!file[field] && file[field] !== "") {
        warnings.push(`${filename}: files[${i}] missing "${field}"`);
      }
    }
  }

  if (item.dependencies === undefined) {
    warnings.push(`${filename}: missing recommended field "dependencies"`);
  }
  if (item.registryDependencies === undefined) {
    warnings.push(
      `${filename}: missing recommended field "registryDependencies"`
    );
  }

  return warnings;
}

// ---------------------------------------------------------------------------
// Read inputs
// ---------------------------------------------------------------------------

async function readPerItemFiles() {
  const entries = await readdir(REGISTRY_DIR);
  const jsonFiles = entries.filter(
    (f) => f.endsWith(".json") && !EXCLUDED_FILES.has(f)
  );

  const items = [];
  const allWarnings = [];

  for (const file of jsonFiles) {
    try {
      const raw = await readFile(join(REGISTRY_DIR, file), "utf-8");
      const parsed = JSON.parse(raw);
      const warnings = validateItem(parsed, file);
      allWarnings.push(...warnings);
      items.push(parsed);
    } catch (err) {
      allWarnings.push(`${file}: failed to parse — ${err.message}`);
    }
  }

  return { items, warnings: allWarnings };
}

async function readManifest() {
  try {
    const raw = await readFile(MANIFEST_PATH, "utf-8");
    const manifest = JSON.parse(raw);
    const metaMap = new Map();

    if (Array.isArray(manifest.items)) {
      for (const entry of manifest.items) {
        if (entry.name) {
          metaMap.set(entry.name, {
            ...(entry.meta || {}),
            category: entry.category,
            featured: entry.meta?.featured,
          });
        }
      }
    }

    return metaMap;
  } catch {
    console.warn(
      "⚠️  registry.json not found or unreadable — meta fields will use defaults"
    );
    return new Map();
  }
}

// ---------------------------------------------------------------------------
// Generate index.json (content-stripped full index)
// ---------------------------------------------------------------------------

function buildIndex(items) {
  return items.map((item) => ({
    ...item,
    files: Array.isArray(item.files)
      ? item.files.map(({ content, ...rest }) => rest)
      : [],
  }));
}

// ---------------------------------------------------------------------------
// Generate index-slim.json (lightweight grid index)
// ---------------------------------------------------------------------------

function inferCategoryFromType(type) {
  switch (type) {
    case "registry:block":
      return "experiments";
    case "registry:component":
      return "components";
    case "registry:hook":
      return "hooks";
    case "registry:lib":
      return "utilities";
    case "registry:style":
      return "styles";
    default:
      return "experiments";
  }
}

function buildSlimIndex(items, metaMap) {
  const slimItems = items.map((item) => {
    const meta = metaMap.get(item.name) || {};
    const category =
      item.category ?? meta.category ?? inferCategoryFromType(item.type);

    return {
      name: item.name,
      type: item.type ?? "registry:block",
      title: item.title ?? item.name,
      description: item.description ?? "",
      tags: meta.tags ?? [],
      tech: meta.tech ?? [],
      status: meta.status ?? "shipped",
      poster: meta.poster ?? null,
      video: meta.video ?? null,
      category,
      fileCount: Array.isArray(item.files) ? item.files.length : 0,
      dependencyCount: Array.isArray(item.dependencies)
        ? item.dependencies.length
        : 0,
    };
  });

  slimItems.sort((a, b) => {
    const aFeatured = metaMap.get(a.name)?.featured ? 1 : 0;
    const bFeatured = metaMap.get(b.name)?.featured ? 1 : 0;
    if (aFeatured !== bFeatured) {
      return bFeatured - aFeatured;
    }
    return a.name.localeCompare(b.name);
  });

  return slimItems;
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

async function main() {
  const [{ items, warnings }, metaMap] = await Promise.all([
    readPerItemFiles(),
    readManifest(),
  ]);

  if (warnings.length > 0) {
    console.warn(`\n⚠️  Validation warnings (${warnings.length}):`);
    for (const w of warnings) {
      console.warn(`   ${w}`);
    }
    console.warn("");
  }

  if (items.length === 0) {
    console.error(
      "❌ No per-item JSON files found in public/registry/ — pipeline may be broken"
    );
    process.exit(1);
  }

  const indexItems = buildIndex(items);
  const indexJson = JSON.stringify(indexItems, null, 2);
  await writeFile(join(REGISTRY_DIR, "index.json"), indexJson);
  const indexKB = (Buffer.byteLength(indexJson) / 1024).toFixed(1);
  console.log(
    `✅ Generated index.json (${indexItems.length} items, ${indexKB} KB)`
  );

  const slimItems = buildSlimIndex(items, metaMap);
  const slimJson = JSON.stringify(slimItems, null, 2);
  await writeFile(join(REGISTRY_DIR, "index-slim.json"), slimJson);
  const slimKB = (Buffer.byteLength(slimJson) / 1024).toFixed(1);
  console.log(
    `✅ Generated index-slim.json (${slimItems.length} items, ${slimKB} KB)`
  );

  console.log("📦 Post-processing complete.");
}

main();
