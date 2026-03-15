#!/usr/bin/env node

/**
 * Validates that scripts/lib/site-config.mjs and src/lib/constants.ts
 * stay in sync on overlapping keys (SITE_URL, SITE_TITLE, AUTHOR_NAME, GITHUB_URL, TWITTER_URL).
 * Run: npm run validate:site-config
 * Used in lefthook pre-commit (no glob — runs every commit).
 */

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");

const KEYS = [
  "SITE_URL",
  "SITE_TITLE",
  "AUTHOR_NAME",
  "GITHUB_URL",
  "TWITTER_URL",
];

function extractFromSiteConfig() {
  const content = fs.readFileSync(
    path.join(ROOT, "scripts/lib/site-config.mjs"),
    "utf-8"
  );
  const result = {};
  for (const key of KEYS) {
    const re = new RegExp(`export const ${key}\\s*=\\s*["']([^"']+)["']`, "m");
    const m = content.match(re);
    if (m) {
      result[key] = m[1];
    }
  }
  return result;
}

function extractFromConstants() {
  const content = fs.readFileSync(
    path.join(ROOT, "src/lib/constants.ts"),
    "utf-8"
  );
  const result = {};
  for (const key of KEYS) {
    const re = new RegExp(`export const ${key}\\s*=\\s*["']([^"']+)["']`, "m");
    const m = content.match(re);
    if (m) {
      result[key] = m[1];
    }
  }
  return result;
}

try {
  const siteConfig = extractFromSiteConfig();
  const constants = extractFromConstants();

  const missingInSiteConfig = KEYS.filter((k) => !(k in siteConfig));
  const missingInConstants = KEYS.filter((k) => !(k in constants));

  if (missingInSiteConfig.length > 0) {
    console.error(
      `❌ site-config.mjs missing: ${missingInSiteConfig.join(", ")}`
    );
    process.exit(1);
  }
  if (missingInConstants.length > 0) {
    console.error(`❌ constants.ts missing: ${missingInConstants.join(", ")}`);
    process.exit(1);
  }

  const mismatches = KEYS.filter((k) => siteConfig[k] !== constants[k]);
  if (mismatches.length > 0) {
    for (const k of mismatches) {
      console.error(`❌ ${k} mismatch:`);
      console.error(`   site-config: "${siteConfig[k]}"`);
      console.error(`   constants:   "${constants[k]}"`);
    }
    process.exit(1);
  }

  console.log("✅ site-config and constants are in sync");
} catch (err) {
  console.error("❌ validate-site-config failed:", err.message);
  process.exit(1);
}
