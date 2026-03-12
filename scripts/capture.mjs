#!/usr/bin/env node

/**
 * Playwright-based experiment capture for AI agent visual validation.
 *
 * Usage:
 *   node scripts/capture.mjs <slug>
 *   node scripts/capture.mjs <slug> --delay 2000
 *   node scripts/capture.mjs <slug> --scroll 50
 *   node scripts/capture.mjs <slug> --viewport 1920x1080
 *   node scripts/capture.mjs <slug> --full-page
 */

import { existsSync, mkdirSync } from "node:fs";
import { join, resolve } from "node:path";
import { chromium } from "playwright";

const BASE_URL = process.env.BASE_URL || "http://localhost:3000";
const OUTPUT_DIR = resolve(process.cwd(), "output/captures");

function parseArgs(argv) {
  const args = argv.slice(2);
  const opts = {
    slug: null,
    delay: 0,
    scroll: null,
    viewport: null,
    fullPage: false,
    og: false,
  };

  for (let i = 0; i < args.length; i++) {
    if (args[i] === "--delay" && args[i + 1]) {
      opts.delay = Number.parseInt(args[i + 1], 10);
      i++;
    } else if (args[i] === "--scroll" && args[i + 1]) {
      opts.scroll = Number.parseInt(args[i + 1], 10);
      i++;
    } else if (args[i] === "--viewport" && args[i + 1]) {
      opts.viewport = args[i + 1];
      i++;
    } else if (args[i] === "--full-page") {
      opts.fullPage = true;
    } else if (args[i] === "--og") {
      opts.og = true;
    } else if (!args[i].startsWith("--")) {
      opts.slug = args[i];
    }
  }

  return opts;
}

function parseViewport(str) {
  const [w, h] = str.split("x").map(Number);
  if (!(w && h)) {
    console.error(
      `Invalid viewport format: "${str}". Use WIDTHxHEIGHT (e.g. 1920x1080)`
    );
    process.exit(1);
  }
  return { width: w, height: h };
}

function buildFilename(slug, opts) {
  let name = slug;
  if (opts.scroll != null) {
    name += `-scroll${opts.scroll}`;
  }
  if (opts.delay) {
    name += `-delay${opts.delay}`;
  }
  return `${name}.png`;
}

async function main() {
  const opts = parseArgs(process.argv);

  if (!opts.slug) {
    console.error(
      "Usage: node scripts/capture.mjs <slug> [--delay ms] [--scroll %] [--viewport WxH] [--full-page] [--og]"
    );
    process.exit(1);
  }

  if (!existsSync(OUTPUT_DIR)) {
    mkdirSync(OUTPUT_DIR, { recursive: true });
  }

  const isOg = opts.og;
  const viewport = opts.viewport
    ? parseViewport(opts.viewport)
    : isOg
      ? { width: 1200, height: 630 }
      : { width: 1440, height: 900 };

  const url = `${BASE_URL}/experiments/${opts.slug}`;

  let outputPath;
  if (isOg) {
    const ogDir = resolve(process.cwd(), `public/experiments/${opts.slug}`);
    if (!existsSync(ogDir)) {
      mkdirSync(ogDir, { recursive: true });
    }
    outputPath = join(ogDir, "og.png");
  } else {
    const filename = buildFilename(opts.slug, opts);
    outputPath = join(OUTPUT_DIR, filename);
  }

  console.log(`[capture] Navigating to ${url}`);

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport });
  const page = await context.newPage();

  try {
    await page.goto(url, { waitUntil: "networkidle", timeout: 30_000 });

    if (opts.scroll != null) {
      const pct = Math.max(0, Math.min(100, opts.scroll));
      await page.evaluate((scrollPct) => {
        const maxScroll =
          document.documentElement.scrollHeight - window.innerHeight;
        window.scrollTo({
          top: (maxScroll * scrollPct) / 100,
          behavior: "instant",
        });
      }, pct);
      // Let scroll-triggered animations settle
      await page.waitForTimeout(500);
    }

    if (opts.delay > 0) {
      console.log(`[capture] Waiting ${opts.delay}ms for animations to settle`);
      await page.waitForTimeout(opts.delay);
    }

    await page.screenshot({ path: outputPath, fullPage: opts.fullPage });

    console.log(`[capture] Saved: ${outputPath}`);
  } catch (err) {
    console.error(`[capture] Failed: ${err.message}`);
    process.exit(1);
  } finally {
    await browser.close();
  }
}

main();
