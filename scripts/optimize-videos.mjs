#!/usr/bin/env node
import { execSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const EXPERIMENTS_DIR = path.join(ROOT, "public/experiments");

function getFiles(dir) {
  const subdirs = fs.readdirSync(dir, { withFileTypes: true });
  const files = subdirs.map((dirent) => {
    const res = path.resolve(dir, dirent.name);
    return dirent.isDirectory() ? getFiles(res) : res;
  });
  return Array.prototype.concat(...files);
}

async function optimizeVideos() {
  console.log("🔍 Scanning for videos...");
  const allFiles = getFiles(EXPERIMENTS_DIR);
  const videos = allFiles.filter((f) => f.endsWith(".mp4"));

  console.log(`Found ${videos.length} videos.`);

  for (const videoPath of videos) {
    const stat = fs.statSync(videoPath);
    const sizeMB = stat.size / (1024 * 1024);

    // Skip if already small (e.g. < 2MB)
    if (sizeMB < 2) {
      console.log(
        `⏩ Skipping small video: ${path.basename(videoPath)} (${sizeMB.toFixed(2)} MB)`
      );
      continue;
    }

    console.log(
      `\n📉 Optimizing: ${path.basename(videoPath)} (${sizeMB.toFixed(2)} MB)`
    );

    const tempPath = videoPath.replace(".mp4", "_optimized.mp4");

    try {
      // Optimization flags:
      // -vf "scale=1280:-2": Resize to max width 1280, maintain aspect ratio (divisible by 2)
      // -c:v libx264: Standard compatible codec
      // -crf 26: Constant Rate Factor (lower is better quality, higher is smaller size. 23 is default, 26-28 is good for Web)
      // -preset slow: Better compression efficiency
      // -an: Remove audio (since they are muted previews)
      // -movflags +faststart: Web optimization (start playing before fully loaded)

      const cmd = `ffmpeg -y -i "${videoPath}" -vf "scale=1280:-2" -c:v libx264 -crf 26 -preset slow -an -movflags +faststart "${tempPath}"`;

      execSync(cmd, { stdio: "inherit" });

      const newStat = fs.statSync(tempPath);
      const newSizeMB = newStat.size / (1024 * 1024);
      const savings = (((sizeMB - newSizeMB) / sizeMB) * 100).toFixed(1);

      console.log(
        `✅ Optimized! ${sizeMB.toFixed(2)}MB -> ${newSizeMB.toFixed(2)}MB (${savings}% saved)`
      );

      // Overwrite original
      fs.renameSync(tempPath, videoPath);
    } catch (error) {
      console.error(
        `❌ Failed to optimize ${path.basename(videoPath)}:`,
        error.message
      );
      if (fs.existsSync(tempPath)) {
        fs.unlinkSync(tempPath);
      }
    }
  }

  console.log("\n✨ All videos processed.");
}

optimizeVideos();
