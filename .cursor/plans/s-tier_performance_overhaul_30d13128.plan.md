---
name: S-Tier Performance Overhaul
overview: Comprehensive performance, stability, and responsiveness improvements across the entire experiments platform -- from the wave background and cursor system to experiment navigation, article loading, asset delivery, and bundle optimization. Coordinated with the V2 Platform Audit and Introducing V2 Experiment plans.
todos:
  - id: waves-perf
    content: "P0: Waves component -- IntersectionObserver pause when off-screen, debounce resize, Canvas2D migration (same visual), fix ThemeAwareWaves key={theme} remount, respect prefers-reduced-motion"
    status: completed
  - id: scroll-bugs
    content: "P0: Fix createUnifiedScroll bugs -- scoped ScrollTrigger cleanup, reference-counted GSAP takeover"
    status: completed
  - id: leva-strategy
    content: "P0: Leva bundle strategy -- useDevControls wrapper (dead-code-eliminates by default, opt-in for showcase experiments like kinetic-typography-scroll)"
    status: completed
  - id: cursor-perf
    content: "P1: Cursor system -- dynamic GSAP import (touch-device gate), idle RAF timeout, narrow MutationObserver scope. Preserve snapping, parallax, border-radius matching, exit delay"
    status: completed
  - id: video-preload
    content: "P1: Change all video preload='auto' to preload='none', load on interaction only, shared IntersectionObserver"
    status: completed
  - id: suspense-boundaries
    content: "P1: Add Suspense boundaries on homepage (ExperimentDrawerList, WritingSection) and article pages (MDXRemote)"
    status: completed
  - id: parallel-fetches
    content: "P1: Parallelize all sequential data fetches with Promise.all (homepage, articles, getArticles internals)"
    status: completed
  - id: asset-compression
    content: "P2: Compress massive assets -- preview videos under 2MB, WebP/AVIF for images, compress 30MB JPEG, convert frame sequences to video"
    status: cancelled
  - id: css-cleanup
    content: "P2: Fix CSS perf -- scope text-rendering/text-wrap to prose, remove scroll-behavior conflict, add content-visibility for experiment list"
    status: completed
  - id: font-loading
    content: "P2: Add display:'swap' to local fonts, delete 6 unused Google font imports, convert Replica to WOFF2"
    status: completed
  - id: experiment-nav-cls
    content: "P2: Fix ExperimentNav layout shift -- render on server, hide in iframes via CSS"
    status: completed
  - id: experiment-list
    content: "P2: Experiment list -- router.push not window.location, lazy InteractivePreviewMedia, content-visibility:auto for off-screen cards"
    status: completed
  - id: mdx-images
    content: "P2: Replace plain <img> in MDX components with next/image or add lazy loading + dimensions"
    status: completed
  - id: grain-overlay
    content: "P2: Replace grain.gif with CSS feTurbulence SVG filter"
    status: completed
  - id: location-status
    content: "P2: Reduce LocationStatus layout animations from 10+ to minimal, remove infinite opacity loops on dots"
    status: completed
  - id: nextconfig
    content: "P3: Next.js config -- next experimental-analyze, leva to optimizePackageImports, AVIF format, Cache-Control headers, ISR on API route"
    status: completed
  - id: toolkit-safety
    content: "P3: Toolkit barrel -- guard R3F re-export to prevent accidental bundling in non-3D experiments (keep ExperimentCanvas, it's awaiting consumers)"
    status: completed
  - id: dev-tools-polish
    content: "P3: Dev tools -- competing RAF to Tempus, gate R3F metrics behind ?debug, add .catch() to dynamic imports, narrow dev barrel exports"
    status: completed
isProject: false
---

# S-Tier Performance & Stability Overhaul

## Cross-Plan Coordination

This plan is aware of and coordinated with two active plans:

- **V2 Platform Audit** -- identifies code quality issues in kinetic-typography-scroll and template-level problems. Several fixes overlap (leva production guard, static GSAP imports, FOUC prevention).
- **Introducing V2 Experiment** -- transforms kinetic-typography-scroll into a showcase with intentional production debug tools (`?debug` leva, GSDevTools). Leva is **deliberately in production** for this experiment so visitors can try the debug tools. Static GSAP imports are also intentionally kept for this experiment (used in every section).

**Key constraints from those plans:**

- `ExperimentCanvas` in the toolkit barrel is NOT dead code -- it's V2 infrastructure awaiting consumers from upcoming experiments and templates
- Leva in production is intentional for the kinetic-typography-scroll showcase; the wrapper must support opt-in production mode
- DevToolsInjector needs to support both modes: tree-shaken for normal experiments, available in production for showcase experiments
- Legacy experiments (18 total, `legacy: true`) are untouchable -- no modifications

---

## Findings Summary

The audit identified **50+ issues** across 6 categories, cross-referenced against the Vercel React Best Practices (57 rules) and Next.js Best Practices skills. The most impactful: the Waves background burns ~70K trig operations per frame even when off-screen, the cursor system runs GSAP ticker continuously even when idle, videos eagerly preload hundreds of MB, and there are zero Suspense boundaries for streaming SSR.

---

## P0: Critical Performance Bugs

### 1. Waves Background -- The #1 CPU Bottleneck

`[src/components/ui/wave-background.tsx](src/components/ui/wave-background.tsx)`

The `Waves` component runs a continuous RAF loop computing ~~17,500 points with `noise()` + `cos` + `sin` + `hypot` per point per frame (~~70K trig ops/frame), then string-concatenates and sets `setAttribute("d", ...)` on ~265 SVG `<path>` elements every frame. It runs even when scrolled off-screen, with no visibility check and no resize debounce.

**Constraint: the visual appearance and fluid cursor interaction must remain identical.** The mouse-reactive wave distortion is a signature element. The global `mousemove` listener is necessary for the cursor interaction effect -- but should only be active when the component is visible.

**Fixes (preserve visual fidelity):**

- Add `IntersectionObserver` to **pause the RAF loop** when the wave container is not visible (the single highest-impact fix -- eliminates all CPU cost when scrolled past hero)
- **Debounce the resize handler** (150-200ms) -- currently every pixel of resize triggers full grid recalculation and DOM recreation
- **Migrate from SVG to Canvas2D** -- replace per-frame `setAttribute("d", ...)` string building on ~265 `<path>` elements with a single `<canvas>` drawing the same curves. Canvas2D is 5-10x faster for this pattern. The visual output is identical (same noise function, same point positions, same line smoothing). Per Vercel's `rendering-animate-svg-wrapper` rule: animating SVG attributes directly is a known anti-pattern.
- **Scope the `mousemove` listener** -- only attach when the component is visible (tied to the IntersectionObserver). This keeps the fluid cursor interaction when viewing the hero but eliminates the listener cost when scrolled away.
- Respect `prefers-reduced-motion` -- show a static wave state (single frame) rather than continuous animation
- The noise library (`simplex-noise`) import becomes naturally code-split when/if Waves is lazy-loaded

**ThemeAwareWaves fix** (`[src/components/ui/ThemeAwareWaves.tsx](src/components/ui/ThemeAwareWaves.tsx)`): the `key={resolvedTheme}` prop fully unmounts/remounts the entire Waves component on theme change -- destroying all paths, canceling the RAF loop, then recreating everything from scratch. The Waves component already has a `useEffect` that can update stroke colors. Fix: pass theme colors as props and update in the existing loop, removing the `key` prop.

### 2. Toolkit `createUnifiedScroll` -- Global State Bugs

`[src/lib/toolkit/scroll.ts](src/lib/toolkit/scroll.ts)`

Two bugs:

- `**destroy()` kills ALL ScrollTriggers globally** (line 54: `ScrollTrigger.getAll().forEach(t => t.kill())`). Should only kill triggers created by the owning component. This would break any experiment with multiple independent scroll sections.
- **Singleton GSAP takeover breaks with concurrent instances**. Module-level `gsapTakenOver` boolean means if a second `createUnifiedScroll()` is called, then the first's `destroy()` tears down the shared GSAP-Tempus binding while the second is still using it. Fix with reference counting or a single shared instance pattern.

### 3. Leva Bundle Strategy

`[src/components/experiments/kinetic-typography-scroll/KineticTypographyScroll.tsx](src/components/experiments/kinetic-typography-scroll/KineticTypographyScroll.tsx)` line 6

`import { useControls } from "leva"` ships ~45KB gzipped of leva runtime into the production experiment bundle. For the **kinetic-typography-scroll showcase experiment**, this is **intentional** (the "Try the Debug Tools" section deliberately exposes leva in production). But for all other experiments, this is pure waste.

**Fix:** Create a `useDevControls` wrapper with two modes:

```typescript
// src/hooks/useDevControls.ts
// Default: dead-code-eliminates leva in production (returns static defaults)
// Showcase mode: keeps leva in production (for experiments that expose debug tools)

export function useDevControls<T extends Record<string, { value: unknown }>>(
  folder: string,
  schema: T,
  options?: { production?: boolean }
): { [K in keyof T]: T[K]["value"] } {
  const keepInProd = options?.production === true;
  if (process.env.NODE_ENV !== "development" && !keepInProd) {
    // Static defaults -- leva is tree-shaken from the bundle
    return Object.fromEntries(
      Object.entries(schema).map(([k, v]) => [k, v.value])
    ) as any;
  }
  // Dynamic import to avoid SSR issues
  const { useControls } = require("leva");
  return useControls(folder, schema);
}
```

- Normal experiments: `useDevControls("Scroll", { ... })` -- leva tree-shaken in production
- Showcase experiments: `useDevControls("Scroll", { ... }, { production: true })` -- leva kept
- Also add `"leva"` to `optimizePackageImports` in `next.config.ts` for better tree-shaking

---

## P1: High-Impact Performance Issues

### 4. Cursor System -- Careful Optimization

`[src/components/ui/cursor/Cursor.tsx](src/components/ui/cursor/Cursor.tsx)`, `[Provider.tsx](src/components/ui/cursor/Provider.tsx)`, `[WithHover.tsx](src/components/ui/cursor/WithHover.tsx)`

**Constraint: the cursor's snap-to-element behavior, parallax tracking, border-radius matching, entering/shifting/entered/exiting state machine, and 150ms exit delay must all be preserved exactly.** The shape tween (width, height, borderRadius, backgroundColor, border) intentionally uses non-compositable properties because it needs exact pixel matching with the target element's dimensions -- `transform: scale()` would not work for this morphing effect. The position tween already uses `transform` (GPU-compositable).

**Safe optimizations (preserve all behavior):**

- **Dynamic GSAP import gated on touch device detection.** GSAP (~27KB gzipped) is imported eagerly via `Cursor.tsx` for ALL pages including mobile where the cursor never renders. The inline `<script>` in the root layout already detects touch devices. Use that signal to conditionally import GSAP:

```typescript
// Only import GSAP when we know we need the custom cursor
const gsapPromise = typeof window !== 'undefined' && 
  document.documentElement.dataset.cursorHidden === 'true'
    ? import('gsap').then(m => m.gsap)
    : Promise.resolve(null);
```

- **Idle RAF timeout.** The `gsap.ticker.add(updateCursor)` runs at 60fps continuously even when the mouse hasn't moved and no element is snapped. Add an idle detection: after 100ms of no `mousemove` events AND no snapped element, remove the ticker callback. Re-add on next `mousemove`. The ticker IS needed while an element is snapped (the element may move due to scroll/resize, and `getBoundingClientRect` must track it).
- **Narrow MutationObserver scope in Provider.tsx.** The observer watches `document.head` (childList + subtree) and `document.body` (attributes). In Next.js, `<head>` changes frequently (script injection, style updates, route changes). Narrow the observer to only watch the specific `data-cursor-hidden` attribute on `document.documentElement` and the `cursor-none-style` element existence, rather than all head mutations. Or debounce the callback (50ms).
- **Hoist default config in WithHover.** `config = { hoverOffset: 3 }` creates a new object on every render, defeating the `useCallback` dependency. Hoist to a module-level constant. (Per Vercel's `rerender-memo-with-default-value` rule.)
- `**getComputedStyle` in WithHover is acceptable** -- it only fires on `mouseEnter` (discrete events), not on every frame. This is needed to capture the target element's `borderRadius` and `fontSize` for the cursor morph.

### 5. Video Preloading -- Bandwidth Saturation

`[src/components/ui/experiments/StaticExperimentMedia.tsx](src/components/ui/experiments/StaticExperimentMedia.tsx)` line 106, `[InteractivePreviewMedia.tsx](src/components/ui/experiments/InteractivePreviewMedia.tsx)` line 107

Both components use `preload="auto"` on `<video>` elements. With the experiment grid showing 10+ cards, the browser eagerly downloads hundreds of MB of video data, competing with fonts, CSS, JS, and images for bandwidth.

**Fix:** Change to `preload="none"`. Only begin loading video data when the user hovers/interacts. Consider consolidating per-card `IntersectionObserver`s into a single shared observer (currently 20+ individual observers).

### 6. No Suspense Boundaries Anywhere

`[src/app/(main)/page.tsx](src/app/(main)`/page.tsx)

The homepage fetches experiments and articles server-side but renders everything synchronously. No `<Suspense>` boundaries means no streaming SSR. Per Vercel's `async-suspense-boundaries` rule, this is a critical waterfall.

**Fix:** 

- Wrap `ExperimentDrawerList` and `WritingSection` in `<Suspense>` with skeleton fallbacks
- Parallelize `getExperiments()` and `getArticles()` with `Promise.all` (currently sequential, lines 26-27)
- Add `<Suspense>` around `<MDXRemote>` in article pages
- Consider `generateStaticParams` for article pages to pre-render at build time
- Note: `useDebug()` uses `useSearchParams()` which requires a Suspense boundary (per Next.js best practices skill). Currently only used in dev-only components behind dynamic imports, but worth noting.

### 7. Sequential Data Fetches (Waterfalls)

Per Vercel's `async-parallel` rule (CRITICAL priority, 2-10x improvement):

- **Homepage** (`[page.tsx](src/app/(main)`/page.tsx) lines 26-27): `getExperiments()` and `getArticles()` called sequentially. Use `Promise.all`.
- **Article pages**: `getArticleContent()` and `getAdjacentArticles()` called sequentially. Use `Promise.all`.
- `**getArticles()`** (`[src/lib/articles.ts](src/lib/articles.ts)` lines 30-73): Nested sequential `for...of` loops with `fs.readFile` per article. Parallelize inner operations.
- **API route** (`[src/app/api/experiments/route.ts](src/app/api/experiments/route.ts)`): No `revalidate` export -- re-scans filesystem on every request. Add ISR.

### 8. ExperimentNav Layout Shift

`[src/components/ui/ExperimentNav.tsx](src/components/ui/ExperimentNav.tsx)` lines 16-27

The nav renders `null` during SSR/hydration, then pops in after `useEffect` fires (`window.self === window.top` check). This causes a visible layout shift on every experiment page load. Per Vercel's `rendering-hydration-no-flicker` rule: use an inline script or CSS-only approach.

**Fix:** Render the nav on the server with a CSS class that hides it in iframe contexts. The iframe detection can be done server-side (check the request's `Sec-Fetch-Dest` header) or via CSS (though no pure CSS solution exists for iframe detection, the inline script in the layout could set a data attribute that CSS reads).

---

## P2: Medium-Impact Improvements

### 9. CSS Performance

`[src/app/experiments/experiments.css](src/app/experiments/experiments.css)`:

- `text-rendering: optimizelegibility` on `*` -- known to be slow on mobile. Scope to headings only.
- `text-wrap: pretty` on `*` -- expensive layout computation. Scope to `article` / prose content.
- `@apply border-border` on `*` -- unnecessary for elements without borders.
- `scroll-behavior: smooth` on `html` conflicts with Lenis (immediately overridden with `!important` when Lenis activates). Remove native smooth scroll; let Lenis handle it entirely.
- Duplicate Tailwind entry points between `globals.css` and `experiments.css` -- both emit the full framework CSS. Users navigating between homepage and experiments load two separate copies.

### 10. Font Loading

`[src/lib/fonts.ts](src/lib/fonts.ts)`:

- Neither `testDieGrotesk` nor `replica` specifies `display: "swap"`. Next.js defaults to `font-display: optional`, which risks invisible text (FOIT) on slow connections. Add `display: "swap"` for guaranteed text visibility.
- **6 unused Google font imports** (`_inter`, `_robotoMono`, `_playfair`, `_fraunces`, `_outfit`, `_plusJakarta`) -- even with `_` prefix, `next/font/google` may generate unused `@font-face` rules at build time. Delete them.
- `replica` uses OTF format instead of WOFF2 (uncompressed transfer).

### 11. LocationStatus Animation Overhead

`[src/components/ui/LocationStatus.tsx](src/components/ui/LocationStatus.tsx)`:

- **10+ elements with `layout` prop** from Motion. Each triggers `getBoundingClientRect()` on all layout-animated siblings. Per Vercel's `js-batch-dom-css` rule, batch these reads.
- Three infinite `animate={{ opacity }}` loops for decorative dots, running forever. Replace with CSS `@keyframes` (no JS overhead).

### 12. Experiment List Optimizations

`[src/components/ui/ExperimentDrawerList.tsx](src/components/ui/ExperimentDrawerList.tsx)`:

- `handleOpenFullPage` uses `window.location.href` (line 236) instead of `router.push()`, causing full hard navigation
- `InteractivePreviewMedia` eagerly imported even when in grid mode (unused). Use `next/dynamic`.
- Per Vercel's `rendering-content-visibility` rule: add `content-visibility: auto` + `contain-intrinsic-size` to off-screen experiment cards for CSS-level virtualization (much simpler than full virtualization library, nearly as effective for ~20 items)
- Inline arrow function closures per list item defeat `React.memo`. Per Vercel's `rerender-functional-setstate` / `rerender-memo-with-default-value` rules: hoist handlers or use `data-`* attributes with a single handler.
- Scroll listener without throttle (line 139)

### 13. Grain Overlay GIF

`[src/components/ui/GrainOverlay.tsx](src/components/ui/GrainOverlay.tsx)` uses a 76KB `grain.gif` as a CSS background that loops continuously, keeping the browser's image decoder active permanently. Replace with a CSS `feTurbulence` SVG filter or a tiny static noise PNG tile (no animation needed for grain).

### 14. MDX Images

`[src/components/mdx/components.tsx](src/components/mdx/components.tsx)` line 91-93: MDX `<img>` renders plain HTML images with no `next/image`, no `srcset`, no lazy loading, no `width`/`height` (CLS risk), no format conversion. Per Next.js best practices: always use `next/image` over `<img>`.

### 15. Massive Static Assets

`public/experiments/` is **195 MB total**. Key offenders:

- `basketball-replay-center/preview.mp4`: **30 MB** 
- `cursor-depth-explorer/wandererabovethesea.jpeg`: **30 MB**
- `mountain-transition/*.png`: **40+ MB** (five 7-9 MB PNGs)
- `rabbithole-chat-preloader/frames/`: **21 MB** (20 JPEGs that should be a video)

Note: these are all legacy experiment assets. Per project constraints, legacy experiments are untouchable code-wise, but their static assets CAN be re-compressed (the components reference file paths, not specific byte sizes). Compress preview videos to under 2 MB each (H.264 CRF 28-32, 720p max). Convert large PNGs to WebP. Compress the 30 MB JPEG.

---

## P3: Lower Priority / DX Improvements

### 16. Toolkit Barrel Safety

`[src/lib/toolkit/index.ts](src/lib/toolkit/index.ts)` re-exports `ExperimentCanvas` which statically imports `@react-three/fiber` and `@react-three/drei`. `**ExperimentCanvas` is NOT dead code** -- it's V2 infrastructure awaiting consumers from upcoming R3F experiments. However, the barrel re-export is a tree-shaking risk: any import from `@/lib/toolkit` could pull R3F into non-3D experiments if the bundler doesn't perfectly tree-shake the `"use client"` module.

**Fix:** Add a separate entry point (`@/lib/toolkit/r3f`) for R3F exports, or use `export type` for the barrel and direct imports for value consumers.

### 17. Dev Tools Polish

- `[ExperimentDevMetrics.tsx](src/components/dev/ExperimentDevMetrics.tsx)` runs its own `requestAnimationFrame` loop separate from Tempus. Use `Tempus.add()` instead.
- `[R3FDevTools.tsx](src/components/dev/R3FDevTools.tsx)`: `R3FMetricsPiper` and `R3FSceneInspector` run unconditionally in dev. Gate behind `?debug` to reduce constant overhead.
- Manual lazy loading in `R3FDevTools` (PerfPanelLazy, DebugCameraLazy) has no `.catch()` -- silent failure on import error.
- `[src/components/dev/index.ts](src/components/dev/index.ts)` exports raw dev components (`ExperimentDevMetrics`, `R3FSceneInspector`) without production guards. Narrow to only export the injector wrappers.

### 18. Next.js Config Improvements

`[next.config.ts](next.config.ts)`:

- Use `**next experimental-analyze`** (built into Next.js 16.1+) to verify tree-shaking. No need for `@next/bundle-analyzer` package.
- Add `"leva"` to `optimizePackageImports`
- Add `images: { formats: ["image/avif", "image/webp"] }` for modern format output
- Add `Cache-Control` headers for static assets: `public, max-age=31536000, immutable` for `/experiments/:path*.(mp4|webm|png|jpg|jpeg|webp|gif|avif)`
- Consider `Umami` analytics script strategy change from `afterInteractive` to `lazyOnload`

### 19. View Transitions Incomplete

Experiment layouts set `view-transition-name` on `body` and both CSS files enable `@view-transition { navigation: auto; }`, but there are no `::view-transition-old` / `::view-transition-new` pseudo-element rules to customize the transition. Currently only the default crossfade fires. Since experiments render their own `<html>` trees, these are cross-document MPA transitions that need paired names on both ends.

### 20. Miscellaneous

- `public/og-image.png` is 926 KB. Compress to ~50-100 KB as JPEG.
- `[constants.ts](src/components/ui/experiments/constants.ts)` inlines a ~4KB base64-encoded PNG as a JS string. Move to `/public`.
- `ConsoleEasterEgg` in root layout loads on every page. Lazy-load or restrict to homepage.

---

## Implementation Phases

**Phase 1 -- Critical Path (immediate, highest ROI):**
Waves IntersectionObserver + Canvas2D migration, video `preload="none"`, Suspense boundaries, `Promise.all` for data fetches, leva `useDevControls` wrapper

**Phase 2 -- Cursor & Navigation:**
Cursor dynamic GSAP import + idle RAF, ExperimentNav layout shift fix, `router.push` for experiment navigation, MutationObserver narrowing

**Phase 3 -- Assets & Delivery:**
Video compression, image format conversion, font loading strategy, static asset cache headers, CSS performance fixes

**Phase 4 -- Polish & DX:**
LocationStatus animation reduction, grain overlay, dev tools polish, toolkit barrel safety, `next experimental-analyze`, view transition wiring