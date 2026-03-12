# Changelog: 404 Not Found

## Origin

Started from the idea that a 404 page should be worth looking at, not just a centered heading. The reference was physical paper -- a pile of parchment strips stamped with bold type, like old library index cards or typographic specimen sheets. Red guide lines, heavy ink, warm colors. The interaction idea was simple: scroll the page and the text on the ribbons reacts.

## Iterations

### v1 — Flat ribbons

Basic stack of `boxGeometry` meshes with solid colors. No shader, no deformation, no text. Just proving the R3F canvas setup, camera position, and ribbon spacing. Looked like a paint swatch fan, not paper.

### v2 — Wave deformation

Added the vertex shader with sine wave displacement in Z. Single sine wave first, then layered harmonics for organic character. This was the moment it started looking like physical material -- the depth and shadows from the wave curves sold the "paper in a breeze" effect.

### v3 — Dual-face textures

Built the Canvas 2D texture generator for front-face text and back-face italic text. Implemented the `vModelNormal.z` face detection in the fragment shader. Added the red guide lines. The ribbons now had readable content on both sides.

### v4 — Scroll velocity

Wired up the custom wheel event system with velocity accumulation, clamping, and lerp decay. Connected it to `uRunTime` in each ribbon's `useFrame`. Text started scrolling with user input. Also added the image section (ribbons 12-21) with UV clamping to display a single picture across 10 ribbon back faces.

### v5 — Lighting and polish

Full lighting model: Blinn-Phong specular, rim lighting, valley shadows from `vIndent`, edge ambient occlusion, film grain. Added the `InteractivityLayer` for mouse-tracked parallax tilt. Added `useResponsiveCamera` for mobile (camera Z 32 → 65). Added the DOM overlay with the giant "404" text at 3% opacity. Global texture cache with ref-counting to prevent duplication.

## Current State

Shipped and stable. 35 ribbons, ~287k vertices, runs smoothly on modern hardware. The scroll-velocity system is a one-off (doesn't use the lab's toolkit integration layer). The responsive camera is a binary breakpoint jump rather than a continuous function. Legacy experiment -- no code changes planned.

## Related Ideas

- **Physics-based ribbons.** Replace sine wave deformation with Rapier cloth simulation. Ribbons would react to mouse proximity, scroll force, and gravity. More expressive but much heavier.
- **Generative text content.** Instead of static "404 NOT FOUND" strings, feed the ribbon text from an API or generative model. The texture generator already takes arbitrary strings.
- **Audio-reactive amplitude.** Web Audio analyser driving `uAmplitude` per ribbon. Bass frequencies would make ribbons wave more aggressively, treble would tighten them.
- **Instanced rendering.** Pack per-ribbon uniforms into instance attributes and render all 35 in a single draw call. Would need a texture atlas for the text variants.
