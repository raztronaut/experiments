# Shader Authoring

> ShaderMaterial setup, typed uniforms, GLSL utility library, onBeforeCompile injection, modular GLSL patterns, debugging

## ShaderMaterial in R3F
```tsx
import { useMemo, useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import vertexShader from './shader.vert'
import fragmentShader from './shader.frag'

function ShaderMesh() {
  const mesh = useRef()
  const { viewport } = useThree()

  const uniforms = useMemo(() => ({
    uTime: { value: 0 },
    uResolution: { value: new THREE.Vector2() },
    uMouse: { value: new THREE.Vector2(0.5, 0.5) },
    uColor: { value: new THREE.Color('#ff6600') },
  }), [])

  useFrame(({ clock, size, pointer }) => {
    uniforms.uTime.value = clock.elapsedTime
    uniforms.uResolution.value.set(size.width * viewport.dpr, size.height * viewport.dpr)
    uniforms.uMouse.value.set(pointer.x * 0.5 + 0.5, pointer.y * 0.5 + 0.5)
  })

  return (
    <mesh ref={mesh}>
      <planeGeometry args={[2, 2]} />
      <shaderMaterial
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        uniforms={uniforms}
      />
    </mesh>
  )
}
```

## Vertex Shader Template
```glsl
varying vec2 vUv;
varying vec3 vPosition;

void main() {
  vUv = uv;
  vPosition = position;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
```

## Fragment Shader Template
```glsl
uniform float uTime;
uniform vec2 uResolution;
uniform vec2 uMouse;
varying vec2 vUv;

void main() {
  vec2 uv = vUv;
  vec3 color = vec3(uv, 0.5 + 0.5 * sin(uTime));
  gl_FragColor = vec4(color, 1.0);
}
```

## Fullscreen Quad Setup
For fragment-shader-only effects that fill the viewport:
```tsx
<mesh scale={[viewport.width, viewport.height, 1]}>
  <planeGeometry args={[1, 1]} />
  <shaderMaterial
    vertexShader={vertexShader}
    fragmentShader={fragmentShader}
    uniforms={uniforms}
    depthWrite={false}
    depthTest={false}
  />
</mesh>
```

**Alternative: `ScreenQuad` from drei** renders a single fullscreen triangle that ignores the camera projection -- preferred for post-processing passes and camera-independent effects. Use `<planeGeometry>` when your shader art needs scene interaction (mouse raycasting via `onPointerMove`, 3D compositing) or aspect-correct UVs via `viewport.width/height`. See `r3f-core.md` "Custom: Render to FBO + Fullscreen Quad" for the `ScreenQuad` pattern.

---

## GLSL Utility Library

Production-ready GLSL functions for experiments. For the complete portable library (with SDF combining ops, 12 easing functions, VoronoiResult struct, 3D rotation matrices, aspect-correct UV, and more), see `~/.agents/skills/creative-webgl-patterns/references/glsl-library.md`. Use the composable module pattern (see "Modular GLSL Organization" section below) to avoid copy-pasting these into every shader.

### Random / Hash
```glsl
float hash(vec2 p) {
  return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
}

float rand(vec2 co) {
  return fract(sin(dot(co.xy, vec2(12.9898, 78.233))) * 43758.5453123);
}
```

### Simplex Noise 2D
Proper gradient-based implementation (not hash noise). Suitable for organic patterns, terrain, and flow.
```glsl
vec3 permute(vec3 x) { return mod(((x * 34.0) + 1.0) * x, 289.0); }

float snoise2d(vec2 v) {
  const vec4 C = vec4(0.211324865405187, 0.366025403784439,
                      -0.577350269189626, 0.024390243902439);
  vec2 i  = floor(v + dot(v, C.yy));
  vec2 x0 = v - i + dot(i, C.xx);
  vec2 i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
  vec4 x12 = x0.xyxy + C.xxzz;
  x12.xy -= i1;
  i = mod(i, 289.0);
  vec3 p = permute(permute(i.y + vec3(0.0, i1.y, 1.0))
                           + i.x + vec3(0.0, i1.x, 1.0));
  vec3 m = max(0.5 - vec3(dot(x0, x0), dot(x12.xy, x12.xy),
                           dot(x12.zw, x12.zw)), 0.0);
  m = m * m;
  m = m * m;
  vec3 x = 2.0 * fract(p * C.www) - 1.0;
  vec3 h = abs(x) - 0.5;
  vec3 ox = floor(x + 0.5);
  vec3 a0 = x - ox;
  m *= 1.79284291400159 - 0.85373472095314 * (a0 * a0 + h * h);
  vec3 g;
  g.x  = a0.x  * x0.x  + h.x  * x0.y;
  g.yz = a0.yz * x12.xz + h.yz * x12.yw;
  return 130.0 * dot(m, g);
}
```

### Simplex Noise 3D
Use when time is a dimension -- `snoise3d(vec3(uv, uTime))` produces smoother temporal evolution than `snoise2d(uv + uTime)`. Full implementation in the portable GLSL library.

### Fractal Brownian Motion (FBM)
Layer noise at increasing frequencies and decreasing amplitudes. Octave count controls detail vs. cost.
```glsl
float fbm2d(vec2 x, int octaves) {
  float v = 0.0;
  float a = 0.5;
  vec2 shift = vec2(100.0);
  mat2 rot = mat2(cos(0.5), sin(0.5), -sin(0.5), cos(0.5));
  for (int i = 0; i < octaves; ++i) {
    v += a * snoise2d(x);
    x = rot * x * 2.0 + shift;
    a *= 0.5;
  }
  return v;
}
```
3D FBM (`fbm3d`) available in the portable library -- uses `snoise3d`, better for time-varying effects.

### Domain Warping
Feed FBM back into itself for organic, fluid patterns. Each level adds complexity.
```glsl
float domainWarp1(vec2 p) {
  vec2 q = vec2(fbm2d(p, 4), fbm2d(p + vec2(5.2, 1.3), 4));
  return fbm2d(p + 4.0 * q, 4);
}
```
Double-level domain warping with time parameter: see portable library.

### Additional Functions (portable library)

These are available in the portable `glsl-library.md` -- use the composable module pattern to include them:

- **Curl noise** (`curlNoise2d`, `curlNoise3d`) -- divergence-free noise for flow fields and particle trails
- **Voronoi** (`VoronoiResult` struct with distance, ID, and center) -- Worley noise, cracked earth, caustics
- **SDF combining ops** (`opSmoothUnion`, `opSmoothSubtract`, `opSmoothIntersect`) -- smooth boolean operations
- **12 GLSL easing functions** (quad, cubic, expo, back, elastic) -- in-shader animation curves
- **3D rotation matrices** (`rotateX`, `rotateY`, `rotateZ`) -- vertex transformations
- **Aspect-correct UV** (`aspectUV`) -- resolution-independent UV coordinates
- **Remap** (`remap(value, inMin, inMax, outMin, outMax)`) -- clamped range mapping

### Rotation Matrix
```glsl
mat2 rot2d(float angle) {
  float s = sin(angle), c = cos(angle);
  return mat2(c, -s, s, c);
}
```

### SDF Primitives
```glsl
float sdCircle(vec2 p, float r) { return length(p) - r; }
float sdBox(vec2 p, vec2 b) { vec2 d = abs(p) - b; return length(max(d, 0.0)) + min(max(d.x, d.y), 0.0); }
float sdRoundedBox(vec2 p, vec2 b, float r) { vec2 q = abs(p) - b + r; return min(max(q.x, q.y), 0.0) + length(max(q, 0.0)) - r; }

float smoothMin(float a, float b, float k) {
  float h = clamp(0.5 + 0.5 * (b - a) / k, 0.0, 1.0);
  return mix(b, a, h) - k * h * (1.0 - h);
}
```

### Color Palette (Inigo Quilez)
```glsl
vec3 palette(float t, vec3 a, vec3 b, vec3 c, vec3 d) {
  return a + b * cos(6.28318 * (c * t + d));
}
```

### Color Space & Post-Processing
```glsl
vec3 hsl2rgb(vec3 c) {
  vec3 rgb = clamp(abs(mod(c.x * 6.0 + vec3(0.0, 4.0, 2.0), 6.0) - 3.0) - 1.0, 0.0, 1.0);
  return c.z + c.y * (rgb - 0.5) * (1.0 - abs(2.0 * c.z - 1.0));
}

vec3 gammaCorrect(vec3 color) { return pow(color, vec3(1.0 / 2.2)); }
vec3 linearize(vec3 color) { return pow(color, vec3(2.2)); }

float filmGrain(vec2 uv, float time, float strength) {
  return (fract(sin(dot(uv + fract(time), vec2(12.9898, 78.233))) * 43758.5453) - 0.5) * strength;
}

vec3 dither(vec3 color, vec2 fragCoord) {
  return color + (rand(fragCoord) - 0.5) / 255.0;
}

vec3 quantize(vec3 color, float levels) {
  return floor(color * levels) / levels;
}
```

`rgb2hsl`, `greyscale`, blend modes (screen, color dodge, add, lighten), `ditherAlpha`, vignette, and `mapRange`/`remap01` utilities are in the portable library.

### Utility Functions
```glsl
float mapRange(float min1, float max1, float value, float min2, float max2) {
  return min2 + (value - min1) * (max2 - min2) / (max1 - min1);
}
```

---

## Modular GLSL Organization

### Composable TypeScript Objects (Recommended)

Organize GLSL as typed `const` objects with template literal interpolation. This is simpler than a build pipeline and works with `/* glsl */` syntax highlighting.

```ts
// lib/glsl/noise.ts
export const NOISE = {
  SIMPLEX_2D: /* glsl */ `
    vec3 permute(vec3 x) { return mod(((x * 34.0) + 1.0) * x, 289.0); }
    float snoise2d(vec2 v) { /* ... */ }
  `,
  SIMPLEX_3D: /* glsl */ `
    vec4 permute4(vec4 x) { return mod(((x * 34.0) + 1.0) * x, 289.0); }
    vec4 taylorInvSqrt(vec4 r) { return 1.79284291400159 - 0.85373472095314 * r; }
    float snoise3d(vec3 v) { /* ... */ }
  `,
  FBM_3D: (octaves = 5) => /* glsl */ `
    ${NOISE.SIMPLEX_3D}
    #define NUM_OCTAVES ${octaves}
    float fbm(vec3 x) {
      float v = 0.0; float a = 0.5; vec3 shift = vec3(100);
      for (int i = 0; i < NUM_OCTAVES; ++i) {
        v += a * snoise3d(x); x = x * 2.0 + shift; a *= 0.5;
      }
      return v;
    }
  `,
} as const

// lib/glsl/functions.ts
export const FUNCTIONS = {
  RANDOM: /* glsl */ `float rand(vec2 co) { return fract(sin(dot(co.xy, vec2(12.9898, 78.233))) * 43758.5453123); }`,
  MAP_RANGE: /* glsl */ `float mapRange(float min1, float max1, float value, float min2, float max2) { return min2 + (value - min1) * (max2 - min2) / (max1 - min1); }`,
  GREYSCALE: /* glsl */ `vec3 greyscale(vec3 c) { return vec3((c.r + c.g + c.b) / 3.0); }`,
} as const

// lib/glsl/blend.ts
export const BLEND = {
  SCREEN: /* glsl */ `/* ... */`,
  COLOR_DODGE: /* glsl */ `/* ... */`,
  ADD: /* glsl */ `/* ... */`,
} as const
```

Then compose in your shader:
```ts
import { NOISE } from '@/lib/glsl/noise'
import { FUNCTIONS } from '@/lib/glsl/functions'

const fragmentShader = /* glsl */ `
  uniform float uTime;
  varying vec2 vUv;

  ${FUNCTIONS.RANDOM}
  ${NOISE.FBM_3D(4)}

  void main() {
    float n = fbm(vec3(vUv * 3.0, uTime * 0.2));
    vec3 color = vec3(n * 0.5 + 0.5);
    color += rand(gl_FragCoord.xy) * 0.02; // dithering
    gl_FragColor = vec4(color, 1.0);
  }
`
```

**Why this over `.glsl` files**: No build pipeline changes needed. Works with any bundler. Tree-shaking friendly (only imported functions end up in the bundle). TypeScript autocompletion for module names. The `/* glsl */` comment enables syntax highlighting in editors with GLSL plugins.

### .glsl File Imports (Advanced)

For large shader codebases with cross-experiment reuse, configure `glslify-loader` + `raw-loader` (or equivalent Webpack/Turbopack loaders) to enable modular `.glsl` file imports. This is the approach basement.studio uses for their production site. The trade-off is build configuration complexity.

```ts
// next.config.ts
{
  webpack: (config) => {
    config.module.rules.push({
      test: /\.glsl$/,
      use: ['raw-loader', 'glslify-loader'],
    })
    return config
  }
}
```

```glsl
// lib/glsl/noise.glsl
#pragma glslify: export(snoise2d)
// ... implementation
```

```glsl
// my-shader.frag
#pragma glslify: snoise2d = require('./lib/glsl/noise.glsl')
```

For most experiments, the composable TypeScript object pattern is sufficient. Reach for `.glsl` files when you have 10+ shaders sharing significant code.

---

## onBeforeCompile: Material Injection

Extend Three.js built-in materials (`MeshBasicMaterial`, `MeshStandardMaterial`, etc.) with custom GLSL while preserving their built-in features (lighting, fog, environment maps). More practical than full custom shaders when you only need to add one effect to an existing material.

### Class-Based Pattern (Recommended)

From tambo-landing's `AnimatedGradientMaterial` -- extend a built-in material class, override `onBeforeCompile`, and inject uniforms + GLSL via string replacement:

```ts
import { MeshBasicMaterial, Vector2, type WebGLProgramParametersWithUniforms } from 'three'
import { NOISE } from '@/lib/glsl/noise'

export class AnimatedNoiseMaterial extends MeshBasicMaterial {
  private uniforms = {
    uTime: { value: 0 },
    uFrequency: { value: 2.0 },
    uAmplitude: { value: 1.0 },
  }

  onBeforeCompile(params: WebGLProgramParametersWithUniforms) {
    params.uniforms = { ...params.uniforms, ...this.uniforms }

    // Inject noise functions + uniforms before main()
    params.fragmentShader = params.fragmentShader.replace(
      'void main() {',
      /* glsl */ `
      ${NOISE.FBM_3D(3)}
      uniform float uTime;
      uniform float uFrequency;
      uniform float uAmplitude;
      void main() {`
    )

    // Replace the diffuse color with noise-driven color
    params.fragmentShader = params.fragmentShader.replace(
      'vec4 diffuseColor = vec4( diffuse, opacity );',
      /* glsl */ `
      float n = fbm(vec3(vUv * uFrequency, uTime)) * uAmplitude;
      n = clamp(n, 0.0, 1.0);
      vec3 noiseColor = mix(diffuse, vec3(1.0), n);
      vec4 diffuseColor = vec4(noiseColor, opacity);
      `
    )
  }

  get time() { return this.uniforms.uTime.value }
  set time(v: number) { this.uniforms.uTime.value = v }
}
```

Usage in R3F:
```tsx
import { extend, useFrame } from '@react-three/fiber'
import { AnimatedNoiseMaterial } from './AnimatedNoiseMaterial'

extend({ AnimatedNoiseMaterial })

function NoisePlane() {
  const ref = useRef<AnimatedNoiseMaterial>(null)
  useFrame((_, delta) => { if (ref.current) ref.current.time += delta })
  return (
    <mesh>
      <planeGeometry args={[4, 4]} />
      <animatedNoiseMaterial ref={ref} transparent />
    </mesh>
  )
}
```

### Key Injection Points

These are the shader chunk replacements most commonly used with `onBeforeCompile`:

| Chunk | Where | Purpose |
|---|---|---|
| `void main() {` | vertex/fragment | Add uniforms and functions before main |
| `#include <uv_vertex>` | vertex | Modify UV coordinates |
| `vec4 diffuseColor = vec4( diffuse, opacity );` | fragment | Replace base color computation |
| `#include <output_fragment>` | fragment | Modify final output |
| `#include <fog_fragment>` | fragment | Modify fog application |

### When to Use onBeforeCompile vs. ShaderMaterial

| Scenario | Use |
|---|---|
| Full-screen effect, no lighting needed | `ShaderMaterial` |
| Extend lit material with one custom effect | `onBeforeCompile` |
| Need shadows, fog, env maps + custom effect | `onBeforeCompile` |
| Entirely custom rendering pipeline | `ShaderMaterial` |
| Adding noise/distortion to existing material | `onBeforeCompile` |

**Caveat**: `onBeforeCompile` relies on string replacement of Three.js internal shader chunks. If Three.js changes chunk names in a major release, your replacements may silently break. Pin your Three.js version and test after upgrades.

---

## Precision Qualifiers

```glsl
precision highp float;   // Default for vertex shaders. Use in fragment when you need it.
precision mediump float;  // Good default for fragment shaders on mobile.
```

- Use `mediump` in fragment shaders unless you need `highp` for position-dependent calculations or accumulation.
- `lowp` is rarely needed -- modern GPUs don't meaningfully benefit. Use for simple color flags or booleans.
- Varyings default to the fragment shader's precision. If your vertex shader computes `highp` positions and the fragment declares `mediump`, the varying will be medium precision in the fragment.

---

## Debugging Approach
1. Start with solid color output to verify geometry
2. Visualize UVs: `gl_FragColor = vec4(vUv, 0.0, 1.0)`
3. Add uniforms one at a time
4. Use `step()` to create hard boundaries for testing regions
5. Print uniform values via `console.log` in the useFrame callback
6. Describe expected vs. actual visual for user validation

---

## Patterns Worth Knowing

### Always Dither Gradients
Banding is the #1 visual artifact in shader art. Add dithering as the last step before `gl_FragColor`:
```glsl
color += (rand(gl_FragCoord.xy) - 0.5) / 255.0;
```
For alpha gradients, use stronger dithering: `alpha -= rand(gl_FragCoord.xy) * 0.05;`

### 3D Noise for Time Evolution
Instead of `noise2d(uv + time)` (which slides the noise pattern), use `noise3d(vec3(uv, time))` for smooth temporal evolution that doesn't drift in a direction.

### Vignette
```glsl
vec2 vigUv = vUv * 2.0 - 1.0;
float vig = 1.0 - dot(vigUv * 0.5, vigUv * 0.5);
color *= smoothstep(0.0, 1.0, vig);
```

### Aspect Ratio Correction
```glsl
vec2 uv = vUv;
float aspect = uResolution.x / uResolution.y;
uv.x *= aspect;
```
