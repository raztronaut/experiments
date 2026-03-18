<!-- read_when: Optimizing render, bundle, or runtime performance -->

# Performance Rules

## Frame Budget
60fps = 16.67ms per frame. Safe JS budget is ~10ms (leaves room for layout, paint, composite).

## Compositor Properties Only
Animate `transform` and `opacity` exclusively. These skip layout and paint, running on the GPU compositor thread. Animating `width`, `height`, `top`, `left`, `margin`, `padding` causes layout thrashing.

## Bundle
- Dynamic import heavy dependencies: Three.js, GSAP, R3F, Theatre.js
- No barrel imports -- use direct file imports
- Tree-shake: named exports over default where libraries support it

## Memory
- Dispose Three.js resources (geometries, materials, textures) on unmount
- Remove event listeners in cleanup functions
- Cancel animation frames, kill GSAP contexts, clear timeouts/intervals
- For R3F: `useFrame` callbacks are auto-cleaned, but manual `.dispose()` is required for Three.js objects

## Metrics Thresholds
| Metric | Good | Warning | Problem |
|--------|------|---------|---------|
| FPS | >55 | 50-55 | <50 |
| JS Heap | <50MB | 50-100MB | >100MB |
| Draw calls (R3F) | <50 | 50-100 | >100 |
| Layout shifts | 0 | 1-2 | >2 |

## Dev Metrics
`ExperimentDevMetrics` is auto-injected in new experiment layouts (dev mode only). It logs to the console every 2 seconds:
```
[DevMetrics] fps=58.3 fps_min=52 heap=23.4MB cls=0.001
```

For R3F experiments, `<R3FDevToolsInjector />` is auto-included in R3F Plop templates. It console-pipes renderer stats and scene graph text:
```
[R3FMetrics] calls=12 triangles=8400 geometries=5 textures=3
```

Append `?debug` to the URL for a visual r3f-perf panel + camera helpers. See `.agents/skills/visual-qa.md`.

## Bundle Analysis

- **Source maps**: `productionBrowserSourceMaps: true` in next.config.ts. Enables readable stack traces and DevTools source mapping in production.
- **Analyzer**: `npm run analyze` (interactive at localhost:4000) or `npm run analyze:output` (writes to `.next/diagnostics/analyze/`). Run after `npm run build`. See `docs/performance.md`.

## Error and performance monitoring

- When Sentry is enabled (DSN set), report errors from error boundaries and route `error.tsx` via `@/lib/sentry` (`captureExperimentError`). Do not log PII or secrets in Sentry extra or breadcrumbs.
