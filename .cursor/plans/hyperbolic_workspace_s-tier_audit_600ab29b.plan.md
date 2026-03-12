---
name: Hyperbolic workspace S-tier audit
overview: Final-pass audit of non-euclidean-hyperbolic-workspace across code quality, organization, performance, logic, and coherence. The experiment is already very well-structured -- 11 files, clean separation of concerns, correct math, good tests. The fixes below are the delta between "good" and "a 100x dev cries tears of joy."
todos:
  - id: fix-tile-interactivity
    content: Remove false interactivity from HyperbolicTile (role, aria-label, cursor-pointer, onClick, hover effects) and fix note label group-hover in orchestrator
    status: completed
  - id: collapse-link-memo
    content: Collapse HyperbolicLink triple useMemo into single useMemo
    status: completed
  - id: fix-nav-hook-closure
    content: Add viewCenterRef pattern to useHyperbolicNavigation to prevent handleStart recreation on every frame
    status: completed
  - id: fix-modal-import
    content: Fix React.useState -> useState import consistency in HyperbolicInfoModal
    status: completed
  - id: clean-dead-code
    content: Remove Complex.from(), dead level<3 conditional, || 'Area' fallback in graph gen
    status: completed
  - id: remove-backdrop-blur
    content: Remove backdrop-blur-md from tiles for performance
    status: completed
isProject: false
---

# Hyperbolic Workspace S-Tier Audit

## Verdict

This experiment is already well above average. Clean file organization, correct Poincare disk math, comprehensive tests, proper memoization, good a11y on the modal. The issues below are the difference between 90th percentile and 100th.

---

## Critical: False Interactivity on Tiles

The biggest coherence issue in the entire codebase. Three things conspire to make tiles *pretend* to be interactive while being completely inert:

**1. `pointer-events-none` on the tiles wrapper kills all interaction**

```117:117:src/components/experiments/non-euclidean-hyperbolic-workspace/NonEuclideanHyperbolicWorkspace.tsx
        <div className="pointer-events-none absolute inset-0 z-20">
```

This cascades to all child tiles. No hover, no click, nothing.

**2. Tiles declare interactive affordances that can never fire**

```50:60:src/components/experiments/non-euclidean-hyperbolic-workspace/HyperbolicTile.tsx
    <div
      aria-label={`Navigate to ${label || "node"}`}
      className={cn(
        "absolute flex cursor-pointer select-none items-center justify-center rounded-xl",
        // ...
        "hover:z-50 hover:scale-110 hover:brightness-125",
        // ...
      )}
      onClick={onClick}
      role="button"
```

`role="button"`, `aria-label="Navigate to..."`, `cursor-pointer`, `hover:scale-110`, `hover:brightness-125`, `onClick` -- all dead code because pointer events never reach tiles.

**3. `group-hover:block` on note labels references nonexistent `group` class**

```141:144:src/components/experiments/non-euclidean-hyperbolic-workspace/NonEuclideanHyperbolicWorkspace.tsx
                <span
                  className={cn(
                    "text-center font-medium leading-none tracking-tight drop-shadow-md",
                    node.type === "note" && "hidden group-hover:block"
                  )}
```

No ancestor has the `group` class, so note labels are permanently `hidden` even if hover could trigger.

**Fix:** Since this is a shipped legacy experiment where tile clicks are a placeholder ("(Placeholder) Interaction with nodes" per the info modal), the cleanest fix is to remove all false interactivity signals. Tiles are visual elements, not buttons:

- [HyperbolicTile.tsx](src/components/experiments/non-euclidean-hyperbolic-workspace/HyperbolicTile.tsx): Remove `role="button"`, `aria-label`, `cursor-pointer`, `onClick` prop, `hover:scale-110`, `hover:brightness-125`, `hover:z-50`. Remove `onClick` from the interface.
- [NonEuclideanHyperbolicWorkspace.tsx](src/components/experiments/non-euclidean-hyperbolic-workspace/NonEuclideanHyperbolicWorkspace.tsx): Remove `hidden group-hover:block` from note labels -- just show them always or hide them based on scale.

---

## Performance: Triple `useMemo` in HyperbolicLink

Three memos where one suffices:

```23:36:src/components/experiments/non-euclidean-hyperbolic-workspace/HyperbolicLink.tsx
  const vStart = useMemo(
    () => mobiusTransform(start, viewCenter),
    [start, viewCenter]
  );
  const vEnd = useMemo(
    () => mobiusTransform(end, viewCenter),
    [end, viewCenter]
  );
  const pathD = useMemo(() => {
    return getGeodesicPath(vStart, vEnd, viewportRadius);
  }, [vStart, vEnd, viewportRadius]);
```

**Fix:** Collapse into a single memo. Same deps (`start`, `end`, `viewCenter`, `viewportRadius`), less overhead, cleaner mental model:

```typescript
const pathD = useMemo(() => {
  const vStart = mobiusTransform(start, viewCenter);
  const vEnd = mobiusTransform(end, viewCenter);
  return getGeodesicPath(vStart, vEnd, viewportRadius);
}, [start, end, viewCenter, viewportRadius]);
```

---

## Performance: Unnecessary Callback Recreation in Navigation Hook

Per Vercel's `rerender-use-ref-transient-values` rule: "When a value changes frequently, store it in useRef instead of subscribing in closures."

`handleStart` closes over `viewCenter` state:

```33:40:src/components/experiments/non-euclidean-hyperbolic-workspace/hooks/useHyperbolicNavigation.ts
  const handleStart = useCallback(
    (clientX: number, clientY: number) => {
      setIsDragging(true);
      const { x, y } = getRelCoords(clientX, clientY);
      dragStartRef.current = { screen: { x, y }, view: viewCenter };
    },
    [viewCenter, getRelCoords]
  );
```

During drag, `viewCenter` updates every frame, which recreates `handleStart` -> `handleMouseDown` -> `handleTouchStart` every frame. These callbacks are only used at drag *start*, so the recreation is pure waste. `viewCenter` must remain in state (tiles depend on it for re-renders), but `handleStart` only needs to *read* the latest value -- a textbook ref mirror case.

**Fix:** Store viewCenter in a ref alongside the state, read the ref in `handleStart`:

```typescript
const viewCenterRef = useRef(viewCenter);
viewCenterRef.current = viewCenter;

const handleStart = useCallback(
  (clientX: number, clientY: number) => {
    setIsDragging(true);
    const { x, y } = getRelCoords(clientX, clientY);
    dragStartRef.current = { screen: { x, y }, view: viewCenterRef.current };
  },
  [getRelCoords]
);
```

Note: The global listener effect (lines 64-76) was analyzed against `advanced-event-handler-refs` but is already correct -- it only re-subscribes when `isDragging` changes (same boundary as handleMove/handleEnd changes), not during the drag.

---

## Consistency: Mixed Import Style in Modal

```1:3:src/components/experiments/non-euclidean-hyperbolic-workspace/HyperbolicInfoModal.tsx
"use client";
import { X } from "lucide-react";
import React, { useCallback, useEffect, useRef } from "react";
```

Line 3 imports `useCallback`, `useEffect`, `useRef` as named imports, but line 14 uses `React.useState(false)` instead of importing `useState`:

```14:14:src/components/experiments/non-euclidean-hyperbolic-workspace/HyperbolicInfoModal.tsx
  const [isHoveringEscher, setIsHoveringEscher] = React.useState(false);
```

**Fix:** Add `useState` to the destructured imports, use `useState(false)` on line 14.

---

## Dead Code: Unreachable Conditional in Graph Gen

```154:154:src/components/experiments/non-euclidean-hyperbolic-workspace/HyperbolicGraphGen.ts
        icon: level < 3 ? RandomIcon : undefined,
```

The BFS loop skips `level >= 3` at line 89, so the for-loop body only runs for levels 0, 1, 2. `level < 3` is always true. The conditional is dead.

**Fix:** Simplify to `icon: RandomIcon`.

---

## Dead Code: Unused `Complex.from()` Static Method

```7:9:src/components/experiments/non-euclidean-hyperbolic-workspace/HyperbolicMath.ts
  static from(re: number, im = 0) {
    return new Complex(re, im);
  }
```

Never called anywhere. The constructor is used directly everywhere.

**Fix:** Remove it. If it's needed later, it's a one-liner to add back. (Note: `arg()` is also unused but rounds out the Complex number API -- keep it.)

---

## Minor: Defensive Fallback That Can't Trigger in Graph Gen

```132:134:src/components/experiments/non-euclidean-hyperbolic-workspace/HyperbolicGraphGen.ts
        label =
          ["Dev", "Writing", "Health", "Art", "Finance", "Travel"][i % 6] ||
          "Area";
```

`i % 6` always indexes within a 6-element array, so `|| "Area"` never triggers. Not harmful but it signals uncertainty in the code.

**Fix:** Remove the `|| "Area"` fallback. The array access is always valid.

---

## Minor: `backdrop-blur-md` on Every Tile

```54:54:src/components/experiments/non-euclidean-hyperbolic-workspace/HyperbolicTile.tsx
        "font-bold text-white backdrop-blur-md",
```

`backdrop-filter: blur()` is expensive -- it requires compositing the content behind each tile. With ~20 visible tiles, that's 20 blur layers. On lower-end devices this can cause frame drops during drag.

**Fix:** Remove `backdrop-blur-md` from tiles. The tiles already have `bg-{color}/10` backgrounds from `NODE_STYLE` which provide sufficient visual distinction. If the frosted glass effect is desired, gate it behind `prefers-reduced-motion` or a device capability check.

---

## Summary of Changes by File

- **HyperbolicMath.ts**: Remove `Complex.from()` static method (3 lines)
- **HyperbolicTile.tsx**: Remove `role="button"`, `aria-label`, `cursor-pointer`, `onClick` prop/interface, hover effects, `backdrop-blur-md`
- **HyperbolicLink.tsx**: Collapse triple `useMemo` to single `useMemo`
- **HyperbolicInfoModal.tsx**: Add `useState` to imports, use `useState()` instead of `React.useState()`
- **HyperbolicGraphGen.ts**: Remove dead `level < 3` conditional, remove `|| "Area"` fallback, simplify `icon: RandomIcon`
- **NonEuclideanHyperbolicWorkspace.tsx**: Remove `hidden group-hover:block` from note labels
- **hooks/useHyperbolicNavigation.ts**: Add `viewCenterRef` pattern to break `handleStart` dependency on `viewCenter`

No changes needed to: `HyperbolicMath.test.ts` (solid), `data.ts` (clean), `hooks/useViewportRadius.ts` (fine), `README.md`, or any app route files.

---

## Vercel React Best Practices Audit (Already Passing)

Checked 12 rules from Vercel's React best practices skill against this codebase. The experiment already follows them correctly:

- `**rerender-functional-setstate`** -- Keyboard handler already uses `setViewCenter(current => ...)` for stable callbacks (line 92 of useHyperbolicNavigation.ts)
- `**js-index-maps`** -- `nodeMap` already uses Map for O(1) lookups (line 27 of orchestrator)
- `**rendering-svg-precision**` -- `.toFixed(2)` in geodesic paths is appropriate for viewBox 600x600
- `**rerender-memo**` -- Both HyperbolicTile and HyperbolicLink wrapped in React.memo
- `**rerender-lazy-state-init**` -- `new Complex(0, 0)` is a cheap literal; lazy init would add overhead, not remove it
- `**rendering-hoist-jsx**` -- Static elements (center dot, border ring, SVG defs) are small; hoisting would hurt readability for negligible gain
- `**advanced-event-handler-refs**` -- Global listener effect only re-subscribes at drag start/end boundaries, not during drag
- `**rendering-conditional-render**` -- All `&&` conditionals use boolean or object conditions; no risk of rendering `0` or `NaN`
- `**rerender-simple-expression-in-memo**` -- All `useMemo` calls wrap non-trivial computation (Mobius transforms, Map construction)
- `**rerender-defer-reads**` -- No searchParams/localStorage subscriptions to defer
- `**bundle-barrel-imports**` -- All imports are direct, no barrel files
- `**client-passive-event-listeners**` -- Resize events are not cancelable; passive flag has no effect

