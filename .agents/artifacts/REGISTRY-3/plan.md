# REGISTRY-3: Polish, Full Catalog & Integration

**Date**: 2026-03-11
**Skill**: parallel-orchestration
**Plan reference**: `.cursor/plans/registry_interactive_docs_aaa07efa.plan.md` (Phase 7 Polish + remaining work)
**Prior rounds**: REGISTRY-1 (lean foundation), REGISTRY-2 (pipeline split)

## Objective

Ship the registry to "close to publishable" quality. Fix the pipeline so ALL 55 discovered items (not just experiments) build and index. Add category filtering to the grid page. Support non-experiment item types on the detail page. Polish theme/layout with grain overlay, CSP headers, analytics, and main site integration.

## Current State

- **Pipeline**: 3-step (`generate-registry-json.mjs` → `build-registry.mjs` → `post-process-registry.mjs`)
- **Manifest**: `registry.json` has 55 items (18 experiments, 22 UI components, 11 hooks, 2 utils, 1 style, 1 test)
- **Built output**: Only ~20 per-item JSONs in `public/registry/` (experiments + razi-style + test)
- **Indexes**: `index-slim.json` (18 items, experiments only), `index.json` (19 items, experiments only)
- **UI**: Grid page, detail page, 4 components (RegistryCard, InstallCommand, ExperimentPreview, RegistryMeta)
- **Config**: noindex headers, `/r/:slug` rewrite, outputFileTracingIncludes
- **Security**: iframe sandbox already present on ExperimentPreview

## Key Gap

The `build-registry.mjs` script reads `registry.json` but only builds items whose source files exist and are readable. Shared UI/hooks/utils may not be building because their file paths in the manifest use a different structure than experiments. The `post-process-registry.mjs` script reads whatever is in `public/registry/` — so if items aren't built, they won't appear in indexes. Domain 1 must fix this end-to-end.

## Domains (4, single batch)

| # | Domain | Scope | Complexity | Model |
|---|--------|-------|------------|-------|
| 1 | Pipeline Full Catalog | Fix build + post-process to handle ALL item types | integration | default |
| 2 | Grid Filtering | Category tabs, search, multi-type card support | integration | default |
| 3 | Detail Multi-Type | Conditional preview, viewport toggle, code improvements | integration | default |
| 4 | Theme & Integration | Grain overlay, CSP, analytics events, main site link | integration | default |

## File Ownership

| File | Domain |
|------|--------|
| `scripts/build-registry.mjs` | 1 |
| `scripts/post-process-registry.mjs` | 1 |
| `scripts/generate-registry-json.mjs` | 1 (read-only, minor fixes only if needed) |
| `src/app/(registry)/registry/page.tsx` | 2 |
| `src/components/registry/RegistryCard.tsx` | 2 |
| `src/app/(registry)/registry/[slug]/page.tsx` | 3 |
| `src/components/registry/ExperimentPreview.tsx` | 3 |
| `src/components/registry/InstallCommand.tsx` | 3 |
| `src/components/registry/RegistryMeta.tsx` | 3 |
| `src/app/(registry)/registry/[slug]/opengraph-image.tsx` | 3 |
| `src/app/(registry)/layout.tsx` | 4 |
| `src/app/(registry)/registry.css` | 4 |
| `next.config.ts` | 4 |
| `src/app/(main)/page.tsx` | 4 (minimal: add registry link) |

## Data Contracts

### Domain 1 → Domain 2 (index-slim.json shape)
```json
{
  "name": "experiment-drawer-list",
  "title": "ExperimentDrawerList",
  "description": "macOS-style drawer list with grid/list toggle",
  "category": "components",
  "tags": [],
  "tech": [],
  "status": "shipped",
  "poster": "",
  "video": "",
  "fileCount": 1,
  "dependencyCount": 2
}
```

Non-experiment items will have `category` values: `"components"`, `"hooks"`, `"utilities"`. They will NOT have `poster` or `video` fields (empty strings). Domain 2's filtering UI must handle items with no media gracefully.

### Domain 1 → Domain 3 (per-item JSON shape)
Per-item JSONs for non-experiment items will have `type` values like `"registry:component"`, `"registry:hook"`, `"registry:lib"` (NOT `"registry:block"`). Domain 3's detail page must check `type` and conditionally render the preview section.

## Dependency Graph

```
Domain 1 ──┐
Domain 2 ──┤── (all independent, single batch)
Domain 3 ──┤
Domain 4 ──┘
```

No cross-domain dependencies block parallel execution. Domains 2 and 3 code against the data shape contract above. After all domains complete, a pipeline run integrates everything.

## Post-Orchestration Steps

1. Run `node scripts/generate-registry-json.mjs && node scripts/build-registry.mjs && node scripts/post-process-registry.mjs`
2. Verify all 55 items (minus hidden) appear in built output
3. Verify `index-slim.json` has items across all categories
4. Run `npx tsc --noEmit` to verify zero type errors
5. Run `npx ultracite check .` in relevant directories
6. Spot-check `/registry` page and a few detail pages in browser
