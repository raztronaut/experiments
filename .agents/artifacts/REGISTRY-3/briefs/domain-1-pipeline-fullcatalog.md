## Domain 1: Pipeline Full Catalog

**Scope**: Fix the build and post-process scripts so ALL item types (experiments, shared UI components, hooks, utilities) are built into per-item JSONs and appear in the index files.
**Complexity**: integration

### Context to Read First

- `AGENTS.md` -- project conventions (always read)
- `scripts/build-registry.mjs` (all) -- the build script that reads `registry.json` and writes per-item JSONs. Currently only ~20 items (experiments) end up built despite 55 in the manifest.
- `scripts/post-process-registry.mjs` (all) -- generates `index.json` and `index-slim.json` from whatever is in `public/registry/`. If items aren't built, they won't be indexed.
- `scripts/generate-registry-json.mjs` (all) -- discovery script that outputs `registry.json`. Probably correct (discovers 55 items) but verify file paths it generates for non-experiment items.
- `registry.json` (project root) -- the generated manifest. Check how non-experiment items' `files[].path` values look vs experiment items.
- `registry.config.json` -- curation config (featured, hidden, overrides, scan scope)
- `public/registry/index-slim.json` -- current slim index (18 experiments only)

### Changes to Make

1. **`scripts/build-registry.mjs`**: Diagnose why non-experiment items (shared UI components in `src/components/ui/`, hooks in `src/hooks/`, utilities in `src/lib/`) are not being built into per-item JSONs. The script reads `registry.json` items and should inline their file contents. Likely causes:
   - File paths in the manifest are relative and the resolution logic doesn't find them
   - Some filter is excluding non-experiment types
   - The `razi-style` item builds (it's a style type), so the issue is likely specific to component/hook/lib types
   Fix the issue so all items are built. Ensure `content` is inlined for each file.

2. **`scripts/post-process-registry.mjs`**: Verify that the post-process script handles all item types when generating indexes. Currently `index-slim.json` only contains experiments — check if there's a type/category filter that excludes other items. The slim index should include ALL non-hidden items with these fields: `name`, `title`, `description`, `category`, `tags`, `tech`, `status`, `poster`, `video`, `fileCount`, `dependencyCount`. Non-experiment items will have empty `poster`/`video` strings.

3. **`scripts/post-process-registry.mjs`**: Ensure `index.json` (the content-stripped full index) also includes all item types, not just experiments.

4. **`scripts/generate-registry-json.mjs`** (if needed): If the file paths generated for non-experiment items are incorrect, fix the path resolution. The discovery logic for `src/components/ui/`, `src/hooks/`, and `src/lib/` was added in REGISTRY-2 and may not have been fully tested.

5. **Validation**: After fixing, the expected counts should be approximately:
   - `registry.json`: ~55 items (18 experiments + 22 UI + 11 hooks + 2 utils + 1 style + 1 test)
   - Per-item JSONs in `public/registry/`: ~54 files (all minus hidden `test`)
   - `index-slim.json`: ~53 items (all minus hidden + minus razi-style)
   - `index.json`: ~53 items

### What NOT to Touch

These files are owned by other domains. Do not modify them.

- `src/app/(registry)/registry/page.tsx` -- owned by Domain 2 (Grid Filtering)
- `src/components/registry/RegistryCard.tsx` -- owned by Domain 2 (Grid Filtering)
- `src/app/(registry)/registry/[slug]/page.tsx` -- owned by Domain 3 (Detail Multi-Type)
- `src/components/registry/ExperimentPreview.tsx` -- owned by Domain 3 (Detail Multi-Type)
- `src/components/registry/InstallCommand.tsx` -- owned by Domain 3 (Detail Multi-Type)
- `src/components/registry/RegistryMeta.tsx` -- owned by Domain 3 (Detail Multi-Type)
- `src/app/(registry)/layout.tsx` -- owned by Domain 4 (Theme & Integration)
- `src/app/(registry)/registry.css` -- owned by Domain 4 (Theme & Integration)
- `next.config.ts` -- owned by Domain 4 (Theme & Integration)

### Cross-Domain Notes

- **Depends on**: none
- **Produces**: Per-item JSONs for all item types + updated `index-slim.json` and `index.json` with all categories. Domain 2 (grid page) and Domain 3 (detail page) code against the data shape but don't need this domain's output to compile — they'll see the data at runtime after the pipeline runs.
- **Known interactions**: Domain 2 expects `index-slim.json` items to have a `category` field with values: `"experiments"`, `"components"`, `"hooks"`, `"utilities"`. Domain 3 expects per-item JSON `type` field to distinguish experiment (`registry:block`) from non-experiment types (`registry:component`, `registry:hook`, `registry:lib`).
