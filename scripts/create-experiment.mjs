#!/usr/bin/env node

/**
 * Non-interactive experiment scaffolding for AI agents.
 *
 * Usage:
 *   node scripts/create-experiment.mjs --name "my experiment" --profile r3f-scene
 *   node scripts/create-experiment.mjs --name "scroll thing" --profile scrollytelling --toolkit --leva
 *   node scripts/create-experiment.mjs --name "quick test" --profile blank
 *
 * Flags:
 *   --name        (required) Experiment name
 *   --description (optional) Short description
 *   --complexity  (optional) beginner | intermediate | advanced (default: intermediate)
 *   --profile     (optional) blank | r3f-scene | r3f-shader | scrollytelling | interaction | web-audio | dom-effect | mixed (default: blank)
 *   --toolkit     (optional) Include toolkit wiring. Defaults to true for scrollytelling/r3f-scene/r3f-shader.
 *   --no-toolkit  (optional) Explicitly disable toolkit wiring.
 *   --leva        (optional) Include leva debug GUI (default: false)
 */

import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");

const VALID_PROFILES = [
  "blank",
  "r3f-scene",
  "r3f-shader",
  "scrollytelling",
  "interaction",
  "web-audio",
  "dom-effect",
  "mixed",
];
const VALID_COMPLEXITY = ["beginner", "intermediate", "advanced"];
const TOOLKIT_DEFAULT_PROFILES = [
  "scrollytelling",
  "r3f-scene",
  "r3f-shader",
  "mixed",
];

function parseArgs(argv) {
  const args = {};
  for (let i = 2; i < argv.length; i++) {
    const arg = argv[i];
    if (arg === "--toolkit") {
      args.toolkit = true;
    } else if (arg === "--no-toolkit") {
      args.toolkit = false;
    } else if (arg === "--leva") {
      args.leva = true;
    } else if (arg.startsWith("--")) {
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
      'Usage: node scripts/create-experiment.mjs --name "my experiment" --profile r3f-scene'
    );
    process.exit(1);
  }

  const profile = args.profile || "blank";
  if (!VALID_PROFILES.includes(profile)) {
    console.error(
      `Error: Invalid profile "${profile}". Valid: ${VALID_PROFILES.join(", ")}`
    );
    process.exit(1);
  }

  const complexity = args.complexity || "intermediate";
  if (!VALID_COMPLEXITY.includes(complexity)) {
    console.error(
      `Error: Invalid complexity "${complexity}". Valid: ${VALID_COMPLEXITY.join(", ")}`
    );
    process.exit(1);
  }

  const includeToolkit =
    args.toolkit !== undefined
      ? args.toolkit
      : profile !== "blank" && TOOLKIT_DEFAULT_PROFILES.includes(profile);

  const includeLeva = args.leva;
  const description = args.description || "";

  const { default: nodePlop } = await import("node-plop");
  const plop = await nodePlop(path.join(ROOT, "plopfile.js"));
  const generator = plop.getGenerator("experiment");

  const answers = {
    name: args.name,
    description,
    complexity,
    profile,
    includeToolkit: profile !== "blank" ? includeToolkit : false,
    includeLeva: profile !== "blank" ? includeLeva : false,
  };

  console.log(`Scaffolding experiment: "${args.name}"`);
  console.log(
    `  Profile: ${profile} | Complexity: ${complexity} | Toolkit: ${includeToolkit} | Leva: ${includeLeva}`
  );

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
  console.log(`\nExperiment created at /experiments/${slug}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
