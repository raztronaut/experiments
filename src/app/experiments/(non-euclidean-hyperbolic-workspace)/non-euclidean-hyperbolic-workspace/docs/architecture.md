# Architecture: Non-Euclidean Hyperbolic Workspace

## Overview

A Poincaré disk knowledge graph navigator built with pure SVG + DOM rendering and React state management. All navigation is implemented via Möbius transformations in complex coordinate space. ~1,209 lines across 10 files.

## Component Tree

```
NonEuclideanHyperbolicWorkspace (orchestrator, 157 lines)
├── Info button (lucide-react <Info>)
├── HyperbolicInfoModal (dialog, 227 lines)
│   └── Escher hover preview (RAF-driven cursor follower)
├── Poincaré Disk container (div, rounded-full, aspect-square)
│   ├── SVG layer (z-10) — geodesic edges
│   │   ├── <defs> gradient (sky-blue → purple)
│   │   └── HyperbolicLink × N (38 lines each, memo'd)
│   ├── Tiles layer (div, z-20) — node tiles
│   │   ├── Center dot (0.5px sky-500)
│   │   └── HyperbolicTile × N (74 lines each, memo'd)
│   └── Border ring overlay (z-60, inset shadow)
```

## Key Patterns

- **Complex number coordinates**: All positions are `Complex` values in the unit disk. No pixel coordinates until the final render step.
- **Möbius transform composition**: Navigation state is a single `Complex` value (`viewCenter`). Every tile/edge position is computed as `mobiusTransform(originalPos, viewCenter)`.
- **Dual rendering**: SVG for edges (native arc commands), DOM divs for tiles (CSS text, Tailwind, GPU compositing via `translate3d`).
- **Conformal scaling**: Tile size = `1 - |transformedPos|²`. Culled at `< 0.05`. Z-index = `Math.floor(scale * 100)`.
- **Memoization**: `HyperbolicTile` and `HyperbolicLink` are `React.memo`. All tiles re-render on drag (viewCenter changes), but memo prevents unnecessary renders from other prop changes.
- **Ref-driven animation**: Info modal's Escher hover uses RAF writing directly to `style.transform` — no React state per frame.

## Data Flow

```
User drag → useHyperbolicNavigation hook
  → normalize mouse delta to Complex shift
  → mobiusTransform(startCenter, shift) → new viewCenter
  → React state update → re-render all tiles/edges
  → each tile: mobiusTransform(node.pos, viewCenter) → screen position + scale
  → culling: scale < 0.05 → return null
  → render: translate3d(x, y, 0) scale(s) with opacity transition
```

## Dependencies

| Dependency | Purpose |
|---|---|
| React 19 | Component rendering, state, effects |
| lucide-react | Node icons (dynamically assigned per type) |
| Tailwind CSS 4 | All styling (utility classes) |

No animation libraries. No canvas. No WebGL. No Three.js.

## Performance Notes

- **Culling**: Nodes with `scale < 0.05` are excluded from the DOM entirely, keeping the node count manageable (typically 15–25 visible out of 40+ total).
- **GPU compositing**: `translate3d` on every tile forces compositor layers, avoiding main-thread paint during drag.
- **SVG viewport**: Fixed at 300 units regardless of container size. The DOM layer scales via `useViewportRadius`.
- **Transitions disabled during drag**: Tiles have `transition-[opacity,filter] duration-300 ease-out` only when `!isDragging`, avoiding animation overhead during interaction.
- **Graph generation**: Client-side `useEffect` to avoid SSR hydration mismatch from `Math.random()`.

## File Inventory

| File | Lines | Role |
|---|---|---|
| `NonEuclideanHyperbolicWorkspace.tsx` | 157 | Main orchestrator |
| `HyperbolicMath.ts` | 146 | Complex class, Möbius transform, geodesic path |
| `HyperbolicMath.test.ts` | 177 | Unit tests for all math |
| `HyperbolicGraphGen.ts` | 169 | Procedural tree generation |
| `HyperbolicTile.tsx` | 74 | Individual node tile |
| `HyperbolicLink.tsx` | 38 | SVG geodesic edge |
| `HyperbolicInfoModal.tsx` | 227 | Info dialog with Escher preview |
| `data.ts` | 16 | Constants (SVG_RADIUS, DRAG_SENSITIVITY, colors) |
| `hooks/useHyperbolicNavigation.ts` | 148 | Mouse/touch/keyboard navigation |
| `hooks/useViewportRadius.ts` | 24 | Responsive container radius |
