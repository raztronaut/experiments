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

// 1. Lenis (scroll, highest priority)
const lenis = new Lenis()
Tempus.add((time) => lenis.raf(time), { priority: -1 })

// 2. GSAP (animations)
gsap.ticker.remove(gsap.updateRoot)
Tempus.add((time) => gsap.updateRoot(time / 1000), { priority: 0 })

// 3. Three.js rendering (last)
Tempus.add(() => renderer.render(scene, camera), { priority: 1 })
```

Benefits:
- Single RAF callback instead of 3+ separate loops
- Deterministic execution order via priorities
- Auto-pause when tab is hidden (browser RAF behavior)
- One place to measure frame budget

## Global RAF Patching
```ts
Tempus.patch()    // ALL rAF calls now go through Tempus
Tempus.unpatch()  // restore native behavior
```
Use sparingly -- can break third-party libraries that depend on raw rAF behavior.

## When to Use Tempus
- Experiments with multiple animation systems (Lenis + GSAP + R3F)
- When you need priority-ordered frame updates
- When you want centralized FPS monitoring
- **Not needed** for simple experiments with a single animation system
