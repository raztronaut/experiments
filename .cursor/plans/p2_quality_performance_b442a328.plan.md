---
name: P2 Quality Performance
overview: Address 4 focused P2 items from the V2 Comprehensive Review -- runtime schema validation, filesystem caching + async alignment, optimizePackageImports expansion, and the ExperimentDrawerList perpetual rAF loop.
todos:
  - id: schema-validation
    content: Add validateExperiment() in experiments.ts, replace unsafe `as Experiment` cast
    status: completed
  - id: cache-async
    content: Wrap getExperiments/getArticles/getArticleContent with React.cache(), convert articles.ts sync -> async fs, update 4 callers
    status: completed
  - id: optimize-imports
    content: Expand optimizePackageImports in next.config.ts (motion, @react-three/drei, @codesandbox/sandpack-react)
    status: completed
  - id: drawer-raf
    content: Gate ExperimentDrawerList rAF loop on viewMode=list + isVisible, add convergence stop
    status: completed
isProject: false
---

# P2: Quality and Performance Remediation

Based on [V2 Comprehensive Review](/.cursor/plans/v2_comprehensive_review_9100ae49.plan.md) sections 5A, 6, and 11 (P2), plus [STATUS.md](/.agent/STATUS.md) and [running-findings.md](/.agent/running-findings.md).

Cross-referenced against Vercel's [React Best Practices](/.agents/skills/vercel-react-best-practices/SKILL.md) (58 rules, 8 categories) and [Next.js Best Practices](/.cursor/skills/next-best-practices/SKILL.md). Key applicable rules: `server-cache-react`, `bundle-barrel-imports` (CRITICAL), `rerender-use-ref-transient-values`, `rerender-move-effect-to-event`, `client-passive-event-listeners`.

P0 and P1 are complete. P2 originally had 6 items; items 5-6 (plopfile timestamp, delete-article publishable) were resolved during P1. Two additional items are **acknowledged and deferred** (documented in STATUS.md and the comprehensive review, not in scope here):

- **Cursor.tsx `getCursorColor` perf bug** (Section 3E) -- acknowledged, deferred
- **Enable `useExhaustiveDependencies` in Biome** (Section 5D) -- acknowledged, deferred (~90 hook-using files across 18 isolated experiments makes this a wide-blast-radius change)

This plan covers the 4 remaining actionable items.

---

## Architecture Context

The app has no shared root layout. Two isolated layout trees exist:

- `**(main)` route group**: Homepage (`/`) with `ExperimentDrawerList`, plus error boundary. Uses ISR (`revalidate = 3600`). Renders inside `CursorProvider` + `ThemeProvider`.
- **18 experiment route groups**: Each under `src/app/experiments/(<name>)/` with its own `<html>`/`<body>`. Fully isolated -- no cross-experiment imports, no shared state.

Data layer functions and their callers:


| Function              | Callers                                                                                                                                                                     | Rendering Mode                                                                 |
| --------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------ |
| `getExperiments()`    | `[(main)/page.tsx](src/app/(main)`/page.tsx) (ISR), `[sitemap.ts](src/app/sitemap.ts)` (static), `[api/experiments/route.ts](src/app/api/experiments/route.ts)` (on-demand) | All server-side, all async                                                     |
| `getArticles()`       | `[sitemap.ts](src/app/sitemap.ts)`, `[feed.xml/route.ts](src/app/feed.xml/route.ts)`, 2 article `page.tsx` files                                                            | All server-side; sitemap/feed already async, article pages currently sync RSCs |
| `getArticleContent()` | 2 article `page.tsx` files                                                                                                                                                  | Server-side, currently sync RSCs                                               |


No client component calls any data function. React 19.2.3 (`cache` supported).

---

## Item 1: Runtime Schema Validation in `getExperiments()`

**Problem**: [src/lib/experiments.ts](src/lib/experiments.ts) line 83 casts raw JSON with `as Experiment` -- no runtime checks. The `validate-experiments.mjs` script catches this at build/CI time, but a malformed JSON that sneaks past would silently produce bad data at runtime.

**Approach**: Manual validation function (no new dependency -- Zod would be overkill for 6 field checks on a 18-experiment codebase).

- Add `validateExperiment(raw: unknown): Experiment | null` in `experiments.ts`:
  - Required strings: `title`, `description`, `slug`, `created`
  - Optional enum checks: `status` against `ExperimentStatus`, `profile` against `ExperimentProfile`, `complexity` against `ExperimentComplexity` (reuse the existing type unions as const arrays for runtime checking)
  - Return `null` + `console.warn` on failure (matches existing error pattern on line 85)
- Replace `as Experiment` cast (line 83) with `validateExperiment({ ...config, href, poster })`
- Keep `as` casts for `ExperimentProfile`, `ExperimentStatus`, `ExperimentComplexity` type unions but only after validation confirms the value is valid

**Files changed**: `src/lib/experiments.ts` only.

---

## Item 2: Filesystem Caching + Async Alignment

**Problem**: Both data functions do full filesystem scans per call with no deduplication. `articles.ts` uses blocking sync I/O (`fs.readdirSync`, `fs.readFileSync`) while `experiments.ts` uses async `fs/promises` -- inconsistent and the sync calls block the event loop in route handlers.

### 2a. Convert `articles.ts` from sync to async

[src/lib/articles.ts](src/lib/articles.ts) currently uses:

- `fs.readdirSync` (lines 21, 31-33)
- `fs.readFileSync` (line 48, 105)
- `fs.existsSync` (lines 43, 99)

Convert to `fs/promises` equivalents. For `existsSync`, use `fs.access` with try/catch (there is no `existsAsync` in Node).

**Callers that need updating** (4 files, all server-side):


| File                                                                                                                                    | Current call                                                                               | Change needed                                                                         |
| --------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------- |
| `[sitemap.ts](src/app/sitemap.ts)` L8                                                                                                   | `const articles = getArticles()`                                                           | Add `await`                                                                           |
| `[feed.xml/route.ts](src/app/feed.xml/route.ts)` L5                                                                                     | `const articles = getArticles()`                                                           | Add `await`                                                                           |
| `[send-button/article/page.tsx](src/app/experiments/(send-button)`/send-button/article/page.tsx)                                        | Sync `ArticlePage()` calls `getAdjacentArticles()` (sync helper) and `getArticleContent()` | Make `getAdjacentArticles` async, make `ArticlePage` async, add `await` to both calls |
| `[basketball-replay-center/article/page.tsx](src/app/experiments/(basketball-replay-center)`/basketball-replay-center/article/page.tsx) | Same pattern                                                                               | Same changes                                                                          |


Next.js RSCs fully support async default exports, so making `ArticlePage` async is safe.

### 2b. Wrap with `React.cache()`

Per Vercel's `server-cache-react` rule: "Use `React.cache()` for server-side request deduplication. File system operations benefit most." This is the idiomatic React 19 pattern for server data functions.

After the async conversion, wrap the exported functions:

```typescript
import { cache } from "react";

export const getArticles = cache(async (): Promise<Article[]> => { ... });
export const getArticleContent = cache(async (slug: string): Promise<ArticleContent | null> => { ... });
```

Same for `getExperiments` in `experiments.ts`.

`**Object.is` caveat for `getExperiments(filter?)**`: `React.cache()` uses shallow equality (`Object.is`) for argument comparison. Inline object arguments like `getExperiments({ status: ["shipped"] })` would always miss cache. This is fine today -- all 3 callers pass `undefined` (no filter), which IS a stable primitive. `getArticles()` takes no args and `getArticleContent(slug)` takes a string, so both are ideal for `React.cache()`. Document the caveat in a code comment for future callers.

**LRU cross-request caching not needed**: Per Vercel's `server-cache-lru` rule, LRU is for data shared across sequential requests. ISR (`revalidate = 3600`) on the homepage and `Cache-Control: s-maxage=3600` on the feed already handle cross-request caching. The `/api/experiments` route handler has no caching headers -- consider adding `Cache-Control` if it becomes a hot path (not in scope here).

**Honest note on immediate benefit**: No single route currently calls the same function more than once, so `React.cache()` won't deduplicate anything today. But it's zero-cost, future-proofs against duplicate calls, and Vercel lists it as essential for "any non-fetch async work" including filesystem operations.

**Also update the Plop template**: `[plop-templates/article/page.tsx.hbs](plop-templates/article/page.tsx.hbs)` uses the same `getAdjacentArticles` + `getArticleContent` pattern -- update it to match the async version.

**Files changed**: `src/lib/articles.ts`, `src/lib/experiments.ts`, `src/app/sitemap.ts`, `src/app/feed.xml/route.ts`, 2 article `page.tsx` files, 1 Plop template.

---

## Item 3: Expand `optimizePackageImports`

**Problem**: [next.config.ts](next.config.ts) line 20 only lists `"lucide-react"`. Three other barrel-export-heavy packages are used across the codebase.

Vercel's `bundle-barrel-imports` rule rates this **CRITICAL** impact: "Popular icon and component libraries can have up to 10,000 re-exports in their entry file. For many React packages, it takes 200-800ms just to import them." The rule specifically recommends `optimizePackageImports` as the ergonomic solution (keeps clean `import { X } from 'lib'` syntax, auto-transforms to direct imports at build time). Measured impact: **15-70% faster dev boot, 28% faster builds, 40% faster cold starts**.

**Approach**: Add to `optimizePackageImports`:

- `"motion"` -- 22 files import from `motion/react` (8 shared UI + 14 experiment components). Large barrel export. Biggest win.
- `"@react-three/drei"` -- 6 files (5 experiment components + 1 toolkit). Huge package (~200+ exports), benefits significantly from tree-shaking at import level.
- `"@codesandbox/sandpack-react"` -- 1 file (`SandpackDemo.tsx`), but the package is very large. Worth including.

**Single-line change**:

```typescript
optimizePackageImports: ["lucide-react", "motion", "@react-three/drei", "@codesandbox/sandpack-react"],
```

Since experiments are isolated route groups, each experiment only bundles its own imports. `optimizePackageImports` ensures that even barrel imports like `import { AnimatePresence, motion } from "motion/react"` only pull in the used exports, not the entire package entry point. This benefits every experiment independently.

**Files changed**: `next.config.ts` only.

---

## Item 4: Fix ExperimentDrawerList Perpetual rAF Loop

**Problem**: In [src/components/ui/ExperimentDrawerList.tsx](src/components/ui/ExperimentDrawerList.tsx) lines 86-127, a `requestAnimationFrame` loop starts on mount and never stops. This component is rendered **only** on the homepage (`(main)/page.tsx`). The default `viewMode` is `"grid"` (line 52), where the floating preview is completely hidden. Even in list mode, the loop runs when nothing is hovered (`opacity: 0`, `pointer-events-none`). Every visitor pays ~60fps of lerp computation for a feature that's invisible most of the time.

Several Vercel best practices apply here:

- `rerender-move-effect-to-event`: "If a side effect is triggered by a specific user action, run it in that event handler. Do not model the action as state + effect." The rAF loop should be mouse-event-driven, not always-on from mount.
- `rerender-use-ref-transient-values`: The component already correctly uses refs (`mousePositionRef`, `smoothPositionRef`, `previewRef`) for transient animation values -- this is the right pattern. The issue is only that the loop lifecycle is uncontrolled.
- `client-passive-event-listeners`: The scroll listener already uses `{ passive: true }` (line 97) -- correct.

**Approach**: Gate the rAF loop lifecycle on actual need.

- Change the `useEffect` (lines 86-127) to depend on `viewMode` and `isVisible`
- Only start the rAF loop when `viewMode === "list"` AND `isVisible === true`
- On cleanup (or when conditions become false), cancel the loop
- Add convergence detection: when `Math.abs(target - current) < 0.5` on both axes, stop the loop. Restart on next `mousemove` by kicking off a new rAF from the `handleMouseMove` handler (event-driven, per `rerender-move-effect-to-event`)
- The `resize`/`scroll` listeners for `listOriginRef` only matter when the loop is active -- co-locate them in the same conditional effect

This means:

- Grid mode visitors (the default): **zero rAF work**
- List mode, no hover: **zero rAF work**
- List mode, actively hovering: rAF runs, stops when lerp converges after mouse stops
- List mode, mouse leaves: cleanup cancels rAF
- Mouse moves again after convergence: `handleMouseMove` kicks rAF back (event-driven restart, no polling)

**Files changed**: `src/components/ui/ExperimentDrawerList.tsx` only.

---

## Verification

After all changes:

- `npm run typecheck` -- must pass
- `npx ultracite check` -- 0 errors
- `node scripts/validate-experiments.mjs` -- 18 experiments valid
- `npm run build` -- success, all routes present (2 article routes, sitemap, feed)
- Spot-check: homepage grid mode (no rAF), list mode hover preview (smooth lerp), article pages load correctly (async data)

---

## Sequencing

1. **Item 3** (optimizePackageImports) -- single-line config change, zero risk, do first
2. **Item 1** (schema validation) -- self-contained in `experiments.ts`
3. **Item 4** (drawer rAF) -- self-contained in `ExperimentDrawerList.tsx`
4. **Item 2** (cache + async) -- widest change surface (7 files), do last so all other changes are stable

---

## Deferred Items (Documented)

These are acknowledged in the comprehensive review and STATUS.md, explicitly deferred:

- **Cursor.tsx `getCursorColor` perf bug** (comprehensive review 3E): `getCursorColor` recreated every render, causes useEffect churn. Fix is to hoist outside component. Deferred -- low user impact (cursor is a subtle background element).
- **Enable `useExhaustiveDependencies`** (comprehensive review 5D): ~90 hook-using files across 18 isolated experiments. High blast radius, many intentional empty-dep patterns in animation/WebGL code. Requires per-experiment audit. Deferred to a dedicated pass.
- **Biome a11y rules** (comprehensive review 5D): 7 a11y rules disabled. Creative experiments intentionally use non-standard interaction patterns. Needs per-experiment assessment. Deferred.
- `**noExplicitAny` / `noUnusedVariables`** (comprehensive review 5D): Disabled in biome.jsonc. Enabling would surface violations across legacy experiments. Deferred to a linting tightening pass.

