# Component Registry

## Overview

The lab includes a [shadcn-compatible component registry](https://www.razisyed.cv/registry) that lets anyone install experiments and components into their own Next.js project with a single command:

```bash
npx shadcn@latest add https://www.razisyed.cv/r/<slug>
```

The registry catalogs 100+ items across multiple categories, with browsable documentation powered by Fumadocs.

## URL Contract

`/r/:slug` rewrites to `/registry/:slug.json` (a static JSON file in `public/registry/`). This URL must always work in production:

```bash
npx shadcn@latest add https://www.razisyed.cv/r/send-button
```

The CLI downloads component files, resolves and installs npm dependencies, merges Tailwind configuration, and rewrites public asset paths to stream from the production CDN.

## Categories

| Category | Source | Description |
|----------|--------|-------------|
| `experiments` | `src/components/experiments/` | Full experiment components |
| `components` | `src/components/ui/` | Shared UI components |
| `collected` | `src/components/collected/` | Ported external components |
| `hooks` | `src/hooks/` | Reusable React hooks |
| `utilities` | `src/lib/utils.ts`, `src/lib/fonts.ts` | Utility functions |
| `mdx` | `src/components/mdx/` | MDX rendering components |
| `styles` | Shared style item | `razi-style` design tokens |

## Previews

| Category | Preview behavior |
|----------|------------------|
| **Experiments** | Live iframe to `/experiments/[slug]` (ExperimentPreview). |
| **Components** | Every component doc has a Preview section. Slugs in `UI_COMPONENT_PREVIEWS` get a live iframe (`/component-preview/[slug]`); others show a “Preview not yet added” placeholder. Single source of truth: `src/components/registry/ui-component-previews.tsx`; slug list is derived at build time by `export-component-preview-slugs.mjs`. |
| **MDX** | Live iframe for 12 items in `MDX_PREVIEW_SLUGS` via `/mdx-preview/[slug]`. |
| **Collected** | Permanent preview routes at `/collected/[slug]` (iframe); doc pages do not yet embed a Preview block. |
| **Hooks / Utilities** | No preview blocks (code-only docs). |

### Adding a component preview

1. Add an entry to `UI_COMPONENT_PREVIEWS` in `src/components/registry/ui-component-previews.tsx` (slug → `{ component: YourPreviewComponent }`).
2. Run `npm run generate:registry`. The export script will include the new slug; the MDX generator will add a live Preview section for that component. No edits in the generator or any slug list.

## Generation Pipeline

`npm run generate:registry` runs 5 scripts in sequence:

### 1. generate-registry-json.mjs

The main scanner (~1200 lines). It:
- Scans all source directories for registerable items
- Resolves import trees recursively to find all dependencies
- Categorizes dependencies as npm, registry (internal), or local
- Infers file types from extensions
- Applies curation rules from `registry.config.json`
- Outputs `registry.json` at the project root (shadcn registry schema)

### 2. build-registry.mjs

Reads `registry.json` and builds individual JSON files into `public/registry/`:
- One JSON file per item (`<slug>.json`)
- `index.json` (full index)
- `index-slim.json` (lightweight index for the grid page, ~22KB)

### 3. post-process-registry.mjs

Post-processing step that handles:
- `razi-style` shared style propagation (`registryDependencies: ["razi-style"]` eliminates ~120 lines of duplicated Tailwind/CSS variables per item)
- Metadata enrichment

### 4. export-component-preview-slugs.mjs

Reads `src/components/registry/ui-component-previews.tsx`, extracts the keys of `UI_COMPONENT_PREVIEWS`, and writes `scripts/component-preview-slugs.json`. The MDX generator uses this file to know which components get a live preview iframe (single source of truth).

### 5. generate-registry-mdx.mjs

Generates MDX documentation files into `content/registry/` for Fumadocs:
- One MDX file per registry item
- Includes source code, install command, metadata, and previews (experiments: iframe; components: iframe or placeholder; MDX: iframe for whitelisted slugs)
- Reads `scripts/component-preview-slugs.json` (from step 4) to decide which component docs get a live preview
- Files with `.generated` marker are regenerated on each build; hand-authored files are preserved

## Collected Components

External components ported into the lab's registry. Located in `src/components/collected/<name>/`.

### Two Modes

**Mode A: Ported Component** -- actual source code lives in the repo
```
src/components/collected/component-name/
├── ComponentName.tsx       # Ported source code
├── meta.json              # Metadata (source, author, license, tags, tech)
└── styles.css             # Co-located styles (optional)
```

**Mode B: Library Reference** -- indexed entry pointing to an external library
```
src/components/collected/library--component/
└── library.json           # Library reference (source URL, install command, etc.)
```

Library references use `<library>--<component>` naming to avoid collisions with ported components.

### Scaffolding

```bash
npm run new:collected              # Interactive
npm run new:collected:auto         # Non-interactive (AI agents)
```

### Previews

Ported components have permanent preview routes at `/collected/<slug>` via the `(collected-preview)` route group. These are isolated HTML roots designed for iframe embedding. The `_map.ts` file in `src/components/collected/` is auto-generated on each `npm run generate:registry` run, mapping slugs to dynamic imports.

All collected component props must be optional with sensible defaults so the preview route can render them without external data.

Collected components add zero bytes to the production build -- they exist only as source files serialized into `public/registry/*.json`.

## Fumadocs Integration

The registry has browsable documentation at `/registry/docs` powered by Fumadocs:

- **`source.config.ts`** -- defines a `registryDocs` collection reading from `content/registry/`
- **`src/lib/registry-source.ts`** -- creates a Fumadocs source loader at `/registry/docs`
- **`src/app/(registry)/registry/docs/`** -- layout and catch-all page route
- **`content/registry/`** -- MDX files (generated by `generate-registry-mdx.mjs`, plus hand-authored overrides)

CI runs `npx fumadocs-mdx` before lint/typecheck to generate the `.source/` runtime files that Fumadocs needs.

## Curation

`registry.config.json` at the project root controls the pipeline:

```json
{
  "categories": ["experiments", "components", "collected", "hooks", "utilities", "mdx", "styles"],
  "featured": ["send-button", "404-not-found", "keyboard-keys"],
  "hidden": ["test"],
  "overrides": { },
  "scan": {
    "experiments": true,
    "sharedUI": true,
    "collected": true,
    "hooks": true,
    "mdx": true,
    "utilities": ["src/lib/utils.ts", "src/lib/fonts.ts"]
  }
}
```

| Field | Purpose |
|-------|---------|
| `featured` | Items highlighted on the registry homepage |
| `hidden` | Items excluded from the registry entirely |
| `overrides` | Per-item metadata overrides (category, description, etc.) |
| `scan` | Which source directories to scan for registerable items |

## CDN Asset Streaming

When a component is installed into a third-party project, static assets (images, videos, SVGs from `public/experiments/`) are automatically pointed to the production CDN at `https://www.razisyed.cv`. Binary assets work immediately without requiring the installer to copy files into their own `public/` directory.

## Shared Style Item

The `razi-style` registry item contains shared design tokens (CSS variables for light/dark themes, Tailwind configuration extensions). Other registry items declare it as a dependency via `registryDependencies: ["razi-style"]`, which eliminates ~120 lines of duplicated styling configuration per item.
