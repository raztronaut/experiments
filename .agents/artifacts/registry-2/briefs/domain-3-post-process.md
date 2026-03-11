## Domain 3: Post-Process Script

**Scope**: Read built per-item JSON files from `public/registry/` and the `registry.json` manifest, then generate enriched index files (`index.json` and `index-slim.json`) with schema validation.
**Complexity**: integration

### Context to Read First

- `scripts/generate-registry.mjs` (lines 513-529) -- the existing index generation logic. Port the index.json (content-stripped) and index-slim.json (lightweight) generation patterns.
- `.agents/temp/orchestration/plan.md` -- the orchestration plan with I/O contracts. Your input is per-item JSON files in `public/registry/` AND `registry.json` from project root. Your output is `index.json` and `index-slim.json` in `public/registry/`.
- `src/app/(registry)/registry/page.tsx` -- the grid overview page that reads `index-slim.json`. Understand the shape it expects: `{ name, title, description, tags, tech, status, poster, video, category, fileCount, dependencyCount }`.
- `src/app/(registry)/registry/[slug]/page.tsx` -- the detail page that reads individual per-item JSON files AND `index-slim.json` for metadata enrichment.
- `AGENTS.md` -- project conventions

### Changes to Make

1. **`scripts/post-process-registry.mjs`** (NEW FILE): Create the post-process script that:

   a. **Read all per-item JSON files** from `public/registry/`:
      - List all `.json` files in `public/registry/`
      - Exclude: `index.json`, `index-slim.json`, `razi-style.json`
      - Parse each file

   b. **Read `registry.json` manifest** from project root:
      - Parse the manifest to get `meta` fields (tags, tech, status, poster, video, category) for each item
      - Create a `Map<name, meta>` lookup for fast access

   c. **Validate each per-item JSON** against expected schema:
      - Must have: `$schema`, `name`, `type`, `title`, `description`, `files` (array)
      - Should have: `dependencies`, `registryDependencies`
      - Each file in `files` must have: `name`, `type`, `content`
      - Log warnings for validation failures but don't crash

   d. **Generate `index.json`** (content-stripped full index):
      - For each per-item JSON, create a copy with `content` stripped from every file entry
      - Keep all other fields: `name`, `type`, `title`, `description`, `dependencies`, `registryDependencies`, `files` (with `name`, `type`, `target` but no `content`)
      - Write as JSON array to `public/registry/index.json`

   e. **Generate `index-slim.json`** (lightweight grid index):
      - For each item, combine per-item JSON data with `meta` from `registry.json`:
        ```json
        {
          "name": "slug",
          "title": "Display Name",
          "description": "...",
          "tags": ["from", "meta"],
          "tech": ["from", "meta"],
          "status": "shipped",
          "poster": "/experiments/slug/poster.jpg",
          "video": "/experiments/slug/preview.mp4",
          "category": "experiments",
          "fileCount": 5,
          "dependencyCount": 3
        }
        ```
      - `fileCount` = length of `files` array in per-item JSON
      - `dependencyCount` = length of `dependencies` array
      - `tags`, `tech`, `status`, `poster`, `video`, `category` come from `registry.json` meta
      - Sort items: featured items first (check `meta.featured`), then alphabetically by name
      - Write to `public/registry/index-slim.json`

   f. **Console output**:
      - Log validation warnings
      - Log: `✅ Generated index.json ({N} items, {size} KB)`
      - Log: `✅ Generated index-slim.json ({N} items, {size} KB)`
      - Final: `📦 Post-processing complete.`

   g. **Exit code**: Exit 0 on success. Exit 1 if no items found (pipeline broken). Validation warnings do NOT cause non-zero exit.

### What NOT to Touch

These files are owned by other domains. Do not modify them.

- `scripts/generate-registry-json.mjs` -- owned by Domain 1 (Discovery Script)
- `scripts/build-registry.mjs` -- owned by Domain 2 (Build Script)
- `registry.config.json` -- owned by Domain 4 (Config & Integration)
- `package.json` -- owned by Domain 4 (Config & Integration)
- `scripts/generate-registry.mjs` -- read-only reference
- Any file in `src/app/(registry)/` -- not in scope
- Any file in `src/components/registry/` -- not in scope
- Individual per-item JSON files in `public/registry/` -- read-only for this script (Domain 2 writes them)

### Cross-Domain Notes

- **Depends on**: Domain 1 + Domain 2 (at runtime). `registry.json` must exist (Domain 1) and per-item JSON files must exist in `public/registry/` (Domain 2). But the script can be written now using the contracts.
- **Produces**: `public/registry/index.json` and `public/registry/index-slim.json` -- consumed by the registry UI pages.
- **Known interactions**:
  - The `index-slim.json` schema must remain backward-compatible with the existing grid page (`src/app/(registry)/registry/page.tsx`). Current fields: `name`, `title`, `description`, `tags`, `tech`, `status`, `poster`, `video`, `category`, `fileCount`, `dependencyCount`. Adding new fields is fine; removing or renaming existing fields would break the UI.
  - Domain 2 produces per-item JSON WITHOUT `meta` fields. This script MUST read `registry.json` to get meta (tags, tech, status, poster, video, category). If `registry.json` is missing, fall back to inferring what you can from per-item JSON (name, title, description, file/dep counts) and leave meta fields as defaults.
  - `razi-style.json` should be excluded from both indices (it's a style item, not a browsable registry item).
