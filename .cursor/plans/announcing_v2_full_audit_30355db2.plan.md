---
name: Announcing V2 Full Audit
overview: Comprehensive audit of the announcing-v2 experiment against agent rules, guidelines, and gold standard experiments (3d-crt-display, 404-not-found, basketball-replay-center). Covers 25 findings across 6 categories with specific fixes mapped to source rules and gold standard patterns.
todos:
  - id: a1-troika-crash
    content: "A1: Replace drei <Text> in ConsolePanel3D with CanvasText component; remove troika workaround from AnnouncingV2.tsx, troika type decl, and transpilePackages entries"
    status: completed
  - id: a2-console-decompose
    content: "A2: Decompose ConsolePanel3D.tsx (356 lines) into canvas/console/ sub-components: ScreenFrame, DiagnosticScreen, TelemetryScreen, TactileButton"
    status: completed
  - id: a3-crt-extract-hook
    content: "A3: Extract texture subscription/swap logic from CRTMonitor.tsx into useTextureSwap.ts hook"
    status: completed
  - id: b1-page-rsc
    content: "B1: Convert page.tsx to RSC -- remove 'use client' and dynamic import; static import of AnnouncingV2"
    status: completed
  - id: b2-b3-b4-layout
    content: "B2-B4: Fix layout.tsx -- add ThemeProvider (forced dark), suppressHydrationWarning, view-transition-name style tag"
    status: completed
  - id: b5-error-fallback
    content: "B5: Add errorFallback prop to ExperimentCanvas"
    status: completed
  - id: b7-hooks-barrel
    content: "B7: Restructure hooks/index.ts -- either flatten to hooks.ts or use direct path imports"
    status: completed
  - id: c1-reduced-motion-live
    content: "C1: Fix useDeviceCapabilities to listen for reduced-motion changes (or use usePrefersReducedMotion separately)"
    status: completed
  - id: c2-progress-perf
    content: "C2: Rewrite ProgressIndicator to use ref + transform instead of setState on scroll"
    status: completed
  - id: e1-e2-canvas-gl
    content: "E1-E2: Enable antialias: true and powerPreference: 'high-performance' in ExperimentCanvas gl config"
    status: completed
  - id: f1-reduced-motion-sections
    content: "F1: Add reduced-motion fallbacks (gsap.set) to Blueprint, Process, and Closing sections"
    status: completed
isProject: false
---

# Announcing V2: Comprehensive Audit

Cross-referenced against `.agents/rules/` (experiments, animations, r3f, shaders, scroll, performance), `.agents/profiles/mixed.md`, `.agents/contexts/architecture.md`, `memory.md`, `AGENTS.md`, and the three gold standard experiments: **3d-crt-display**, **404-not-found**, and **basketball-replay-center**.

---

## A. CRITICAL -- Must Fix

### A1. Troika Worker Crash (Runtime Error)

**File:** [ConsolePanel3D.tsx](src/components/experiments/announcing-v2/canvas/ConsolePanel3D.tsx)
**Rule:** `.agents/rules/r3f.md` -- "Error Boundaries: Wrap Canvas in an error boundary for production experiments"
**Gold standard:** 3d-crt-display uses `textureLoader.ts` and native Three.js -- zero troika dependency

`<Text>` from `@react-three/drei` uses `troika-three-text` internally. Troika creates blob-URL workers with `importScripts()` rehydration ([workerBootstrap.js](node_modules/troika-worker-utils/src/workerBootstrap.js) lines 81-98) that Turbopack breaks. The existing `preloadFont()` workaround in [AnnouncingV2.tsx](src/components/experiments/announcing-v2/AnnouncingV2.tsx) lines 32-39 does NOT force main-thread execution -- it triggers the same broken worker path.

**Fix:** Replace all `<Text>` instances (10 total) in `ConsolePanel3D.tsx` with a lightweight `CanvasText` component that renders to `THREE.CanvasTexture`. All text is static labels -- canvas rendering is ideal. Then remove the `preloadFont` import, the workaround block, the `troika-three-text` type declaration, and the `transpilePackages` entries in `next.config.ts`.

---

### A2. ConsolePanel3D.tsx Exceeds 300-Line Hard Limit (356 lines)

**File:** [ConsolePanel3D.tsx](src/components/experiments/announcing-v2/canvas/ConsolePanel3D.tsx) -- 356 lines
**Rule:** `.agents/rules/experiments.md` -- "Hard Limit: 300 lines triggers mandatory decomposition"
**Rule:** `memory.md` -- "AI agents must decompose files early: 200-line soft limit, 300-line hard limit"
**Gold standard:** 3d-crt-display's heaviest file is `CRTMonitor.tsx` at 212 lines; basketball's `ScreenPanel.tsx` is 249 lines

Contains 7 sub-components inline: `ScreenFrame`, `DiagnosticScreen`, `TelemetryScreen`, `LineWave`, `StatusLED`, `TactileButton`, plus the main `ConsolePanel3D`.

**Fix:** Extract sub-components into separate files under `canvas/console/`:

- `ScreenFrame.tsx` (~30 lines)
- `DiagnosticScreen.tsx` (~50 lines)
- `TelemetryScreen.tsx` (~70 lines, includes `LineWave`)
- `TactileButton.tsx` (~35 lines, includes `StatusLED`)
- `ConsolePanel3D.tsx` becomes a ~60-line composition

---

### A3. CRTMonitor.tsx Exceeds 200-Line Target (256 lines)

**File:** [CRTMonitor.tsx](src/components/experiments/announcing-v2/canvas/CRTMonitor.tsx) -- 256 lines
**Rule:** `.agents/rules/experiments.md` -- "Orchestrator component: ~120 target, 200 limit"
**Gold standard:** 3d-crt-display's `CRTMonitor.tsx` is 212 lines (also slightly over, but this one is worse)

**Fix:** Extract the texture subscription/swap logic (lines 124-191, 68 lines) into a custom hook: `useTextureSwap.ts`. This single extraction brings `CRTMonitor.tsx` under 200 lines and isolates the imperative Zustand subscription + GSAP glitch logic into a testable unit.

---

## B. ARCHITECTURE -- Gold Standard Deviations

### B1. page.tsx Uses `"use client"` + Dynamic Import (Should Be RSC)

**File:** [page.tsx](src/app/experiments/(announcing-v2)/announcing-v2/page.tsx)
**Gold standard pattern (all 3):**

```typescript
// Server Component -- no "use client"
import Component from "@/components/experiments/name/Component";
export default function Page() {
  return <Component />;
}
```

Announcing-v2 puts `"use client"` and `next/dynamic` on `page.tsx` itself. The gold standard keeps `page.tsx` as a thin RSC shell and moves the `dynamic()` import into the main client component if SSR: false is needed (see basketball-replay-center's `BasketballReplayCenter.tsx` line 6).

**Fix:** Remove `"use client"` and `dynamic` from `page.tsx`. Import `AnnouncingV2` statically. Since `AnnouncingV2.tsx` already has `"use client"`, it will be the client boundary. If `ssr: false` is truly needed (for Three.js/GSAP), move the dynamic import inside `AnnouncingV2.tsx` or wrap the Canvas in a client-only guard.

---

### B2. Layout Missing ThemeProvider

**File:** [layout.tsx](src/app/experiments/(announcing-v2)/layout.tsx)
**Gold standard pattern (all 3):**

```tsx
<ThemeProvider attribute="class" defaultTheme="system" disableTransitionOnChange enableSystem>
  ...
</ThemeProvider>
```

Announcing-v2 hardcodes `className="dark"` on `<html>` and has no `ThemeProvider`. This breaks system theme detection and the shared `ExperimentNav` component which may expect theme context.

**Fix:** Add `ThemeProvider` wrapping `{children}`. If the experiment must always be dark, use `defaultTheme="dark"` with `forcedTheme="dark"`.

---

### B3. Layout Missing `suppressHydrationWarning`

**File:** [layout.tsx](src/app/experiments/(announcing-v2)/layout.tsx) line 39
**Gold standard:** All three have `<html lang="en" suppressHydrationWarning>` -- required when `ThemeProvider` injects a `class` attribute client-side.

**Fix:** Add `suppressHydrationWarning` to `<html>`.

---

### B4. Layout Missing View Transition Name

**File:** [layout.tsx](src/app/experiments/(announcing-v2)/layout.tsx)
**Gold standard (3d-crt-display):** Has inline `<style>` with `view-transition-name: experiment-page-3d-crt-display`

This enables smooth cross-document view transitions when navigating between experiments.

**Fix:** Add `<style>` tag in `<head>` with `view-transition-name: experiment-page-announcing-v2`.

---

### B5. No `errorFallback` on ExperimentCanvas

**File:** [ExperimentCanvas.tsx](src/components/experiments/announcing-v2/canvas/ExperimentCanvas.tsx)
**Rule:** `.agents/rules/r3f.md` -- "Error Boundaries: Wrap Canvas in an error boundary for production experiments"
**Gold standard:** 3d-crt-display passes `errorFallback={<p>3D content unavailable.</p>}` to `ExperimentCanvas`

**Fix:** Add `errorFallback` prop to the `ToolkitCanvas` call.

---

### B6. Multiple Canvas Instances (4 Canvases)

**Files:** [ExperimentCanvas.tsx](src/components/experiments/announcing-v2/canvas/ExperimentCanvas.tsx) + Blueprint, Process, Showcase sections each create additional embedded canvases
**Rule:** `.agents/rules/performance.md` -- "16.67ms budget"; `.agents/rules/r3f.md` -- "Draw calls <50"
**Gold standard:** All three experiments use a single Canvas instance

Each WebGL context consumes GPU memory and competes for the frame budget. 4 contexts is expensive.

**Recommendation:** This is an architectural decision that may be intentional for the "mixed" profile's layer-cake pattern. If section canvases show different content from the fixed canvas, this is valid. But verify each section canvas is necessary and not duplicating scenes from the fixed canvas. Consider consolidating by using visibility toggling (via Zustand `activeSection`) within a single canvas.

---

### B7. hooks/index.ts Barrel Export

**File:** [hooks/index.ts](src/components/experiments/announcing-v2/hooks/index.ts)
**Rule:** `AGENTS.md` -- "No barrel imports from experiment components"
**Gold standard:** 3d-crt-display uses `hooks.ts` (flat file, not a barrel)

**Fix:** Rename `hooks/index.ts` to `hooks.ts` at the component root, or import hooks by direct path: `./hooks/usePrefersReducedMotion`, `./hooks/useDeviceCapabilities`.

---

## C. ANIMATION / R3F PATTERNS

### C1. `useDeviceCapabilities` Reads Once, Never Updates

**File:** [hooks/index.ts](src/components/experiments/announcing-v2/hooks/index.ts) lines 16-37
**Gold standard:** 3d-crt-display's `usePrefersReducedMotion` uses `addEventListener("change", handler)` with cleanup -- live updates when user toggles reduced motion mid-session

`useDeviceCapabilities` reads `isReducedMotion` once on mount and never listens for changes.

**Fix:** Either:

- Use `usePrefersReducedMotion()` (which already listens) separately from device detection
- Add a `change` listener for `(prefers-reduced-motion: reduce)` inside `useDeviceCapabilities`

---

### C2. ProgressIndicator Causes React Re-renders on Every Scroll Frame

**File:** [ProgressIndicator.tsx](src/components/experiments/announcing-v2/ui/ProgressIndicator.tsx)
**Rule:** `.agents/rules/scroll.md` -- "Avoid scroll-linked setState -- use refs or GSAP/Motion scroll utilities"
**Rule:** `.agents/rules/performance.md` -- "Animate transform and opacity exclusively"

Calls `setProgress(scrolled)` inside a raw `window.scroll` listener. This triggers a React re-render on every scroll frame (~60/s), updating an inline `style.width`. In a Lenis-smoothed experiment, this is doubly wasteful since Lenis already provides scroll progress.

**Fix:** Replace with a ref-based approach that updates a CSS custom property or transform directly:

```typescript
const barRef = useRef<HTMLDivElement>(null);
useEffect(() => {
  const handleScroll = () => {
    if (!barRef.current) return;
    const p = window.scrollY / (document.documentElement.scrollHeight - window.innerHeight);
    barRef.current.style.transform = `scaleX(${p})`;
  };
  window.addEventListener("scroll", handleScroll, { passive: true });
  return () => window.removeEventListener("scroll", handleScroll);
}, []);
```

Or better: use Lenis's `scroll` event (already initialized via `createUnifiedScroll`).

---

### C3. Verified: R3F Patterns Are Gold-Standard Quality

**File:** [CRTMonitor.tsx](src/components/experiments/announcing-v2/canvas/CRTMonitor.tsx)

The following patterns all match gold standard conventions:

- `useAnnouncingStore.getState()` inside `useFrame` (line 205) -- correct Zustand + R3F pattern
- `reducedMotionRef.current = reducedMotion` ref bridge (line 39) -- correct
- `paramsRef.current = crtParams` ref bridge (line 52) -- correct
- `Math.min(delta, 1/15)` delta clamping (line 215) -- correct frame-rate-independent damping
- `1 - Math.exp(-speed * d)` exponential damping (line 216) -- correct
- `useMemo(() => uniforms, [])` stable uniform objects (line 56) -- correct
- `useGLTF.preload()` at module scope (line 25) -- correct
- `useDevControls` for tunable parameters (line 41) -- correct
- Raw `store.subscribe()` for imperative texture swap (line 128) -- correct
- `glitchRef.current` as GSAP animation target (line 144) -- correct proxy object pattern
- Thorough resource disposal: geometry, GLTF traversal, materials, textures (lines 94-111, 187-190) -- correct

These are all strong and match or exceed the gold standards.

---

## D. CODE QUALITY

### D1. VolumetricLightScene.tsx Slightly Over Target (208 lines)

**File:** [VolumetricLightScene.tsx](src/components/experiments/announcing-v2/canvas/VolumetricLightScene.tsx) -- 208 lines
**Rule:** 200-line target

Only 8 lines over. The content is cohesive (volumetric post-processing is inherently complex).

**Recommendation:** Low priority. Could extract the column/floor geometry into a `Columns` sub-component if further growth occurs.

---

### D2. blueprint-section.css Is Large (325 lines)

**File:** [sections/blueprint-section.css](src/components/experiments/announcing-v2/sections/blueprint-section.css) -- 325 lines

**Recommendation:** Low priority. CSS files have looser budgets than components, and the blueprint section has extensive responsive + decorative styles. Consider splitting responsive styles into a `@layer` or extracting shared grid/crosshair patterns if the file grows further.

---

### D3. Google Fonts Loaded via `<link>` in Layout Head

**File:** [layout.tsx](src/app/experiments/(announcing-v2)/layout.tsx) lines 41-50
**Gold standard:** 3d-crt-display loads fonts via CSS `@import` in `crt-display.css`. The layout template uses `activeFont` from `@/lib/fonts`.

The `<link>` approach works but bypasses Next.js font optimization. Acceptable for experiment-specific fonts not available via `next/font`.

**Recommendation:** If Instrument Serif, DM Sans, or IBM Plex Mono are available in `next/font/google`, prefer that for better CLS and caching. Otherwise, the current `<link>` approach with `preconnect` is fine.

---

## E. PERFORMANCE

### E1. ExperimentCanvas: `antialias: false`

**File:** [ExperimentCanvas.tsx](src/components/experiments/announcing-v2/canvas/ExperimentCanvas.tsx) line 14
**Gold standard:** 3d-crt-display uses `antialias: true`; basketball uses `antialias: true`

Disabling antialiasing causes visible jagged edges on 3D geometry.

**Recommendation:** Unless this is intentional for the CRT aesthetic (where jaggedness fits), enable `antialias: true`. The performance cost is minimal with modern GPUs.

---

### E2. Missing `powerPreference: "high-performance"`

**File:** [ExperimentCanvas.tsx](src/components/experiments/announcing-v2/canvas/ExperimentCanvas.tsx) line 14
**Gold standard:** basketball-replay-center includes `powerPreference: "high-performance"` in `gl` config

For a mixed experiment with 4 canvas instances, volumetric ray marching, and particle systems, explicitly requesting high-performance GPU is important on dual-GPU laptops.

**Fix:** Add `powerPreference: "high-performance"` to `gl` config.

---

## F. ACCESSIBILITY

### F1. Reduced Motion: Partially Implemented

**Files:** PreloaderSection (via `usePreloaderTimeline`), JeskoJetsSection (GSAP.set fallback), ClosingSection (no handling), BlueprintSection (no handling), ProcessSection (no handling)
**Rule:** `.agents/rules/animations.md` -- "Always respected. Use gsap.set for fallbacks, not early returns"
**Rule:** `.agents/profiles/mixed.md` -- "prefers-reduced-motion respected in both scroll and 3D layers"
**Gold standard:** 3d-crt-display checks `reducedMotionRef.current` in both GSAP effects and `useFrame`

The preloader and JeskoJets sections handle reduced motion. Other sections with scroll-triggered animations (Blueprint, Process, Closing) do not check `prefers-reduced-motion` and may leave elements invisible (`opacity: 0`) for reduced-motion users.

**Fix:** Each section with scroll-triggered reveals must include a reduced-motion code path that uses `gsap.set` to make elements visible immediately.

---

## Summary Matrix


| ID  | Severity | Category       | File(s)                            | Rule Source               |
| --- | -------- | -------------- | ---------------------------------- | ------------------------- |
| A1  | Critical | Runtime crash  | ConsolePanel3D.tsx                 | r3f.md, performance.md    |
| A2  | Critical | Decomposition  | ConsolePanel3D.tsx (356 lines)     | experiments.md, memory.md |
| A3  | High     | Decomposition  | CRTMonitor.tsx (256 lines)         | experiments.md            |
| B1  | High     | Architecture   | page.tsx                           | Gold standard pattern     |
| B2  | High     | Architecture   | layout.tsx                         | Gold standard pattern     |
| B3  | Medium   | Architecture   | layout.tsx                         | Gold standard pattern     |
| B4  | Low      | Architecture   | layout.tsx                         | 3d-crt-display pattern    |
| B5  | High     | Error handling | ExperimentCanvas.tsx               | r3f.md                    |
| B6  | Medium   | Architecture   | Multiple files                     | performance.md, r3f.md    |
| B7  | Low      | Imports        | hooks/index.ts                     | AGENTS.md                 |
| C1  | Medium   | Accessibility  | hooks/index.ts                     | Gold standard hooks.ts    |
| C2  | High     | Performance    | ProgressIndicator.tsx              | scroll.md, performance.md |
| C3  | N/A      | Verification   | CRTMonitor.tsx                     | Passes all checks         |
| D1  | Low      | Size           | VolumetricLightScene.tsx           | experiments.md            |
| D2  | Low      | Size           | blueprint-section.css              | experiments.md            |
| D3  | Low      | Fonts          | layout.tsx                         | Gold standard pattern     |
| E1  | Medium   | Quality        | ExperimentCanvas.tsx               | Gold standard pattern     |
| E2  | Low      | Performance    | ExperimentCanvas.tsx               | Gold standard pattern     |
| F1  | High     | Accessibility  | Blueprint/Process/Closing sections | animations.md, mixed.md   |


