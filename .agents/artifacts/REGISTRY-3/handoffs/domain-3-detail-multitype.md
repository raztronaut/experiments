## Domain 3: Detail Multi-Type -- Handoff Summary

**Status**: DONE

### Completed (plan items done)

- 1: Made detail page type-aware -- `ExperimentPreview` only renders for `registry:block` items; other types (`registry:component`, `registry:hook`, `registry:lib`) skip the preview section entirely -- `src/app/(registry)/registry/[slug]/page.tsx`
- 2: Added viewport toggle bar to `ExperimentPreview` with Desktop (100%), Tablet (768px), Mobile (375px) buttons using lucide icons (Monitor, Tablet, Smartphone); iframe container resizes with smooth CSS `transition-[max-width]` animation; centered in a subtle bg container when narrowed -- `src/components/registry/ExperimentPreview.tsx`
- 3: Improved source code section: first file auto-opens via `open` attribute on first `<details>`; file type badge shown next to filename (component, hook, lib, styles, shader, config, docs); line numbers added via CSS `counter-increment`/`counter-reset` targeting shiki's `.line` spans -- `src/app/(registry)/registry/[slug]/page.tsx`
- 4: Added `type` prop to `RegistryMeta` with human-readable type badge (Block, Component, Hook, Utility) rendered prominently before file/dep counts with distinct primary-colored styling -- `src/components/registry/RegistryMeta.tsx`
- 5: Added `data-umami-event="registry_install_copy"` and `data-umami-event-slug` analytics attributes to the copy button -- `src/components/registry/InstallCommand.tsx`
- 6: Added type label and category to OG image, rendered as uppercase text between title and description with subtle color -- `src/app/(registry)/registry/[slug]/opengraph-image.tsx`
- 7: Updated `getItemMetadata` to extract `category` and `type` from index files (both `index-slim.json` and `index.json`), refactored to loop over index files instead of duplicated try/catch blocks -- `src/app/(registry)/registry/[slug]/page.tsx`

### Extra Discoveries (things found not in the plan)

- The `getItemMetadata` function had duplicated try/catch blocks for slim vs full index; refactored into a single loop for cleaner code -- `src/app/(registry)/registry/[slug]/page.tsx` -- fixed in place

### Extra Changes (files modified beyond the plan)

- None

### Intentional Skips (plan items NOT done, with reasoning)

- None

### Judgment Calls (deviations from the plan)

- Line numbers: Plan suggested checking if shiki `codeToHtml` has a line numbers option. It does not natively in the current setup, so implemented via CSS `counter-increment` on `.line` spans, which shiki already wraps each line in. This is a zero-JS approach that works with the existing shiki output.
- File type detection: Used a simple heuristic (filename contains "hook" or starts with "use" → hook, otherwise extension-based). This is best-effort since the per-item JSON files don't have per-file type metadata.
- Viewport toggle: Used `transition-[max-width]` with `duration-300 ease-in-out` for the smooth resize, with the iframe container centered using flexbox when narrower than full width. The parent has a subtle `bg-muted/20` to visually differentiate the reduced viewport area.
- Type resolution: `itemType` falls back through `item.type` → `metadata.type` → `"registry:block"` to handle items that may not have type fields yet.

### Cross-Domain Dependencies (things another domain needs to verify)

- Domain 1 should: Ensure per-item JSON files include the `type` field (e.g., `"registry:component"`, `"registry:hook"`, `"registry:lib"`) and `category` field. The detail page reads these directly and falls back to `"registry:block"` if absent.
- Domain 1 should: Ensure `index-slim.json` includes `type` and `category` fields per item so `getItemMetadata` can resolve them.
- Domain 4 should: No custom CSS was needed (all Tailwind utilities), but verify the viewport toggle and line number styles render correctly within the registry theme.

### Open Concerns (unresolved issues)

- CSS line numbers depend on shiki outputting `.line` class on each line span. If shiki's theme or output format changes, line numbers may break. This is a known coupling.
- The `getFileTypeLabel` heuristic is simple -- it won't correctly label a `.ts` file that's actually a hook unless it contains "hook" in the filename or starts with "use". Good enough for now but could be improved if the per-item JSON gets richer per-file metadata.

### Files Touched (complete list)

- `src/app/(registry)/registry/[slug]/page.tsx` -- modified
- `src/components/registry/ExperimentPreview.tsx` -- modified
- `src/components/registry/InstallCommand.tsx` -- modified
- `src/components/registry/RegistryMeta.tsx` -- modified
- `src/app/(registry)/registry/[slug]/opengraph-image.tsx` -- modified

### Learnings (reusable insights for future work)

- Shiki `codeToHtml` wraps each line in a `<span class="line">` element, making CSS-based line numbering trivial via `counter-increment` without any JS or shiki configuration changes.
- Biome's CSS class sorting is strict with Tailwind utility ordering -- always run `biome check --fix --unsafe` after adding complex utility class strings to avoid manual sorting.
- The `ultracite` CLI has trouble with paths containing special characters like `()` and `[]`; use `npx biome` directly for those files.
