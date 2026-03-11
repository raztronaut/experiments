---
name: Registry Fumadocs Audit Fix
overview: Comprehensive audit of the full Fumadocs ecosystem against our registry integration. Fix deprecated APIs, adopt underutilized features, and complete the remaining Registry V2 implementation to reach S-tier quality.
todos:
  - id: t1-fix-deprecated-apis
    content: "Tier 1 -- Fix deprecated/incorrect APIs: source.config.ts (remarkNpmOptions), mdx-components.tsx (useMDXComponents + CodeBlockTabs), page.tsx (pass components), search route (createFromSource), remove fumadocs-docgen"
    status: completed
  - id: t2-enrich-mdx-generation
    content: "Tier 2 -- Enrich MDX generation: remarkNpm dependency blocks, Callout admonitions, Files component for experiment structure, Cards for related items, Accordion for source code, Steps for install flow"
    status: completed
  - id: t3-enhance-docs-page
    content: "Tier 3 -- Enhance DocsPage: last updated time, edit-on-GitHub link, Clerk-style TOC, sidebar banner/footer, DocsCategory index pages, frontmatter schema with Zod"
    status: completed
  - id: t4-code-block-features
    content: "Tier 4 -- Code block features: line highlighting, word highlighting, diff syntax, tabbed code blocks, line numbers in RegistrySourceCode"
    status: completed
  - id: t5-remaining-stories
    content: Tier 5 -- Complete 6 remaining story files (button, badge, card, GrainOverlay, ViewModeToggle, LottieWeatherIcon)
    status: completed
  - id: t6-graph-view
    content: "Tier 6 -- Graph View: dependency visualization between registry items"
    status: cancelled
  - id: t7-og-images
    content: Tier 7 -- OG images for docs routes
    status: completed
  - id: t8-polish
    content: "Tier 8 -- Polish: ImageZoom for screenshots, Banner for announcements, analytics enrichment, view transitions"
    status: completed
  - id: t9-ship
    content: Tier 9 -- QA pass (tsc, build, visual), commit all Registry V2 work, update AGENTS.md + backlog + memory.md
    status: completed
isProject: false
---

# Registry V2: Comprehensive Fumadocs Audit and Full Feature Leverage

## Current State Summary

The Registry V2 integration is structurally complete (Phases 1-6 done, crash fixed) but uses deprecated APIs and leaves the majority of Fumadocs features on the table. This plan audits every Fumadocs package against our usage, identifies what we should adopt, and maps out the full path to S-tier.

**Installed packages:**

- `fumadocs-core` ^16.6.14
- `fumadocs-ui` ^16.6.14
- `fumadocs-mdx` ^14.2.9
- `fumadocs-docgen` ^3.0.8 (unused, should remove)
- `@fumadocs/story` ^0.0.11

---

## Part 1: Fumadocs Ecosystem Audit

### A. Deprecated / Incorrect API Usage (Must Fix)

#### 1. `remarkInstall` -> `remarkNpmOptions` (DEPRECATED, never wired)

[source.config.ts](source.config.ts) has an empty `defineConfig({})`. The original plan called for `remarkInstall` from `fumadocs-docgen`, which is now deprecated. The replacement is `remarkNpmOptions` -- a first-class key in `defineConfig()` that uses `remarkNpm` from `fumadocs-core/mdx-plugins` under the hood.

**Fix:**

```typescript
// source.config.ts
import { defineDocs, defineConfig } from "fumadocs-mdx/config";

export const registryDocs = defineDocs({
  dir: "content/registry",
});

export default defineConfig({
  mdxOptions: {
    remarkNpmOptions: {
      persist: { id: "package-manager" },
    },
  },
});
```

The `persist` option syncs the selected package manager tab across all code blocks and sessions. Markdown syntax uses `` 

```npm `` blocks:

```markdown
```npm
npm i motion lucide-react
```

```

This renders as a `<CodeBlockTabs>` with npm/pnpm/yarn/bun variants.

#### 2. `createSearchAPI` -> `createFromSource` (outdated API)

[src/app/api/registry-search/route.ts](src/app/api/registry-search/route.ts) uses the older manual-mapping `createSearchAPI('advanced', {...})`. Replace with `createFromSource` which auto-indexes all pages from the source loader:

```typescript
import { registrySource } from "@/lib/registry-source";
import { createFromSource } from "fumadocs-core/search/server";

export const { GET } = createFromSource(registrySource);
```

#### 3. Missing `useMDXComponents` export

[mdx-components.tsx](mdx-components.tsx) only exports `getMDXComponents`. Fumadocs expects both:

```typescript
export const useMDXComponents = getMDXComponents;
```

This is required for fumadocs-mdx's auto-provider injection to discover and apply MDX components globally.

#### 4. `<MDXContent />` missing components prop

[page.tsx](src/app/(registry)/registry/docs/[[...slug]]/page.tsx) renders `<MDXContent />` without passing components. Fix:

```tsx
import { getMDXComponents } from "@/mdx-components";
// ...
<MDXContent components={getMDXComponents()} />
```

#### 5. `fumadocs-docgen` is dead weight

Installed but imported nowhere. Only existed for `remarkInstall` which is deprecated. Remove: `npm uninstall fumadocs-docgen`.

#### 6. Sidebar tabs API -- CORRECT (no action needed)

The `DocsLayout` sidebar configuration in [docs/layout.tsx](src/app/(registry)/registry/docs/layout.tsx) matches current Fumadocs docs exactly.

---

### B. Fumadocs Features We Should Adopt

Below is a comprehensive inventory of Fumadocs features, organized by whether we use them, should adopt them, or can skip them.

#### Currently Using (keep)


| Feature                                                   | Where                          | Status                                              |
| --------------------------------------------------------- | ------------------------------ | --------------------------------------------------- |
| `DocsLayout` with sidebar tabs                            | `docs/layout.tsx`              | Correct                                             |
| `DocsPage` / `DocsBody` / `DocsTitle` / `DocsDescription` | `[[...slug]]/page.tsx`         | Correct (needs components fix)                      |
| `RootProvider` with search + dark theme                   | `(registry)/layout.tsx`        | Correct                                             |
| `CodeBlock` / `Pre` override on `<pre>`                   | `mdx-components.tsx`           | Correct                                             |
| `Tab` / `Tabs` components                                 | `mdx-components.tsx`           | Correct but will be supplemented by `CodeBlockTabs` |
| Orama search via API route                                | `api/registry-search/route.ts` | Needs `createFromSource` migration                  |
| `fumadocs-ui/css/neutral.css` + `preset.css`              | `registry.css`                 | Correct                                             |
| `--color-fd-*` theme token mapping                        | `registry.css`                 | Correct                                             |
| `@source` directive for Tailwind scanning                 | `registry.css`                 | Correct                                             |
| `defineDocs` + `defineConfig`                             | `source.config.ts`             | Needs `remarkNpmOptions`                            |
| `loader()` with `baseUrl` + `toFumadocsSource()`          | `registry-source.ts`           | Correct                                             |
| `@fumadocs/story` factory + filesystem cache              | `story.ts`                     | Correct                                             |
| `createMDX()` Next.js wrapper                             | `next.config.ts`               | Correct                                             |
| `generateStaticParams` / `generateMetadata`               | `[[...slug]]/page.tsx`         | Correct                                             |


#### Should Adopt (high value for our registry)


| Feature                                                          | What It Does                                                                                                                                 | How We'd Use It                                                                                        |
| ---------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------ |
| `**remarkNpm**` via `remarkNpmOptions`                           | Tabbed npm/pnpm/yarn/bun install blocks                                                                                                      | Dependency install sections in generated MDX                                                           |
| **Callout/Admonition** (`> [!NOTE]`, `> [!TIP]`, `> [!WARNING]`) | Styled alert boxes                                                                                                                           | Notes about experiment requirements, deprecation warnings, tips                                        |
| `**Accordion`**                                                  | Collapsible sections                                                                                                                         | Wrap source code files in collapsible accordions instead of custom `<details>` in `RegistrySourceCode` |
| `**Steps`**                                                      | Numbered step instructions                                                                                                                   | Installation flow: 1. Run install command, 2. Import component, 3. Use in your app                     |
| `**Cards`**                                                      | Linked card grid                                                                                                                             | Related items section at bottom of each docs page                                                      |
| `**Files`** / `Folder` / `File`                                  | Visual file tree                                                                                                                             | Show experiment directory structure (which files get installed)                                        |
| `**ImageZoom**`                                                  | Click-to-zoom images                                                                                                                         | Experiment preview screenshots that can be zoomed                                                      |
| `**TypeTable**`                                                  | Auto-formatted prop docs                                                                                                                     | Document component props for shared UI components (button variants, etc.)                              |
| **Code block features**                                          | Line highlight `[!code highlight]`, word highlight `[!code word:X]`, diff `[!code ++]`/`[!code --]`, focus `[!code focus]`, tabbed blocks `` |                                                                                                        |


```ts tab="Tab" ``, line numbers | Rich source code display with highlighted key lines |
| `**PageLastUpdate`** | Last modified time | Show when each registry item was last updated |
| Edit on GitHub | Link to source | Direct link to component source on GitHub |
| TOC `style: "clerk"` | Clerk-inspired TOC sidebar | More polished TOC appearance |
| Sidebar `banner`/`footer` | Custom content above/below sidebar | "Add to your project" CTA, version info, or "Browse Grid" button |
| `DocsCategory` | Auto-generated category index | `/registry/docs/experiments` shows all experiment cards automatically |
| Frontmatter schema (Zod) | Custom frontmatter fields | Add `category`, `tags`, `tech`, `status` to frontmatter schema for type-safe access |
| `meta.json` advanced features | Separators `"---"`, rest `"..."`, external links | Better sidebar organization: separators between featured/non-featured |
| `**Graph View`** | Page relationship visualization | Visualize dependencies between registry items |

#### Nice-to-Have (lower priority)


| Feature                                     | What It Does                           | Notes                                             |
| ------------------------------------------- | -------------------------------------- | ------------------------------------------------- |
| `**Banner`**                                | Top announcement bar                   | Announce new experiments or registry updates      |
| `**InlineTOC`**                             | TOC within page body                   | For very long pages with many source files        |
| `**DynamicCodeBlock**`                      | Runtime code rendering                 | Could enable live code editing in docs            |
| `**fumadocs-twoslash**`                     | TypeScript hover types in code blocks  | Rich TypeScript documentation for hooks/utilities |
| `**fumadocs-typescript` / `AutoTypeTable**` | Auto-generate type docs from .ts files | Auto-document component prop types from source    |
| `**fumadocs-ui/og**` (`generateOGImage`)    | OG image generation                    | Fumadocs-native OG images for docs routes         |
| **Feedback component**                      | Page-level feedback collection         | "Was this page helpful?" on docs pages            |
| **RSS generation**                          | RSS feed for registry                  | Feed of new experiments/components                |
| **Validate links**                          | Build-time link checker                | Catch broken links in generated MDX               |
| `**remarkTypeScriptToJavaScript`**          | Auto TS->JS tab toggle                 | Show both TS and JS versions of source code       |


#### Skip (not relevant)


| Feature                                   | Why Skip                     |
| ----------------------------------------- | ---------------------------- |
| i18n / internationalization               | Single language site         |
| `fumadocs-openapi`                        | No OpenAPI specs             |
| Content Collections adapter               | Already using fumadocs-mdx   |
| React Router / TanStack / Waku adapters   | Next.js only                 |
| Algolia / Mixedbread / Orama Cloud search | Orama self-hosted is fine    |
| Notebook layout                           | Docs layout is the right fit |
| `HomeLayout`                              | We have our own grid page    |
| Static search export                      | Not doing static export      |


---

## Part 2: Implementation Plan

### Tier 1: Fix Deprecated APIs (Critical)

**Files touched:** `source.config.ts`, `mdx-components.tsx`, `page.tsx`, `api/registry-search/route.ts`, `package.json`

1. `**source.config.ts`** -- Add `remarkNpmOptions` with `persist: { id: "package-manager" }` for synced tabs
2. `**mdx-components.tsx`** -- Add `useMDXComponents` export. The `CodeBlockTabs` components should be included in `defaultComponents` from `fumadocs-ui/mdx` already, but verify and add explicitly if needed
3. `**[[...slug]]/page.tsx`** -- Import `getMDXComponents` and pass to `<MDXContent components={getMDXComponents()} />`
4. `**api/registry-search/route.ts`** -- Replace `createSearchAPI` with `createFromSource(registrySource)`
5. `**package.json**` -- `npm uninstall fumadocs-docgen`

### Tier 2: Enrich MDX Generation

**Files touched:** `scripts/generate-registry-mdx.mjs`, `mdx-components.tsx`

Upgrade the auto-generated MDX to use native Fumadocs components instead of custom HTML:

1. **Add

```

```npm 

`

``` blocks** for dependency installation alongside `<InstallCommand>` for the shadcn CLI command. Example output per experiment MDX:

```mdx
## Install

<InstallCommand slug="send-button" />

### Dependencies

```npm
npm i motion lucide-react @radix-ui/react-switch
```

```

2. **Add `Callout` admonitions** where relevant:
   - Experiments: `> [!TIP] Open in full screen for the best experience`
   - Components with many dependencies: `> [!NOTE] This component requires X`

3. **Add `Files` component** for experiments to show installed file structure:

```mdx
## File Structure

<Files>
  <Folder name="components/experiments/send-button" defaultOpen>
    <File name="SendButton.tsx" />
    <File name="AnimatedPlaceholder.tsx" />
  </Folder>
</Files>
```

1. **Add `Cards` component** for related items at bottom:

```mdx
## Related

<Cards>
  <Card title="Button" href="/registry/docs/components/button" />
  <Card title="Keyboard Keys" href="/registry/docs/experiments/keyboard-keys" />
</Cards>
```

1. **Register new components** in `mdx-components.tsx`: `Callout`, `Card`, `Cards`, `Files`, `Folder`, `File`, `Accordion`, `Accordions`, `Steps`, `Step`

### Tier 3: Enhance DocsPage and Layout

**Files touched:** `[[...slug]]/page.tsx`, `docs/layout.tsx`, `source.config.ts`

1. **Last updated time** -- Add `PageLastUpdate` to `page.tsx`:

```tsx
import { DocsPage, PageLastUpdate } from "fumadocs-ui/layouts/docs/page";

<DocsPage toc={page.data.toc}>
  {/* ... content ... */}
  {page.data.lastModified && <PageLastUpdate date={page.data.lastModified} />}
</DocsPage>
```

Enable in `source.config.ts` with `lastModified: true` or use `getGithubLastEdit`.

1. **Edit on GitHub** -- Add link in DocsPage:

```tsx
<a
  href={`https://github.com/razisyed/experiments/blob/main/content/registry/${page.file.path}`}
  rel="noreferrer noopener"
  target="_blank"
  className="..."
>
  Edit on GitHub
</a>
```

1. **Clerk-style TOC** -- Upgrade TOC appearance:

```tsx
<DocsPage
  toc={page.data.toc}
  tableOfContent={{ style: "clerk" }}
>
```

1. **Sidebar banner** -- Add a CTA or info panel:

```tsx
<DocsLayout
  sidebar={{
    banner: <SidebarBanner />,
    footer: <SidebarFooter />,
  }}
>
```

1. `**DocsCategory` for index pages** -- When user navigates to `/registry/docs/experiments` (no specific item), show auto-generated category page listing all experiments in that folder.
2. **Frontmatter schema with Zod** -- Extend the default frontmatter to include registry-specific fields:

```typescript
// source.config.ts
import { z } from "zod";

export const registryDocs = defineDocs({
  dir: "content/registry",
  docs: {
    schema: frontmatterSchema.extend({
      category: z.enum(["experiments", "components", "hooks", "utilities"]).optional(),
      tags: z.array(z.string()).optional(),
      tech: z.array(z.string()).optional(),
      status: z.enum(["shipped", "wip", "deprecated"]).optional(),
    }),
  },
});
```

1. `**meta.json` advanced features** -- Add separators between featured and non-featured items:

```json
{
  "title": "Experiments",
  "pages": [
    "send-button",
    "keyboard-keys",
    "transit-airport-split-flap-display",
    "---",
    "..."
  ]
}
```

### Tier 4: Code Block Features

**Files touched:** `scripts/generate-registry-mdx.mjs`, `source.config.ts`

When generating source code blocks in MDX (or enhancing `RegistrySourceCode`):

1. **Tabbed code blocks** -- Group related files as tabs:

`

```mdx
```tsx tab="SendButton.tsx"
// main component source
```

```tsx tab="AnimatedPlaceholder.tsx"
// sub-component source
```

`

```

2. **Line highlighting** in key sections (e.g., the export line, key animation logic):

`

```mdx
```tsx title="SendButton.tsx"
export function SendButton() { // [!code highlight]
  // ...
}
```

`

```

3. **Line numbers** for longer files:

`

```mdx
```tsx title="SendButton.tsx" lineNumbers
// source with line numbers
```

`

```

This requires evaluating whether we generate static code blocks in MDX (better for highlighting features but brings back the size problem) or keep `RegistrySourceCode` as a client fetcher. Likely approach: keep `RegistrySourceCode` for the full source but add small highlighted excerpts in the MDX for key APIs/usage patterns.

### Tier 5: Complete Story Files

**Files to create (6):**

- `src/components/ui/button.story.tsx` -- 4 variants (default, destructive, outline, ghost)
- `src/components/ui/badge.story.tsx` -- variant + children
- `src/components/ui/card.story.tsx` -- compound composition
- `src/components/ui/GrainOverlay.story.tsx` -- className opacity
- `src/components/ui/experiments/ViewModeToggle.story.tsx` -- viewMode
- `src/components/ui/LottieWeatherIcon.story.tsx` -- code + isNight

Each follows the pattern established by the 4 existing stories.

### Tier 6: Graph View

Add a dependency visualization component that shows relationships between registry items:

```tsx
import { GraphView } from "fumadocs-ui/components/graph-view";
```

Build a `buildRegistryGraph()` function that reads `registry.json` and maps `registryDependencies` relationships into a graph data structure. Display on a dedicated `/registry/docs/graph` page or as a sidebar widget.

### Tier 7: OG Images

Use `fumadocs-ui/og` or adapt the existing `opengraph-image.tsx` for the `[[...slug]]` catch-all route. Extract category + title from the slug path.

### Tier 8: Polish

- `**ImageZoom**` for experiment preview screenshots
- `**Banner**` on the docs layout for announcing new experiments
- **Umami analytics** events on search, sidebar, code copy, story controls
- **View transitions** via `next-view-transitions`
- `**fumadocs-twoslash`** for TypeScript hooks/utilities (nice-to-have)

### Tier 9: Ship

- `tsc --noEmit` -- zero type errors
- `npm run build` -- successful
- Visual QA: grid, docs, sidebar, search, TOC, code blocks, stories
- Git commit all Registry V2 work (single atomic commit or logical chunks)
- Update `AGENTS.md` to document `content/registry/` convention
- Update `.agents/backlog/` to check off Registry V2
- Update `memory.md` with new workspace facts

---

## Quick Reference: Import Paths


| Component                                                                                | Import                                                |
| ---------------------------------------------------------------------------------------- | ----------------------------------------------------- |
| `DocsLayout`                                                                             | `fumadocs-ui/layouts/docs`                            |
| `DocsPage`, `DocsBody`, `DocsTitle`, `DocsDescription`, `DocsCategory`, `PageLastUpdate` | `fumadocs-ui/layouts/docs/page`                       |
| `RootProvider`                                                                           | `fumadocs-ui/provider` or `fumadocs-ui/provider/next` |
| `CodeBlock`, `Pre`                                                                       | `fumadocs-ui/components/codeblock`                    |
| `Tab`, `Tabs`                                                                            | `fumadocs-ui/components/tabs`                         |
| `Accordion`, `Accordions`                                                                | `fumadocs-ui/components/accordion`                    |
| `Steps`, `Step`                                                                          | `fumadocs-ui/components/steps`                        |
| `Card`, `Cards`                                                                          | `fumadocs-ui/components/card`                         |
| `Callout`                                                                                | `fumadocs-ui/components/callout`                      |
| `Files`, `Folder`, `File`                                                                | `fumadocs-ui/components/files`                        |
| `TypeTable`                                                                              | `fumadocs-ui/components/type-table`                   |
| `ImageZoom`                                                                              | `fumadocs-ui/components/image-zoom`                   |
| `Banner`                                                                                 | `fumadocs-ui/components/banner`                       |
| `InlineTOC`                                                                              | `fumadocs-ui/components/inline-toc`                   |
| `GraphView`                                                                              | `fumadocs-ui/components/graph-view`                   |
| `Heading`                                                                                | `fumadocs-ui/components/heading`                      |
| `defaultComponents`                                                                      | `fumadocs-ui/mdx`                                     |
| `createFromSource`                                                                       | `fumadocs-core/search/server`                         |
| `loader`                                                                                 | `fumadocs-core/source`                                |
| `useBreadcrumb`                                                                          | `fumadocs-core/breadcrumb`                            |
| `getGithubLastEdit`                                                                      | `fumadocs-core/content/github`                        |
| `defineConfig`, `defineDocs`                                                             | `fumadocs-mdx/config`                                 |
| `createMDX`                                                                              | `fumadocs-mdx/next`                                   |


---

## Files Summary

**Modify (Tier 1 fixes):**

- [source.config.ts](source.config.ts) -- add `remarkNpmOptions`, optionally Zod schema
- [mdx-components.tsx](mdx-components.tsx) -- add `useMDXComponents`, register Fumadocs components
- [src/app/(registry)/registry/docs/[[...slug]]/page.tsx](src/app/(registry)/registry/docs/[[...slug]]/page.tsx) -- pass components, add `PageLastUpdate`, edit link, clerk TOC
- [src/app/api/registry-search/route.ts](src/app/api/registry-search/route.ts) -- `createFromSource`
- [src/app/(registry)/registry/docs/layout.tsx](src/app/(registry)/registry/docs/layout.tsx) -- sidebar banner/footer
- [scripts/generate-registry-mdx.mjs](scripts/generate-registry-mdx.mjs) -- richer MDX output with Fumadocs components
- [package.json](package.json) -- remove `fumadocs-docgen`

**Create (new):**

- 6 story files (`button`, `badge`, `card`, `GrainOverlay`, `ViewModeToggle`, `LottieWeatherIcon`)
- Category index handling (either `index.mdx` per category or `DocsCategory` integration)
- Graph view page/component (if adopted)
- OG image for docs routes

**Keep unchanged:**

- `src/lib/registry-source.ts` -- correct as-is
- `src/lib/story.ts` -- correct as-is
- `src/app/(registry)/layout.tsx` -- correct as-is
- `src/app/(registry)/registry.css` -- correct as-is (may add `@fumadocs/story/css/preset.css` if missing)
- Grid page, RegistryCard, RegistryGrid -- outside Fumadocs scope
- All 3 existing pipeline scripts -- unchanged
- `registry.config.json` -- unchanged

```

```

