---
name: V2 Experiment Decomposition
overview: Split the 926-line KineticTypographyScroll.tsx monolith into focused, per-section modules — each owning its own data, GSAP animations, and JSX — then use the clean structure to fix the remaining visibility/timing bugs.
todos:
  - id: extract-data
    content: Create data.ts with all section constants (HERO_WORDS, STATS, CONFIG_LAYERS, etc.) and useReducedMotion.ts hook
    status: completed
  - id: section-hero
    content: Create sections/HeroSection.tsx -- hero char reveal, prompt fadeout, shader tracking, word parallax. Own useGSAP with scope.
    status: completed
  - id: section-philosophy
    content: Create sections/PhilosophySection.tsx -- mask reveal lines. Own useGSAP.
    status: completed
  - id: section-stats
    content: Create sections/StatsSection.tsx -- counter animation. Fix textContent FOUC (set JSX to 0, use gsap.to). Add reduced-motion fallback.
    status: completed
  - id: section-arch
    content: Create sections/ArchitectureSection.tsx -- pinned R3F scene + copy. Fix copy timing (shift to 75-120% of 150vh pin). Add reduced-motion fallback.
    status: completed
  - id: section-toolkit
    content: Create sections/ToolkitSection.tsx -- batch card reveal. Add onLeaveBack for cleanup. Add reduced-motion fallback.
    status: completed
  - id: section-config
    content: Create sections/ConfigSection.tsx -- pinned layer reveal + scramble. Fix layer timing (spread across 90% of 200vh pin). Add reduced-motion fallback.
    status: completed
  - id: section-devtools-marquee-credits
    content: Create DevToolsSection.tsx, MarqueeSection.tsx, CreditsSection.tsx. Add reduced-motion fallbacks.
    status: completed
  - id: orchestrator-rewrite
    content: "Rewrite KineticTypographyScroll.tsx as thin orchestrator (~120 lines): Lenis setup, leva controls, scroll progress bar, compose sections."
    status: completed
  - id: tests-and-verify
    content: Update test imports. Run tsc --noEmit, lint, vitest. Visual verification via browser-devtools MCP screenshots of each section.
    status: completed
isProject: false
---

# V2 Experiment Decomposition and Visibility Fixes

## Problem

`[KineticTypographyScroll.tsx](src/components/experiments/kinetic-typography-scroll/KineticTypographyScroll.tsx)` is a 926-line monolith containing:

- 9 data constant blocks (lines 27-128)
- 2 hooks (lines 130-235, inline in the component)
- 1 giant `useGSAP` block with all 9 sections' ScrollTrigger animations (lines 237-568)
- 9 JSX sections (lines 570-924)

Every fix requires navigating a single massive file. Every section's animation timing is coupled. Debugging visibility issues means tracing across hundreds of lines.

## Target Structure

```
src/components/experiments/kinetic-typography-scroll/
  KineticTypographyScroll.tsx   ~120 lines  Orchestrator (Lenis, leva, refs, progress bar)
  HeroShaderCanvas.tsx          (unchanged)
  ArchitectureScene.tsx         (unchanged)
  data.ts                       ~100 lines  All section constants
  useReducedMotion.ts           ~15 lines   Extracted hook
  sections/
    HeroSection.tsx             ~90 lines   Hero chars + shader BG + parallax
    PhilosophySection.tsx       ~50 lines   Mask reveal lines
    StatsSection.tsx            ~70 lines   Counter animation
    ArchitectureSection.tsx     ~60 lines   Pinned R3F scene + copy overlay
    ToolkitSection.tsx          ~60 lines   Batch card reveal
    ConfigSection.tsx           ~90 lines   Pinned layer reveal + scramble
    DevToolsSection.tsx         ~80 lines   Debug tools showcase
    MarqueeSection.tsx          ~50 lines   Dual-direction scroll
    CreditsSection.tsx          ~60 lines   Stagger + outro
  KineticTypographyScroll.test.tsx (update imports)
```

## Decomposition Strategy

### 1. Extract `data.ts`

Move all constants out of the component file:

```typescript
// data.ts
export const HERO_WORDS = [...];
export const PHILOSOPHY_LINES = [...];
export const STATS = [...];
export const TOOLKIT_TIERS = [...];
export const CONFIG_LAYERS = [...];
export const MARQUEE_ROW_1 = [...];
export const MARQUEE_ROW_2 = [...];
export const CREDITS = [...];
export const SCRAMBLE_PHRASE = "...";
export const GLYPHS = "...";
```

### 2. Extract `useReducedMotion.ts`

Move the hook to its own file (reusable by other experiments too):

```typescript
export function useReducedMotion(): boolean { ... }
```

### 3. Define shared section props interface

Each section component receives animation parameters from the orchestrator:

```typescript
export interface SectionAnimationProps {
  reducedMotion: boolean;
  scrub: number;
}
```

Some sections need additional props:

- `HeroSection`: `stagger`, `parallaxIntensity`, `heroScrollRef`
- `ArchitectureSection`: `spreadRef`
- `ConfigSection`: (none extra)
- `DevToolsSection`: `isDebug`
- `MarqueeSection`: (none extra, but Lenis skew handler moves here or stays in parent)

### 4. Each section gets its own `useGSAP`

This is the key architectural decision. Currently all ScrollTriggers live in one `useGSAP` call scoped to `containerRef`. After the split, each section component:

1. Has its own `useRef` for its root element
2. Runs its own `useGSAP({ scope: sectionRef })`
3. Manages its own ScrollTrigger instances
4. Lists its own `dependencies` array

This works because ScrollTrigger selectors (`.hero-char`, `.stat-value`, etc.) are scoped by `useGSAP`'s `scope` to the section's subtree. No cross-section class conflicts.

Example for `StatsSection`:

```typescript
export function StatsSection({ reducedMotion, scrub }: SectionAnimationProps) {
  const ref = useRef<HTMLElement>(null);
  const effectiveScrub = reducedMotion ? 0 : scrub;

  useGSAP(() => {
    if (reducedMotion) {
      // Fallback: reveal everything immediately
      gsap.set(".stats-intro, .stat-label", { opacity: 1, y: 0 });
      return;
    }
    // ... stats-specific ScrollTrigger animations
  }, { scope: ref, dependencies: [effectiveScrub, reducedMotion] });

  return <section ref={ref} aria-label="The Numbers" className="stats-section ...">...</section>;
}
```

### 5. Orchestrator becomes thin

`KineticTypographyScroll.tsx` shrinks to ~120 lines:

```typescript
export default function KineticTypographyScroll() {
  const containerRef = useRef<HTMLDivElement>(null);
  const spreadRef = useRef(0);
  const heroScrollRef = useRef(0);
  const reducedMotion = useReducedMotion();
  const [isDebug, setIsDebug] = useState(false);

  // Lenis setup (useLayoutEffect)
  // Leva controls (useDevControls)
  // Scroll progress bar (useGSAP, only the progress bar)

  return (
    <div ref={containerRef}>
      <div className="scroll-progress ..." />
      <HeroSection ... />
      <PhilosophySection ... />
      <StatsSection ... />
      <ArchitectureSection ... />
      <ToolkitSection ... />
      <ConfigSection ... />
      <DevToolsSection ... />
      <MarqueeSection ... />
      <CreditsSection ... />
    </div>
  );
}
```

### 6. Lenis skew handler placement

The marquee skew-on-velocity effect currently lives in the parent's `useLayoutEffect` because it needs the Lenis instance. Two options:

- **Option A**: Keep it in the parent, pass a `lenisRef` to `MarqueeSection` -- simpler, no API changes
- **Option B**: Move skew logic into `MarqueeSection`, pass `lenisRef` as a prop -- cleaner ownership

Going with **Option A** for now -- the parent already owns the Lenis lifecycle and the skew handler is 5 lines. The ref lookup (`.marquee-skew`) just needs to still target the marquee section.

### 7. Reduced motion fallback (fixes critical bug)

Currently, `if (reducedMotion) return;` leaves all `opacity-0` elements permanently invisible. With the split, each section handles its own reduced-motion path:

```typescript
useGSAP(() => {
  if (reducedMotion) {
    gsap.set(".stats-intro, .stat-label", { opacity: 1, y: 0 });
    return;
  }
  // ... normal animations
}, { scope: ref, dependencies: [reducedMotion, ...] });
```

This ensures every section reveals its content regardless of motion preference.

## Visibility/Timing Fixes (addressed during decomposition)

While extracting each section, fix the known timing bugs:

**Config layers (critical)**: Current positions use `top+=${(i/6)*80}%` which crowds all 6 layers into the first 40% of the 200vh pin. Fix by scaling to use the full pin range:

```typescript
// Before: layers finish at 80vh out of 200vh (40%)
start: `top+=${(i / total) * 80}% top`
// After: layers span 10vh to 180vh (5% to 90% of pin)
start: `top+=${10 + (i / total) * 170}% top`
end:   `top+=${10 + ((i + 1) / total) * 170}% top`
```

**Architecture copy (high)**: Copy appears at 30-50vh into a 150vh pin (first 33%). Center it later to coordinate with cube spread:

```typescript
// Before
start: "top+=30% top", end: "top+=50% top"
// After: appears 50-80% through pin (75vh-120vh of 150vh)
start: "top+=75% top", end: "top+=120% top"
```

**Stats counter FOUC**: `gsap.from(el, { textContent: 0 })` flashes final value before resetting. Fix by setting JSX textContent to `0` and using `gsap.to` with target from data attribute.

**Toolkit batch cleanup**: Add `onLeaveBack` to reset cards so repeated scroll doesn't accumulate tweens.

## Execution Order

1. Create `data.ts` with all constants
2. Create `useReducedMotion.ts`
3. Create each section file (9 files), moving JSX + data imports + animations
4. Add reduced-motion fallbacks in each section
5. Fix timing bugs during extraction (config layers, arch copy, stats FOUC)
6. Update orchestrator to import and compose sections
7. Update test file imports
8. Verify with `tsc --noEmit` + `npm run lint` + `vitest`
9. Visual verification via browser-devtools MCP (screenshot each section)

