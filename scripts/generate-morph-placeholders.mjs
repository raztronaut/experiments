#!/usr/bin/env node

/**
 * Generates 120 placeholder JPEG images for the luma-morphing experiment.
 * Each persona is a distinct color; transition frames interpolate between them.
 * Run: node scripts/generate-morph-placeholders.mjs
 */

import { existsSync, mkdirSync } from "node:fs";
import { join } from "node:path";
import sharp from "sharp";

const SIZE = 720;
const FRAMES_PER_SEQ = 24;
const OUTPUT_DIR = "public/experiments/luma-morphing/morphing";

const PERSONA_COLORS = [
  { r: 220, g: 50, b: 80 }, // 1: warm red
  { r: 50, g: 140, b: 220 }, // 2: ocean blue
  { r: 60, g: 200, b: 120 }, // 3: emerald green
  { r: 200, g: 160, b: 40 }, // 4: golden yellow
  { r: 160, g: 60, b: 200 }, // 5: violet purple
];

const SEQUENCE_PAIRS = [
  [1, 2],
  [2, 3],
  [3, 4],
  [4, 5],
  [5, 1],
];

function lerp(a, b, t) {
  return Math.round(a + (b - a) * t);
}

function generateFrame(colorA, colorB, t, size) {
  const pixels = Buffer.alloc(size * size * 3);

  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const cx = x - size / 2;
      const cy = y - size / 2;
      const dist = Math.sqrt(cx * cx + cy * cy) / (size / 2);

      // Radial gradient with some swirl for visual interest
      const angle = Math.atan2(cy, cx);
      const swirl = Math.sin(angle * 3 + t * Math.PI * 2) * 0.15;
      const localT = Math.min(1, Math.max(0, t + swirl * (1 - dist)));

      const r = lerp(colorA.r, colorB.r, localT);
      const g = lerp(colorA.g, colorB.g, localT);
      const b = lerp(colorA.b, colorB.b, localT);

      // Darken edges for depth
      const vignette = 1 - dist * 0.4;
      const offset = (y * size + x) * 3;
      pixels[offset] = Math.round(r * vignette);
      pixels[offset + 1] = Math.round(g * vignette);
      pixels[offset + 2] = Math.round(b * vignette);
    }
  }

  return pixels;
}

async function main() {
  let total = 0;

  for (const [from, to] of SEQUENCE_PAIRS) {
    const dir = join(OUTPUT_DIR, `${from}-${to}`);
    if (!existsSync(dir)) {
      mkdirSync(dir, { recursive: true });
    }

    const colorA = PERSONA_COLORS[from - 1];
    const colorB = PERSONA_COLORS[to - 1];

    for (let i = 0; i < FRAMES_PER_SEQ; i++) {
      const t = i / (FRAMES_PER_SEQ - 1);
      const pixels = generateFrame(colorA, colorB, t, SIZE);
      const padded = i.toString().padStart(2, "0");
      const filename = `${from}-${to}${padded}.jpg`;
      const filepath = join(dir, filename);

      await sharp(pixels, { raw: { width: SIZE, height: SIZE, channels: 3 } })
        .jpeg({ quality: 80 })
        .toFile(filepath);

      total++;
    }

    console.log(`  ${from}-${to}: ${FRAMES_PER_SEQ} frames`);
  }

  console.log(`\nGenerated ${total} placeholder images in ${OUTPUT_DIR}/`);
}

main().catch(console.error);
