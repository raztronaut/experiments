#!/usr/bin/env node
/**
 * Bundle size budget — fails CI if client chunks exceed thresholds.
 * Run after `npm run build`. S-tier performance gating.
 *
 * Usage: node scripts/bundle-size-budget.mjs
 * Exit 0: within budget
 * Exit 1: over budget (with summary)
 */

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const CHUNKS_DIR = path.join(__dirname, "../.next/static/chunks");

// Budgets (uncompressed — gzip happens at CDN)
const BUDGETS = {
  totalClientKB: 22_000, // ~22 MB total client JS (baseline ~19.5 MB)
  singleChunkKB: 850, // No single chunk over 850 KB (baseline max ~764 KB)
};

function getChunkSizes() {
  if (!fs.existsSync(CHUNKS_DIR)) {
    console.error("Chunks dir not found. Run `npm run build` first.");
    process.exit(1);
  }

  const files = fs.readdirSync(CHUNKS_DIR).filter((f) => f.endsWith(".js"));
  return files.map((f) => {
    const p = path.join(CHUNKS_DIR, f);
    const stat = fs.statSync(p);
    return { name: f, bytes: stat.size, kb: Math.round(stat.size / 1024) };
  });
}

function main() {
  const chunks = getChunkSizes();
  const totalBytes = chunks.reduce((sum, c) => sum + c.bytes, 0);
  const totalKB = Math.round(totalBytes / 1024);
  const maxChunk = chunks.reduce(
    (max, c) => (c.bytes > max.bytes ? c : max),
    chunks[0]
  );
  const maxChunkKB = Math.round(maxChunk.bytes / 1024);

  const overTotal = totalKB > BUDGETS.totalClientKB;
  const overSingle = maxChunkKB > BUDGETS.singleChunkKB;
  const failed = overTotal || overSingle;

  console.log("\n📦 Bundle size budget\n");
  console.log(`  Total client chunks: ${chunks.length} files, ${totalKB} KB`);
  console.log(`  Largest chunk: ${maxChunk.name} (${maxChunkKB} KB)`);
  console.log(
    `  Budget: total ≤ ${BUDGETS.totalClientKB} KB, single ≤ ${BUDGETS.singleChunkKB} KB`
  );
  console.log("");

  if (overTotal) {
    console.error(
      `  ❌ Total ${totalKB} KB exceeds budget of ${BUDGETS.totalClientKB} KB`
    );
  } else {
    console.log("  ✓ Total within budget");
  }

  if (overSingle) {
    console.error(
      `  ❌ Largest chunk ${maxChunkKB} KB exceeds ${BUDGETS.singleChunkKB} KB`
    );
  } else {
    console.log("  ✓ No single chunk over budget");
  }

  if (failed) {
    console.log("\n  Run `npm run analyze` to inspect bundle composition.\n");
    process.exit(1);
  }

  console.log("");
  process.exit(0);
}

main();
