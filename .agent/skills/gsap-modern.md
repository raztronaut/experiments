# GSAP Modern Patterns

> GSAP with React: useGSAP hook, ScrollTrigger, dynamic import, cleanup

## Dynamic Import (Required in Next.js)
GSAP must not run on the server. Always dynamic import or guard:
```tsx
'use client'
import dynamic from 'next/dynamic'
const AnimatedComponent = dynamic(() => import('./AnimatedComponent'), { ssr: false })
```
Or import GSAP lazily inside useEffect/useGSAP.

## useGSAP Hook (from @gsap/react)
```tsx
import { useGSAP } from '@gsap/react'
import gsap from 'gsap'

function Component() {
  const container = useRef()

  useGSAP(() => {
    gsap.to('.box', { x: 200, duration: 1 })
  }, { scope: container }) // scopes selectors to container

  return <div ref={container}><div className="box" /></div>
}
```
`useGSAP` auto-cleans all tweens/timelines created inside it on unmount. No manual cleanup needed.

## contextSafe for Event Handlers
```tsx
const { contextSafe } = useGSAP({ scope: container })

const onClick = contextSafe(() => {
  gsap.to('.box', { rotation: 360 })
})
```
Event handlers created outside `useGSAP`'s callback need `contextSafe` to be auto-cleaned.

## ScrollTrigger
```tsx
import { ScrollTrigger } from 'gsap/ScrollTrigger'
gsap.registerPlugin(ScrollTrigger)

useGSAP(() => {
  gsap.to('.hero', {
    y: -100,
    opacity: 0,
    scrollTrigger: {
      trigger: '.hero',
      start: 'top top',
      end: 'bottom top',
      scrub: true,
    }
  })
})
```

### Pin + Scrub
```tsx
gsap.to('.panels', {
  xPercent: -100 * (panels.length - 1),
  ease: 'none',
  scrollTrigger: {
    trigger: '.container',
    pin: true,
    scrub: 1,
    end: () => '+=' + document.querySelector('.container').offsetWidth,
  }
})
```

### Snap
```tsx
ScrollTrigger.create({
  snap: 1 / (sections - 1),
  duration: { min: 0.2, max: 0.6 },
  ease: 'power2.inOut',
})
```

### Batch (Staggered Reveal)
```tsx
ScrollTrigger.batch('.item', {
  onEnter: (elements) => {
    gsap.to(elements, { opacity: 1, y: 0, stagger: 0.05, ease: 'power2.out' })
  },
  start: 'top 85%',
})
```

## Timeline Composition
```tsx
useGSAP(() => {
  const tl = gsap.timeline({ defaults: { ease: 'power2.out', duration: 0.6 } })

  tl.from('.title', { y: 40, opacity: 0 })
    .from('.subtitle', { y: 30, opacity: 0 }, '-=0.3')
    .from('.cta', { scale: 0.8, opacity: 0 }, '-=0.2')
})
```
Position parameter: `'-=0.3'` (overlap), `'+=0.5'` (gap), `'<'` (same start as previous).

## Tempus Integration

```ts
import Tempus from 'tempus'
gsap.ticker.remove(gsap.updateRoot)
Tempus.add((time) => gsap.updateRoot(time / 1000), { priority: 0 })
```
Puts GSAP under Tempus's unified RAF loop. For scroll experiments, `createUnifiedScroll()` from `@/lib/toolkit/scroll` handles this automatically (Lenis at priority -1, GSAP at priority 0, reference-counted). For manual Tempus access: `import Tempus from '@/lib/toolkit/raf'`.

## Performance
- `gsap.set()` for initial states (faster than CSS for many elements)
- Use `will-change: transform` only during active animation
- Avoid animating layout properties (width, height, top, left)
- `overwrite: 'auto'` prevents conflicting tweens from stacking
