#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import readline from "node:readline";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const experimentName = process.argv[2];

if (!experimentName) {
  console.error(
    "Please provide an experiment name, e.g., 'npm run delete:article keyboard-keys'"
  );
  process.exit(1);
}

const safeName = experimentName.toLowerCase().replace(/[^a-z0-9-]/g, "-");

const groupDir = path.join(
  __dirname,
  "../src/app/experiments",
  `(${safeName})`
);
const experimentDir = path.join(groupDir, safeName);
const articleDir = path.join(experimentDir, "article");
const docsDir = path.join(experimentDir, "docs");
const experimentJsonPath = path.join(groupDir, "experiment.json");

if (!fs.existsSync(groupDir)) {
  console.error(`Experiment "${safeName}" does not exist at ${groupDir}`);
  process.exit(1);
}

const hasArticle = fs.existsSync(articleDir);
const hasDocs = fs.existsSync(docsDir);

if (!(hasArticle || hasDocs)) {
  console.log(
    `No article/ or docs/ directories found for "${safeName}". Nothing to delete.`
  );
  process.exit(0);
}

console.log(`\nFound content for "${safeName}":`);
if (hasArticle) {
  const articleFiles = fs.readdirSync(articleDir);
  console.log(
    `  article/ (${articleFiles.length} files): ${articleFiles.join(", ")}`
  );
}
if (hasDocs) {
  const docsFiles = fs.readdirSync(docsDir);
  console.log(`  docs/ (${docsFiles.length} files): ${docsFiles.join(", ")}`);
}

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

rl.question(
  `\nAre you sure you want to delete all article & docs content for "${safeName}"? This action cannot be undone. (y/N) `,
  (answer) => {
    if (answer.toLowerCase() !== "y") {
      console.log("Deletion cancelled.");
      rl.close();
      process.exit(0);
    }

    console.log(`\nDeleting article & docs for "${safeName}"...`);
    let deletedCount = 0;

    if (hasArticle) {
      try {
        const files = fs.readdirSync(articleDir);
        fs.rmSync(articleDir, { recursive: true, force: true });
        deletedCount += files.length;
        console.log(`✅ Deleted article/ (${files.length} files)`);
      } catch (err) {
        console.error(`❌ Error deleting article/: ${err.message}`);
      }
    }

    if (hasDocs) {
      try {
        const files = fs.readdirSync(docsDir);
        fs.rmSync(docsDir, { recursive: true, force: true });
        deletedCount += files.length;
        console.log(`✅ Deleted docs/ (${files.length} files)`);
      } catch (err) {
        console.error(`❌ Error deleting docs/: ${err.message}`);
      }
    }

    console.log(
      "ℹ️  experiment.json left unchanged (article existence is detected by file presence)"
    );

    console.log(
      `\n✨ Deleted ${deletedCount} files from "${safeName}" article & docs.`
    );
    console.log("   The experiment itself remains intact.");
    rl.close();
  }
);
