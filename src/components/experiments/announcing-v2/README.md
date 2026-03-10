# Announcing V2

A multi-section showcase experiment announcing the v2 platform. Built as a scrollytelling page that stitches together 5 ported codegrid demos into a single cohesive experience, with a preloader, scroll-pinned sections, a 3D CRT monitor, an interactive hover grid, and parallax window zoom.

**Profile**: `scrollytelling` | **Status**: `wip` | **Complexity**: `advanced`

## Architecture

This experiment follows the **multi-demo showcase pattern** from the porting skill. A thin orchestrator (`AnnouncingV2.tsx`) handles scroll initialization and section composition. Each section is a self-contained port with its own refs, animations, and scoped styles.

```
AnnouncingV2.tsx          Orchestrator: preloader gate, createUnifiedScroll, section composition
  PreloaderSection.tsx    Port of codegrid-laserbysonymusic-landing-page-reveal-animation
  InversaSection.tsx      Port of codegrid-inversa-scroll-animation-nextjs
  ShowcaseSection.tsx     Port of codegrid-3d-crt-display (DOM wrapper + project list)
    CRTMonitor.tsx        R3F component: GLTF monitor model + CRT shader screen
  FiddleHoverSection.tsx  Port of codegrid-fiddle-digital-hover-effect
  JeskoJetsSection.tsx    Port of codegrid-jeskojets-scroll-animation
```

### File map

| File | Purpose |
|------|---------|
| `AnnouncingV2.tsx` | Orchestrator. Manages preloader state, `createUnifiedScroll`, section rendering |
| `data.ts` | All text content, experiment list, grid symbols. Edit here to change copy |
| `store.ts` | Zustand store bridging DOM (mouse, active experiment) to R3F Canvas |
| `hooks.ts` | `usePrefersReducedMotion`, `useDeviceCapabilities` |
| `sections/*.tsx` | One file per section. Each owns its animation scope and scoped `<style>` |
| `canvas/CRTMonitor.tsx` | R3F scene: GLTF monitor, CRT shader, responsive camera, texture management |
| `shaders/crtShader.ts` | CRT fragment shader: scanlines, chromatic aberration, vignette, glitch |
| `shaders/heroShader.ts` | FBM noise shader (currently unused, available for hero background) |

### Data flow

```
User scroll -> Lenis (priority -1) -> GSAP ScrollTrigger (priority 0) -> section animations
User mouse  -> AnnouncingV2 store (mousePosition) -> CRTMonitor useFrame (rotation lerp)
Hover list  -> AnnouncingV2 store (activeExperimentSlug) -> CRTMonitor useFrame (texture swap + glitch)
```

Lenis and GSAP are synchronized via `createUnifiedScroll()` on a shared Tempus RAF loop. The R3F Canvas runs on Tempus priority 1 via `ExperimentCanvas tempus`.

## Sections

### 1. PreloaderSection

**Source**: codegrid-laserbysonymusic-landing-page-reveal-animation

Counter animation (0-100), clip-path polygon reveal on hero image, SplitText char/word staggers for header and navigation. Blocks body scroll until complete.

- **Timeline**: ~8s sequenced GSAP timeline with `id: "preloader"` for GSDevTools
- **Hide-until-reveal**: Uses `clipPath: inset(...)` instead of bare `translateX` to prevent content peeking
- **Stacking**: Parent has `background-color` (needed in section context), hero-bg uses `z-index: 0` to avoid the `-1` stacking bug

**Content**: `PRELOADER_CONTENT` in `data.ts`

### 2. InversaSection

**Source**: codegrid-inversa-scroll-animation-nextjs

Scroll-pinned section with mask reveal (SVG barcode strips), image saturation toggle, grid overlay fade, pulsing markers, and parallax content blocks.

- **Scroll distance**: `window.innerHeight * BLOCK_COUNT` (currently 5 blocks = 5x viewport)
- **Content height**: CSS `height` is computed from `BLOCK_COUNT * 100` svh
- **Scroll phases**: Mask scale, saturation, overlay opacity all transition at configurable breakpoints

**Content**: `INVERSA_CONTENT` in `data.ts` (title, 4 content blocks, 2 markers, outro text)

If you add or remove content blocks, the scroll distance and CSS height auto-adjust via `BLOCK_COUNT`. The `nth-child` alignment pattern alternates: title(bottom), even(right-center), odd(center).

### 3. ShowcaseSection + CRTMonitor

**Source**: codegrid-3d-crt-display

Project list at bottom, 3D CRT monitor in background. Hovering a project triggers a texture swap with a CRT glitch transition. Mouse movement rotates the monitor.

- **R3F Canvas** with `ExperimentCanvas tempus adaptive` and `R3FDevToolsInjector`
- **Texture management**: Module-level cache with video (`.mp4`) and image support. Cleanup on unmount
- **Responsive camera**: `ResponsiveCamera` component reacts to viewport width changes
- **Mobile fallback**: Grid of poster images when `isMobile` is true

**Content**: `EXPERIMENTS` array in `data.ts` (slug, title, poster, optional video)

### 4. FiddleHoverSection

**Source**: codegrid-fiddle-digital-hover-effect

Interactive grid overlay on an image. Mouse proximity activates clusters of blocks that display scrambling monospace symbols.

- **Imperative DOM**: Grid is created via `document.createElement` inside `useEffect` (fundamentally procedural, not React-declarative)
- **Cleanup**: Removes listener, cancels RAF, clears all intervals on unmount
- **No scroll animation**: This section is interaction-driven only

**Content**: `FIDDLE_CONTENT` in `data.ts`

### 5. JeskoJetsSection

**Source**: codegrid-jeskojets-scroll-animation

Scroll-pinned section with a window frame (PNG with transparency) that scales from 1 to 4, parallax sky background (350svh), and hero copy that slides up in the final third.

- **Perspective**: `.jesko-hero` has `perspective: 1000px`, header uses `transform-style: preserve-3d` and translates on Z axis
- **Scroll phases**: Window scale threshold, max scale, copy reveal start are all configurable

**Content**: `JESKOJETS_CONTENT` in `data.ts`

## Debug tools

Append `?debug` to the URL to activate all debug overlays.

### Layout-level (auto-included via `DevToolsInjector` in layout.tsx)

| Tool | What it does | Shortcut |
|------|-------------|----------|
| ExperimentDevMetrics | FPS, heap, CLS, GSAP tween count every 2s | Always active in dev |
| GSDevTools | GSAP timeline scrubber (preloader timeline linked) | H to hide |
| Leva panel | All `useDevControls` folders visible | L to toggle |
| Device info | Viewport, DPR, cores | D to toggle |

### Canvas-level (via `R3FDevToolsInjector` inside ExperimentCanvas)

| Tool | What it does | Shortcut |
|------|-------------|----------|
| r3f-perf | Draw calls, triangles, FPS | Auto behind ?debug |
| Scene inspector | Text tree of scene graph every 10s | Auto behind ?debug |
| Debug camera | OrbitControls for free camera nav | O to toggle |
| Grid helper | Reference grid | G to toggle |

### Scroll debugging

`createUnifiedScroll({ debug: isDebug })` exposes:
- `window.__lenis` -- direct Lenis instance access
- `window.__scrollToSection(index)` -- jump to section by index
- `window.__scrollToProgress(0-1)` -- jump to normalized scroll position

### Programmatic metrics

`window.__experimentMetrics` contains: `fps`, `fpsMin`, `heap`, `cls`, `gsapTweens`, `r3f` (calls, triangles, geometries, textures), `scene` (text tree).

### useDevControls panels

Each section exposes tweakable parameters behind `?debug`:

| Panel | Parameters |
|-------|-----------|
| Inversa Scroll | maskScaleMax, maskScaleMin, desatStart, desatEnd, resatStart, resatEnd |
| CRT Monitor | glitchDuration, lerpSpeed, rotationSensitivityY, rotationSensitivityX |
| Fiddle Grid | blockSize, detectionRadius, clusterSize, blockLifetime, emptyRatio, scrambleRatio, scrambleInterval |
| JeskoJets Scroll | windowScaleThreshold, maxWindowScale, copyRevealStart, zDepth |

These are Leva controls. In production, they return static defaults and are tree-shaken from the bundle.

## Reduced motion

All sections respect `prefers-reduced-motion: reduce`:

- **PreloaderSection**: Skips entire animation. Reveals all elements instantly via `gsap.set`, calls `onComplete()` immediately
- **InversaSection**: Skips ScrollTrigger pin. Sets mask, saturation, and overlay to default visible state
- **ShowcaseSection/CRTMonitor**: Skips glitch animation. Texture swaps are instant
- **FiddleHoverSection**: No change needed (hover is user-initiated interaction)
- **JeskoJetsSection**: Skips ScrollTrigger pin. Sets window scale to 1, copy visible

The orchestrator also bypasses `startTransition` for the preloader callback when reduced motion is active.

## Changing content

All text and image paths live in `data.ts`. To change copy:

1. Edit the relevant constant (`PRELOADER_CONTENT`, `INVERSA_CONTENT`, `JESKOJETS_CONTENT`, `FIDDLE_CONTENT`)
2. For the experiment showcase list, edit the `EXPERIMENTS` array

To change the InversaSection block count, just add/remove entries in `INVERSA_CONTENT.blocks`. The scroll distance, CSS height, and content container all derive from `BLOCK_COUNT` automatically.

## Changing design / adding sections

If you redesign or swap sections:

1. **Each section must own its own animation scope.** Use `useGSAP` with `{ scope: containerRef }`. No animation code in the orchestrator
2. **Scope all CSS classes** with a unique prefix (e.g., `sectionname-hero`, `sectionname-nav`). Use `<style>` JSX or a co-located CSS file
3. **Register GSAP plugins at module level** (`gsap.registerPlugin(...)` outside the component)
4. **No cross-section imports.** Sections share state only via `store.ts` (Zustand) or props from the orchestrator
5. **Scroll sections** must use the orchestrator's `createUnifiedScroll` -- do not create Lenis instances in sections
6. **R3F sections** must include `<R3FDevToolsInjector />` inside the Canvas for debug tooling
7. **Expose magic numbers** via `useDevControls("Panel Name", { ... })` so they can be tuned live behind `?debug`
8. **Wire complex timelines** to `useGSAPDebug(tl.current, "id")` for GSDevTools scrubbing
9. **Handle `prefers-reduced-motion`**: Use `usePrefersReducedMotion()` from `hooks.ts`. Call `gsap.set` to reveal content, then return early. Never leave elements invisible
10. **Extract all text** to `data.ts`. No hardcoded strings in JSX

## Assets

All assets live in `public/experiments/announcing-v2/`. Referenced as `/experiments/announcing-v2/filename.ext`.

Key assets:
- `death.jpg` -- Preloader hero image
- `inversa-hero-img.jpg` -- Inversa background
- `mask.svg` -- Barcode vertical strip mask for Inversa
- `grid-overlay.svg` -- Grid overlay for Inversa
- `fiddle-img.jpg` -- Fiddle hover image
- `sky.jpg` -- JeskoJets sky background
- `window.png` -- JeskoJets window frame (transparent PNG)
- `monitor.glb` -- 3D CRT monitor model
- `previews/` -- Experiment poster images and videos for the showcase list

## Tech stack

| Library | Role |
|---------|------|
| GSAP + @gsap/react | Timeline animation, ScrollTrigger, SplitText, CustomEase |
| Lenis | Smooth scroll (via `createUnifiedScroll`) |
| Tempus | Unified RAF loop binding Lenis, GSAP, and R3F |
| R3F + Drei | 3D CRT monitor scene (useGLTF, useFrame) |
| Three.js | ShaderMaterial, texture loading, video textures |
| Zustand | Cross-layer state (DOM to R3F Canvas) |
| Leva | Debug controls via `useDevControls` |

## Porting lineage

Each section was ported from a standalone codegrid demo using the `porting-demos` skill. Key adaptations from the originals:

- `z-index: -1` patterns replaced with `z-index: 0` + content layering (prevents stacking bugs when parent has `background-color`)
- `translateX/Y(100%)` replaced with `clipPath: inset(...)` for hide-until-reveal (prevents content peeking)
- Vanilla Lenis + `gsap.ticker.add` replaced with `createUnifiedScroll()` (single Tempus RAF loop)
- Vanilla Three.js replaced with R3F declarative scene
- `document.querySelector` replaced with React refs + `useGSAP` scope
- `DOMContentLoaded` replaced with `useGSAP` lifecycle
- `position: fixed` nav/footer in standalone demos changed to `position: relative` for section-in-page context
- `counterContainer.remove()` replaced with `gsap.set(..., { autoAlpha: 0 })` (React-safe)
- All class names prefixed with section slug to prevent style leaks
