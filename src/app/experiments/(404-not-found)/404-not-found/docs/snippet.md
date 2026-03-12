# Snippet: Dual-Face Ribbon Shader

A custom GLSL shader for React Three Fiber that renders a wavy ribbon with different content on each face -- scrolling text on the front, tiled text or a clamped image on the back. Includes Blinn-Phong lighting, valley shadows from the wave deformation, edge ambient occlusion, rim lighting, and film grain.

## Install

```bash
npm install @react-three/fiber @react-three/drei three
```

## Usage

```tsx
import { Canvas, useFrame } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import * as THREE from "three";

const vertexShader = /* glsl */ `
  uniform float uTime;
  uniform float uFrequency;
  uniform float uAmplitude;
  varying vec2 vUv;
  varying vec3 vNormal;
  varying vec3 vWorldPosition;
  varying vec3 vModelNormal;
  varying float vIndent;

  void main() {
    vUv = uv;
    vModelNormal = normal;
    vec3 pos = position;
    float xPos = pos.x * uFrequency + uTime;
    float indent = sin(xPos) * uAmplitude;
    indent += sin(xPos * 2.1 + 0.4) * uAmplitude * 0.3;
    indent += sin(xPos * 4.4 + 1.2) * uAmplitude * 0.1;
    pos.z += indent;
    vIndent = indent;
    vNormal = normalize(normalMatrix * normal);
    vWorldPosition = (modelMatrix * vec4(pos, 1.0)).xyz;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
  }
`;

const fragmentShader = /* glsl */ `
  uniform sampler2D uTexture;
  uniform float uRunTime;
  uniform vec3 uColor;
  uniform vec2 uRepeat;
  uniform float uTextSpeed;
  varying vec2 vUv;
  varying vec3 vNormal;
  varying vec3 vWorldPosition;
  varying vec3 vModelNormal;
  varying float vIndent;

  float random(vec2 co) {
    return fract(sin(dot(co, vec2(12.9898, 78.233))) * 43758.5453);
  }

  void main() {
    vec3 normal = normalize(vNormal);
    vec3 viewDir = normalize(cameraPosition - vWorldPosition);
    vec4 texColor;

    if (vModelNormal.z > 0.5) {
      float scrollOffset = uRunTime * uTextSpeed;
      vec2 tiledUv = vUv * uRepeat + vec2(scrollOffset, 0.0);
      vec4 s = texture2D(uTexture, tiledUv);
      texColor = vec4(mix(uColor, s.rgb, s.a), 1.0);
    } else {
      texColor = vec4(uColor, 1.0);
    }

    vec3 lightDir = normalize(vec3(0.5, 0.8, 0.8));
    float diff = max(dot(normal, lightDir), 0.0);
    vec3 halfDir = normalize(lightDir + viewDir);
    float spec = pow(max(dot(normal, halfDir), 0.0), 32.0) * 0.4;
    float shadow = mix(0.6, 1.0, smoothstep(1.0, -1.0, vIndent));
    float rim = pow(1.0 - max(dot(viewDir, normal), 0.0), 6.0) * 0.25;
    float grain = (random(vUv * 100.0) - 0.5) * 0.03;

    vec3 c = texColor.rgb * (diff * 0.8 + 0.25) * shadow;
    c += spec * vec3(1.0, 0.95, 0.8) * diff;
    c += rim * vec3(1.0, 0.98, 0.95) + grain;

    gl_FragColor = vec4(c, 1.0);
  }
`;

function Ribbon() {
  const matRef = useRef<THREE.ShaderMaterial>(null);

  const uniforms = useMemo(() => ({
    uTime: { value: 0 },
    uRunTime: { value: 0 },
    uFrequency: { value: 0.04 },
    uAmplitude: { value: 3.0 },
    uColor: { value: new THREE.Color("#E6DDB5") },
    uTexture: { value: new THREE.Texture() },
    uRepeat: { value: new THREE.Vector2(8, 1) },
    uTextSpeed: { value: 0.01 },
  }), []);

  useFrame((state, delta) => {
    if (!matRef.current) return;
    matRef.current.uniforms.uTime.value = state.clock.elapsedTime * 0.015;
    matRef.current.uniforms.uRunTime.value += delta;
  });

  return (
    <mesh>
      <boxGeometry args={[40, 2, 2, 256, 16, 1]} />
      <shaderMaterial
        ref={matRef}
        side={THREE.DoubleSide}
        uniforms={uniforms}
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
      />
    </mesh>
  );
}

export default function Demo() {
  return (
    <Canvas camera={{ position: [0, 0, 20], fov: 65 }}>
      <ambientLight intensity={2} />
      <Ribbon />
    </Canvas>
  );
}
```

## Props / API

### Vertex Shader Uniforms

| Uniform | Type | Default | Description |
|---|---|---|---|
| `uTime` | `float` | `0` | Elapsed time driving wave animation speed |
| `uFrequency` | `float` | `0.04` | Spatial frequency of the sine wave along the ribbon |
| `uAmplitude` | `float` | `3.0` | Wave height in world units |

### Fragment Shader Uniforms

| Uniform | Type | Default | Description |
|---|---|---|---|
| `uTexture` | `sampler2D` | empty | Front-face text texture (CanvasTexture with RepeatWrapping) |
| `uRunTime` | `float` | `0` | Accumulated time for text scroll offset |
| `uColor` | `vec3` | `#E6DDB5` | Base ribbon color (parchment tone) |
| `uRepeat` | `vec2` | `(8, 1)` | Texture tiling factor (calculated from geometry/texture aspect ratios) |
| `uTextSpeed` | `float` | `0.01` | Text scroll speed multiplier (negative = reverse direction) |

## Notes

- **Box geometry subdivision matters.** The wave deformation happens in the vertex shader, so the geometry needs enough segments along the X axis for smooth curves. 256 segments gives clean results. Below 64 the waves look faceted.
- **Face detection uses model-space normals.** `vModelNormal.z > 0.5` checks the un-transformed normal, which is always (0,0,1) for the front face of a box geometry and (0,0,-1) for the back, regardless of the mesh's world rotation.
- **CanvasTexture needs RepeatWrapping.** The default `ClampToEdge` wrapping will stretch the edge pixels instead of tiling the text. Set `tex.wrapS = THREE.RepeatWrapping` before assigning.
- **The `uRepeat` vector should match aspect ratios.** Calculate it as `geometryAspect / textureUnitAspect` to prevent the text from being stretched or squished.
- **Valley shadows require `vIndent`.** Without passing the vertex displacement to the fragment shader, the ribbons look flat despite the 3D deformation. The `smoothstep(1.0, -1.0, vIndent)` mapping darkens concave regions and brightens convex ones.
