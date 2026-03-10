---
name: Announcing V2 Experiment
overview: Create a complex, mixed-profile "Announcing V2" experiment that combines CRT shader 3D, pinned scroll choreography, clip-path reveals, character-grid hover effects, and parallax depth -- showcasing how AI agents enable rapid creation of production-quality creative coding.
todos:
  - id: scaffold
    content: Scaffold experiment with `npm run new:experiment:auto`, update experiment.json to mixed profile
    status: completed
  - id: store-data
    content: Create Zustand store (store.ts) and data constants (data.ts) with experiment list (slugs, titles, poster paths), section content, config
    status: completed
  - id: orchestrator
    content: "Build thin orchestrator (AnnouncingV2.tsx): createUnifiedScroll, layer-cake layout, GlobalScene canvas, section composition"
    status: completed
  - id: shaders
    content: Write CRT shader (crtShader.ts) and atmospheric background shader (heroShader.ts) adapted from CodeGrid CRT reference
    status: completed
  - id: canvas
    content: "Build R3F canvas layer: GlobalScene.tsx, CRTMonitor.tsx (ShaderMaterial with CRT effect), AtmosphericBG.tsx"
    status: completed
  - id: preloader
    content: "Build PreloaderSection: counter animation 0-100, SplitText char exit, clip-path polygon reveal"
    status: completed
  - id: hero
    content: "Build HeroSection: pinned multi-phase scroll, CSS perspective depth zoom, mask-composite shaped viewport"
    status: completed
  - id: manifesto
    content: "Build ManifestoSection: scroll-driven line-by-line text reveals"
    status: completed
  - id: toolkit
    content: "Build ToolkitSection: CRT monitor displays real experiment poster.jpg previews, hover experiment list to switch with glitch transition, mouse-follow parallax"
    status: completed
  - id: ai-bridge
    content: "Build AIBridgeSection + CharacterGrid component: proximity-based symbol grid hover with cluster spread and decay"
    status: completed
  - id: metrics
    content: "Build MetricsSection: scroll-triggered counter animations, experiment preview grid"
    status: completed
  - id: closing
    content: "Build ClosingSection: clip-path final reveal, spring-animated CTA"
    status: completed
  - id: mobile-a11y
    content: Add mobile fallbacks (feature-gate R3F) and prefers-reduced-motion support across all sections
    status: completed
  - id: polish
    content: "Visual polish pass: typography, spacing, color palette, transition timing, scroll pacing"
    status: completed
isProject: false
---

# Announcing V2 -- Mixed-Profile Experiment

## Concept

A scroll-driven landing page announcing the v2 of your experiments website. The narrative: "AI agents let me build things like this -- 3D, shaders, scroll animation, interaction -- faster and better." Each section showcases a different technique drawn from the five CodeGrid references, unified into one cohesive experience.

## Techniques Sourced from Each Reference

- **CRT Display** (3D CRT monitor): R3F scene with a CRT shader (scanlines, chromatic aberration, vignette, glitch transitions) displaying experiment previews on a 3D monitor model -- or a flat-screen plane with CRT post-processing
- **Inversa Scroll** (pinned scroll choreography): Multi-phase pinned hero with CSS `mask-composite: subtract` shaped viewport reveal, desaturation/color grading driven by scroll progress, piecewise smoothstep easing
- **JeskoJets Scroll** (parallax depth zoom): CSS `perspective` + `translateZ` for 3D text depth, window-frame zoom reveal (scale 1x to 4x), parallax sky/background panning
- **Laser Reveal** (cinematic entrance): Preloader counter (0-100) with SplitText char exit, `clip-path: polygon()` expanding rectangle reveal, staggered masked text entrances
- **Fiddle Hover** (character-grid interaction): Proximity-based symbol grid overlay on images/sections, cluster-spreading activation with temporal decay, scrambling glitch symbols

## Architecture

**Profile**: `mixed` (scrollytelling + r3f-shader + interaction + dom-effect)

**Layer-cake pattern**:

- Fixed R3F `<Canvas>` at z-index 0 (CRT monitor scene, atmospheric background)
- Scrolling DOM at z-index 1 (sections with GSAP ScrollTrigger)
- Tempus priority chain: Lenis (-1), GSAP (0), Three.js render (1)
- Zustand store bridges scroll progress and active section to R3F

## Section Breakdown (7 sections)

### 1. Preloader / Entrance (Laser technique)

- Counter 0-100 with massive typography, `scale(0.25)` to `1`
- SplitText char stagger exit on completion
- Clip-path polygon reveal: point -> small rect -> full viewport
- Reveals the hero section beneath

### 2. Hero Section (JeskoJets + Inversa techniques)

- Pinned for ~3x viewport scroll distance
- Background: R3F canvas shows through (atmospheric shader -- noise/gradient)
- CSS `perspective` + `translateZ` on the main title "V2" with depth zoom
- Barcode/geometric mask shape that scales with scroll progress (Inversa-style)
- Phase-based scroll: mask shrinks -> content desaturates -> text reveals

### 3. Manifesto Section (Scroll text reveals)

- "What if building for the web felt like sketching?" narrative
- Staggered line-by-line text reveals on scroll (GSAP SplitText or word-level)
- Minimal, typographic, editorial feel

### 4. Experiment Showcase (CRT Display technique)

- A 3D CRT monitor rendered in the R3F canvas layer
- A scrollable list of shipped experiments (titles from experiment.json) alongside the monitor
- Hovering over an experiment name loads its `poster.jpg` onto the CRT screen with a glitch transition (chromatic aberration burst, scanline jitter, noise flash, then settle)
- CRT shader: scanlines, RGB sub-pixel columns, chromatic aberration, vignette, static noise
- Mouse-follow parallax rotation on the monitor group
- 14 experiments have `poster.jpg` available on disk at `/experiments/<slug>/poster.jpg`
- `data.ts` holds the curated experiment list: slug, title, poster path (sourced from experiment.json metadata)
- Texture caching to avoid redundant loads on re-hover (same pattern as CodeGrid CRT reference)

### 5. AI Bridge Section (Fiddle Hover technique)

- "AI agents as creative partners" narrative
- Code/terminal-themed section with character-grid hover effect
- Moving cursor reveals dark blocks with symbols (`>`, `$`, `*`) over content
- Cluster-spreading activation, temporal decay, scramble effect

### 6. Metrics/Architecture Section (Data visualization)

- Scroll-driven reveal of build metrics (experiments shipped, lines of code, etc.)
- Counter animations (number ticking up)
- Horizontal scroll carousel or grid of experiment previews

### 7. Closing Section (Combined techniques)

- Full clip-path reveal of a final hero image/gradient
- "V2 is live" with spring-animated CTA
- Outro with parallax depth exit

## File Structure

```
src/app/experiments/(announcing-v2)/
  layout.tsx
  experiment.json          profile: "mixed", complexity: "advanced"
  announcing-v2/
    page.tsx
    error.tsx

src/components/experiments/announcing-v2/
  AnnouncingV2.tsx          Orchestrator (~120 lines)
  data.ts                   Section content, experiment list (slug/title/poster), config
  store.ts                  Zustand (scrollProgress, activeSection, activeExperiment)
  hooks.ts                  usePrefersReducedMotion, useDeviceCapabilities
  shaders/
    crtShader.ts            CRT fragment/vertex (from CRT display ref)
    heroShader.ts           Atmospheric background shader
  sections/
    PreloaderSection.tsx    Counter + clip-path reveal
    HeroSection.tsx         Pinned parallax hero with mask
    ManifestoSection.tsx    Text reveals
    ShowcaseSection.tsx     CRT monitor with experiment previews
    AIBridgeSection.tsx     Character-grid hover
    MetricsSection.tsx      Data counters + experiment grid
    ClosingSection.tsx      Final reveal + CTA
  canvas/
    GlobalScene.tsx         R3F scene root (reads store)
    CRTMonitor.tsx          3D monitor with CRT ShaderMaterial
    AtmosphericBG.tsx       Noise/gradient background
  components/
    CharacterGrid.tsx       Fiddle-style hover grid overlay
    ClipPathReveal.tsx      Reusable clip-path polygon animator
    SplitTextReveal.tsx     GSAP SplitText wrapper

public/experiments/announcing-v2/
  .gitkeep
```

## Tech Stack for This Experiment

- **Lenis** + **GSAP ScrollTrigger** via `createUnifiedScroll()` -- scroll narrative
- **R3F** + **Three.js** -- CRT monitor, atmospheric shaders
- **GLSL** -- CRT shader (scanlines, chromatic aberration, glitch), hero atmospheric
- **GSAP SplitText** -- text animation reveals
- **Motion** -- spring CTA, layout animations
- **Zustand** -- DOM-to-R3F state bridge
- **Tempus** -- unified RAF priority chain

## Key Implementation Notes

- Scaffold with: `npm run new:experiment:auto -- --name "announcing-v2" --profile scrollytelling --toolkit --complexity advanced --description "A showcase of the v2 platform: AI-native creative coding, rebuilt from the ground up."`
- Then manually update `experiment.json` profile to `"mixed"` and tech array to `["lenis", "gsap", "r3f", "glsl", "motion", "zustand"]`
- Previous attempt was deleted but not committed -- we start fresh
- Each section is self-contained with its own `useGSAP` scope per the mixed profile rules
- CRT shader is adapted from the CodeGrid reference (vanilla Three.js -> R3F ShaderMaterial)
- Character grid hover is adapted from Fiddle reference (vanilla JS -> React component with refs)
- Mobile: feature-gate R3F canvas, simplify to DOM-only scroll experience
- `prefers-reduced-motion`: use `gsap.set` fallbacks, skip scroll-driven 3D

