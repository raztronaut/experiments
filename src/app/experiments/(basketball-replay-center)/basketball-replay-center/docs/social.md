# Social: Basketball Replay Center

## X Thread

**1/6**
Built a broadcast control room preloader in React Three Fiber — 15 CRT screens booting up with basketball replays, barrel distortion, and a GSAP-driven timeline.

Here's how each layer works 🧵

**2/6**
Each screen is a plane with a custom GLSL shader. The CRT effect is five layers stacked:

→ Dual-frequency scanlines (opposing directions)
→ Pseudo-random static noise
→ Rolling desync bar via smoothstep
→ Phosphor dot grid (sin × sin at 600x)
→ Per-panel vignette

No textures for the effects — it's all math.

**3/6**
The trick that makes it look like a real CRT instead of a "retro shader filter": each RGB channel gets a different effect.

Red gets the noise. Green gets the secondary scanline. Blue gets the rolling bar.

That subtle per-channel instability is what sells the bad-signal look.

**4/6**
The whole scene passes through a custom post-processing pass — barrel distortion, chromatic aberration, and a scene-wide vignette.

Barrel distortion: offset pixels by r² from center.
Chromatic aberration: sample R and B at slightly different distorted UVs.

Both scale together so fringing intensifies with the curve.

**5/6**
GSAP can't tween a shader uniform behind a ref. The workaround: tween a plain JS proxy object and push values into the uniform on every `onUpdate` tick.

For panel uniforms it's simpler — Three.js uniforms are just `{ value: number }`, which GSAP handles natively.

5-phase timeline: boot → distortion ramp → hold → fade → logo reveal.

**6/6**
Panels stagger by Manhattan distance from center: `|col - 2| + |row - 1|`.

Center boots first, corners last. Fade-out reverses it — corners disappear first.

Small detail, but it's what makes it feel choreographed instead of random.

Source + writeup: [link]

## Launch Post

15 CRT screens. Basketball replays. Custom GLSL shaders. A broadcast control room preloader built entirely in React Three Fiber.

Scanlines, phosphor dots, barrel distortion, chromatic aberration — each effect is a shader layer, orchestrated by a 5-phase GSAP timeline. Supports light and dark themes.

Wrote up how the CRT shader works, how GSAP bridges to WebGL uniforms, and what I'd do differently.

[link] [preview gif]

## One-Liner

Broadcast control room preloader — 15 CRT screens with custom GLSL shaders, barrel distortion, and GSAP-animated boot sequence in React Three Fiber.
