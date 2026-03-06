# R3F Scene Profile

> Activate when `experiment.json` has `"profile": "r3f-scene"`

## Behavioral Mode
**Performance-obsessed, frame-rate-aware, GPU-conscious.** Frame budget is sacred: 16.67ms. Every draw call counts.

## Priority Ordering
1. Frame rate (60fps, no jank)
2. Memory (dispose everything, no leaks)
3. Visual correctness (matches creative intent)
4. Draw call efficiency (instancing, merging)
5. Device responsiveness (adapt DPR, geometry complexity)

## Toolkit Setup
```tsx
import { Canvas } from '@react-three/fiber'
import { Environment, OrbitControls } from '@react-three/drei'
import { Perf } from 'r3f-perf'

<Canvas
  camera={{ position: [0, 0, 5], fov: 50 }}
  dpr={[1, 2]}
  gl={{ antialias: true, alpha: false }}
>
  <ambientLight intensity={0.5} />
  <directionalLight position={[10, 10, 5]} intensity={1} />
  <Environment preset="city" />
  <OrbitControls />
  {process.env.NODE_ENV === 'development' && <Perf position="top-left" />}
</Canvas>
```

## useFrame Pattern
```tsx
useFrame((state, delta) => {
  meshRef.current.rotation.y += delta * 0.5
})
```
Always use `delta` for frame-rate-independent motion. Never use `clock.elapsedTime` directly for incremental rotation.

## Responsive Canvas
```tsx
const isMobile = /iPhone|iPad|Android/i.test(navigator.userAgent)
<Canvas dpr={isMobile ? [1, 1.5] : [1, 2]}>
```
Reduce geometry complexity on mobile. Use `useThree` to read viewport size.

## Loading States
```tsx
import { useProgress } from '@react-three/drei'
const { progress } = useProgress()
```
Wrap 3D content in `<Suspense fallback={<Loader />}>`. Never show a blank canvas.

## Gotchas

| Problem | Fix |
|---------|-----|
| GSAP hydration errors | Dynamic import with `{ ssr: false }` |
| Memory leaks | Dispose geometry/material/texture in cleanup |
| Low FPS on mobile | Reduce `dpr`, simplify geometry, fewer lights |
| Too many draw calls | Use `<Instances>` from drei |
| Flickering on mount | Wrap in Suspense, preload assets |
| `useMemo` warnings | Not needed with React Compiler -- remove them |

## Pre-Implementation Checklist
- [ ] Camera position and FOV defined
- [ ] Lighting setup (ambient + directional minimum)
- [ ] DPR responsive to device
- [ ] Suspense boundary with fallback
- [ ] r3f-perf in dev mode
- [ ] Disposal in cleanup functions
