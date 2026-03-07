#!/usr/bin/env node

/**
 * Validates all experiment.json files for required fields, valid enum values,
 * correct types for V2 fields, and no duplicates.
 * Used in CI and pre-commit hooks.
 */

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const EXPERIMENTS_DIR = path.resolve(__dirname, "..", "src/app/experiments");

const VALID_STATUS = ["wip", "shipped", "archived"];
const VALID_PROFILES = [
  "r3f-scene",
  "r3f-shader",
  "scrollytelling",
  "interaction",
  "dom-effect",
  "web-audio",
  "blank",
];
const VALID_COMPLEXITY = ["beginner", "intermediate", "advanced"];
const REQUIRED_FIELDS = ["title", "description", "slug"];

let errors = 0;
let warnings = 0;
const slugs = new Set();

function error(file, msg) {
  console.error(`  ERROR [${file}]: ${msg}`);
  errors++;
}

function warn(file, msg) {
  console.warn(`  WARN  [${file}]: ${msg}`);
  warnings++;
}

try {
  const entries = fs.readdirSync(EXPERIMENTS_DIR, { withFileTypes: true });
  const routeGroups = entries.filter(
    (d) => d.isDirectory() && d.name.startsWith("(")
  );

  for (const group of routeGroups) {
    const configPath = path.join(
      EXPERIMENTS_DIR,
      group.name,
      "experiment.json"
    );
    if (!fs.existsSync(configPath)) {
      continue;
    }

    const relPath = path.relative(process.cwd(), configPath);

    let config;
    try {
      const raw = fs.readFileSync(configPath, "utf-8");
      config = JSON.parse(raw);
    } catch (e) {
      error(relPath, `Invalid JSON: ${e.message}`);
      continue;
    }

    for (const field of REQUIRED_FIELDS) {
      if (!config[field]) {
        error(relPath, `Missing required field: ${field}`);
      }
    }

    if (config.slug) {
      if (slugs.has(config.slug)) {
        error(relPath, `Duplicate slug: ${config.slug}`);
      }
      slugs.add(config.slug);
    }

    if (config.status && !VALID_STATUS.includes(config.status)) {
      error(
        relPath,
        `Invalid status "${config.status}". Must be one of: ${VALID_STATUS.join(", ")}`
      );
    }

    if (config.profile && !VALID_PROFILES.includes(config.profile)) {
      error(
        relPath,
        `Invalid profile "${config.profile}". Must be one of: ${VALID_PROFILES.join(", ")}`
      );
    }

    if (config.complexity && !VALID_COMPLEXITY.includes(config.complexity)) {
      error(
        relPath,
        `Invalid complexity "${config.complexity}". Must be one of: ${VALID_COMPLEXITY.join(", ")}`
      );
    }

    if (config.tags !== undefined && !Array.isArray(config.tags)) {
      error(relPath, `"tags" must be an array, got ${typeof config.tags}`);
    }

    if (config.tech !== undefined && !Array.isArray(config.tech)) {
      error(relPath, `"tech" must be an array, got ${typeof config.tech}`);
    }

    if (
      config.created !== undefined &&
      Number.isNaN(Date.parse(config.created))
    ) {
      error(
        relPath,
        `"created" must be a valid date string, got "${config.created}"`
      );
    }

    if (config.content !== undefined) {
      if (typeof config.content !== "object" || Array.isArray(config.content)) {
        error(
          relPath,
          `"content" must be an object, got ${typeof config.content}`
        );
      }
    }

    // Cross-check content.article against article/content.mdx on disk
    if (config.slug) {
      const slugDirs = fs
        .readdirSync(path.join(EXPERIMENTS_DIR, group.name), {
          withFileTypes: true,
        })
        .filter((d) => d.isDirectory() && !d.name.startsWith("."));

      for (const slugDir of slugDirs) {
        const articlePath = path.join(
          EXPERIMENTS_DIR,
          group.name,
          slugDir.name,
          "article",
          "content.mdx"
        );
        const hasArticleOnDisk = fs.existsSync(articlePath);
        const hasArticleInJson = config.content?.article === true;

        if (hasArticleOnDisk && !hasArticleInJson) {
          warn(
            relPath,
            "article/content.mdx exists on disk but content.article is not true in experiment.json"
          );
        }
        if (hasArticleInJson && !hasArticleOnDisk) {
          warn(
            relPath,
            "content.article is true but article/content.mdx does not exist on disk"
          );
        }

        const docsMapping = [
          { flag: "labNote", file: "docs/lab-note.md" },
          { flag: "architecture", file: "docs/architecture.md" },
          { flag: "snippet", file: "docs/snippet.md" },
          { flag: "social", file: "docs/social.md" },
          { flag: "changelog", file: "docs/changelog.md" },
        ];

        for (const { flag, file } of docsMapping) {
          const docPath = path.join(
            EXPERIMENTS_DIR,
            group.name,
            slugDir.name,
            file
          );
          const hasFileOnDisk = fs.existsSync(docPath);
          const hasFlagInJson = config.content?.[flag] === true;

          if (hasFileOnDisk && !hasFlagInJson) {
            warn(
              relPath,
              `${file} exists on disk but content.${flag} is not true in experiment.json`
            );
          }
          if (hasFlagInJson && !hasFileOnDisk) {
            warn(
              relPath,
              `content.${flag} is true but ${file} does not exist on disk`
            );
          }
        }
      }
    }

    if (config.publishable === true && config.content?.article !== true) {
      warn(relPath, "publishable is true but content.article is not set");
    }

    if (
      config.content?.article === true &&
      config.content?.labNote === true &&
      config.content?.architecture === true &&
      config.content?.snippet === true &&
      config.content?.social === true &&
      config.content?.changelog === true &&
      config.publishable !== true
    ) {
      warn(
        relPath,
        "full content constellation exists but publishable is not set (run publish workflow finalization?)"
      );
    }
  }

  console.log(`Validated ${slugs.size} experiments.`);

  if (errors > 0) {
    console.error(`\n${errors} error(s) found.`);
    process.exit(1);
  } else if (warnings > 0) {
    console.log(`${warnings} warning(s). All experiments valid.`);
  } else {
    console.log("All experiments valid.");
  }
} catch (e) {
  console.error(`Failed to read experiments directory: ${e.message}`);
  process.exit(1);
}
