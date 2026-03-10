---
name: VFB Review Fixes
overview: Complete the Visual Feedback Bridge implementation -- fix all review bugs, build the missing features (leva integration, camera helpers, Plop conditionals, scroll cleanup), and correct all documentation.
todos:
  - id: fix-code-bugs
    content: Fix R3FDevTools.tsx useState ordering, scroll.ts Tempus callback leak + global side effect, R3FMetricsPiper redundant check, MCP json -y flags, layout template barrel import
    status: completed
  - id: build-leva-debug
    content: "Build leva integration behind ?debug (basement pattern): keyboard shortcut L toggles leva panel, G toggles grid. Wire useControls into DebugOverlay."
    status: completed
  - id: build-camera-helpers
    content: "Build DebugCamera.tsx for R3F: M=Main, O=Orbit, G=Grid. Add to R3FDevTools when ?debug active."
    status: completed
  - id: build-plop-conditionals
    content: Add {{#if includeToolkit}} and {{#if includeLeva}} Handlebars blocks to scrollytelling, r3f-scene, r3f-shader, interaction, dom-effect templates.
    status: completed
  - id: fix-gsdevtools
    content: "Improve GSDevTools integration: expose hook so experiments can link to specific timelines with ids instead of global-only."
    status: completed
  - id: fix-all-docs
    content: "Fix all documentation: remove PerfHeadless/camera claims, update performance.md R3FDevMetrics refs, add missing thresholds to skill, update JSDoc in R3FDevTools.tsx."
    status: completed
isProject: false
---

# Visual Feedback Bridge -- Complete Fix + Missing Features

The review found the implementation is ~40% of what the plan specified. This plan addresses all bugs, builds the missing features, and corrects documentation.

---

## Part 1: Code Bug Fixes

### Bug 1: `useState` import ordering in R3FDevTools.tsx

`[src/components/dev/R3FDevTools.tsx](src/components/dev/R3FDevTools.tsx)` line 71 imports `useState` after its first usage at line 55.

**Fix:** Merge into line 4: `import { Suspense, useEffect, useRef, useState } from "react"`. Delete line 71.

### Bug 2: Memory leak + global side effect in scroll.ts

`[src/lib/toolkit/scroll.ts](src/lib/toolkit/scroll.ts)` has two problems:

1. `createUnifiedScroll` adds Tempus callbacks but `destroyUnifiedScroll` never removes them
2. `gsap.ticker.remove(gsap.updateRoot)` on line 30 is a **global side effect** -- any module importing `scroll.ts` breaks GSAP's default ticker for the entire app

**Fix:** 

- Capture dispose functions from `Tempus.add()` and return them as part of a cleanup handle
- Move the GSAP ticker takeover inside `createUnifiedScroll` so it only runs when explicitly called (not at import time -- though it's already in the function body, the `gsap.registerPlugin(ScrollTrigger)` at module top-level is fine since it's idempotent)
- Return a cleanup object: `{ lenis, destroy() { ... } }` that handles Tempus callback removal + ScrollTrigger cleanup

### Bug 3: R3FMetricsPiper redundant timestamp check

The `setInterval` fires every 2s and the inner `if` also checks 2s. Always true.

**Fix:** Remove `lastReportRef` and the guard. Log directly in the interval callback.

### Bug 4: MCP json missing `-y` flags

**Fix:** Add `-y` to all three npx commands in `[.cursor/mcp.json](.cursor/mcp.json)`.

### Bug 5: Layout template barrel import

`[plop-templates/experiment/route-layout.tsx.hbs](plop-templates/experiment/route-layout.tsx.hbs)` imports from `"@/components/dev/DevToolsInjector"` (full path) while all 18 existing layouts use `"@/components/dev"` (barrel).

**Fix:** Change to `import { DevToolsInjector } from "@/components/dev"`.

---

## Part 2: Missing Features

### Feature 1: Leva integration behind `?debug`

The basement.studio Daylight pattern ties leva panels to the debug system. Currently nothing renders leva.

**Build:** Add a `DebugLevaPanel` component to `[DebugOverlay.tsx](src/components/dev/DebugOverlay.tsx)`:

- Hidden by default, toggled with `L` key
- When visible, renders a `<Leva>` root panel
- Per-experiment `useControls` calls automatically populate it when experiments use leva
- Leva is already in dependencies (`^0.10.1`)

Add `L` to the keyboard shortcut handler alongside existing `D`.

### Feature 2: Camera helpers for R3F

**Build `src/components/dev/DebugCamera.tsx`:**

- `M` key = Main camera (scene as intended, default)
- `O` key = Orbit mode (free orbit around scene via OrbitControls)
- `G` key = Toggle grid helper (10x10 ground plane)

This component:

- Uses `useDebug()` to only activate when `?debug` is present
- Listens for keyboard shortcuts
- Manages camera mode state
- Renders `<OrbitControls>` in orbit mode, `<gridHelper>` when grid is active

Wire into `[R3FDevTools.tsx](src/components/dev/R3FDevTools.tsx)` alongside the existing `R3FSceneInspector` and `DebugPerfPanel`.

### Feature 3: Plop template conditionals

Add `{{#if includeToolkit}}` and `{{#if includeLeva}}` Handlebars blocks to templates:

**Scrollytelling + toolkit:**

```hbs
{{#if includeToolkit}}
import { createUnifiedScroll } from "@/lib/toolkit/scroll";
{{/if}}
```

Pre-wires `createUnifiedScroll` in `useEffect` with cleanup, replacing the current `<ReactLenis root>` pattern.

**R3F profiles + toolkit:**

```hbs
{{#if includeToolkit}}
import { ExperimentCanvas } from "@/lib/toolkit/r3f";
{{/if}}
```

Uses `ExperimentCanvas` (with Preload + Suspense) instead of raw `<Canvas>`.

**Any profile + leva:**

```hbs
{{#if includeLeva}}
import { useControls } from "leva";
import { useDebug } from "@/hooks/useDebug";
{{/if}}
```

Adds a starter `useControls` block with sensible defaults for the profile type (e.g., rotation speed for R3F, scroll speed for scrollytelling).

### Feature 4: Improved GSDevTools integration

The current `GsapDebugTools` just does `GSDevTools.create({ minimal: true })` globally. Per the [official docs](https://gsap.com/docs/v3/Plugins/GSDevTools/), best practice is linking to specific timelines.

**Build `useGSAPDebug` hook** at `src/hooks/useGSAPDebug.ts`:

```tsx
export function useGSAPDebug(timeline: gsap.core.Timeline, id: string) {
  const isDebug = useDebug();
  useEffect(() => {
    if (!isDebug) return;
    // dynamic import GSDevTools, create linked to this specific timeline
  }, [isDebug, timeline, id]);
}
```

Experiments that use GSAP can opt-in: `useGSAPDebug(tl, "main")`. The existing global fallback in `GsapDebugTools` stays for experiments that don't use the hook. Update the Plop scrollytelling template to use this hook when `includeLeva` is true.

---

## Part 3: Documentation Fixes

### All docs that claim "PerfHeadless"

Fix in toolkit.md, STATUS.md, visual-qa workflow, visual-qa skill: replace "r3f-perf PerfHeadless" with "Three.js renderer info (`gl.info`)" for the console-piped part. Keep "r3f-perf visual panel when `?debug` active" for the visual part.

### R3FDevTools.tsx stale JSDoc

- Line 12: Change to "Reads Three.js renderer info and pipes to console"  
- Line 76: Add leva + camera helpers to description (now that they'll be implemented)

### performance.md stale references

Replace `<R3FDevMetrics />` and `<R3FSceneInspector />` manual instructions with `<R3FDevToolsInjector />`.

### visual-qa skill missing thresholds

Add CLS and GSAP tween rows to match the workflow version.

### visual-qa workflow ?debug description

Update to accurately list what `?debug` enables (after features are built): GSDevTools, device info (D), leva panel (L), grid helper (G for R3F), camera modes (M/O for R3F), r3f-perf visual panel.

---

## Execution Order

1. **Fix code bugs** (Part 1) -- all 5 bugs
2. **Build leva + camera helpers** (Features 1-2) -- the core missing pieces
3. **Build Plop conditionals** (Feature 3) -- wire templates to use new features
4. **Improve GSDevTools** (Feature 4) -- useGSAPDebug hook
5. **Fix all docs** (Part 3) -- after features exist so docs are accurate
6. **Typecheck + build** -- verify everything compiles

