---
name: Creative Toolkit Foundation
overview: Execute V2 Section 2 (Creative Toolkit Foundation) -- install Lenis, Tempus, Hamo, and @gsap/react; create the src/lib/toolkit/ integration layer; replace custom hooks with Hamo equivalents; update all 9 agent config files that have forward dependencies on these libraries; and update STATUS.md.
todos:
  - id: install-tier1
    content: Install lenis, tempus, hamo, @gsap/react via npm. Verify peer deps satisfied and build still passes.
    status: completed
  - id: toolkit-scroll
    content: Create src/lib/toolkit/scroll.ts -- Lenis + GSAP ScrollTrigger factory (createLenisScroll, destroyLenisScroll)
    status: completed
  - id: toolkit-raf
    content: Create src/lib/toolkit/raf.ts -- Tempus re-export + setupUnifiedRAF() for GSAP integration
    status: completed
  - id: toolkit-r3f
    content: Create src/lib/toolkit/r3f.tsx -- ExperimentCanvas wrapper with dpr=[1,2], Suspense, Preload
    status: completed
  - id: toolkit-index
    content: Create src/lib/toolkit/index.ts -- barrel exports for the integration layer
    status: completed
  - id: replace-hooks
    content: Replace useElementSize with Hamo useResizeObserver in AIWidget.tsx and LocationStatus.tsx. Deprecate old hook.
    status: completed
  - id: update-agent-config
    content: "Update 9 agent config files: remove NOT YET INSTALLED / DEPENDENCY markers, uncomment imports, update versions"
    status: completed
  - id: update-status
    content: "Update STATUS.md: mark Section 2 DONE, update working counts, document remaining forward deps"
    status: completed
  - id: verify-build
    content: Run tsc --noEmit + npm run build + dev server check. Confirm no regressions.
    status: completed
isProject: false
---

# V2 Section 2: Creative Toolkit Foundation

This is the P0 next step from the V2 plan. It unblocks 9 of 30 agent config files that currently carry "NOT YET INSTALLED" / "DEPENDENCY" markers.

---

## A. Install Tier 1 Packages

```bash
npm i lenis tempus hamo @gsap/react
```

Expected versions:

- **lenis** v1.3.18 (stable, 337K weekly downloads)
- **tempus** v1.0.0-dev.17 (pre-release, darkroom.engineering)
- **hamo** v1.0.0-dev.10 (pre-release, darkroom.engineering)
- **@gsap/react** latest (provides `useGSAP` hook, referenced throughout agent config but not yet installed)

Note: Tempus and Hamo are both pre-release dev tags. This is expected -- darkroom engineering uses this versioning scheme actively. Both have React 17+ peer deps which are satisfied by React 19.

---

## B. Create Integration Layer: `src/lib/toolkit/`

The V2 plan specifies 3 thin integration files. These are NOT abstractions -- they wire proven libraries together and prevent repetitive boilerplate. Experiments still import directly from libraries for everything else.

Currently `src/lib/` has 4 files flat: `utils.ts`, `fonts.ts`, `experiments.ts`, `experiments.test.ts`. We add a `toolkit/` subdirectory.

### B1. `src/lib/toolkit/scroll.ts`

Lenis + GSAP ScrollTrigger integration factory. The canonical pattern from the agent config (`[.agent/rules/scroll.md](.agent/rules/scroll.md)` and `[.agent/skills/lenis-scroll.md](.agent/skills/lenis-scroll.md)`):

```typescript
'use client'

import Lenis from 'lenis'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

export function createLenisScroll(options?: ConstructorParameters<typeof Lenis>[0]) {
  const lenis = new Lenis({ autoRaf: false, ...options })

  lenis.on('scroll', ScrollTrigger.update)
  gsap.ticker.add((time) => { lenis.raf(time * 1000) })
  gsap.ticker.lagSmoothing(0)

  return lenis
}

export function destroyLenisScroll(lenis: Lenis) {
  lenis.destroy()
  ScrollTrigger.getAll().forEach((t) => t.kill())
}
```

### B2. `src/lib/toolkit/raf.ts`

Re-exports Tempus + provides a `setupUnifiedRAF()` that puts GSAP under Tempus. This is NOT auto-invoked -- experiments call it explicitly when they want unified RAF.

```typescript
'use client'

import Tempus from 'tempus'

export { Tempus }
export default Tempus

let gsapUnified = false

export async function setupUnifiedRAF() {
  if (gsapUnified) return
  const gsap = (await import('gsap')).default
  gsap.ticker.remove(gsap.updateRoot)
  Tempus.add((time) => gsap.updateRoot(time / 1000), { priority: 0 })
  gsapUnified = true
}
```

### B3. `src/lib/toolkit/r3f.tsx`

Thin Canvas wrapper with sensible defaults from the existing R3F experiment patterns (all 6 R3F experiments use `dpr={[1, 2]}` + Suspense):

```tsx
'use client'

import { Canvas, type CanvasProps } from '@react-three/fiber'
import { Preload } from '@react-three/drei'
import { Suspense, type ReactNode } from 'react'

interface ExperimentCanvasProps extends CanvasProps {
  children: ReactNode
}

export function ExperimentCanvas({ children, ...props }: ExperimentCanvasProps) {
  return (
    <Canvas dpr={[1, 2]} {...props}>
      <Suspense fallback={null}>
        {children}
        <Preload all />
      </Suspense>
    </Canvas>
  )
}
```

Note: `r3f-perf` dev overlay is NOT included here -- it's Tier 2 (P3 priority). Will be added when Section 4 Template System V2 is built.

### B4. `src/lib/toolkit/index.ts`

Barrel re-export for convenience. Since these are toolkit modules, barrel imports are acceptable here (they're the top-level entry point, not deep library internals):

```typescript
export { createLenisScroll, destroyLenisScroll } from './scroll'
export { Tempus, setupUnifiedRAF } from './raf'
export { ExperimentCanvas } from './r3f'
```

---

## C. Replace Custom Hooks with Hamo

**Target**: `[src/hooks/useElementSize.ts](src/hooks/useElementSize.ts)` used in 2 shared UI files.

Hamo's `useResizeObserver` is the closest API match. Key difference: Hamo uses a shared ResizeObserver singleton (better perf) and has built-in debounce. Set `debounce: 0` to match current instant-update behavior.

### Migration (2 files):

`**[src/components/ui/AIWidget.tsx](src/components/ui/AIWidget.tsx)`** -- line 9, 61:

```typescript
// Before:
import { useElementSize } from "@/hooks/useElementSize"
const { ref, width, height } = useElementSize<HTMLDivElement>()

// After:
import { useResizeObserver } from "hamo"
const [ref, entry] = useResizeObserver({ debounce: 0 })
const width = entry?.contentRect.width ?? 0
const height = entry?.contentRect.height ?? 0
```

`**[src/components/ui/LocationStatus.tsx](src/components/ui/LocationStatus.tsx)**` -- line 11, 38:
Same pattern. `useMediaQuery` stays (Hamo has no equivalent).

### Deprecation

Mark `[src/hooks/useElementSize.ts](src/hooks/useElementSize.ts)` with a deprecation comment pointing to `hamo`'s `useResizeObserver`. Don't delete it -- existing experiments may reference it, and the V2 plan says "do NOT refactor existing experiments."

---

## D. Update 9 Agent Config Files

Remove all "NOT YET INSTALLED", "DEPENDENCY", "NOT YET BUILT" markers related to Section 2. Update version numbers to actual installed versions.


| File                                                                               | Changes                                                                                                                                                        |
| ---------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `[.agent/AGENTS.md](.agent/AGENTS.md)`                                             | Tech stack: remove "Planned" qualifier from Lenis/Tempus/Hamo                                                                                                  |
| `[.agent/contexts/toolkit.md](.agent/contexts/toolkit.md)`                         | Tier 1 table: `Installed?` -> YES for Lenis/Tempus/Hamo. Update version numbers. Integration layer section: remove "NOT YET BUILT". Update pending deps table. |
| `[.agent/rules/scroll.md](.agent/rules/scroll.md)`                                 | Remove dependency header note about Lenis/Tempus not installed                                                                                                 |
| `[.agent/profiles/scrollytelling.md](.agent/profiles/scrollytelling.md)`           | Remove "DEPENDENCIES: Lenis not yet installed" header                                                                                                          |
| `[.agent/skills/lenis-scroll.md](.agent/skills/lenis-scroll.md)`                   | Remove "DEPENDENCY: Lenis is not yet installed" header                                                                                                         |
| `[.agent/skills/tempus-raf.md](.agent/skills/tempus-raf.md)`                       | Remove "DEPENDENCY: Tempus is not yet installed" header                                                                                                        |
| `[.agent/skills/gsap-modern.md](.agent/skills/gsap-modern.md)`                     | Tempus integration section: remove "NOT YET INSTALLED" qualifier                                                                                               |
| `[.agent/workflows/new-experiment.md](.agent/workflows/new-experiment.md)`         | Uncomment Lenis imports in scrollytelling starter, remove "NOT YET INSTALLED" comments                                                                         |
| `[.agent/workflows/develop-experiment.md](.agent/workflows/develop-experiment.md)` | Uncomment Lenis/Tempus/Hamo import examples, update toolkit usage section status notes                                                                         |


---

## E. Update STATUS.md

- Mark Section 2 as **DONE** in the V2 Plan Progress table
- Move Section 2 items out of "What Has Forward Dependencies" into "What's Fully Working Now"
- Update the "What's Fully Working Now" counts (profiles: 5/5, rules: 6/6, skills: 7/8, etc.)
- Note what remains pending (Section 3-6 forward deps: capture script, dev metrics, scene inspector, publishing)
- Update priority ordering to show P1 as next

---

## F. Verification

1. `tsc --noEmit` -- type check passes
2. `npm run build` -- production build succeeds
3. Dev server starts without errors
4. Existing experiments still render correctly (no regressions from hook migration)

---

## What Will Still Be Placeholdered After This

These remain forward dependencies for later V2 sections:

- `**scripts/capture.mjs`** (Section 3A) -- visual-qa skill/workflow references it
- `**ExperimentDevMetrics` component** (Section 3B) -- performance rule references it
- **R3F scene graph serializer** (Section 3C) -- visual-qa references it
- **Enriched experiment.json schema in `getExperiments()`** (Section 4) -- architecture.md references V2 fields
- **Template System V2** (Section 4) -- new-experiment workflow references per-profile Plop templates
- **MDX article architecture** (Section 5) -- publish-experiment workflow is a stub
- `**r3f-perf` dev overlay** (Tier 2 library, P3) -- r3f.tsx Canvas wrapper doesn't include it yet
- `**publish-experiment.md`** workflow remains a STUB (1 of 7 workflows)

