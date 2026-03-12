# Snippet: CRT Screen Panel Shader

A custom GLSL shader material for React Three Fiber that renders a CRT monitor effect — scanlines, static noise, rolling bar, phosphor dot grid, per-panel vignette, and chromatic channel splitting. Accepts a video or image texture that gets composited under the CRT layers.

## Install

```bash
npm install @react-three/fiber three
```

## Usage

```tsx
import { Canvas, useFrame } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import * as THREE from "three";

// Vertex shader
const vertexShader = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

// Fragment shader (core CRT effect)
const fragmentShader = /* glsl */ `
  uniform float uTime;
  uniform float uOpacity;
  uniform vec3 uColor;
  uniform sampler2D uTexture;
  uniform float uHasTexture;
  uniform float uBrightness;
  varying vec2 vUv;

  float rand(vec2 co) {
    return fract(sin(dot(co, vec2(12.9898, 78.233))) * 43758.5453);
  }

  void main() {
    vec3 baseColor = uColor * uBrightness;

    if (uHasTexture > 0.5) {
      vec4 texColor = texture2D(uTexture, vUv);
      baseColor = mix(baseColor, texColor.rgb * uBrightness, 0.85);
    }

    float scanline = sin(vUv.y * 300.0 + uTime * 3.0) * 0.06;
    float scanline2 = sin(vUv.y * 100.0 - uTime * 1.5) * 0.03;
    float noise = rand(vUv * 0.5 + fract(uTime * 0.7)) * 0.08;

    float rollPos = fract(uTime * 0.15);
    float roll = smoothstep(rollPos - 0.04, rollPos, vUv.y)
               - smoothstep(rollPos, rollPos + 0.04, vUv.y);
    roll *= 0.15;

    vec2 edgeDist = abs(vUv - 0.5) * 2.0;
    float panelVignette = 1.0 - dot(edgeDist, edgeDist) * 0.3;

    vec3 finalColor = vec3(
      baseColor.r + noise * 0.6 + scanline,
      baseColor.g + noise * 0.4 + scanline2,
      baseColor.b + noise * 0.5 + roll
    ) * panelVignette;

    float dotGrid = sin(vUv.x * 600.0) * sin(vUv.y * 600.0);
    finalColor *= dotGrid * 0.03 + 1.0;

    gl_FragColor = vec4(finalColor, uOpacity);
  }
`;

function CRTPanel({ color = [0.05, 0.12, 0.2], videoSrc }: {
  color?: [number, number, number];
  videoSrc?: string;
}) {
  const materialRef = useRef<THREE.ShaderMaterial>(null);

  const uniforms = useMemo(() => ({
    uTime: { value: 0 },
    uOpacity: { value: 1 },
    uColor: { value: new THREE.Vector3(...color) },
    uTexture: { value: new THREE.Texture() },
    uHasTexture: { value: 0 },
    uBrightness: { value: 1 },
  }), []);

  useFrame((state) => {
    if (materialRef.current) {
      materialRef.current.uniforms.uTime.value = state.clock.elapsedTime;
    }
  });

  return (
    <mesh>
      <planeGeometry args={[2.4, 1.4]} />
      <shaderMaterial
        ref={materialRef}
        transparent
        uniforms={uniforms}
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
      />
    </mesh>
  );
}

// Drop into any R3F Canvas
export default function Demo() {
  return (
    <Canvas camera={{ position: [0, 0, 3] }}>
      <CRTPanel color={[0.08, 0.15, 0.25]} />
    </Canvas>
  );
}
```

## Props / API

### Shader Uniforms

| Uniform | Type | Default | Description |
|---|---|---|---|
| `uTime` | `float` | `0` | Elapsed time in seconds — drives scanline scroll, noise seed, rolling bar position |
| `uOpacity` | `float` | `0` | Panel opacity (0–1), animated by the GSAP timeline during boot/fade |
| `uColor` | `vec3` | `(0.08, 0.15, 0.25)` | Base tint color in linear RGB — each panel gets a unique broadcast tone |
| `uTexture` | `sampler2D` | empty | Video or image texture piped through the CRT effect |
| `uHasTexture` | `float` | `0` | Toggle (0/1) — when 1, texture is composited under CRT layers at 85% mix |
| `uBrightness` | `float` | `1` | Brightness multiplier — GSAP ramps this during "CRT warming up" phase |
| `uIsLogo` | `float` | `0` | Toggle (0/1) — switches to logo rendering path (no CRT effects) |
| `uBgColor` | `vec3` | theme bg | Background wall color for logo blending |
| `uIsDark` | `float` | `0` | Toggle (0/1) — adjusts noise intensity and edge glow color for dark mode |

### ScreenPanel Component Props

| Prop | Type | Default | Description |
|---|---|---|---|
| `position` | `[x, y, z]` | required | World-space position of the panel mesh |
| `size` | `[w, h]` | required | Width and height of the plane geometry |
| `isLogo` | `boolean` | `false` | Renders as logo panel (SVG texture, no CRT effects) |
| `colorIndex` | `number` | `0` | Index into the 14-color broadcast palette |
| `timeOffset` | `number` | `0` | Offsets `uTime` so panels don't animate in sync |
| `videoSrc` | `string` | — | Path to MP4 clip for VideoTexture |
| `imageSrc` | `string` | — | Path to logo image (used when `isLogo` is true) |
| `bgColor` | `string` | `"#f7f7f9"` | Hex background color (from theme) |
| `isDark` | `boolean` | `false` | Dark mode flag passed to shader |

## Notes

- **Video autoplay requires `muted` and `playsInline`.** Browsers block unmuted autoplay. The component sets both on the `<video>` element.
- **Phosphor dot frequency is resolution-dependent.** The `600.0` multiplier in the dot grid looks correct at 1080p but may moiré at other resolutions. Consider scaling with viewport dimensions.
- **The rolling bar wraps at UV boundaries.** `fract(uTime * 0.15)` means the bar resets when it hits the top of the panel. The `smoothstep` window is narrow enough (0.04) that the wrap isn't visible.
- **Color tint bleeds through video.** The `mix(baseColor, texColor, 0.85)` means 15% of the tint color always shows. This is intentional — it gives each screen a distinct color cast like monitors in a real control room.
- **Each panel creates its own `ShaderMaterial` instance.** Uniforms are not shared. This is fine for 15 panels but would need instancing or uniform buffer objects at larger scales.
