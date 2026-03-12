# R3F Shader Profile

> Activate when `experiment.json` has `"profile": "r3f-shader"`

## Behavioral Mode
**Visual fidelity first, mathematical precision.** The shader IS the experiment. Prioritize visual output quality and GPU efficiency.

## Priority Ordering
1. Visual fidelity (the output must be beautiful/correct)
2. GPU performance (smooth 60fps)
3. Mathematical precision (noise, SDF, color math)
4. Code clarity (shaders are hard to debug)
5. Interactivity (mouse, scroll, time uniforms)

## Toolkit Setup: Fullscreen Quad
```tsx
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { useMemo, useRef } from 'react'
import * as THREE from 'three'

function ShaderPlane() {
  const mesh = useRef()
  const { viewport } = useThree()

  const uniforms = useMemo(() => ({
    uTime: { value: 0 },
    uResolution: { value: new THREE.Vector2() },
    uMouse: { value: new THREE.Vector2() },
  }), [])

  useFrame(({ clock, size }) => {
    uniforms.uTime.value = clock.elapsedTime
    uniforms.uResolution.value.set(size.width, size.height)
  })

  return (
    <mesh ref={mesh} scale={[viewport.width, viewport.height, 1]}>
      <planeGeometry args={[1, 1]} />
      <shaderMaterial
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        uniforms={uniforms}
        depthWrite={false}
        depthTest={false}
      />
    </mesh>
  )
}
```

## Canvas Config for Shaders
```tsx
<Canvas
  camera={{ position: [0, 0, 1], fov: 75 }}
  dpr={[1, 2]}
  gl={{ antialias: false, alpha: false, preserveDrawingBuffer: false }}
/>
```
Disable antialiasing for pixel-perfect shader output. Most shader art doesn't need it.

## GLSL Patterns

**Noise**: simplex noise for organic patterns, value noise for texture, curl noise for flow fields.

**SDF Primitives**: circle (`length(p) - r`), box (`max(abs(p) - b)`), line, combine with `min`/`max`/`smoothmin`.

**Color**: HSL-to-RGB conversion, palette functions (`a + b * cos(2π * (c * t + d))`), gamma correction.

**Easing in GLSL**: `smoothstep`, `mix`, polynomial easing functions.

## Mouse Interaction
```tsx
const onPointerMove = useCallback((e) => {
  uniforms.uMouse.value.set(
    e.point.x / viewport.width + 0.5,
    e.point.y / viewport.height + 0.5
  )
}, [viewport])
```

## Debugging Approach
AI agents cannot see shader output. Build incrementally:
1. Start with a solid color to verify geometry fills the viewport
2. Add UV coordinates visualization (`gl_FragColor = vec4(vUv, 0.0, 1.0)`)
3. Add one effect at a time (noise, then coloring, then animation)
4. Test each uniform independently before combining
5. Describe expected visual output clearly for user validation
