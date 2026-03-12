# Architecture: Basketball Replay Center

## Overview

A WebGL preloader built in React Three Fiber that renders a 5×3 grid of CRT-style screen panels, each displaying basketball replay clips through a custom GLSL shader. The entire scene passes through a barrel distortion post-processing pipeline. A 5-phase GSAP timeline orchestrates the boot-up sequence, hold, and fade-out. Supports light/dark themes via `next-themes`.

## Component Tree

```
BasketballReplayCenter          ← client component, manages preloader lifecycle
├── ReplayPreloader             ← dynamic import (ssr: false), owns Canvas + theme
│   ├── <Canvas>                ← R3F canvas with orthographic-like setup (fov 55, z 5.2)
│   │   ├── CameraRig           ← mouse-reactive ambient camera movement (lerped group)
│   │   ├── <Suspense>
│   │   │   └── ReplayGrid      ← forwardRef, exposes getPanels() via useImperativeHandle
│   │   │       ├── Background   ← 20×20 plane at z -0.5, colored to match theme
│   │   │       └── ScreenPanel ×15  ← planeGeometry + custom ShaderMaterial
│   │   │           ├── CRT panels (14)  ← VideoTexture from MP4 clips
│   │   │           └── Logo panel (1)   ← TextureLoader from SVG, center position
│   │   └── DistortionPass      ← Three.js EffectComposer (RenderPass → ShaderPass → OutputPass)
│   └── CSS grid overlay         ← subtle ambient grid lines in background div
└── Post-preloader content       ← shown after onComplete fires
```

## Key Patterns

- **Proxy-based GSAP bridging.** GSAP can't tween shader uniforms behind refs directly. A plain `{ value, glow }` object is tweened, with `onUpdate` callbacks pushing values into the distortion pass via exposed `setDistortion`/`setGlow` methods.
- **Imperative panel access.** `ReplayGrid` uses `forwardRef` + `useImperativeHandle` to expose `getPanels()`, returning an array of `{ mesh, material, isLogo, col, row }`. The timeline hook consumes this to tween individual panel uniforms and transforms.
- **Theme-reactive uniforms.** `useTheme().resolvedTheme` flows through props to both `ReplayGrid` and `DistortionPass`. Each component updates its shader uniforms in a `useEffect` keyed on `isDark`, so theme switches are reflected in real time without rebuilding the scene.
- **Dynamic import for SSR safety.** `ReplayPreloader` is loaded via `next/dynamic` with `ssr: false` since R3F, Three.js, and `<video>` elements require a browser environment.
- **Manual post-processing pipeline.** Uses Three.js `EffectComposer` from `three/examples/jsm` rather than the pmndrs `@react-three/postprocessing` wrapper, giving direct uniform access for GSAP integration.

## Data Flow

```
next-themes (resolvedTheme)
  ↓
ReplayPreloader (bgColor, isDark)
  ↓                          ↓
ReplayGrid                 DistortionPass
  ↓                          ↓
ScreenPanel uniforms       ShaderPass uniforms
  (uIsDark, uBgColor,       (uIsDark, uBgColor,
   uOpacity, uBrightness)    uDistortion, uGlowIntensity)
       ↑                          ↑
       └──── usePreloaderTimeline ─┘
             (GSAP timeline tweens both)
```

1. Theme state flows down as props.
2. `usePreloaderTimeline` builds a GSAP timeline after the first `useFrame` detects all panels are mounted.
3. The timeline directly mutates panel `material.uniforms` and calls `distortionRef.current.setDistortion/setGlow`.
4. `useFrame` in `ScreenPanel` advances `uTime` each frame; `useFrame` in `DistortionPass` calls `composer.render()`.

## Dependencies

| Package | Role |
|---|---|
| `@react-three/fiber` | React renderer for Three.js — Canvas, useFrame, useThree |
| `three` | Core 3D engine — ShaderMaterial, VideoTexture, TextureLoader |
| `three/examples/jsm/postprocessing/*` | EffectComposer, RenderPass, ShaderPass, OutputPass |
| `gsap` | Timeline animation engine — tweens uniforms and transforms |
| `next-themes` | Theme detection (`resolvedTheme`) for light/dark shader switching |
| `next/dynamic` | SSR-safe dynamic import for the R3F subtree |

## Performance Notes

- **DPR capped at 2.** The Canvas uses `dpr={[1, 2]}` and the EffectComposer render target scales by `Math.min(devicePixelRatio, 2)` to avoid 3x rendering on high-DPI mobile.
- **EffectComposer overrides default rendering.** `useFrame` in `DistortionPass` runs at priority `1` and calls `composer.render()`, taking over from R3F's default render loop.
- **15 shader materials.** Each panel has its own `ShaderMaterial` instance. Uniforms are not shared — each ticks independently via per-panel `timeOffset`. This is fine for 15 panels but wouldn't scale to hundreds.
- **Video textures tick per-frame.** Three.js `VideoTexture` sets `needsUpdate = true` internally on each animation frame. With 14 videos, that's 14 texture uploads per frame. Acceptable for a preloader (short-lived), but would need throttling for persistent use.
- **No geometry instancing.** All 15 planes are separate meshes. Instancing isn't beneficial here because each has unique uniforms and textures.
