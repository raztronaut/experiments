---
name: visual-qa
description: "Visual QA workflow for experiments. 8-category structured review using pinchtab, dev metrics, and ?debug mode. Use when reviewing or debugging experiment visual output."
---

# Visual QA for AI Agents

> Systematic visual validation when you cannot see the screen. Adapted from [darkroom.engineering's QA methodology](https://github.com/darkroomengineering/cc-settings/blob/main/skills/qa/SKILL.md).

## The Problem

AI agents write shaders, 3D scenes, animations, and complex visual effects but cannot see the rendered output. This skill teaches systematic visual validation using proven tools.

## Tools Available

| Tool | Command / Config | Purpose |
|------|-----------------|---------|
| **pinchtab** | `pinchtab nav/text/screenshot/snap/click` | Primary browser automation. Token-efficient (~800 tokens/page). Stable element refs. |
| **Browser DevTools MCP** | Configured in `.cursor/mcp.json` | React DevTools, console, network, Web Vitals, annotated screenshots |
| **ExperimentDevMetrics** | Auto-injected (dev mode) | FPS, heap, CLS, GSAP tweens every 2s. Console (warn level) + `window.__experimentMetrics` |
| **R3FDevToolsInjector** | Auto-injected in R3F templates | R3F draw calls, triangles + scene graph text tree. Piped to `window.__experimentMetrics.r3f` + `.scene` |
| **Queryable metrics** | `eval("JSON.stringify(window.__experimentMetrics)")` | On-demand structured JSON via any MCP browser tool (pinchtab, browser-devtools). No need to wait for 2s interval. |
| **capture.mjs** | `npm run capture <slug>` | Playwright CLI screenshot (CI/scripting fallback) |
| **?debug** | Append to experiment URL | Leva panel (L), GSDevTools, r3f-perf panel, device info (D), camera helpers (O/G) |

## Method 1: pinchtab (Primary -- Token Efficient)

```bash
pinchtab nav http://localhost:3000/experiments/<slug>
pinchtab text                  # ~800 tokens, structured content check
pinchtab screenshot            # visual inspection
pinchtab snap -i -c            # interactive compact accessibility tree
pinchtab click e5              # interact via element ref
pinchtab fill e3 "query"       # fill input
pinchtab hover e5              # hover states
pinchtab scroll down           # below-fold content
```

## Method 2: Console Dev Metrics

All experiments auto-include `ExperimentDevMetrics` in dev mode. Console output:
```
[DevMetrics] fps=58.3 fps_min=52 heap=23.4MB cls=0.001 gsap_tweens=3
```

R3F experiments also log:
```
[R3FMetrics] calls=12 triangles=8400 geometries=5 textures=3
```

| Metric | Good | Warning | Problem |
|--------|------|---------|---------|
| FPS | >55 | 50-55 | <50 |
| JS Heap | <50MB | 50-100MB | >100MB |
| CLS | <0.1 | 0.1-0.25 | >0.25 |
| R3F draw calls | <50 | 50-100 | >100 |
| GSAP active tweens | <20 | 20-50 | >50 |

## Method 3: R3F Scene Inspector

R3F experiments log a scene graph text tree via `R3FSceneInspector`:
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

## Known Limitation: Lenis Scroll Interception

Lenis intercepts programmatic scroll. `pinchtab scroll down` and browser devtools scroll commands don't reliably trigger Lenis-based animations.

**Workaround**: Experiments using `createUnifiedScroll({ debug: true })` expose:
- `window.__scrollToSection(index)` -- scroll to nth `section[aria-label]`
- `window.__scrollToProgress(progress)` -- scroll to 0-1 progress
- `window.__lenis` -- direct Lenis instance

Use via MCP eval: `eval("window.__scrollToSection(2)")`.

**Note on production metrics**: `ExperimentDevMetrics` and `window.__experimentMetrics` are only available in dev mode by default. Absent in production unless `<DevToolsInjector production />` is used.

## Method 4: ?debug Mode

Append `?debug` to any experiment URL for visual debug tools:
- **Leva panel** -- Press `L` to toggle. Experiments using `useControls` get interactive parameter tweaking.
- **GSDevTools** -- GSAP timeline scrubbing, slow-mo, scene jumping (SPACE, I/O, H keys). Use `useGSAPDebug(tl, "id")` to link to specific timelines.
- **r3f-perf** -- Visual GPU/FPS/memory panel (R3F experiments)
- **Camera helpers** (R3F) -- Press `O` for orbit mode, `G` for grid
- **Device info** -- Press `D` for viewport/DPR/cores overlay

## Structured Review (8 Categories)

When doing thorough QA, evaluate against these categories:

1. **Layout/Spacing** -- Grid alignment, padding consistency, no overflow
2. **Typography** -- Hierarchy, line length 45-75 chars, weight consistency
3. **Color/Contrast** -- 4.5:1 text, 3:1 UI, consistent brand colors
4. **Visual Hierarchy** -- Eye flow, CTA prominence, grouping, white space
5. **Components** -- Button sizing, border-radius, icon alignment
6. **Accessibility** -- Alt text, aria-labels, focus order, 44px touch targets
7. **Polish** -- Hover/focus states, loading states, transitions
8. **Responsive** -- Mobile readability, touch targets, no horizontal scroll

Score: 1-10 with Critical / Should fix / Nice to fix / What's working well.

## When Visual Honesty Applies

- **Shaders**: Cannot verify color output or noise patterns. Describe expected visual, suggest user validate.
- **3D positioning**: Verify via scene inspector data, but acknowledge spatial uncertainty.
- **Animations**: Timing verified via metrics, but "feel" cannot. Provide parameters for user tuning.
- **CSS effects**: Layout via DOM inspection, but blur/blend/shadow need visual confirmation.

## Pre-Submit Checklist

- [ ] No console errors in dev terminal
- [ ] `[DevMetrics]` FPS >55, heap stable
- [ ] No memory leaks (heap not growing)
- [ ] For R3F: `[SceneInspector]` expected structure
- [ ] For GSAP: tween count reasonable
- [ ] pinchtab screenshot or Browser DevTools screenshot captured
- [ ] Expected visual described clearly for user
- [ ] `prefers-reduced-motion` respected
