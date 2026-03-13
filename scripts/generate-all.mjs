#!/usr/bin/env node

/**
 * Orchestrator for the full generation pipeline.
 * Runs posters, registry (4-step), and llms-txt in parallel where safe.
 *
 * Dependency graph (verified via I/O analysis — zero write conflicts):
 *   posters      (independent)
 *   registry     (4 sequential steps, independent of posters/llms-txt)
 *   llms-txt     (independent)
 */

import { execFile } from "node:child_process";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");

function run(script) {
  const abs = resolve(ROOT, script);
  return new Promise((resolve, reject) => {
    execFile("node", [abs], { cwd: ROOT, stdio: "inherit" }, (err) =>
      err ? reject(err) : resolve()
    );
  });
}

async function runSequentialTimed(scripts) {
  const durations = [];
  for (const s of scripts) {
    const t = performance.now();
    await run(s);
    durations.push(performance.now() - t);
  }
  return durations;
}

const registrySteps = [
  "scripts/generate-registry-json.mjs",
  "scripts/build-registry.mjs",
  "scripts/post-process-registry.mjs",
  "scripts/generate-registry-mdx.mjs",
];

const t0 = performance.now();

const results = await Promise.all([
  (async () => {
    const t = performance.now();
    await run("scripts/generate-posters.mjs");
    return { name: "posters", ms: performance.now() - t };
  })(),

  (async () => {
    const t = performance.now();
    const stepMs = await runSequentialTimed(registrySteps);
    const labels = ["json", "build", "post", "mdx"];
    const detail = labels
      .map((l, i) => `${l} ${(stepMs[i] / 1000).toFixed(1)}s`)
      .join(" + ");
    return { name: "registry", ms: performance.now() - t, detail };
  })(),

  (async () => {
    const t = performance.now();
    await run("scripts/generate-llms-txt.mjs");
    return { name: "llms-txt", ms: performance.now() - t };
  })(),
]);

const totalMs = performance.now() - t0;
const sequentialMs = results.reduce((sum, r) => sum + r.ms, 0);

console.log("\ngenerate:all");
for (const r of results) {
  const line = `  ${r.name.padEnd(14)} ${(r.ms / 1000).toFixed(1)}s`;
  console.log(r.detail ? `${line}  (${r.detail})` : line);
}
const saved = sequentialMs - totalMs;
console.log(
  `  ${"total".padEnd(14)} ${(totalMs / 1000).toFixed(1)}s` +
    (saved > 100
      ? `  (saved ${(saved / 1000).toFixed(1)}s vs ${(sequentialMs / 1000).toFixed(1)}s sequential)`
      : "")
);
