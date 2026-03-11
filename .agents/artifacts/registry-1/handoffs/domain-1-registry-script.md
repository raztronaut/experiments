## Domain 1: Registry Script Overhaul -- Handoff Summary

**Status**: DONE

### Completed (plan items done)

- 1: Fixed dedup bug -- compare `path.resolve(f.absolutePath)` via `Set` instead of broken `existing.path === f.path` (basename vs absolute). -- `scripts/generate-registry.mjs`
- 2: Extracted shared tailwind/cssVars into `public/registry/razi-style.json` with `type: "registry:style"`. Each experiment item now references `"razi-style"` in `registryDependencies` and no longer inlines tailwind/cssVars. -- `scripts/generate-registry.mjs`
- 3: Added file type semantics via `inferFileType()`: `.tsx/.jsx` with JSX/capitalized exports → `registry:component`, `hooks/` or `use*` prefix → `registry:hook`, `lib/`/`utils/` → `registry:lib`, shaders → `registry:file` (with target), default → `registry:file`. -- `scripts/generate-registry.mjs`
- 4: Generated lightweight `index-slim.json` with schema matching the brief exactly (name, title, description, tags, tech, status, poster, video, category, fileCount, dependencyCount). Full `index.json` now strips `content` field from file entries. -- `scripts/generate-registry.mjs`
- 5: Parallelized fs.stat calls -- extracted `resolveImportPath()` helper that uses `Promise.all` for both direct file match and directory index match. Replaces sequential for-loop in both relative import and `@/components/experiments/` import paths. -- `scripts/generate-registry.mjs`
- 6: Changed item type to `registry:block` for multi-file experiments and `registry:component` for single-file items (was `registry:ui` for everything). -- `scripts/generate-registry.mjs`
- 7: Added `$schema: "https://ui.shadcn.com/schema/registry-item.json"` to every generated item including `razi-style.json`. -- `scripts/generate-registry.mjs`

### Extra Discoveries (things found not in the plan)

- `getAllComponentFiles` only matched `.tsx?|jsx?` extensions. Added `.glsl`, `.frag`, `.vert` to the regex so shader files are included in the component walk (necessary for `inferFileType` to classify them).
- The `poster` field in experiment.json uses different keys across experiments: some use `poster`, some use `image`. The slim index normalizes this with `metadata.poster || metadata.image || null`.

### Extra Changes (files modified beyond the plan)

- None. Only `scripts/generate-registry.mjs` was modified plus new generated output files.

### Intentional Skips (plan items NOT done, with reasoning)

- None. All 7 items completed.

### Judgment Calls (deviations from the plan)

- **Plan said file type `target` field for `registry:file` only** vs **actually set `target` only on `registry:file` type** -- The shadcn spec says `target` is required for `registry:file` and `registry:page` types. Components, hooks, and libs use conventional paths and don't need explicit `target`. This matches the brief's intent.
- **`registry:lib` type inference**: No files in current experiments live in `lib/` or `utils/` subdirectories, so this path isn't exercised yet. The code is correct and will work when such files exist.
- **Slim index `poster` field**: Brief showed `poster` as the field name. Some experiment.json files use `image` instead of `poster`. Handled both with fallback chain `metadata.poster || metadata.image || null`.

### Cross-Domain Dependencies (things another domain needs to verify)

- Domain 2 should: Consume `public/registry/index-slim.json` for the overview grid page. Schema is exactly as specified in the brief: `{ name, title, description, tags, tech, status, poster, video, category, fileCount, dependencyCount }`.
- Domain 2 should: Be aware that `poster` can be `null` for experiments that have neither `poster` nor `image` in their metadata.
- Domain 4 should: Know that output remains in `public/registry/` (NOT `public/r/`). The existing `next.config.ts` rewrite from `/r/:slug` to `/registry/:slug.json` continues to work.

### Open Concerns (unresolved issues)

- None.

### Files Touched (complete list)

- `scripts/generate-registry.mjs` -- modified (complete rewrite)
- `public/registry/razi-style.json` -- created (generated output)
- `public/registry/index-slim.json` -- created (generated output)
- `public/registry/index.json` -- modified (generated output, now strips file content)
- `public/registry/*.json` (18 experiment items) -- modified (generated output, new schema/types)

### Learnings (reusable insights for future work)

- The dedup bug pattern (comparing basenames to absolute paths) is easy to miss in file-walking code. Using a `Set` of `path.resolve()` values is more robust than finding by field comparison.
- Extracting `resolveImportPath()` as a standalone function made the parallel stat change clean and eliminated code duplication between relative and absolute import resolution paths.
- The shadcn registry `registryDependencies` mechanism for shared styles is elegant -- one `registry:style` item + dependency references eliminates ~120 lines of duplication per item.
