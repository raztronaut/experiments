# Social: 404 Not Found

## X Thread

**1/6**
Built a 404 page with 35 wavy parchment ribbons in React Three Fiber. Each one has "404 NOT FOUND" scrolling across it in heavy type, with red guide lines like a ruled notebook.

Scroll the page and the text speeds up or reverses.

Here's how it works 🧵

**2/6**
The wave deformation is three layered sine waves in the vertex shader. A single sine looks mechanical. Adding harmonics at 2.1x and 4.4x the base frequency gives it organic, paper-like character.

```glsl
indent += sin(xPos * 2.1) * amplitude * 0.3;
indent += sin(xPos * 4.4) * amplitude * 0.1;
```

Displacement is Z-only so ribbons don't clip through each other.

**3/6**
Each ribbon renders both faces with a single shader. `vModelNormal.z` tells the fragment shader which side it's looking at.

Front face: scrolling text composited over a parchment color.
Back face: tiled italic "INSPIRED BY DAY JOB" — or a clamped image spanning 10 consecutive ribbons.
Edges: solid color.

**4/6**
The textures aren't loaded from files — they're generated at runtime with Canvas 2D.

Draw text with Inter 900, add ruled-line guides, wrap in a CanvasTexture. A global cache with ref-counting prevents 35 ribbons from generating the same texture 35 times.

**5/6**
Scroll velocity bypasses React entirely. It's a plain `{ current: 0 }` object.

Wheel events write to it. 35 ribbons read it at 60fps in useFrame. The velocity decays via `lerp(current, 0, 0.05)` each frame and drives a `uRunTime` uniform that offsets the text UVs.

No Context. No re-renders. No state management.

**6/6**
Small details that sell it:
- Blinn-Phong specular + rim lighting
- Valley shadows from wave displacement (vIndent varying)
- Film grain via per-fragment pseudo-random
- Mouse-tracked parallax tilt on the entire stack
- A giant "404" in 3% opacity DOM overlay behind the canvas

Source + writeup: [link]

## Launch Post

35 wavy parchment ribbons with a dual-face GLSL shader, procedurally generated Canvas 2D textures, and scroll-velocity-driven text animation. A cinematic 404 page built in React Three Fiber.

The text scrolls across each ribbon, speeds up when you scroll the page, and reverses when you scroll up. Flip them over and the back says "INSPIRED BY DAY JOB."

Wrote up the wave deformation, dual-face shader, and the mutable-ref trick for 60fps scroll state.

[link] [preview]

## One-Liner

Cinematic 404 page — 35 wavy parchment ribbons with a dual-face GLSL shader, scroll-velocity-driven text animation, and procedurally generated Canvas 2D textures in React Three Fiber.
