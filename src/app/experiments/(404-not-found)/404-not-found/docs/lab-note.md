# Lab Note: 404 Not Found

## Context

Needed a 404 page that felt like a physical object -- not a centered heading on a white background, but something you'd want to actually look at. The reference was a stack of paper ribbons or parchment strips, each stamped with bold type and red ruled lines, drifting slightly like a breeze is hitting them. Scroll the page and the text reacts. Flip the ribbons over and there's a message on the back.

## What I Tried

- **CSS 3D transforms.** Tried `transform: rotateX()` with perspective on divs styled as ribbons. Could get the basic stack, but the wave deformation was impossible without subdividing each ribbon into many elements. Performance tanked at 10+ ribbons with 50+ child divs each.
- **SVG path animation.** Drew wavy paths and animated them with SMIL/CSS. Looked flat -- no lighting, no depth, no sense of material. Ribbons felt like stickers, not paper.
- **Pure Three.js (no React).** Built a quick prototype with `BoxGeometry` and `ShaderMaterial`. The shader approach worked immediately -- sine wave displacement in the vertex shader, Canvas 2D textures for the text. But managing 35 meshes imperatively got messy. Needed R3F's component model.

## What Worked

- **R3F with custom `ShaderMaterial`.** Each ribbon is a `<mesh>` with a high-subdivision `boxGeometry` (256x16x1 segments) and a custom shader that handles both faces, lighting, and text scrolling. R3F's declarative approach made the 35-ribbon composition clean.
- **Canvas 2D texture generation.** Instead of loading image files, textures are generated at runtime -- `createElement('canvas')`, draw Inter 900 weight text, add ruled-line guides, wrap in `CanvasTexture`. Faster to iterate on than shipping texture files, and the global cache with ref-counting prevents duplication.
- **Mutable scroll ref.** A plain `{ current: 0 }` object for scroll velocity, read by 35 ribbons at 60fps inside `useFrame`. No React state, no Context, no re-renders. The simplest possible solution for high-frequency shared state in R3F.
- **Seeded deterministic randomness.** `Math.sin(s + i * 777.77) * 10000` gives reproducible "random" values per ribbon. Same layout every render, but with enough variation to look organic.
- **Image section with UV clamping.** Ribbons 12-21 display a single image split across their back faces. UV offset and scale calculations position each ribbon's slice so the image reads as one continuous picture across 10 strips.

## What I'd Do Differently

- **Use Lenis instead of custom wheel handling.** The lab has a unified scroll system (`createUnifiedScroll`) that integrates Lenis with GSAP and Tempus. The custom `ScrollManager` with raw wheel events works, but it's an island -- scroll velocity isn't available to other systems.
- **Continuous responsive camera.** The camera jumps from Z=32 (desktop) to Z=65 (mobile) at a 768px breakpoint. A linear interpolation based on viewport width would eliminate the binary jump.
- **Texture cache robustness.** The ref-counting cache works but could leak if cache keys change without the old entry being properly cleaned up. A simpler approach: just create textures once in a `useMemo` keyed on the text content.

## Open Questions

- Could instanced mesh (`InstancedMesh` with custom attributes per instance) replace 35 individual meshes? Each ribbon has unique uniforms (color, amplitude, frequency, text speed), but those could be packed into instance attributes. Would reduce draw calls from 35 to 1.
- Would WebGPU compute shaders allow the wave deformation to run on GPU without needing 256x16 geometry subdivision? Could use a flat quad with compute-shader-driven vertex displacement.
- The texture cache is global (module-level `Map`). In a Next.js app with multiple routes, does this persist across navigation? Could cause stale textures if the component tree changes.
- What would this look like with physics? Rapier cloth simulation on each ribbon, reacting to mouse proximity and scroll velocity instead of predetermined sine waves.
