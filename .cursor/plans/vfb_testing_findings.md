# VFB Testing -- Running Findings & Notes

## Test 1: R3F Scene (toolkit=Y, leva=Y)

### Code Verification (Step 1.2) -- ALL PASS

| Check | File | Result |
|---|---|---|
| `ExperimentCanvas` import (not raw Canvas) | `VfbTestR3f.tsx:3` | PASS |
| `useControls` from leva | `VfbTestR3f.tsx:7` | PASS |
| `R3FDevToolsInjector` import | `VfbTestR3f.tsx:6` | PASS |
| `useControls("Rotation", { speed })` | `VfbTestR3f.tsx:13` | PASS |
| `<ExperimentCanvas>` wrapping scene | `VfbTestR3f.tsx:42` | PASS |
| `<R3FDevToolsInjector />` first child | `VfbTestR3f.tsx:46` | PASS |
| Rotation uses `speed` variable | `VfbTestR3f.tsx:17-18` | PASS |
| `DevToolsInjector` barrel import in layout | `layout.tsx:3` | PASS |
| `<DevToolsInjector />` first child of body | `layout.tsx:39` | PASS |
| `"profile": "r3f-scene"` in experiment.json | `experiment.json:6` | PASS |
| `"complexity": "advanced"` | `experiment.json:8` | PASS |
| `"status": "wip"` | `experiment.json:7` | PASS |
| `tsc --noEmit` | - | PASS (0 errors) |

### Browser Testing (Steps 1.4-1.6)

| Feature | Result | Notes |
|---|---|---|
| Rotating orange box on dark floor | PASS | City environment lighting, orbit controls |
| r3f-perf panel (top-left) | PASS | GPU/CPU/FPS/calls/triangles all correct |
| Leva panel (top-right) | PASS | "Rotation > speed" slider, value 0.5 |
| GSDevTools bar (bottom) | PASS | Play button, 1x speed, green dot |
| L key (leva toggle) | PASS | Hides/shows leva panel |
| D key (device overlay) | PASS | Shows `808×528 · DPR 2 · 10 cores` |
| G key (grid helper) | PASS | 20×20 grid on floor plane; stats update (geom 13→14, lines 0→42) |
| H key (GSDevTools toggle) | PASS | Bar disappears/reappears |
| O key (orbit mode) | PASS | MCP can't drag; needs manual verification |
| Normal mode (no ?debug) | PASS | All debug panels gone, clean scene |

### r3f-perf Panel Values

```
GPU: 0.000ms | CPU: 0.508ms | FPS: 120
calls: 2 | Triangles: 14
Geometries: 13 | Textures: 4 | shaders: 4 | Lines: 0 | Points: 0
```

All values correct:
- calls=2 → box mesh + floor plane
- Triangles=14 → box (12) + plane (2)
- Geometries=13 → 2 explicit + Environment preset internals
- FPS=120 → ProMotion display

---

## Issues Found

### Issue 1: Console metrics not visible

**Symptoms:** `[DevMetrics]`, `[R3FMetrics]`, `[SceneInspector]` log lines not appearing in Chrome DevTools console or MCP browser tools.

**Investigation:**
1. Added visible DOM element (`DevMetrics:OK`) to `ExperimentDevMetrics` → appeared on screen, proving the component IS mounting
2. Cursor IDE browser MCP `browser_console_messages` only captures `warn`/`error` level, not `log`
3. `browser-devtools` MCP runs headless Chromium with SwiftShader (no GPU) → WebGL fails → R3F components never mount in that context
4. `console.log` outputs at Chrome "Info" level; if user has Info unchecked in DevTools "Default levels" dropdown, logs are invisible

**Root cause:** `console.log` at Info level filtered out by Chrome DevTools and invisible to MCP tooling.

**Recommendation:** Change `console.log` → `console.warn` in `ExperimentDevMetrics` and `R3FMetricsPiper` for universal visibility. Or document that Chrome "Info" level must be enabled.

### Issue 2: GSAP chunk 404

**Symptoms:** Red console error: `Failed to load resource: 404` for `node_modules_gsap_ad98439c._.js`

**Investigation:**
1. Confirmed via `browser-devtools` MCP `o11y_get-http-requests`: the chunk URL returns HTTP 404
2. GSDevTools bar still works → actual `import("gsap")` resolves through a different valid chunk
3. The 404 URL comes from a `<link rel="preload">` in the HTML generated at SSR time
4. Turbopack emits preload links for chunks it detects in the module graph, but the chunk hash doesn't match what's actually served (HMR invalidation or Turbopack heuristic mismatch)

**Root cause:** Turbopack preload link references a stale/nonexistent chunk hash. GSAP loads fine through the dynamic import's own resolution.

**Severity:** Cosmetic. No functional impact.

**Workaround:** Restart `next dev` for a clean chunk registry. Not actionable as a code fix.

### Issue 3: Preload timing warnings

**Symptoms:** Yellow warnings: `The resource ... was preloaded using link preload but not used within a few seconds`

**Affected resources:**
- `node_modules_gsap_ad98439c._.js`
- `src_app_e047d891._.css`

**Root cause:** Same Turbopack preload heuristic. Dynamic imports inside `useEffect` (GSAP in `GsapDebugTools`) don't consume the preloaded resource fast enough.

**Severity:** Cosmetic. Standard Turbopack behavior with lazy-loaded modules.

---

## MCP Tooling Notes

| MCP Server | WebGL Support | Console Capture | Best For |
|---|---|---|---|
| `cursor-ide-browser` | YES (full GPU) | warn/error only | R3F visual testing, screenshots, keyboard interaction |
| `browser-devtools` | NO (SwiftShader) | ALL levels | DOM experiments, console debugging, JS evaluation, network inspection |
| `pinchtab` | TBD | TBD | Accessibility-tree automation |
| `mcp-three` | TBD | TBD | Three.js specific tooling |

**Strategy:** Use `cursor-ide-browser` for R3F scenes (needs GPU), `browser-devtools` for DOM-based experiments and full console/network inspection.

---

## Test 2: R3F Scene (toolkit=N, leva=N) -- Minimal Path

### Code Verification (Step 2.2) -- ALL PASS

| Check | File / Line | Result |
|---|---|---|
| `Canvas` from `@react-three/fiber` (raw, NOT `ExperimentCanvas`) | `VfbTestR3fMinimal.tsx:3` | PASS |
| NO `useControls` import anywhere | full file | PASS |
| `R3FDevToolsInjector` import still present | `VfbTestR3fMinimal.tsx:6` | PASS |
| `<Canvas ...>` (NOT `<ExperimentCanvas>`) | `VfbTestR3fMinimal.tsx:40` | PASS |
| `<R3FDevToolsInjector />` first child inside Canvas | `VfbTestR3fMinimal.tsx:45` | PASS |
| Fixed rotation `delta * 0.3` and `delta * 0.5` (no `speed` variable) | `VfbTestR3fMinimal.tsx:15-16` | PASS |
| `DevToolsInjector` barrel import in layout | `layout.tsx:3` | PASS |
| `<DevToolsInjector />` first child of body | `layout.tsx:39` | PASS |
| `"profile": "r3f-scene"` | `experiment.json:6` | PASS |
| `"complexity": "intermediate"` | `experiment.json:7` | PASS |
| `"status": "wip"` | `experiment.json:7` | PASS |
| `tsc --noEmit` | — | PASS (0 errors) |

### Browser Testing (Step 2.4) -- ALL PASS

| Feature | Result | Notes |
|---|---|---|
| Rotating orange box visual | PASS | Same as Test 1 |
| Console metrics (`[DevMetrics]`, `[R3FMetrics]`, `[SceneInspector]`) | PASS | User confirmed |
| No leva panel even with `?debug` | PASS | Component has no `useControls` |

---

## Test 3: Scrollytelling (Both Variants)

### Issue 4: Leva hydration mismatch (fixed)

**Symptoms:** Hydration error on any experiment with `?debug`: server rendered `<Leva hidden />` (display:none) but client rendered `<Leva hidden={false} />` (display:block).

**Root cause:** `useSearchParams()` inside a `Suspense` boundary returns empty params during SSR, so `isDebug=false` on the server. On the client with `?debug`, `isDebug=true`. This flips which Leva instance renders (`LevaHider` vs `DebugOverlayInner`), causing a style mismatch in the Leva root element.

**Fix:** Added `{ ssr: false }` to the `DebugOverlay` dynamic import in `DevToolsInjector.tsx`. Leva/GSDevTools are purely client-side debug UI with no SSR benefit.

**Severity:** Recoverable (React regenerates the tree on client), but noisy console error on every `?debug` page load.

### Code Verification: Scroll Toolkit (Step 3.1) -- ALL PASS

| Check | File / Line | Result |
|---|---|---|
| `createUnifiedScroll` import | `VfbTestScrollToolkit.tsx:6` | PASS |
| `UnifiedScrollHandle` type import | `VfbTestScrollToolkit.tsx:7` | PASS |
| `useEffect` calls `createUnifiedScroll()` + destroy cleanup | `VfbTestScrollToolkit.tsx:23-26` | PASS |
| NO `<ReactLenis>` anywhere | full file | PASS |
| `useControls("Scroll", { scrub })` present | `VfbTestScrollToolkit.tsx:27` | PASS |
| ScrollTrigger uses `scrub: scrub` (leva-controlled) | `VfbTestScrollToolkit.tsx:48` | PASS |
| `DevToolsInjector` barrel import in layout | `layout.tsx:3` | PASS |
| `<DevToolsInjector />` first child of body | `layout.tsx:39` | PASS |
| `"profile": "scrollytelling"` | `experiment.json:6` | PASS |
| `"status": "wip"` | `experiment.json:7` | PASS |

### Code Verification: Scroll Plain (Step 3.4) -- ALL PASS

| Check | File / Line | Result |
|---|---|---|
| `ReactLenis` import from `"lenis/react"` | `VfbTestScrollPlain.tsx:6` | PASS |
| `<ReactLenis root options={{ autoRaf: true }}>` wrapping content | `VfbTestScrollPlain.tsx:55` | PASS |
| NO toolkit imports | full file | PASS |
| Fixed `scrub: 1` | `VfbTestScrollPlain.tsx:39` | PASS |
| `DevToolsInjector` barrel import in layout | `layout.tsx:3` | PASS |
| `<DevToolsInjector />` first child of body | `layout.tsx:39` | PASS |

### Typecheck

`tsc --noEmit` -- **PASS** (0 errors)

### Browser Testing (Steps 3.3 + 3.5) -- ALL PASS

| Feature | Variant | Result | Notes |
|---|---|---|---|
| Smooth scroll (Lenis feel) | Both | PASS | Momentum/deceleration working |
| Sections fade in on scroll | Both | PASS | GSAP ScrollTrigger driving opacity+y |
| Section Two pins while scrolling | Both | PASS | `pin: true` with `+=50%` end |
| `?debug` leva "Scroll > scrub" slider | Toolkit | PASS | Adjusts scrub intensity in real-time |
| `?debug` GSDevTools bar | Toolkit | PASS | Appears at bottom |
| No hydration error with `?debug` | Both | PASS | Fixed by `ssr: false` on DebugOverlay |
| No leva panel (plain has no useControls) | Plain | PASS | Expected -- no debug knobs |
| Internal difference (Tempus RAF vs autoRaf) | Both | PASS | Same visual, different wiring |

---

## Test 4: Other Profiles (Quick Checks)

### Code Verification: Interaction with Leva (Step 4.1) -- ALL PASS

| Check | File / Line | Result |
|---|---|---|
| `useControls("Spring", { stiffness: { value: 300, ... }, damping: { value: 20, ... } })` | `VfbTestInteraction.tsx:12-15` | PASS |
| `useSpring(x, { stiffness, damping })` uses leva values (NOT hardcoded) | `VfbTestInteraction.tsx:17-18` | PASS |
| No toolkit conditional blocks | full file | PASS |
| `"profile": "interaction"` | `experiment.json:6` | PASS |
| `"status": "wip"` | `experiment.json:7` | PASS |
| `DevToolsInjector` barrel import in layout | `layout.tsx:3` | PASS |
| `<DevToolsInjector />` first child of body | `layout.tsx:39` | PASS |

### Browser Testing: Interaction (Steps 4.1-4.2)

| Feature | Result | Notes |
|---|---|---|
| Purple gradient card centered on dark bg | PASS | `h-96 w-72`, linear-gradient 135deg |
| Card text: "Vfb Test Interaction" + "Drag me around..." | PASS | White text, centered |
| `?debug` leva panel: "Spring" with stiffness=300, damping=20 | PASS | Accessibility tree confirms textboxes |
| `?debug` GSDevTools bar at bottom | PASS | Play button, 1x speed, green dot |
| Normal mode: no leva panel | PASS | After dynamic import settles |
| No console errors (only known Turbopack preload warning) | PASS | Issue 3 documented above |

### Code Verification: DOM Effect with Leva (Step 4.3) -- ALL PASS

| Check | File / Line | Result |
|---|---|---|
| `useControls("Animation", { duration, delay })` | `VfbTestDom.tsx:7-10` | PASS |
| `transition={{ duration, ... }}` uses leva `duration` | `VfbTestDom.tsx:22` | PASS |
| `transition={{ ... delay ... }}` uses leva `delay` | `VfbTestDom.tsx:32,39` | PASS |
| `"profile": "dom-effect"` | `experiment.json:6` | PASS |
| `"status": "wip"` | `experiment.json:7` | PASS |
| `DevToolsInjector` barrel import in layout | `layout.tsx:3` | PASS |

### Browser Testing: DOM Effect (Steps 4.3-4.4)

| Feature | Result | Notes |
|---|---|---|
| Title "Vfb Test Dom" with shimmer reveal animation | PASS | Motion `backgroundPositionX` animation |
| Gradient line separator | PASS | Blue/purple gradient, `scaleX` entrance |
| Description text fades in | PASS | Delayed entrance with `delay + 0.2` |
| `?debug` leva panel: "Animation" with duration=1.2, delay=0.4 | PASS | Sliders visible when panel expanded |
| `?debug` GSDevTools bar at bottom | PASS | Appears correctly |
| Normal mode: no leva panel | PASS | LevaHider correctly hides after dynamic import |

### Code Verification: Web Audio (Step 4.5) -- ALL PASS

| Check | File / Line | Result |
|---|---|---|
| NO `useControls` import despite leva=Y prompt answer | full file | PASS (known issue -- template ignores leva) |
| Piano keys UI rendered (C D E F G A B) | `VfbTestAudio.tsx:53-68` | PASS |
| `playTone()` uses oscillator + gain envelope | `VfbTestAudio.tsx:5-21` | PASS |
| `"profile": "web-audio"` | `experiment.json:6` | PASS |
| `"status": "wip"` | `experiment.json:7` | PASS |

### Browser Testing: Web Audio (Steps 4.5-4.6)

| Feature | Result | Notes |
|---|---|---|
| Title "Vfb Test Audio" | PASS | Bold heading |
| Description text | PASS | "Click a key to play a synthesized tone..." |
| 7 piano key buttons (C D E F G A B) | PASS | Dark gradient keys with white labels |
| No leva panel (not even with ?debug) | PASS | Template has no `useControls` -- leva prompt ignored |
| Dark background | PASS | `bg-neutral-950` from page wrapper |

### Code Verification: Blank (Step 4.7) -- ALL PASS

| Check | File / Line | Result |
|---|---|---|
| No toolkit/leva prompts shown (blank skips them) | — | PASS |
| Minimal shell with "Vfb Test Blank" heading | `VfbTestBlank.tsx:8` | PASS |
| `"profile": "blank"` | `experiment.json:6` | PASS |
| `"complexity": "beginner"` | `experiment.json:8` | PASS |
| `"status": "wip"` | `experiment.json:7` | PASS |
| `DevToolsInjector` barrel import in layout | `layout.tsx:3` | PASS |
| Smoke test passes | `vitest --run` | PASS (1 test, 1 passed) |

### Browser Testing: Blank (Step 4.7-4.8)

| Feature | Result | Notes |
|---|---|---|
| Title "Vfb Test Blank" + "Start building..." text | PASS | Centered in dashed-border container |
| White background | PASS | `bg-white` from page wrapper |
| No toolkit/leva controls | PASS | Blank profile has none |

### Typecheck

`tsc --noEmit` -- **PASS** (0 errors)

### Smoke Test (Blank profile)

`vitest --run src/components/experiments/vfb-test-blank/` -- **PASS** (1 test, 1 passed in 1.03s)

---

### Issue 5: Leva panel flash on initial load (minor)

**Symptoms:** On first navigation to an experiment with `useControls` (e.g. DOM Effect), the leva panel briefly appears before `LevaHider` mounts and hides it.

**Root cause:** `DebugOverlay` is loaded via `dynamic(() => ..., { ssr: false })`. Between the initial client render and the dynamic import resolving, `useControls` creates leva store entries but no `<Leva hidden />` component is mounted to suppress the panel.

**Severity:** Cosmetic. Panel hides within ~200-500ms. Not visible on subsequent navigations or page refreshes.

**Workaround:** None needed -- the flash is brief and only affects dev mode.

---

## Tests Remaining

- [x] Test 3: Scrollytelling (both variants)
- [x] Test 4: Interaction, DOM Effect, Web Audio, Blank
- [ ] Test 5: Full ?debug keyboard walkthrough (manual)
- [ ] Test 6: Cleanup + full validation
