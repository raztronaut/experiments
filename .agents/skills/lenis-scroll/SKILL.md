---
name: lenis-scroll
description: "Lenis smooth scroll integration with GSAP and Tempus. Covers createUnifiedScroll(), priority chain, ScrollTrigger refresh, MCP scroll helpers. Use when implementing smooth scroll in experiments."
---

# Lenis Smooth Scroll

> Lenis v1.3.18 -- smooth scroll library by darkroom.engineering

## Installation
```bash
npm i lenis
```
Import the CSS: `import 'lenis/dist/lenis.css'`

## React Setup
```tsx
import { ReactLenis, useLenis } from 'lenis/react'

function App() {
  return (
    <ReactLenis root options={{ lerp: 0.1, smoothWheel: true }}>
      {children}
    </ReactLenis>
  )
}
```
`root` makes the instance globally accessible via `useLenis()` from any child component.

## useLenis Hook
```tsx
const lenis = useLenis((lenis) => {
  // called every scroll frame
  console.log(lenis.progress)  // 0 to 1
  console.log(lenis.velocity)
  console.log(lenis.direction) // 1 or -1
})
```

## scrollTo
```tsx
lenis.scrollTo('#section-3', {
  offset: -100,
  duration: 1.2,
  easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
  onComplete: () => console.log('done'),
})
```
Targets: number (pixels), CSS selector, HTMLElement, `'top'`, `'bottom'`.

## Tempus Integration (Recommended)

Unifies Lenis + GSAP under a single RAF with deterministic priority ordering. This is the canonical pattern used by darkroom.engineering and Satus-based projects.

```ts
import Tempus from 'tempus'
import Lenis from 'lenis'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

const lenis = new Lenis({ autoRaf: false })
lenis.on('scroll', ScrollTrigger.update)

// Priority: Lenis first (-1), GSAP second (0), rendering last (1)
Tempus.add((time) => lenis.raf(time), { priority: -1 })
gsap.ticker.remove(gsap.updateRoot)
Tempus.add((time) => gsap.updateRoot(time / 1000), { priority: 0 })
gsap.ticker.lagSmoothing(0)

ScrollTrigger.refresh()
```

In the experiments toolkit, `createUnifiedScroll()` from `@/lib/toolkit/scroll` wraps this with reference-counted GSAP-Tempus binding, proper cleanup, and optional debug helpers.

### React hook: useTempus

```tsx
import { useTempus } from 'tempus/react'

function ScrollDrivenEffect() {
  useTempus((time, deltaTime) => {
    // runs every frame at default priority (0), auto-cleaned on unmount
  }, { priority: 0 })
}
```

## GSAP Ticker Integration (Without Tempus)

Drives Lenis from GSAP's ticker. Simpler, but runs a separate RAF from any R3F or Canvas systems.

```tsx
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { ReactLenis } from 'lenis/react'
import { useEffect, useRef } from 'react'

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

## Key Options
| Option | Default | Notes |
|--------|---------|-------|
| `lerp` | `0.1` | Interpolation intensity (0-1). Lower = smoother, slower |
| `duration` | `1.2` | Scroll duration (overrides lerp) |
| `smoothWheel` | `true` | Smooth wheel scrolling |
| `orientation` | `vertical` | `vertical` or `horizontal` |
| `syncTouch` | `false` | Smooth touch scroll (experimental) |
| `infinite` | `false` | Infinite scrolling |
| `autoRaf` | `false` | Auto RAF loop. Set false when using GSAP/Tempus |
| `prevent` | `undefined` | `(node) => boolean` to skip elements (inputs, textareas) |

## Properties
`lenis.animatedScroll`, `lenis.targetScroll`, `lenis.velocity`, `lenis.direction`, `lenis.progress`, `lenis.isScrolling`, `lenis.isStopped`, `lenis.limit`

## Common Patterns
- **Disable during modal**: `lenis.stop()` / `lenis.start()`
- **Nested scroll**: `options={{ prevent: (node) => node.classList.contains('nested-scroll') }}`
- **Horizontal sections**: set `orientation: 'horizontal'` or use ScrollTrigger horizontal pinning
