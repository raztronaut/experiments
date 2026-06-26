# Legacy / Dead Paths Report

_Read-only research pass over `/Users/razisyed/Developer/experiments` (Next.js 16 / React 19 / TS). No source/config files were modified._

## Critical Assessment

The codebase is unusually clean for a creative-coding lab. There is **almost no version-gated / browser-compat cruft** — the few `if (typeof window === "undefined")` guards are correct SSR handling, not legacy. Most `fallback` hits are React `<Suspense fallback={...}>` (legitimate) or **intentional graceful degradation** (Safari blur fallback, static-image-for-video, Matter.js-unavailable static tag cloud, prefers-reduced-motion locks). The Sentry layer is a textbook no-DSN no-op.

The real legacy debt clusters in three places:

1. **Two superseded monolithic experiment components** (`GameOfLifeShader.tsx`, `BuggedOutGameOfLifeShaderExperiment.tsx`) that have been replaced by a split `GradientBackground` + `LifeSimulation` architecture. The pages no longer import the monoliths — they are pure dead code. Both live in `legacy: true` experiments, but the supersession is unambiguous.
2. **A half-removed theme-toggle feature** spread across `SiteFooter.tsx` (commented JSX + imports) and `send-button/ThemeSwitch.tsx` (a disabled, non-interactive shell full of commented-out code). This is "in-progress removal" cruft, not graceful degradation.
3. **A small set of dead modules/exports** flagged by knip (`src/lib/story.ts` + its unused `@fumadocs/story` dep, the unused `toolkit/index.ts` + `toolkit/raf.ts` re-export pair, `mergeRefs`, and a `pref-fahrenheit` migration shim).

Note on knip: its 12 `src/components/registry/*` "unused files" are **false positives** — grep shows `RegistryGrid`, `ComponentPreview`, `MdxPreview`, etc. are imported by `(component-preview)` and `(mdx-preview)` routes. Do **not** treat those as dead.

No `@deprecated` annotations, no `if (false)`/`if (true)` dead branches, no polyfills, and no IE11/old-browser shims were found.

## Recommendations

### 1. Delete the superseded monolithic Game-of-Life component `[LEGACY EXPERIMENT]`
**Confidence: High**
- `src/components/experiments/game-of-life-shader/GameOfLifeShader.tsx`
- `page.tsx` (`src/app/experiments/(game-of-life-shader)/game-of-life-shader/page.tsx:1-2`) imports only `GradientBackground` + `LifeSimulation`. The monolith is imported nowhere (confirmed via grep + knip "Unused files").
- **Action:** delete `GameOfLifeShader.tsx`. **Single clean path:** `page.tsx` → `GradientBackground` + `LifeSimulation`.
- `[LEGACY EXPERIMENT]` (`status: shipped`, `legacy: true`). Removal touches no behavior since the file is unreferenced; still, confirm with the user before deleting inside a legacy experiment.

### 2. Delete the superseded monolithic Bugged-Out Game-of-Life component `[LEGACY EXPERIMENT]`
**Confidence: High**
- `src/components/experiments/bugged-out-game-of-life-shader-experiment/BuggedOutGameOfLifeShaderExperiment.tsx`
- `page.tsx` (`(bugged-out-game-of-life-shader-experiment)/.../page.tsx:1`) imports only `LifeSimulation`. Monolith unreferenced (grep + knip).
- **Action:** delete `BuggedOutGameOfLifeShaderExperiment.tsx`. **Single clean path:** `page.tsx` → `LifeSimulation`.
- `[LEGACY EXPERIMENT]`. Same conservative caveat as #1.

### 3. Collapse the disabled theme-toggle in `SiteFooter.tsx`
**Confidence: Medium**
- `src/components/ui/SiteFooter.tsx:4` (commented `next-themes` import), `:13-18` (commented hook + handler), `:43-66` (commented `<WithHover>` toggle button + TODO).
- This is a feature mid-removal, not degradation. **Action:** either (a) delete the commented block and the dead `// import { useTheme }` line, leaving a footer with no toggle, or (b) finish restoring it. Recommend (a) — remove the dead comments. **Single clean path:** footer renders copy + social links only; no theme state.
- Medium because the TODO signals intent to restore; confirm the toggle is genuinely abandoned before deleting.

### 4. Simplify `send-button/ThemeSwitch.tsx` to its real (disabled) state `[LEGACY EXPERIMENT]`
**Confidence: Medium**
- `src/components/experiments/send-button/ThemeSwitch.tsx:3` (TODO), `:9-11` + `:23-28` + `:45-55` (multiple commented-out `@radix-ui/react-switch` / `motion` / `useCallback` blocks).
- The component is intentionally non-interactive (`cursor-not-allowed`, `title="Theme toggle disabled"`). `resolvedTheme`/`isChecked` are still read but only drive static styling. **Action:** strip the commented-out interactive implementation; keep the static visual. **Single clean path:** a presentational, disabled switch with no commented dead code.
- `[LEGACY EXPERIMENT]` (`(send-button)`, `legacy: true`). Keep conservative — purely a comment/dead-code cleanup, no behavior change.

### 5. Remove dead `src/lib/story.ts` + drop unused `@fumadocs/story` dependency
**Confidence: Medium**
- `src/lib/story.ts` (whole file) — flagged unused by knip; its only dep `@fumadocs/story` is also knip-flagged as an unused dependency (`package.json:65`).
- **Action:** delete `story.ts`; in a separate dependency-cleanup PR, remove `@fumadocs/story`. **Single clean path:** no `defineStory` factory in the tree.
- Medium: verify no MDX/`.source` codegen path resolves `defineStory` dynamically before deleting (the build runs `fumadocs-mdx`).

### 6. Remove the unused toolkit barrel + RAF re-export pair
**Confidence: Medium**
- `src/lib/toolkit/index.ts` and `src/lib/toolkit/raf.ts` — both knip "Unused files". `raf.ts` is a 6-line `export { Tempus }`/`default` re-export of the `tempus` package; consumers import `tempus` directly. `index.ts` is a barrel that nothing imports (experiments import `@/lib/toolkit/r3f` / `/scroll` directly per the comment at `index.ts:5`).
- **Action:** delete `index.ts` and `raf.ts`. **Single clean path:** direct imports from `@/lib/toolkit/scroll` and `@/lib/toolkit/r3f`, and `tempus` from the package.
- **Ask-first guardrail:** AGENTS.md lists `src/lib/toolkit/` under "Ask first". Confirm before removing even though they're unreferenced.

### 7. Remove the unused `mergeRefs` helper
**Confidence: Medium**
- `src/lib/utils.ts:8-22` — knip "Unused exports". Uses `React.LegacyRef`/`MutableRefObject`; React 19's ref-as-prop makes a hand-rolled merge largely unnecessary.
- **Action:** delete `mergeRefs` (keep `cn`). **Single clean path:** `utils.ts` exposes only `cn`.
- Medium: trivially dead, but a shared util — quick grep before removal.

### 8. Drop the `pref-fahrenheit` migration shim
**Confidence: Low**
- `src/hooks/usePreferences.ts:20-24` — reads a legacy `pref-fahrenheit` localStorage key and maps it onto the newer `pref-temp-unit` scheme.
- **Action:** optionally remove once enough time has passed that no real users hold the old key. **Single clean path:** read only `pref-temp-unit`, default `"C"`.
- Low: harmless, tiny, and removing it silently resets returning users who never re-saved. Leave unless doing a deliberate preferences cleanup.

---

## Graceful degradation — KEEP (do NOT remove)

These are intentional fallbacks, not legacy cruft:

- **`src/hooks/useLiquidGlassStyle.ts:47-52`** — Chromium-only SVG `backdrop-filter` with a Safari/Firefox `blur()` fallback. SVG-filter backdrop is still Chromium-only; the browserslist (safari>=16.4) does **not** make this redundant. KEEP.
- **`src/components/collected/physics-tag-cloud/PhysicsTagCloud.tsx:61,69` + `styles.css:34-44`** — `.ptc-static-fallback` when Matter.js is unavailable. KEEP.
- **`src/components/ui/experiments/StaticExperimentMedia.tsx` / `InteractivePreviewMedia.tsx`** — poster → image → video fallback chain. KEEP.
- **`src/components/experiments/terminal-cat/useConsoleCat.ts:4`** — "Standard Cat (Fallback)" is a content default, not legacy. KEEP.
- **`src/lib/sentry.ts:24` (`isSentryEnabled`) and all `captureExperimentError` call sites** — no-DSN no-op is the documented design (AGENTS.md + `monitoring-sentry.mdc`). KEEP.
- **`src/components/ui/cursor/Context.tsx:28-48`** — inert `FALLBACK` cursor context when no provider. KEEP.
- **`src/setupTests.ts:36-37`** — `addListener`/`removeListener` `// deprecated` are part of the standard `matchMedia` jsdom mock shape, required by libraries that still call them. KEEP.
- **All `<Suspense fallback={null}>` / `fallback={<Skeleton/>}`** across experiment layouts and `r3f.tsx` — standard React. KEEP.
- **`src/app/robots.ts:39` "Fallback: allow all others"** and **`src/app/api/og/route.tsx:17` Google-Fonts woff fallback** — correct defaults. KEEP.
- **prefers-reduced-motion locks** (e.g. velocity-responsive-design lab-note) — accessibility, KEEP.

---

### Summary

- **Two High-confidence dead files**: superseded monolithic `GameOfLifeShader.tsx` and `BuggedOutGameOfLifeShaderExperiment.tsx` — both replaced by split `GradientBackground`/`LifeSimulation` architecture and imported nowhere (both `[LEGACY EXPERIMENT]`, confirm before deleting).
- **Half-removed theme toggle** is the biggest "dead path" by surface area: commented-out blocks in `SiteFooter.tsx` and a disabled `send-button/ThemeSwitch.tsx` shell — collapse to the real (no-toggle / static) state.
- **Dead modules/exports** worth pruning: `src/lib/story.ts` (+ unused `@fumadocs/story` dep), unused `toolkit/index.ts` + `toolkit/raf.ts` re-export pair (ask-first per AGENTS.md), and the unused `mergeRefs` helper.
- **knip's 12 `registry/*` "unused files" are false positives** — they're imported by the `(component-preview)`/`(mdx-preview)` routes; exclude them from any deletion.
- **No browser-compat/version-gated cruft, no `if(false)`, no polyfills, no `@deprecated`** — the remaining `fallback` hits are legitimate graceful degradation (Safari blur, video posters, Matter.js static, Sentry no-op) and should be kept.
