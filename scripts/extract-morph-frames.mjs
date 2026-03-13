#!/usr/bin/env node

/**
 * Extracts 24 evenly-spaced frames from each MP4 in public/experiments/luma-morphing/
 * and outputs PNGs to the morphing sequence folders.
 *
 * Mapping (by filename sort order):
 *   Grok Video (8).mp4        -> 1-2
 *   Grok Video (9).mp4        -> 2-3
 *   Imagine Grok Video (1).mp4 -> 3-4
 *   Imagine Grok Video (2).mp4 -> 4-1 (wrap)
 *
 * Run: node scripts/extract-morph-frames.mjs
 */

import { execSync } from "node:child_process";
import { existsSync, mkdirSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = fileURLToPath(new URL(".", import.meta.url));
const ROOT = join(__dirname, "..");
const SOURCE_DIR = join(ROOT, "public/experiments/luma-morphing");
const OUTPUT_DIR = join(ROOT, "public/experiments/luma-morphing/morphing");

const FRAMES_PER_SEQ = 24;
const OUTPUT_SIZE = 720;

const SEQUENCE_PAIRS = [
  [1, 2],
  [2, 3],
  [3, 4],
  [4, 1],
];

function getMp4Files() {
  const files = readdirSync(SOURCE_DIR)
    .filter((f) => f.endsWith(".mp4"))
    .sort();
  if (files.length === 0) {
    throw new Error(`No .mp4 files found in ${SOURCE_DIR}`);
  }
  return files.map((f) => join(SOURCE_DIR, f));
}

function extractFrames(videoPath, outDir, label) {
  if (!existsSync(outDir)) {
    mkdirSync(outDir, { recursive: true });
  }

  // Get duration for even frame spacing
  const probe = execSync(
    `ffprobe -v error -select_streams v:0 -show_entries stream=duration -of csv=p=0 "${videoPath}"`,
    { encoding: "utf8" }
  ).trim();
  const duration = Number.parseFloat(probe);
  if (!Number.isFinite(duration) || duration <= 0) {
    throw new Error(`Invalid duration for ${videoPath}: ${probe}`);
  }

  // Crop to center square (688x464 -> 464x464), scale to 720x720
  // fps = 24/duration gives 24 frames over the clip
  const fps = FRAMES_PER_SEQ / duration;
  const [from, to] = label.split("-").map(Number);
  const prefix = `${from}-${to}`;
  const tempPattern = join(outDir, "frame_%02d.png");

  execSync(
    `ffmpeg -y -i "${videoPath}" -vf "crop=464:464:112:0,scale=${OUTPUT_SIZE}:${OUTPUT_SIZE},fps=${fps}" -frames:v ${FRAMES_PER_SEQ} "${tempPattern}"`,
    { stdio: "pipe" }
  );

  // Keep as PNG with consistent naming
  for (let i = 0; i < FRAMES_PER_SEQ; i++) {
    const padded = i.toString().padStart(2, "0");
    const tempFile = join(
      outDir,
      `frame_${String(i + 1).padStart(2, "0")}.png`
    );
    const outFile = join(outDir, `${prefix}${padded}.png`);

    if (existsSync(tempFile)) {
      execSync(`mv "${tempFile}" "${outFile}"`, { stdio: "pipe" });
    }
  }
}

function main() {
  const videos = getMp4Files();
  console.log(`Found ${videos.length} video(s)\n`);

  if (videos.length < 4) {
    throw new Error("Need 4 videos for sequences 1-2, 2-3, 3-4, 4-1");
  }

  const mapping = [
    ["1-2", videos[0]],
    ["2-3", videos[1]],
    ["3-4", videos[2]],
    ["4-1", videos[3]],
  ];

  for (const [label, videoPath] of mapping) {
    const outDir = join(OUTPUT_DIR, label);
    console.log(`  ${label}: ${videoPath.split("/").pop()} -> ${outDir}`);
    extractFrames(videoPath, outDir, label);
  }

  console.log(`\nDone. 96 frames in ${OUTPUT_DIR}/`);
}

try {
  main();
} catch (err) {
  console.error(err);
  process.exit(1);
}
