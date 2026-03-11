## Domain 2: Grid Filtering

**Scope**: Add category filtering, client-side search, and multi-type card support to the registry grid page.
**Complexity**: integration

### Context to Read First

- `AGENTS.md` -- project conventions (always read)
- `src/app/(registry)/registry/page.tsx` (all) -- current grid page. Server component reading `index-slim.json`. Shows a flat 3-col grid of `RegistryCard` components.
- `src/components/registry/RegistryCard.tsx` (all) -- current card component. Client component with hover-to-play video, poster, category badge, tech pills. Only handles experiment items with media.
- `public/registry/index-slim.json` -- current slim index shape. Items have: `name`, `title`, `description`, `tags`, `tech`, `status`, `poster`, `video`, `category`, `fileCount`, `dependencyCount`.
- `.cursor/plans/registry_interactive_docs_aaa07efa.plan.md` (lines 984-1035) -- Phase 6 custom component specs and card grid best practices.

### Changes to Make

1. **`src/app/(registry)/registry/page.tsx`**: Refactor the page to support category filtering. The page is currently a server component — extract the grid + filter UI into a client component (e.g., `RegistryGrid`) that can handle client-side filtering without making the page itself a client component. The server component fetches data and passes it down.

   Add:
   - **Category tabs** at the top: "All", "Experiments", "Components", "Hooks", "Utilities". Derive available categories from the data. Show count per category.
   - **Text search** input: filters by title and description. Debounced, client-side.
   - **Featured section**: items with `featured: true` in the slim index should appear first or in a highlighted "Featured" row.
   - Update the item count to reflect filtered results.
   - The "All" tab is the default. URL doesn't need to change (no routing, just client-side state).

2. **`src/components/registry/RegistryCard.tsx`**: Update the card to gracefully handle non-experiment items that have NO poster/video. For items without media:
   - Show a styled placeholder: icon-based (e.g., a code bracket icon for components, a hook icon for hooks, a wrench for utilities) + the item's first letter as a fallback.
   - The current code already has a fallback (`bg-gradient-to-br from-accent to-muted` with first letter) — enhance it with category-specific styling/icons.
   - For non-experiment items, the category badge should reflect "component", "hook", or "utility" instead of "experiments".
   - Ensure the card's `aria-label` says "View [title] [category]" not just "experiment".

3. **`src/app/(registry)/registry/page.tsx`**: Update the `RegistrySlimItem` interface to include optional fields for the full catalog: `featured?: boolean`. Non-experiment items may also have `type` field from the registry spec.

4. **Responsive layout**: Verify the grid works well with mixed content (experiments with video + components without video). The grid should be visually balanced. Consider using a 2-col layout for non-experiment items on desktop if they look sparse without media.

### What NOT to Touch

These files are owned by other domains. Do not modify them.

- `scripts/build-registry.mjs` -- owned by Domain 1 (Pipeline Full Catalog)
- `scripts/post-process-registry.mjs` -- owned by Domain 1 (Pipeline Full Catalog)
- `scripts/generate-registry-json.mjs` -- owned by Domain 1 (Pipeline Full Catalog)
- `src/app/(registry)/registry/[slug]/page.tsx` -- owned by Domain 3 (Detail Multi-Type)
- `src/components/registry/ExperimentPreview.tsx` -- owned by Domain 3 (Detail Multi-Type)
- `src/components/registry/InstallCommand.tsx` -- owned by Domain 3 (Detail Multi-Type)
- `src/components/registry/RegistryMeta.tsx` -- owned by Domain 3 (Detail Multi-Type)
- `src/app/(registry)/layout.tsx` -- owned by Domain 4 (Theme & Integration)
- `src/app/(registry)/registry.css` -- owned by Domain 4 (Theme & Integration)
- `next.config.ts` -- owned by Domain 4 (Theme & Integration)

### Cross-Domain Notes

- **Depends on**: Domain 1 (pipeline fix) at runtime — the filtering UI will only show experiments until Domain 1's pipeline fix runs and builds shared UI/hooks/utils into the index. But the UI code is independent and can be built now.
- **Produces**: A filterable grid page that automatically adapts when new item types appear in the index.
- **Known interactions**: Domain 1 ensures `index-slim.json` items have `category` values: `"experiments"`, `"components"`, `"hooks"`, `"utilities"`. Domain 2's category tabs must use these exact values. If a `featured` field is added to the slim index by Domain 1, use it; otherwise derive featured status from a hardcoded list matching `registry.config.json`.
