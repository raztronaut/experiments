# Tempus RAF Management

> Tempus v1.0.0-dev.17 -- unified requestAnimationFrame manager by darkroom.engineering

## Installation
```bash
npm i tempus
```

## Core API
```ts
import Tempus from 'tempus'

const unsubscribe = Tempus.add((time, deltaTime, frameCount) => {
  // time: elapsed ms
  // deltaTime: ms since last frame
  // frameCount: total frames
}, { priority: 0 })

// Cleanup
unsubscribe()
```

## Priority System
Lower priority runs first: `[-Infinity] -> [0] -> [Infinity]`

```ts
Tempus.add(scrollUpdate, { priority: -1 })  // scroll first
Tempus.add(animationUpdate, { priority: 0 }) // then animations
Tempus.add(renderScene, { priority: 1 })     // render last
```

Typical ordering:
1. `priority: -1` -- Lenis scroll updates
2. `priority: 0` -- GSAP animations, game logic
3. `priority: 1` -- Three.js rendering

## FPS Targeting
```ts
Tempus.add(heavyComputation, { fps: 30 })      // absolute cap
Tempus.add(lighterWork, { fps: '50%' })         // relative to system
```

## Idle Callback
```ts
Tempus.add(nonCriticalWork, { idle: 0.8 })
// Only runs when RAF usage is below 80%
```

## Playback Control
```ts
Tempus.pause()
Tempus.play()
Tempus.restart()
```

## React Integration
```tsx
import { useTempus, ReactTempus } from 'tempus/react'

function AnimatedComponent() {
  useTempus((time, deltaTime) => {
    // runs every frame, auto-cleaned on unmount
  }, { priority: 0, fps: 60 })
}

// In layout/provider:
<ReactTempus patch />  // patches global rAF to use Tempus
```

## Unifying Lenis + GSAP + Three.js
The key pattern: put all frame-based systems under Tempus's single RAF loop.

```ts
import Tempus from 'tempus'
import Lenis from 'lenis'
import gsap from 'gsap'

// 1. Lenis (scroll, highest priority -- runs first)
const lenis = new Lenis({ autoRaf: false })
lenis.on('scroll', ScrollTrigger.update)
const lenisDispose = Tempus.add((time) => lenis.raf(time), { priority: -1 })

// 2. GSAP (animations)
gsap.ticker.remove(gsap.updateRoot)
const gsapDispose = Tempus.add((time) => gsap.updateRoot(time / 1000), { priority: 0 })
gsap.ticker.lagSmoothing(0)

// 3. Three.js rendering (last)
const renderDispose = Tempus.add((_time, deltaTime) => {
  const dt = Math.min(deltaTime, 1000 / 15) // delta clamp
  renderer.render(scene, camera)
}, { priority: 1 })

// Cleanup
lenisDispose(); gsapDispose(); renderDispose()
gsap.ticker.add(gsap.updateRoot) // restore GSAP's own ticker
lenis.destroy()
```

In the experiments toolkit, `createUnifiedScroll()` from `@/lib/toolkit/scroll` handles steps 1-2 with reference-counted GSAP binding and proper cleanup. For R3F, pass `tempus` to `<ExperimentCanvas>` to handle step 3.

Benefits:
- Single RAF callback instead of 3+ separate loops
- Deterministic execution order via priorities
- Auto-pause when tab is hidden (browser RAF behavior)
- One place to measure frame budget
- Delta clamping prevents physics explosions on frame drops

## Global RAF Patching
```ts
Tempus.patch()    // ALL rAF calls now go through Tempus
Tempus.unpatch()  // restore native behavior
```
Use sparingly -- can break third-party libraries that depend on raw rAF behavior.

## R3F Binding

Set `frameloop="never"` on the Canvas and drive rendering from Tempus at priority 1 (after scroll and animations):

```tsx
import { Canvas, useThree } from '@react-three/fiber'
import Tempus from 'tempus'
import { useEffect } from 'react'

function TempusFrameDriver() {
  const { gl, scene, camera, invalidate } = useThree()

  useEffect(() => {
    const dispose = Tempus.add((_time, deltaTime) => {
      const dt = Math.min(deltaTime, 1000 / 15) // clamp to prevent physics explosions
      gl.render(scene, camera)
    }, { priority: 1 })
    return dispose
  }, [gl, scene, camera])

  return null
}

// Usage:
<Canvas frameloop="never" dpr={[1, 2]}>
  <TempusFrameDriver />
  {/* scene content */}
</Canvas>
```

With `ExperimentCanvas`, pass the `tempus` prop instead:

```tsx
import { ExperimentCanvas } from '@/lib/toolkit/r3f'

<ExperimentCanvas tempus camera={{ position: [0, 0, 5] }}>
  {/* scene content -- useFrame still works, driven by Tempus */}
</ExperimentCanvas>
```

### useFrameCallback (delta-clamped)

A hook inspired by basement.studio's pattern that provides clamped delta time and per-component elapsed tracking:

```tsx
import Tempus from 'tempus'
import { useEffect, useRef } from 'react'

export function useFrameCallback(
  callback: (dt: number, elapsed: number) => void,
  priority = 1,
  deps: unknown[] = []
) {
  const elapsed = useRef(0)
  const cb = useRef(callback)
  cb.current = callback

  useEffect(() => {
    const dispose = Tempus.add((_time, deltaTime) => {
      const dt = Math.min(deltaTime / 1000, 1 / 15)
      elapsed.current += dt
      cb.current(dt, elapsed.current)
    }, { priority })
    return dispose
  }, [priority, ...deps])
}
```

## Delta Clamping

Always clamp `deltaTime` in physics-based or incremental animations to prevent explosions after frame drops (tab switch, heavy GC, etc.):

```ts
Tempus.add((_time, deltaTime) => {
  const dt = Math.min(deltaTime, 1000 / 15) // cap at ~67ms (15fps floor)
  // use dt for all velocity/position updates
}, { priority: 1 })
```

Without clamping, a 2-second pause (tab hidden → visible) delivers `deltaTime ≈ 2000ms`, which sends physics objects flying. The `1000/15` cap means even at 15fps, motion stays smooth.

## Pausable Time

Tempus supports global pause/play for modals, overlays, or focus-loss:

```ts
Tempus.pause()   // all callbacks stop
Tempus.play()    // resume from where it paused
Tempus.restart() // reset elapsed time to 0
```

For per-component pausing, track elapsed time independently:

```tsx
function PausableAnimation({ paused }: { paused: boolean }) {
  const elapsed = useRef(0)

  useEffect(() => {
    const dispose = Tempus.add((_time, deltaTime) => {
      if (paused) return
      elapsed.current += deltaTime / 1000
      // animate using elapsed.current
    }, { priority: 0 })
    return dispose
  }, [paused])
}
```

## Tempus.patch() and Third-Party Libraries

`Tempus.patch()` hijacks the global `requestAnimationFrame`, routing ALL rAF calls through Tempus. This automatically captures R3F's internal render loop, GSAP's ticker, and any other library using rAF.

```ts
Tempus.patch()   // all rAF → Tempus
Tempus.unpatch() // restore native rAF
```

Trade-off: simpler than manually setting `frameloop="never"` + Tempus binding, but can break libraries that depend on raw rAF timing (e.g., video players, certain analytics). Prefer explicit binding via `frameloop="never"` for R3F and `gsap.ticker.remove(gsap.updateRoot)` for GSAP unless you need to capture unknown third-party loops.

## When to Use Tempus
- Experiments with multiple animation systems (Lenis + GSAP + R3F)
- When you need priority-ordered frame updates
- When you want centralized FPS monitoring
- **Not needed** for simple experiments with a single animation system
