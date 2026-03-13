---
name: Review generate:all optimization
overview: "Comprehensive build pipeline overhaul: node orchestrator with parallelism, writeIfChanged utility, smart stale-only deletion, mtime-based poster skip, path resolution standardization, error handling, dead code removal, shebang consistency, doc corrections."
todos:
  - id: baseline-benchmark
    content: "FIRST: Capture baseline performance on main -- 3 cold runs + 3 warm runs of generate:all, save results"
    status: completed
  - id: write-if-changed
    content: Create scripts/lib/write-if-changed.mjs utility for content-aware file writing
    status: completed
  - id: orchestrator
    content: Create scripts/generate-all.mjs orchestrator with parallel phases + timing
    status: completed
  - id: update-pkg
    content: "Update package.json: generate:all, remove generate:registry:legacy"
    status: completed
  - id: remove-legacy
    content: Delete scripts/generate-registry.mjs (dead monolith)
    status: completed
  - id: fix-posters
    content: "Fix generate-posters.mjs: mtime-based skip, error handling, path resolution, shebang"
    status: completed
  - id: fix-build-registry
    content: "Fix build-registry.mjs: targeted stale deletion, writeIfChanged, shebang"
    status: completed
  - id: fix-post-process
    content: "Fix post-process-registry.mjs: writeIfChanged, path resolution, .catch()"
    status: completed
  - id: fix-registry-mdx
    content: "Fix generate-registry-mdx.mjs: writeIfChanged for meta.json and index files"
    status: completed
  - id: fix-registry-json
    content: "Fix generate-registry-json.mjs: writeIfChanged for registry.json and _map.ts, shebang"
    status: completed
  - id: fix-llms-txt
    content: "Fix generate-llms-txt.mjs: writeIfChanged, error handling wrap"
    status: completed
  - id: fix-optimize-videos
    content: "Fix optimize-videos.mjs: path resolution, shebang"
    status: completed
  - id: fix-remaining-shebangs
    content: Add shebangs to delete-article, delete-experiment, patch-r3f-perf
    status: completed
  - id: fix-docs
    content: Fix 6 stale pipeline descriptions + 2 fabricated claims + add generate:all to 3 docs
    status: completed
  - id: after-benchmark
    content: "AFTER: Run same benchmark on feature branch -- 3 cold + 3 warm runs, compare against baseline"
    status: completed
  - id: verify-all
    content: "Run full verification: npm run build, standalone scripts, caching behavior, error handling, git diff"
    status: completed
  - id: commit-push-pr
    content: Commit on razi/identify-a-measurable-perf-gain, push, open PR with before/after numbers
    status: completed
isProject: false
---

# Build Pipeline Overhaul

## 1. `writeIfChanged` Utility

The single highest-impact addition. A shared helper that compares new content against the existing file and only writes if they differ. This prevents:

- Unnecessary git diffs on committed generated files
- File mtime churn that defeats downstream caching
- Wasted I/O on unchanged files

`[scripts/lib/write-if-changed.mjs](scripts/lib/write-if-changed.mjs)` (~15 lines):

```javascript
import { readFile, writeFile, mkdir } from "node:fs/promises";
import { dirname } from "node:path";

export async function writeIfChanged(filePath, content) {
  try {
    const existing = await readFile(filePath, "utf-8");
    if (existing === content) return false;
  } catch {}
  await mkdir(dirname(filePath), { recursive: true });
  await writeFile(filePath, content);
  return true;
}
```

Returns `true` if the file was actually written, `false` if skipped. Every generation script will use this instead of bare `writeFile`.

## 2. Node Orchestrator with Parallelism

### Parallel safety (verified via full I/O analysis)


| Phase              | Writes to                                                        | Conflicts with |
| ------------------ | ---------------------------------------------------------------- | -------------- |
| Posters            | `public/experiments/*/poster.jpg`                                | Nothing        |
| Registry (4 steps) | `registry.json`, `public/registry/*.json`, `content/registry/**` | Nothing        |
| llms-txt           | `public/llms.txt`, `public/llms-full.txt`                        | Nothing        |


`generate-llms-txt` reads only `experiment.json` files and article MDX -- it does NOT read `registry.json` or any registry output.

### `[scripts/generate-all.mjs](scripts/generate-all.mjs)` (~40 lines)

Orchestrator that runs posters + llms-txt in parallel with the sequential registry pipeline. Uses `execFile` with `stdio: "inherit"` for streaming output. Exits non-zero if any phase fails.

**Built-in timing**: wraps each phase with `performance.now()`, prints a summary table at the end:

```
generate:all
  posters       0.4s
  registry      4.2s  (json 1.1s + build 1.8s + post 0.4s + mdx 0.9s)
  llms-txt      0.3s
  total         4.2s  (saved 0.7s vs 4.9s sequential)
```

Wall-clock time goes from `posters + registry + llms-txt` to `max(posters, registry, llms-txt)`.

### package.json

```json
"generate:all": "node scripts/generate-all.mjs",
"build": "npm run generate:all && next build",
```

Remove `"generate:registry:legacy": "node scripts/generate-registry.mjs"`.

## 3. Smart Stale Deletion in `build-registry.mjs`

Currently deletes ALL item JSONs then rewrites them all. Fix: only delete files not in the current manifest.

```javascript
// Before (L79-90): deletes every .json except index files
const staleJsons = existingFiles.filter(
  (f) => f.endsWith(".json") && f !== "index.json" && f !== "index-slim.json"
);

// After: compute the set of expected filenames, only delete extras
const expectedFiles = new Set(manifest.items.map((i) => `${i.name}.json`));
const staleFiles = existingFiles.filter(
  (f) => f.endsWith(".json")
    && f !== "index.json"
    && f !== "index-slim.json"
    && !expectedFiles.has(f)
);
```

Then use `writeIfChanged` for the actual item writes. Combined, this means:

- Files for items still in the registry: only written if content changed (preserves mtime)
- Files for removed items: deleted (true stale cleanup)
- New items: written fresh

## 4. Poster mtime-Based Skip

Currently checks only if `poster.jpg` exists. Fix: also compare mtimes.

```javascript
// Before (L47-49):
if (fs.existsSync(posterPath)) {
  // skip
}

// After:
if (fs.existsSync(posterPath)) {
  const videoMtime = fs.statSync(videoPath).mtimeMs;
  const posterMtime = fs.statSync(posterPath).mtimeMs;
  if (posterMtime >= videoMtime) {
    // poster is up-to-date, skip
    continue;
  }
  console.log(`  poster stale (video newer), regenerating...`);
}
```

This catches re-encoded videos. Since posters are committed to git, this avoids regenerating 15+ posters when nothing changed.

## 5. Per-Script Changes

### `generate-posters.mjs`

- **Path resolution**: `process.cwd()` -> `import.meta.url` (lines 5-6)
- **Mtime skip**: compare video vs poster mtime (section 4 above)
- **Error handling**: track failure count, `process.exit(1)` on failures, delete partial poster on ffmpeg failure
- **Shebang**: add `#!/usr/bin/env node`

### `generate-registry-json.mjs`

- **writeIfChanged**: for `registry.json` (line 1203-1204) and `_map.ts` (line 1120-1121)
- **Shebang**: add `#!/usr/bin/env node`

### `build-registry.mjs`

- **Smart deletion**: only delete files not in current manifest (section 3 above)
- **writeIfChanged**: for each per-item JSON write (lines 102-104, 192-194)
- **Shebang**: add `#!/usr/bin/env node`

### `post-process-registry.mjs`

- **Path resolution**: `process.cwd()` -> `import.meta.url` (lines 15-17)
- **writeIfChanged**: for `index.json` (line 226) and `index-slim.json` (line 234)
- **Error handling**: add `.catch()` to `main()` call (line 243)

### `generate-registry-mdx.mjs`

- **writeIfChanged**: for `meta.json` files (lines 750-753, 778-785) and index MDX files. Per-item MDX files are deleted-then-rewritten (preserving the hand-authored protection), so writeIfChanged applies to the meta/index files only.
- Note: the delete-then-write pattern for generated MDX is acceptable since `content/registry/` is gitignored. No git diff or mtime concern.

### `generate-llms-txt.mjs`

- **writeIfChanged**: for `llms.txt` (line 283) and `llms-full.txt` (line 284)
- **Error handling**: wrap top-level code in try/catch with `process.exit(1)`

### `optimize-videos.mjs`

- **Path resolution**: `process.cwd()` -> `import.meta.url` (line 5)
- **Shebang**: add `#!/usr/bin/env node`

### Remaining shebangs only

- `delete-article.mjs`: add shebang
- `delete-experiment.mjs`: add shebang
- `patch-r3f-perf.mjs`: add shebang

## 6. Remove Legacy Dead Code

Delete `scripts/generate-registry.mjs` (542 lines, zero callers). Remove `generate:registry:legacy` from package.json.

## 7. Doc Corrections (11 locations)

### Stale pipeline descriptions (6 files)


| File                                   | Lines   | Fix                                                                         |
| -------------------------------------- | ------- | --------------------------------------------------------------------------- |
| `AGENTS.md`                            | 165     | `(generate:all && next build)` -- note parallelism                          |
| `docs/scripts.md`                      | 209-217 | Rewrite Build Pipeline section with `generate:all` orchestrator description |
| `.agents/workflows/deploy.md`          | 28-33   | Update to reference `generate:all`                                          |
| `README.md`                            | 150-154 | `generate:all -> next build`                                                |
| `docs/deploy.md`                       | 91-97   | Rewrite with `generate:all` reference                                       |
| `.cursor/rules/generation-scripts.mdc` | 38      | Update build order line                                                     |


### Fabricated "archived" status (2 files)


| File                                     | Line | Fix                                         |
| ---------------------------------------- | ---- | ------------------------------------------- |
| `.cursor/skills/run-generation/SKILL.md` | 27   | Remove. Only `"wip"` and `"shipped"` exist. |
| `.cursor/rules/generation-scripts.mdc`   | 21   | Remove. Same.                               |


### Add `generate:all` to command tables (3 files)


| File              | Where                                   |
| ----------------- | --------------------------------------- |
| `AGENTS.md`       | Generation and capture block (L40-46)   |
| `README.md`       | Generation and Capture table (L135-144) |
| `docs/scripts.md` | New entry in Build Pipeline section     |


## 8. Performance Instrumentation

Currently there is **zero timing or metrics** across all 16 scripts -- no `performance.now()`, no `console.time()`, no duration measurements. Scripts print item counts ("built N items") but never measure how long anything takes.

### 8a. Orchestrator timing (generate-all.mjs)

The orchestrator is the natural place for pipeline-level timing. It should report:

```
generate:all
  posters       0.4s  (1 generated, 14 skipped)
  registry     4.2s  (3 written, 105 skipped)
  llms-txt      0.3s  (0 written, 2 skipped)
  total         4.2s  (parallel saved 0.7s vs 4.9s sequential)
```

Implementation: wrap each `run()` / `runSequential()` call with `performance.now()` before and after. Collect results, print a summary table at the end. Show wall-clock vs sequential-sum to prove parallelism value.

### 8b. Per-script skip/write counters

Each script should return or print what it actually did. This is the cheapest way to verify caching is working:


| Script                   | What to report                                                    |
| ------------------------ | ----------------------------------------------------------------- |
| `generate-posters`       | "N generated, M skipped (up-to-date), K skipped (wip/non-public)" |
| `generate-registry-json` | "registry.json: written/skipped, _map.ts: written/skipped"        |
| `build-registry`         | "N written, M skipped (unchanged), K stale deleted"               |
| `post-process-registry`  | "index.json: written/skipped, index-slim.json: written/skipped"   |
| `generate-registry-mdx`  | Already has good counters (generated/hand-authored/skipped)       |
| `generate-llms-txt`      | "llms.txt: written/skipped, llms-full.txt: written/skipped"       |


The `writeIfChanged` utility returns `true`/`false`, making this trivial to track. Each script maintains a counter and prints a summary line at the end.

### 8c. What NOT to add

- **No persistent metrics database** -- overkill for this scale. Console output is sufficient.
- **No `console.time()` inside hot loops** -- overhead matters in tight iteration.
- **No Vercel/CI timing capture** -- Vercel dashboard already shows build duration natively.

## 9. Benchmarking Methodology for the PR

### How to measure properly

1. **3+ runs per scenario** to account for filesystem cache and Node.js startup variance
2. **Two scenarios**: "cold" (delete generated files, full rebuild) and "warm" (no source changes, caching active)
3. **Same machine**, no heavy background processes
4. Use `/usr/bin/time -p` for wall-clock (hyperfine not installed)
5. Report **median and range**, not a single number

### Execution order

**Step 1 -- BEFORE any code changes** (first todo in the list):

Capture baseline on main. Run in the main repo (~/Developer/experiments) which is on the main branch with the current unmodified scripts:

```bash
cd ~/Developer/experiments

echo "=== BASELINE COLD (main, 3 runs) ==="
for i in 1 2 3; do
  rm -rf public/registry/*.json content/registry/ public/llms.txt public/llms-full.txt registry.json
  /usr/bin/time -p npm run generate:all 2>&1 | tail -4
done

echo "=== BASELINE WARM (main, no-change, 3 runs) ==="
for i in 1 2 3; do
  /usr/bin/time -p npm run generate:all 2>&1 | tail -4
done
```

Save the output to a scratch file for reference.

**Step 2 -- Make all code changes** (middle todos):

All edits happen in the worktree at `~/.codex/worktrees/1363/experiments`.

**Step 3 -- AFTER all code changes** (second-to-last todo):

Run the same benchmark on the feature branch:

```bash
cd ~/.codex/worktrees/1363/experiments

echo "=== AFTER COLD (feature, 3 runs) ==="
for i in 1 2 3; do
  rm -rf public/registry/*.json content/registry/ public/llms.txt public/llms-full.txt registry.json
  /usr/bin/time -p npm run generate:all 2>&1 | tail -4
done

echo "=== AFTER WARM (feature, no-change, 3 runs) ==="
for i in 1 2 3; do
  /usr/bin/time -p npm run generate:all 2>&1 | tail -4
done
```

Compare against saved baseline. Include both in the PR description.

### Expected results


| Scenario              | Main (before)         | Feature (after) | Why                                                   |
| --------------------- | --------------------- | --------------- | ----------------------------------------------------- |
| Cold run              | ~8-12s                | ~5-8s           | Parallelism reduces wall-clock                        |
| Warm run (no changes) | ~8-12s (same as cold) | ~2-4s           | writeIfChanged skips all writes; only MDX regenerated |


The **warm run** is where the biggest difference appears -- main always does full work, feature branch skips everything except gitignored MDX.

### What to include in the PR description

- Cold and warm run medians for both branches
- The orchestrator's built-in timing summary output (showing per-phase durations + parallelism savings)
- A "no-change" run showing skip counts ("wrote 0, skipped 108")

## 10. Caching Strategy Summary


| Script                   | Before                                  | After                                                                        |
| ------------------------ | --------------------------------------- | ---------------------------------------------------------------------------- |
| `generate-posters`       | Existence check only                    | Existence + mtime comparison                                                 |
| `generate-registry-json` | Always rewrites registry.json + _map.ts | writeIfChanged (skip if identical)                                           |
| `build-registry`         | Delete ALL then rewrite ALL             | Delete only stale + writeIfChanged                                           |
| `post-process-registry`  | Always rewrites indexes                 | writeIfChanged (skip if identical)                                           |
| `generate-registry-mdx`  | Delete all generated, rewrite all       | writeIfChanged for meta/index files (MDX delete-rewrite OK since gitignored) |
| `generate-llms-txt`      | Always rewrites both files              | writeIfChanged (skip if identical)                                           |


**Net effect**: On a no-change run, only `content/registry/` MDX files (gitignored, must be regenerated) get written. Everything else is skipped. Git shows zero diffs. File mtimes preserved. Vercel/Next.js caches stay warm.

## 12. Testing Checklist

### Functional

- `npm run generate:all` succeeds (orchestrator, parallel phases)
- `npm run build` succeeds end-to-end
- `npm run generate:posters`, `generate:registry`, `generate:llms-txt` work standalone
- `npm run generate:registry:legacy` errors (removed)

### Caching behavior

- Run `generate:all` twice with no source changes -- second run shows "skipped" for all committed files
- `git diff` after second run shows zero changes
- Orchestrator summary shows "0 written" for warm run
- Modify one experiment.json, run `generate:all` -- only affected files update

### Error handling

- `generate-posters.mjs` exits non-zero when ffmpeg fails, cleans partial file
- `post-process-registry.mjs` exits non-zero on rejected promise
- `generate-llms-txt.mjs` exits non-zero on error

### Benchmarking (per section 9)

- 3 cold runs on main, 3 cold runs on feature branch
- 3 warm runs on main, 3 warm runs on feature branch
- Orchestrator timing summary shows per-phase durations and parallelism savings
- Include median+range results in PR description

## 10. File Change Summary


| Action     | File                                     |
| ---------- | ---------------------------------------- |
| **Create** | `scripts/lib/write-if-changed.mjs`       |
| **Create** | `scripts/generate-all.mjs`               |
| **Delete** | `scripts/generate-registry.mjs`          |
| **Edit**   | `package.json`                           |
| **Edit**   | `scripts/generate-posters.mjs`           |
| **Edit**   | `scripts/generate-registry-json.mjs`     |
| **Edit**   | `scripts/build-registry.mjs`             |
| **Edit**   | `scripts/post-process-registry.mjs`      |
| **Edit**   | `scripts/generate-registry-mdx.mjs`      |
| **Edit**   | `scripts/generate-llms-txt.mjs`          |
| **Edit**   | `scripts/optimize-videos.mjs`            |
| **Edit**   | `scripts/delete-article.mjs`             |
| **Edit**   | `scripts/delete-experiment.mjs`          |
| **Edit**   | `scripts/patch-r3f-perf.mjs`             |
| **Edit**   | `AGENTS.md`                              |
| **Edit**   | `README.md`                              |
| **Edit**   | `docs/scripts.md`                        |
| **Edit**   | `docs/deploy.md`                         |
| **Edit**   | `.agents/workflows/deploy.md`            |
| **Edit**   | `.cursor/skills/run-generation/SKILL.md` |
| **Edit**   | `.cursor/rules/generation-scripts.mdc`   |


**Total: 2 new files, 1 deleted file, 18 edited files.**

## 11. What's NOT in This PR (and why)

- **Gitignoring generated files** -- would break local dev workflow and PR diff visibility. Bigger architectural decision, needs separate discussion.
- **CI generation output caching** -- could add `actions/cache` keyed on source hashes, but writeIfChanged makes the pipeline fast enough that the added cache complexity isn't justified yet.
- `**capture.mjs` path resolution** -- interactive tool, not in build pipeline. Lower priority.
- `**validate-experiments.mjs` process.cwd()** -- used only for display formatting (`path.relative`), not file discovery. Cosmetic, not a correctness issue.
- **Internal registry parallelism** (steps 2+4 in parallel after step 1) -- marginal gain, adds complexity to the orchestrator. Can revisit after measuring phase timing.

