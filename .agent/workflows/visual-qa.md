---
description: Systematic visual validation process for AI agents
---

# Visual QA Workflow

AI agents cannot see rendered output. This workflow provides systematic methods to validate visual work, adapted from [darkroom.engineering's QA methodology](https://github.com/darkroomengineering/cc-settings/blob/main/skills/qa/SKILL.md).

## Core Philosophy

- **Screenshot first, then critique.** Always look at the actual rendered output, not just the code.
- **Be specific.** "The spacing looks off" is useless. "The gap between heading and paragraph is 32px but should be 16px" is useful.
- **Prioritize impact.** Focus on what users will actually notice.
- **Reference the intent.** Compare against design tokens, mockups, or stated goals.

## Tools (Priority Order)

| Tool | Command / Config | What It Does |
|------|-----------------|--------------|
| pinchtab | `pinchtab nav`, `pinchtab text`, `pinchtab screenshot` | AI-optimized browser automation with stable element refs. Primary tool. |
| Browser DevTools MCP | Configured in `.cursor/mcp.json` | React DevTools, console capture, Web Vitals, network, annotated screenshots |
| ExperimentDevMetrics | Auto-injected in all layouts (dev mode) | Console-piped `[DevMetrics] fps=... heap=... cls=... gsap_tweens=...` every 2s |
| R3FDevToolsInjector | Auto-injected in R3F templates (dev mode) | Console-piped `[R3FMetrics] calls=... triangles=...` + scene graph tree |
| R3FSceneInspector | Inside Canvas (via R3FDevToolsInjector) | `[SceneInspector]` scene graph text tree on mount + every 10s |
| capture.mjs | `npm run capture <slug>` | Playwright CLI screenshot with --delay, --scroll, --viewport (CI fallback) |
| ?debug | Append `?debug` to any experiment URL | Activates leva panels, GSDevTools, device info overlay, camera helpers |

## Step-by-Step

### Step 1: Navigate

```bash
pinchtab nav http://localhost:3000/experiments/<slug>
```

Or use Browser DevTools MCP to navigate. Ensure the dev server is running (`npm run dev`).

### Step 2: Token-Efficient Content Check

```bash
pinchtab text
```

Returns ~800 tokens of structured page content. Check for: runtime errors, missing elements, wrong text, broken layout structure.

### Step 3: Screenshot

```bash
pinchtab screenshot
```

Or use Browser DevTools MCP for annotated screenshots with element refs.

### Step 4: Accessibility Snapshot

```bash
pinchtab snap -i -c
```

Interactive compact accessibility tree with stable element refs (e1, e2, etc.) for reliable targeting.

### Step 5: Structured 8-Category Review

#### 1. Layout and Spacing
- Consistent spacing rhythm (on grid?)
- Alignment of related elements
- Padding consistency within components
- Container widths, no horizontal overflow
- Responsive behavior at different viewports

#### 2. Typography
- Clear heading hierarchy (h1 > h2 > h3)
- Body text line length 45-75 characters
- Line height appropriate for font size
- Font weight used consistently for same roles
- No orphans/widows in headings

#### 3. Color and Contrast
- Text meets 4.5:1 contrast ratio
- UI elements meet 3:1 contrast ratio
- Consistent brand color usage
- Hover/active state visibility
- Dark mode correctness (if applicable)

#### 4. Visual Hierarchy
- Eye flow goes to the right place first
- CTA prominence correct
- Related items visually grouped
- White space used intentionally
- Information density appropriate

#### 5. Component Quality
- Button sizing/padding consistency
- Border-radius consistency
- Icon sizing and baseline alignment
- Image aspect ratios correct
- Input field styling consistency

#### 6. Accessibility
- [ ] Images have `alt` text
- [ ] Icon buttons have `aria-label`
- [ ] Form inputs have labels
- [ ] Heading hierarchy correct
- [ ] Interactive elements >= 44x44px
- [ ] Focus indicators present

#### 7. Polish and Micro-Details
- Hover states exist on interactive elements
- Focus states for keyboard navigation
- Loading/empty/error states handled
- Transitions between states smooth
- `prefers-reduced-motion` respected

#### 8. Responsive (if multiple viewports)
- Content readable on mobile
- Touch targets >= 44px
- Navigation accessible on small screens
- No horizontal scroll
- Images not overflowing

### Step 6: Score and Report

```
## QA Report: [Experiment Name]

**Overall:** [One sentence gut reaction]
**Score:** [1-10] / 10

### Critical Issues (fix before shipping)
1. **[Category]:** [Specific issue]
   -> Fix: [Actionable recommendation]

### Should Fix
1. **[Category]:** [Issue]
   -> Fix: [Recommendation]

### Nice to Fix
1. **[Category]:** [Issue]

### What's Working Well
- [Specific praise]
```

### Step 7: Interact and Verify

```bash
pinchtab click e5
pinchtab fill e3 "test input"
pinchtab hover e5
pinchtab scroll down
pinchtab press Tab
pinchtab screenshot
```

Use element refs from the accessibility snapshot for reliable targeting.

## Known Limitation: Lenis Scroll Interception

Lenis intercepts programmatic scroll. `pinchtab scroll down`, `interaction_scroll`, and browser devtools scroll commands don't reliably trigger Lenis-based scroll-driven animations.

**Workaround**: Experiments using `createUnifiedScroll({ debug: true })` expose helpers on `window`:
- `window.__scrollToSection(index)` -- scroll to nth `section[aria-label]` element
- `window.__scrollToProgress(progress)` -- scroll to 0-1 progress value
- `window.__lenis` -- direct Lenis instance

Use via MCP eval: `eval("window.__scrollToSection(2)")` or `eval("window.__scrollToProgress(0.5)")`.

**Note on production metrics**: `ExperimentDevMetrics` and `window.__experimentMetrics` are only available in dev mode by default. They are completely absent in production builds unless the experiment's layout passes `<DevToolsInjector production />`.

## Debug Mode (`?debug`)

Append `?debug` to any experiment URL to activate:
- **Leva panel** -- Press `L` to toggle. Experiments using `useControls` get interactive parameter tweaking.
- **GSDevTools** -- GSAP timeline visualizer (SPACE=play/pause, I/O=in/out markers, H=hide). Use `useGSAPDebug(tl, "id")` to link to specific timelines.
- **Device info** -- Press `D` to toggle viewport/DPR/cores overlay
- **r3f-perf panel** -- Visual GPU/FPS/memory panel in R3F experiments
- **Camera helpers** (R3F) -- Press `O` for orbit mode (free camera + gizmo), `G` for grid helper

## R3F-Specific Validation

For R3F experiments, read the dev server terminal for:
```
[R3FMetrics] calls=12 triangles=8400 geometries=5 textures=3
[SceneInspector] Scene (3 children)
  ├── AmbientLight (intensity: 0.5)
  └── Mesh "hero" (BoxGeometry 1x1x1, MeshStandardMaterial color:#ff6600)
Camera: PerspectiveCamera (fov:50, position:[0,0,5])
Stats: 2 meshes, 2 geometries, 2 materials, 24 triangles
```

Verify: expected objects exist, materials correct, triangle count within budget, camera makes sense.

## Metrics Thresholds

| Metric | Good | Warning | Problem |
|--------|------|---------|---------|
| FPS | >55 | 50-55 | <50 |
| JS Heap | <50MB | 50-100MB | >100MB |
| CLS | <0.1 | 0.1-0.25 | >0.25 |
| R3F draw calls | <50 | 50-100 | >100 |
| GSAP active tweens | <20 | 20-50 | >50 |

## Quick Checklist

- [ ] No console errors
- [ ] `[DevMetrics]` FPS >55, heap stable
- [ ] Memory not growing over time
- [ ] Screenshot captured
- [ ] For R3F: `[SceneInspector]` scene structure verified
- [ ] For GSAP: tween count reasonable
- [ ] Accessibility snapshot reviewed
- [ ] Expected visual described for user
- [ ] `prefers-reduced-motion` tested
