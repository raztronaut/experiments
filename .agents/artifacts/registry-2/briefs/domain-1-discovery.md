## Domain 1: Discovery Script

**Scope**: Auto-discover all registry-eligible items (experiments, shared UI, hooks, utils) and output a `registry.json` manifest.
**Complexity**: architecture

### Context to Read First

- `scripts/generate-registry.mjs` -- the existing monolithic script. Port the discovery logic (experiment scanning, import extraction, import categorization, file type inference) into the new script. The functions `extractImports`, `categorizeImport`, `inferFileType`, `getAllComponentFiles`, `resolveImportPath` should all be ported.
- `.agents/temp/orchestration/plan.md` -- the orchestration plan with I/O contracts. Your output must match the `registry.json` contract exactly.
- `AGENTS.md` -- project conventions and structure

### Inventory of Sources to Scan

The new script must discover items from 4 sources:

1. **Experiments** (`src/app/experiments/` + `src/components/experiments/`): 18 shipped experiments. Current logic works well -- port it.
2. **Shared UI** (`src/components/ui/`): 28 components. Each `.tsx` file (except test files) is a potential registry item of type `registry:component`.
3. **Hooks** (`src/hooks/`): 11 hooks. Each `.ts` file is a potential `registry:hook` item.
4. **Utilities** (`src/lib/`): 7 files. Only selected utilities should be included (controlled by `registry.config.json` `scan.utilities` array). Type: `registry:lib`.

### Changes to Make

1. **`scripts/generate-registry-json.mjs`** (NEW FILE): Create the discovery script that:

   a. Reads `registry.config.json` from project root (graceful fallback if missing -- scan experiments only, treat as if no featured/hidden/overrides)

   b. **Experiment scanning** (port from existing script):
      - Scan `src/app/experiments/` for `(experiment-name)/experiment.json`
      - Skip `wip` status, skip `EXCLUDE_EXPERIMENTS` list
      - Read metadata from `experiment.json`
      - Map component files from `src/components/experiments/{name}/`
      - Use `extractImports` + `categorizeImport` to find npm deps and registry deps
      - Use `inferFileType` for proper file type classification
      - Category: `"experiments"`
      - Type: `"registry:block"` if multi-file, `"registry:component"` if single file

   c. **Shared UI scanning** (NEW):
      - Scan `src/components/ui/` for `.tsx` files (skip `.test.tsx`)
      - Each component becomes a `registry:component` item
      - Extract npm deps via `extractImports` + `categorizeImport`
      - Follow local imports to include sub-files
      - Category: `"components"`
      - Name: kebab-case of filename (e.g., `ExperimentDrawerList.tsx` → `experiment-drawer-list`)

   d. **Hooks scanning** (NEW):
      - Scan `src/hooks/` for `.ts` files
      - Each hook becomes a `registry:hook` item
      - Extract npm deps
      - Category: `"hooks"`
      - Name: kebab-case (e.g., `useMediaQuery.ts` → `use-media-query`)

   e. **Utilities scanning** (NEW):
      - Only scan files listed in `registry.config.json` `scan.utilities`
      - Each becomes a `registry:lib` item
      - Category: `"utilities"`

   f. **Apply curation rules** from config:
      - Skip items listed in `hidden`
      - Mark items in `featured` with `meta.featured: true`
      - Apply `overrides` (description, category overrides)

   g. **Include razi-style item**: Always add the shared style item with `type: "registry:style"`, `category: "styles"`. Inline the `SHARED_TAILWIND` config and `SHARED_CSS_VARS` from the existing script.

   h. **Output**: Write `registry.json` to project root (not `public/registry/`). Schema must match the contract in `plan.md`. The `files` entries should have `path` (relative to project root) and `type` -- NO `content` field (that's Domain 2's job).

   i. **Console output**: Log progress (`Discovered N experiments, M components, K hooks, J utilities. Total: N items.`)

2. Port the following functions from the existing script with zero behavior change:
   - `extractImports(content)` -- regex import extractor
   - `categorizeImport(importPath)` -- classify as npm/registry/local
   - `inferFileType(filePath, content)` -- classify file type
   - `getAllComponentFiles(dirPath)` -- recursive file walker
   - `resolveImportPath(basePath)` -- parallel fs.stat resolver
   - `resolveLocalFiles(startFile)` -- transitive import resolver (returns files + npm deps + registry deps)

   For shared UI/hooks scanning: reuse `resolveLocalFiles` to follow transitive imports from each entry file.

### What NOT to Touch

These files are owned by other domains. Do not modify them.

- `scripts/build-registry.mjs` -- owned by Domain 2 (Build Script)
- `scripts/post-process-registry.mjs` -- owned by Domain 3 (Post-Process Script)
- `registry.config.json` -- owned by Domain 4 (Config & Integration)
- `package.json` -- owned by Domain 4 (Config & Integration)
- `scripts/generate-registry.mjs` -- read-only reference (not modified by any domain)
- Any file in `src/app/(registry)/` -- not in scope
- Any file in `src/components/registry/` -- not in scope

### Cross-Domain Notes

- **Depends on**: none (reads registry.config.json if it exists, but has a graceful fallback)
- **Produces**: `registry.json` in project root -- consumed by Domain 2 (Build Script)
- **Known interactions**:
  - Domain 4 creates `registry.config.json` which this script reads. If run before Domain 4, the script falls back to experiment-only scanning. This is fine since the pipeline is chained sequentially at runtime.
  - The `files[].path` format must be relative to project root (e.g., `src/components/experiments/send-button/SendButton.tsx`) for Domain 2 to resolve them.
  - The `meta` field in each item carries metadata that Domain 3 needs for index-slim.json generation.
