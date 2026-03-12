---
name: Registry V2 Fix Crash
overview: Fix the OOM crash caused by 700KB of inline source code in MDX files, address visual issues (generic component cards, story items as separate entries), and enable fumadocs async mode -- before tackling any remaining features.
todos:
  - id: a1-remove-inline-source
    content: Remove inline source code from generate-registry-mdx.mjs, replace with <RegistrySourceCode slug /> component reference
    status: completed
  - id: a2-source-code-component
    content: Create RegistrySourceCode client component that fetches /registry/<slug>.json on mount and renders with CodeBlock
    status: completed
  - id: a3-async-mode
    content: "Enable async: true in source.config.ts for lazy MDX compilation"
    status: cancelled
  - id: a4-remove-old-route
    content: Delete /registry/[slug]/page.tsx (keep opengraph-image.tsx)
    status: completed
  - id: a5-verify-no-crash
    content: Re-run MDX generation, start dev server, verify docs pages load without OOM
    status: completed
  - id: b1-filter-story-items
    content: Filter .story items from grid cards and MDX generation
    status: completed
  - id: b2-improve-descriptions
    content: "Improve generic 'Shared UI component: X' descriptions on cards"
    status: completed
  - id: b3-sidebar-tabs
    content: Add 4 category tabs to docs/layout.tsx sidebar config
    status: completed
  - id: b4-fix-meta-links
    content: Fix RegistryMeta registryDependency links from /styles/ to plain badges
    status: completed
  - id: b5-fix-import
    content: Replace fragile relative import with @/mdx-components alias
    status: completed
  - id: c-verify
    content: "Full verification: tsc, dev server, build, visual QA of grid + docs pages"
    status: completed
isProject: false
---

# Registry V2: Fix Crash, Performance, and Visual Issues

## Root Cause Analysis

The dev server OOM-crashes (8GB heap exhausted) whenever a `/registry/docs/*` page is visited. Confirmed reproducible even with `--max-old-space-size=4096`.

**What happens:**

1. fumadocs-mdx generates [.source/server.ts](.source/server.ts) with 61 static imports -- one per MDX file
2. Each MDX file contains full inlined source code (total: 700KB, 22K lines across 61 files)
3. When any docs page is visited, Turbopack must compile ALL 61 MDX files simultaneously (they're all statically imported)
4. The old [/registry/[slug]/page.tsx](src/app/(registry)/registry/[slug]/page.tsx) also runs `generateStaticParams` reading all JSON files
5. Combined: fumadocs MDX compilation + old route JSON parsing + Shiki highlighting exhausts the heap

**Evidence from stack trace:** `JsonParser::ParseJsonArray` -> `JsonParser::ParseJsonObject` recursive calls inside `Builtin_JsonParse`, triggered by code generation (`ModifyCodeGenerationFromStrings` / `GlobalEval`). The V8 engine is OOM while parsing the compiled MDX output.

---

## Phase A: Fix the OOM Crash (Critical Blocker)

### A1. Remove inline source code from generated MDX files

The core fix. [scripts/generate-registry-mdx.mjs](scripts/generate-registry-mdx.mjs) currently inlines every source file into each MDX. Instead:

- Replace inline code blocks in `buildExperimentMdx()` and `buildNonExperimentMdx()` with a `<RegistrySourceCode slug="..." />` component reference
- This reduces MDX files from avg ~11KB to ~500 bytes each (metadata + component refs only)
- Total content drops from 700KB to ~30KB

### A2. Create `RegistrySourceCode` client component

New component at `src/components/registry/RegistrySourceCode.tsx`:

- Client component that fetches `/registry/<slug>.json` on mount
- Renders each file in a collapsible `<details>` with fumadocs `CodeBlock`/`Pre` for copy buttons
- Uses Shiki via fumadocs' built-in highlighting (or a simpler approach: render the raw code in `<Pre>` with language annotation and let fumadocs handle syntax highlighting)
- Lazy loads: source code is never in the MDX bundle, only fetched when the page is viewed

### A3. Enable fumadocs `async: true`

Update [source.config.ts](source.config.ts):

```typescript
export const registryDocs = defineDocs({
  dir: "content/registry",
  docs: {
    async: true,  // lazy-load MDX compilation
  },
});
```

Per [fumadocs docs](https://fumadocs.dev/docs/mdx/async), this enables async imports so MDX files are compiled on-demand rather than all at once.

### A4. Remove old `/registry/[slug]` route

Delete [src/app/(registry)/registry/[slug]/page.tsx](src/app/(registry)/registry/[slug]/page.tsx). This route:

- Loads ALL registry JSON via `readdir` + `readFile` in `generateStaticParams`
- Runs Shiki `codeToHtml` for every source file at render time
- Duplicates what the fumadocs docs route does

Keep `opengraph-image.tsx` at that path for now (it's independent).

### A5. Re-run generation and verify

After A1-A4: run `node scripts/generate-registry-mdx.mjs`, start dev server (without `--max-old-space-size`), navigate to `/registry/docs/experiments/send-button`. Should load without crashing.

---

## Phase B: Fix Visual Issues

### B1. Filter `.story` items from the grid and MDX generation

The grid shows `separator.story`, `LiquidGlassFilter.story`, etc. as separate cards. These are `@fumadocs/story` metadata files, not user-facing items.

Fix in two places:

- [scripts/generate-registry-mdx.mjs](scripts/generate-registry-mdx.mjs): skip items whose `name` ends with `.story`
- [src/components/registry/RegistryGrid.tsx](src/components/registry/RegistryGrid.tsx): filter out `.story` items from the card list

### B2. Improve component/hook/utility card descriptions

Currently all shared UI components show "Shared UI component: button" -- this is the auto-generated description from the registry pipeline. Two approaches (can do both):

- Update [scripts/generate-registry-json.mjs](scripts/generate-registry-json.mjs) to generate better descriptions from JSDoc comments in source files, or at minimum capitalize and humanize the name
- For the grid cards, if description matches the `"Shared UI component: X"` pattern, render a more compact card without the description line

### B3. Fix sidebar category tabs

Update [src/app/(registry)/registry/docs/layout.tsx](src/app/(registry)/registry/docs/layout.tsx) per fumadocs docs:

```tsx
<DocsLayout
  tree={registrySource.getPageTree()}
  nav={{ title: "razi's registry", url: "/registry" }}
  sidebar={{
    defaultOpenLevel: 1,
    tabs: [
      { title: 'Experiments', url: '/registry/docs/experiments' },
      { title: 'Components', url: '/registry/docs/components' },
      { title: 'Hooks', url: '/registry/docs/hooks' },
      { title: 'Utilities', url: '/registry/docs/utilities' },
    ],
  }}
  links={[{ text: 'Grid View', url: '/registry' }]}
>
```

### B4. Fix RegistryMeta broken links

[src/components/registry/RegistryMeta.tsx](src/components/registry/RegistryMeta.tsx) line 70 links to `/registry/docs/styles/${dep}` but "styles" is not a valid category. Registry dependencies (like `razi-style`) are `registry:style` type items which are filtered out of docs generation. Change these to link to the npm package or just render as plain badges without links.

### B5. Fix fragile relative import

[page.tsx](src/app/(registry)/registry/docs/[[...slug]]/page.tsx) line 9:

```tsx
// Before:
import { getMDXComponents } from "../../../../../../mdx-components";
// After:
import { getMDXComponents } from "@/mdx-components";
```

Verify `@/` alias resolves to project root (it should, since `mdx-components.tsx` is at root and fumadocs expects it there).

---

## Phase C: Verify

- `tsc --noEmit` passes
- `npm run dev` starts and stays alive (no OOM)
- Navigate to `/registry` -- grid loads, no `.story` items
- Navigate to `/registry/docs/experiments/send-button` -- loads fast, sidebar has category tabs, source code fetches on-demand
- Navigate between docs pages -- no slowdown
- `npm run build` succeeds
- Code blocks have copy buttons, install commands show npm/pnpm/yarn/bun tabs

---

## Deferred (not in this execution)

- Analytics enrichment (per user request)
- View transitions
- Remaining 6 story files + story integration in MDX
- Related items section
- OG images for docs routes
- Documentation updates (AGENTS.md, backlog, memory.md)

