---
name: CRT and 3D Performance Overhaul
overview: Fix critical performance issues across all three 3D scenes in announcing-v2 -- the CRT monitor, volumetric light, and temple particle system. Address shader inefficiencies, eliminate per-frame allocations, replace React state with refs for scroll/mouse data, reduce GPU cost, and add proper resource disposal.
todos:
  - id: phase1-frame-loop
    content: "Phase 1: Fix all frame-loop violations -- texture swap outside useFrame, scrollProgress via refs, delta-based damping, pre-allocate vectors"
    status: completed
  - id: phase2-gpu-cost
    content: "Phase 2: Reduce GPU cost -- volumetric step/octave reduction + half-res, CRT secondary bleed removal + branchless coverUV, iResolution fix"
    status: completed
  - id: phase3-shader-polish
    content: "Phase 3: Shader quality polish -- gradient dithering on both shaders, CRT brightness/bloom rebalance, volumetric tone mapping"
    status: completed
  - id: phase4-disposal
    content: "Phase 4: Resource cleanup -- dispose screenGeometry, GLTF traversal disposal, verify render target cleanup"
    status: completed
  - id: phase5-code-quality
    content: "Phase 5: Code quality -- extract shared ResponsiveCamera, move inline vertex shader, remove unnecessary 'use client'"
    status: completed
isProject: false
---

# CRT and 3D Scene Performance Overhaul

## Diagnosed Issues

I've identified **14 distinct performance and quality problems** across 3 WebGL canvases, 3 shader files, and 4 component files. They fall into 4 categories: frame-loop violations, GPU cost, architecture, and shader quality.

---

## 1. Frame-Loop Violations (Critical -- causes frame drops)

### 1a. Texture loading inside `useFrame` (CRTMonitor.tsx:106-166)

When the hovered experiment changes, `loadTexture()` is called **inside the render loop**. This synchronously creates `HTMLVideoElement`s, calls `.play()`, and triggers DOM mutations -- all blocking the GL thread.

```106:166:src/components/experiments/announcing-v2/canvas/CRTMonitor.tsx
    if (activeExperimentSlug !== currentSlugRef.current) {
      currentSlugRef.current = activeExperimentSlug;
      pauseAllVideos();
      // ... creates videos, plays them, loads textures -- all in useFrame
```

**Fix**: Move texture swap to a `useEffect` that watches `activeExperimentSlug` from the store (via `subscribe`). The frame loop should only assign `mat.uniforms.map.value` from a pre-loaded ref.

### 1b. Scroll progress via React state (BlueprintSection.tsx:57, ProcessSection.tsx:36)

Both sections call `setScrollProgress(p)` inside ScrollTrigger's `onUpdate`, which fires every scroll frame. This triggers React re-renders of the entire section tree including the Canvas children. For TempleScene and VolumetricLightScene, `scrollProgress` arrives as a **React prop**, causing R3F reconciliation every frame.

```55:61:src/components/experiments/announcing-v2/sections/BlueprintSection.tsx
        onUpdate: (self) => {
          const p = self.progress;
          setScrollProgress(p);
          if (p > 0.1 && !revealed) {
            setRevealed(true);
          }
        },
```

**Fix**: Store scroll progress in a `useRef` (or in the Zustand store and read via `getState()` in useFrame). Pass it to canvas scenes via a ref, not a prop.

### 1c. Mouse lerp without delta (CRTMonitor.tsx:168-173)

The lerp factor is a fixed `0.05` regardless of frame time. At 30fps the rotation tracks half as fast as at 60fps.

```168:173:src/components/experiments/announcing-v2/canvas/CRTMonitor.tsx
    const tx = mousePosition.x * crtParams.rotationSensitivityY;
    const ty = mousePosition.y * crtParams.rotationSensitivityX;
    groupRef.current.rotation.y +=
      (tx - groupRef.current.rotation.y) * crtParams.lerpSpeed;
    groupRef.current.rotation.x +=
      (ty - groupRef.current.rotation.x) * crtParams.lerpSpeed;
```

**Fix**: Use `MathUtils.damp()` or compute `1 - Math.exp(-speed * delta)` for frame-rate-independent damping.

### 1d. `lerp3` allocates `new Vector3` every call (VolumetricLightScene.tsx:12-14)

Called 6 times per frame (3 lights x position + direction). Creates 6 garbage objects per frame.

```12:14:src/components/experiments/announcing-v2/canvas/VolumetricLightScene.tsx
function lerp3(a: THREE.Vector3, b: THREE.Vector3, t: number): THREE.Vector3 {
  return new THREE.Vector3().lerpVectors(a, b, t);
}
```

**Fix**: Pre-allocate reusable `Vector3` instances at module scope; use `target.lerpVectors(a, b, t)` in-place.

### 1e. ParticleCloud creates `new Vector2` every frame (TempleScene.tsx:61)

```61:61:src/components/experiments/announcing-v2/canvas/TempleScene.tsx
    mouseRef.current.lerp(new THREE.Vector2(mx, my), 0.05);
```

**Fix**: Use a pre-allocated target vector and `.set(mx, my)` before lerping.

---

## 2. GPU Cost (Critical -- the volumetric shader is the primary bottleneck)

### 2a. Volumetric ray march: 40 steps x 3 lights x FBM per step

Each pixel executes `computeLight()` 3 times, each doing 40 steps. Each step calls `fbm()` (3 octaves of `noise()`, each doing 8 `hash33()` calls with `sin()`). Per pixel: **~2,880 trig+hash operations**. This will drop frames on any non-high-end GPU.

```31:34:src/components/experiments/announcing-v2/shaders/volumetricLight.ts
  #define NUM_STEPS 40
  #define STEP_SIZE 0.35
  #define FOG_DENSITY 0.15
  #define LIGHT_INTENSITY 2.5
```

**Fix**:

- Reduce to 24 steps (visually similar, 40% less work)
- Render at half resolution and upscale with bilinear filtering
- Use 2-octave FBM instead of 3
- Skip FBM when `shapeFactor < 0.0` (early exit before expensive noise)
- Consider processing all 3 lights in a single loop pass instead of 3 separate calls

### 2b. CRT shader: 6 texture lookups per pixel

3 chromatic aberration + 3 "secondary bleed" lookups. The secondary bleed (lines 52-54) adds marginal visual quality for 50% more texture bandwidth.

```47:54:src/components/experiments/announcing-v2/shaders/crtShader.ts
    col.r = texture2D(map, coverUV(vec2(uv.x + rs, uv.y + rs))).r + 0.05;
    col.g = texture2D(map, coverUV(vec2(uv.x, uv.y - rs * 2.0))).g + 0.05;
    col.b = texture2D(map, coverUV(vec2(uv.x - rs * 2.0, uv.y))).b + 0.05;
    // Secondary chromatic bleed
    col.r += 0.08 * texture2D(map, coverUV(vec2(uv.x + 0.026, uv.y - 0.026))).r;
    col.g += 0.05 * texture2D(map, coverUV(vec2(uv.x - 0.022, uv.y - 0.022))).g;
    col.b += 0.08 * texture2D(map, coverUV(vec2(uv.x - 0.022, uv.y - 0.018))).b;
```

**Fix**: Remove secondary bleed (3 lookups to 3). If the bleed is desired, make it conditional on `glitchIntensity > 0.01`.

### 2c. CRT shader: `if/else` branch in `coverUV`

GLSL branching in fragment shaders causes warp divergence.

**Fix**: Replace with branchless `mix()` + `step()`.

### 2d. Three separate WebGL contexts

3 `ExperimentCanvas` = 3 WebGL contexts. Each has its own state machine, Tempus driver, and memory. Browsers limit active contexts (typically 8-16); 3 is wasteful and fragments GPU memory.

**Fix (optional, larger refactor)**: Consolidate into a single canvas with scene visibility toggled by scroll position. The fixed-position canvas pattern ("layer cake") is documented in the mixed profile. This is a larger architectural change and can be deferred if the per-scene fixes bring frames back to 60fps.

---

## 3. Resource Management

### 3a. Missing disposal

- `screenGeometry` in CRTMonitor is memoized but never disposed
- GLTF model materials/textures from `useGLTF` are not explicitly disposed
- TempleScene model materials not disposed
- Render targets in VolumetricLightScene are disposed on resize but the depth texture is not separately tracked

**Fix**: Add `useEffect` cleanup for geometries. For GLTF, use `useGLTF`'s built-in disposal or call `traverse` + dispose on unmount.

### 3b. `iResolution` hardcoded to 512x512

```69:69:src/components/experiments/announcing-v2/canvas/CRTMonitor.tsx
      iResolution: { value: new THREE.Vector2(512, 512) },
```

The CRT scanlines and sub-pixel columns scale based on this value, so they render at the wrong frequency for the actual viewport. **Fix**: Update from `useThree(s => s.size)` in useFrame or via a useEffect.

---

## 4. Shader Quality Polish

### 4a. No gradient dithering

Per the shader rules ("Always Dither Gradients"), both the CRT and volumetric shaders should add dithering before `gl_FragColor` to prevent banding.

### 4b. CRT brightness blowout

`col *= vec3(0.95, 1.05, 0.95) * 2.5` is a 2.5x multiplier on already-boosted color. Combined with the `0.93 + 0.07 * col^2` fake bloom, this clips highlights. Should tone-map or reduce the multiplier.

### 4c. Volumetric shader missing tone mapping

The accumulated volumetric light is added directly to scene color with no clamping or tone mapping, causing values > 1.0 to clip harshly.

---

## Implementation Plan

### Phase 1: Frame-loop fixes (highest impact, lowest risk)

- **CRTMonitor**: Move texture swap out of `useFrame` into a Zustand `subscribe` + `useEffect`. Frame loop only reads from a `textureRef`.
- **BlueprintSection / ProcessSection**: Replace `useState(scrollProgress)` with `useRef`. Pass ref to canvas scenes. Read in `useFrame` via ref or store.
- **CRTMonitor**: Use `MathUtils.damp` for mouse rotation.
- **VolumetricLightScene**: Pre-allocate 6 reusable `Vector3`s at module scope.
- **TempleScene**: Pre-allocate target `Vector2` for mouse lerp.

### Phase 2: GPU cost reduction

- **volumetricLight.ts**: Reduce steps from 40 to 24, FBM octaves from 3 to 2, add early exit.
- **VolumetricLightScene**: Render at half resolution (create render target at `size/2`).
- **crtShader.ts**: Remove secondary chromatic bleed (save 3 texture lookups). Replace `coverUV` branching with branchless math.
- **CRTMonitor**: Update `iResolution` from actual viewport size.

### Phase 3: Shader polish

- Add gradient dithering to CRT and volumetric shaders.
- Reduce CRT brightness multiplier from 2.5 to ~1.6, adjust bloom.
- Add soft tone mapping (`color / (1.0 + color)`) to volumetric output.

### Phase 4: Resource cleanup

- Dispose `screenGeometry` on unmount.
- Add GLTF model traversal disposal.
- Verify render target depth texture disposal.

### Phase 5: Code quality

- Extract shared `ResponsiveCamera` to a utility.
- Move inline vertex shader in VolumetricLightScene to the shader file (it's already exported there but unused).
- Remove unnecessary `"use client"` from canvas sub-components.

---

## Files to Modify


| File                                                                                                          | Changes                                                                      |
| ------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------- |
| `[canvas/CRTMonitor.tsx](src/components/experiments/announcing-v2/canvas/CRTMonitor.tsx)`                     | Texture swap out of useFrame, delta-based damping, iResolution fix, disposal |
| `[shaders/crtShader.ts](src/components/experiments/announcing-v2/shaders/crtShader.ts)`                       | Remove secondary bleed, branchless coverUV, dithering, brightness fix        |
| `[canvas/VolumetricLightScene.tsx](src/components/experiments/announcing-v2/canvas/VolumetricLightScene.tsx)` | Pre-alloc vectors, half-res render target, use volumetricLightVertex export  |
| `[shaders/volumetricLight.ts](src/components/experiments/announcing-v2/shaders/volumetricLight.ts)`           | Reduce steps/octaves, early exit, dithering, tone mapping                    |
| `[canvas/TempleScene.tsx](src/components/experiments/announcing-v2/canvas/TempleScene.tsx)`                   | Pre-alloc mouse vector, read scrollProgress from ref/store                   |
| `[shaders/particleSwirl.ts](src/components/experiments/announcing-v2/shaders/particleSwirl.ts)`               | Minor -- no critical issues                                                  |
| `[sections/BlueprintSection.tsx](src/components/experiments/announcing-v2/sections/BlueprintSection.tsx)`     | scrollProgress via ref instead of state                                      |
| `[sections/ProcessSection.tsx](src/components/experiments/announcing-v2/sections/ProcessSection.tsx)`         | scrollProgress via ref instead of state                                      |
| `[sections/ShowcaseSection.tsx](src/components/experiments/announcing-v2/sections/ShowcaseSection.tsx)`       | Minor cleanup                                                                |
| `[store.ts](src/components/experiments/announcing-v2/store.ts)`                                               | Add scrollProgress per-section, or keep mouse-only                           |
| `[canvas/screenGeometry.ts](src/components/experiments/announcing-v2/canvas/screenGeometry.ts)`               | No changes needed                                                            |
| `[canvas/textureLoader.ts](src/components/experiments/announcing-v2/canvas/textureLoader.ts)`                 | Minor -- add video texture quality settings                                  |


