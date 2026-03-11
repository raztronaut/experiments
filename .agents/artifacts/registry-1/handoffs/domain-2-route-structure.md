## Domain 2: Registry Route & Pages -- Handoff Summary

**Status**: DONE

### Completed (plan items done)

- 1: Created `src/app/(registry)/registry.css` -- CSS with shared-tokens import, tailwind, tw-animate-css, shared-theme, base styles (border-border, scrollbar, selection colors, shiki code block styling)
- 2: Created `src/app/(registry)/layout.tsx` -- Own `<html>/<body>` with `className="dark"`, activeFont, UmamiScript, Analytics, SpeedInsights, minimal header with "razi's registry" link + back link, metadata with title template and noindex/nofollow
- 3: Created `src/app/(registry)/registry/page.tsx` -- Server component reading index-slim.json with try/catch fallback to index.json, filters out WIP items, renders responsive 3-col grid of RegistryCard components, shows heading + item count
- 4: Created `src/app/(registry)/registry/[slug]/page.tsx` -- Server component with generateStaticParams (reads registry dir, excludes index/style files), generateMetadata for dynamic title/description, reads slug.json + index metadata for tags/tech, Shiki syntax highlighting for all source files in collapsible `<details>`, renders ExperimentPreview, InstallCommand, RegistryMeta, and source code sections
- 5: Created `src/app/(registry)/registry/[slug]/opengraph-image.tsx` -- Dynamic OG image 1200x630, dark background matching site colors, title/description/URL, Node.js runtime (not edge) to allow fs.readFile

### Extra Discoveries (things found not in the plan)

- The brief mentioned import paths use `../../` for shared-tokens/shared-theme, but actual patterns in globals.css and experiments.css use `../` -- used `../` to match existing codebase convention

### Extra Changes (files modified beyond the plan)

- None

### Intentional Skips (plan items NOT done, with reasoning)

- None

### Judgment Calls (deviations from the plan)

- Plan said `export const runtime = 'edge'` for OG image, but edge runtime cannot use `node:fs`. Used Node.js runtime (no runtime export) instead so the OG image can read registry JSON files via fs.readFile. The OG image still works identically.
- Brief mentioned `@custom-variant dark` in registry.css, but this is already defined in `shared-theme.css` which is imported. Omitted to avoid duplication.
- For tags/tech on the detail page: the brief's RegistryMeta interface uses `metadata.tags` and `metadata.tech`. Implemented a `getItemMetadata()` helper that reads index-slim.json (fallback to index.json) to extract tags/tech for the given slug, since individual slug.json files in the current codebase don't contain these fields.
- Used default `""` and `[]` fallbacks when passing optional RegistrySlimItem fields to RegistryCard/RegistryMeta to satisfy strict prop types from Domain 3's components.

### Cross-Domain Dependencies (things another domain needs to verify)

- Domain 3 should: Verify that RegistryCard, InstallCommand, ExperimentPreview, and RegistryMeta component prop types match what is passed in the overview page (page.tsx) and detail page ([slug]/page.tsx). Current prop passing uses `poster=""`, `video=""`, `tags=[]`, `tech=[]`, `category=""` as defaults for missing data.
- Domain 1 should: Verify that index-slim.json includes `status` field per item so the WIP filter works. Current filter checks `!("status" in item && item.status === "wip")`.
- Domain 1 should: Verify that individual `{slug}.json` files are unchanged or backwards-compatible. The detail page reads the current schema (name, type, title, description, dependencies, registryDependencies, files).
- Domain 4 should: Ensure no `next.config.ts` changes are needed for the `(registry)` route group (rewrites, redirects, etc.).

### Open Concerns (unresolved issues)

- None. All 5 files created, tsc --noEmit passes with 0 errors, lint passes clean.

### Files Touched (complete list)

- `src/app/(registry)/registry.css` -- created
- `src/app/(registry)/layout.tsx` -- created
- `src/app/(registry)/registry/page.tsx` -- created
- `src/app/(registry)/registry/[slug]/page.tsx` -- created
- `src/app/(registry)/registry/[slug]/opengraph-image.tsx` -- created

### Learnings (reusable insights for future work)

- In Next.js 16, `params` is a Promise in page components, generateMetadata, AND opengraph-image route handlers. Always `await params`.
- Route group CSS files at the same depth as `(main)` use `../` to reach shared-tokens.css and shared-theme.css in `src/app/`.
- `@custom-variant dark` is already in shared-theme.css -- route group CSS files that import it don't need to redeclare it.
- Shiki v4 `codeToHtml` works great in server components for build-time syntax highlighting. Wrapping in try/catch with HTML-escaped fallback handles edge cases (unknown languages, etc.).
- OG images using `next/og` ImageResponse work fine without edge runtime -- Node.js runtime allows filesystem access which is cleaner for static data.
