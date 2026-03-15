#!/usr/bin/env node
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { writeIfChanged } from "./lib/write-if-changed.mjs";
import { SITE_URL } from "./lib/site-config.mjs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, "..");

const ASSET_BASE_URL = SITE_URL;
const ITEM_SCHEMA = "https://ui.shadcn.com/schema/registry-item.json";
const PUBLIC_REGISTRY_DIR = path.join(ROOT_DIR, "public", "registry");
const MANIFEST_PATH = path.join(ROOT_DIR, "registry.json");

const SHADCN_FIELDS = new Set([
  "$schema",
  "name",
  "type",
  "title",
  "description",
  "dependencies",
  "registryDependencies",
  "files",
  "tailwind",
  "cssVars",
]);

function inferFileType(filePath, content) {
  const basename = path.basename(filePath);
  const ext = path.extname(filePath);

  if ([".glsl", ".frag", ".vert"].includes(ext)) {
    return "registry:file";
  }

  const relDir = path.dirname(filePath);
  if (/[\\/]hooks[\\/]/.test(relDir) || basename.startsWith("use")) {
    return "registry:hook";
  }
  if (/[\\/](lib|utils)[\\/]/.test(relDir)) {
    return "registry:lib";
  }

  if ([".tsx", ".jsx"].includes(ext)) {
    const hasJSX = /<[A-Z]/.test(content) || /return\s*\(?\s*</.test(content);
    const hasCapitalExport =
      /export\s+(default\s+)?(?:function|const)\s+[A-Z]/.test(content);
    if (hasJSX || hasCapitalExport) {
      return "registry:component";
    }
  }

  return "registry:file";
}

function rewriteAssetUrls(content) {
  return content.replace(
    /(['"`])\/experiments\//g,
    `$1${ASSET_BASE_URL}/experiments/`
  );
}

async function buildRegistry() {
  let manifestRaw;
  try {
    manifestRaw = await fs.readFile(MANIFEST_PATH, "utf-8");
  } catch (err) {
    console.error(`❌ Cannot read registry.json: ${err.message}`);
    process.exit(1);
  }

  const manifest = JSON.parse(manifestRaw);
  if (!Array.isArray(manifest.items)) {
    console.error("❌ registry.json is missing an `items` array");
    process.exit(1);
  }

  await fs.mkdir(PUBLIC_REGISTRY_DIR, { recursive: true });

  const expectedFiles = new Set(manifest.items.map((i) => `${i.name}.json`));
  const existingFiles = await fs.readdir(PUBLIC_REGISTRY_DIR);
  const staleFiles = existingFiles.filter(
    (f) =>
      f.endsWith(".json") &&
      f !== "index.json" &&
      f !== "index-slim.json" &&
      !expectedFiles.has(f)
  );
  if (staleFiles.length > 0) {
    await Promise.all(
      staleFiles.map((f) => fs.unlink(path.join(PUBLIC_REGISTRY_DIR, f)))
    );
    console.log(
      `🧹 Cleaned ${staleFiles.length} stale files from public/registry/`
    );
  }

  let written = 0;
  let unchanged = 0;

  for (const item of manifest.items) {
    if (item.type === "registry:style") {
      const output = { $schema: ITEM_SCHEMA };
      for (const key of Object.keys(item)) {
        if (SHADCN_FIELDS.has(key)) {
          output[key] = item[key];
        }
      }
      const wrote = await writeIfChanged(
        path.join(PUBLIC_REGISTRY_DIR, `${item.name}.json`),
        JSON.stringify(output, null, 2)
      );
      if (wrote) {
        written++;
        console.log(`✅ Built: ${item.name} (style)`);
      } else {
        unchanged++;
      }
      continue;
    }

    if (!Array.isArray(item.files) || item.files.length === 0) {
      console.warn(`⚠️  Skipping ${item.name}: no files listed`);
      continue;
    }

    const seenPaths = new Set();
    const outputFiles = [];
    let skippedFiles = 0;

    for (const fileEntry of item.files) {
      const filePath = fileEntry.path;
      const resolved = path.resolve(ROOT_DIR, filePath);

      if (seenPaths.has(resolved)) {
        continue;
      }
      seenPaths.add(resolved);

      let content;
      try {
        content = await fs.readFile(resolved, "utf-8");
      } catch {
        console.warn(`⚠️  ${item.name}: file not found, skipping: ${filePath}`);
        skippedFiles++;
        continue;
      }

      content = rewriteAssetUrls(content);

      const confirmedType = fileEntry.type || inferFileType(filePath, content);
      const fileName = path.basename(filePath);

      const fileOutput = {
        name: fileName,
        type: confirmedType,
      };

      if (confirmedType === "registry:file") {
        const relFromSrc = filePath.startsWith("src/")
          ? filePath.slice(4)
          : `components/experiments/${item.name}/${fileName}`;
        fileOutput.target = relFromSrc;
      }

      fileOutput.content = content;
      outputFiles.push(fileOutput);
    }

    if (outputFiles.length === 0) {
      console.warn(
        `⚠️  Skipping ${item.name}: zero resolvable files (${skippedFiles} not found)`
      );
      continue;
    }

    const output = {
      $schema: ITEM_SCHEMA,
      name: item.name,
      type: item.type,
      title: item.title,
      description: item.description,
      category: item.category,
    };

    if (item.meta && Object.keys(item.meta).length > 0) {
      output.meta = item.meta;
    }

    if (Array.isArray(item.dependencies) && item.dependencies.length > 0) {
      output.dependencies = item.dependencies;
    }

    if (
      Array.isArray(item.registryDependencies) &&
      item.registryDependencies.length > 0
    ) {
      output.registryDependencies = item.registryDependencies;
    }

    output.files = outputFiles;

    const wrote = await writeIfChanged(
      path.join(PUBLIC_REGISTRY_DIR, `${item.name}.json`),
      JSON.stringify(output, null, 2)
    );
    if (wrote) {
      written++;
      console.log(`✅ Built: ${item.name} (${outputFiles.length} files)`);
    } else {
      unchanged++;
    }
  }

  console.log(
    `🚀 Registry: ${written} written, ${unchanged} unchanged` +
      (staleFiles.length > 0 ? `, ${staleFiles.length} stale deleted` : "")
  );
}

buildRegistry();
