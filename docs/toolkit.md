# Animation and 3D Toolkit

## Integration Layer

The toolkit at `src/lib/toolkit/` provides thin integration wrappers that unify the animation and rendering stack under a single RAF (requestAnimationFrame) loop.

### Priority Chain

All frame-based work runs through Tempus with a deterministic priority order:

| Priority | System | What it does |
|----------|--------|-------------|
| -1 | Lenis | Smooth scroll position updates |
| 0 | GSAP | Animation tick (tweens, timelines, ScrollTrigger) |
| 1 | Three.js | R3F render loop |

Lower priorities run first each frame. This ensures scroll position is updated before animations read it, and animations complete before the frame renders.

### scroll.ts -- `createUnifiedScroll()`

Creates a Lenis smooth-scroll instance wired to Tempus and GSAP:

```tsx
import { createUnifiedScroll } from '@/lib/toolkit/scroll'

const { lenis, destroy } = createUnifiedScroll({ debug: true })

// Always call destroy() on cleanup
return () => destroy()
```

Features:
- Lenis runs at Tempus priority -1
- GSAP's ticker is bound to Tempus at priority 0 (reference-counted across instances)
- `destroy()` disposes Tempus callbacks, kills ScrollTriggers created by that instance, and restores GSAP's own ticker only when the last instance is destroyed
- `{ debug: true }` attaches `window.__lenis`, `window.__scrollToSection(index)`, `window.__scrollToProgress(0-1)` for MCP browser tool scrolling (Lenis intercepts native programmatic scroll)

After creating unified scroll, call `ScrollTrigger.refresh()` -- `createUnifiedScroll` does not handle this internally.

### raf.ts -- Tempus Re-export

```tsx
import { Tempus } from '@/lib/toolkit/raf'
```

Minimal re-export of the Tempus RAF manager for direct access when needed outside the scroll/canvas context.

### r3f.tsx -- `ExperimentCanvas`

Canvas wrapper for R3F experiments:

```tsx
import { ExperimentCanvas } from '@/lib/toolkit/r3f'

<ExperimentCanvas>
  <MyScene />
</ExperimentCanvas>
```

Features:
- `TempusFrameDriver` binds R3F's render loop to Tempus at priority 1 (sets `frameloop="never"`)
- `dpr={[1, 2]}` with optional `AdaptiveDpr` and `AdaptiveEvents`
- Built-in `Suspense` and `Preload`
- `CanvasErrorBoundary` catches WebGL failures with a custom fallback

Import directly from `@/lib/toolkit/r3f` (not via the barrel) to avoid pulling R3F into non-3D experiments.

### Barrel Export

`src/lib/toolkit/index.ts` re-exports `Tempus`, `createUnifiedScroll`, and `UnifiedScrollHandle`. It deliberately does NOT re-export `ExperimentCanvas`.

## GSAP

GSAP is the primary animation engine. Always dynamically imported to keep it out of experiments that don't use it.

### Dynamic Import Pattern

```tsx
'use client'

import { useGSAP } from '@gsap/react'
import { useRef } from 'react'

export function MyComponent() {
  const containerRef = useRef<HTMLDivElement>(null)

  useGSAP(async () => {
    const gsap = (await import('gsap')).default
    const { ScrollTrigger } = await import('gsap/ScrollTrigger')
    gsap.registerPlugin(ScrollTrigger)

    gsap.to('.target', {
      x: 100,
      scrollTrigger: { trigger: '.target', start: 'top center' }
    })
  }, { scope: containerRef })

  return <div ref={containerRef}>...</div>
}
```

### Key Patterns

- `useGSAP` with `{ scope: ref }` for automatic cleanup of tweens and ScrollTriggers
- Each section component owns its own `useGSAP` scope
- Use `gsap.set()` for initial animation states (prevents flash-of-unstyled-content before ScrollTrigger activates)
- `position: fixed` elements in pinned sections are visible before ScrollTrigger activates -- always set initial states

## Motion (Framer Motion)

Import from `motion/react` (not the legacy `framer-motion` path):

```tsx
import { motion, AnimatePresence } from 'motion/react'
```

Used for layout animations, gestures, springs, `useScroll`, and `useTransform`. Prefer GSAP for scroll-driven timelines and Motion for component-level gestures and layout transitions.

## Lenis

Smooth scroll library. Integrates via `createUnifiedScroll()` or standalone:

```tsx
import { ReactLenis, useLenis } from 'lenis/react'
```

Lenis intercepts programmatic scroll (e.g., `window.scrollTo`). For MCP tools and automated testing, use the debug helpers exposed by `createUnifiedScroll({ debug: true })`:
- `window.__lenis` -- direct Lenis instance access
- `window.__scrollToSection(index)` -- scroll to a section by index
- `window.__scrollToProgress(0-1)` -- scroll to a normalized position

## Tempus

Unified RAF manager with a priority system. Ensures all frame-based work (scroll, animation, rendering) runs in deterministic order within a single `requestAnimationFrame` callback.

```tsx
import { useTempus } from 'tempus/react'

useTempus((time, delta) => {
  // Runs every frame at the default priority
}, [])
```

Features: pausable time, delta clamping, priority-based execution order.

## React Three Fiber (R3F)

React renderer for Three.js. Use `ExperimentCanvas` from the toolkit for automatic Tempus integration.

### State Management

Use Zustand for R3F state. Access via `getState()` in `useFrame` to avoid triggering React re-renders on every frame:

```tsx
const useStore = create((set) => ({
  speed: 1,
  setSpeed: (s) => set({ speed: s }),
}))

function AnimatedMesh() {
  useFrame(() => {
    const { speed } = useStore.getState()
    // Use speed without subscribing to re-renders
  })
  return <mesh>...</mesh>
}
```

### Drei Helpers

`@react-three/drei` provides: `Environment`, `OrbitControls`, `Text`, `Html`, `Float`, `MeshDistortMaterial`, and many more. Import directly -- don't barrel import the entire package.

## Dev Tools

### useDevControls

Leva controls wrapper with dead-code elimination:

```tsx
import { useDevControls } from '@/hooks/useDevControls'

const { speed, color } = useDevControls('Settings', {
  speed: { value: 1, min: 0, max: 10 },
  color: '#ff0000',
})
```

Returns static defaults in production (leva tree-shaken from bundle). Pass `{ production: true }` for showcase experiments that expose debug tools to visitors.

### Debug Overlay

`DevToolsInjector` is auto-injected in all experiment layouts:
- Loads `ExperimentDevMetrics` (FPS, heap, CLS, GSAP tween count every 2s)
- Activates `DebugOverlay` with `?debug` URL parameter
- Keyboard shortcuts: D (device info), L (leva toggle), H (hide GSDevTools), SPACE (play/pause)
- Tree-shakes to nothing in production

### R3F Dev Tools

`R3FDevToolsInjector` is auto-included in R3F experiment templates:
- r3f-perf visual panel (when `?debug` active)
- Scene graph inspection logged via `console.warn`
- Camera helpers: O (orbit mode), G (grid helper)
- Metrics piped to `window.__experimentMetrics.r3f`

### Queryable Metrics

All dev metrics are written to `window.__experimentMetrics` (structured JSON). AI agents using MCP tools can query: `eval("JSON.stringify(window.__experimentMetrics)")`.

## Animation Standards

### Timing

- Feedback: <200ms
- Transitions: 200-500ms
- Choreography: up to 800ms
- Doherty threshold: <400ms total response time

### Easing

- Entrances: ease-out
- Exits: ease-in
- State changes: ease-in-out
- Never use `linear` for UI motion

### Reduced Motion

Always respect `prefers-reduced-motion`. Use `gsap.set()` for instant-state fallbacks instead of early returns (this ensures the final visual state is correct). Motion's `useReducedMotion()` hook is available for React-level checks.

### Motion Vocabulary

Each section in a multi-section experiment should have a distinct motion signature. Avoid repeating `opacity: 0, y: 40` everywhere. Mix techniques: `clipPath` reveals, blur transitions, scale transforms, text splitting, parallax, horizontal scroll, counter-animations.
