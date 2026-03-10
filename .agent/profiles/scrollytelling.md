# Scrollytelling Profile

> Activate when `experiment.json` has `"profile": "scrollytelling"`

## Behavioral Mode
**Scroll UX first, smooth transitions, narrative pacing.** The scroll IS the interaction. Every section transition should feel intentional and guided.

## Priority Ordering
1. Scroll smoothness (no jank, no frame drops)
2. Narrative clarity (user always knows where they are in the story)
3. Transition quality (ease, timing, stagger)
4. Performance (efficient scroll callbacks)
5. Device adaptation (touch vs. wheel, mobile vs. desktop)

## Decomposition Architecture

Scrollytelling experiments grow fast. Decompose early -- when the main component reaches ~200 lines or 3+ sections.

**Target structure:**
```
src/components/experiments/experiment-name/
  ExperimentName.tsx     ~120 lines  Orchestrator (Lenis, controls, progress bar, section composition)
  data.ts                ~100 lines  Section content, config constants
  sections/
    HeroSection.tsx      Each section owns its own useGSAP with scope + dependencies
    ...
```

**Each section:**
- Has its own `useRef` for scoping
- Runs its own `useGSAP({ scope: ref, dependencies: [...] })`
- Handles its own `prefers-reduced-motion` fallback (`gsap.set` to reveal, not early return that leaves `opacity-0` elements invisible)
- Receives `reducedMotion`, `scrub`, and any shared refs as props

**The orchestrator:**
- `createUnifiedScroll` lifecycle (see Toolkit Setup below)
- `useDevControls` for shared parameters
- Scroll progress bar animation
- Composes sections -- no direct ScrollTrigger/gsap animation code

## Toolkit Setup: createUnifiedScroll (Canonical)
```tsx
import { createUnifiedScroll } from "@/lib/toolkit/scroll";
import type { UnifiedScrollHandle } from "@/lib/toolkit/scroll";

// In orchestrator's useLayoutEffect:
const handle = createUnifiedScroll({ debug: isDebug });
// handle.lenis for direct access, handle.destroy() in cleanup
```

Drives Lenis from Tempus (priority -1), GSAP from Tempus (priority 0). Do NOT use the old `gsap.ticker.add` pattern -- it is superseded by `createUnifiedScroll`.

Pass `{ debug: true }` (gated behind `?debug`) to expose `window.__scrollToSection(index)` and `window.__scrollToProgress(0-1)` for MCP browser tool scrolling.

## Pinned Section Pattern
```tsx
useGSAP(() => {
  gsap.to('.content', {
    opacity: 1,
    y: 0,
    scrollTrigger: {
      trigger: '.section',
      start: 'top top',
      end: '+=100%',
      pin: true,
      scrub: 1,
    }
  })
}, { scope: sectionRef, dependencies: [scrub] })
```

## Multi-Section Snap
```tsx
ScrollTrigger.create({
  snap: 1 / (totalSections - 1),
  duration: { min: 0.2, max: 0.6 },
  ease: 'power2.inOut',
})
```

## Staggered Reveal on Scroll
```tsx
ScrollTrigger.batch('.card', {
  onEnter: (elements) => {
    gsap.to(elements, {
      opacity: 1,
      y: 0,
      stagger: 0.05,
      duration: 0.4,
      ease: 'power2.out',
    })
  },
})
```

## UX Guidelines
- **Progressive disclosure** (Hick's Law): reveal content as the user scrolls, don't dump everything at once
- **Doherty threshold**: scroll-triggered animations should feel immediate -- `scrub: true` or `scrub: 0.5` for tight coupling
- Visual scroll progress indicator for long-form content
- Clear section markers or navigation dots for multi-section narratives
- `prefers-reduced-motion`: disable smooth scroll, use instant section jumps

## Gotchas

| Problem | Fix |
|---------|-----|
| Scroll jank with ScrollTrigger | Use `createUnifiedScroll` (not manual `gsap.ticker.add`) |
| Pin jumps on mobile | Use `pinSpacing: true` (default), test on real devices |
| Scrub feels laggy | Reduce `scrub` value (0.5 instead of 2) |
| Content flashes before scroll | Set initial state (opacity: 0, y: 50) in CSS or gsap.set |
| MCP tools can't scroll Lenis | Pass `{ debug: true }` to `createUnifiedScroll`, use `window.__scrollToSection(i)` |
| Monolithic component | Decompose at ~200 lines (see Decomposition Architecture above) |
