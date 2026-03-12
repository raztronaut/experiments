---
name: MDX Registry Integration
overview: Add MDX article components to the registry by creating a scanMdx() scanner in generate-registry-json.mjs, handling CSS co-location and the controls/ subdirectory, and fixing a pre-existing gap where @/hooks/ imports are silently dropped from dependency tracking.
todos:
  - id: config
    content: "Add \"mdx\": true to registry.config.json scan section and \"mdx\" to categories"
    status: completed
  - id: categorize-hooks
    content: Extend categorizeImport() in generate-registry-json.mjs to map @/hooks/ imports to registryDependencies (fixes pre-existing bug for UI components too)
    status: completed
  - id: scan-mdx
    content: "Implement scanMdx() in generate-registry-json.mjs: flat-file scan + controls/ block + CSS co-location + mdx- prefix"
    status: completed
  - id: wire-main
    content: Wire scanMdx() into main() with config flag, logging, and allItems merge
    status: completed
  - id: verify
    content: Run npm run generate:registry and verify registry.json contains correct MDX entries with proper deps
    status: completed
isProject: false
---

# Add MDX Components to Registry

## Investigation Summary

The registry does NOT include MDX components. `src/components/mdx/` (22 files, 15 standalone components) is completely absent from both registry scripts. After thorough analysis, there are **4 issues** that must be addressed for this to work properly.

## MDX Component Inventory

**Flat files** in `src/components/mdx/` (each becomes an individual registry item):

- `Callout.tsx` -- deps: `@/lib/utils`
- `CodeBlock.tsx` -- no external deps
- `CodeStep.tsx` -- no external deps
- `Fullbleed.tsx` -- no external deps
- `Pill.tsx` -- deps: `@/lib/utils`, `class-variance-authority`
- `TableOfContents.tsx` -- deps: `@/lib/utils`
- `LiveDemo.tsx` -- no external deps
- `InteractiveWidget.tsx` -- deps: `@/lib/utils`
- `BeforeAfterImage.tsx` -- deps: `next/image`
- `Slideshow.tsx` -- deps: `motion/react`, `next/image`, `@/lib/utils`
- `SandpackDemo.tsx` -- deps: `@codesandbox/sandpack-react`, `next-themes`
- `Details.tsx` + `details.css` -- deps: `@/lib/utils`, has co-located CSS

**Subdirectory** `controls/` (multi-file block):

- `Checkbox.tsx`, `Switch.tsx`, `Radio.tsx` -- deps: `./controls.css`
- `Range.tsx` -- deps: `@/hooks/useDebouncedValue`, `./controls.css`
- `ControlGroup.tsx` -- deps: `@/lib/utils`
- `controls.css` -- shared CSS for all controls
- `index.ts` -- barrel export

**Meta files** (excluded from registration):

- `components.tsx` -- aggregator map wiring MDX element names to components
- `index.ts` -- barrel export

## Issues Found

### Issue 1: CSS files silently dropped by import resolution

`resolveLocalFiles()` only follows files matching `.(tsx?|jsx?|glsl|frag|vert)$`. CSS imports like `./details.css` and `./controls.css` get parsed as imports but never resolved to file paths. They are silently dropped.

The `scanCollected()` scanner already has a workaround -- it manually scans for co-located `.css` files after the main resolution pass. The MDX scanner needs the same approach.

**Affected components**: `Details.tsx` (imports `./details.css`), all `controls/*.tsx` (import `./controls.css`)

### Issue 2: `@/hooks/` imports not tracked as registry dependencies (PRE-EXISTING BUG)

`categorizeImport()` in [generate-registry-json.mjs](scripts/generate-registry-json.mjs) only maps `@/components/ui/` to `registryDependency`. Imports from `@/hooks/` are classified as "local" but never resolved (the `resolveLocalFiles` function only follows relative paths and `@/components/experiments/` paths).

This is a **pre-existing gap** -- 9 shared UI components (SiteFooter, ExperimentDrawerList, Cursor, etc.) also import from `@/hooks/` without those hooks appearing in their `registryDependencies`. For MDX, `Range.tsx` imports `@/hooks/useDebouncedValue` which would be silently lost.

**Fix**: Extend `categorizeImport()` to recognize `@/hooks/<name>` as `{ type: "registry", name: toKebabCase(name) }`. This fixes both MDX and the existing UI component gap.

### Issue 3: Subdirectory handling needed

The `controls/` subdirectory contains 5 components + 1 CSS file + 1 barrel index. The existing flat-file scanners (`scanSharedUI`, `scanHooks`) don't handle subdirectories. The MDX scanner needs to:

- Register `controls/` as a single `registry:block` named `mdx-controls`
- Include all `.tsx` files and the `controls.css` in its file list
- Use `controls/index.ts` as the entry point for dependency resolution

### Issue 4: Name collision prevention

Simple kebab names like `callout`, `code-block` risk collision with future components in other categories. All MDX items should be prefixed with `mdx-` (e.g., `mdx-callout`, `mdx-code-block`, `mdx-controls`).

## Changes

### 1. `registry.config.json` -- add mdx scan flag and category

Add `"mdx": true` to `scan` object and `"mdx"` to `categories` array.

### 2. `scripts/generate-registry-json.mjs` -- add scanMdx() and fix categorizeImport

**a) Add MDX_DIR constant** (line ~17):

```javascript
const MDX_DIR = path.join(ROOT_DIR, "src", "components", "mdx");
```

**b) Extend `categorizeImport()`** to recognize `@/hooks/` imports as registry dependencies:

```javascript
if (importPath.startsWith("@/hooks/")) {
  const parts = importPath.split("/");
  const hookName = parts.at(-1).replace(/\.tsx?$/, "");
  return { type: "registry", name: toKebabCase(hookName) };
}
```

This is placed BEFORE the generic `@/` local path check.

**c) Add `scanMdx()` function** -- hybrid scanner:

- Scan flat `.tsx` files (excluding `components.tsx`, `index.ts`, `.test.` files)
- For each flat file, call `resolveLocalFiles()` then manually scan for co-located CSS
- Scan `controls/` subdirectory as a single block using `controls/index.ts` as entry
- Use `"mdx-"` prefix for all names
- Assign category `"mdx"`, type `"registry:component"` for single files, `"registry:block"` for multi-file

**d) Wire into `main()`** -- add scan flag check and call, log output, merge into `allItems`.

### 3. NOT changing `generate-registry.mjs`

The older script (outputs to `public/registry/`) is experiment-only by design. MDX components are infrastructure, not experiments. Only `generate-registry-json.mjs` (the comprehensive `registry.json`) gets updated.

## Expected Output

After running `npm run generate:registry`, `registry.json` will include ~13 new items in the `"mdx"` category:

- `mdx-callout`, `mdx-code-block`, `mdx-code-step`, `mdx-fullbleed`, `mdx-pill`
- `mdx-table-of-contents`, `mdx-live-demo`, `mdx-interactive-widget`
- `mdx-before-after-image`, `mdx-slideshow`, `mdx-sandpack-demo`
- `mdx-details` (block: Details.tsx + details.css)
- `mdx-controls` (block: 5 components + controls.css + index.ts)

Each with proper `dependencies`, `registryDependencies` (including `utils` and `razi-style`), and `files` arrays.