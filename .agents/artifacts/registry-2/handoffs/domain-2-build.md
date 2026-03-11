## Domain 2: Build Script -- Handoff Summary

**Status**: DONE

### Completed (plan items done)

- 1: Created `scripts/build-registry.mjs` -- reads `registry.json` manifest, validates `items` array, ensures `public/registry/` exists, processes each item (style items written directly, all others get file inlining + URL rewriting), outputs per-item JSON files
- 1a: Manifest loading with existence/format validation and `process.exit(1)` on failure
- 1b: Output directory creation with `recursive: true`
- 1c: Style items (`registry:style`) pass through shadcn-compatible fields only (filtered via `SHADCN_FIELDS` Set). Non-style items get full file inlining with `content` field, asset URL rewriting (`/experiments/` → absolute URL), and `inferFileType` validation
- 1d: Dedup protection via `Set` of `path.resolve()` per item
- 1e: Error handling -- missing files log warning and skip, zero-resolvable-file items skip with warning, missing manifest exits with error
- 1f: Console output -- `✅ Built: {name} ({fileCount} files)` per item, `🚀 Built {N} registry items to public/registry/` summary
- 2: Ported `inferFileType` from existing script (identical logic)
- 3: `meta` field excluded from per-item output -- only shadcn-compatible fields are emitted

### Extra Discoveries (things found not in the plan)

- None

### Extra Changes (files modified beyond the plan)

- None

### Intentional Skips (plan items NOT done, with reasoning)

- None -- all items completed

### Judgment Calls (deviations from the plan)

- Plan said `target` field for `registry:file` type only; existing script also does this (only `registry:file` gets `target`). Followed existing behavior exactly.
- For style items, used a `SHADCN_FIELDS` allowlist Set to filter properties rather than hand-picking each field -- this is more maintainable and automatically includes `tailwind` and `cssVars` which style items carry.
- Empty `dependencies` and `registryDependencies` arrays are omitted from output (cleaner JSON) -- this is consistent with shadcn conventions where optional fields are omitted rather than empty.

### Cross-Domain Dependencies (things another domain needs to verify)

- Domain 1 should: ensure `registry.json` output has `path` on each file entry (the build script reads `fileEntry.path` to resolve files on disk)
- Domain 1 should: ensure style items carry `tailwind` and `cssVars` fields directly in the manifest item (the build script passes these through)
- Domain 3 should: re-read `registry.json` for `meta` fields -- the per-item JSON output intentionally excludes `meta`
- Domain 4 should: chain this script as step 2 in the pipeline (`node scripts/generate-registry-json.mjs && node scripts/build-registry.mjs && ...`)

### Open Concerns (unresolved issues)

- None

### Files Touched (complete list)

- `scripts/build-registry.mjs` -- created

### Learnings (reusable insights for future work)

- Using an allowlist Set for filtering object keys to shadcn-compatible fields is cleaner than manual property copying -- easy to extend when shadcn adds new fields
- The existing script's URL rewriting regex `(['"\x60])\/experiments\/` works for all three JS string delimiters (single, double, backtick) -- ported as-is
