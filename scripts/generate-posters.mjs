#!/usr/bin/env node
import { execSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const EXPERIMENTS_DIR = path.join(ROOT, "src/app/experiments");
const PUBLIC_DIR = path.join(ROOT, "public");

async function generatePosters() {
  console.log("🔍 Scanning experiments for videos...");

  let failures = 0;
  let generated = 0;
  let skipped = 0;

  try {
    const entries = fs.readdirSync(EXPERIMENTS_DIR, { withFileTypes: true });

    const experimentDirs = entries
      .filter((dirent) => dirent.isDirectory() && dirent.name.startsWith("("))
      .map((dirent) => dirent.name);

    for (const dirName of experimentDirs) {
      const configPath = path.join(EXPERIMENTS_DIR, dirName, "experiment.json");

      if (!fs.existsSync(configPath)) {
        continue;
      }

      const config = JSON.parse(fs.readFileSync(configPath, "utf-8"));

      if (config.status === "wip") {
        continue;
      }

      if ((config.listing || "public") !== "public") {
        continue;
      }

      const slug = config.slug;

      if (config.video) {
        const videoRelativePath = config.video;
        const videoPath = path.join(PUBLIC_DIR, videoRelativePath);
        const posterPath = path.join(
          PUBLIC_DIR,
          "experiments",
          slug,
          "poster.jpg"
        );

        if (fs.existsSync(videoPath)) {
          if (fs.existsSync(posterPath)) {
            const videoMtime = fs.statSync(videoPath).mtimeMs;
            const posterMtime = fs.statSync(posterPath).mtimeMs;
            if (posterMtime >= videoMtime) {
              skipped++;
              continue;
            }
            console.log(`🔄 Poster stale (video newer), regenerating: ${slug}`);
          }

          console.log(`🎬 Generating poster for: ${slug}...`);
          try {
            execSync(
              `ffmpeg -y -i "${videoPath}" -ss 00:00:00.000 -vframes 1 -vf "scale=1200:-1" -q:v 5 "${posterPath}"`,
              { stdio: "inherit" }
            );
            console.log(`✅ Generated poster: ${posterPath}`);
            generated++;
          } catch (error) {
            console.error(
              `❌ Failed to generate poster for ${slug}:`,
              error.message
            );
            if (fs.existsSync(posterPath)) {
              fs.unlinkSync(posterPath);
            }
            failures++;
          }
        } else {
          console.warn(`⚠️ Video file not found: ${videoPath}`);
        }
      }
    }

    console.log(
      `✨ Posters: ${generated} generated, ${skipped} up-to-date` +
        (failures > 0 ? `, ${failures} failed` : "")
    );
  } catch (error) {
    console.error("❌ Error reading experiments directory:", error.message);
    process.exit(1);
  }

  if (failures > 0) {
    process.exit(1);
  }
}

generatePosters().catch((err) => {
  console.error("❌ generate-posters failed:", err.message);
  process.exit(1);
});
