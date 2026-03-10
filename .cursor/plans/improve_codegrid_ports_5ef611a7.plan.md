---
name: Improve Codegrid Ports
overview: Audit and improve 5 codegrid-sourced sections in announcing-v2 against the porting skill checklist -- genuine bugs, reduced motion, dev tooling wiring, and content extraction. Intentional adaptations (z-index stacking fix, clip-path hide-until-reveal, section-context layout changes) are acknowledged and preserved.
todos:
  - id: preloader-fixes
    content: "PreloaderSection: Fix asset path (/experiments/blank/ -> /experiments/announcing-v2/), replace counterContainer.remove() with gsap.set autoAlpha, extract hardcoded nav/footer text to data.ts, wire useGSAPDebug to the preloader timeline"
    status: completed
  - id: inversa-fixes
    content: "InversaSection: Fix content block count vs CSS height mismatch (5 blocks need 500svh + end height * 5 + nth-child fix), add useDevControls for scroll phase breakpoints"
    status: completed
  - id: showcase-devtools
    content: "ShowcaseSection + CRTMonitor: Add R3FDevToolsInjector inside ExperimentCanvas, move camera.position.z out of useFrame into a reactive effect, add useDevControls for glitch/lerp params"
    status: completed
  - id: fiddle-fixes
    content: "FiddleHoverSection: Add height: 100svh to .fiddle-hero, expose CONFIG values via useDevControls"
    status: completed
  - id: jesko-devtools
    content: "JeskoJetsSection: Add useDevControls for scroll phase breakpoints (window scale threshold, copy reveal start)"
    status: completed
  - id: reduced-motion
    content: Add prefers-reduced-motion to PreloaderSection (instant reveal + onComplete), InversaSection (skip pin, set visible), ShowcaseSection (instant glitch), JeskoJetsSection (skip pin, set visible)
    status: completed
  - id: content-extraction
    content: "Move hardcoded text to data.ts: PreloaderSection nav/footer/header, InversaSection outro, JeskoJetsSection outro"
    status: completed
  - id: typecheck-validate
    content: Run tsc --noEmit and lint after all changes
    status: completed
isProject: false
---

# Improve Codegrid Ports in Announcing-V2

Five codegrid demos were ported into sections of the `announcing-v2` experiment. This plan audits each against the porting skill's Phase 4-9 checklist, fixing genuine bugs and gaps while preserving intentional adaptations.

## Section-to-Source Mapping

- `PreloaderSection` -- `codegrid-laserbysonymusic-landing-page-reveal-animation`
- `InversaSection` -- `codegrid-inversa-scroll-animation-nextjs`
- `ShowcaseSection` + `CRTMonitor` -- `codegrid-3d-crt-display`
- `FiddleHoverSection` -- `codegrid-fiddle-digital-hover-effect`
- `JeskoJetsSection` -- `codegrid-jeskojets-scroll-animation`

## Intentional Adaptations (preserve, do NOT revert)

These deviations from the originals were done for good reasons:

- **PreloaderSection z-index + background-color**: Original uses `z-index: -1` on `.hero-bg` with no parent bg-color (bg is on `body`). Port adds `background-color: #0f0f0f` on `.preloader-hero` (needed in section-within-page context) and correctly avoids `z-index: -1` to prevent stacking bug. This is the exact fix described in the porting skill Phase 4.
- **PreloaderSection clip-path reveal**: Port uses `clipPath: "inset(0 100% 0 0)"` + SplitText mask instead of bare `translateX(100%)`. This follows the skill's Phase 4 "hide-until-reveal" guidance for preventing content peeking.
- **PreloaderSection h1 font-size**: `clamp(4rem, 12vw, 15rem)` vs original's `clamp(5rem, 18.5vw, 20rem)`. Different word ("Experiments" vs "Canon") and different page context. Intentional.
- **ShowcaseSection hover transition**: Added `transition: color 0.15s, background-color 0.15s` on project list items. UX enhancement -- original has jarring instant swap.
- **ShowcaseSection video textures**: Port adds `.mp4` support not in original. Enhancement for richer previews.
- **FiddleHoverSection relative nav/footer**: Original uses `position: fixed`. Port uses `position: relative` -- correct for section-within-page context.

---

## 1. PreloaderSection

File: `[sections/PreloaderSection.tsx](src/components/experiments/announcing-v2/sections/PreloaderSection.tsx)`

### Genuine bugs

- **Wrong asset path (line 156)**: `src="/experiments/blank/death.jpg"` should be `src="/experiments/announcing-v2/death.jpg"`. The file exists in `public/experiments/announcing-v2/`.
- `**counterContainer.remove()` (line 93)**: Direct DOM removal React doesn't track. Replace with `gsap.set(counterContainerRef.current, { autoAlpha: 0 })` per skill Phase 5.

### Content extraction

- Nav links `["Experiments", "Shaders", "Process", "Info"]`, footer text `["Creative Coding", "AI-Native", "V2"]`, logo text `"V2 Lab"`, header text `"Experiments"` are all hardcoded. Move to `data.ts` as `PRELOADER_CONTENT`.

### Dev tooling

- **Missing `useGSAPDebug`**: The preloader has a complex ~8s timeline (counter, clip-path reveal, text stagger). Store the timeline in a ref and connect via `useGSAPDebug(tl.current, "preloader")` for GSDevTools scene jumping behind `?debug`.

---

## 2. InversaSection

File: `[sections/InversaSection.tsx](src/components/experiments/announcing-v2/sections/InversaSection.tsx)`

### Genuine bugs

- **Content block count vs CSS height mismatch**: `INVERSA_CONTENT.blocks` has 4 entries, and the JSX renders a separate title block + 4 content blocks = 5 total. But `.inversa-hero-content { height: 400svh; }` is sized for 4 blocks, and `ScrollTrigger end: +=${window.innerHeight * 4}` is also for 4. Fix by updating to `500svh` and `end: +=${window.innerHeight * 5}px`, then add a 5th `nth-child` rule for the new block's alignment.

### Dev tooling

- **Missing `useDevControls`**: The scroll phases (0.4, 0.5, 0.75, 0.85 for mask/saturation transitions) and mask scale values (1, 2.5) are magic numbers. Expose via `useDevControls("Inversa Scroll", { ... })` for live tweaking behind `?debug`.

---

## 3. ShowcaseSection + CRTMonitor

Files: `[sections/ShowcaseSection.tsx](src/components/experiments/announcing-v2/sections/ShowcaseSection.tsx)`, `[canvas/CRTMonitor.tsx](src/components/experiments/announcing-v2/canvas/CRTMonitor.tsx)`

### Dev tooling (primary gap)

- **Missing `R3FDevToolsInjector`**: The `ExperimentCanvas` in `ShowcaseSection` does not include `<R3FDevToolsInjector />`. This experiment was scaffolded as `scrollytelling` (not `r3f-scene`), so the Canvas was manually added. Per the porting skill Phase 8: "Add `<R3FDevToolsInjector />` inside Canvas if you added a Canvas to a non-R3F scaffold." Add it as a child of `ExperimentCanvas`, alongside the lights and `<CRTMonitor />`.
- **Missing `useDevControls`**: Glitch transition duration (0.75s), lerp speed (0.05), and mouse sensitivity multipliers (0.3 rotation-y, 0.15 rotation-x) in `CRTMonitor` are magic numbers. Expose via `useDevControls("CRT Monitor", { ... })`.

### Performance improvement

- **Camera Z in `useFrame`**: `camera.position.z = Math.max(1, 768 / size.width)` runs every frame but only needs to change on resize. R3F's `useThree` provides reactive `size` -- extract this into a small component or `useEffect` that reacts to `size.width` changes instead of computing every frame.

### Texture cache note

Module-level `textureCache`/`textureLoader` outside the component is a deliberate caching strategy. The cleanup `useEffect` that clears the cache on unmount is correct for preventing memory leaks. No change needed -- but if hot-reload issues surface, consider moving to a ref.

---

## 4. FiddleHoverSection

File: `[sections/FiddleHoverSection.tsx](src/components/experiments/announcing-v2/sections/FiddleHoverSection.tsx)`

### CSS fix

- **Missing viewport height**: Original `.hero { height: 100svh; }`. Port `.fiddle-hero` uses `min-height: 500px` without viewport height. Change to `height: 100svh` so the image is vertically centered in a full-screen area matching the original. Keep `min-height: 500px` as a fallback for very short viewports.

### Dev tooling

- **Missing `useDevControls`**: The `CONFIG` object (blockSize, detectionRadius, clusterSize, blockLifetime, emptyRatio, scrambleRatio, scrambleInterval) contains 7 tweakable parameters. Expose via `useDevControls("Fiddle Grid", { ... })` so grid behavior can be tuned live behind `?debug`. The grid would need to reinitialize when params change (call `initGrid` in an effect that watches the controls).

---

## 5. JeskoJetsSection

File: `[sections/JeskoJetsSection.tsx](src/components/experiments/announcing-v2/sections/JeskoJetsSection.tsx)`

### Status

Clean port. All styles faithful to original. Scoped class names correct. No CSS deviations.

### Dev tooling

- **Missing `useDevControls`**: The scroll phase breakpoints (0.5 for window scale cap, 0.66 for copy reveal start, 0.34 for copy reveal duration) are magic numbers. Expose via `useDevControls("JeskoJets Scroll", { ... })` for live tweaking.

---

## 6. Reduced Motion (Phase 6) -- All Sections

None of the 5 sections handle `prefers-reduced-motion` internally. The orchestrator reads `isReducedMotion` and passes a simpler `onComplete` to PreloaderSection, but the sections themselves don't adapt.

### Per-section implementation

Import `usePrefersReducedMotion` from `../hooks` (already exists in `hooks.ts`).

- **PreloaderSection**: At the top of `useGSAP`, if reduced motion: `gsap.set` all elements to their final revealed state (hero-bg full clip-path, chars at x: 0%, words at y: 0%, progress bars full, counter hidden), then call `onComplete()` immediately. No timeline.
- **InversaSection**: If reduced motion: skip `ScrollTrigger.create()`. `gsap.set` the hero content to the first block visible, mask at scale 2.5, no overlay. Keep the section scrollable but without pin.
- **ShowcaseSection/CRTMonitor**: If reduced motion: set `glitchIntensity` to 0 immediately on texture swap (skip the 0.75s gsap.to animation).
- **FiddleHoverSection**: Interaction-driven (hover). No change needed -- hover effects are user-initiated and fine under reduced motion.
- **JeskoJetsSection**: If reduced motion: skip `ScrollTrigger.create()`. `gsap.set` window at scale 1, hero copy visible (`yPercent: 0`), sky at default position. Keep scrollable without pin.

---

## 7. Content Extraction (Phase 9)

Move remaining hardcoded strings to `[data.ts](src/components/experiments/announcing-v2/data.ts)`:

- **PreloaderSection**: `PRELOADER_CONTENT` -- nav links, footer text, logo text, header text
- **InversaSection**: Add `outroText` to `INVERSA_CONTENT`
- **JeskoJetsSection**: Add `outroText` to `JESKOJETS_CONTENT`

---

## Implementation Order

Work section-by-section, completing all fixes + dev tooling + reduced motion per section before moving to the next. Run `tsc --noEmit` after each section to catch regressions early.