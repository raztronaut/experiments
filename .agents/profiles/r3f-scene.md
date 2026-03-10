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

Prefer `ExperimentCanvas` from `@/lib/toolkit/r3f` -- it handles DPR, Suspense, Preload, and optional adaptive performance / error boundaries:

```tsx
import { ExperimentCanvas } from '@/lib/toolkit/r3f'
import { Environment, OrbitControls } from '@react-three/drei'
import { R3FDevToolsInjector } from '@/components/dev/R3FDevToolsInjector'

<ExperimentCanvas
  camera={{ position: [0, 0, 5], fov: 50 }}
  gl={{ antialias: true, alpha: false }}
  adaptive
  errorFallback={<p>3D content unavailable.</p>}
>
  <R3FDevToolsInjector />
  <ambientLight intensity={0.5} />
  <directionalLight position={[10, 10, 5]} intensity={1} />
  <Environment preset="city" />
  <OrbitControls />
</ExperimentCanvas>
```

For post-processing scenes, configure tone mapping:
```tsx
<ExperimentCanvas
  gl={{ toneMapping: THREE.NoToneMapping }}
  flat
>
  <Scene />
  <EffectComposer>
    <Bloom />
    <ToneMapping mode={ToneMappingMode.ACES_FILMIC} />
  </EffectComposer>
</ExperimentCanvas>
```

## useFrame Pattern
```tsx
useFrame((state, delta) => {
  const d = Math.min(delta, 1/15) // clamp to prevent physics explosions on frame drops
  meshRef.current.rotation.y += d * 0.5
})
```
Always use `delta` for frame-rate-independent motion. Clamp delta for any physics or position-sensitive logic. Never use `clock.elapsedTime` directly for incremental rotation. Read Zustand stores via `useStore.getState()` inside `useFrame` -- never hooks.

## Responsive Canvas

Use feature detection, not user agent sniffing:
```tsx
function useDeviceCapabilities() {
  const [caps, setCaps] = useState({
    isMobile: false,
    isReducedMotion: false,
    maxDpr: 2,
  })
  useEffect(() => {
    setCaps({
      isMobile: window.matchMedia('(pointer: coarse)').matches
        || navigator.maxTouchPoints > 0,
      isReducedMotion: window.matchMedia('(prefers-reduced-motion: reduce)').matches,
      maxDpr: Math.min(window.devicePixelRatio, 2),
    })
  }, [])
  return caps
}
```

Feature-gate expensive rendering:
```tsx
const { isMobile, isReducedMotion } = useDeviceCapabilities()

<Canvas dpr={isMobile ? [1, 1.5] : [1, 2]}>
  <AdaptiveDpr pixelated />
  <AdaptiveEvents />
  <Scene particleCount={isMobile ? 500 : 5000} />
  {!isMobile && <EffectComposer><Bloom /></EffectComposer>}
</Canvas>
```

Reduce geometry complexity on mobile. Use `useThree` to read viewport size. See `r3f-core.md` Device Detection for full hook.

## Loading States
```tsx
import { useProgress } from '@react-three/drei'
const { progress } = useProgress()
```
Wrap 3D content in `<Suspense fallback={<Loader />}>`. Avoid blank canvas in finished experiments.

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
- [ ] DPR responsive to device (prefer `adaptive` prop on `ExperimentCanvas`)
- [ ] Error boundary wrapping Canvas (use `errorFallback` prop)
- [ ] Suspense boundary with fallback
- [ ] Tone mapping strategy decided (default ACESFilmic or manual via post-processing)
- [ ] R3FDevToolsInjector included (auto-added by plop templates)
- [ ] Disposal in cleanup functions
- [ ] Mobile feature gating if using post-processing or heavy particle counts
