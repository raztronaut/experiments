# Changelog: Basketball Replay Center

## Origin

Started as a preloader concept for a basketball product. The brief was "something that sets the mood before the app loads" — not a spinner, not a progress bar. The reference was broadcast control rooms: walls of monitors each showing a different camera angle, all with that degraded analog signal look. Built the first prototype in an afternoon to see if the CRT effect was achievable in a shader.

## Iterations

### v1 — Static colored grid

Fifteen colored rectangles with basic scanline math. No video, no post-processing, no animation. Just proving the grid layout and shader pipeline worked inside R3F. The scanlines looked like a CSS filter — flat and unconvincing.

### v2 — CRT shader layers

Added the full CRT stack: dual scanlines, noise, rolling bar, phosphor dot grid, per-panel vignette. The key insight was routing different effects to different RGB channels instead of applying everything uniformly. Also added the per-panel color tint palette (14 broadcast tones — navy, wine, forest, slate). This is where it started looking like actual CRT monitors instead of a retro shader filter.

### v3 — Video textures + GSAP timeline

Loaded MP4 clips as `VideoTexture` instances and piped them through the CRT shader at 85% mix. Built the 5-phase GSAP timeline: boot-up with Manhattan-distance stagger, distortion ramp, hold with brightness pulsing, reverse-stagger fade-out, logo reveal. Added the distortion proxy pattern for tweening uniforms behind refs. The animation went from "things appear" to "choreographed sequence."

### v4 — Post-processing pipeline

Added the `DistortionPass` component with barrel distortion, chromatic aberration, scene-wide vignette, film grain, and global scanline overlay. Used Three.js `EffectComposer` directly instead of the pmndrs wrapper for fine-grained uniform control. Chromatic aberration scales with distortion intensity so the fringing ramps up with the barrel curve. Added the ambient glow uniform — screens cast a blue haze onto the scene during the hold phase.

### v5 — Theme support + responsive scaling

Integrated `next-themes` via `resolvedTheme`. Dark mode keeps the original broadcast-blue aesthetic. Light mode gets a warm neutral wall (`#f7f7f9`), subtler vignette, reduced glow bleed, and adjusted noise intensity. Added a background plane at z=-0.5 to prevent the dark canvas from bleeding through distortion edges in light mode. Added responsive scaling: portrait screens (mobile) scale the grid down based on aspect ratio. Added the `CameraRig` component for mouse-reactive ambient camera movement.

## Current State

Stable and published. The preloader runs a fixed-duration timeline (~6s) and calls `onComplete` to transition to the main content. All 14 video clips load in parallel. Theme switches update shader uniforms in real time via `useEffect`. The article page includes an interactive `CRTEffectDemo` component (Canvas 2D) that lets readers adjust scanline intensity, noise, vignette, and phosphor dots.

Known gaps: EffectComposer recreates on resize instead of calling `setSize`, no loading fallback for slow video loads, hardcoded mobile breakpoint.

## Related Ideas

- **Audio-reactive CRT.** Feed a Web Audio analyser into the shader — bass drives distortion intensity, treble drives noise, mids drive scanline frequency. Would need `uFrequencyData` as a data texture.
- **Interactive replay selector.** Click a panel to expand it full-screen with the video still playing through the CRT shader. Reverse the boot-up animation to collapse back to the grid.
- **Generative color palettes.** Replace the hardcoded 14-color palette with a procedural palette generated from the dominant colors in each video clip's first frame.
- **WebGPU port.** Rewrite the shaders in WGSL and use compute shaders for the noise generation. Would eliminate the per-panel uniform overhead and allow hundreds of panels.
