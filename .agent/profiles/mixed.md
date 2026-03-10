# Mixed Profile

> Activate when an experiment combines **two or more** of: scrollytelling, R3F/WebGL, interaction, DOM effects. Also appropriate when `experiment.json` has `"profile": "scrollytelling"` or `"r3f-scene"` but the experiment clearly needs both scroll narrative and 3D or heavy interaction.

## Behavioral Mode
**Compositional thinking, layered systems, clear ownership boundaries.** Mixed experiments are the most complex to build well. The primary risk is tangled state and conflicting animation systems. Each layer (scroll, 3D, interaction) must have well-defined responsibilities and communication interfaces.

## Priority Ordering
1. Layer separation (each system owns its slice, no spaghetti)
2. Scroll smoothness (Lenis + GSAP must not fight R3F's render loop)
3. Narrative clarity (the scroll story drives; 3D and interaction enhance)
4. Performance (budget: 16.67ms total across all layers)
5. Device adaptation (degrade 3D gracefully on mobile, keep scroll+DOM intact)

## When to Use This Profile

Use mixed when an experiment has **any** of:
- Scrolling HTML content with a persistent or section-specific 3D canvas
- Scroll-driven camera or material animation in R3F
- Interactive elements (drag, magnetic, spring) layered on top of scroll sections
- A "layer-cake" layout: fixed WebGL background + scrolling DOM foreground

If an experiment is purely scroll with no 3D or gestures, use `scrollytelling`. If purely 3D with no scroll narrative, use `r3f-scene`. Mixed is for the overlap.

## The Layer-Cake Pattern

The most common mixed layout. Darkroom, basement, and tambo all use variations:

```
┌─────────────────────────────┐
│  <Canvas> (position: fixed) │  ← WebGL layer, full viewport, z-index: 0
├─────────────────────────────┤
│  <main> (position: relative)│  ← DOM content, scrolls naturally, z-index: 1
│    <HeroSection />          │
│    <Section2 />             │     pointer-events: none on DOM overlay sections
│    <Section3 />             │     that should let clicks pass to the canvas
│    ...                      │
└─────────────────────────────┘
```

**CSS stacking:**
```css
.canvas-layer {
  position: fixed;
  inset: 0;
  z-index: 0;
}

.dom-layer {
  position: relative;
  z-index: 1;
}

/* Sections that are purely visual (3D shows through) */
.transparent-section {
  pointer-events: none;
  background: transparent;
}

/* Sections with interactive DOM content */
.content-section {
  pointer-events: auto;
  background: var(--section-bg); /* opaque to occlude canvas */
}
```

**Key principle:** DOM content is primary, 3D is atmospheric. The scroll position drives the camera, material uniforms, or post-processing via Lenis progress. Users read and interact with DOM; the 3D canvas provides depth and mood.

## Composing Scroll + R3F

Use `createUnifiedScroll` from the toolkit to keep Lenis, GSAP, and the R3F render loop on a single Tempus RAF chain. The priority order ensures scroll input processes first, animations update second, and the frame renders last:

```
Tempus priority -1  →  Lenis (scroll physics)
Tempus priority  0  →  GSAP (ScrollTrigger, timelines)
Tempus priority  1  →  Three.js gl.render() (if using Tempus-bound Canvas)
```

**Passing scroll progress to R3F:**

```tsx
// In the orchestrator (DOM side)
const scrollProgress = useRef(0);

useEffect(() => {
  const handle = createUnifiedScroll({ debug: isDebug });
  handle.lenis.on("scroll", ({ progress }: { progress: number }) => {
    scrollProgress.current = progress;
  });
  return () => handle.destroy();
}, []);

// Pass scrollProgress ref to a shared store or context
// that R3F components read inside useFrame
```

Inside R3F, read scroll progress without React subscriptions:

```tsx
// In a scene component (R3F side)
useFrame(() => {
  const p = scrollProgressRef.current;
  camera.position.y = THREE.MathUtils.lerp(startY, endY, p);
  material.uniforms.uProgress.value = p;
});
```

**Zustand bridge** (preferred for complex state): Use `store.getState()` inside `useFrame` for non-reactive reads. Never use `useStore()` hooks inside the frame loop -- they trigger re-renders.

## Composing Scroll + Interaction

For interactive elements (magnetic buttons, draggable cards, spring-physics widgets) within a scrollytelling narrative:

- **Interaction profile** patterns apply within individual sections
- Each interactive component manages its own springs/gestures via Motion
- GSAP scroll animations and Motion spring animations coexist naturally -- they target different elements
- Avoid animating the same property from both GSAP (scroll-driven) and Motion (interaction-driven) on one element

**Pattern:** Scroll reveals the section, interaction activates once visible:

```tsx
function InteractiveSection() {
  const ref = useRef(null);
  const [isVisible, setIsVisible] = useState(false);

  useGSAP(() => {
    ScrollTrigger.create({
      trigger: ref.current,
      start: "top 80%",
      onEnter: () => setIsVisible(true),
    });
  }, { scope: ref });

  return (
    <section ref={ref}>
      {isVisible && <MagneticButton />}
    </section>
  );
}
```

## File Structure

Mixed experiments grow fast. Decompose early:

```
src/components/experiments/experiment-name/
  ExperimentName.tsx         ~100-150 lines  Orchestrator
  data.ts                    Section content, config, breakpoints
  store.ts                   Zustand store (scroll progress, active section, shared state)
  sections/
    HeroSection.tsx          DOM + interaction, own useGSAP scope
    Scene3DSection.tsx       Transparent section, 3D shows through
    ContentSection.tsx       Opaque DOM section with scroll animations
  canvas/
    ExperimentScene.tsx      R3F scene root (reads from store)
    CameraController.tsx     Scroll-driven camera (useFrame + store)
    [materials, shaders]     Shared shader code
  components/
    MagneticButton.tsx       Reusable interactive primitives
```

**The orchestrator's job:**
1. `createUnifiedScroll` lifecycle
2. `useDevControls` for shared debug params
3. Composes the DOM layer (sections) and Canvas layer (scene)
4. Manages the Zustand store or context bridge between DOM and R3F
5. No direct animation code -- delegates to sections and scene components

## Profile Priority (Conflict Resolution)

When guidance from different profiles conflicts:

1. **Scrollytelling wins for scroll behavior** -- Lenis config, ScrollTrigger patterns, scrub values, snap behavior
2. **R3F wins for rendering** -- Canvas config, frame loop, disposal, performance monitoring
3. **Interaction wins for gestures** -- Spring physics, drag constraints, magnetic effects, touch targets
4. **Mixed profile wins for architecture** -- layer-cake layout, file structure, state bridges, decomposition

## Device Adaptation

Mixed experiments are the heaviest. Degrade gracefully:

| Capability | Desktop | Mobile |
|-----------|---------|--------|
| 3D canvas | Full scene, high DPR | Simplified or static fallback |
| Post-processing | Bloom, vignette, etc. | Disabled |
| Particle count | Full | 25-50% |
| Scroll animations | Full GSAP choreography | Simpler reveals, reduced stagger |
| Interaction | Magnetic + spring + drag | Tap only, no magnetic |

Use a device detection hook (not `navigator.userAgent`) to gate features:

```tsx
const { isMobile, isReducedMotion } = useDeviceCapabilities();

return (
  <>
    {!isMobile && <Canvas3DLayer />}
    <DOMScrollLayer simplified={isMobile || isReducedMotion} />
  </>
);
```

## Gotchas

| Problem | Fix |
|---------|-----|
| Scroll jank when Canvas is rendering | Ensure Tempus priority chain: Lenis (-1) → GSAP (0) → render (1) |
| Click events don't reach Canvas | Set `pointer-events: none` on transparent DOM overlay sections |
| DOM content invisible behind Canvas | Add opaque backgrounds on content sections |
| Camera jumps on scroll | Use `lerp`/`damp` in `useFrame`, never set camera position directly from scroll |
| Memory leaks from dual systems | Both `createUnifiedScroll().destroy()` and R3F disposal in cleanup |
| GSAP and Motion fighting | Never target the same CSS property from both on one element |
| Mobile performance | Feature-gate 3D behind device detection, reduce to DOM-only on low-end |
| `useFrame` re-renders DOM | Read shared state via `store.getState()` or refs, not React subscriptions |

## Pre-Implementation Checklist
- [ ] Layer-cake layout with correct z-index stacking
- [ ] `createUnifiedScroll` with correct Tempus priority chain
- [ ] State bridge between DOM and R3F (Zustand store or refs)
- [ ] File structure decomposed: orchestrator, sections/, canvas/, components/
- [ ] Device detection with 3D fallback for mobile
- [ ] `prefers-reduced-motion` respected in both scroll and 3D layers
- [ ] No cross-property animation conflicts between GSAP and Motion
- [ ] r3f-perf + ExperimentDevMetrics in dev mode
- [ ] Each section owns its own `useGSAP` scope
