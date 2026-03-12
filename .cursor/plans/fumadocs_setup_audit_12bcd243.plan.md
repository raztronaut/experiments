---
name: Fumadocs Setup Audit
overview: "Harden the Fumadocs registry: frontmatter validation, experiment last-modified dates, verified/not-verified status, prev/next footer, remove EditOnGitHub, enable remarkImage, Callout component, rest operator in meta.json, search enrichment, and HomeLayout landing page. All changes verified Flux-compatible."
todos:
  - id: frontmatter-schema
    content: Add Zod frontmatter schema to defineDocs in source.config.ts (title, description required)
    status: completed
  - id: remove-edit-on-github
    content: Remove EditOnGitHub import and usage from [[...slug]]/page.tsx
    status: completed
  - id: last-modified-verified
    content: "Add experiment lastModified date (from experiment.json 'updated' field) + verified/not-verified badge to RegistryMeta and DocsPage via PageLastUpdate. All items default to verified: false."
    status: completed
  - id: prev-next-footer
    content: Enable prev/next page footer navigation in DocsPage using Flux PageFooter
    status: completed
  - id: register-callout
    content: Add explicit Callout component to mdx-components.tsx from fumadocs-ui/components/callout
    status: completed
  - id: enable-remark-image
    content: Enable remarkImage plugin in source.config.ts mdxOptions for future local image support
    status: completed
  - id: meta-rest-operator
    content: Replace explicit page lists in meta.json with '...' rest operator where appropriate
    status: completed
  - id: search-enrichment
    content: Enhance createFromSource with custom tag/tech/category indexing for better search results
    status: completed
  - id: home-layout
    content: Add HomeLayout landing page at /registry using RegistryGrid instead of redirect-to-docs
    status: completed
isProject: false
---

# Fumadocs Setup Audit (Flux-Verified)

All items below have been verified against the Flux layout. `PageLastUpdate`, `PageFooter`, `PageBreadcrumb`, separators, rest operator, and `HomeLayout` are all confirmed compatible with `fumadocs-ui/layouts/flux`.

## Current State Summary

**Packages:** `fumadocs-core@^16.6.14`, `fumadocs-ui@^16.6.14`, `fumadocs-mdx@^14.2.9`, `@fumadocs/story@^0.0.11`

**Architecture:** Isolated `(registry)` route group with its own `<html>`/`<body>`, Flux layout, Solar theme, Orama search, auto-generated MDX, 85 content files across 5 categories.

---

## What You're Doing Right

- **Flux layout variant** -- persistent TabDropdown, aggressively minimal design
- **Solar theme** -- clean preset, no custom fd-* overrides
- **Tailwind v4 CSS-first setup** -- correct import order, `@source` directive for scanning fumadocs-ui classes
- `**defineDocs` + `loader` + `toFumadocsSource()`** -- canonical fumadocs-mdx source pipeline
- `**createFromSource` search** -- correct Orama-based search at `/api/registry-search`
- `**createMDX()` wrapper** in next.config.ts
- `**optimizePackageImports`** for fumadocs-core and fumadocs-ui
- **Static generation** via `generateStaticParams()` and `generateMetadata()`
- **Flux page components** -- DocsPage, DocsTitle, DocsDescription, DocsBody from `fumadocs-ui/layouts/flux/page`
- **Clerk-style TOC** -- `tableOfContent: { style: "clerk" }`
- **Rich MDX component registry** -- defaultComponents + Accordion, Files, ImageZoom, Steps, Tabs, TypeTable
- **DynamicCodeBlock** for runtime-fetched code syntax highlighting
- **Sidebar tabs** with custom banner and footer
- `**remarkNpmOptions` with persist** -- package manager preference persists across navigation
- **meta.json with `root: true`** -- separate sidebar roots per category
- **OG image generation** per registry item

---

## Changes

### 1. Frontmatter schema validation in `source.config.ts`

**File:** [source.config.ts](source.config.ts)

`defineDocs` supports a `schema` option for Zod-based frontmatter validation. Currently `registryDocs` has no schema -- typos or missing fields silently pass. Add validation to catch bugs in both the generation script and hand-authored files.

```typescript
import { z } from 'zod';

export const registryDocs = defineDocs({
  dir: "content/registry",
  docs: {
    schema: {
      title: z.string(),
      description: z.string(),
    },
  },
});
```

**Flux compatibility:** Schema validation is source-level, layout-independent.

### 2. Remove EditOnGitHub

**File:** [src/app/(registry)/registry/docs/[[...slug]]/page.tsx](src/app/(registry)/registry/docs/[[...slug]]/page.tsx)

Remove the `EditOnGitHub` import and usage. Also remove the `GITHUB_REPO` and `CONTENT_DIR` constants (only used by EditOnGitHub). The `githubUrl` prop on `DocsLayout` in the docs layout already links to the repo in the nav bar.

**Note:** Flux does not actually export a dedicated `EditOnGitHub` component natively -- what's currently imported appears to be a shim or re-export. Clean removal.

### 3. Experiment last-modified date + verified/not-verified status

**Files:**

- [src/app/(registry)/registry/docs/[[...slug]]/page.tsx](src/app/(registry)/registry/docs/[[...slug]]/page.tsx) -- add `PageLastUpdate`
- [src/components/registry/RegistryMeta.tsx](src/components/registry/RegistryMeta.tsx) -- add `verified` badge prop
- [scripts/generate-registry-mdx.mjs](scripts/generate-registry-mdx.mjs) -- propagate `lastModified` and `verified` into MDX frontmatter
- `experiment.json` files -- source of `updated` field for last-modified date
- Individual registry JSON files in `public/registry/` -- add `verified: false` field

**Last modified:** Use the `updated` field from each experiment's `experiment.json` (or the registry item's metadata) as the source of truth. Pass it through MDX frontmatter, then render via Flux's `PageLastUpdate` component:

```tsx
import { PageLastUpdate } from "fumadocs-ui/layouts/flux/page";

<DocsPage toc={page.data.toc} tableOfContent={{ style: "clerk" }}>
  <DocsTitle>{page.data.title}</DocsTitle>
  <DocsDescription>{page.data.description}</DocsDescription>
  <DocsBody>
    <MDXContent components={getMDXComponents()} />
  </DocsBody>
  {page.data.lastModified && (
    <PageLastUpdate date={new Date(page.data.lastModified)} />
  )}
</DocsPage>
```

**Verified status:** Add a `verified` prop to `RegistryMeta`. Default all items to `verified: false`. Render as a badge in the metadata row. The generation script will propagate this field into the MDX `<RegistryMeta>` call. When you do a thorough pass on an item, flip it to `true` in the source data.

```tsx
// In RegistryMeta -- new badge
{verified ? (
  <MetaBadge className="border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
    Verified
  </MetaBadge>
) : (
  <MetaBadge className="border-amber-500/30 bg-amber-500/10 text-amber-600 dark:text-amber-400">
    Not Verified
  </MetaBadge>
)}
```

**Flux compatibility:** `PageLastUpdate` is a confirmed Flux export. The verified badge is a custom component using fd-compatible color tokens.

### 4. Prev/next page footer navigation

**File:** [src/app/(registry)/registry/docs/[[...slug]]/page.tsx](src/app/(registry)/registry/docs/[[...slug]]/page.tsx)

Add the `footer` prop to `DocsPage` to enable prev/next navigation. `PageFooter` auto-detects adjacent pages from the page tree -- no manual wiring needed.

```tsx
<DocsPage
  toc={page.data.toc}
  tableOfContent={{ style: "clerk" }}
>
  {/* ... content ... */}
</DocsPage>
```

Flux's `DocsPage` renders the footer automatically when the page tree has adjacent pages. No explicit `<PageFooter>` import needed unless customizing.

**Flux compatibility:** `PageFooter` is a confirmed Flux export.

### 5. Register Callout component in mdx-components.tsx

**File:** [mdx-components.tsx](mdx-components.tsx)

Add explicit `Callout` import so hand-authored MDX can use `<Callout type="warn">` JSX syntax in addition to the `> [!TIP]` blockquote syntax already supported through `defaultComponents`.

```typescript
import { Callout } from "fumadocs-ui/components/callout";

export function getMDXComponents(components?: MDXComponents): MDXComponents {
  return {
    ...(defaultComponents as unknown as MDXComponents),
    Callout,
    // ... existing components
  };
}
```

**Flux compatibility:** MDX components are layout-independent.

### 6. Enable remarkImage plugin

**File:** [source.config.ts](source.config.ts)

Enable `remarkImage` in `mdxOptions` to future-proof for local images in MDX content. This auto-transforms `![alt](./local.png)` into Next.js `<Image>` static imports with width/height -- zero cost when no images exist, ready when they do.

```typescript
import { remarkImage } from 'fumadocs-core/mdx-plugins';

export default defineConfig({
  mdxOptions: {
    remarkPlugins: [remarkImage],
    remarkNpmOptions: {
      persist: { id: "package-manager" },
    },
  },
});
```

**Flux compatibility:** Remark plugins are source-level, layout-independent.

### 7. Use `"..."` rest operator in meta.json

**File:** All `content/registry/*/meta.json` files

Replace explicit page lists with the `"..."` rest operator so new pages are auto-included without regenerating meta.json. For categories where order matters, pin specific pages first, then `"..."` for the rest.

```json
{
  "root": true,
  "title": "Experiments",
  "pages": ["..."]
}
```

**Separator history:** The previous bug was with a bare `"---"` (unlabeled separator) removed alongside the docs-to-Flux switch. Separators are page tree conventions handled by the source API, not the layout, so **labeled separators work in Flux**. However, since the bare separator issue was ambiguous, use only labeled separators (`"---Section Name---"`) if you add them in the future.

**Flux compatibility:** Rest operator and separators are source-level page tree features. Confirmed working in Flux sidebar via `SidebarPageTree`.

### 8. Enhanced search with tag/tech/category indexing

**File:** [src/app/api/registry-search/route.ts](src/app/api/registry-search/route.ts)

`createFromSource` accepts options for customizing the search index. Add experiment tags, tech stack, and category as searchable metadata so searching "gsap" or "shader" surfaces relevant items even if those words aren't in the page body text.

```typescript
export const { GET } = createFromSource(registrySource, {
  // Explore options: custom search index fields, tag extraction
});
```

Requires investigation into whether `createFromSource` supports custom field extraction or if a custom search handler with Orama is needed.

**Flux compatibility:** Search is API-level, layout-independent.

### 9. HomeLayout registry landing page

**File:** New route at `src/app/(registry)/registry/page.tsx` (currently a redirect)

Replace the redirect-to-docs with a proper landing page using `HomeLayout` from `fumadocs-ui/layouts/home`. Embed the existing `RegistryGrid` component for a visual browsing experience before users enter the docs sidebar.

`HomeLayout` and Flux `DocsLayout` are independent layouts for different route segments -- no conflicts. They can share configuration via a `baseOptions()` pattern:

```tsx
// src/app/(registry)/registry/page.tsx
import { HomeLayout } from 'fumadocs-ui/layouts/home';

export default function RegistryLanding() {
  return (
    <HomeLayout
      nav={{ title: "razi's registry", url: "/registry" }}
      githubUrl="https://github.com/raztronaut/experiments"
    >
      <RegistryGrid />
    </HomeLayout>
  );
}
```

**Flux compatibility:** Confirmed. `HomeLayout` and Flux `DocsLayout` are designed to coexist in separate route segments.

---

## `@fumadocs/story` -- Keep (low cost, future value)

**Decision:** Keep the package installed. The cost is minimal:

- CSS import (`@fumadocs/story/css/preset.css`) adds a few KB of styles
- `src/lib/story.ts` and `.story.tsx` files serve as development-only testing infrastructure
- If the Turbopack barrel-export issue gets fixed upstream or the architecture changes, the story infrastructure is already wired up

No action needed. The CSS import stays in `registry.css`.

---

## Items Not Applicable (removed from plan)

- **i18n** -- not relevant unless multilingual docs planned
- **fumadocs-openapi** -- not relevant unless an API is exposed
- **Static search export** -- current API route approach is fine; static export would save one route but adds build complexity

---

## Implementation Order

- P0: Remove EditOnGitHub, frontmatter schema, prev/next footer (~20 min)
- P1: Last-modified + verified status, Callout registration, remarkImage, rest operator (~1-2 hrs)
- P2: Search enrichment, HomeLayout landing page (~2-3 hrs)

