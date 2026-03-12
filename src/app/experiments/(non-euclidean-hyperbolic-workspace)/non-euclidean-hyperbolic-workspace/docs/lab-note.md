# Lab Note: Non-Euclidean Hyperbolic Workspace

## Context

Reading *Gödel, Escher, Bach* in late December 2025. The Escher chapters cover Circle Limit I–IV — those Poincaré disk tessellations. At the same time, I'd been complaining to friends about how every "second brain" tool (Obsidian, Roam, Logseq) is fundamentally limited by being stuck in Euclidean space. Their graph views are force-directed layouts on R², which means you run out of screen real estate fast when your graph grows.

The Escher connection made it click: the Poincaré disk maps an infinite plane onto a finite circle. What if a knowledge graph lived there?

## What I Tried

**Math-first approach.** Started by building the `Complex` class and `mobiusTransform` function before touching any UI. Getting complex arithmetic right was straightforward, but the Möbius transform took a few iterations to feel correct — the conjugate in the denominator was easy to get backwards.

**Geodesic paths.** The 3-point circle algorithm for computing arcs orthogonal to the boundary was the most satisfying piece of geometry. Finding the inversion point `1/conj(z)` and using it as the third point on the circle was an "aha" moment. I verified the orthogonality invariant `|C|² = R² + 1` in the test suite.

**SVG vs Canvas for edges.** Tried canvas rendering first — pixel-level arc drawing was noticeably worse than SVG's native `A` command. SVG arcs are anti-aliased, resolution-independent, and the sweep flag logic maps directly to the math. Switched back to SVG.

**Animated Möbius transitions.** Attempted smooth interpolation of the `a` parameter along a geodesic to create animated focus changes. Technically worked, but the nonlinear warping was disorienting — approached motion sickness territory. Scrapped it in favor of direct state updates.

**DOM tiles over SVG tiles.** Using `<div>` elements for tiles instead of SVG `<rect>`/`<text>` was a deliberate choice. CSS text rendering, Tailwind utilities, and GPU-composited `translate3d` gave a much better result than SVG text. The dual SVG (edges) + DOM (tiles) architecture is unusual but works well.

## What Worked

- **Conformal scaling just falling out of the math.** The `1 - |w|²` formula wasn't something I designed — it's the conformal factor of the Poincaré metric. When I first applied it to tile sizing, it immediately looked right.
- **The Escher hover preview** in the info modal. Using a RAF loop writing directly to `style.transform` via refs (no React state) for the cursor-following animation. Classic performance pattern.
- **Comprehensive test coverage** for the math. 177 lines of tests covering Complex arithmetic, Möbius transform properties, geodesic paths, and the orthogonality invariant. Caught several sign errors early.
- **Culling at `scale < 0.05`.** Without this, the DOM had hundreds of invisibly tiny elements. The culling threshold keeps the render tree manageable.

## What I'd Do Differently

- **Keyboard navigation came late.** Should have been there from the start. Arrow keys applying discrete Möbius transforms was a natural fit.
- **The graph generation could use real data.** The procedural "My Second Brain" tree is a placeholder. Importing from an actual Obsidian vault would make the concept much more compelling.
- **No animation on navigation.** The immediate Möbius transform updates feel abrupt. I'd revisit animated transitions with careful easing and shorter durations — maybe 200ms with an ease-out, just enough to give spatial continuity without the warping sickness.

## Open Questions

- Can Poincaré embeddings (from ML) be used to lay out a real knowledge graph in this space based on semantic similarity?
- Multi-user: what if two people's knowledge graphs overlaid on the same disk, with shared nodes pulled toward each other?
- What's the right interaction for selecting/editing nodes in hyperbolic space?
- Could this scale to 1000+ nodes with virtualization and progressive loading from the boundary inward?
