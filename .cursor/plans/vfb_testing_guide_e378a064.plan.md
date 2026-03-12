---
name: VFB Testing Guide
overview: Step-by-step testing guide for the Visual Feedback Bridge. Each test clearly marks what the AI does (scaffold, read, verify code), what you do (browser testing, visual checks), and where to pause for handoff.
todos:
  - id: test-r3f-full
    content: "Test 1: R3F Scene (toolkit+leva) -- scaffold, code verify, browser test, ?debug walkthrough"
    status: pending
  - id: test-r3f-minimal
    content: "Test 2: R3F Scene (no toolkit, no leva) -- scaffold, verify raw Canvas path"
    status: pending
  - id: test-scrollytelling
    content: "Test 3: Scrollytelling both variants -- toolkit vs ReactLenis, smooth scroll verification"
    status: pending
  - id: test-other-profiles
    content: "Test 4: Interaction, DOM Effect, Web Audio, Blank -- leva wiring, prompt behavior"
    status: pending
  - id: test-debug-features
    content: "Test 5: Full ?debug walkthrough -- leva, GSDevTools, device info, orbit, grid, r3f-perf"
    status: pending
  - id: test-cleanup-validate
    content: "Test 6: Delete all test experiments, run full validation pipeline"
    status: pending
isProject: false
---

# Visual Feedback Bridge -- Testing Guide

Each test is divided into:

- **AI does** -- commands to run, code to read and verify (automated)
- **You do** -- browser testing, visual checks, interaction testing (manual)
- **PAUSE** -- where the AI stops and waits for your confirmation before continuing

---

## Setup

**AI does:** Start the dev server if not already running.

```bash
npm run dev
```

**You do:** Confirm the dev server is running at `http://localhost:3000`.

---

## Test 1: R3F Scene (toolkit=yes, leva=yes) -- The Full Feature Test

This is the most comprehensive test. It exercises every VFB feature at once.

### Step 1.1: Scaffold

**AI does:**

```bash
npm run new:experiment
```

Answers: name=`vfb test r3f`, description=`VFB test`, complexity=`Advanced`, profile=`R3F Scene`, toolkit=`Y`, leva=`Y`

### Step 1.2: Verify Generated Code

**AI does:** Read `src/components/experiments/vfb-test-r3f/VfbTestR3f.tsx` and check:

- `import { ExperimentCanvas } from "@/lib/toolkit/r3f"` present (NOT raw `Canvas`)
- `import { useControls } from "leva"` present
- `import { R3FDevToolsInjector } from "@/components/dev/R3FDevToolsInjector"` present
- `const { speed } = useControls("Rotation", { speed: { value: 0.5, ... } })` present
- `<ExperimentCanvas ...>` wrapping the scene (NOT `<Canvas>`)
- `<R3FDevToolsInjector />` first child inside the canvas
- Rotation uses `speed` variable: `meshRef.current.rotation.y += delta * speed`

**AI does:** Read `src/app/experiments/(vfb-test-r3f)/layout.tsx` and check:

- `import { DevToolsInjector } from "@/components/dev"` (barrel import, NOT full path)
- `<DevToolsInjector />` as first child of `<body>`

**AI does:** Read `src/app/experiments/(vfb-test-r3f)/experiment.json` and check:

- `"profile": "r3f-scene"`
- `"complexity": "advanced"`
- `"status": "wip"`

**AI does:** Run typecheck:

```bash
npm run typecheck
```

### Step 1.3: PAUSE -- Report findings to you

**AI reports:** Whether all code checks passed. Lists any unexpected content.

### Step 1.4: Browser Test -- Normal Mode

**You do:** Open `http://localhost:3000/experiments/vfb-test-r3f` in Chrome. Check:

1. **Visual:** Rotating orange box on dark floor, city environment lighting, orbit controls work (drag to rotate view)
2. **Console (F12 > Console):** Look for these lines appearing every 2 seconds:
  - `[DevMetrics] fps=XX fps_min=XX heap=XXmb cls=X` -- FPS, memory, layout shift
  - `[R3FMetrics] calls=XX triangles=XX geometries=XX textures=XX` -- R3F renderer stats
3. **Console (on first load):** Look for `[SceneInspector]` with a tree showing AmbientLight, DirectionalLight, meshes, camera info, and triangle stats
4. **No errors** in console (red text)

### Step 1.5: Browser Test -- ?debug Mode

**You do:** Navigate to `http://localhost:3000/experiments/vfb-test-r3f?debug`. Check each feature:


| Feature                   | How to Test                  | Expected Result                                                                          |
| ------------------------- | ---------------------------- | ---------------------------------------------------------------------------------------- |
| **r3f-perf panel**        | Should appear automatically  | Small stats panel top-left showing FPS, GPU, memory                                      |
| **Leva panel**            | Should appear automatically  | Collapsed panel with "Rotation" folder containing "speed" slider                         |
| **Leva slider**           | Drag the "speed" slider to 0 | Box stops rotating. Drag to 3 -- box spins fast.                                         |
| **Leva toggle (L)**       | Press `L` key                | Panel disappears. Press `L` again -- reappears.                                          |
| **GSDevTools**            | Should appear automatically  | Timeline scrubber bar at bottom of screen (minimal mode)                                 |
| **GSDevTools toggle (H)** | Press `H` key                | Bar disappears. Press `H` again -- reappears.                                            |
| **Device info (D)**       | Press `D` key                | Green monospace overlay appears top-right: `WxH . DPR X . N cores`                       |
| **Device info toggle**    | Press `D` again              | Overlay disappears.                                                                      |
| **Orbit mode (O)**        | Press `O` key                | OrbitControls activate -- drag to freely rotate camera. Gizmo cube appears bottom-right. |
| **Orbit toggle**          | Press `O` again              | Back to default camera position.                                                         |
| **Grid helper (G)**       | Press `G` key                | Dark gray 20x20 grid appears on the floor plane.                                         |
| **Grid toggle**           | Press `G` again              | Grid disappears.                                                                         |


### Step 1.6: Browser Test -- Normal Mode (no ?debug)

**You do:** Remove `?debug` from URL (plain `http://localhost:3000/experiments/vfb-test-r3f`). Verify:

- No leva panel visible (even though the component uses `useControls`)
- No GSDevTools bar
- No r3f-perf panel
- No camera helpers
- Console metrics still log (those are dev-mode, not ?debug-gated)

### Step 1.7: PAUSE -- Report what worked and what didn't

**You report:** Which features passed/failed from the table above.

---

## Test 2: R3F Scene (toolkit=no, leva=no) -- Minimal Path

### Step 2.1: Scaffold

**AI does:**

```bash
npm run new:experiment
```

Answers: name=`vfb test r3f minimal`, description=`VFB minimal test`, complexity=`Intermediate`, profile=`R3F Scene`, toolkit=`N`, leva=`N`

### Step 2.2: Verify Generated Code

**AI does:** Read `VfbTestR3fMinimal.tsx` and check:

- `import { Canvas } from "@react-three/fiber"` (raw Canvas, NOT ExperimentCanvas)
- NO `import { useControls }` anywhere
- `import { R3FDevToolsInjector }` still present
- `<Canvas ...>` (NOT ExperimentCanvas)
- `<R3FDevToolsInjector />` still inside Canvas
- Fixed rotation: `delta * 0.3` and `delta * 0.5` (no `speed` variable)

### Step 2.3: PAUSE -- Report

**AI reports:** Code check results. Notes any differences from expected.

### Step 2.4: Quick Browser Check

**You do:** Open `http://localhost:3000/experiments/vfb-test-r3f-minimal`:

- Same rotating box visual as Test 1
- Console shows `[DevMetrics]`, `[R3FMetrics]`, `[SceneInspector]`
- No leva panel even with `?debug` (component doesn't use `useControls`)

---

## Test 3: Scrollytelling (Both Variants)

### Step 3.1: With Toolkit

**AI does:** Scaffold with name=`vfb test scroll toolkit`, profile=`Scrollytelling`, toolkit=`Y`, leva=`Y`

**AI does:** Read component and check:

- `import { createUnifiedScroll } from "@/lib/toolkit/scroll"` present
- `import type { UnifiedScrollHandle } from "@/lib/toolkit/scroll"` present
- `useEffect` that calls `createUnifiedScroll()` and returns `scrollRef.current?.destroy()`
- NO `<ReactLenis>` anywhere
- `useControls("Scroll", { scrub })` present
- ScrollTrigger uses `scrub: scrub` (leva-controlled)

### Step 3.2: PAUSE -- Report code checks

### Step 3.3: Browser Test

**You do:** Open the experiment:

- Smooth scroll should work (Lenis feel -- momentum, smooth deceleration)
- Sections should fade in on scroll
- Second section should pin and stay fixed while scrolling through it
- With `?debug`: leva "Scroll > scrub" slider should adjust scrub intensity. GSDevTools bar appears but NOTE: it won't control scroll-driven animations (GSAP limitation).
- Console: `[DevMetrics]` with `gsap_tweens=N` (GSAP is loaded in this profile)

### Step 3.4: Without Toolkit

**AI does:** Scaffold with name=`vfb test scroll plain`, profile=`Scrollytelling`, toolkit=`N`, leva=`N`

**AI does:** Read component and check:

- `import { ReactLenis } from "lenis/react"` present
- `<ReactLenis root options={{ autoRaf: true }}>` wrapping content
- NO toolkit imports
- Fixed `scrub: 1`

### Step 3.5: PAUSE -- Report. Then:

**You do:** Open the experiment:

- Same visual behavior as 3.3 (smooth scroll, pinning, fading)
- The difference is internal (ReactLenis autoRaf vs Tempus unified RAF)

---

## Test 4: Other Profiles (Quick Checks)

### Step 4.1: Interaction with Leva

**AI does:** Scaffold name=`vfb test interaction`, profile=`Interaction`, toolkit=N/A, leva=`Y`

**AI does:** Read component and check:

- `useControls("Spring", { stiffness: { value: 300, ... }, damping: { value: 20, ... } })` present
- `useSpring(x, { stiffness, damping })` uses leva values (NOT hardcoded)
- No toolkit conditional blocks (interaction has none)

### Step 4.2: PAUSE -- Report

**You do:** Open experiment. Drag the card -- it springs back. With `?debug`: adjust stiffness/damping sliders and drag again -- spring behavior should change in real-time.

### Step 4.3: DOM Effect with Leva

**AI does:** Scaffold name=`vfb test dom`, profile=`DOM Effect`, leva=`Y`

**AI does:** Read component and check:

- `useControls("Animation", { duration, delay })` present
- `transition={{ duration, ... }}` and `transition={{ ... delay ... }}` use leva values

### Step 4.4: PAUSE -- Report

**You do:** Open experiment. Text shimmer animation plays. With `?debug`: adjust duration/delay and refresh -- animation timing should change.

### Step 4.5: Web Audio

**AI does:** Scaffold name=`vfb test audio`, profile=`Web Audio`, leva=`Y`

**AI does:** Read component and check:

- NO `useControls` import despite answering `Y` to leva prompt (template ignores it -- known issue)
- Piano keys UI rendered

### Step 4.6: PAUSE -- Report the leva prompt being ignored

**You do:** Open experiment. Click piano keys -- they should produce synthesized tones.

### Step 4.7: Blank

**AI does:** Scaffold name=`vfb test blank`, profile=`Blank`

**AI does:** Verify:

- No toolkit/leva prompts were shown (blank skips them)
- Component has minimal shell with `{{titleCase name}}` rendered as text
- Run the smoke test:

```bash
npx vitest --run src/components/experiments/vfb-test-blank/
```

- Smoke test should PASS (unlike R3F profiles)

### Step 4.8: PAUSE -- Report test result

---

## Test 5: Full ?debug Feature Walkthrough

This test uses the R3F experiment from Test 1 (or any R3F experiment still scaffolded).

### Step 5.1: AI Preparation

**AI does:** Confirm the test R3F experiment still exists. If deleted, re-scaffold it.

### Step 5.2: PAUSE -- Handoff for manual testing

**You do:** Full keyboard shortcut walkthrough on `http://localhost:3000/experiments/vfb-test-r3f?debug`:

**Checklist (go through each one):**

- Page loads with all debug panels visible
- r3f-perf panel shows FPS/GPU/memory data top-left
- Leva panel shows "Rotation > speed" slider
- Adjusting speed slider changes rotation speed in real-time
- Press `L` -- leva hides. Press `L` -- leva shows.
- Press `D` -- device overlay appears. Press `D` -- disappears.
- Press `O` -- orbit mode. Drag to rotate view. Gizmo visible.
- Press `O` -- back to main camera.
- Press `G` -- grid appears. Press `G` -- grid gone.
- Press `H` -- GSDevTools hides. Press `H` -- shows.
- Press SPACE -- animation play/pause (GSDevTools)
- Remove `?debug` from URL -- ALL debug panels gone, only console metrics remain

**Report which items passed/failed.**

---

## Test 6: Cleanup + Full Validation

### Step 6.1: Delete All Test Experiments

**AI does:**

```bash
npm run delete:experiment vfb-test-r3f
npm run delete:experiment vfb-test-r3f-minimal
npm run delete:experiment vfb-test-scroll-toolkit
npm run delete:experiment vfb-test-scroll-plain
npm run delete:experiment vfb-test-interaction
npm run delete:experiment vfb-test-dom
npm run delete:experiment vfb-test-audio
npm run delete:experiment vfb-test-blank
```

(Only delete ones that were actually scaffolded.)

### Step 6.2: Full Validation Pipeline

**AI does:** Run each and report results:

```bash
npm run validate:experiments   # 18 experiments valid
npm run typecheck              # 0 errors
npm run lint                   # 0 issues
npx vitest --run --project unit  # 5 tests pass
npm run build                  # Success, all routes present
```

### Step 6.3: PAUSE -- Final Report

**AI reports:** Full validation results. Whether the codebase is clean after all test experiments are removed.

---

## Known Issues (Reference)

These are expected behaviors, not bugs:

1. **Smoke test failures for R3F/scrollytelling** -- The shared test template checks for visible `titleCase` text. R3F renders into Canvas (no DOM text). Scrollytelling renders section titles, not the experiment title. Tests for blank/interaction/dom-effect/web-audio profiles should pass.
2. **GSDevTools + ScrollTrigger** -- Per [GSAP docs](https://gsap.com/docs/v3/Plugins/GSDevTools/), GSDevTools cannot control ScrollTrigger-driven animations. The bar appears but won't scrub scroll animations. Use `useGSAPDebug(tl, "id")` for non-scroll timelines.
3. **web-audio ignores leva/toolkit prompts** -- The prompts show but the template has no `{{#if}}` blocks. Minor UX inconsistency.
4. `**gsap_tweens` in console output** -- Only appears when GSAP is loaded in the experiment. Non-GSAP experiments show the standard `[DevMetrics]` line without it.

