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

## Toolkit Setup: Lenis + GSAP ScrollTrigger
```tsx
'use client'
import { ReactLenis } from 'lenis/react'
import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

function ScrollLayout({ children }) {
  const lenisRef = useRef()

  useEffect(() => {
    function update(time) {
      lenisRef.current?.lenis?.raf(time * 1000)
    }
    gsap.ticker.add(update)
    gsap.ticker.lagSmoothing(0)
    return () => gsap.ticker.remove(update)
  }, [])

  return (
    <ReactLenis root options={{ autoRaf: false }} ref={lenisRef}>
      {children}
    </ReactLenis>
  )
}
```

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
}, [])
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
| Scroll jank with ScrollTrigger | Wire Lenis correctly (autoRaf: false, gsap.ticker) |
| Pin jumps on mobile | Use `pinSpacing: true` (default), test on real devices |
| Scrub feels laggy | Reduce `scrub` value (0.5 instead of 2) |
| Content flashes before scroll | Set initial state (opacity: 0, y: 50) in CSS or gsap.set |
