## Domain 3: Detail Multi-Type

**Scope**: Update the detail page and its components to support non-experiment item types (components, hooks, utilities), add viewport toggle for experiment previews, and improve code display.
**Complexity**: integration

### Context to Read First

- `AGENTS.md` -- project conventions (always read)
- `src/app/(registry)/registry/[slug]/page.tsx` (all) -- current detail page. Reads per-item JSON, highlights code with shiki, renders ExperimentPreview + InstallCommand + RegistryMeta + collapsible source.
- `src/components/registry/ExperimentPreview.tsx` (all) -- iframe preview with loading/error states. Already has `sandbox` attribute.
- `src/components/registry/InstallCommand.tsx` (all) -- terminal-style copy block for `npx shadcn add`.
- `src/components/registry/RegistryMeta.tsx` (all) -- metadata badges (file count, dep count, tech pills, tags).
- `src/app/(registry)/registry/[slug]/opengraph-image.tsx` (all) -- OG image generation for detail pages.
- `.cursor/plans/registry_interactive_docs_aaa07efa.plan.md` (lines 880-936) -- Phase 5 preview system specs, viewport toggle, error boundary, iframe best practices.

### Changes to Make

1. `**src/app/(registry)/registry/[slug]/page.tsx`**: Make the detail page type-aware. The per-item JSON has a `type` field:
  - `"registry:block"` → experiment (full iframe preview)
  - `"registry:component"` → shared UI component (no iframe, show code-only or a simplified preview)
  - `"registry:hook"` → hook (no iframe, code-only)
  - `"registry:lib"` → utility (no iframe, code-only)
   Conditionally render `ExperimentPreview` ONLY for `registry:block` items. For other types, skip the preview section entirely or show a compact "code preview" of the main file.
2. `**src/components/registry/ExperimentPreview.tsx**`: Add a viewport toggle bar above the iframe with 3 buttons: Desktop (100% width), Tablet (768px), Mobile (375px). The buttons resize the iframe container width with a smooth CSS transition. Only show the toggle for experiment previews (the parent page controls whether this component renders). Keep the existing loading/error states.
3. `**src/app/(registry)/registry/[slug]/page.tsx**`: Improve the source code section:
  - Auto-open the first (main) file's `<details>` element by default (add `open` attribute to the first one).
  - Show the file type badge next to each filename in the summary (e.g., "component", "hook", "lib").
  - Add line numbers to the code display if shiki supports it (check if `codeToHtml` has a line numbers option, or add via CSS `counter-increment`).
4. `**src/components/registry/RegistryMeta.tsx**`: Add a `type` prop to display the item type as a badge (e.g., "Block", "Component", "Hook", "Utility"). Map registry types to human-readable labels. Show the type badge prominently before the file/dep counts.
5. `**src/components/registry/InstallCommand.tsx**`: Add a `data-umami-event="registry_install_copy"` and `data-umami-event-slug` attribute to the copy button for analytics tracking.
6. `**src/app/(registry)/registry/[slug]/opengraph-image.tsx**`: Add the item type and category to the OG image rendering. Show a subtle type label (e.g., "Component" or "Hook") below the title.
7. `**src/app/(registry)/registry/[slug]/page.tsx**`: Update `getItemMetadata` to also extract `category` and `type` from the index, reducing the need to parse these from the per-item JSON separately. Handle the case where shared UI/hooks/utils may not be in `index-slim.json` yet (they will be after Domain 1's pipeline fix).

### What NOT to Touch

These files are owned by other domains. Do not modify them.

- `scripts/build-registry.mjs` -- owned by Domain 1 (Pipeline Full Catalog)
- `scripts/post-process-registry.mjs` -- owned by Domain 1 (Pipeline Full Catalog)
- `scripts/generate-registry-json.mjs` -- owned by Domain 1 (Pipeline Full Catalog)
- `src/app/(registry)/registry/page.tsx` -- owned by Domain 2 (Grid Filtering)
- `src/components/registry/RegistryCard.tsx` -- owned by Domain 2 (Grid Filtering)
- `src/app/(registry)/layout.tsx` -- owned by Domain 4 (Theme & Integration)
- `src/app/(registry)/registry.css` -- owned by Domain 4 (Theme & Integration)
- `next.config.ts` -- owned by Domain 4 (Theme & Integration)

### Cross-Domain Notes

- **Depends on**: Domain 1 at runtime (per-item JSONs for non-experiment items won't exist until pipeline is fixed). But the code changes are independent — the detail page should gracefully handle missing items via try/catch (already does this).
- **Produces**: A detail page that renders appropriately for all item types. Domain 2's cards link to these detail pages.
- **Known interactions**: Domain 4 owns `registry.css` — any new CSS classes needed for the viewport toggle or code display improvements should use Tailwind utility classes, NOT custom CSS in `registry.css`. If you absolutely need custom CSS, flag it in the handoff for Domain 4 to add.

