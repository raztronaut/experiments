---
name: Performance Overhaul Review
overview: Comprehensive review of all changes made during the S-Tier Performance Overhaul, identifying bugs, regressions, and required agent doc updates.
todos:
  - id: fix-grain
    content: Revert GrainOverlay to original GIF approach -- feTurbulence on empty div produces no visible output
    status: completed
  - id: update-toolkit-docs
    content: "Update toolkit.md: barrel no longer exports ExperimentCanvas, destroy() is reference-counted, R3F dev tools gated behind ?debug, document useDevControls hook"
    status: completed
isProject: false
---

# Performance Overhaul: Review Findings

## Confirmed Bugs

### 1. GrainOverlay is broken (user-reported)

`[src/components/ui/GrainOverlay.tsx](src/components/ui/GrainOverlay.tsx)`

The SVG `feTurbulence` filter replacement does not visually match the original grain GIF. The `feTurbulence` filter produces a static procedural noise pattern that fills the entire div, but it renders as a **colored noise** (not the subtle film grain of the original GIF). The original `grain.gif` was a looping animated texture with a specific film-grain aesthetic at very low opacity. The `feTurbulence` approach creates a visually different effect that may look like a solid noisy block rather than subtle grain, and the `mix-blend-multiply` does not interact the same way with the generated noise.

**Fix:** Revert to the original GIF approach. The 76KB GIF at `opacity: 0.02`/`0.07` is not a meaningful performance bottleneck -- the real concern was the continuous decoder loop, but at those opacity levels the visual impact of switching to a static PNG tile or keeping the GIF is negligible on performance. If the grain effect is invisible after this change, the `feTurbulence` filter is likely being applied to an empty div that has no content to filter.

The core issue: `feTurbulence` generates noise *as the content of the filter*, but the div it's applied to is empty. CSS `filter` processes the rendered content of the element. An empty div with `filter: url(#grain-filter)` renders as... an empty div with a filter on nothing. The original used `background-image` on the div, which gave it actual pixel content to display.

**Correct fix:** Either revert to the GIF, or use the SVG filter as a `background` instead:

```tsx
// Option A: Revert to GIF (simplest, confirmed working)
<div className={cn(
  "pointer-events-none absolute inset-0 z-[-1] select-none",
  "bg-[url('/grain.gif')]",
  "opacity-[0.02] dark:opacity-[0.07]",
  "mix-blend-multiply",
  className
)} />

// Option B: Use feTurbulence as background via inline SVG data URL
// (complex, not worth it for 76KB savings)
```

### 2. Waves Canvas2D -- first point excludes cursor force

`[src/components/ui/wave-background.tsx](src/components/ui/wave-background.tsx)` line 210-213

In `drawLines()`, the first point of each line is drawn WITHOUT cursor force:

```
ctx.moveTo(
  (first.x + first.wave.x) * dpr,
  (first.y + first.wave.y) * dpr,
);
```

But in the original SVG version, the first point also excluded cursor force (line 242 in original: `moved(points[0], false)`). So this is actually **correct** -- it matches the original behavior. No issue here.

### 3. Cursor dynamic import -- pressing effect may fire before GSAP loads

`[src/components/ui/cursor/Cursor.tsx](src/components/ui/cursor/Cursor.tsx)` lines 169-178

The pressing effect (`useEffect` for scale animation) fires on `pressing` state changes, but checks `gsapRef.current` which is `null` until the dynamic import resolves. If the user clicks before GSAP has loaded (unlikely but possible on slow connections), the effect silently returns early -- no crash, but also no visual feedback. This is acceptable degradation; the cursor itself isn't visible until GSAP loads anyway.

**Verdict: acceptable, no fix needed.**

### 4. Cursor idle timeout -- ticker stops but element is still snapped via context

The idle timeout at line 136-142 checks `stateRef.current.selectedElement.el !== null` before stopping the ticker. If the user moves the mouse over a button (snapping the cursor) and then stops moving, the element IS snapped, so the ticker stays active. This is correct -- the ticker needs to keep running while snapped because the element might move (scroll, resize). 

But there's a subtlety: when the user moves the mouse away from the element, `handleMouseLeave` fires `removeSelectedElement()` which sets a 150ms timeout before clearing `selectedElement.el`. During that 150ms, the idle check sees `el !== null` and keeps the ticker active, which is correct (the exiting animation needs to play).

**Verdict: correct behavior, no fix needed.**

### 5. `createUnifiedScroll` -- ScrollTrigger.create patching is global

`[src/lib/toolkit/scroll.ts](src/lib/toolkit/scroll.ts)` lines 52-62

The approach patches `ScrollTrigger.create` at the module level to track triggers created by this instance. However, if two `createUnifiedScroll()` instances are created, the second overwrites the first's patch of `ScrollTrigger.create`. Triggers created between the second call and the first's `destroy()` will be tracked by the second instance's `ownTriggers` set, not the first's.

This is a **known limitation** but unlikely to cause issues in practice since:

- Each experiment is isolated in its own `<html>` document
- Multiple `createUnifiedScroll` instances in the same document is an edge case
- The reference counting for GSAP-Tempus binding is correct

**Verdict: documented edge case, not a regression from the original (which was strictly worse -- killing ALL triggers globally).**

### 6. `useDevControls` -- `require("leva")` is not dead-code eliminated by the bundler

`[src/hooks/useDevControls.ts](src/hooks/useDevControls.ts)` line 31

The `require("leva")` call is behind a `process.env.NODE_ENV !== "development" && !keepInProd` check. For the `keepInProd = false` path, the bundler should dead-code-eliminate the entire else branch since `process.env.NODE_ENV` is replaced at build time.

However, `require()` is a dynamic CommonJS call. Webpack/Turbopack may still include leva in the bundle because `require()` is harder to tree-shake than static `import`. The correct pattern for reliable dead-code elimination is:

```typescript
if (process.env.NODE_ENV !== "development" && !keepInProd) {
  // static defaults path
} else {
  const { useControls } = await import("leva"); // or require
}
```

With `require`, the bundler CAN still eliminate it because the entire else branch is unreachable when `NODE_ENV === "production"` and `keepInProd === false`. But this depends on the bundler's optimization pass. Adding `"leva"` to `optimizePackageImports` in next.config.ts (which was done) helps.

**Verdict: should work but warrants verification with `next experimental-analyze` after build.**

### 7. ExperimentNav inline script -- runs in non-iframe contexts too

`[src/components/ui/ExperimentNav.tsx](src/components/ui/ExperimentNav.tsx)` line 22-26

The inline `<script>` runs on every render of ExperimentNav, not just in iframes. In normal (non-iframe) contexts, `window.self === window.top` is true, so the `if` condition is false and the script does nothing. This is correct. But note: in Next.js, `<script>` inside a client component renders as a raw `<script>` tag in the body. It runs once during initial HTML parse, which is the right timing.

**Potential issue:** If the page does a soft navigation (client-side route change within the same experiment layout), the `<script>` tag may re-execute or not, depending on React's reconciliation. Since experiment layouts render their own `<html>`, soft navigation between experiment and article doesn't happen (it's a full page navigation). So this is fine.

**Verdict: correct for the architecture.**

---

## Items That Look Correct

- **Waves Canvas2D migration**: Same point density (xGap=8, yGap=8), same noise parameters, same cursor interaction math. IntersectionObserver correctly pauses/resumes RAF and scopes mousemove listener. Debounced resize at 150ms. `prefers-reduced-motion` renders a single static frame. `strokeColorRef` updates on prop change without remount.
- **ThemeAwareWaves**: `key={resolvedTheme}` removed. Stroke color changes are picked up via the `strokeColorRef` in the existing RAF loop. No remount on theme change.
- **Parallel data fetches**: Homepage uses `Promise.all([getExperiments(), getArticles()])`. Article pages use `Promise.all([getArticleContent(slug), getAdjacentArticles(slug)])`. `getArticles()` internals parallelized with nested `Promise.all`.
- **Suspense boundaries**: Wrapping `WritingSection` and `ExperimentDrawerList`. Since both receive their data as props (already resolved from the `await` above), these Suspense boundaries primarily help with the client-component hydration boundary, not SSR streaming. This is still correct -- they allow the shell to paint before these heavy client components hydrate.
- **Video preload="none"**: Both StaticExperimentMedia and InteractivePreviewMedia changed from `"auto"` to `"none"`. Videos will only load when `.play()` is called on hover.
- **CSS cleanup**: `text-rendering: optimizeLegibility` scoped to headings. `text-wrap: pretty` scoped to article/prose. `scroll-behavior: smooth` removed (Lenis handles it). Both `globals.css` and `experiments.css` aligned.
- **Font loading**: `display: "swap"` added to all 4 fonts. 6 unused Google font imports deleted.
- **LocationStatus dots**: Converted from 3 infinite Motion `animate` loops to CSS `@keyframes` with `animationDelay`. The `animate-dot-pulse` class and keyframe are defined in `globals.css`.
- **ExperimentDrawerList**: `window.location.href` replaced with `router.push()`. `InteractivePreviewMedia` dynamically imported.
- **MDX images**: Added `loading="lazy"` and `decoding="async"`.
- **next.config.ts**: `leva` added to `optimizePackageImports`. `formats: ["image/avif", "image/webp"]` added. Cache-Control headers for static assets added.
- **Toolkit barrel**: `ExperimentCanvas` removed from barrel (still available via `@/lib/toolkit/r3f`). Plop templates already import directly from `@/lib/toolkit/r3f`.
- **Dev tools**: R3FMetricsPiper and R3FSceneInspector gated behind `?debug`. `.catch()` added to dynamic imports. Dev barrel narrowed to only export injector wrappers.
- **Cursor Provider**: MutationObserver narrowed from `document.head` (childList + subtree) + `document.body` (attributes) to just `document.head` (childList only) + `document.documentElement` (data-cursor-hidden attribute only). Debounced at 50ms.
- **WithHover**: Default config hoisted to module-level `DEFAULT_CONFIG` constant.

---

## Agent Docs That Need Updating

### 1. `[toolkit.md](`.agent/contexts/toolkit.md`)` -- Multiple stale references

Line 26: States `destroy() fully reverses the setup: disposes Tempus callbacks, restores GSAP's own ticker, and resets state`. This is now inaccurate -- destroy() is reference-counted and only restores GSAP's ticker when the last instance is destroyed. It also only kills ScrollTriggers created by that instance, not all of them.

Line 29: States barrel `re-exports ExperimentCanvas, Tempus, createUnifiedScroll, UnifiedScrollHandle`. The barrel no longer exports `ExperimentCanvas` -- it's available via direct import from `@/lib/toolkit/r3f`.

Lines 37-39: States `R3FSceneInspector -- Scene graph text tree logged via console.warn on mount + every 10s`. Now gated behind `?debug`, so it no longer runs unconditionally.

New hook `useDevControls` should be documented somewhere (either toolkit.md or a new entry).

### 2. `[toolkit.md](`.agent/contexts/toolkit.md`)` -- R3F dev tools description

Lines 37-39 describe R3FMetricsPiper as "always-on" metrics piping. It's now gated behind `?debug`.

### 3. No other agent docs reference the GrainOverlay implementation, font loading strategy, or CSS architecture, so those changes don't require doc updates.

---

## Summary: What Needs Fixing


| Item                        | Severity               | Action                                                                              |
| --------------------------- | ---------------------- | ----------------------------------------------------------------------------------- |
| GrainOverlay invisible      | **P0 -- user visible** | Revert to original GIF approach                                                     |
| toolkit.md stale references | P3 -- docs             | Update barrel description, destroy() docs, R3F dev tools gating, add useDevControls |


