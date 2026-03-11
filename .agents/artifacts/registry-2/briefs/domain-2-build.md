## Domain 2: Build Script

**Scope**: Read the `registry.json` manifest, resolve file paths, inline file content, rewrite asset URLs, and output per-item JSON files + the shared style item to `public/registry/`.
**Complexity**: architecture

### Context to Read First

- `scripts/generate-registry.mjs` -- the existing monolithic script. Study the file inlining logic, URL rewriting (`/experiments/` → absolute URL), and per-item JSON output format. Port the inlining + URL rewriting logic.
- `.agents/temp/orchestration/plan.md` -- the orchestration plan with I/O contracts. Your input is `registry.json` (plan's registry.json contract). Your output is per-item JSON files (plan's per-item JSON contract).
- `AGENTS.md` -- project conventions

### Changes to Make

1. **`scripts/build-registry.mjs`** (NEW FILE): Create the build script that:

   a. **Read manifest**: Load `registry.json` from project root. Validate that it exists and has an `items` array. Exit with error if missing.

   b. **Ensure output directory**: `await fs.mkdir('public/registry', { recursive: true })`

   c. **Process each item** in `registry.json.items`:

      For `registry:style` items (like `razi-style`):
      - Write directly to `public/registry/{name}.json` -- these items already have their full data in the manifest (tailwind config, cssVars). No file inlining needed.
      - Add `$schema: "https://ui.shadcn.com/schema/registry-item.json"` to the output.

      For all other items:
      - Read each file listed in `item.files[]` from disk using the `path` field (relative to project root)
      - Inline file content as the `content` field on each file entry
      - **Rewrite asset URLs** in content: replace `'/experiments/` and `"/experiments/` and `` `/experiments/ `` with the absolute URL `'https://www.razisyed.cv/experiments/` (same logic as existing script's `content.replace(/(['"\`])\/experiments\//g, ...)`)
      - Use `inferFileType(filePath, content)` to validate/confirm the `type` field from the manifest
      - Build the output JSON:
        ```json
        {
          "$schema": "https://ui.shadcn.com/schema/registry-item.json",
          "name": "item-name",
          "type": "registry:block",
          "title": "Item Title",
          "description": "...",
          "dependencies": ["motion", "..."],
          "registryDependencies": ["razi-style"],
          "files": [
            {
              "name": "FileName.tsx",
              "type": "registry:component",
              "target": "components/experiments/name/FileName.tsx",
              "content": "... inlined file content ..."
            }
          ]
        }
        ```
      - The `target` field: for `registry:file` type files, set `target` to a reasonable install path (e.g., `components/experiments/{name}/{filename}`). For other types, omit `target`.
      - Write to `public/registry/{name}.json`

   d. **Dedup protection**: Use `Set` of `path.resolve()` to prevent duplicate files within an item (port from existing script).

   e. **Error handling**: If a file listed in the manifest doesn't exist on disk, log a warning and skip that file (don't crash). If an item has zero resolvable files, skip the item entirely with a warning.

   f. **Console output**: Log `✅ Built: {name} ({fileCount} files)` per item. Final summary: `🚀 Built {N} registry items to public/registry/`.

2. **Port these functions** from the existing script (they're also ported in Domain 1 -- that's fine, both scripts need them independently since they run as separate Node.js processes):
   - `inferFileType(filePath, content)` -- for validating file types
   - `extractImports(content)` -- NOT needed here (discovery is Domain 1's job)

   Actually, this script only needs `inferFileType` for validation. The manifest already has file types from Domain 1.

3. **Handle the meta field**: The `registry.json` items may have a `meta` field (tags, tech, status, poster, video). Do NOT include `meta` in the per-item output JSON. It's only for Domain 3's index generation. The per-item JSON should only contain shadcn-compatible fields: `$schema`, `name`, `type`, `title`, `description`, `dependencies`, `registryDependencies`, `files`.

### What NOT to Touch

These files are owned by other domains. Do not modify them.

- `scripts/generate-registry-json.mjs` -- owned by Domain 1 (Discovery Script)
- `scripts/post-process-registry.mjs` -- owned by Domain 3 (Post-Process Script)
- `registry.config.json` -- owned by Domain 4 (Config & Integration)
- `package.json` -- owned by Domain 4 (Config & Integration)
- `scripts/generate-registry.mjs` -- read-only reference (not modified by any domain)
- Any file in `public/registry/` -- Domain 2 WRITES here, but does not read existing files
- Any file in `src/app/(registry)/` -- not in scope
- Any file in `src/components/registry/` -- not in scope

### Cross-Domain Notes

- **Depends on**: Domain 1 (at runtime, not at code-writing time). The `registry.json` manifest must exist before this script runs. But the script can be written now using the contract from plan.md.
- **Produces**: Per-item JSON files in `public/registry/` -- consumed by Domain 3 (Post-Process Script) and by the registry UI pages.
- **Known interactions**:
  - Domain 1 outputs `registry.json` with `meta` fields. This script must pass through meta to the per-item JSON under a `_meta` key OR Domain 3 must re-read `registry.json` to get meta. **Decision: Domain 3 should re-read `registry.json` for meta. This script outputs clean shadcn-compatible JSON only.**
  - The existing `public/registry/*.json` files will be overwritten. The UI pages (`src/app/(registry)/`) read these files -- their format must remain compatible.
  - `razi-style.json` must continue to exist in `public/registry/` for the `registryDependencies` resolution to work via `npx shadcn add`.
