# Visual QA for AI Agents

> How to validate visual output when you cannot see the screen

## The Problem
AI agents write shaders, 3D scenes, animations, and complex visual effects but cannot see the rendered output. This skill teaches systematic visual validation.

## Tools Available

| Tool | Import / Command | Purpose |
|------|-----------------|---------|
| `scripts/capture.mjs` | `npm run capture <slug>` | Playwright screenshot capture with delay, scroll, viewport options |
| `ExperimentDevMetrics` | `@/components/dev/ExperimentDevMetrics` | Console-piped FPS, heap, CLS every 2s (auto-injected in new experiment layouts) |
| `R3FDevMetrics` | `@/components/dev/R3FDevMetrics` | Console-piped draw calls, triangles, geometries, textures (inside Canvas) |
| `R3FSceneInspector` | `@/components/dev/R3FSceneInspector` | Scene graph text tree logged to console (inside Canvas) |

## Method 1: Screenshot Capture

```bash
npm run capture <slug>                          # screenshot at load
npm run capture <slug> -- --delay 2000          # wait 2s for animations
npm run capture <slug> -- --scroll 50           # at 50% scroll
npm run capture <slug> -- --viewport 1920x1080  # custom viewport
npm run capture <slug> -- --full-page           # full page capture
```

Screenshots are saved to `output/captures/`. The path is printed to stdout.

You can also use the browser MCP tool for interactive inspection:
```
browser_navigate -> http://localhost:3000/experiments/<slug>
browser_snapshot
```

## Method 2: Console Dev Metrics

New experiments automatically include `ExperimentDevMetrics` in their layout (dev mode only). Console output:
```
[DevMetrics] fps=58.3 fps_min=52 heap=23.4MB cls=0.001
```

For R3F experiments, add `<R3FDevMetrics />` inside the Canvas for renderer stats:
```
[R3FMetrics] calls=12 triangles=8400 geometries=5 textures=3
```

Metrics thresholds:
| Metric | Good | Warning | Problem |
|--------|------|---------|---------|
| FPS | >55 | 50-55 | <50 |
| JS Heap | <50MB | 50-100MB | >100MB |
| R3F draw calls | <50 | 50-100 | >100 |

## Method 3: R3F Scene Inspector

Add `<R3FSceneInspector />` inside the Canvas to get a text scene graph logged to console:
```
[SceneInspector] Scene (3 children)
  ├── AmbientLight (intensity: 0.5)
  ├── DirectionalLight (position: [10, 10, 5])
  └── Group "main" (2 children)
      ├── Mesh "hero" (BoxGeometry 1x1x1, MeshStandardMaterial color:#ff6600)
      └── Mesh "floor" (PlaneGeometry 10x10, MeshStandardMaterial color:#333333)
Camera: PerspectiveCamera (fov:50, position:[0,0,5])
Stats: 2 meshes, 2 geometries, 2 materials, 24 triangles
```

Logs on mount and every 10 seconds.

## Validation Workflow
1. **Build** the component
2. **Ensure** dev server is running (`npm run dev`)
3. **Capture** screenshot via `npm run capture` or browser MCP tool
4. **Check console** for `[DevMetrics]` and `[R3FMetrics]` output
5. **For R3F**: add `<R3FSceneInspector />` to verify scene structure
6. **For animations**: capture at multiple points (0%, 50%, 100% progress)
7. **Describe** expected vs. actual visual. If something seems off, state what you expected and iterate.

## When Visual Honesty Applies
- Shaders: you cannot verify color output, gradients, or noise patterns. Describe the expected visual and suggest the user validate.
- 3D positioning: you can verify via scene inspector data, but spatial relationships may be surprising. Acknowledge uncertainty.
- Animations: timing can be verified via metrics, but "feel" cannot. Provide parameters and let the user tune.
- CSS effects: layout can be verified via DOM inspection, but visual effects (blur, blend modes, shadows) need visual confirmation.

## Pre-Submit Checklist
- [ ] No console errors in dev terminal
- [ ] `[DevMetrics]` shows FPS >55, heap stable
- [ ] No memory leaks (heap not growing over time)
- [ ] For R3F: `[SceneInspector]` shows expected scene structure
- [ ] Expected visual described clearly for user
- [ ] Screenshot captured via `npm run capture`
