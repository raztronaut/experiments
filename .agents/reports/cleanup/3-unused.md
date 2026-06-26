# Unused Code Report

Read-only analysis of `knip` output cross-verified against the whole repo (`src/`, `scripts/`, `content/`, `*.json`, `registry.json`, `public/registry/`, `next.config.ts`, and other configs). No source/config files were modified.

## Critical Assessment

`knip` is structurally blind to three things this repo relies on heavily, which produces a large false-positive rate:

1. **Generated Fumadocs MDX.** `content/registry/**` is git-ignored and generated at build time by `scripts/generate-registry-mdx.mjs`. knip's `project` scope is only `src/**` + `scripts/**`, so the ~106 generated `.mdx` files that import the registry preview components are invisible to it. Every `src/components/registry/*Preview*` / `InstallCommand` / `RegistryMeta` / `RegistrySourceCode` "unused file" is a false positive.
2. **`src/components/ui/**` is ignored** in `knip.json`. Anything used *only* by `ui/**` (e.g. `src/lib/story.ts`, `@radix-ui/react-progress`, `@radix-ui/react-scroll-area`) looks dead even though `ui/` consumes it.
3. **Dynamic / string-keyed loading.** `src/components/collected/_map.ts` (auto-generated) loads every collected component via `import("./path")` and reads `.default`, so the "duplicate `default` exports" knip lists for collected components are all live. CSS-only deps (`@import` / `@plugin` in `.css`) and analysis tooling (`dependency-cruiser`, `jscpd`, `madge`, `type-coverage`, `@biomejs/biome`, `tailwindcss`) are also invisible to knip and must NOT be removed.

A second important caveat: **the in-editor search index returned stale hits for the already-deleted `announcing-v2` experiment** (the directory is gone from disk). All findings below were re-verified with disk-based `rg`. The deletion of `announcing-v2` is *why* several genuinely-published items (e.g. `useGSAPDebug`) now show zero importers.

Net result: of the headline findings, only a small set are genuinely dead. The highest-value, safest wins are the **10–11 unused npm dependencies** and **4 dead files**.

## Recommendations

### Confirmed-dead files

#### `src/components/registry/RegistryGrid.tsx` — **Confidence: High**
The registry landing page no longer renders a grid; it just redirects:
```5:5:src/app/(registry)/registry/page.tsx
  redirect("/registry/docs");
```
Verification (only self-reference + docs/plans, no importer):
```
rg -l "RegistryGrid" src scripts        # → only src/components/registry/RegistryGrid.tsx
rg -n "toolkit/raf|toolkit/index" registry.json   # (registry/ dir is not a scanned category)
```
`registry/` is not in `registry.config.json` `scan`, so this file is not serialized into the registry either.

#### `src/components/registry/RegistryCard.tsx` — **Confidence: High**
Only importer is `RegistryGrid.tsx` (dead above), so it dies with it:
```
rg -l "RegistryCard" src   # → RegistryGrid.tsx + RegistryCard.tsx (self) only
```

#### `src/lib/toolkit/index.ts` — **Confidence: High**
Barrel that re-exports `createUnifiedScroll`. No module imports the barrel; every consumer imports the concrete path (`@/lib/toolkit/scroll`, `@/lib/toolkit/r3f`):
```
rg -l "@/lib/toolkit\"" src   # → no matches (barrel never imported)
```

#### `src/lib/toolkit/raf.ts` — **Confidence: High**
Re-exports Tempus. Zero importers anywhere and not a registry item:
```
rg -l "toolkit/raf" src scripts   # → no matches
rg -n "toolkit/raf" registry.json # → no matches
```

> Note: `src/lib/toolkit/scroll.ts` and `r3f.tsx` are heavily used (airplanes, velocity-responsive-design, 3d-crt-display) — keep them.

### Confirmed-dead exports

#### `getBestCharSet` — `src/components/experiments/transit-airport-split-flap-display/utils.ts:31` — **Confidence: Medium**
Zero callers in the whole repo (only its own definition line):
```
rg -n "getBestCharSet" src   # → only utils.ts:31 (the definition)
```
(Sibling `getSafeIndex` in the same file *is* used in-file at lines 17/26, so it is NOT dead — see False Positives.)

#### `MDX_PREVIEW_SLUGS` — `src/components/mdx/_previews.tsx:38` — **Confidence: Medium**
The MDX generator defines its *own* local `MDX_PREVIEW_SLUGS` Set in `scripts/generate-registry-mdx.mjs:454`; the exported `Object.keys(...)` derivative here is never imported:
```
rg -n "import .*MDX_PREVIEW_SLUGS" src scripts   # → no named imports
```
`MDX_PREVIEWS` (the object) is still used by the mdx-preview route — only the derived `_SLUGS` export is dead.

#### `COMPONENT_PREVIEW_SLUGS` — `src/components/registry/ui-component-previews.tsx:119` — **Confidence: Medium**
`scripts/export-component-preview-slugs.mjs` reads `UI_COMPONENT_PREVIEWS` by *text-parsing* the file (it does not import this const), and nothing else imports it:
```
rg -n "import .*COMPONENT_PREVIEW_SLUGS" src scripts   # → no named imports
```
`UI_COMPONENT_PREVIEWS` itself is the live single-source-of-truth; only the derived `_SLUGS` export is dead.

#### `R3FDevToolsInjector` re-export — `src/components/dev/index.ts:2` — **Confidence: Medium**
The barrel re-export is unused; the component is imported directly from its file:
```7:7:src/components/experiments/3d-crt-display/CrtDisplay.tsx
import { R3FDevToolsInjector } from "@/components/dev/R3FDevToolsInjector";
```
Only the `export { R3FDevToolsInjector } from "./R3FDevToolsInjector"` *line* in `dev/index.ts` is dead — the component file is alive, and `DevToolsInjector` (the other barrel export) is used by experiment layouts. Removing the line is safe but cosmetic.

### Confirmed-dead dependencies

All verified with `rg -ln "<pkg>" src content scripts` **and** a sweep of every existing root config (`next.config.ts`, `vitest.config.ts`, `instrumentation*.ts`, `sentry.*.config.ts`, `source.config.ts`, `postcss.config.mjs`) → zero references for each:

| Dependency | Type | Confidence | Evidence |
|---|---|---|---|
| `@react-spring/three` | dep | **High** | zero refs in src/content/scripts/config |
| `@react-three/rapier` | dep | **High** | zero refs anywhere |
| `@theatre/core` | dep | **High** | zero refs anywhere |
| `@theatre/r3f` | dep | **High** | zero refs anywhere |
| `@theatre/studio` | devDep | **High** | zero refs anywhere |
| `@use-gesture/react` | dep | **High** | zero refs anywhere |
| `hamo` | dep | **High** | zero refs anywhere (listed in AGENTS tech table but never imported) |
| `mini-svg-data-uri` | dep | **High** | zero refs anywhere |
| `next-view-transitions` | dep | **High** | zero refs anywhere |
| `tunnel-rat` | dep | **High** | zero refs anywhere |
| `sentry` (bare `^0.17.0`) | dep | **High** | only a `describe("sentry")` test label; real monitoring uses `@sentry/nextjs` |
| `@radix-ui/react-switch` | dep | **Medium** | only a **commented-out** import in `send-button/ThemeSwitch.tsx:9` + a stale entry in `next.config.ts` `optimizePackageImports`. Removing the dep requires also removing that `next.config.ts` line. |

Confirming sweeps:
```
rg -ln "@theatre|@use-gesture|@react-spring/three|@react-three/rapier|hamo|mini-svg-data-uri|next-view-transitions|tunnel-rat" src content scripts   # → NONE
rg -n  "react-spring|@react-three/rapier|@theatre|@use-gesture|hamo|mini-svg-data-uri|next-view-transitions|tunnel-rat" next.config.ts vitest.config.ts instrumentation.ts instrumentation-client.ts sentry.server.config.ts sentry.edge.config.ts source.config.ts postcss.config.mjs   # → NO config refs
rg -n "react-switch" src/components/ui/ src/components/mdx/controls/   # → NONE (ui has no switch.tsx)
```

### Confirmed-dead types (used in-file only → "unused export" is correct but low value)

These types/values are imported by **no other module** (so knip is technically right), but are still referenced *within their own file*. Deleting the symbol would break the file; only the `export` modifier is removable. Listed for completeness, **Confidence: Low** for any action beyond dropping `export`:

- `isDev`, `isPreview` (`src/lib/env.ts`) — used in-file to compute `showDevContent`; **documented in AGENTS.md as intended exports** → recommend keep.
- `FRAMES_PER_SEQUENCE` (`luma-morphing/data.ts`) — used in-file (lines 3, 29).
- `getSafeIndex` (`transit.../utils.ts`) — used in-file (lines 17, 26).
- `HyperbolicTile` (`non-euclidean.../HyperbolicTile.tsx`) — wrapped in-file by `HyperbolicTileMemo` (the imported symbol).
- `Stats` (`(main)/dev/_components/types.ts`) — used in-file (line 75).
- `ReplayGridProps` (`basketball-replay-center/ReplayGrid.tsx`) — used in-file (line 34).
- `ArticleFrontmatter` (`src/lib/articles.ts`) — used in-file (line 133).

## False Positives

### Files (registry/MDX infra rendered in generated docs)
All of these are imported by `scripts/generate-registry-mdx.mjs` (string templates) into `content/registry/**/*.mdx` (git-ignored, generated, outside knip's project scope). Verified: `rg -l "InstallCommand" content/registry | wc -l → 106` files.
- `ComponentPreview.tsx` (consumed internally by the four wrappers below)
- `ExperimentPreview.tsx`, `MdxPreview.tsx`, `CollectedPreview.tsx`, `UIComponentPreview.tsx`
- `ComponentPreviewPlaceholder.tsx`
- `InstallCommand.tsx`, `RegistryMeta.tsx`, `RegistrySourceCode.tsx`

### Files (used by knip-ignored `ui/**`)
- `src/lib/story.ts` — `defineStory` imported by 10 `src/components/ui/**/*.story.tsx` files (e.g. `button.story.tsx`, `card.story.tsx`). `ui/**` is in `knip.json` `ignore`, so the importers are hidden.

### Exports
- **`mdx/index.ts` named re-exports** (`BeforeAfterImage`, `Callout`, `CodeBlock`, `CodeStep`, `Checkbox`, `ControlGroup`, `Radio`, `Range`, `Switch`, `Details`, `Fullbleed`, `ImageSwitcher`, `InteractiveWidget`, `LiveDemo`, `Pill`, `SandpackDemo`, `Slideshow`, `TableOfContents`) — the live consumers import the **`articleComponents` map** from `@/components/mdx/components.tsx` (used by 4 article `page.tsx`). The individual barrel re-exports are a public API surface, not directly imported. *Low-risk to trim, but not "dead code".*
- **`mdx/controls/index.ts` types** (`ButtonProps`, `CheckboxProps`, `ControlGroupProps`, `RadioGroupProps`, `RadioItemProps`, `RangeProps`, `SwitchProps`) and `Radio.tsx` `RadioGroupProps`/`RadioItemProps` — barrel type re-exports / in-file prop types behind the controls used via `articleComponents`.
- **`AUTHOR_NAME`, `GITHUB_URL`, `TWITTER_URL`** (`scripts/lib/site-config.mjs`) — **required by `scripts/validate-site-config.mjs`**, which asserts these keys exist and match `src/lib/constants.ts`. Removing them would fail `npm run validate:site-config`.
- **`mergeRefs`** (`src/lib/utils.ts`) — `utils.ts` is a registry **utility item** (`registry.config.json` `scan.utilities`), so this is serialized into `public/registry/utils.json` as published API. No internal caller, but intentionally public.
- **`UmamiEventName`** (`src/hooks/useUmami.ts`) — `useUmami` is a published registry hook; the type is its public surface.
- **`COLLECTED_SLUGS`** (`src/components/collected/_map.ts`) — `_map.ts` is **auto-generated**; this export is emitted by `scripts/generate-registry-json.mjs:1119`. Not hand-editable and harmless.

### Duplicate exports (intentional dual exports / aliases — all live)
- **Collected components** (`ClipPathReveal`, `CounterFlipReveal`, `CurvedTextScroll`, `CustomVideoPlayer`, `FeatureConvergence`, `FibonacciImageOrb`, `ImageExplosion`, `PhysicsTagCloud`, `ScrollFrameCanvas`, `SplitCardFlip`, `SpotlightImageStack`, `StickyCardsFold`, `StickyCardsScale`, `StickyCardsTilt`) — their `default` exports are consumed dynamically by `src/components/collected/_map.ts` via `import("./path")` → `.default`. **False positive.**
- **`ALPHANUMERIC_SET | CHAR_SET`** (transit `constants.ts`) — `CHAR_SET = ALPHANUMERIC_SET`; both names are imported in `utils.ts`. Live.
- **`testDieGrotesk | activeFont`** (`src/lib/fonts.ts`) — `activeFont = testDieGrotesk`; `activeFont` used by ~10 layouts, `testDieGrotesk` used by `(main)/page.tsx:14`. Live.

### Dependencies / devDependencies
- `@radix-ui/react-progress` → `src/components/ui/progress.tsx` (ignored dir) + `next.config.ts`.
- `@radix-ui/react-scroll-area` → `src/components/ui/scroll-area.tsx` (ignored dir) + `next.config.ts`.
- `@fumadocs/story` → imported by `src/lib/story.ts` and referenced in `(registry)/registry.css`.
- `tw-animate-css`, `@tailwindcss/typography` → CSS `@import`/`@plugin` in `globals.css`, `experiments.css`, `registry.css` (knip doesn't parse CSS).
- `@biomejs/biome`, `tailwindcss`, `@vitest/coverage-v8` → build/lint/test tooling.
- `dependency-cruiser`, `jscpd`, `madge`, `type-coverage` → the analysis devDeps for this very cleanup pass — **explicitly do not remove**.
- `r3f-perf` (already in knip `ignoreDependencies`) → used by `src/components/dev/R3FDevTools.tsx`.

### "Unlisted" findings (the opposite of dead — used but undeclared)
`node-plop`, `sharp`, `unified`, `@sentry/node`, and binary `ffmpeg` are flagged because they're used in scripts/tests but not declared (or only transitively available). These are **add-a-dependency** candidates, not deletion candidates — out of scope for this report.

---

### Summary
- **15 confirmed-dead items** total: **4 files** (`RegistryGrid.tsx`, `RegistryCard.tsx`, `toolkit/index.ts`, `toolkit/raf.ts`), **4 exports** (`getBestCharSet`, `MDX_PREVIEW_SLUGS`, `COMPONENT_PREVIEW_SLUGS`, `R3FDevToolsInjector` re-export), and **11 high-confidence unused npm deps** (`@react-spring/three`, `@react-three/rapier`, `@theatre/core`, `@theatre/r3f`, `@theatre/studio`, `@use-gesture/react`, `hamo`, `mini-svg-data-uri`, `next-view-transitions`, `tunnel-rat`, `sentry`).
- **~1 medium-confidence dep** (`@radix-ui/react-switch`) is removable but coupled to a stale `next.config.ts` `optimizePackageImports` entry.
- **Roughly 60+ knip findings were false positives**, dominated by: 9 registry-preview files + `story.ts` rendered in generated MDX / ignored `ui/**`; ~30 mdx barrel re-exports/types and 14 collected `default` exports loaded dynamically via `_map.ts`; and ~12 deps/devDeps used only via CSS, `ui/**`, config, or tooling.
- **Biggest safe win:** dropping the 11 unused dependencies (zero refs in src/content/scripts/config) — this is pure `package.json` cleanup with no code changes.
- **Needs-human decision (not auto-deletable):** `useGSAPDebug.ts` and the two `GameOfLife*`/`BuggedOut*` wrapper components are now orphaned at runtime (their only importer, `announcing-v2`, was deleted) **but remain published registry items** — deleting them removes registry entries, so confirm intent first.
