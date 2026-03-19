---
name: Fix View Transition InvalidStateError
overview: Fix the Sentry InvalidStateError caused by ResizeObserver-driven canvas redraws running during the View Transitions API navigation by deferring those redraws to the next frame, and optionally filtering the known error in Sentry.
todos: []
isProject: false
---

# Fix View Transition + ResizeObserver InvalidStateError

## Summary

Concurrent DOM/layout work from **ResizeObserver** callbacks in article canvas demos runs while the browser is in the middle of a **View Transition** (triggered by `@view-transition { navigation: auto; }` in [src/app/experiments/experiments.css](src/app/experiments/experiments.css) and [src/app/(main)/globals.css](src/app/(main)/globals.css)). That race causes the browser to abort the transition and throw `InvalidStateError: Transition was aborted because of invalid state`.

## Root cause (confirmed)

- **View Transitions**: `navigation: auto` is set in both experiments.css (used by [non-euclidean-hyperbolic-workspace layout](src/app/experiments/(non-euclidean-hyperbolic-workspace)/layout.tsx)) and globals.css (main app).
- **ResizeObserver**: Five article demo components mount, call `draw()` in `useEffect`, then attach `ResizeObserver(() => draw())`. On navigation to the article page, layout shifts and multiple RSC fetches cause resize events; the observer fires and `draw()` runs synchronously during the transition’s update phase, invalidating the transition.

## Approach

**1. Defer canvas work from ResizeObserver (primary fix)**  
Run `draw()` in a **requestAnimationFrame** from the ResizeObserver callback so it executes in the next paint, after the View Transition has finished its critical phase. Optionally run the **initial** `draw()` in the same `useEffect` inside rAF so the first paint also avoids the transition window.

**2. Optional: Sentry ignore (safety net)**  
Add an `ignoreErrors` entry in client Sentry init for this specific message so any remaining edge cases (e.g. very fast navigations) don’t flood the dashboard. Document it as a known browser/transition race.

---

## Implementation

### 1. Defer ResizeObserver-driven draw (5 files)

**Files** (all under `src/app/experiments/(non-euclidean-hyperbolic-workspace)/non-euclidean-hyperbolic-workspace/article/components/`):

- [MobiusTransformDemo.tsx](src/app/experiments/(non-euclidean-hyperbolic-workspace)/non-euclidean-hyperbolic-workspace/article/components/MobiusTransformDemo.tsx)
- [GeodesicDemo.tsx](src/app/experiments/(non-euclidean-hyperbolic-workspace)/non-euclidean-hyperbolic-workspace/article/components/GeodesicDemo.tsx)
- [HyperbolicTreeDemo.tsx](src/app/experiments/(non-euclidean-hyperbolic-workspace)/non-euclidean-hyperbolic-workspace/article/components/HyperbolicTreeDemo.tsx)
- [EuclideanVsHyperbolicDemo.tsx](src/app/experiments/(non-euclidean-hyperbolic-workspace)/non-euclidean-hyperbolic-workspace/article/components/EuclideanVsHyperbolicDemo.tsx)
- [ConformalScaleDemo.tsx](src/app/experiments/(non-euclidean-hyperbolic-workspace)/non-euclidean-hyperbolic-workspace/article/components/ConformalScaleDemo.tsx)

**Change in each** (same pattern in all five):

- In the `useEffect` that sets up draw + ResizeObserver, replace the **ResizeObserver callback** so it schedules `draw()` in rAF instead of calling it synchronously.
- Optionally schedule the **initial** `draw()` in rAF as well (one frame delay on mount is acceptable and avoids the transition window).

**Current pattern (example from MobiusTransformDemo.tsx):**

```typescript
useEffect(() => {
  draw();
  const canvas = canvasRef.current;
  if (!canvas) return;
  const ro = new ResizeObserver(() => draw());
  ro.observe(canvas);
  return () => ro.disconnect();
}, [draw]);
```

**New pattern:**

```typescript
useEffect(() => {
  let rafId: number;
  const scheduleDraw = () => {
    rafId = requestAnimationFrame(() => draw());
  };
  scheduleDraw(); // initial draw deferred to next frame
  const canvas = canvasRef.current;
  if (!canvas) return;
  const ro = new ResizeObserver(scheduleDraw);
  ro.observe(canvas);
  return () => {
    if (rafId !== undefined) cancelAnimationFrame(rafId);
    ro.disconnect();
  };
}, [draw]);
```

Apply the same logic in the other four components (GeodesicDemo, HyperbolicTreeDemo, EuclideanVsHyperbolicDemo, ConformalScaleDemo). Each has an identical `useEffect` block; only the ref/cleanup variable names need to stay consistent (e.g. cancel the rAF in cleanup to avoid calling `draw()` after unmount).

**Optional DRY:** Introduce a small hook in the same `article/components` folder, e.g. `useCanvasResize(canvasRef, draw)`, that encapsulates this effect and cleanup; then use it in all five components. This reduces duplication and keeps behavior identical.

---

### 2. Sentry: ignore known View Transition error (safety net)

**File:** [instrumentation-client.ts](instrumentation-client.ts)

- Add `ignoreErrors` to the `Sentry.init()` options (client-only; this error is from the browser during navigation).
- Ignore the exact message: `Transition was aborted because of invalid state` (or match `InvalidStateError` + that message so we don’t over-ignore).

Example:

```typescript
ignoreErrors: [
  // View Transitions API can abort when DOM mutates during navigation (e.g. ResizeObserver in canvas demos).
  /Transition was aborted because of invalid state/,
],
```

- Add a short comment above the entry explaining it’s a known race with automatic view transitions and ResizeObserver/layout work; the primary fix is deferring canvas work (step 1).

---

## Verification

- **Manual:** Navigate from homepage (or experiment list) to the non-euclidean article page multiple times (including quick double-clicks or back/forward). Confirm no console error and demos render correctly after transition.
- **Sentry:** After deploy, confirm no new events for this error (and that the ignore rule doesn’t drop other InvalidStateErrors if you use a broader pattern; prefer the specific message above).

---

## Out of scope

- **Disabling view transitions** for article or experiment routes: would remove the transition UX; deferring work is the preferred fix.
- **Changing other experiments**: Only the non-euclidean article demos were in the error path; other uses of ResizeObserver (e.g. Hamo) can adopt the same rAF pattern later if similar errors appear.
