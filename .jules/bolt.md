
## 2024-03-19 - Optimizing Canvas ImageData Allocation
**Learning:** In performance-critical requestAnimationFrame loops (like those used in `CRTEffectDemo`, `BarrelDistortionDemo`, and `LifeSimulation`), creating a new `ImageData` object every frame via `ctx.createImageData(w, h)` causes massive memory allocation and subsequent garbage collection stutters.
**Action:** Always hoist `ImageData` creation out of the render loop using a `useRef` or closure variable. Update the cached buffer only when canvas dimensions change. When reusing the buffer, be mindful of whether every pixel is overwritten (like in a full-screen shader) or if the buffer needs to be explicitly cleared with `.fill(0)` before the next frame to prevent ghosting of sparse data.
