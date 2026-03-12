---
name: Hyperbolic Workspace Audit
overview: Comprehensive code audit of the non-euclidean-hyperbolic-workspace experiment covering mathematical correctness, logic, performance, code smells, architecture, and accessibility.
todos:
  - id: geodesic-bug
    content: "Fix geodesic inversion bug: line 160 of HyperbolicMath.ts computes 1/z instead of 1/conj(z) -- sign error on imaginary part produces incorrect arcs"
    status: completed
  - id: sweep-flag
    content: Fix hardcoded SVG sweep-flag 1 in getGeodesicPath -- add cross-product check for correct arc direction
    status: completed
  - id: dead-code
    content: Remove HyperbolicGrid.tsx, unused math exports (inverseMobiusTransform, screenToPoincare, hyperbolicDistance), duplicate description.md
    status: completed
  - id: decompose
    content: Decompose 345-line main component into orchestrator + hooks + sections
    status: completed
  - id: perf-transitions
    content: Fix CSS transition-during-drag lag and remove permanent willChange
    status: completed
  - id: perf-lookups
    content: Build node Map for O(1) edge lookups, optimize Complex allocations
    status: completed
  - id: accessibility
    content: Add prefers-reduced-motion, fix modal a11y, fix aria-labels, preventDefault on arrows
    status: completed
  - id: tests
    content: Add unit tests for HyperbolicMath.ts pure functions (especially geodesic inversion)
    status: completed
isProject: false
---

# Non-Euclidean Hyperbolic Workspace -- Comprehensive Audit

**Important caveat:** This experiment has `"legacy": true` in its `experiment.json`, which per project rules means it is untouchable (no refactors, no code changes). This audit catalogs all findings for reference; any remediation would first require lifting the legacy flag.

**Metadata note:** The experiment.json schema is being handled by the new metadata system -- not covered here.

---

## Mathematical Correctness Analysis

### What's implemented correctly

- **Complex arithmetic** -- All operations (add, sub, mul, div, conj, abs, arg) are correct.
- **Mobius transformation** -- The core formula `M_a(z) = (z - a) / (1 - conj(a) * z)` is implemented correctly. This is the primary "camera" operation and the foundation of the entire experiment.
- **Inverse Mobius transformation** -- `(z + a) / (1 + conj(a) * z)` is correct (unused, but mathematically valid).
- **Hyperbolic distance** -- `2 * arctanh(|(a-b)/(1-conj(a)*b)|)` is correct (unused, but valid).
- **Panning/navigation via Mobius composition** -- Drag applies `mobiusTransform(currentCenter, shift)`, which correctly composes isometries. The Poincare disk is closed under Mobius transforms, so view state always remains valid.
- **Conformal scaling approximation** -- Uses `scale = 1 - |w|^2` where w is the visual position after transform. The exact conformal derivative is `|M_a'(z)| = (1-|a|^2)/|1-conj(a)*z|^2`, and the tile scaling should use `|M_a'(z)|` (local magnification). There's an identity: `1 - |w|^2 = |M_a'(z)| * (1-|z|^2)`, so the code's scale includes an extra `(1-|z|^2)` factor that over-shrinks tiles whose logical positions are far from origin. This is a standard simplification used in most Poincare disk visualizations and produces the correct qualitative behavior (tiles shrink toward the boundary). Not a bug, but worth knowing.
- **Collinearity detection for geodesics** -- The cross-product check for whether z1 and z2 are collinear with the origin (geodesic is a straight diameter) is correct.
- **Three-point circle computation** -- The determinant method for finding a circle through three points is algebraically correct.

### BUG: Geodesic inversion point has wrong sign (HyperbolicMath.ts line 160)

This is the most significant mathematical error in the codebase. In `getGeodesicPath`, the code needs to find the circle orthogonal to the unit disk that passes through z1 and z2. It does this by computing a third point -- the inversion of z1 with respect to the unit circle -- and finding the circle through all three points.

The inversion of z with respect to the unit circle is `1/conj(z) = z/|z|^2`:

- If `z = a + bi`, then `1/conj(z) = (a + bi) / (a^2 + b^2)`
- Real part: `a / (a^2 + b^2)`
- Imaginary part: `**+b / (a^2 + b^2)`**

The code computes:

```160:160:src/components/experiments/non-euclidean-hyperbolic-workspace/HyperbolicMath.ts
const z1Inv = new Complex(z1.re / denom, -z1.im / denom); // 1/conj(z1)
```

The `**-z1.im**` is wrong -- it should be `**+z1.im**`. The code computes `conj(z1)/|z1|^2 = 1/z1`, not `1/conj(z1)`. The comment says "1/conj(z1)" but the implementation gives "1/z1".

**Impact:** The three-point circle method uses the wrong third point, producing a circle that is NOT orthogonal to the unit disk. The resulting arcs are not true Poincare disk geodesics. The error is worst for points with large imaginary components and minimal for points near the real axis. Since the graph layout distributes nodes around the full disk, roughly half the edges will have noticeably incorrect curvature.

**Fix:** Change line 160 to:

```typescript
const z1Inv = new Complex(z1.re / denom, z1.im / denom);
```

### ISSUE: Hardcoded SVG sweep-flag always 1

The SVG arc command always uses `0 0 1` (small-arc, clockwise sweep):

```203:203:src/components/experiments/non-euclidean-hyperbolic-workspace/HyperbolicMath.ts
return `M ${p1x.toFixed(2)} ${p1y.toFixed(2)} A ${R_screen.toFixed(2)} ${R_screen.toFixed(2)} 0 0 1 ${p2x.toFixed(2)} ${p2y.toFixed(2)}`;
```

The correct sweep direction depends on the relative positions of z1, z2, and the circle center. A cross-product of `(z1 - center)` and `(z2 - center)` determines whether the arc should sweep clockwise or counterclockwise. With the current hardcoded value, approximately half the arcs curve the wrong way (bulging away from the origin instead of toward it).

**Fix:** Compute the cross product `(z1-C) x (z2-C)` and set sweep-flag based on its sign.

### ISSUE: No clamping on Mobius transform output

Floating-point drift can push `|mobiusTransform(z, a)|` slightly above 1.0. The tile component has a downstream guard (`Math.max(0, 1 - rSquared)`) but the transform itself doesn't clamp, which could cause NaN propagation in other consumers (e.g., `getGeodesicPath` with a point at |z| > 1 would produce incorrect circle centers).

### Summary scorecard

- Complex arithmetic: PASS
- Mobius transformation: PASS
- Inverse Mobius: PASS (unused)
- Hyperbolic distance: PASS (unused)
- Navigation/panning: PASS
- Conformal scaling: PASS (standard approximation)
- Collinearity detection: PASS
- Geodesic inversion: **FAIL** (sign error, wrong arcs)
- Arc sweep direction: **FAIL** (hardcoded, ~50% wrong)
- Numerical stability: WARN (no output clamping)

The core Mobius transform powering the "feel" of panning through hyperbolic space is correct. The primary visual bug is in the geodesic arc rendering -- the links between nodes are drawn along incorrect curves.

---

## Critical: Performance

### 1. CSS transitions fighting programmatic transforms during drag (HyperbolicTile.tsx)

`transition-all duration-300` is applied to every tile. During drag, the component updates `transform` via inline style on every mouse move, but each update triggers a 300ms CSS transition. This creates visible lag -- the tiles "chase" the cursor instead of tracking it instantly.

```67:68:src/components/experiments/non-euclidean-hyperbolic-workspace/HyperbolicTile.tsx
"absolute flex cursor-pointer select-none items-center justify-center rounded-xl transition-all duration-300 ease-out",
```

**Fix:** Remove `transition-all duration-300` during drag, or switch to `transition-none` while `isDragging`. Better: only apply transitions to `opacity` and `filter`, not `transform`.

### 2. SVG glow filter on every link (HyperbolicLink.tsx)

Every edge path applies `style={{ filter: "url(#glow)" }}` which runs a `feGaussianBlur`. Gaussian blur filters are among the most expensive SVG operations. With 20-40+ edges, this causes significant GPU/CPU cost on every frame repaint.

```39:48:src/components/experiments/non-euclidean-hyperbolic-workspace/HyperbolicLink.tsx
<path
  d={pathD}
  fill="none"
  opacity="0.6"
  pointerEvents="none"
  stroke="url(#link-gradient)"
  strokeWidth="1.5"
  style={{ filter: "url(#glow)" }}
/>
```

**Fix:** Remove per-element glow. Apply a single glow filter to the parent `<g>` element, or use `box-shadow` / CSS `filter` on the SVG container instead.

### 3. O(n*m) node lookup per edge render (NonEuclideanHyperbolicWorkspace.tsx)

Inside the render, every edge does two `.find()` calls on the nodes array to locate its source and target:

```269:274:src/components/experiments/non-euclidean-hyperbolic-workspace/NonEuclideanHyperbolicWorkspace.tsx
{graph.edges.map((edge) => {
  const source = graph.nodes.find((n) => n.id === edge.sourceId);
  const target = graph.nodes.find((n) => n.id === edge.targetId);
```

With ~30 nodes and ~30 edges, this is ~1800 comparisons per render. Should build a `Map<string, GraphNode>` once and do O(1) lookups.

### 4. Heavy Complex object allocation in Mobius transforms (HyperbolicMath.ts)

Each `mobiusTransform()` call creates **5 new Complex objects** (sub, conj, mul, Complex(1,0), sub). This is called for every node AND every edge on every drag frame. For 30 nodes + 30 edges = 60 transforms = 300 allocations per frame = GC pressure.

```57:68:src/components/experiments/non-euclidean-hyperbolic-workspace/HyperbolicMath.ts
export function mobiusTransform(z: Complex, a: Complex): Complex {
  const num = z.sub(a);
  const aConj = a.conj();
  const prod = aConj.mul(z);
  const one = new Complex(1, 0);
  const den = one.sub(prod);
  return num.div(den);
}
```

**Fix:** Use inline arithmetic with plain numbers (`[re, im]` tuples) for hot-path transforms, or pool/reuse a static `Complex.ONE`.

### 5. `willChange: "transform"` permanently set on every tile (HyperbolicTile.tsx)

This reserves a GPU compositor layer per tile. With 30+ tiles, this wastes GPU memory even when not dragging.

```78:78:src/components/experiments/non-euclidean-hyperbolic-workspace/HyperbolicTile.tsx
willChange: "transform",
```

**Fix:** Only set `willChange` during active drag, remove it on idle.

---

## High: Architecture and Decomposition

### 6. Main component exceeds hard line limit (345 lines)

`NonEuclideanHyperbolicWorkspace.tsx` is **345 lines**, well past the 200-line soft limit and 300-line hard limit. Per the experiment rules, it should decompose into:

- **Orchestrator** (~120 lines): lifecycle, shared state, composition
- `**data.ts`**: constants, configuration
- `**sections/PoincareDisk.tsx`**: the main SVG + tiles viewport
- `**hooks/useHyperbolicNavigation.ts`**: drag/touch/keyboard handlers
- `**hooks/useViewportRadius.ts`**: responsive radius logic

### 7. `React.memo` on HyperbolicTile is effectively defeated

The parent passes `className` as a `cn()` template literal (new string each render) and `children` as a JSX element (new reference each render). React.memo shallow-compares these and always finds them different, defeating memoization entirely.

### 8. HyperbolicGrid.tsx is dead code

The grid is commented out in the main component ("Grid removed as per user request") but the file and component still exist. Dead code should be removed.

### 9. Three exported functions in HyperbolicMath.ts are never used

- `inverseMobiusTransform` -- exported, never imported
- `screenToPoincare` -- exported, never imported
- `hyperbolicDistance` -- exported, never imported

### 10. Duplicate documentation files

`description.md` and `README.md` contain nearly identical content. Only one should exist.

---

## High: Logic and Correctness

### 11. SVG coordinate space vs DOM viewport mismatch

SVG `viewBox` is hardcoded to `-300 -300 600 600` and links use `viewportRadius={300}`. But DOM tiles use the dynamic `viewportRadius` (responsive). This means links and tiles are in different coordinate spaces on non-600px viewports -- links won't align with tile positions.

```242:243:src/components/experiments/non-euclidean-hyperbolic-workspace/NonEuclideanHyperbolicWorkspace.tsx
viewBox="-300 -300 600 600"
// ...
viewportRadius={300} // Keep 300 for SVG coord space
```

The SVG scales via `viewBox`, so it approximately works, but the coordinate mapping is coincidental rather than intentional.

### 12. `getGeodesicPath` always uses sweep-flag 1 (also in math section above)

The SVG arc command always uses `0 0 1` (small-arc, clockwise sweep). The code comment acknowledges this may occasionally draw arcs on the wrong side:

```202:203:src/components/experiments/non-euclidean-hyperbolic-workspace/HyperbolicMath.ts
return `M ... A ... 0 0 1 ...`;
```

A cross-product check against the disk center should determine the correct sweep direction.

### 13. No numerical stability clamping on Mobius transform output

Floating-point errors can produce points slightly outside `|z| = 1`, which would break downstream scale calculations (`1 - r^2` goes negative). The tile component has `Math.max(0, 1 - rSquared)` but no clamping on the transform itself.

### 14. Non-deterministic graph generation

`Math.random()` without a seed means every page load shows a different graph. This prevents visual reproducibility and makes debugging difficult. A seeded PRNG would preserve the organic feel while being deterministic.

---

## Medium: Accessibility

### 15. No `prefers-reduced-motion` handling

The interaction profile explicitly requires reduced-motion support. Currently:

- Tiles have `transition-all duration-300` (CSS transitions always active)
- Links have glow filter animation
- Info modal has `requestAnimationFrame` lerp animation
- No `useReducedMotion()` hook or `@media (prefers-reduced-motion)` anywhere

### 16. Keyboard arrow keys don't `preventDefault()`

Arrow key presses will both pan the disk AND scroll the page. The handler should call `e.preventDefault()` after confirming it handles the key:

```57:96:src/components/experiments/non-euclidean-hyperbolic-workspace/NonEuclideanHyperbolicWorkspace.tsx
const handleKeyDown = (e: KeyboardEvent) => {
  // ...
  if (dx === 0 && dy === 0) return;
  // Missing: e.preventDefault()
```

### 17. Info modal lacks focus trap, Escape key, click-outside

- No focus trap (Tab can reach elements behind the modal)
- No Escape key handler to close
- No click-outside-to-close on the backdrop
- Close button lacks `aria-label`

### 18. Tile `aria-label` always falls to "node"

The label check `typeof children === "string" ? children : "node"` always returns `"node"` because `children` is always a JSX `<div>` element, never a string.

### 19. No `tabIndex` on the interactive container

The keyboard handler listens on `window`, which works but is fragile. The disk container should have `tabIndex={0}` and `role="application"` for proper focus management.

---

## Medium: Code Smells

### 20. `getRelCoords` is unstable, defeating `useCallback` memoization

`getRelCoords` is a plain function (new reference every render) but appears in the dependency arrays of `handleStart` and `handleMove` useCallbacks. This means those callbacks are recreated every render, negating the purpose of `useCallback`.

### 21. Stream-of-consciousness comments throughout

Multiple files contain "thinking aloud" comments that read like debug notes rather than documentation:

```128:135:src/components/experiments/non-euclidean-hyperbolic-workspace/NonEuclideanHyperbolicWorkspace.tsx
// biome-ignore lint/correctness/useExhaustiveDependencies: legacy experiment
[viewCenter, getRelCoords]
); // viewCenter needed if we want to capture it exactly at start, though ref is better?
// Actually viewCenter is in state, so closure captures it.
// Ideally getRelCoords should also be memoized or stable.
// simpler: just add missing dep to useEffect and suppress if needed, OR memorize functions.
// Let's go with memoizing handlers to be clean.
```

### 22. HyperbolicInfoModal uses `setState` inside requestAnimationFrame

The lerp animation calls `setSmoothPosition()` every animation frame, causing a full React re-render (~60 times/second) just for a cursor-following preview image. Should use refs + direct DOM manipulation.

```24:29:src/components/experiments/non-euclidean-hyperbolic-workspace/HyperbolicInfoModal.tsx
const animate = () => {
  setSmoothPosition((prev) => ({
    x: lerp(prev.x, mousePosition.x, 0.15),
    y: lerp(prev.y, mousePosition.y, 0.15),
  }));
  animationFrameId = requestAnimationFrame(animate);
};
```

### 23. `mousePosition` in useEffect dependency causes rapid effect re-creation

The `useEffect` that runs the lerp animation has `mousePosition` in its dependency array. Since `mousePosition` updates on every mouse move, the effect is torn down and re-created constantly.

### 24. React component references stored in data objects (HyperbolicGraphGen.ts)

The `icon` field on `GraphNode` stores Lucide icon components directly. This mixes data concerns with React rendering concerns and prevents graph data from being serialized/cached.

### 25. `handleTouchEnd` is a trivial wrapper

```199:201:src/components/experiments/non-euclidean-hyperbolic-workspace/NonEuclideanHyperbolicWorkspace.tsx
const handleTouchEnd = () => {
  handleEnd();
};
```

Could pass `handleEnd` directly as the event handler.

---

## Low: Minor Issues

### 26. Uses `window.addEventListener("resize")` instead of ResizeObserver

The toolkit provides `useResizeObserver` from hamo. `ResizeObserver` is more precise (element-level) and doesn't require the window event.

### 27. No test coverage

Zero test files for a shipped experiment. At minimum, `HyperbolicMath.ts` is pure math with no DOM dependencies -- ideal for unit testing.

### 28. `z-100` and `z-110` in info modal

Using very high z-index values (`z-100`, `z-110`) without a z-index scale strategy. These are Tailwind arbitrary values that could conflict with other stacking contexts.

### 29. `gridPaths.circles` rendered but always empty array

In HyperbolicGrid.tsx, the return value includes `circles: []` which is rendered as `{gridPaths.circles}` -- always empty, dead render path.

### 30. Profile mismatch

The experiment uses `"profile": "interaction"` which recommends Motion (framer-motion) and @use-gesture for spring-physics interactions. The actual implementation uses vanilla React state + event handlers with no spring physics at all. The interaction feels rigid -- linear panning without momentum, easing, or spring-back.

---

## Summary by Severity

- **Critical (math)** [2]: Geodesic inversion sign bug, hardcoded sweep-flag -- links between nodes are drawn along incorrect curves
- **Critical (perf)** [5]: CSS transition lag during drag, SVG glow filter per-link, O(n*m) node lookups, Complex object GC pressure, permanent willChange
- **High (arch)** [5]: 345-line component, defeated React.memo, dead HyperbolicGrid.tsx, 3 unused exports, duplicate docs
- **High (logic)** [4]: SVG/DOM coordinate mismatch, no Mobius output clamping, non-deterministic graph, sweep-flag (dup)
- **Medium (a11y)** [5]: No prefers-reduced-motion, no modal focus trap/Escape/click-outside, broken aria-label, no preventDefault on arrows, no tabIndex
- **Medium (smell)** [6]: Unstable getRelCoords defeating useCallback, debug comments as documentation, setState in rAF, mousePosition effect churn, component refs in data, trivial wrapper
- **Low** [5]: window resize vs ResizeObserver, no tests, z-index strategy, dead gridPaths.circles, profile mismatch

**Total findings: 30** (3 metadata/asset items removed -- handled by new metadata system and assets confirmed present)

---

## Recommended Remediation Priority (if legacy flag were lifted)

1. **Fix geodesic inversion bug** (line 160 of HyperbolicMath.ts) -- single character change, biggest mathematical correctness win
2. **Fix sweep-flag** in getGeodesicPath -- add cross-product check for correct arc direction
3. **Add unit tests for HyperbolicMath.ts** -- validate the fixes and lock in correctness for all math functions
4. **Fix CSS transition-during-drag performance** -- biggest UX/feel improvement
5. **Remove dead code** (HyperbolicGrid.tsx, unused math exports, duplicate description.md)
6. **Decompose main component** to meet line budgets (orchestrator + hooks + sections)
7. **Build node lookup Map** for O(1) edge rendering
8. **Add prefers-reduced-motion** support
9. **Fix modal accessibility** (focus trap, Escape, click-outside)
10. **Optimize Complex allocations** with inline arithmetic for hot paths

