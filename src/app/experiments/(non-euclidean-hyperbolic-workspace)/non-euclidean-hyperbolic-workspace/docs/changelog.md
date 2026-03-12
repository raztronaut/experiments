# Changelog: Non-Euclidean Hyperbolic Workspace

## Origin

**December 2025.** Reading *Gödel, Escher, Bach* and complaining about Obsidian's graph view being stuck in Euclidean space. The Escher Circle Limit chapters triggered the idea: use the Poincaré disk model to build a knowledge graph navigator where the geometry handles information density.

## Iterations

### v0.1 — Math Foundation

- Built the `Complex` class with full arithmetic (`add`, `sub`, `mul`, `div`, `conj`, `abs`, `arg`)
- Implemented `mobiusTransform(z, a)` as the core navigation operation
- Wrote the `getGeodesicPath` algorithm using the 3-point circle construction with inversion point
- 177 lines of tests covering Complex arithmetic, Möbius transform properties (identity, maps-to-origin, disk preservation, conformality), and geodesic orthogonality invariant `|C|² = R² + 1`

### v0.2 — Graph Generation

- Procedural BFS tree layout on concentric hyperbolic layers
- Layer radii: `[0, 0.4, 0.7, 0.88, 0.95]`
- Branching factor decreasing with depth (3–4, 2–3, 1–2)
- Angular jitter (±20% sector width) for organic feel
- Node type hierarchy: root → area → project → note/media
- "My Second Brain" labels with real PKM categories

### v0.3 — Rendering

- Dual-layer architecture: SVG for geodesic edges, DOM divs for tiles
- Conformal scaling: `1 - |w|²` applied to tile size
- Culling at `scale < 0.05`
- Z-index from scale: `Math.floor(scale * 100)`
- Gradient edges: sky-blue → purple
- Node type colors: root (rose), area (indigo), project (purple), note (emerald), media (amber)

### v0.4 — Interaction

- Mouse drag navigation via `useHyperbolicNavigation` hook
- Touch support (same hook, `touch-none` on container)
- Keyboard navigation: arrow keys with discrete Möbius steps (`KEYBOARD_STEP = 0.1`)
- Cursor changes during drag (`cursor-grab` / `cursor-grabbing`)
- Smooth opacity transitions on tiles when not dragging

### v0.5 — Info Modal & Polish

- Accessible dialog with `aria-modal`, focus trap, Escape key
- Escher hover preview: cursor-following image via RAF loop (ref-driven, no state-per-frame)
- Radial gradient background on the disk container
- Sky-blue glow border on the disk
- Glassmorphism info button (top-right)

## Current State

**Shipped, public, legacy.** 1,209 lines across 10 files. Pure SVG + DOM, no external animation or 3D libraries. Full test coverage for the math layer. The experiment is a proof of concept — demonstrates that hyperbolic space is viable for knowledge graph navigation but lacks search, editing, and persistence.

## Related Ideas

- **Semantic clustering**: Use Poincaré embeddings (Facebook Research, 2017) to place nodes based on content similarity rather than tree structure
- **Multi-user**: Overlay two knowledge graphs on the same disk with shared nodes as gravitational anchors
- **Animated transitions**: Interpolate the Möbius parameter along a geodesic path with careful easing (200ms ease-out) to give spatial continuity without warping sickness
- **Obsidian import**: Parse `.md` files and backlinks into a tree, lay out using the hyperbolic generation algorithm
- **Zoom levels**: Different radii configurations for different zoom levels — close-up shows more detail, zoomed-out shows the full structure
