---
trigger: file_match
file_patterns:
  - "src/components/experiments/**/*.tsx"
description: Loads when editing experiments that may use scroll-driven animation
---

# Scroll Animation Rules

## Lenis + GSAP ScrollTrigger (Canonical Wiring)
```tsx
import { ReactLenis, useLenis } from 'lenis/react'

// In layout or provider:
const lenisRef = useRef()

useEffect(() => {
  function update(time) {
    lenisRef.current?.lenis?.raf(time * 1000)
  }
  gsap.ticker.add(update)
  return () => gsap.ticker.remove(update)
}, [])

<ReactLenis root options={{ autoRaf: false }} ref={lenisRef} />
```

## Lenis + Tempus (Unified RAF)
When using Tempus as the global RAF manager:
```ts
import Tempus from 'tempus'
const lenis = new Lenis()
Tempus.add((time) => lenis.raf(time))
```

## ScrollTrigger Patterns
- **Pin**: `{ pin: true, scrub: 1 }` -- element stays fixed while scroll drives animation
- **Scrub**: `scrub: true` (instant) or `scrub: 1` (1s smoothing) -- ties animation progress to scroll
- **Snap**: `snap: 1 / (sections - 1)` -- snaps to section boundaries
- **Batch**: `ScrollTrigger.batch('.item', { onEnter: ... })` -- staggered reveal on scroll

## Performance
- Debounce scroll callbacks that trigger layout reads
- Use `will-change: transform` sparingly and remove after animation completes
- Avoid scroll-linked `setState` -- use refs or GSAP/Motion scroll utilities
- For scroll progress indicators, use CSS scroll-driven animations or `useScroll` from Motion

## Scroll UX
- Respect `prefers-reduced-motion`: disable smooth scroll, use instant jumps
- Provide visual scroll progress cues for long-form content
- Lenis `prevent` option to skip smoothing on form inputs and scrollable nested containers
