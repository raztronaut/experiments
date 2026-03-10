<!-- read_when: Editing .glsl/.frag/.vert files or ShaderMaterial -->

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
- Use `mediump` precision in fragment shaders unless `highp` is needed for position-dependent math
- Prefer 3D noise with time as the third dimension over 2D noise + time offset for temporal effects

## Fullscreen Quad
For fullscreen shader effects, use a plane geometry scaled to viewport and disable depth:
```tsx
<mesh scale={[viewport.width, viewport.height, 1]}>
  <planeGeometry args={[1, 1]} />
  <shaderMaterial depthWrite={false} depthTest={false} />
</mesh>
```

## GLSL Utility Library
Use the composable GLSL module pattern documented in `.agents/skills/shader-authoring.md`. Available utilities include:

- **Noise**: simplex 2D/3D, FBM (configurable octaves), curl noise, voronoi
- **Pattern**: domain warping, rotation matrices
- **Color**: HSL↔RGB, greyscale, gamma correction, Inigo Quilez palette
- **Post**: film grain, dithering, quantization, vignette
- **Blend modes**: screen, color dodge, add, lighten
- **SDF**: circle, box, line, rounded box, smooth min/max
- **Utility**: mapRange, remap01, easing functions

Organize shared GLSL as typed TypeScript `const` objects with `/* glsl */` tagged template strings. Import what you need per shader. See the skill for full code.

## Always Dither Gradients
Banding is the most common shader artifact. Add as the last step before `gl_FragColor`:
```glsl
color += (rand(gl_FragCoord.xy) - 0.5) / 255.0;
```
For alpha gradients, use stronger dithering: `alpha -= rand(gl_FragCoord.xy) * 0.05;`

## onBeforeCompile Alternative
When you need lighting, fog, or environment maps but want to add a custom effect, extend a built-in material via `onBeforeCompile` instead of writing a full `ShaderMaterial`. See the class-based pattern in `.agents/skills/shader-authoring.md` under "onBeforeCompile: Material Injection." This preserves Three.js features while injecting custom GLSL.

## Debugging
Visual honesty applies doubly here -- AI agents cannot see shader output. Describe the expected visual clearly. Use solid colors to verify geometry before adding complex shaders. Test each uniform independently. Build incrementally: geometry → UVs → noise → color → animation → polish (dithering, grain, vignette).
