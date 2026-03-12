---
name: VRD Scroll Stabilizer Fix
overview: Fix the skim-to-detailed scroll pinning by making anchor capture synchronous and adding a frame-loop correction that tracks the target element through Motion's spring animations.
todos:
  - id: sync-anchor
    content: Remove rAF gate from scroll listener, capture anchor synchronously
    status: completed
  - id: frame-loop
    content: Replace single scrollBy with frame-loop correction over ~600ms
    status: completed
  - id: lock-duration
    content: Increase SCROLL_LOCK_DURATION from 350ms to 700ms
    status: completed
  - id: verify
    content: Run tsc --noEmit and tests to verify
    status: completed
isProject: false
---

# VRD Scroll Stabilizer Fix

## Problem

When transitioning from skim back to detailed, the viewport drifts away from the content the user was reading. Two causes:

1. The scroll anchor is captured via a `requestAnimationFrame`-gated listener, which can be stale by the time the reading state changes (especially after the 2500ms exit delay when no scroll events fire).
2. The `useLayoutEffect` does a single instant `scrollBy`, but Motion's `layout` spring animations on every `VelocityText`, `VelocityCodeBlock`, and `VelocityImage` continue shifting heights for ~600ms after the state change. The single correction can't account for ongoing animated layout drift.

## Fix

Two changes in [hooks/useScrollStabilizer.ts](src/components/experiments/velocity-responsive-design/hooks/useScrollStabilizer.ts):

### A. Synchronous anchor capture

Remove the `requestAnimationFrame` gate from the scroll listener. Write the anchor directly in the scroll handler. With ~15 content children, a single `getBoundingClientRect` per child is negligible. This ensures the anchor always reflects the user's current position, including after Lenis inertia settles.

### B. Frame-loop correction

Replace the single `scrollBy` in `useLayoutEffect` with a short `requestAnimationFrame` loop that keeps pinning the target element for the duration of the spring animation (~600ms = ~36 frames at 60fps). Each frame, re-measure the target element's viewport offset and correct any drift. This handles Motion's FLIP layout animations without needing to hook into Motion internals.

The velocity lock (already called) prevents the correction scrolls from re-triggering skim mode.

```typescript
useLayoutEffect(() => {
  if (!(lastAnchorRef.current && containerRef.current)) return;

  const anchor = lastAnchorRef.current;
  const target = containerRef.current.children[anchor.index] as HTMLElement;
  if (!target) return;

  lockVelocity();

  // Initial correction (before paint)
  const initialDelta = target.getBoundingClientRect().top - anchor.viewportOffset;
  if (Math.abs(initialDelta) > 0.5) {
    window.scrollBy({ top: initialDelta, behavior: "instant" });
  }

  // Keep correcting through spring animation duration
  let frame = 0;
  const maxFrames = 36;
  let correctionRaf = 0;
  const correct = () => {
    const delta = target.getBoundingClientRect().top - anchor.viewportOffset;
    if (Math.abs(delta) > 0.5) {
      window.scrollBy({ top: delta, behavior: "instant" });
    }
    frame++;
    if (frame < maxFrames) {
      correctionRaf = requestAnimationFrame(correct);
    }
  };
  correctionRaf = requestAnimationFrame(correct);

  return () => cancelAnimationFrame(correctionRaf);
}, [readingState, lockVelocity, containerRef]);
```

### C. Extend velocity lock duration

The current `SCROLL_LOCK_DURATION` in [constants.ts](src/components/experiments/velocity-responsive-design/constants.ts) is 350ms, but the correction loop runs for ~600ms. Increase to 700ms so the entire correction loop runs while velocity tracking is suppressed.

## Files changed

- [hooks/useScrollStabilizer.ts](src/components/experiments/velocity-responsive-design/hooks/useScrollStabilizer.ts) -- synchronous anchor + frame-loop correction
- [constants.ts](src/components/experiments/velocity-responsive-design/constants.ts) -- bump `SCROLL_LOCK_DURATION` to 700ms
