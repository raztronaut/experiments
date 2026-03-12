---
name: Hyperbolic content constellation
overview: Generate the full 6-format content constellation for the non-euclidean-hyperbolic-workspace experiment, with a long-form balanced concept/implementation article anchored by the GEB origin story, PKM critique, and 5 interactive Canvas 2D demos of hyperbolic geometry.
todos:
  - id: modernize-layout
    content: "Modernize layout.tsx: add ThemeProvider, suppressHydrationWarning, font-canvas antialiased to match basketball-replay-center pattern"
    status: completed
  - id: scaffold-article
    content: Run npm run new:article:auto -- --name non-euclidean-hyperbolic-workspace to create 8 content files
    status: completed
  - id: build-demos
    content: "Build 5 Canvas 2D demos in article/components.tsx: EuclideanVsHyperbolicDemo, MobiusTransformDemo, GeodesicDemo, ConformalScaleDemo, HyperbolicTreeDemo"
    status: completed
  - id: wire-article-page
    content: Wire demo components into article/page.tsx MDX components prop
    status: completed
  - id: write-article
    content: "Write content.mdx: Long-form article (~3500-4500 words, 11 sections). GEB origin story, PKM history, non-Euclidean geometry primer, 4 implementation sections, concept sections, reflection. Deliberately longer than existing articles."
    status: completed
  - id: write-docs
    content: "Write all 5 docs: lab-note.md, architecture.md, snippet.md, changelog.md, social.md"
    status: completed
  - id: finalize
    content: Fill MDX frontmatter, verify article renders, confirm no template placeholders remain
    status: completed
isProject: false
---

# Non-Euclidean Hyperbolic Workspace -- Content Constellation

## Prerequisites

**Layout modernization.** The current [layout.tsx](src/app/experiments/(non-euclidean-hyperbolic-workspace)/layout.tsx) is a legacy layout (pre-2026-03) missing `ThemeProvider`, `suppressHydrationWarning`, and `font-canvas antialiased`. Must be updated to match the [basketball-replay-center layout](src/app/experiments/(basketball-replay-center)/layout.tsx) pattern before writing article content, or the article will be stuck in light mode.

## Phase 1: Scaffold

Run `npm run new:article:auto -- --name non-euclidean-hyperbolic-workspace` to create the 8 content files:

- `article/page.tsx`, `article/content.mdx`, `article/components.tsx`
- `docs/lab-note.md`, `docs/architecture.md`, `docs/snippet.md`, `docs/social.md`, `docs/changelog.md`

## Phase 2: Article -- Section Outline

**Title**: "Mobius Transforms, Poincare Disks, Escher's Fish, and More"

Balanced concept + implementation, with the GEB origin story as the narrative spine. Deliberately longer than existing articles -- this experiment sits at an intersection of math, art, knowledge management, and UI design that warrants the depth. Target ~3500-4500 words of prose (existing articles are ~1500-2000). 5 interactive demos across 11 sections.

### 1. Hook (Exploration)

Origin story: reading GEB, sending voice notes to friends about how Obsidian and second brains are all stuck in flat space. "I was halfway through Godel, Escher, Bach, sending my friends voice notes about how every second brain app is basically a fancy text editor with a graph view bolted on." The Escher chapters clicked something -- Circle Limit wasn't just art, it was a map of a different kind of space where you could fit infinite information in a finite circle. What if a second brain lived there instead?

### 2. The Second Brain Problem (Concept)

- Brief PKM history: Luhmann's Zettelkasten (paper slips, wooden drawers, 1960s), Vannevar Bush's Memex (1945), the modern wave (Roam Research 2020, Obsidian, Logseq, Notion databases)
- The core promise: externalize thinking, let connections emerge
- The core failure: every tool lays nodes on a flat Euclidean plane. Obsidian's graph view is force-directed on R^2. Notion is pages in pages. Roam is an outliner.
- The mathematical problem: Euclidean circumference grows linearly (2*pi*r). A 4-level tree with branching factor 3 has ~40 leaves. On a flat plane, you scroll, zoom, paginate. Your brain does the spatial work the tool should do.
- The GEB question: what if the geometry itself could do the heavy lifting?

### 3. A Brief History of Non-Euclidean Geometry (Concept)

- Euclid's 5th postulate and the 2000-year quest to prove it from the other four
- Lobachevsky and Bolyai (independently, 1830s): denying the parallel postulate yields hyperbolic geometry -- consistent and valid
- Poincare's disk model (1882): the infinite hyperbolic plane inside a finite circle. "Lines" become circular arcs orthogonal to the boundary. Distances compress toward the edge.
- **Godel connection** (GEB): just as Godel proved no consistent axiom system proves all truths within it, the parallel postulate's independence shows Euclidean geometry is a choice, not truth. Hyperbolic geometry is equally valid. We just don't build UIs in it.
- **Escher enters**: H.S.M. Coxeter sent Escher a paper on hyperbolic tessellations. Escher (no formal math training) turned it into the Circle Limit series (1958-1960). The fish, angels, and devils aren't decorative -- they're mathematically rigorous tilings of the Poincare disk. Already referenced in the codebase: hovering "M.C. Escher's Circle Limit woodcuts" in the info modal shows his work.

### 4. Exponential Room: Why Hyperbolic Space Fits Knowledge (Concept + Implementation)

- The key mathematical property: hyperbolic circumference grows exponentially (2*pi*sinh(r) ~ pi*e^r for large r). Each concentric ring has exponentially more room.
- For knowledge graphs: root at center, each ring fits more nodes. Show the actual radii from `HyperbolicGraphGen.ts`: [0, 0.4, 0.7, 0.88, 0.95]. A tree 4 levels deep with branching factor 3 has ~40 leaf nodes -- fits comfortably because each ring has exponentially more circumference.
- Zettelkasten connection: Luhmann's system worked because of physical proximity -- related slips lived near each other. Hyperbolic space offers the same: subtopics are geometrically close to their parent, and exponential growth means you never run out of nearby slots.
- **Demo: EuclideanVsHyperbolicDemo** -- side-by-side. Left: nodes on a flat plane (linear spacing). Right: same nodes on a Poincare disk (exponential spacing). Range sliders for branching factor (2-5) and depth (1-4). Watch Euclidean collapse while hyperbolic stays readable.

### 5. The Mobius Transform: One Function to Navigate Infinity (Implementation)

- The core operation: z -> (z - a) / (1 - conj(a)*z). Show the Complex class from `HyperbolicMath.ts`.
- What it does geometrically: maps point a to the origin. Everything else flows conformally. Boundary circle maps to itself. Angles preserved.
- Why this is the right "camera": in Euclidean space, panning is x + dx. In hyperbolic space, panning is a Mobius transform. You don't just shift the view, you restructure the space around your focus.
- Composing transforms: dragging twice doesn't add -- it composes. mobiusTransform(mobiusTransform(z, a), b) is itself a Mobius transform. The group structure means navigation is always consistent.
- **Bach connection** (GEB): a Mobius transform is to hyperbolic space what transposition is to music. When Bach transposes a fugue subject to a different key, every interval is preserved -- the structure is identical, the perspective changes. Composing Mobius transforms is like layering fugue voices: each voice presents the same harmonic structure from a different tonal center. Each drag gives you a new "voicing" of the same knowledge graph.
- **Demo: MobiusTransformDemo** -- Canvas 2D Poincare disk with a regular grid of dots. Drag to apply the transform interactively. Switch to toggle angle-preservation visualization (small squares at grid points remain square as the grid warps). Switch to highlight boundary fixedness.

### 6. Geodesics: Straight Lines That Curve (Implementation)

- In the Poincare disk, the shortest path between two points isn't a straight line -- it's a circular arc orthogonal to the boundary circle.
- The algorithm from `getGeodesicPath`: collinearity check via cross product, 3-point circle solution through z1, z2, and the inversion point 1/conj(z1), the orthogonality invariant |C|^2 = R^2 + 1.
- Show the actual code: determinant method for finding circle center, sweep flag logic.
- Why arcs, not lines: the hyperbolic metric ds = 2|dz|/(1-|z|^2) stretches distances near the boundary. The arc "cuts through" the shorter hyperbolic path even though it looks longer in Euclidean terms.
- **Demo: GeodesicDemo** -- click two points on a Poincare disk. See the geodesic arc (blue) and the Euclidean straight line (gray dashed). Switch to show the orthogonal circle construction (full circle the arc belongs to, with boundary intersection points). Switch to show the inversion point.

### 7. Conformal Scaling and the Dual Render Pipeline (Implementation)

- The 1 - |w|^2 formula: conformal factor from the hyperbolic metric. Tiles at center are full-size, tiles near boundary shrink toward zero. Not a design choice -- falls directly out of the math.
- Culling at scale < 0.05: nodes below 5% scale removed from DOM entirely.
- Dual-layer architecture: SVG layer (z-10) for geodesic edges (native arc commands handle curves perfectly), DOM div layer (z-20) for tiles (CSS text rendering, Tailwind styling, translate3d for GPU compositing). SVG viewport fixed at 300 units; DOM layer scales with container via useViewportRadius.
- Z-index from scale: Math.floor(scale * 100). Closer tiles render on top. Natural depth ordering without a z-buffer.
- **Demo: ConformalScaleDemo** -- a radius line on a Poincare disk. Drag a point along the radius. Left: the tile at that position (shrinking as it moves outward). Right: the 1 - |w|^2 curve plotted with current position marked.

### 8. Growing Trees in Curved Space (Implementation)

- The procedural generation algorithm from `HyperbolicGraphGen.ts`: BFS tree laid out on concentric hyperbolic layers.
- Layer radii: [0, 0.4, 0.7, 0.88, 0.95] -- chosen for visual separation in hyperbolic coordinates.
- Branching: Level 0 -> 3-4 children, Level 1 -> 2-3, Level 2 -> 1-2. Angular jitter (+-20% of sector width) for organic feel.
- Node type hierarchy: root -> area -> project -> note/media. Random Lucide icons per type.
- The "My Second Brain" data: areas named "Dev", "Writing", "Health", "Art", "Finance", "Travel" -- a real PKM taxonomy.
- Client-side generation in useEffect to avoid hydration mismatch from randomness.
- **Demo: HyperbolicTreeDemo** -- generate trees with controllable parameters. Range for depth (1-4), branching factor (2-4), jitter (0-50%). "Regenerate" button for new random layouts. Renders on a Poincare disk in real-time.

### 9. Strange Loops and the Future of Knowledge Space (Concept)

- **Strange loops** (GEB's central concept): Hofstadter argues that consciousness arises from self-referential loops -- systems that refer to themselves, creating tangled hierarchies where "up" eventually leads back to "down."
- The hyperbolic workspace is a strange loop: no privileged origin. Any node can be dragged to center. The "root" has no special geometric status -- it's just wherever you started. Compose enough Mobius transforms and you return to a transformed version of where you began. The hierarchy is real (nodes have parents and children) but the geometry treats every perspective as equally valid.
- Contrast with PKM tools: Obsidian has a "vault root." Notion has a "workspace." Roam has "daily notes" as the entry point. These are all privileged origins. A hyperbolic PKM has no home page -- focus *is* the interface.
- The "horizon" metaphor: the boundary represents infinity. Information at the horizon is always visible but infinitely small. Richer than "out of view" (Euclidean scroll) or "in another page" (folder navigation). Everything is always present. The question is what you're focused on.
- What-ifs: What if scroll speed in Obsidian determined information density? What if zooming didn't just scale pixels but restructured the topology of your notes? What about semantic clustering in hyperbolic embeddings (Poincare embeddings are already used in ML for hierarchical data)?

### 10. Full Thing

`<LiveDemo slug="non-euclidean-hyperbolic-workspace" />`

### 11. Reflection

- What GEB got right: the book argues that formal systems, visual art, and music share deep structural patterns. This experiment is a small proof: the same Mobius transform that navigates hyperbolic space is the conformal mapping Escher used in Circle Limit, which has the same structure-preserving property as Bach's fugue transpositions.
- What PKM tools are missing: they're all built on the assumption that Euclidean space is the only option. It isn't. Hyperbolic space is mathematically better for trees, which is what knowledge graphs are.
- Dead ends: tried canvas instead of SVG for edges (pixel-level arc rendering was worse than SVG's native arc commands). Tried animating Mobius transforms (smooth transitions between focal points -- technically possible but hard to make feel right without motion sickness).
- Open questions: semantic clustering (auto-grouping related nodes based on content similarity), multi-user hyperbolic spaces (overlaying knowledge graphs on the same disk), animated focal transitions, import from Obsidian vaults, Poincare embeddings for hierarchical ML data visualized in this UI.
- The proof of concept: 1,209 lines of code, pure SVG + DOM, no build dependencies beyond React. The math is 146 lines. The real product would need search, editing, and persistence. But the geometry works.

## Phase 3: Interactive Demos (components.tsx)

All Canvas 2D, no R3F. Using `InteractiveWidget`, `Range`, `Switch` from the MDX controls library. 5 demos total -- one per major implementation/concept section.

- `**EuclideanVsHyperbolicDemo`**: Side-by-side comparison. Left: Euclidean (linear). Right: Poincare disk (exponential). Range for branching factor (2-5) and depth (1-4). Watch Euclidean collapse while hyperbolic stays readable.
- `**MobiusTransformDemo`**: Canvas 2D Poincare disk with grid of dots. Mouse drag applies Mobius transform. Switch for angle-preservation visualization (small squares stay square). Switch for boundary fixedness.
- `**GeodesicDemo**`: Click two points, see geodesic arc (blue) vs. Euclidean line (gray dashed). Switch for orthogonal circle construction and inversion point.
- `**ConformalScaleDemo**`: Drag point along radius, tile preview shrinks. Plot of 1 - |w|^2 curve with current position marked.
- `**HyperbolicTreeDemo**`: Procedural tree generation with controls. Range for depth (1-4), branching factor (2-4), jitter (0-50%). "Regenerate" button.

## Phase 4: Documentation (docs/)

- **lab-note.md**: The GEB reading, the Obsidian frustration, trying to implement Mobius transforms, the "aha" when conformal scaling just worked, dual SVG/DOM rendering decision, the Escher hover easter egg
- **architecture.md**: Component tree, Complex class API, Mobius transform composition, geodesic algorithm, dual SVG/DOM rendering pipeline, performance (memoization, culling, ref-driven animation in info modal), graph generation BFS
- **snippet.md**: The Complex class + mobiusTransform + getGeodesicPath as a standalone utility. Install, usage example, full API table, gotchas (disk boundary, numerical stability)
- **changelog.md**: Origin (GEB + PKM frustration, Dec 2025), iterations (math library, graph generation, dual rendering, info modal with Escher hover, keyboard navigation), current state, related ideas
- **social.md**: Concept-led thread -- "Your second brain is trapped in Euclidean space" hook, GEB connection, Poincare disk as solution, the math in 2 tweets, demo link, article link. Also: launch post, one-liner caption.

## Phase 5: Finalization

- Fill MDX frontmatter (`publishedAt`, `description`)
- Verify article renders at `/experiments/non-euclidean-hyperbolic-workspace/article`
- All 5 docs populated with real content, no template placeholders
- OG image capture if dev server is running

## Key Files

- [layout.tsx](src/app/experiments/(non-euclidean-hyperbolic-workspace)/layout.tsx) -- Modernize: add ThemeProvider, suppressHydrationWarning, font-canvas
- `article/content.mdx` -- Long-form article (~3500-4500 words) with GEB narrative spine
- `article/components.tsx` -- Build 5 Canvas 2D demos
- `article/page.tsx` -- Wire demos into MDX components
- `docs/*.md` -- Fill all 5 doc formats

## GEB Reference Map

These threads weave through all 11 article sections:

- **Godel** (sections 3, 9): Non-Euclidean geometry as parallel to incompleteness -- Euclidean axioms aren't the only valid system, neither is flat-plane UI. The parallel postulate's independence is an incompleteness result.
- **Escher** (sections 1, 3, 4, 11): Circle Limit woodcuts as literal Poincare disk art. Already in the codebase (`HyperbolicInfoModal.tsx` hover preview). Escher-Coxeter collaboration. The fish tessellations as mathematically rigorous hyperbolic tilings.
- **Bach** (sections 5, 11): Fugue structure as metaphor for Mobius transform composition -- transposition preserves structure, each voice (view) is a valid perspective on the same piece (knowledge graph). Composing transforms like layering fugue voices.
- **Strange Loops** (section 9): Hofstadter's central concept maps to hyperbolic navigation -- no privileged origin, every point can be "center," self-referential composition of transforms. Tangled hierarchies in knowledge graphs.
- **PKM** (sections 2, 4, 9): Luhmann's Zettelkasten, Vannevar Bush's Memex, Obsidian/Roam/Notion critique, the flat-space assumption, focus-as-interface, the horizon metaphor.

