# Shader Authoring

> ShaderMaterial setup, typed uniforms, GLSL patterns, debugging

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

## Common GLSL Functions

### Noise (Simplex 2D)
```glsl
// Use simplex-noise package or inline a hash-based noise
float hash(vec2 p) {
  return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
}
```

### SDF Primitives
```glsl
float sdCircle(vec2 p, float r) { return length(p) - r; }
float sdBox(vec2 p, vec2 b) { vec2 d = abs(p) - b; return length(max(d, 0.0)) + min(max(d.x, d.y), 0.0); }
float sdLine(vec2 p, vec2 a, vec2 b) {
  vec2 pa = p - a, ba = b - a;
  float h = clamp(dot(pa, ba) / dot(ba, ba), 0.0, 1.0);
  return length(pa - ba * h);
}
```

### Smooth Operations
```glsl
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

### Easing
```glsl
float easeInOut(float t) { return t * t * (3.0 - 2.0 * t); }
float easeOut(float t) { return 1.0 - pow(1.0 - t, 3.0); }
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

## Debugging Approach
1. Start with solid color output to verify geometry
2. Visualize UVs: `gl_FragColor = vec4(vUv, 0.0, 1.0)`
3. Add uniforms one at a time
4. Use `step()` to create hard boundaries for testing regions
5. Print uniform values via `console.log` in the useFrame callback
6. Describe expected vs. actual visual for user validation
