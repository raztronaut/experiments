#!/usr/bin/env node

/**
 * Non-interactive article scaffolding for AI agents.
 *
 * Usage:
 *   node scripts/create-article.mjs --name "404-not-found"
 *   node scripts/create-article.mjs --name "gravity-physics-ui-layout" --description "Physics-based layout engine"
 *
 * Flags:
 *   --name        (required) Experiment name (must match existing experiment)
 *   --description (optional) Short article description
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
      'Usage: node scripts/create-article.mjs --name "my-experiment"'
    );
    process.exit(1);
  }

  const description = args.description || "";

  const { default: nodePlop } = await import("node-plop");
  const plop = await nodePlop(path.join(ROOT, "plopfile.js"));
  const generator = plop.getGenerator("article");

  const answers = {
    name: args.name,
    description,
  };

  console.log(`Scaffolding article for experiment: "${args.name}"`);

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
  console.log(`\nArticle created at /experiments/${slug}/article`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
