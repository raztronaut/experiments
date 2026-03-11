---
name: Legacy Modernization Candidates
overview: Analyze the 18 pre-v2 legacy experiments and recommend the top 6 candidates for modernization, prioritizing technical debt, showcase value, profile diversity, and the amount of v2 infrastructure each would gain.
todos:
  - id: modernize-keyboard-keys
    content: "Modernize keyboard-keys: decompose 541-line monolith, deduplicate handlers, extract Confetti component, move keyframes to CSS, add dev controls and reduced motion"
    status: pending
  - id: modernize-life-3d
    content: "Modernize life-3d: wrap in ExperimentCanvas with tempus/adaptive, add R3F dev tools, dynamic import Three.js/postprocessing, add useDevControls for simulation params"
    status: pending
  - id: modernize-split-flap
    content: "Modernize transit-airport-split-flap-display: extract header/footer sub-components, add useDevControls for audio/timing, add prefers-reduced-motion, scaffold tests for useTransitData"
    status: pending
  - id: modernize-velocity
    content: "Modernize velocity-responsive-design: migrate to createUnifiedScroll, extract FlightControl/IntelligentScroller to files, fix useLayoutEffect bug, replace template literal classNames"
    status: pending
  - id: modernize-cursor-depth
    content: "Modernize cursor-depth-explorer: fix 6 any types, extract Scene + shaders to separate files, use ExperimentCanvas, add R3F dev tools, replace alert() with proper error handling"
    status: pending
  - id: modernize-gravity
    content: "Modernize gravity-physics-ui-layout: rewrite layout to v2 template, dynamic import matter-js across 5 files, replace IIFE-in-JSX with useMemo, add physics dev controls via Leva"
    status: pending
isProject: false
---

# Legacy Experiment Modernization: Top 6 Candidates

## The Pre-V2 Landscape

All 18 legacy experiments share `legacy: true, status: "shipped"`. They were built between Dec 2025 and Feb 2026, before the v2 overhaul introduced the toolkit integration layer, dev tools system, component decomposition discipline, and profile-specific scaffolding. Common gaps across the legacy set:

- **Zero tests** (0 of 18 have test files)
- **No dynamic imports** for Three.js, GSAP, matter-js (bundle bloat)
- **No `?debug` mode** -- no Leva, no GSDevTools, no FPS/heap monitoring, no R3F scene inspector
- **No toolkit usage** -- no `createUnifiedScroll`, no `ExperimentCanvas`, no Tempus priority chain
- **No `useDeviceCapabilities`** or `prefers-reduced-motion` handling
- **No content constellation** (except 404-not-found and basketball-replay-center)
- **Monolithic components** in several (keyboard-keys at 541 lines, cursor-depth-explorer at 449)
- **Hardcoded layout metadata** in 2 experiments (gravity-physics-ui-layout, shader-landing)

## Selection Criteria

Ranked by a weighted mix of:

1. **Technical debt severity** -- how far from v2 standards
2. **Showcase/portfolio value** -- how impressive the experiment is
3. **V2 infrastructure ROI** -- how much the experiment gains from modernization
4. **Profile diversity** -- covering different experiment types to validate the v2 system
5. **Feasibility** -- tractable modernization without full rewrites

---

## The Top 6

### 1. `cursor-depth-explorer` (profile: r3f-shader)

**Why**: Worst code quality in the legacy set. 6 `any` types, inline GLSL shaders (70 lines), semi-monolithic 449-line main component with the R3F `Scene` defined as an inner component, deep lucide icon imports, `alert()` for error handling, `setTimeout(() => {}, 0)` anti-pattern. Despite this, the concept (tomographic depth map viewer with cursor/device tilt) is visually striking and works on mobile.

**What it gains from v2**:

- `ExperimentCanvas` with `tempus`, `adaptive`, `errorFallback` props
- R3F dev tools: scene inspector, debug camera (`O`/`G` keys), `r3f-perf` panel
- Shader extraction to `shaders/` files
- Component decomposition: Scene -> own file, InfoModal already separate
- Proper TypeScript (eliminate all 6 `any` usages)
- `useDeviceCapabilities` replacing the manual DeviceOrientationEvent permission flow
- Dynamic Three.js import

**Estimated scope**: Medium -- 3-4 files restructured, shader extraction, TypeScript fixes.

### 2. `velocity-responsive-design` (profile: scrollytelling)

**Why**: The only scrollytelling experiment in the legacy set, making it the prime candidate to validate `createUnifiedScroll`. Has 3 components crammed into the 317-line main file (`FlightControl` and `IntelligentScroller` defined inline). A potentially buggy `useLayoutEffect` dependency (`[lockVelocity]` instead of `[readingState]`). Uses template literal className concatenation instead of `cn()`.

**What it gains from v2**:

- `createUnifiedScroll()` with Tempus priority chain (replacing manual scroll handling)
- `?debug` mode with `window.__scrollToProgress` for AI agent scroll testing
- Proper decomposition: FlightControl, IntelligentScroller, VelocityProvider as separate files
- Fix the `useLayoutEffect` dependency bug
- GSDevTools timeline scrubber for velocity animations
- Lenis smooth scroll integration

**Estimated scope**: Medium -- component extraction + scroll system replacement.

### 3. `gravity-physics-ui-layout` (profile: interaction)

**Why**: One of only 2 experiments with hardcoded layout metadata (no experiment.json reading). matter-js is eagerly imported across 5 files (not dynamic). Contains an IIFE-in-JSX anti-pattern for window position calculation. The concept (OSX Cheetah UI with hidden gravity physics easter egg) is delightful and unique -- worth polishing.

**What it gains from v2**:

- Modern layout template (experiment.json-driven metadata, ExperimentJsonLd, analytics)
- Dynamic import of matter-js (significant bundle improvement)
- IIFE-in-JSX replaced with proper `useMemo` computation
- `useDevControls` for tweaking physics parameters (gravity, friction, restitution) via Leva
- `prefers-reduced-motion` handling (physics simulation is heavy motion)
- Device capability detection (mobile currently blocked entirely)

**Estimated scope**: Medium-high -- layout rewrite, dynamic imports across 5 files, IIFE refactor.

### 4. `keyboard-keys` (profile: interaction)

**Why**: Most monolithic legacy experiment. 541-line main component with `handleKeyDown` and `handleKeyClick` sharing ~80% identical logic (lines 80-257 are near-duplicates). Confetti particle system with 45+ inline style calculations. Keyframe animations in a JSX `<style>` tag instead of CSS. Only a single `Key.tsx` sub-component extracted. Zero heavy dependencies (pure Tailwind + React), making this the lowest-risk modernization.

**What it gains from v2**:

- Decomposition: extract `Confetti` component, `useKeyboardSequence` hook, `keyframes.css`
- Deduplicate handlers into a single `handleKeyAction(source: 'keyboard' | 'click')` function
- Move confetti particles to CSS animations (eliminating per-frame inline style computation)
- `useDevControls` for sequence timing, confetti density, key press duration
- `prefers-reduced-motion`: disable confetti, reduce shake animation
- Test file scaffold (pure DOM logic is highly testable)

**Estimated scope**: Low-medium -- decomposition + deduplication, no dependency changes.

### 5. `life-3d` (profile: r3f-scene)

**Why**: Already the best-structured R3F experiment (clean SimulationEngine separation, VoxelGrid rendering, Controls UI, useLife3d hook, presets data file). But it eagerly imports Three.js, drei, AND `@react-three/postprocessing` (Bloom, ChromaticAberration, Noise, Vignette) -- one of the heaviest bundle profiles. The 3D Game of Life concept is the most computationally interesting experiment in the lab.

**What it gains from v2**:

- `ExperimentCanvas` with `tempus` (unified RAF), `adaptive` (auto DPR scaling), `errorFallback`
- R3F dev tools: scene inspector (voxel grid structure), debug camera, `r3f-perf` for GPU profiling
- Dynamic imports for Three.js and postprocessing
- `useDevControls` for simulation speed, grid size, preset selection, postprocessing intensity
- `useDeviceCapabilities` to conditionally disable postprocessing on weaker devices
- Demonstrates that even a well-structured experiment benefits from v2 tooling

**Estimated scope**: Low -- mostly wrapping existing clean code in v2 infrastructure.

### 6. `transit-airport-split-flap-display` (profile: web-audio)

**Why**: The only web-audio experiment, covering a profile no other candidate touches. Already high quality code (good hook extraction, custom `useFlapSound` and `useTransitData`), but the 390-line main component is dense with JSX and the fluid CSS variable system uses heavy inline styles. The split-flap concept with manually synthesized Web Audio sound effects is one of the most polished and visually distinctive experiments.

**What it gains from v2**:

- `useDevControls` for flap timing, sound volume, transit agency selection, refresh interval
- `?debug` mode for Web Audio inspection (AudioContext state, active nodes)
- `prefers-reduced-motion`: disable flap animation, use instant text swap
- Header/footer extracted to sub-components (main under 200 lines)
- Test scaffold for the `useTransitData` hook (pure data logic)
- Content constellation candidate -- this experiment is highly publishable

**Estimated scope**: Low -- already clean, mostly additive (dev controls, decomposition, motion handling).

---

## Profile Coverage Matrix


| Profile        | Candidate                                | Status                                                        |
| -------------- | ---------------------------------------- | ------------------------------------------------------------- |
| r3f-shader     | cursor-depth-explorer                    | Covered                                                       |
| scrollytelling | velocity-responsive-design               | Covered                                                       |
| interaction    | gravity-physics-ui-layout, keyboard-keys | Covered (x2)                                                  |
| r3f-scene      | life-3d                                  | Covered                                                       |
| web-audio      | transit-airport-split-flap-display       | Covered                                                       |
| dom-effect     | --                                       | Not covered (terminal-cat, bugged-out-gol are lower priority) |
| blank          | --                                       | N/A                                                           |


This selection covers 5 of 7 profiles, validating the v2 system across R3F rendering, scroll animation, physics interaction, pure DOM, 3D simulation, and audio synthesis.

## Modernization Checklist (Common to All 6)

Each modernized experiment would receive:

- Layout upgraded to v2 template (experiment.json-driven metadata, DevToolsInjector, ExperimentJsonLd, ExperimentNav, analytics, fonts, theme)
- Component decomposition to meet line budgets (orchestrator ~120, section ~90, hook ~50)
- Dynamic imports for heavy dependencies (Three.js, GSAP, matter-js, postprocessing)
- `prefers-reduced-motion` handling with `gsap.set` fallbacks
- TypeScript cleanup (eliminate all `any` usages)
- Test file scaffold with at least smoke test
- `?debug` mode integration
- `experiment.json` updated: remove `legacy: true`, verify all metadata fields
- Profile-specific dev controls via `useDevControls`

## Suggested Execution Order

1. **keyboard-keys** -- Lowest risk (pure DOM), validates decomposition workflow
2. **life-3d** -- Low risk (already clean), validates R3F tooling integration
3. **transit-airport-split-flap-display** -- Low risk, validates web-audio profile
4. **velocity-responsive-design** -- Medium risk, validates createUnifiedScroll migration
5. **cursor-depth-explorer** -- Medium risk, most TypeScript cleanup needed
6. **gravity-physics-ui-layout** -- Highest risk (layout rewrite + physics dynamic imports)

## Notable Omissions

- **send-button**: Already high quality, minimal modernization needed. Better left as a "before/after" reference.
- **404-not-found**: Already has full content constellation and is well-decomposed. Low ROI.
- **basketball-replay-center**: Already has full content constellation. Uses inline styles throughout but that's stylistic, not structural.
- **non-euclidean-hyperbolic-workspace**: Clean math implementation, would mainly gain hook extraction. Lower priority than experiments that gain toolkit integration.
- **mountain-transition**: Only needs dynamic imports -- too small a modernization to warrant bypassing the legacy rule.
- **shader-landing**: Lowest quality experiment but also lowest visual impact. Not worth the investment.

