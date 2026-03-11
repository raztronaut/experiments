## Domain 1: Pipeline Full Catalog -- Handoff Summary

**Status**: DONE

### Completed (plan items done)

- 1: `build-registry.mjs` — diagnosed and fixed stale file accumulation + missing `category` field. Added cleanup step to remove all per-item JSONs before building (prevents stale files from previous runs polluting indexes). Added `category` field to per-item JSON output. Fixed `target` path for `registry:file` types in non-experiment items (was hardcoded to `components/experiments/`). -- `scripts/build-registry.mjs`
- 2: `post-process-registry.mjs` — fixed `readManifest` to capture `category` from item level (was only reading `meta` sub-object which never contained category). Fixed `buildSlimIndex` to read category from per-item JSON first, fall back to manifest, fall back to type-based inference via new `inferCategoryFromType` helper. -- `scripts/post-process-registry.mjs`
- 3: `post-process-registry.mjs` — `index.json` now includes all item types with correct categories (verified: 57 items = 17 experiments + 27 components + 11 hooks + 2 utilities). -- `scripts/post-process-registry.mjs`
- 4: `generate-registry-json.mjs` — verified file paths are correct for all non-experiment items. No changes needed; the discovery script was already working correctly.
- 5: Validation — full pipeline run verified:
  - `registry.json`: 58 items (17 experiments + 27 UI + 11 hooks + 2 utilities + 1 style)
  - Per-item JSONs: 58 files in `public/registry/`
  - `index.json`: 57 items (all minus razi-style)
  - `index-slim.json`: 57 items with correct category distribution

### Extra Discoveries (things found not in the plan)

- Stale `basketball-replay-preloader.json` and `test.json` existed in `public/registry/` from previous builds, causing the post-process to pick up 59-60 items instead of the expected count. The build script had no cleanup step. -- `public/registry/` -- fixed by adding cleanup to `build-registry.mjs`
- All slim index items had `category: "experiments"` because the category field lived at item level in `registry.json` but `readManifest` only stored `entry.meta` (which never contained category). -- `scripts/post-process-registry.mjs` -- fixed
- The `target` path for `registry:file` type entries was hardcoded to `components/experiments/${experimentName}/` which is wrong for UI/hook/lib items. -- `scripts/build-registry.mjs` -- fixed to use the actual `src/`-relative path

### Extra Changes (files modified beyond the plan)

- None — all changes were within the planned files.

### Intentional Skips (plan items NOT done, with reasoning)

- None — all plan items completed.

### Judgment Calls (deviations from the plan)

- Plan said the build script likely has "file path resolution" or "type filter" issues. Actual root cause was different: the build script itself works fine for all item types, but (a) stale files from previous builds accumulated and (b) the `category` field was never written to per-item JSONs, causing the post-process to default everything to "experiments". Fixed the actual root causes instead.
- Added `inferCategoryFromType()` as a third-level fallback in `buildSlimIndex` for robustness, even though with the `category` field now in per-item JSONs it shouldn't be needed.

### Cross-Domain Dependencies (things another domain needs to verify)

- Domain 2 should: verify that `index-slim.json` items now have correct `category` values (`"experiments"`, `"components"`, `"hooks"`, `"utilities"`) and that grid filtering works against the new data shape.
- Domain 3 should: verify that per-item JSONs for non-experiment types (e.g. `button.json`, `use-debug.json`) include `type` field with values `registry:component`, `registry:hook`, `registry:lib` as expected for detail page rendering.

### Open Concerns (unresolved issues)

- Validation warnings (39 total) for missing recommended `dependencies` and `registryDependencies` fields on hooks and some UI components. These are not errors — the items simply have no npm dependencies or registry dependencies. Could be suppressed by writing empty arrays in `build-registry.mjs` for items with no dependencies.
- Brief estimated ~55 items but actual count is 58. The difference is 3 extra UI components discovered by the scanner. This is correct behavior — the estimates were approximate.

### Files Touched (complete list)

- `scripts/build-registry.mjs` -- modified (cleanup step, category field, target path fix)
- `scripts/post-process-registry.mjs` -- modified (readManifest category capture, inferCategoryFromType helper, buildSlimIndex category resolution)
- `public/registry/*.json` -- regenerated (58 per-item JSONs + 2 index files)
- `public/registry/basketball-replay-preloader.json` -- deleted (stale)
- `public/registry/test.json` -- deleted (stale)

### Learnings (reusable insights for future work)

- Registry build pipelines that write to a shared output directory should always clean stale outputs before building. Without cleanup, items removed from the manifest persist on disk and get picked up by downstream steps.
- When a pipeline has generate → build → post-process steps, ensure data fields needed by later steps (like `category`) are propagated through all intermediate formats, not just the source manifest.
- The `registry.json` manifest uses a `meta` sub-object for experiment-specific fields (tags, tech, status, poster, video) but puts `category` at item level. This split between item-level and meta-level fields was the root cause of the category bug.
