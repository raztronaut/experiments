## Domain 4: Config & Pipeline Integration -- Handoff Summary

**Status**: DONE

### Completed (plan items done)

- 1: Created `registry.config.json` with categories, featured (5 items), hidden (`test`), overrides (3 shared UI components), and scan scope -- `registry.config.json`
- 2: Updated `generate:registry` script to chain 3-step pipeline (`generate-registry-json.mjs && build-registry.mjs && post-process-registry.mjs`), added `generate:registry:legacy` fallback -- `package.json`

### Extra Discoveries (things found not in the plan)

- The existing `EXCLUDE_EXPERIMENTS` in `generate-registry.mjs` only excludes `3-d-basketball-court-hero` (not present in registry output), which is separate from the `hidden` list in the new config. Domain 1 should handle both mechanisms.

### Extra Changes (files modified beyond the plan)

- None

### Intentional Skips (plan items NOT done, with reasoning)

- None

### Judgment Calls (deviations from the plan)

- Plan's `registry.config.json` schema in the orchestration plan showed `"$schema": "./schemas/registry-config.schema.json"` but the brief's version used `"$comment"` instead. Followed the brief's version since no schema file exists and the `$comment` field is more appropriate for a first iteration without JSON Schema validation.
- Featured list: brief specified exactly 5 experiments (`send-button`, `404-not-found`, `keyboard-keys`, `transit-airport-split-flap-display`, `gravity-physics-ui-layout`). Used those as-is -- they represent a good cross-section (UI animation, 3D/shader, CSS, audio, physics).

### Cross-Domain Dependencies (things another domain needs to verify)

- Domain 1 should: read `registry.config.json` with graceful fallback (file may not exist), and respect `featured`, `hidden`, `overrides`, and `scan` fields when building the manifest.
- Domain 1 should: handle both the legacy `EXCLUDE_EXPERIMENTS` pattern and the new `hidden` config field, or document that `hidden` supersedes the hardcoded exclusion list.

### Open Concerns (unresolved issues)

- None

### Files Touched (complete list)

- `registry.config.json` -- created
- `package.json` -- modified (scripts section only: replaced `generate:registry`, added `generate:registry:legacy`)

### Learnings (reusable insights for future work)

- Keeping the old script accessible as `generate:registry:legacy` provides a safe rollback during pipeline transitions -- good pattern for incremental migration.
- The `build` script chains `npm run generate:registry` by name, so replacing the content of that script key is transparent to the build pipeline with zero changes to the build chain.
