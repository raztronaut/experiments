---
name: announcing-v2 gap fixes
overview: Apply gap analysis findings to the announcing-v2 experiment. The toolkit (`r3f.tsx`, `scroll.ts`) has already been upgraded -- announcing-v2 just needs to adopt the new features and fix the patterns the gap analysis flagged.
todos:
  - id: motion-diversity
    content: Diversify heading animations in ArchitectureSection (blur), AIBridgeSection (scale+rotate), ClosingSection (clipPath)
    status: completed
  - id: tempus-r3f
    content: Add tempus prop to ExperimentCanvas in HeroSection and ToolkitSection
    status: completed
  - id: adaptive-error
    content: Add adaptive and errorFallback props to ExperimentCanvas instances
    status: completed
  - id: magnetic-button
    content: Replace useState magnetic button in ClosingSection with GSAP quickTo refs
    status: completed
  - id: horizontal-resize
    content: Fix ToolkitSection horizontal scroll to use function-based end + invalidateOnRefresh
    status: completed
  - id: memoize-marquee
    content: Move marqueeItems to module scope in ToolkitSection
    status: completed
  - id: centralize-register
    content: Remove duplicate gsap.registerPlugin(ScrollTrigger) from 8 section/component files
    status: completed
  - id: scrolltrigger-refresh
    content: Add ScrollTrigger.refresh() after createUnifiedScroll in AnnouncingV2.tsx
    status: completed
isProject: false
---

# Announcing-V2 Gap Analysis Remediation

The gap analysis across 8 domains surfaces several concrete changes needed in the announcing-v2 experiment. The toolkit has already been upgraded (Tempus binding, adaptive perf, error boundaries are in `r3f.tsx`), but announcing-v2 isn't using those features yet. Additionally, the experiment was called out as the poster child for repetitive motion vocabulary.

---

## 1. Motion Vocabulary Diversity (Domain 3 -- highest impact)

The gap analysis (line 134) explicitly cites announcing-v2's pattern of identical `opacity: 0, y: 40` reveals. Every section heading uses essentially the same `gsap.fromTo` with `opacity + y`. Sections that already have distinct motion:

- **HeroSection** -- character split with random stagger + rotation (good)
- **ManifestoSection** -- per-character terminal typing driven by scrub (good)
- **PublishingSection** -- `clipPath: "inset(0 100% 0 0)"` horizontal reveal (good)
- **ToolkitSection** -- horizontal scroll pin (structurally distinct)

Sections that need motion diversification (their **heading + content entrance** is repetitive):


| Section             | Current Pattern                                   | Proposed Replacement                                                                                                                                                       |
| ------------------- | ------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| ArchitectureSection | `opacity: 0, y: 40` heading + batch cards `y: 30` | **Blur transition**: `filter: blur(12px), opacity: 0` to `blur(0), opacity: 1` for heading; cards keep batch but add `scale: 0.92` with staggered `rotateY: 8`             |
| AIBridgeSection     | `opacity: 0, y: 40` heading                       | **Scale + slight rotation**: `scale: 0.85, rotate: -2, opacity: 0` to identity with `back.out(1.7)`                                                                        |
| ClosingSection      | `opacity: 0, y: 40` heading                       | **Line-grow reveal**: heading text starts with `clipPath: "inset(0 0 100% 0)"` (bottom clip) revealing upward, paired with a horizontal rule that grows `scaleX: 0` to `1` |


Files to change:

- [sections/ArchitectureSection.tsx](src/components/experiments/announcing-v2/sections/ArchitectureSection.tsx) -- heading animation + card entrance
- [sections/AIBridgeSection.tsx](src/components/experiments/announcing-v2/sections/AIBridgeSection.tsx) -- heading animation
- [sections/ClosingSection.tsx](src/components/experiments/announcing-v2/sections/ClosingSection.tsx) -- heading animation

---

## 2. Adopt Tempus-Driven R3F Rendering (Domain 1)

The toolkit's `ExperimentCanvas` already supports a `tempus` prop that sets `frameloop="never"` and registers a `TempusFrameDriver` at priority 1. announcing-v2 has two Canvas instances that should opt in:

**HeroSection** (~line 130 area) -- currently uses default `frameloop`:

```tsx
// Before
<ExperimentCanvas className="..." dpr={1}>
// After
<ExperimentCanvas className="..." dpr={1} tempus>
```

**ToolkitSection** (~line 195 area, dynamic import of ExperimentCanvas for the R3F card):

```tsx
// Same change -- add tempus prop
<ExperimentCanvas className="..." dpr={1} tempus>
```

This unifies all animation (Lenis at -1, GSAP at 0, Three.js at 1) under a single Tempus RAF loop, matching the darkroom.engineering pattern that `createUnifiedScroll` already sets up for the DOM side.

Files to change:

- [sections/HeroSection.tsx](src/components/experiments/announcing-v2/sections/HeroSection.tsx)
- [sections/ToolkitSection.tsx](src/components/experiments/announcing-v2/sections/ToolkitSection.tsx)

---

## 3. Adopt Adaptive Performance + Error Boundaries (Domain 4)

`ExperimentCanvas` supports `adaptive` (AdaptiveDpr + AdaptiveEvents) and `errorFallback` props. announcing-v2 uses neither.

**HeroSection** -- the fullscreen shader background is the heaviest GPU load:

```tsx
<ExperimentCanvas
  className="..."
  dpr={1}
  tempus
  adaptive
  errorFallback={<div className="absolute inset-0 bg-black" />}
>
```

**ToolkitSection** -- the small icosahedron is lightweight, but the error boundary is still good practice:

```tsx
<ExperimentCanvas
  className="..."
  dpr={1}
  tempus
  errorFallback={<div className="h-full w-full rounded-lg bg-zinc-900" />}
>
```

The `adaptive` prop on HeroSection will auto-downscale DPR on low-end GPUs. The `errorFallback` ensures the page degrades gracefully if WebGL context is lost.

Files to change: Same as item 2 (HeroSection, ToolkitSection).

---

## 4. Fix Magnetic Button Performance (Found Issue)

[ClosingSection.tsx](src/components/experiments/announcing-v2/sections/ClosingSection.tsx) uses `useState` for the magnetic button hover effect, causing React re-renders on every `mousemove`. Replace with refs + GSAP `quickTo` for 60fps without reconciliation overhead:

```tsx
// Before: useState triggers re-render per mousemove
const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

// After: GSAP quickTo for direct DOM updates
const xTo = useRef<gsap.QuickToFunc>(null);
const yTo = useRef<gsap.QuickToFunc>(null);

useGSAP(() => {
  xTo.current = gsap.quickTo(buttonRef.current, "x", { duration: 0.4, ease: "power3" });
  yTo.current = gsap.quickTo(buttonRef.current, "y", { duration: 0.4, ease: "power3" });
}, { scope: sectionRef });

const handleMouseMove = useCallback((e: React.MouseEvent) => {
  const rect = e.currentTarget.getBoundingClientRect();
  const x = (e.clientX - rect.left - rect.width / 2) * 0.3;
  const y = (e.clientY - rect.top - rect.height / 2) * 0.3;
  xTo.current?.(x);
  yTo.current?.(y);
}, []);

const handleMouseLeave = useCallback(() => {
  xTo.current?.(0);
  yTo.current?.(0);
}, []);
```

This also eliminates the inline `style` recalculation and the `isHovering` state.

---

## 5. Fix Horizontal Scroll Resize (Found Issue)

[ToolkitSection.tsx](src/components/experiments/announcing-v2/sections/ToolkitSection.tsx) calculates `totalWidth` once at mount. Window resizes make the horizontal scroll distance stale. Fix by using a function-based `end` and `invalidateOnRefresh`:

```tsx
// Before
const totalWidth = trackRef.current.scrollWidth - window.innerWidth + 80;
ScrollTrigger.create({
  end: `+=${totalWidth}`,
  // ...
});

// After
ScrollTrigger.create({
  end: () => `+=${trackRef.current!.scrollWidth - window.innerWidth + 80}`,
  invalidateOnRefresh: true,
  // ...
});
```

---

## 6. Memoize Static Derived Data (Minor)

Two allocations happen on every render in [ToolkitSection.tsx](src/components/experiments/announcing-v2/sections/ToolkitSection.tsx):

```tsx
// Before (inside component body)
const marqueeItems = [...TOOLKIT, ...TOOLKIT];

// After (module scope -- TOOLKIT is static)
const MARQUEE_ITEMS = [...TOOLKIT, ...TOOLKIT];
```

---

## 7. Centralize ScrollTrigger Registration (Minor)

`gsap.registerPlugin(ScrollTrigger)` is called at module scope in 8+ section files. Move it to a single location in [AnnouncingV2.tsx](src/components/experiments/announcing-v2/AnnouncingV2.tsx) (where it's already called) and remove from section files. The plugin registration is global and idempotent, so this is a cleanup, not a bug fix.

Files to change:

- [sections/ArchitectureSection.tsx](src/components/experiments/announcing-v2/sections/ArchitectureSection.tsx) -- remove `gsap.registerPlugin(ScrollTrigger)`
- [sections/AIBridgeSection.tsx](src/components/experiments/announcing-v2/sections/AIBridgeSection.tsx) -- remove
- [sections/ToolkitSection.tsx](src/components/experiments/announcing-v2/sections/ToolkitSection.tsx) -- remove
- [sections/ManifestoSection.tsx](src/components/experiments/announcing-v2/sections/ManifestoSection.tsx) -- remove
- [sections/PublishingSection.tsx](src/components/experiments/announcing-v2/sections/PublishingSection.tsx) -- remove
- [sections/ClosingSection.tsx](src/components/experiments/announcing-v2/sections/ClosingSection.tsx) -- remove
- [components/ExperimentGridPreview.tsx](src/components/experiments/announcing-v2/components/ExperimentGridPreview.tsx) -- remove
- [components/MetricsVisualization.tsx](src/components/experiments/announcing-v2/components/MetricsVisualization.tsx) -- remove

---

## 8. Add `ScrollTrigger.refresh()` After Scroll Init (Domain 3)

The gap analysis (line 130) notes both darkroom and tambo call `ScrollTrigger.refresh()` after Lenis initializes. Check if `createUnifiedScroll` handles this internally (it may already). If not, add it to [AnnouncingV2.tsx](src/components/experiments/announcing-v2/AnnouncingV2.tsx) after the `createUnifiedScroll()` call:

```tsx
scrollRef.current = createUnifiedScroll({ debug: isDebug, lenisOptions: { ... } });
ScrollTrigger.refresh();
```

---

## Out of Scope

These items from the gap analysis do NOT require changes in announcing-v2:

- **GLSL utility expansion** (Domain 2) -- heroShader.ts already works correctly with its 2-octave FBM; no need to rewrite working shader code just because the docs now offer more utilities
- `**depthWrite={false}`** (Domain 2) -- HeroSection already has this correctly set
- **Device detection hook** (Domain 4) -- would be nice but is additive; not a gap in the current experiment
- `**tunnel-rat` bridge** (Domain 4) -- announcing-v2 uses a simpler DOM-over-Canvas approach that works fine for its use case
- **Mixed profile docs** (Domain 6) -- documents announcing-v2's pattern but doesn't require code changes to the experiment itself
- **Docs housekeeping** (Domain 7) -- no experiment code changes
- **Template fixes** (Domains 1, 2, 6) -- affect new experiments, not announcing-v2

---

## Summary of Files Changed


| File                                   | Changes                                                                                                                              |
| -------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------ |
| `AnnouncingV2.tsx`                     | Add `ScrollTrigger.refresh()` after scroll init                                                                                      |
| `sections/HeroSection.tsx`             | Add `tempus`, `adaptive`, `errorFallback` to ExperimentCanvas                                                                        |
| `sections/ToolkitSection.tsx`          | Add `tempus`, `errorFallback` to ExperimentCanvas; fix horizontal scroll resize; move marquee data to module scope                   |
| `sections/ArchitectureSection.tsx`     | Diversify heading motion (blur transition); remove duplicate plugin registration                                                     |
| `sections/AIBridgeSection.tsx`         | Diversify heading motion (scale + rotation); remove duplicate plugin registration                                                    |
| `sections/ClosingSection.tsx`          | Diversify heading motion (clipPath reveal); replace useState magnetic button with GSAP quickTo; remove duplicate plugin registration |
| `sections/ManifestoSection.tsx`        | Remove duplicate plugin registration                                                                                                 |
| `sections/PublishingSection.tsx`       | Remove duplicate plugin registration                                                                                                 |
| `components/ExperimentGridPreview.tsx` | Remove duplicate plugin registration                                                                                                 |
| `components/MetricsVisualization.tsx`  | Remove duplicate plugin registration                                                                                                 |


