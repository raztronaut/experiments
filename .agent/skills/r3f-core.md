# React Three Fiber Core

> R3F Canvas setup, useFrame, disposal, instancing, Drei essentials

## When to Use R3F vs Vanilla Three.js
- **R3F**: React app, declarative scene, component lifecycle management, Drei helpers
- **Vanilla Three.js**: Performance-critical hot paths, non-React contexts, WebGL compute
- **Hybrid**: R3F for scene management, vanilla Three.js for custom renderers/effects

## Canvas Setup
```tsx
import { Canvas } from '@react-three/fiber'
import { Suspense } from 'react'

<Canvas
  camera={{ position: [0, 0, 5], fov: 50 }}
  dpr={[1, 2]}
  gl={{ antialias: true, alpha: false }}
  style={{ background: '#000' }}
>
  <Suspense fallback={null}>
    <Scene />
  </Suspense>
</Canvas>
```
Always wrap scene content in `<Suspense>` for async asset loading (textures, models, fonts).

## useFrame
```tsx
import { useFrame } from '@react-three/fiber'

useFrame((state, delta) => {
  mesh.current.rotation.y += delta * 0.5  // frame-rate independent
  mesh.current.position.x = Math.sin(state.clock.elapsedTime) * 2
})
```
- `delta`: seconds since last frame. Use for incremental changes.
- `state.clock.elapsedTime`: total time. Use for oscillation/loops.
- **Never** call `setState` in `useFrame` -- use refs for render-loop state.
- Return `null` from `useFrame` callback to skip rendering (for manual control).

## Disposal
Three.js objects are not garbage collected. Dispose manually:
```tsx
useEffect(() => {
  return () => {
    geometry.dispose()
    material.dispose()
    if (material.map) material.map.dispose()
  }
}, [])
```
R3F auto-disposes when components unmount IF using JSX elements. Manual `new THREE.Mesh()` needs manual disposal.

## Instancing (Drei)
```tsx
import { Instances, Instance } from '@react-three/drei'

<Instances limit={1000} range={1000}>
  <boxGeometry />
  <meshStandardMaterial />
  {particles.map((p, i) => (
    <Instance key={i} position={p.position} color={p.color} />
  ))}
</Instances>
```
Single draw call for all instances. Use for particles, forests, crowds.

## Drei Essentials

| Component | Use |
|-----------|-----|
| `Environment` | IBL lighting from HDR presets |
| `OrbitControls` | Camera orbit/zoom/pan |
| `useProgress` | Loading progress (0-100) |
| `useTexture` | Texture loading with Suspense |
| `useGLTF` | Model loading (.glb/.gltf) |
| `Float` | Gentle floating animation |
| `Text` / `Text3D` | 3D text rendering |
| `Html` | DOM elements in 3D space |
| `Preload` | Preload all assets on mount |

## Performance Budgets
| Metric | Target |
|--------|--------|
| FPS | >55 (60 ideal) |
| Draw calls | <50 per frame |
| Triangles | <200K for standard scenes |
| Textures | Power-of-2, KTX2/Basis for large |
| Geometries | Share via refs, don't duplicate |

## Responsive DPR
```tsx
import { useThree } from '@react-three/fiber'

function AdaptiveDPR() {
  const { gl, performance } = useThree()
  useEffect(() => {
    if (performance.current < 1) {
      gl.setPixelRatio(1) // drop quality when struggling
    }
  }, [performance.current])
  return null
}
```

## Common Patterns
- **Post-processing**: `@react-three/postprocessing` with `<EffectComposer>`, not vanilla Three.js passes
- **Physics**: `@react-three/rapier` for rigid body physics
- **Debug**: `leva` for parameter tweaking: `const { speed } = useControls({ speed: { value: 1, min: 0, max: 5 } })`
- **Events**: R3F mesh events (`onClick`, `onPointerOver`) work like DOM events, with raycasting built in
