---
trigger: file_match
file_patterns:
  - "**/*.glsl"
  - "**/*.frag"
  - "**/*.vert"
  - "**/shader*"
description: Loads when editing GLSL or shader-related files
---

# Shader Authoring Rules

## ShaderMaterial Pattern
```tsx
const uniforms = useMemo(() => ({
  uTime: { value: 0 },
  uResolution: { value: new THREE.Vector2() },
  uMouse: { value: new THREE.Vector2() },
}), [])

useFrame(({ clock }) => {
  uniforms.uTime.value = clock.elapsedTime
})

<shaderMaterial
  vertexShader={vertexShader}
  fragmentShader={fragmentShader}
  uniforms={uniforms}
/>
```

## Uniform Naming
Prefix with `u`: `uTime`, `uResolution`, `uMouse`, `uColor`. Varyings prefix with `v`: `vUv`, `vNormal`, `vPosition`.

## GLSL Performance
- Minimize texture lookups per fragment
- Avoid branching (`if`/`else`) in fragment shaders -- use `step()`, `smoothstep()`, `mix()`
- Pre-compute values in vertex shader, pass via varyings
- Use `lowp`/`mediump` precision where full `highp` isn't needed

## Fullscreen Quad
For fullscreen shader effects, use a plane geometry with dimensions `[2, 2]` and disable depth:
```tsx
<mesh>
  <planeGeometry args={[2, 2]} />
  <shaderMaterial depthWrite={false} depthTest={false} />
</mesh>
```

## Common GLSL Utilities
Keep noise functions (simplex, perlin), SDF primitives (circle, box, line), and easing functions in separate `.glsl` files. Import via raw loader or inline template literals.

## Debugging
Visual honesty applies doubly here -- AI agents cannot see shader output. Describe the expected visual clearly. Use solid colors to verify geometry before adding complex shaders. Test each uniform independently.
