---
name: Hyperbolic Components Split
overview: Split the 968-line monolithic `article/components.tsx` into a `components/` directory with shared utilities and one file per demo, following the decomposition plan and new scaffolding pattern.
todos:
  - id: create-utils
    content: Create components/utils.ts with shared Complex class and drawing helpers
    status: completed
  - id: create-euclidean-demo
    content: Create components/EuclideanVsHyperbolicDemo.tsx with generateTree()
    status: completed
  - id: create-mobius-demo
    content: Create components/MobiusTransformDemo.tsx
    status: completed
  - id: create-geodesic-demo
    content: Create components/GeodesicDemo.tsx
    status: completed
  - id: create-conformal-demo
    content: Create components/ConformalScaleDemo.tsx
    status: completed
  - id: create-tree-demo
    content: Create components/HyperbolicTreeDemo.tsx with generateHyperbolicTree()
    status: completed
  - id: create-barrel
    content: Create components/index.ts barrel re-export
    status: completed
  - id: delete-monolith
    content: Delete the monolithic components.tsx
    status: completed
  - id: verify
    content: Run tsc --noEmit and lint to verify no regressions
    status: completed
isProject: false
---

# Hyperbolic Article Components Decomposition

## Context

The [existing `components.tsx](src/app/experiments/(non-euclidean-hyperbolic-workspace)/non-euclidean-hyperbolic-workspace/article/components.tsx)` is 968 lines -- over 3x the 300-line hard limit. It contains 5 interactive demos and ~138 lines of shared math/drawing utilities all in a single `"use client"` file.

The [decomposition plan](/.cursor/plans/article_components_decomposition_b4a88807.plan.md) already updated all scaffolding, agent docs, and skills to enforce the new `components/` directory pattern. This task completes the follow-up: migrating the hyperbolic article to that pattern.

## Target Structure

```
article/
  page.tsx              (unchanged -- import resolves to components/index.ts)
  content.mdx           (unchanged)
  components/
    index.ts            (~6 lines)  barrel re-exports all 5 demos
    utils.ts            (~140 lines) Complex class C, mobius, diskToCanvas, canvasToDisk, drawDiskBorder, geodesicArc
    EuclideanVsHyperbolicDemo.tsx  (~175 lines) + local generateTree()
    MobiusTransformDemo.tsx        (~175 lines)
    GeodesicDemo.tsx               (~175 lines)
    ConformalScaleDemo.tsx         (~165 lines)
    HyperbolicTreeDemo.tsx         (~165 lines) + local generateHyperbolicTree()
```

All files land under 200 lines, well within the 300-line limit.

## Step-by-step

### 1. Create `components/utils.ts`

Extract the shared math module (current lines 1-138 of `components.tsx`):

- Complex number class `C` with `add`, `sub`, `mul`, `div`, `conj`, `abs`, `scale`
- Constant `ONE`
- Functions: `mobius`, `diskToCanvas`, `canvasToDisk`, `drawDiskBorder`, `geodesicArc`
- No `"use client"` -- pure math, no React

### 2. Create each demo as its own file

Each file gets:

- `"use client"` directive
- React imports (`useCallback`, `useEffect`, `useMemo`, `useRef`, `useState` as needed)
- Import `ControlGroup`, `Range`, `Switch` from `@/components/mdx/controls`
- Import `C`, `mobius`, `diskToCanvas`, `canvasToDisk`, `drawDiskBorder`, `geodesicArc` from `./utils`
- Local helper functions that are only used by that demo stay in the same file:
  - `generateTree()` stays in `EuclideanVsHyperbolicDemo.tsx`
  - `generateHyperbolicTree()` stays in `HyperbolicTreeDemo.tsx`

### 3. Create `components/index.ts`

Barrel re-export:

```typescript
export { EuclideanVsHyperbolicDemo } from "./EuclideanVsHyperbolicDemo";
export { MobiusTransformDemo } from "./MobiusTransformDemo";
export { GeodesicDemo } from "./GeodesicDemo";
export { ConformalScaleDemo } from "./ConformalScaleDemo";
export { HyperbolicTreeDemo } from "./HyperbolicTreeDemo";
```

### 4. Delete the monolithic `components.tsx`

Remove `article/components.tsx`. The `page.tsx` import `from "./components"` now resolves to `components/index.ts`.

### 5. Verify

- `tsc --noEmit` to confirm no type errors
- `npm run lint` to confirm no lint violations
- No changes to `page.tsx` or `content.mdx` required

## What does NOT change

- `article/page.tsx` -- the import path `"./components"` is backward-compatible
- `article/content.mdx` -- MDX references component names, which are unchanged
- Any other experiment files

