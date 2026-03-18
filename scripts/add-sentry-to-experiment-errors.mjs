#!/usr/bin/env node
/**
 * One-time script: add captureExperimentError to each experiment error.tsx with correct slug.
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");
const experimentsDir = path.join(root, "src/app/experiments");

const entries = fs.readdirSync(experimentsDir, { withFileTypes: true });
for (const ent of entries) {
  if (!ent.isDirectory()) {
    continue;
  }
  const slug = ent.name.replace(/^\((.+)\)$/, "$1");
  const errPath = path.join(experimentsDir, ent.name, slug, "error.tsx");
  if (!fs.existsSync(errPath)) {
    continue;
  }
  let content = fs.readFileSync(errPath, "utf8");
  if (content.includes("captureExperimentError")) {
    continue;
  }
  content = content.replace(
    /import \{ useEffect \} from "react";/,
    'import { captureExperimentError } from "@/lib/sentry";\nimport { useEffect } from "react";'
  );
  content = content.replace(
    /console\.error\(error\);\n {2}}, \[error\]\)/,
    `console.error(error);\n    captureExperimentError(error, undefined, { route: "experiment", slug: "${slug}" });\n  }, [error])`
  );
  fs.writeFileSync(errPath, content);
  console.log("Updated", path.relative(root, errPath));
}
