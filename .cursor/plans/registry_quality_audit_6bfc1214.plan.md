---
name: Registry Quality Audit
overview: "Comprehensive audit of the registry docs system across three axes: code snippet rendering quality, component visibility/previews, and infrastructure gaps -- with concrete improvements grounded in fumadocs best practices and shadcn patterns."
todos:
  - id: collected-preview-fonts
    content: "Fix collected-preview layout: import activeFont from @/lib/fonts, apply activeFont.variable + activeFont.className + font-canvas on body, import shared-theme.css"
    status: completed
  - id: dynamic-codeblock
    content: Replace CodeBlock/Pre in RegistrySourceCode.tsx with fumadocs DynamicCodeBlock for proper Shiki syntax highlighting at runtime
    status: completed
  - id: install-cmd-highlight
    content: Update InstallCommand.tsx to use DynamicCodeBlock with lang='bash' for highlighted install commands
    status: completed
  - id: shared-ui-previews
    content: Hand-author MDX docs for shared UI components (badge, button, card, drawer, etc.) with inline rendered previews -- mark as non-generated
    status: completed
  - id: consolidate-preview
    content: Merge ExperimentPreview + CollectedPreview into a single ComponentPreview with basePath prop; update MDX templates
    status: completed
  - id: collected-plop
    content: "Add collected component plop generator: interactive plopfile.js entry + non-interactive scripts/create-collected.mjs (npm run new:collected + new:collected:auto)"
    status: completed
  - id: mdx-template-usage
    content: Add auto-generated Usage section to MDX templates showing import + basic render snippet
    status: completed
  - id: registry-meta-hierarchy
    content: Improve RegistryMeta.tsx visual hierarchy -- group type/files, tech/deps, and tags into distinct rows
    status: completed
  - id: agent-docs-update
    content: Update quick-component SKILL.md (plop ref, decomposition guidance, preview route, DynamicCodeBlock), registry-curation rule, and memory.md
    status: completed
isProject: false
---

# Registry Quality Audit and Improvement Plan

## Current State Summary

The registry docs pipeline is a 4-step build: `generate-registry-json.mjs` -> `build-registry.mjs` -> `generate-registry-mdx.mjs` -> fumadocs MDX processing. It produces docs for ~58+ items across 5 categories (experiments, collected, components, hooks, utilities), served at `/registry/docs/`.

---

## 1. Making Code Snippets Look Better

### Current Problem

[RegistrySourceCode.tsx](src/components/registry/RegistrySourceCode.tsx) fetches registry JSON at **runtime** and dumps raw `file.content` strings into fumadocs `CodeBlock`/`Pre` without any syntax highlighting. The component passes `className="language-${lang}"` on a plain `<code>` element, but **Shiki never processes it** because Shiki runs at MDX compile time (rehype-code), not on runtime-fetched strings. The result is monochrome unstyled code.

### Recommended Fix: Replace with DynamicCodeBlock

Fumadocs provides [DynamicCodeBlock](https://fumadocs.dev/docs/ui/components/dynamic-codeblock) from `fumadocs-ui/components/dynamic-codeblock` -- a client component that runs Shiki at runtime with React 19 Suspense, lazy-loads languages/themes, and supports pre-rendering on the server.

**Changes to [RegistrySourceCode.tsx](src/components/registry/RegistrySourceCode.tsx):**

- Replace `CodeBlock`/`Pre`/`<code>` with `DynamicCodeBlock` for each file
- Pass `lang` and `code` props directly -- Shiki handles syntax highlighting client-side
- Retain the collapsible `<details>` wrapper, file labels, and loading/error states
- Result: properly syntax-highlighted code with the catppuccin theme (matching the rest of fumadocs), copy button, and scrollable containers

Key change:

```
import { DynamicCodeBlock } from 'fumadocs-ui/components/dynamic-codeblock';
// Inside the file loop:
<DynamicCodeBlock lang={lang} code={file.content} />
```

### Additional Code Snippet Improvements

- **File titles on code blocks**: Pass `title` prop to show filenames as headers (fumadocs supports `title` natively). Replaces the custom `<summary>` label with a more polished look.
- **Line highlighting for key sections**: Use Shiki's `[!code highlight]` / `[!code focus]` annotations in MDX templates to point out key lines.
- **Tabbed code blocks for multi-file components**: For items with 2-3 files (TSX + CSS), render them as fumadocs tabbed code blocks (using the `tab="..."` attribute on fenced blocks) instead of stacked collapsibles. This only works if source is inlined at MDX generation time rather than fetched at runtime. Trade-off: larger MDX files vs. proper highlighting.
- **Install command highlighting**: [InstallCommand.tsx](src/components/registry/InstallCommand.tsx) currently wraps the command in `CodeBlock`/`Pre`/`<code>` which also lacks highlighting. Switch to `DynamicCodeBlock` with `lang="bash"`.

### Approach: Runtime DynamicCodeBlock (Verified)

`DynamicCodeBlock` is already available in the installed `fumadocs-ui@^16.6.14`. The API is confirmed:

- `lang: string` -- language identifier (tsx, css, glsl, etc.)
- `code: string` -- raw source code string
- `codeblock?: CodeBlockProps` -- passthrough for title, icon, etc.
- `wrapInSuspense?: boolean` -- defaults to `true`, shows fallback while Shiki loads

It lazy-loads Shiki languages and themes on the client, renders through the same `CodeBlock` wrapper used everywhere else in fumadocs (copy button, catppuccin theme, scroll container). Zero new dependencies -- it's already installed and ships with the fumadocs UI package.

The current `RegistrySourceCode.tsx` already computes `lang` and has `file.content` ready from the runtime fetch. The migration is a near drop-in replacement of lines 146-150 (the `CodeBlock`/`Pre`/`<code>` triplet) with a single `<DynamicCodeBlock lang={lang} code={file.content} />`.

Build-time inline source (embedding source into MDX fenced blocks for Shiki to process at compile time) remains a future enhancement for categories that change rarely. The runtime approach is the correct first move because it fixes all 58+ items at once with minimal risk.

---

## 2. Making Components Visible / Rendered in the Registry

### Current State

- **Experiments**: Have live iframe previews via `ExperimentPreview.tsx` pointing to `/experiments/<slug>` -- working well.
- **Collected**: Have live iframe previews via `CollectedPreview.tsx` pointing to `/collected/<slug>` -- infrastructure just built by the current plan.
- **Shared UI components** (button, badge, card, drawer, etc.): **No preview at all**. The generated MDX (`buildNonExperimentMdx`) goes straight from metadata to install to source. These are the items visible in your screenshots -- just raw source code, no rendered output.

### The Gap: Shared UI Has No Previews

For a personal component library to feel "real", visitors need to see components rendered, not just read their source. Currently `badge`, `button`, `card`, `drawer`, `ExperimentDrawerList`, etc. have zero visual representation on their docs pages. No `previewUrl`, no iframe, no inline render.

### Option A: Fumadocs Story Integration

Fumadocs has a first-party [Story integration](https://fumadocs.dev/docs/integrations/story/next) via `@fumadocs/story`:

- `story()` wrapper around components with automatic prop controls
- `<story.WithControl />` renders the component inline in MDX docs with interactive knobs
- No iframe needed -- renders the component directly in the page

Implementation: install `@fumadocs/story`, create `.story.tsx` files per UI component, update `generate-registry-mdx.mjs` to emit `<story.WithControl />` for `category === "components"`. The pipeline already skips `.story` items from registry output.

### Option B (Lighter): Static Preview Images

Use Playwright `npm run capture` to screenshot each shared UI component, reference in MDX as `ImageZoom`. Pros: zero runtime cost, no new deps. Cons: not interactive, stale on changes.

### Option C (Recommended): Hand-Authored Inline Previews

For simple components like badge, button, etc., directly import and render them in hand-authored MDX:

```
import { Badge } from "@/components/ui/badge";

## Preview
<div className="flex gap-2 p-4">
  <Badge>Default</Badge>
  <Badge variant="secondary">Secondary</Badge>
  <Badge variant="destructive">Destructive</Badge>
  <Badge variant="outline">Outline</Badge>
</div>
```

This is what shadcn.com itself does. Since there are only ~10-15 shared UI components, hand-authoring previews is feasible and gives maximum control. The pipeline already preserves hand-authored MDX (files without the `.generated` marker).

### Preview Consolidation for Experiments + Collected

`ExperimentPreview` and `CollectedPreview` are functionally identical (~140 lines each). Consolidate into a single `ComponentPreview` with a `basePath` prop:

```
function ComponentPreview({ slug, title, basePath = "/experiments" }) {
  const previewUrl = `${basePath}/${slug}`;
  // ... same iframe logic
}
```

Both existing files become one-line re-exports. ~280 lines -> ~150.

---

## 3. Font Fix: Collected Preview Layout

### Root Cause

The [collected-preview layout](src/app/(collected-preview)/layout.tsx) renders a bare `<html>/<body>` with only inline styles. It does **not**:

- Import `activeFont` from `@/lib/fonts`
- Apply `activeFont.variable` (which injects the `--font-app` CSS variable and the `@font-face` declaration for Test Die Grotesk)
- Apply `activeFont.className` or `font-canvas` class
- Import any CSS file (`shared-theme.css`, `experiments.css`, or similar)

Result: all 14 collected components render with the browser's default serif font (Times New Roman). The 11 components without explicit `font-family` in their CSS are entirely unreadable with wrong typography. Only 3 components (`sticky-cards-scale`, `feature-convergence`, `custom-video-player`) explicitly set `font-family: monospace` on specific elements and are partially unaffected.

### Fix

Update [src/app/(collected-preview)/layout.tsx](src/app/(collected-preview)/layout.tsx) to match the pattern used by `(registry)` and `(main)` layouts:

- Import `activeFont` from `@/lib/fonts`
- Apply `activeFont.className`, `activeFont.variable`, and `font-canvas` on `<body>`
- Import `shared-theme.css` (for `--font-canvas` definition and CSS custom properties)

This is a ~5-line change to an existing file. The `(registry)` layout at [src/app/(registry)/layout.tsx](src/app/(registry)/layout.tsx) lines 30-38 is the exact pattern to follow.

### Experiment Layout Audit

The same investigation revealed that many experiment layouts also lack font integration (they import `experiments.css` but don't apply `activeFont.variable`). This is a separate issue -- experiment layouts are per-experiment and some intentionally use different fonts. Not in scope for this plan, but noted for the backlog.

---

## 4. Infrastructure-Level Changes

### A. Scaffolding: Add Plop Generator for Collected Components

The [plopfile.js](plopfile.js) has generators for `experiment` (7 files) and `article` (8 files + JSON modify), but none for collected components. The quick-component skill tells the AI agent to create files manually, which is error-prone.

**Two entry points** (matching the existing experiment/article pattern):

- **Interactive**: `npm run new:collected` -- runs plop, prompts for name/source/author/license
- **Non-interactive (AI agents)**: `npm run new:collected:auto` -- runs `scripts/create-collected.mjs` with `--name`, `--source`, `--author`, `--license` flags

The non-interactive script follows the exact pattern of [scripts/create-article.mjs](scripts/create-article.mjs): import `node-plop`, get the `collected` generator, pass answers directly, run actions.

**Scaffolded files** (3, matching all 14 existing collected components):

- `src/components/collected/<name>/ComponentName.tsx` -- template with `"use client"`, `useRef`, `useGSAP` scope, `prefers-reduced-motion` handling, scoped CSS class prefix (`<slug>-`), and cleanup comment. ~30-40 lines (thin shell, not a full implementation)
- `src/components/collected/<name>/meta.json` -- pre-filled from prompts: `type: "component"`, `source`, `author`, `license`, empty `tags`/`tech` arrays
- `src/components/collected/<name>/styles.css` -- empty file with scoped class prefix comment

Plop templates go in `plop-templates/collected/`. Prompts: `name` (required), `source` (URL, required), `author` (required), `license` (default MIT).

### B. Component Decomposition Guidance

Collected components have a risk of becoming monolithic single-file components that degrade agent performance. The 200-line soft limit / 300-line hard limit from AGENTS.md applies here too. Address this in **both** places:

**In the plop template** (`ComponentName.tsx`): Include a comment block at the top with the decomposition pattern:

```
// Decomposition guide (200-line soft limit, 300-line hard limit):
//   data.ts        -- constants, default props, configuration arrays
//   hooks/          -- custom hooks (useAnimation, usePhysics, etc.)
//   sections/       -- visual sub-sections, each with own useGSAP scope
//   ComponentName.tsx -- thin orchestrator: lifecycle, shared state, composition
```

**In the quick-component skill** (Phase 2: Transform): Add explicit decomposition rules:

- If the source component exceeds 200 lines after transformation, extract constants to `data.ts`
- If it exceeds 250 lines, extract custom hooks and/or visual sections
- Hard limit at 300 lines triggers mandatory split
- Each extracted file gets its own entry in `meta.json` tech array if it introduces new patterns

This dual approach ensures both AI agents (via skill guidance) and human developers (via template comments) are aware of the limits.

### C. Quick-Component Skill Updates

[.agents/skills/quick-component/SKILL.md](.agents/skills/quick-component/SKILL.md) needs updates:

- Phase 2 (Transform): Add decomposition rules (see above)
- Phase 3 (Place): Reference the plop generator (`npm run new:collected:auto -- --name "..." --source "..." --author "..."`) as the starting point, then overwrite the template with actual ported code
- Phase 4 (Verify): Add step to check that the preview route works at `/collected/<slug>` and fonts render correctly
- Add note that source code is now automatically syntax-highlighted via DynamicCodeBlock in the registry docs

### D. Preview Component Consolidation

Merge `ExperimentPreview.tsx` + `CollectedPreview.tsx` into `ComponentPreview.tsx` with `basePath` prop. Update `generate-registry-mdx.mjs` templates to import the unified version.

### E. Registry Config: Preview Mode per Category

Add `previewMode` per category to `registry.config.json`: `"iframe"` (experiments/collected), `"inline"` (components), `"none"` (hooks/utilities). This informs `generate-registry-mdx.mjs` which preview strategy to use.

### F. MDX Template Quality

- **Usage section**: Add auto-generated `## Usage` after Preview for collected/components showing import + basic render snippet
- **Metadata hierarchy**: Improve [RegistryMeta.tsx](src/components/registry/RegistryMeta.tsx) grouping -- top row: type + file count + category, second row: tech + deps, third row: tags
- **npm install block**: Verify the remarkNpm fenced block format renders correctly with the npm/pnpm/yarn/bun tab switcher

### G. Agent Docs Alignment

- `.cursor/rules/registry-curation.mdc`: Reference new DynamicCodeBlock pattern and preview strategies
- `.agents/skills/quick-component/SKILL.md`: Reference plop generator, decomposition rules, preview route verification, DynamicCodeBlock, font requirements
- `memory.md`: After implementation, add facts about DynamicCodeBlock, consolidated ComponentPreview, collected-preview font fix, and decomposition guidance

Note: `.agents/contexts/content-constellation.md` is **not** registry-related. It covers the experiment article content system (the 6-format model: article, lab note, architecture, snippet, social, changelog). The registry pipeline does not scan article content. No changes needed there.

---

## Priority Order

1. **Collected-preview font fix** (critical bug, ~10 min) -- fixes broken typography across all 14 collected components
2. **DynamicCodeBlock migration** (biggest visual impact, ~1 hour) -- fixes unstyled code across all 58+ items
3. **Hand-author shared UI component previews** (~2 hours) -- makes badge, button, card, etc. visible
4. **Consolidate ExperimentPreview + CollectedPreview** (~30 min) -- reduces code duplication
5. **Add collected plop generator** (interactive + auto, ~45 min) -- prevents future scaffolding errors
6. **MDX template quality improvements** (Usage section, metadata grouping) (~1 hour)
7. **Update agent docs + decomposition guidance** (~45 min) -- align skills, rules, and plop templates with new patterns

