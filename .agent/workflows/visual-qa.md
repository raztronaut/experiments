---
description: Systematic visual validation process for AI agents
---

# Visual QA Workflow

AI agents cannot see rendered output. This workflow provides systematic methods to validate visual work.

## Tools

| Tool | Command / Import | What It Does |
|------|-----------------|--------------|
| Capture script | `npm run capture <slug>` | Playwright screenshot with --delay, --scroll, --viewport, --full-page |
| ExperimentDevMetrics | Auto-injected in new layouts (dev mode) | Logs `[DevMetrics] fps=... heap=... cls=...` every 2s |
| R3FDevMetrics | `<R3FDevMetrics />` inside Canvas | Logs `[R3FMetrics] calls=... triangles=...` every 2s |
| R3FSceneInspector | `<R3FSceneInspector />` inside Canvas | Logs scene graph text tree on mount + every 10s |
| Browser MCP | `browser_navigate` + `browser_snapshot` | Interactive browser inspection |

## When to Use
- After implementing any visual experiment (shader, 3D scene, animation, effect)
- After significant visual changes to an existing experiment
- When something seems off but you can't visually confirm

## Step 1: Ensure Dev Server
```bash
npm run dev
```
The experiment must be accessible at `http://localhost:3000/experiments/<slug>`.

## Step 2: Check Console
Read the dev server terminal for:
- **Errors**: any runtime errors, hydration mismatches, missing imports
- **Warnings**: React warnings, deprecation notices
- **Dev Metrics**: `[DevMetrics]` lines for FPS, heap, CLS (auto-logged in new experiment layouts)

Metrics thresholds:
| Metric | Good | Warning | Problem |
|--------|------|---------|---------|
| FPS | >55 | 50-55 | <50 |
| JS Heap | <50MB | 50-100MB | >100MB |
| R3F draw calls | <50 | 50-100 | >100 |

## Step 3: Screenshot Capture

```bash
npm run capture <slug>                          # at load
npm run capture <slug> -- --delay 2000          # after 2s
npm run capture <slug> -- --scroll 50           # at 50% scroll
npm run capture <slug> -- --viewport 1920x1080  # custom size
```

Output saved to `output/captures/`. Path printed to stdout.

Or use the browser MCP tool for interactive inspection:
```
browser_navigate -> http://localhost:3000/experiments/<slug>
browser_snapshot
```

## Step 4: R3F Scene Inspection

Add `<R3FSceneInspector />` inside the Canvas component. Console output:
```
[SceneInspector] Scene (3 children)
  ├── AmbientLight (intensity: 0.5)
  └── Mesh "hero" (BoxGeometry 1x1x1, MeshStandardMaterial color:#ff6600)
Camera: PerspectiveCamera (fov:50, position:[0,0,5])
Stats: 2 meshes, 2 geometries, 2 materials, 24 triangles
```

Verify:
- Expected objects exist in the scene
- Materials have correct colors/properties
- Camera position and FOV make sense for the scene
- Triangle count is within budget

## Step 5: Animation Validation
For animated experiments:
1. Capture at rest state (initial)
2. Capture after delay (mid-animation or settled state)
3. For scroll-driven: capture at 0%, 50%, 100% scroll positions
4. Verify GSAP tween count is reasonable (check console)

## Step 6: Describe Expected vs. Actual
When you cannot fully verify visually, clearly state:
- **Expected**: what the experiment should look like (colors, layout, motion)
- **Implemented**: what the code produces based on your understanding
- **Uncertain**: what you cannot verify (shader output, exact colors, spatial relationships)
- **Suggest**: ask the user to validate specific aspects

## Step 7: Iterate
If metrics show problems or screenshots reveal issues:
1. Identify the likely cause
2. Make a targeted fix (2-iteration limit applies)
3. Re-run validation from Step 2
4. If stuck after 2 attempts, present alternatives

## Quick Checklist
- [ ] No console errors
- [ ] `[DevMetrics]` FPS >55, heap stable
- [ ] Memory not growing over time
- [ ] Screenshot captured
- [ ] For R3F: `[SceneInspector]` scene structure verified
- [ ] Expected visual described for user
- [ ] Reduced motion behavior tested
