---
name: V2 Experiment Polish
overview: Comprehensive audit, bug fixing, visual QA, and design polish of the "Introducing V2" showcase experiment (kinetic-typography-scroll) to bring it from WIP to a launch-ready state that demonstrates the full V2 platform.
todos:
  - id: fix-hero-setstate
    content: Replace setHeroScroll setState-on-scroll with ref pattern (like spreadRef) to eliminate React re-renders during scroll
    status: completed
  - id: fix-missing-font
    content: Fix missing /fonts/inter-var.woff2 in ArchitectureScene -- either add the font file or switch to Drei default font
    status: completed
  - id: fix-shader-raf
    content: Integrate HeroShaderCanvas rAF loop with Tempus (priority 1) or document why it's intentionally independent
    status: completed
  - id: fix-r3f-devtools
    content: Add R3FDevToolsInjector inside ArchitectureScene Canvas for ?debug support
    status: completed
  - id: fix-stale-next-types
    content: Clean .next/types cache to resolve stale vfb-test TS errors
    status: completed
  - id: visual-qa-mcp
    content: "Run visual QA using pinchtab/Browser DevTools MCPs: navigate, screenshot, check FPS/heap, verify ?debug mode, 8-category review"
    status: completed
  - id: design-typography
    content: "Improve typography hierarchy: mix Replica/Test Die Grotesk display fonts with mono for technical elements"
    status: completed
  - id: design-color-polish
    content: "Enhance color palette and visual depth: gradient accents, marquee visibility, section backgrounds"
    status: completed
  - id: design-r3f-scene
    content: "Enrich R3F scene: better materials, more visual depth, potential post-processing"
    status: completed
  - id: accessibility-aria
    content: Add aria-labels to all 9 sections, verify reduced-motion handling
    status: completed
  - id: test-build-verify
    content: Run vitest + tsc --noEmit + next build to verify everything passes
    status: in_progress
  - id: iterate-with-user
    content: Present visual QA findings, get user feedback, iterate on design, user records preview video, flip to shipped
    status: pending
isProject: false
---

# V2 Experiment: Bug Fixes, Visual QA, and Polish

## Current State

The experiment has 9 scroll-driven sections, a GLSL shader (hero), an R3F scene (architecture), and comprehensive GSAP animations. The previous session wrote all the code and fixed the initial audit. However, **no visual QA has been done** -- the experiment has never been verified to actually work correctly in a browser.

---

## Phase 1: Code-Level Bug Fixes (Critical)

### 1.1 setState on scroll violates own rules

In [KineticTypographyScroll.tsx](src/components/experiments/kinetic-typography-scroll/KineticTypographyScroll.tsx) line 263:

```tsx
onUpdate: (self) => setHeroScroll(self.progress)
```

This calls `setState` on every scroll frame -- the exact pattern the audit flagged and fixed for the scramble section. The `heroScroll` state drives `<HeroShaderCanvas scrollProgress={heroScroll}>`, causing full component re-renders on every scroll tick.

**Fix**: Replace with a ref pattern (like `spreadRef` used for the R3F scene). Pass a `scrollRef` to `HeroShaderCanvas` and read from it in the rAF loop.

### 1.2 Missing font file in R3F scene

[ArchitectureScene.tsx](src/components/experiments/kinetic-typography-scroll/ArchitectureScene.tsx) line 68 references:

```tsx
font="/fonts/inter-var.woff2"
```

But `/public/fonts/` only contains `Replica` and `Test Die Grotesk` -- there is no `inter-var.woff2`. This will cause a 404 and the Three.js `<Text>` component will fail to render experiment names on the floating cubes.

**Fix**: Either add the inter-var font file, or switch to a system-safe font path (or omit the `font` prop to use Drei's default troika font).

### 1.3 HeroShaderCanvas runs its own rAF loop outside Tempus

The shader canvas uses `requestAnimationFrame` directly (line 161) instead of running under Tempus's unified RAF. This means:

- Two independent animation loops running in parallel
- No priority management (shader could compete with GSAP/Lenis)
- `cancelAnimationFrame` cleanup but no Tempus disposal

**Fix**: Integrate with Tempus at priority 1 (rendering, same as Three.js) for consistent frame management. If keeping the independent rAF is intentional for isolation, add a code comment explaining why.

### 1.4 No R3FDevToolsInjector in ArchitectureScene

Per architecture docs, R3F experiments get `R3FDevToolsInjector` inside `<Canvas>`. The ArchitectureScene is missing this. With `?debug`, there should be r3f-perf metrics, scene graph inspection, and debug camera controls.

**Fix**: Add `<R3FDevToolsInjector />` inside the `<Canvas>` `<Suspense>` block.

### 1.5 Stale `.next/types` cache

TypeScript reports 16 errors, all from `.next/types/validator.ts` referencing deleted `vfb-test-`* experiments.

**Fix**: Delete `.next/types` and regenerate on next build.

---

## Phase 2: Visual QA via MCP Tools

Use pinchtab and Browser DevTools MCPs to perform structured visual QA:

1. Start dev server, navigate to `/experiments/kinetic-typography-scroll?debug`
2. Take ARIA snapshot for structure verification
3. Take screenshots at key scroll positions (hero, philosophy, stats, R3F scene, toolkit, config, dev tools, marquee, credits)
4. Check console for `[DevMetrics]` FPS and heap readings
5. Verify `?debug` activates leva panel + GSDevTools
6. Run through the 8-category visual QA checklist from the [visual-qa workflow](.agent/workflows/visual-qa.md)

This phase will surface visual bugs that code inspection alone cannot find.

---

## Phase 3: Design & Polish Improvements

Based on the awwwards-animations skill, design-philosophy references, and the current code:

### 3.1 Typography hierarchy

Currently everything uses `font-mono`. For a showcase, mixing the platform's display fonts (Replica for headings, Test Die Grotesk for body) with mono for technical elements would create better visual hierarchy.

### 3.2 Color and visual depth

The palette is very monochrome (`#050505` bg, white text, `neutral-`* shades, `emerald-400` accents). For a V2 showcase, consider:

- Gradient accents on section transitions
- Slightly warmer/more varied backgrounds per section
- The shader's purple palette bleeding into section 2 as a gradient border
- Config section using the emerald accent more boldly

### 3.3 Marquee visual impact

Marquee text uses `text-neutral-800` and `text-neutral-800/50` which is extremely subtle on `#050505`. This is the "wow" moment in many award-winning sites -- it should be more visually impactful. Consider `text-neutral-700` or adding a subtle stroke/outline.

### 3.4 R3F scene enrichment

Currently 4 simple colored boxes. Could be enhanced with:

- Glass/transmission material for translucency
- Subtle post-processing (bloom on the point light)
- More experiments shown
- Grid/wireframe floor for depth perception

### 3.5 Section spacing and rhythm

Verify scroll rhythm: some sections are `min-h-screen`, some `min-h-[70vh]`, some `min-h-[200vh]`. The pacing should feel intentional as a narrative.

### 3.6 Missing interaction polish

- Hero "Scroll to explore" prompt could pulse/animate
- Credits CTA should include actual links (GitHub, portfolio)
- Dev tools section could show a mini screenshot or animated preview of what debug mode looks like

---

## Phase 4: Platform Readiness

### 4.1 Section aria-labels

Add `aria-label` to all 9 `<section>` elements for accessibility.

### 4.2 `prefers-reduced-motion` completeness

`useReducedMotion` initial state is `false` -- brief animation flash for reduced-motion users. Consider CSS `@media (prefers-reduced-motion: reduce)` for critical initial states.

### 4.3 Test verification

Run `vitest` on the test suite to confirm all 9 tests pass after changes.

### 4.4 Build verification

`tsc --noEmit` + `next build` must pass (after `.next/types` cleanup).

---

## Phase 5: Iterate with User

After fixing bugs and running visual QA through MCPs:

- Present findings and screenshots to the user
- Get user's visual feedback on design decisions
- Iterate on typography, color, spacing, and animation timing
- User records preview video when satisfied
- Flip `status: "wip"` to `"shipped"` in experiment.json

---

## Key Files

- [KineticTypographyScroll.tsx](src/components/experiments/kinetic-typography-scroll/KineticTypographyScroll.tsx) -- main component (749 lines)
- [HeroShaderCanvas.tsx](src/components/experiments/kinetic-typography-scroll/HeroShaderCanvas.tsx) -- WebGL shader (185 lines)
- [ArchitectureScene.tsx](src/components/experiments/kinetic-typography-scroll/ArchitectureScene.tsx) -- R3F scene (134 lines)
- [experiment.json](src/app/experiments/(kinetic-typography-scroll)/experiment.json) -- metadata
- [scroll.ts](src/lib/toolkit/scroll.ts) -- Lenis+Tempus+GSAP integration

