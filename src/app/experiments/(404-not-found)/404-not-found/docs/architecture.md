# Architecture: 404 Not Found

## Overview

A full-screen R3F scene rendering 35 wavy ribbon meshes with a custom dual-face GLSL shader. Text scrolls across the front face, driven by a scroll-velocity system that bypasses React state. Each ribbon has procedurally generated Canvas 2D textures, with a global cache to share identical textures across instances. Mouse movement applies a subtle parallax tilt to the entire ribbon stack.

## Component Tree

```
NotFound404                          ← client component, full-screen container
├── <Canvas>                         ← R3F canvas, dpr [1,2], antialias, no stencil
│   └── <Suspense>
│       └── Scene                    ← owns all 3D content
│           ├── ScrollManager        ← wheel → scrollVelocityRef, decay in useFrame
│           ├── PerspectiveCamera    ← fov 65, z=32 (z=65 on mobile)
│           ├── color background     ← #fff9c4 warm yellow
│           ├── ambientLight         ← #fffcf0 intensity 2
│           ├── spotLight            ← white, intensity 20, top-right
│           ├── pointLight           ← #fff1f1 intensity 6, left
│           ├── InteractivityLayer   ← mouse-tracked group rotation (lerp 0.02)
│           │   └── group            ← base tilt [-0.15, -0.4, 0.02]
│           │       └── Ribbon ×35   ← boxGeometry + custom ShaderMaterial
│           └── OrbitControls        ← zoom/pan disabled
└── DOM overlay                      ← "404" at 45vw, 3% black opacity
```

## Key Patterns

- **Mutable scroll ref.** `scrollVelocityRef` is `{ current: 0 }` at module scope. Wheel events write to it, `useFrame` reads from it. Avoids React state for 35 components × 60fps reads.
- **Seeded deterministic random.** `Math.sin(s + i * 777.77) * 10000` generates reproducible per-ribbon variation. Index `i` as seed ensures same layout across renders.
- **Global texture cache with ref-counting.** `useCachedTexture` hook manages a module-scope `Map<string, { texture, refCount }>`. Textures are created on cache miss, ref-counted on mount/unmount, and disposed when refCount hits 0.
- **Dual-face ShaderMaterial.** `vModelNormal.z` in fragment shader determines face direction. Front face: scrolling text over base color. Back face: tiled text or UV-clamped image. Edge: solid color.
- **Image section synchronization.** Ribbons 12-21 share identical wave parameters (amplitude 3.0, frequency 0.04, speed 0.015) so the image region undulates as a single sheet.

## Data Flow

```
wheel event
  ↓
scrollVelocityRef.current += deltaY × 0.2  (clamped to [-5, 5])
  ↓
ScrollManager useFrame: lerp(current, 0, 0.05)  (decay)
  ↓
Ribbon useFrame:
  offsetRef.current += (1.0 + scrollVelocity × 2.0) × delta
  ↓
materialRef.uniforms.uRunTime = offsetRef.current
  ↓
fragment shader: scrollOffset = uRunTime × uTextSpeed → UV offset
```

## Dependencies

| Package | Role |
|---|---|
| `@react-three/fiber` | React renderer for Three.js — Canvas, useFrame, useThree |
| `@react-three/drei` | PerspectiveCamera, OrbitControls, useTexture |
| `three` | Core 3D — ShaderMaterial, BoxGeometry, CanvasTexture, MathUtils |

## Performance Notes

- **Geometry density.** Each ribbon: `boxGeometry(220, 4, 4, 256, 16, 1)` = ~8,200 vertices. 35 ribbons = ~287,000 vertices total. Manageable for modern GPUs.
- **DPR capped at 2.** `dpr={[1, 2]}` on Canvas prevents 3x rendering on high-DPI mobile.
- **35 draw calls.** Each ribbon is a separate mesh with unique uniforms. Instancing could reduce this to 1, but would require packing per-ribbon data into instance attributes and a texture atlas for the text.
- **Texture sharing.** The 35 ribbons use ~8 unique front textures (one per text variant) and ~1 shared back texture, managed by the cache. Without the cache, 35 Canvas 2D textures would be allocated.
- **No post-processing.** Unlike many R3F experiments, this one uses only forward rendering with a basic light setup. The film grain is per-fragment (`random()` in the shader), not a post-processing pass.
