# React Three Fiber Core

> R3F Canvas setup, useFrame, disposal, instancing, Drei essentials, tone mapping, adaptive performance, error boundaries, DOM-WebGL bridging, post-processing, loading strategies, and state management in frame loops.

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

### Tone Mapping & Color Space

Tone mapping converts HDR scene values to displayable LDR. The default `ACESFilmicToneMapping` works for most scenes but can muddy colors when post-processing handles its own tone mapping pass.

```tsx
import * as THREE from 'three'

// Default: good for lit scenes
<Canvas gl={{ toneMapping: THREE.ACESFilmicToneMapping }} />

// For custom post-processing pipelines that manage tone mapping internally:
<Canvas
  gl={{ toneMapping: THREE.NoToneMapping }}
  flat  // disables tone mapping in R3F's color management
/>
```

`outputColorSpace` controls the final color space. R3F defaults to `THREE.SRGBColorSpace`. Set `linear` prop on Canvas for linear workflow when doing manual color management in post-processing:
```tsx
<Canvas linear flat />
```

**Rule of thumb**: If using `EffectComposer` with a `ToneMapping` effect, set `<Canvas gl={{ toneMapping: THREE.NoToneMapping }}>` and let the effect handle it.

### Error Boundary

WebGL can fail on unsupported devices. Wrap Canvas so the page degrades gracefully:

```tsx
import { ErrorBoundary } from 'react-error-boundary'

function WebGLFallback({ error }: { error: Error }) {
  return (
    <div className="flex items-center justify-center h-full bg-neutral-950 text-neutral-400">
      <p>3D content unavailable on this device.</p>
    </div>
  )
}

<ErrorBoundary FallbackComponent={WebGLFallback}>
  <Canvas>
    <Scene />
  </Canvas>
</ErrorBoundary>
```

The `ExperimentCanvas` toolkit wrapper includes this automatically when the `errorFallback` prop is provided.

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
- **Delta clamping**: On tab switches or frame drops, `delta` can spike. Clamp it to prevent physics explosions: `const d = Math.min(delta, 1/15)`.

### Smooth Damping with maath

`maath/easing` provides frame-rate-independent damping functions -- the idiomatic R3F way to smoothly interpolate values in `useFrame`:

```tsx
import { damp3, dampE } from 'maath/easing'

useFrame((_, delta) => {
  // smoothly move position toward target (lambda = smoothing factor)
  damp3(meshRef.current.position, targetPosition, 4, delta)
  // smoothly rotate toward target euler
  dampE(meshRef.current.rotation, targetRotation, 4, delta)
})
```

Available: `damp` (scalar), `damp2` (Vector2), `damp3` (Vector3), `dampE` (Euler), `dampC` (Color), `dampQ` (Quaternion). **Not installed by default** -- add with `npm i maath`.

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

For very large counts (10K+), drop to the lower-level `THREE.InstancedMesh` API with manual matrix updates via `setMatrixAt()`.

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
| `AdaptiveDpr` | Auto-scale DPR based on performance |
| `AdaptiveEvents` | Throttle pointer events when struggling |
| `ScreenQuad` | Fullscreen quad (for shader effects) |
| `useFBO` | Render target for multi-pass rendering |
| `View` | Multiple viewports sharing one Canvas |

## Adaptive Performance

Drei provides built-in components that respond to R3F's performance system:

```tsx
import { AdaptiveDpr, AdaptiveEvents } from '@react-three/drei'

<Canvas dpr={[1, 2]}>
  <AdaptiveDpr pixelated />
  <AdaptiveEvents />
  <Scene />
</Canvas>
```

- `AdaptiveDpr`: Automatically lowers DPR when frame rate drops. `pixelated` prevents blur at low DPR.
- `AdaptiveEvents`: Throttles pointer events to reduce CPU pressure under load.

For manual control, use R3F's performance API:

```tsx
import { useThree } from '@react-three/fiber'

function PerformanceMonitor() {
  const { performance } = useThree()

  useEffect(() => {
    // performance.current ranges from 0 (bad) to 1 (good)
    if (performance.current < 0.5) {
      // reduce quality: fewer particles, simpler materials, etc.
    }
  })

  return null
}

// Signal a performance regression manually (e.g., during heavy computation):
performance.regress()
```

## Performance Budgets
| Metric | Target |
|--------|--------|
| FPS | >55 (60 ideal) |
| Draw calls | <50 per frame |
| Triangles | <200K for standard scenes |
| Textures | Power-of-2, KTX2/Basis for large |
| Geometries | Share via refs, don't duplicate |

## DOM-WebGL Bridge (tunnel-rat)

For experiments with a persistent Canvas and page-specific 3D content, `tunnel-rat` creates a portal between DOM components and the Canvas:

```tsx
import tunnel from 'tunnel-rat'

const webglTunnel = tunnel()

// In DOM (outside Canvas):
function PageSection() {
  return (
    <webglTunnel.In>
      <SpecialMesh position={[0, 2, 0]} />
    </webglTunnel.In>
  )
}

// Inside Canvas:
function SceneContent() {
  return (
    <>
      <PersistentBackground />
      <webglTunnel.Out />
    </>
  )
}
```

**When to use**: Shared persistent canvas with page-specific 3D content (layer-cake pattern: HTML scrolling over fixed WebGL). Without tunnel-rat, you'd need to hoist all 3D state to the Canvas level.

**Not installed by default** -- add with `npm i tunnel-rat`. Recommended as a Tier 2 library.

## Post-Processing

### Standard: @react-three/postprocessing

```tsx
import { EffectComposer, Bloom, Vignette, ToneMapping } from '@react-three/postprocessing'
import { ToneMappingMode } from 'postprocessing'

<Canvas gl={{ toneMapping: THREE.NoToneMapping }}>
  <Scene />
  <EffectComposer>
    <Bloom luminanceThreshold={0.5} intensity={1.5} />
    <Vignette darkness={0.6} />
    <ToneMapping mode={ToneMappingMode.ACES_FILMIC} />
  </EffectComposer>
</Canvas>
```

For per-scene mood shifts, animate effect parameters using Motion's `MotionValue`:
```tsx
import { useMotionValue, animate } from 'motion/react'

function AnimatedBloom({ intensity }: { intensity: number }) {
  const mv = useMotionValue(0)
  useEffect(() => { animate(mv, intensity, { duration: 1.2 }) }, [intensity])

  return <Bloom intensity={mv.get()} />
}
```

### Custom: Render to FBO + Fullscreen Quad

For effects not covered by the postprocessing library, render the scene to a texture and process it:

```tsx
import { useFBO, ScreenQuad } from '@react-three/drei'

function CustomEffect() {
  const fbo = useFBO()
  const materialRef = useRef<ShaderMaterial>(null)

  useFrame(({ gl, scene, camera }) => {
    gl.setRenderTarget(fbo)
    gl.render(scene, camera)
    gl.setRenderTarget(null)
    if (materialRef.current) {
      materialRef.current.uniforms.tDiffuse.value = fbo.texture
    }
  })

  return (
    <ScreenQuad>
      <shaderMaterial
        ref={materialRef}
        fragmentShader={customEffectFrag}
        vertexShader={screenQuadVert}
        uniforms={{ tDiffuse: { value: null }, uTime: { value: 0 } }}
      />
    </ScreenQuad>
  )
}
```

`ScreenQuad` from drei is preferred over `<mesh><planeGeometry>` -- it renders a proper fullscreen triangle that ignores the camera projection.

### Selective Bloom

Apply bloom to specific objects only:
```tsx
import { Selection, Select, EffectComposer, SelectiveBloom } from '@react-three/postprocessing'

<Selection>
  <EffectComposer>
    <SelectiveBloom luminanceThreshold={0} intensity={2} />
  </EffectComposer>
  <Select enabled>
    <GlowingMesh />
  </Select>
  <NonGlowingMesh />
</Selection>
```

## Loading Strategies

### KTX2 Texture Compression

KTX2 with Basis Universal transcoding delivers 4-6x smaller textures than PNG/JPG that decompress on GPU:

```tsx
import { useKTX2 } from '@react-three/drei'

function TexturedMesh() {
  const texture = useKTX2('/textures/albedo.ktx2')
  return (
    <mesh>
      <boxGeometry />
      <meshStandardMaterial map={texture} />
    </mesh>
  )
}

useKTX2.preload('/textures/albedo.ktx2')
```

Basis transcoder setup (one-time, typically in a provider or layout):
```tsx
import { useThree } from '@react-three/fiber'
import { KTX2Loader } from 'three/examples/jsm/loaders/KTX2Loader'

const ktx2Loader = new KTX2Loader()
  .setTranscoderPath('/basis/')  // host Basis transcoder WASM files
  .detectSupport(renderer)
```

### Suspense Loading Boundaries

Layer Suspense boundaries for progressive loading:
```tsx
<Canvas>
  <Suspense fallback={<LoadingScreen />}>
    {/* Heavy: models, textures */}
    <MainScene />
    <Suspense fallback={null}>
      {/* Optional: post-processing, particles */}
      <EffectComposer>...</EffectComposer>
    </Suspense>
  </Suspense>
</Canvas>
```

### Loading UI

```tsx
import { useProgress, Html } from '@react-three/drei'

function Loader() {
  const { progress, active } = useProgress()
  return active ? (
    <Html center>
      <p>{progress.toFixed(0)}%</p>
    </Html>
  ) : null
}
```

## React 19 Activity

`<Activity>` defers updates to off-screen content. Useful for multi-page experiments with a persistent Canvas:

```tsx
import { Activity } from 'react'

function PageContent({ visible }: { visible: boolean }) {
  return (
    <Activity mode={visible ? 'visible' : 'hidden'}>
      <HeavyR3FScene />
    </Activity>
  )
}
```

When `mode="hidden"`, React defers re-renders and effects. The component stays mounted (preserving state) but stops updating until visible again. Pairs well with `tunnel-rat` for page-specific 3D content.

## State Management in Frame Loops

### Zustand: getState() for Non-Reactive Reads

Inside `useFrame`, never subscribe to Zustand stores via hooks -- use `getState()` for zero-overhead reads:

```tsx
import { create } from 'zustand'

const useGameStore = create((set) => ({
  targetPosition: [0, 0, 0],
  score: 0,
  setTarget: (pos) => set({ targetPosition: pos }),
}))

function MovingMesh() {
  const meshRef = useRef<Mesh>(null)

  useFrame((_, delta) => {
    // Direct state read -- no subscription, no re-render
    const { targetPosition } = useGameStore.getState()
    damp3(meshRef.current.position, targetPosition, 4, delta)
  })

  return <mesh ref={meshRef}><boxGeometry /><meshStandardMaterial /></mesh>
}
```

### Zustand: Optimized Subscriptions

For React-side reads, use selectors with shallow comparison:
```tsx
import { useShallow } from 'zustand/shallow'

// Only re-renders when these specific values change
const { score, lives } = useGameStore(useShallow((s) => ({
  score: s.score,
  lives: s.lives,
})))
```

### Transient Subscriptions

For values that change every frame but only need to update DOM occasionally:
```tsx
const unsubscribe = useGameStore.subscribe(
  (state) => state.score,
  (score) => { scoreElement.textContent = String(score) }
)
```

## Device Detection

Replace `navigator.userAgent` sniffing with proper feature detection:

```tsx
function useDeviceCapabilities() {
  const [caps, setCaps] = useState({
    isMobile: false,
    isReducedMotion: false,
    supportsWebGL2: true,
    maxDpr: 2,
  })

  useEffect(() => {
    setCaps({
      isMobile: window.matchMedia('(pointer: coarse)').matches
        || navigator.maxTouchPoints > 0,
      isReducedMotion: window.matchMedia('(prefers-reduced-motion: reduce)').matches,
      supportsWebGL2: !!document.createElement('canvas').getContext('webgl2'),
      maxDpr: Math.min(window.devicePixelRatio, 2),
    })
  }, [])

  return caps
}
```

Use for feature gating:
```tsx
function Scene() {
  const { isMobile, isReducedMotion } = useDeviceCapabilities()
  return (
    <>
      <ParticleSystem count={isMobile ? 500 : 5000} />
      {!isMobile && <EffectComposer><Bloom /></EffectComposer>}
      {!isReducedMotion && <FloatingElements />}
    </>
  )
}
```

For more sophisticated GPU detection, consider `@pmndrs/detect-gpu` (not installed by default).

## Keyboard Accessibility in 3D

Interactive 3D elements should be navigable via keyboard:

```tsx
function InteractiveMesh({ onClick }: { onClick: () => void }) {
  const [hovered, setHovered] = useState(false)
  const [focused, setFocused] = useState(false)

  return (
    <group
      tabIndex={0}
      onClick={onClick}
      onPointerOver={() => setHovered(true)}
      onPointerOut={() => setHovered(false)}
      onFocus={() => setFocused(true)}
      onBlur={() => setFocused(false)}
      onKeyDown={(e) => { if (e.key === 'Enter') onClick() }}
    >
      <mesh>
        <boxGeometry />
        <meshStandardMaterial
          color={focused ? '#4488ff' : hovered ? '#88aaff' : '#ffffff'}
          emissive={focused ? '#112244' : '#000000'}
        />
      </mesh>
    </group>
  )
}
```

R3F supports `tabIndex` on meshes for keyboard focus. Visual focus indicators (emissive glow, outline) should be clearly distinguishable from hover states.

## Multiple Viewports (View)

Share one Canvas across multiple DOM-positioned viewports:

```tsx
import { View } from '@react-three/drei'

function Dashboard() {
  return (
    <div className="relative w-full h-screen">
      <View className="absolute top-0 left-0 w-1/2 h-full">
        <SceneA />
      </View>
      <View className="absolute top-0 right-0 w-1/2 h-full">
        <SceneB />
      </View>
      <Canvas
        className="!fixed top-0 left-0 w-full h-full pointer-events-none"
        eventSource={document.getElementById('root')!}
      >
        <View.Port />
      </Canvas>
    </div>
  )
}
```

Each `<View>` gets its own scene graph, camera, and events while sharing a single WebGL context.

## Common Patterns
- **Post-processing**: `@react-three/postprocessing` with `<EffectComposer>` (see Post-Processing section above)
- **Custom materials via `onBeforeCompile`**: Extend built-in materials (MeshBasicMaterial, MeshStandardMaterial) with custom GLSL while preserving lighting, fog, and environment maps. See `.agent/skills/shader-authoring.md` "onBeforeCompile: Material Injection" for the class-based pattern and injection point reference.
- **Physics**: `@react-three/rapier` for rigid body physics
- **Debug**: `useDevControls` from `@/hooks/useDevControls` (production-safe leva wrapper)
- **Events**: R3F mesh events (`onClick`, `onPointerOver`) work like DOM events, with raycasting built in
- **Frameloop modes**: `"always"` (default), `"demand"` (render only on `invalidate()`), `"never"` (external control, e.g., Tempus)
