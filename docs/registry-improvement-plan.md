# Registry Improvement Plan (Future)

A single plan for improving the registry with best practices: what’s in place, what to do next, and which agent/user docs to update.

---

## Current State (Implemented)

- **Component previews for all components**: Every registry component doc has a Preview section. Entries in `UI_COMPONENT_PREVIEWS` get a live iframe (`/component-preview/[slug]`); others get `ComponentPreviewPlaceholder` (“Preview not yet added”).
- **Single source of truth**: Slug list is derived from `src/components/registry/ui-component-previews.tsx` via `scripts/export-component-preview-slugs.mjs` → `scripts/component-preview-slugs.json`. The MDX generator reads that JSON; no duplicate list in the generator.
- **Pipeline**: `generate:registry` runs 5 steps: generate-registry-json → build-registry → post-process-registry → **export-component-preview-slugs** → generate-registry-mdx.
- **Preview coverage by category**:
  - **Experiments**: Live iframe to `/experiments/[slug]` (ExperimentPreview).
  - **Components**: Live iframe for slugs in `UI_COMPONENT_PREVIEWS`; placeholder for the rest.
  - **MDX**: Live iframe for slugs in `MDX_PREVIEW_SLUGS` (12 items) via `/mdx-preview/[slug]`.
  - **Collected**: Permanent preview routes at `/collected/[slug]` (iframe); docs do not yet embed a Preview block like components.
  - **Hooks / Utilities**: No preview blocks (code-only docs).

---

## Future Improvements (Best Practices)

### 1. Expand custom component previews

- **Goal**: Replace placeholders with real previews for high-value UI components (e.g. input, drawer, popover, progress, tabs, tooltip).
- **How**: Add entries to `UI_COMPONENT_PREVIEWS` in `src/components/registry/ui-component-previews.tsx`. Re-run `npm run generate:registry`. No generator changes.
- **Priority**: Medium. Improves “visualize all components” for installers.

### 2. Optional fallback preview (later)

- **Goal**: For components without a custom preview, optionally try rendering the registry component with no props inside an error boundary (e.g. `<Component />`). Many primitives work; others show “Needs props” or an error.
- **How**: Preview route or a “DefaultPreview” wrapper that dynamic-imports the component from registry metadata and renders with error boundary. Requires registry JSON to expose main export path and possibly default props.
- **Priority**: Low. Placeholder is enough for doc consistency; fallback adds complexity and can break for props-heavy components.

### 3. Usage snippet correctness

- **Goal**: Every component’s generated “Usage” section shows the correct import path and component name (e.g. `Badge` from `@/components/ui/badge`, not `badge`).
- **How**: Audit and fix `buildUsageSection` in `generate-registry-mdx.mjs` (main file target, default export name). Some components (e.g. badge) currently show lowercase or wrong export.
- **Priority**: High. Directly affects installers copying code.

### 4. Registry V2 generated output audit

- **Goal**: One-time deep pass over generated MDX, registry JSON, and detail pages for all items. Check: descriptions, preview iframes, source rendering, install commands, metadata, Fumadocs layout, mobile.
- **How**: Follow “Registry V2 generated output review” in `.agents/backlog/t2-content-registry.md`. Produce a short checklist or report and fix script/template issues.
- **Priority**: High. Ensures quality and catches regressions.

### 5. Metadata and schema completeness

- **Goal**: Populate `updated`, `inspiration`, `related` (and any other schema fields) where applicable. Reduces “missing recommended field” warnings from post-process.
- **How**: Define conventions (e.g. `updated` = last file change or manual), then batch-update experiment/component metadata; optionally extend scanner to infer some fields.
- **Priority**: Medium. Improves consistency and future tooling.

### 6. Collected / Hooks / Utilities previews (optional)

- **Goal**: If useful, add a Preview section for collected components (embed existing `/collected/[slug]` iframe) and, if ever needed, for hooks/utilities (e.g. minimal “usage in browser” demo).
- **How**: Collected: extend MDX generator to add a “Preview” block for category `collected` that uses an iframe to `/collected/[slug]`. Hooks/utilities: only if you add dedicated demo routes.
- **Priority**: Low for hooks/utilities; medium for collected if you want parity with components.

### 7. OG / social for registry pages

- **Goal**: Registry doc pages have Open Graph and Twitter metadata so shares look good.
- **How**: Fumadocs or layout-level metadata for `/registry/docs/[...]` using title/description from MDX frontmatter; optionally OG image generation for high-traffic items.
- **Priority**: Low. Nice for sharing and SEO.

### 8. Contributor-facing doc for adding previews

- **Goal**: One short doc (or section in docs/registry.md) that explains how to add a component preview: edit `UI_COMPONENT_PREVIEWS`, run `generate:registry`, and what the placeholder says when no preview exists.
- **How**: Add “Adding a component preview” to docs/registry.md (or CONTRIBUTING) with the exact file and command.
- **Priority**: Medium. Reduces friction for contributors and future you.

---

## Doc Updates (Required)

These updates keep agent and user docs aligned with current behavior and the pipeline.

| Doc | Update |
|-----|--------|
| **docs/registry.md** | (1) Add “Previews” section: which categories show previews and how (experiments iframe, components custom/placeholder, MDX iframe, collected routes). (2) Update “Generation Pipeline” to 5 steps; add step 4: `export-component-preview-slugs.mjs` (reads `ui-component-previews.tsx`, writes `component-preview-slugs.json`). (3) Add “Adding a component preview” (edit `UI_COMPONENT_PREVIEWS`, run `generate:registry`). |
| **docs/scripts.md** | Change “4-script” to “5-script” pipeline. Add subsection for `export-component-preview-slugs.mjs` (runs after post-process, before generate-registry-mdx). Update the “Full Registry Pipeline” code comment to list all 5 steps. |
| **.cursor/skills/run-generation/SKILL.md** | Update “Registry Pipeline (4 steps)” to 5 steps; insert step 4: export-component-preview-slugs.mjs (derives slug list from TS for MDX generator). |
| **.cursor/rules/registry-curation.mdc** | In “Code Display” (or new “Previews” bullet): state that component docs get a Preview section for every item; custom previews from `UI_COMPONENT_PREVIEWS` (single source of truth), others show `ComponentPreviewPlaceholder`; slug list is produced by `export-component-preview-slugs.mjs` before MDX generation. |
| **AGENTS.md** | Optional: in the Reference Docs table, add a row: “Registry” → `docs/registry.md` — “Editing registry pipeline, component previews, or registry docs.” |
| **.agents/backlog/t2-content-registry.md** | In the Registry section, add a short bullet: “Component previews: all components have a Preview section (custom iframe or placeholder); single source of truth in `UI_COMPONENT_PREVIEWS`. Future work: see `docs/registry-improvement-plan.md`.” |

---

## Summary

- **Done**: All components have a Preview block; custom previews are driven by `UI_COMPONENT_PREVIEWS` with a single derived slug list; pipeline is 5 steps.
- **Next**: Fix usage snippets, run the Registry V2 output audit, document “adding a preview,” then optionally grow custom previews and metadata.
- **Docs**: Update docs/registry.md, docs/scripts.md, run-generation SKILL, registry-curation rule, and optionally AGENTS.md and backlog t2, so agents and users have one place to read registry behavior and best practices.
