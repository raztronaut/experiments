#!/usr/bin/env node
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname } from "node:path";

/**
 * Write a file only when its content has actually changed.
 * Returns `true` if the file was written, `false` if skipped (content identical).
 */
export async function writeIfChanged(filePath, content) {
  try {
    const existing = await readFile(filePath, "utf-8");
    if (existing === content) {
      return false;
    }
  } catch {
    // File doesn't exist yet — fall through to write
  }
  await mkdir(dirname(filePath), { recursive: true });
  await writeFile(filePath, content);
  return true;
}
