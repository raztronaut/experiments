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
ScrollTrigger.refresh(); // recalculate trigger positions after Lenis changes scroll behavior
// handle.lenis for direct access, handle.destroy() in cleanup
```

Drives Lenis from Tempus (priority -1), GSAP from Tempus (priority 0). Do NOT use the old `gsap.ticker.add` pattern -- it is superseded by `createUnifiedScroll`.

**Always call `ScrollTrigger.refresh()`** after `createUnifiedScroll` returns. Lenis modifies scroll behavior, so ScrollTrigger needs to recalculate all trigger positions. Both darkroom and tambo do this.

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

## Staggered Reveal on Scroll (ScrollTrigger.batch)

Use `batch` for elements that enter in groups (grid cards, list items) rather than creating individual triggers:
```tsx
gsap.set('.card', { opacity: 0, y: 40, scale: 0.95 });
ScrollTrigger.batch('.card', {
  onEnter: (batch) => {
    gsap.to(batch, {
      opacity: 1,
      y: 0,
      scale: 1,
      stagger: 0.05,
      duration: 0.4,
      ease: 'power2.out',
    })
  },
  start: 'top 85%',
})
```

## Horizontal Scroll Section
Pin a section and scrub its inner track horizontally. Use `anticipatePin: 1` to prevent the visual jump when the pin activates:
```tsx
const totalWidth = trackRef.current.scrollWidth - window.innerWidth;
gsap.to(trackRef.current, {
  x: -totalWidth,
  ease: 'none',
  scrollTrigger: {
    trigger: sectionRef.current,
    start: 'top top',
    end: () => `+=${totalWidth}`,
    pin: true,
    scrub: 1,
    anticipatePin: 1,
  },
});
```

## Timeline Sequencing (Multi-Step Reveals)
For sequential reveals (pipelines, step-by-step processes), use a single timeline so elements activate one after another rather than simultaneously:
```tsx
const tl = gsap.timeline({
  scrollTrigger: { trigger: container, start: 'top 70%', end: 'top 25%', scrub: 1 },
});
nodes.forEach((node, i) => {
  tl.to(node, { opacity: 1, scale: 1, duration: 0.3 });
  if (connectors[i]) {
    tl.to(connectors[i], { scaleX: 1, duration: 0.2 }, '-=0.15');
  }
});
```

## UX Guidelines
- **Progressive disclosure** (Hick's Law): reveal content as the user scrolls, don't dump everything at once
- **Doherty threshold**: scroll-triggered animations should feel immediate -- `scrub: true` or `scrub: 0.5` for tight coupling
- Visual scroll progress indicator for long-form content
- Clear section markers or navigation dots for multi-section narratives
- `prefers-reduced-motion`: disable smooth scroll, use instant section jumps
- **Motion vocabulary diversity**: each section should have a distinct motion signature. Avoid identical `opacity: 0, y: 40` reveals everywhere -- mix clip-path reveals, blur transitions, scale transforms, text splitting, horizontal slides, etc. See the expanded technique catalog in `animations.md`
- **FOUC prevention**: elements animated from invisible → visible should start hidden via CSS classes (`opacity-0`), not `gsap.set`. Use `gsap.fromTo` to explicitly define start states. Only use `gsap.set` for dynamic/computed initial values
- **Easing variety**: vary easing per section -- `back.out(1.5)` for bouncy CTAs, `power3.inOut` for editorial sweeps, `none` for scrubbed timelines. See CSS easing variables in `animations.md`

## Gotchas

| Problem | Fix |
|---------|-----|
| Scroll jank with ScrollTrigger | Use `createUnifiedScroll` (not manual `gsap.ticker.add`) |
| Triggers fire at wrong positions | Call `ScrollTrigger.refresh()` after `createUnifiedScroll` |
| Pin jumps on mobile | Use `pinSpacing: true` (default) + `anticipatePin: 1` for horizontal scroll |
| Pin activates with visual jump | Add `anticipatePin: 1` to the ScrollTrigger config |
| Scrub feels laggy | Reduce `scrub` value (0.5 instead of 2) |
| Content flashes before scroll | Set initial state via CSS classes (`opacity-0`), not `gsap.set` |
| Every section looks the same | Vary motion signatures per section (see Motion Vocabulary in `animations.md`) |
| MCP tools can't scroll Lenis | Pass `{ debug: true }` to `createUnifiedScroll`, use `window.__scrollToSection(i)` |
| Monolithic component | Decompose at ~200 lines (see Decomposition Architecture above) |
