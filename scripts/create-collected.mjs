#!/usr/bin/env node

/**
 * Non-interactive collected component scaffolding for AI agents.
 *
 * Usage:
 *   node scripts/create-collected.mjs --name "magnetic-button" --source "https://github.com/..." --author "Codegrid"
 *   node scripts/create-collected.mjs --name "hover-card" --source "https://..." --author "SmoothUI" --license "MIT"
 *
 * Flags:
 *   --name    (required) Component name
 *   --source  (required) Source URL (GitHub repo or demo URL)
 *   --author  (required) Original author
 *   --license (optional) License, defaults to MIT
 */

import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");

function parseArgs(argv) {
  const args = {};
  for (let i = 2; i < argv.length; i++) {
    const arg = argv[i];
    if (arg.startsWith("--")) {
      const key = arg.slice(2);
      const next = argv[i + 1];
      if (next && !next.startsWith("--")) {
        args[key] = next;
        i++;
      } else {
        args[key] = true;
      }
    }
  }
  return args;
}

async function main() {
  const args = parseArgs(process.argv);

  if (!args.name) {
    console.error("Error: --name is required");
    console.error(
      'Usage: node scripts/create-collected.mjs --name "component-name" --source "https://..." --author "Author"'
    );
    process.exit(1);
  }

  if (!args.source) {
    console.error("Error: --source is required");
    process.exit(1);
  }

  if (!args.author) {
    console.error("Error: --author is required");
    process.exit(1);
  }

  const { default: nodePlop } = await import("node-plop");
  const plop = await nodePlop(path.join(ROOT, "plopfile.js"));
  const generator = plop.getGenerator("collected");

  const answers = {
    name: args.name,
    source: args.source,
    author: args.author,
    license: args.license || "MIT",
  };

  console.log(`Scaffolding collected component: "${args.name}"`);

  const results = await generator.runActions(answers);

  if (results.failures?.length) {
    console.error("Failures:");
    for (const f of results.failures) {
      console.error(`  ${f.type}: ${f.error || f.message}`);
    }
    process.exit(1);
  }

  for (const change of results.changes) {
    console.log(`  + ${change.path}`);
  }

  const dashCase = plop.getHelper("dashCase");
  const slug = dashCase(args.name);
  console.log(
    `\nCollected component created at src/components/collected/${slug}/`
  );
  console.log(
    `Preview will be available at /collected/${slug} after running npm run generate:registry`
  );
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
