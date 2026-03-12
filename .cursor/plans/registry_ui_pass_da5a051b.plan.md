---
name: Registry UI pass
overview: "Fix three registry UI issues: sidebar dropdown 404s (missing category index pages), ugly code snippet styling (double background, no syntax highlighting), and replace the flat grid home page with a redirect into the docs layout."
todos:
  - id: fix-meta-json
    content: "Add `root: true` to generated category meta.json files in generate-registry-mdx.mjs"
    status: completed
  - id: generate-category-index
    content: Generate index.mdx for each category folder + build CategoryIndex component
    status: completed
  - id: generate-root-index
    content: Generate root content/registry/index.mdx as the docs landing page with category cards
    status: completed
  - id: fix-source-code-styling
    content: Replace raw pre/code in RegistrySourceCode with Fumadocs CodeBlock/Pre components
    status: completed
  - id: redirect-home
    content: Replace /registry grid page with redirect to /registry/docs, update nav URLs
    status: completed
  - id: regenerate-and-verify
    content: Run generate:registry, dev server, verify all 3 fixes work, typecheck
    status: in_progress
isProject: false
---

# Registry UI Pass: Three Fixes

## Fix 1: Sidebar Dropdown 404s

**Root cause**: Clicking a tab in the sidebar dropdown (e.g., "Components") navigates to `/registry/docs/components`. The catch-all `[[...slug]]/page.tsx` calls `registrySource.getPage(["components"])`, which looks for `content/registry/components/index.mdx`. No such file exists, so it 404s.

**Changes:**

- **[scripts/generate-registry-mdx.mjs](scripts/generate-registry-mdx.mjs)** -- Two additions to the generation loop:
  1. Add `"root": true` to each category's `meta.json` output (line ~489). This tells Fumadocs these folders are sidebar tab roots, enabling proper tab matching.
  2. Generate an `index.mdx` for each category folder. These serve as landing pages when a tab is selected. Each index page will import and render a `CategoryIndex` component that lists all items in that category with descriptions and links.
- **New component: `src/components/registry/CategoryIndex.tsx`** -- A server or client component that receives a category slug and renders a clean listing of all items in that category. Pulls data from `registry-source` or `index-slim.json`. Simpler than the full `RegistryGrid` -- just a list of linked items with descriptions, grouped by featured/non-featured.
- **[content/registry/experiments/meta.json](content/registry/experiments/meta.json)** (and components/, hooks/, utilities/) -- After regeneration, these will include `"root": true`.

## Fix 2: Code Snippet Styling

**Root cause**: `RegistrySourceCode` renders source code as raw `<pre>/<code>` with `bg-fd-secondary/50` inside a bordered `<details>`. This creates a muddy double-background and has zero syntax highlighting, looking inconsistent with the Fumadocs `CodeBlock` used elsewhere on the page.

**Changes:**

- **[src/components/registry/RegistrySourceCode.tsx](src/components/registry/RegistrySourceCode.tsx)** -- Replace the raw `<pre>/<code>` rendering with Fumadocs' `CodeBlock` + `Pre` components:

```tsx
import { CodeBlock, Pre } from "fumadocs-ui/components/codeblock";

// Inside the file map:
<details className="group rounded-lg border border-fd-border overflow-hidden">
  <summary>...</summary>
  <CodeBlock>
    <Pre>
      <code className={`language-${lang}`}>{file.content}</code>
    </Pre>
  </CodeBlock>
</details>
```

This gives us:

- Consistent dark background (single layer, matching all other code blocks)
- Built-in copy button
- Proper code typography
- No more `bg-fd-secondary/50` double layering

The `<details>` wrapper keeps the collapsible behavior but the inner styling is delegated entirely to Fumadocs. Remove the `overflow-x-auto border-fd-border border-t` div wrapper and the inline `<pre>` styling.

## Fix 3: Home Page Redirect

**Root cause**: The current `/registry` page is a flat grid dump with minimal context. The user wants to make the docs layout the primary experience.

**Changes:**

- **[src/app/(registry)/registry/page.tsx](src/app/(registry)/registry/page.tsx)** -- Replace the grid page with a `redirect("/registry/docs")` call. This keeps existing links working while funneling all traffic into the docs layout.

```tsx
import { redirect } from "next/navigation";
export default function RegistryPage() {
  redirect("/registry/docs");
}
```

- **[scripts/generate-registry-mdx.mjs](scripts/generate-registry-mdx.mjs)** -- Generate a root `content/registry/index.mdx` that serves as the docs landing page at `/registry/docs`. This page should:
  - Welcome header + description
  - Category cards linking to `/registry/docs/experiments`, `/registry/docs/components`, etc. with item counts
  - Quick-start install command
  - Use Fumadocs `Cards` component for the category links
- **[src/app/(registry)/registry/docs/layout.tsx](src/app/(registry)/registry/docs/layout.tsx)** -- Update the nav `url` from `/registry` to `/registry/docs` so the sidebar "razi's registry" link goes directly to the docs index without a redirect hop.

## Verification

After all changes:

1. `npm run generate:registry` to regenerate MDX + meta.json files
2. `npm run dev` and verify:
  - Sidebar dropdown tabs navigate to category index pages (no more 404)
  - Code snippets match Fumadocs styling (single background, copy button)
  - `/registry` redirects to `/registry/docs`
  - `/registry/docs` shows a proper landing page
3. `tsc --noEmit` passes

