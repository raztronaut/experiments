# Social: Non-Euclidean Hyperbolic Workspace

## X Thread (Concept-led)

**1/** Your second brain is trapped in Euclidean space.

Every PKM tool — Obsidian, Roam, Notion — lays your notes on a flat plane. Circumference grows linearly. You scroll, zoom, paginate. Your brain does the spatial work the tool should do.

What if the geometry itself was different?

**2/** In hyperbolic space, circumference grows *exponentially*. The Poincaré disk maps an infinite plane onto a finite circle. Each concentric ring has exponentially more room than the last.

A 4-level knowledge tree fits comfortably. No scrolling. No pagination. Everything visible at once.

**3/** Navigation is one function: the Möbius transform.

z → (z - a) / (1 - āz)

It maps your focus to the center and restructures the entire space around it. Not a pan. Not a zoom. A topological restructuring.

**4/** Escher knew this. His Circle Limit woodcuts are literal tilings of the Poincaré disk. He got the math from geometer H.S.M. Coxeter. The fish and devils aren't decorative — they're rigorous hyperbolic tessellations.

I built a workspace that lives in the same geometry.

**5/** "Straight lines" in this space are circular arcs orthogonal to the boundary. The algorithm computes them via a 3-point circle construction using the inversion point 1/z̄. The orthogonality invariant |C|² = R² + 1 holds to floating-point precision.

**6/** The whole thing is 1,209 lines. Pure SVG + DOM. No canvas, no WebGL. The math library is 146 lines. React state drives everything.

Drag to navigate. Arrow keys for precision. Every Möbius transform composes cleanly — the group structure means you can't break the view.

**7/** Open questions: semantic clustering via Poincaré embeddings, multi-user knowledge graphs, animated focal transitions, Obsidian vault import.

Hyperbolic space is mathematically better for trees. Knowledge graphs are trees. The geometry works.

**8/** Article with 5 interactive demos (geodesic explorer, Möbius transform visualizer, conformal scaling, tree generator):

[link to article]

Full experiment:

[link to experiment]

## Launch Post

Built a non-Euclidean second brain. Your knowledge graph lives on a Poincaré disk — drag to navigate via Möbius transforms, everything stays visible, nothing scrolls. 1,209 lines, pure SVG + DOM. Escher would approve.

[link to experiment]

## One-Liner (Discord/Slack)

Non-Euclidean knowledge graph on a Poincaré disk — Möbius transforms, geodesic arcs, and why hyperbolic space is a better home for your second brain → [link]
