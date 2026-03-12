# Lab Note: Basketball Replay Center

## Context

Needed a preloader for a basketball product that felt like walking into a broadcast control room — a wall of CRT monitors flickering with replay footage, not a loading spinner. The goal was mood-setting: screens boot up, distortion kicks in, everything fades except the logo. Entirely WebGL, running inside a Next.js app with theme support.

## What I Tried

- **Canvas 2D first pass.** Started with a 2D canvas grid drawing fake scanlines over colored rectangles. Looked flat — no depth, no distortion, no post-processing chain to play with. Abandoned after a day.
- **R3F with drei `<ScreenQuad>`.** Tried using drei's screen-space primitives for each panel. Worked for flat grids but made barrel distortion and per-panel vignetting awkward since everything was in screen space.
- **EffectComposer from `@react-three/postprocessing`.** The pmndrs wrapper couldn't give me fine-grained control over a custom shader pass with arbitrary uniforms that GSAP needs to tween. Dropped down to Three.js `EffectComposer` directly.
- **GSAP tweening uniforms directly.** GSAP can tween `{ value: number }` objects, which is exactly how Three.js uniforms work — but only for simple cases. For the distortion pass, the uniform lives behind a ref exposed via `useImperativeHandle`, so I used a proxy object with `onUpdate` callbacks.

## What Worked

- **Raw Three.js post-processing inside R3F.** Using `EffectComposer`, `RenderPass`, `ShaderPass`, and `OutputPass` from `three/examples/jsm` gave full control. The custom `DistortionPass` component manages the pipeline and exposes `setDistortion`/`setGlow` via a ref for GSAP.
- **Manhattan distance stagger.** Sorting panels by `|col - 2| + |row - 1|` for the boot-up reveal and reversing it for fade-out. Center-first, corners-last reads as intentional rather than random.
- **Per-channel CRT noise allocation.** Instead of adding uniform noise to all RGB channels, the shader routes different effects to different channels — noise to R, secondary scanline to G, rolling bar to B. Creates subtle chromatic instability that reads as "bad signal" rather than "shader filter."
- **`next-themes` integration.** The `resolvedTheme` drives `uIsDark` and `uBgColor` uniforms through the entire shader chain. Dark mode gets the original broadcast-blue aesthetic; light mode gets a warm neutral wall with subtler glow.

## What I'd Do Differently

- **EffectComposer recreation on resize.** It's in a `useMemo` keyed on `size`, which recreates the entire pipeline on every resize. Should instantiate once and call `composer.setSize()` instead.
- **Video loading has no fallback.** Panels that haven't loaded yet are just dark. Animated static noise as a loading state would mask the delay and look intentional.
- **Hardcoded responsive breakpoint.** The mobile scaling uses `aspect < 1.0` with a linear formula. Should compute the camera frustum to fit the grid at any aspect ratio.
- **Cleanup on video elements.** The `<video>` elements created in `useEffect` don't get explicitly paused/removed on unmount. Browsers handle it, but it's sloppy.

## Open Questions

- Is there a way to share the noise function between the per-panel CRT shader and the post-processing distortion shader without duplicating the GLSL?
- Could the `VideoTexture` instances share a single `requestVideoFrameCallback` loop instead of each one ticking independently?
- Would replacing the `EffectComposer` pipeline with `@react-three/postprocessing`'s `<EffectComposer>` and a custom `Effect` subclass be worth the abstraction, or would it just add indirection for no gain?
- The phosphor dot frequency (600.0) is resolution-dependent. Should it scale with viewport DPR?
