---
name: Modernize velocity-responsive-design
overview: "Comprehensive v2 modernization of the velocity-responsive-design legacy experiment: Lenis-native velocity rewrite, component decomposition, dev controls, reduced motion, tests, and content constellation readiness. This would be the first fully modernized legacy experiment -- pioneering v2 standards."
todos:
  - id: decompose
    content: "Extract FlightControl.tsx, IntelligentScroller.tsx, hooks/useScrollStabilizer.ts from 317-line main. Orchestrator target: ~100 lines."
    status: completed
  - id: velocity-rewrite
    content: Rewrite VelocityContext to use Lenis-native velocity (useLenis hook) instead of Motion useScroll/useVelocity/useSpring. Wire through createUnifiedScroll.
    status: completed
  - id: bugfixes
    content: Fix useLayoutEffect [readingState] dep, SpeedLines React.FC type, template literal classNames -> cn(), as any cast
    status: completed
  - id: dev-controls
    content: Add useDevControls for velocity thresholds, spring configs, timing. Add ?debug mode with window.__velocityState.
    status: completed
  - id: reduced-motion
    content: "Add useReducedMotion() from Motion at context level. SpeedLines: skip RAF. VelocityText/Image/CodeBlock: instant transitions. Context: lock to detailed mode."
    status: completed
  - id: metadata
    content: "Remove legacy:true, fix README.md stale thresholds, add updated timestamp, set articleLenses: [concept, implementation]"
    status: completed
  - id: tests
    content: "Scaffold test file: smoke test, VelocityContext state machine tests (hysteresis, lock, reduced motion), IntelligentScroller scroll correction test"
    status: completed
  - id: verify
    content: "Run tsc --noEmit, lint, build. Visual QA with pinchtab/browser-devtools: verify Lenis velocity tracking, reading state transitions, reduced motion, debug mode."
    status: completed
isProject: false
---

# Modernize velocity-responsive-design (S-Tier)

## Context

This is the first legacy experiment to be fully modernized to v2 standards. No gold standard reference exists yet -- all 18 shipped experiments are legacy, and announcing-v2 is WIP. This modernization pioneers the v2 patterns for scrollytelling-profile experiments and establishes the reference implementation for future legacy upgrades.

**Agent docs consulted**: scrollytelling profile, interaction profile, dom-effect profile, experiments rules, animations rules, scroll rules, performance rules, lenis-scroll skill, motion-react skill, tempus-raf skill, gsap-modern skill, porting-demos skill (phases 6+8), visual-qa skill, develop-experiment workflow, add-experiment-component workflow, publish-experiment workflow, experiment-components cursor rule, experiment-metadata cursor rule, architecture context, toolkit context, content-constellation context, writing-voice context, memory.md.

## Current State

The experiment is a "Relativistic Reader" that adapts content density based on scroll velocity. Currently uses Motion's `useScroll` -> `useVelocity` -> `useSpring` pipeline with hysteresis thresholds to toggle between "detailed" and "skim" reading modes. A canvas particle system (`SpeedLines`) provides visual feedback.

**Files** (all in `src/components/experiments/velocity-responsive-design/`):

- [VelocityResponsiveDesign.tsx](src/components/experiments/velocity-responsive-design/VelocityResponsiveDesign.tsx) -- 317 lines, 3 inline components (over 300-line hard limit)
- [VelocityContext.tsx](src/components/experiments/velocity-responsive-design/VelocityContext.tsx) -- 188 lines, core velocity state machine
- [SpeedLines.tsx](src/components/experiments/velocity-responsive-design/SpeedLines.tsx) -- 120 lines, canvas particle overlay
- [VelocityText.tsx](src/components/experiments/velocity-responsive-design/VelocityText.tsx) -- 66 lines
- [VelocityImage.tsx](src/components/experiments/velocity-responsive-design/VelocityImage.tsx) -- 124 lines
- [VelocityCodeBlock.tsx](src/components/experiments/velocity-responsive-design/VelocityCodeBlock.tsx) -- 87 lines
- [constants.ts](src/components/experiments/velocity-responsive-design/constants.ts) -- 40 lines
- [content.ts](src/components/experiments/velocity-responsive-design/content.ts) -- 119 lines

## Known Issues

1. `**useLayoutEffect` dependency bug** (lines 199-223): depends on `[lockVelocity]` but should include `[readingState]` -- the effect must fire when reading state changes to stabilize scroll position during content morphs
2. **3 inline components** in main file: `StaticBackgroundPattern`, `FlightControl` (119 lines), `IntelligentScroller` (87 lines) push file to 317 lines
3. **Template literal classNames** instead of `cn()` (lines 113, 137)
4. `**behavior: "instant" as any`** type cast (line 221)
5. **SpeedLines.tsx** uses `React.FC` without importing React
6. **README.md** documents thresholds as 2000/200 but `constants.ts` has 2500/400
7. **No reduced motion handling** anywhere -- SpeedLines canvas, content morphing, spring transitions all ignore `prefers-reduced-motion`
8. **No dev controls** -- all thresholds hardcoded, no `?debug` parameter support
9. **No Lenis smooth scroll** -- raw browser scroll with Motion velocity tracking
10. **No tests**

## Architectural Decision: Lenis-Native Velocity

**Decision**: Replace Motion's `useScroll` -> `useVelocity` -> `useSpring` pipeline with Lenis's native `velocity` property accessed via `useLenis()`.

**Rationale**: With `createUnifiedScroll`, Lenis owns the scroll at Tempus priority -1. Reading velocity from the scroll owner is more reliable than layering Motion's velocity estimation on top. Lenis's velocity is already frame-synchronized via Tempus.

**Impact on VelocityContext.tsx**: This is the most significant refactor. The context currently subscribes to Motion's `smoothVelocity` MotionValue via `.on("change")`. It will instead use `useLenis((lenis) => ...)` callback which fires every scroll frame with direct access to `lenis.velocity`, `lenis.direction`, `lenis.progress`.

**What gets removed**: `useScroll`, `useVelocity`, `useSpring` imports from Motion. The spring-smoothed velocity pipeline (lines 26-33 of VelocityContext.tsx).

**What stays**: The hysteresis state machine (`updateReadingState`), the `lockVelocity` mechanism, the manual override system, the normalized velocity computation. These are the experiment's core logic -- they just get a different velocity input source.

**Manual override**: When `manualVelocity !== null`, the context bypasses Lenis velocity and uses the slider value directly (unchanged behavior).

```tsx
import { useLenis } from "lenis/react";

useLenis((lenis) => {
  if (isVelocityLocked || manualVelocity !== null) return;
  const absV = Math.floor(Math.abs(lenis.velocity));
  if (absV !== scrollV) {
    setScrollV(absV);
    updateReadingState(absV);
  }
});
```

**Lenis velocity units**: Lenis reports velocity in px/s (same as Motion's useVelocity), so existing thresholds (SKIM_ENTER: 2500, SKIM_EXIT: 400) should work without recalibration. However, Lenis's velocity may be smoother out-of-the-box due to its lerp -- the thresholds may need tuning via dev controls. This is a visual verification point.

---

## Modernization Plan

### Phase 1: Component Decomposition

Target structure following experiment-components cursor rule size targets:

```
src/components/experiments/velocity-responsive-design/
  VelocityResponsiveDesign.tsx    ~100 lines  Orchestrator (createUnifiedScroll, composition)
  FlightControl.tsx               ~120 lines  Extracted velocity control bar
  IntelligentScroller.tsx         ~50 lines   Scroll stabilizer wrapper (thin, delegates to hook)
  SpeedLines.tsx                  ~120 lines  Canvas particle overlay (existing, fix types)
  VelocityContext.tsx             ~150 lines  Rewritten with Lenis-native velocity
  VelocityText.tsx                ~70 lines   Existing + reduced motion
  VelocityImage.tsx               ~130 lines  Existing + reduced motion
  VelocityCodeBlock.tsx           ~90 lines   Existing + reduced motion
  hooks/
    useScrollStabilizer.ts        ~60 lines   Extracted from IntelligentScroller (anchor logic + useLayoutEffect)
  constants.ts                    ~40 lines   Fallback defaults for dev controls
  content.ts                      ~119 lines  Existing, unchanged
```

**Extractions**:

- `**FlightControl.tsx`** -- lines 27-145 of main. Self-contained velocity UI. Consumes `useVelocityState()`. Apply interaction profile patterns: spring-physics slider, Fitts's Law touch targets (44x44px minimum), `cn()` classNames.
- `**IntelligentScroller.tsx`** -- thin wrapper (~50 lines) that calls `useScrollStabilizer` hook and renders `<main>` with content children.
- `**hooks/useScrollStabilizer.ts**` -- extracted anchor-tracking + `useLayoutEffect` scroll correction logic (currently lines 147-233). Fix the `[readingState, lockVelocity]` dependency bug here. Hook target: ~60 lines.
- `**StaticBackgroundPattern**` -- stays inline in orchestrator (10 lines, pure presentational).

**Orchestrator** becomes: `createUnifiedScroll` lifecycle, `VelocityProvider` wrapper, header section, `IntelligentScroller` (content map), `FlightControl`, footer, `SpeedLines` overlay. Zero animation code in the orchestrator -- all velocity logic is in the context, all stabilization in the hook.

### Phase 2: Lenis Integration + Velocity Rewrite

This is the core architectural change. Two sub-steps:

**2a. createUnifiedScroll in orchestrator** (from scroll rules + scrollytelling profile):

```tsx
import { createUnifiedScroll } from "@/lib/toolkit/scroll";
import type { UnifiedScrollHandle } from "@/lib/toolkit/scroll";

const scrollRef = useRef<UnifiedScrollHandle | null>(null);

useLayoutEffect(() => {
  const isDebug = new URLSearchParams(window.location.search).has("debug");
  scrollRef.current = createUnifiedScroll({ debug: isDebug });
  ScrollTrigger.refresh();
  return () => {
    scrollRef.current?.destroy();
    scrollRef.current = null;
  };
}, []);
```

`useLayoutEffect` (not `useEffect`) per scroll rules: ensures Lenis + ScrollTrigger.refresh runs before paint, so child hooks that depend on Lenis see it immediately. `ScrollTrigger.refresh()` called after init per memory.md fact.

**2b. Rewrite VelocityContext.tsx** to consume Lenis velocity:

- Remove: `useScroll`, `useVelocity`, `useSpring` from `motion/react`
- Add: `useLenis` from `lenis/react`
- The `useLenis` callback fires every scroll frame (driven by Tempus at priority -1). It replaces the `smoothVelocity.on("change")` subscription.
- Keep: `updateReadingState` hysteresis logic, `lockVelocity`, manual override, `normalizedVelocity`, `isScrolling` -- all unchanged except input source.
- The `scrollY.on("change")` effect (lines 132-139, resets state at top of page) becomes: check `lenis.scroll <= 0` inside the `useLenis` callback.

**Lenis lerp consideration**: Lenis already smooths scroll via its `lerp` option (default 0.1). The old Motion `useSpring` provided similar smoothing. Lenis's built-in smoothing may be sufficient -- if not, we can tune `lerp` via dev controls. This eliminates the need for a separate spring-smoothing layer.

### Phase 3: Bug Fixes and TypeScript Cleanup

- **Fix `useLayoutEffect` dependency** in `useScrollStabilizer`: `[readingState, lockVelocity]` (readingState triggers content morph -> layout shift -> correction needed).
- **Fix SpeedLines.tsx**: Remove `React.FC` type annotation (component has no props, just `export function SpeedLines() {`). Fix the missing React import for JSX if needed.
- **Replace template literal classNames** with `cn()` from `@/lib/utils`:
  - FlightControl button (line 113): `cn("rounded-xl p-2.5 transition-all duration-300", manualVelocity !== null ? "bg-primary text-black shadow-..." : "bg-white/5 text-zinc-400 hover:bg-white/10")`
  - Reading state display (line 137): `cn("font-black text-sm uppercase leading-none tracking-tighter", readingState === "skim" ? "text-primary" : "text-blue-400")`
- **Fix `as any` cast** (line 221): `behavior: "instant" as ScrollBehavior`
- **Fix array index keys**: content map uses `key={i}` -- acceptable since CONTENT is static and never reorders.

### Phase 4: Dev Controls and Debug Mode

**Dev controls** via `useDevControls` (from `@/hooks/useDevControls`). Tree-shakes in production per memory.md. Controls go in VelocityContext since they parameterize the state machine:

```tsx
const thresholds = useDevControls("Velocity Thresholds", {
  skimEnter: { value: VELOCITY_THRESHOLDS.SKIM_ENTER, min: 500, max: 5000, step: 100 },
  skimExit: { value: VELOCITY_THRESHOLDS.SKIM_EXIT, min: 50, max: 2000, step: 50 },
  skimExitDelay: { value: TIMINGS.SKIM_EXIT_DELAY, min: 500, max: 5000, step: 100 },
  normalizationMax: { value: VELOCITY_THRESHOLDS.NORMALIZATION_MAX, min: 1000, max: 6000, step: 100 },
  lenisLerp: { value: 0.1, min: 0.01, max: 0.3, step: 0.01 },
});
```

`constants.ts` becomes the fallback defaults. Dev controls override them in `?debug` mode.

**Debug mode** (`?debug` query param):

- `createUnifiedScroll({ debug: true })` exposes `window.__lenis`, `window.__scrollToProgress`, `window.__scrollToSection` (for MCP scroll testing per visual-qa skill)
- Additionally expose `window.__velocityState` for AI agent testing:

```tsx
  if (isDebug) {
    (window as any).__velocityState = {
      velocity, normalizedVelocity, readingState, isScrolling, manualVelocity,
      setManualVelocity: handleSetManualVelocity,
    };
  }
  

```

### Phase 5: Reduced Motion Handling

Strategy: check `prefers-reduced-motion` once at the context level, expose `reducedMotion` flag on the context, let each component adapt. Per interaction profile and motion-react skill, use Motion's `useReducedMotion()` hook.

**VelocityContext.tsx**:

- Add `const reducedMotion = useReducedMotion()` (from `motion/react`)
- When `reducedMotion === true`: lock to "detailed" reading state permanently -- the rapid content morphing between detailed/skim IS the significant motion effect. Users with reduced motion preference get the full content, no velocity-triggered state changes.
- Expose `reducedMotion` on context value.

**SpeedLines.tsx** (dom-effect profile: progressive enhancement):

- When `reducedMotion`: skip the `requestAnimationFrame` loop entirely. Canvas stays mounted but blank (don't return early per animations rules -- component must still render).
- Content works without the speed lines effect -- it's additive visual polish.

**VelocityText.tsx**:

- When `reducedMotion`: disable spring transitions (`transition={{ duration: 0 }}`). No "streak" glow effect. Instant text swap.

**VelocityImage.tsx**:

- When `reducedMotion`: disable parallax `y` offset and glow halo. Keep image visibility toggle (structural behavior, not decorative motion).

**VelocityCodeBlock.tsx**:

- When `reducedMotion`: disable `AnimatePresence` spring transitions on expand/collapse. Instant swap.

**FlightControl.tsx**:

- When `reducedMotion`: disable slider spring animation, disable settings icon spin. Keep the UI functional -- it's an interaction component (interaction profile: "the interaction still works, it just doesn't bounce").

### Phase 6: Metadata and Documentation

- `**experiment.json`**: remove `"legacy": true`. Add `"updated"` timestamp. Set `"articleLenses": ["concept", "implementation"]` per experiment-metadata cursor rule -- this experiment is prime concept-heavy article material (kinetic intent, cognitive bandwidth, velocity-adaptive UI). Writing-voice.md explicitly calls it out.
- `**README.md`**: fix stale threshold values (2000/200 -> 2500/400). Add v2 modernization notes (Lenis-native velocity, dev controls, reduced motion).
- Keep `"content": {}` for now -- content constellation is a post-modernization step via the publish-experiment workflow.

### Phase 7: Test Scaffold

Create [VelocityResponsiveDesign.test.tsx](src/components/experiments/velocity-responsive-design/VelocityResponsiveDesign.test.tsx). Follow the announcing-v2 mock pattern: dynamic imports, comprehensive stubs for Lenis/Motion/canvas.

**Mocks needed**:

- `@/lib/toolkit/scroll` -- stub `createUnifiedScroll` returning `{ lenis: { on: vi.fn(), velocity: 0 }, destroy: vi.fn() }`
- `lenis/react` -- stub `useLenis` to call the callback with mock lenis data
- `motion/react` -- stub `motion`, `AnimatePresence`, `useReducedMotion`
- `@/hooks/useDevControls` -- stub returning default values
- Canvas `getContext('2d')` for SpeedLines

**Tests**:

- **Smoke test**: `VelocityResponsiveDesign` renders without crashing (dynamic import)
- **VelocityContext state machine**: test the hysteresis logic in isolation:
  - detailed -> skim when velocity exceeds SKIM_ENTER
  - skim -> detailed after SKIM_EXIT_DELAY when velocity drops below SKIM_EXIT
  - intermediate zone (between exit and enter) cancels exit timer
  - `lockVelocity` freezes tracking temporarily
  - `reducedMotion` locks to "detailed" permanently
- **useScrollStabilizer**: scroll correction fires on `readingState` change (the fixed bug)

### Phase 8: Visual QA and Verification

**Build verification**:

- `tsc --noEmit` -- no type errors
- `npm run lint` (`ultracite check`) -- clean
- `npm run build` -- builds successfully

**Visual QA** (per visual-qa workflow, 8-category structured review with pinchtab/browser-devtools):

- Verify Lenis velocity tracking produces smooth, reliable readings at various scroll speeds
- Verify hysteresis transitions: fast scroll -> skim mode -> stop -> 2.5s delay -> detailed mode
- Verify IntelligentScroller: content doesn't jump when switching between reading states
- Verify SpeedLines: particles radiate from center proportional to velocity, disappear when stopped
- Verify reduced motion: all effects disabled, content locked to detailed mode
- Verify `?debug`: Leva panel shows velocity controls, `window.__scrollToProgress(0.5)` works via MCP eval
- Verify FlightControl: slider tracks velocity, manual override works, 44px+ touch targets
- Check `[DevMetrics]` in console: FPS >55, heap stable, no memory leaks

**User must visually verify**: Lenis velocity thresholds may need recalibration since Lenis smoothing differs from Motion's useSpring. Dev controls make this tunable without code changes.

## File Change Summary


| File                                | Action                                                                                   | Size Target |
| ----------------------------------- | ---------------------------------------------------------------------------------------- | ----------- |
| `VelocityResponsiveDesign.tsx`      | Slim to orchestrator: createUnifiedScroll lifecycle, composition                         | ~100 lines  |
| `FlightControl.tsx`                 | **New** -- extracted velocity control bar, cn() classNames, interaction profile patterns | ~120 lines  |
| `IntelligentScroller.tsx`           | **New** -- thin wrapper delegating to useScrollStabilizer hook                           | ~50 lines   |
| `hooks/useScrollStabilizer.ts`      | **New** -- anchor-tracking + useLayoutEffect scroll correction, fixed deps               | ~60 lines   |
| `VelocityContext.tsx`               | **Rewrite** -- Lenis-native velocity, useDevControls, useReducedMotion, debug exports    | ~150 lines  |
| `SpeedLines.tsx`                    | Fix React.FC type, add reduced motion skip                                               | ~120 lines  |
| `VelocityText.tsx`                  | Add reduced motion instant transitions                                                   | ~70 lines   |
| `VelocityImage.tsx`                 | Add reduced motion (no parallax/glow)                                                    | ~130 lines  |
| `VelocityCodeBlock.tsx`             | Add reduced motion instant swap                                                          | ~90 lines   |
| `constants.ts`                      | Unchanged -- becomes fallback defaults for dev controls                                  | 40 lines    |
| `content.ts`                        | Unchanged                                                                                | 119 lines   |
| `experiment.json`                   | Remove `legacy: true`, add `updated`, add `articleLenses`                                | --          |
| `README.md`                         | Fix stale thresholds, add v2 notes                                                       | --          |
| `VelocityResponsiveDesign.test.tsx` | **New** -- smoke + context state machine + stabilizer tests                              | ~100 lines  |


## Risk Assessment


| Risk                                                                            | Mitigation                                                                                                                                         |
| ------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------- |
| Lenis velocity units differ from Motion's useVelocity                           | Same units (px/s). Dev controls allow runtime threshold tuning.                                                                                    |
| Lenis lerp smoothing is too aggressive or too subtle                            | `lenisLerp` exposed as dev control. Default 0.1 matches darkroom defaults.                                                                         |
| useLenis callback doesn't fire when Lenis is paused/stopped                     | Manual override bypasses Lenis entirely (existing behavior preserved).                                                                             |
| IntelligentScroller scroll correction interacts poorly with Lenis smooth scroll | `lockVelocity` already neutralizes during programmatic scrolls. Lenis `scrollTo` can be used instead of `window.scrollBy` for smoother correction. |
| First v2 modernization -- no reference to compare against                       | Comprehensive test coverage + visual QA workflow. This becomes the reference for future modernizations.                                            |


