## Domain 1: Registry Script Overhaul

**Scope**: Fix all known bugs and improve the registry generation script to produce better-structured output.
**Complexity**: integration

### Context to Read First

- `scripts/generate-registry.mjs` -- the full script being overhauled
- `src/app/experiments/(send-button)/experiment.json` -- example experiment.json to understand metadata schema
- `AGENTS.md` -- project conventions
- `.cursor/plans/registry_interactive_docs_aaa07efa.plan.md` (lines 42-68, 122-130) -- known bugs list and fix descriptions

### Changes to Make

1. **`scripts/generate-registry.mjs` -- Fix dedup bug (line ~299-309)**: The dedup comparison currently compares `existing.path` (which is just `f.name`, a basename) against `f.path` (absolute path). Fix: compare `path.resolve(f.path)` consistently, or compare the `target` field which is already normalized.

2. **`scripts/generate-registry.mjs` -- Extract shared tailwind/cssVars**: The ~120 lines of hardcoded `tailwind` and `cssVars` config (lines ~323-441) are duplicated in every registry item. Extract this into a separate "razi-style" item:
   - Generate a `public/registry/razi-style.json` file with `type: "registry:style"` containing the shared tailwind config and cssVars
   - Each experiment item should reference `"razi-style"` in its `registryDependencies` array instead of inlining the full tailwind/cssVars
   - Remove the `tailwind` and `cssVars` fields from individual experiment items

3. **`scripts/generate-registry.mjs` -- Add file type semantics**: Currently everything uses `type: "registry:file"`. Improve:
   - Files containing React components (`.tsx` with JSX/capitalized exports): `"registry:component"`
   - Files in a `hooks/` directory or starting with `use`: `"registry:hook"`
   - Files in a `lib/` or `utils/` directory: `"registry:lib"`
   - Shader files (`.glsl`, `.frag`, `.vert`): `"registry:file"`
   - Default fallback: `"registry:file"` (with `target` field set)

4. **`scripts/generate-registry.mjs` -- Generate lightweight index**: The current `index.json` includes file contents (~890KB). Generate two files:
   - `public/registry/index.json` -- full index (for backward compatibility), but strip `content` field from files array entries to reduce size
   - `public/registry/index-slim.json` -- lightweight index for the grid overview page with this schema:
     ```json
     [{
       "name": "send-button",
       "title": "Send Button",
       "description": "A cool animated send button animation",
       "tags": ["ui", "animation", "interaction"],
       "tech": ["motion"],
       "status": "shipped",
       "poster": "/experiments/send-button/preview-send-button.png",
       "video": "/experiments/send-button/preview-send-button.mp4",
       "category": "experiments",
       "fileCount": 5,
       "dependencyCount": 3
     }]
     ```
   - Pull `poster`, `video`, `tags`, `tech`, `status` from `experiment.json` metadata

5. **`scripts/generate-registry.mjs` -- Parallelize fs.stat calls**: The import resolver (lines ~156-215) uses sequential `fs.stat` calls. Parallelize with `Promise.all`:
   ```javascript
   const results = await Promise.all(
     possibleExtensions.map(ext =>
       fs.stat(`${resolvedDir}${ext}`).then(s => s.isFile() ? ext : null).catch(() => null)
     )
   );
   const foundExt = results.find(r => r !== null);
   ```

6. **`scripts/generate-registry.mjs` -- Use proper item type**: Change `type: "registry:ui"` to `type: "registry:block"` for multi-file experiments (which is what they are -- blocks of multiple components). Single-file items can use `"registry:component"`.

7. **`scripts/generate-registry.mjs` -- Add $schema field**: Add `"$schema": "https://ui.shadcn.com/schema/registry-item.json"` to each generated item for IDE validation.

### What NOT to Touch

These files are owned by other domains. Do not modify them.

- `src/app/(registry)/**` -- owned by Domain 2 (Route & Pages)
- `src/components/registry/**` -- owned by Domain 3 (Components)
- `next.config.ts` -- owned by Domain 4 (Config & Integration)
- `package.json` -- owned by Domain 4 (Config & Integration)

### Cross-Domain Notes

- **Depends on**: none
- **Produces**: `public/registry/index-slim.json` schema consumed by Domain 2's overview page; `public/registry/razi-style.json` shared style item
- **Known interactions**: Domain 2's overview page reads `index-slim.json`. The schema is defined above -- stick to it exactly. Domain 4 may need to know that we keep output in `public/registry/` (NOT moving to `public/r/` -- the existing rewrite handles the URL mapping).
