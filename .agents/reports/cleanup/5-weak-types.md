# Weak Types Report

_Read-only research pass. No source files were modified. Verified against `node_modules/@types/three@0.183.1`, `node_modules/@react-three/fiber@9`, and `node_modules/gsap@3.14` type declarations._

## Critical Assessment

Overall type-safety health is **good**: `type-coverage` reports **99.39% (52,970 / 53,293)**, ~323 weak identifiers. After excluding generated/config noise the actionable surface is smaller and clustered, not diffuse:

- `.next/dev/types/validator.ts` (lines 315–323, 9 spots) is **Next.js-generated** — ignore, it regenerates.
- `vitest.config.ts` (5 spots) and `src/setupTests.ts` (~11 spots) are **test infra** reading untyped JSON/globals — low priority.

The codebase already follows the AGENTS.md "`unknown` and narrow" rule in the right places: `src/lib/experiments.ts`, `src/lib/structured-data.ts`, `src/hooks/useWeather.ts` (catch), `src/hooks/useDevControls.ts`, and several `*.test.ts` files use `unknown` deliberately. Those are healthy and should stay.

The real weak-type debt concentrates in **four hotspots**, in priority order:

1. **`src/components/experiments/shader-landing/useThreeShader.ts`** — single `window.THREE as any` (line 73) cascades into **~70 weak spots** (lines 73–136). This one file is the single largest contributor to the count. It loads Three.js **r89 from a CDN**, so `@types/three` doesn't match the runtime API.
2. **Shader uniform `.value` reads (~50+ spots)** — `ScreenPanel.tsx`, `DistortionPass.tsx`, `CRTMonitor.tsx`, `CursorDepthExplorer.tsx`, `VisualiserLogic.ts`, `Gallery.ts`, `usePreloaderTimeline.ts`. Root cause is **structural, not a mistake**: `@types/three` declares `IUniform<TValue = any>` (`@types/three/src/renderers/shaders/UniformsLib.d.ts:6`), and `ShaderMaterial.uniforms` is `{ [uniform: string]: IUniform }`, so every `material.uniforms.uX.value` resolves to `any`.
3. **Dynamic/global boundaries with raw `any`** — `R3FSceneInspector.tsx` (dev tool, 4× `as any`), `useGSAPDebug.ts` + `DebugOverlay.tsx` (`useRef<any>`), `CursorDepthExplorer.tsx` (iOS `DeviceOrientationEvent`), `window.requestIdleCallback`/`window.surpriseMe` shims.
4. **JSON/data ingestion** — `useWeather.ts`, `articles.ts`, `experiments.ts`, worker `onmessage` in the two `LifeSimulation.tsx` files.

Note: the entire `announcing-v2` experiment (incl. `MissionControlCanvas.tsx` `: any` params and `TelemetryScreen.tsx` `ref={lineRef as any}`) is **staged for deletion** in the current working tree — do not spend effort typing it.

Counts of explicit weak constructs found via grep (live source, excluding `announcing-v2`):
- `as any` / `<any>`: **~21**
- `: any` annotations: **~8**
- `as unknown as`: **~10**
- `: unknown` (correct, keep): **~13**
- `@ts-ignore` (1) + `@ts-expect-error` (2): **3**
- Non-null assertions (`!.` / `x!`): **handful** (`timeline!`, `getContext("2d")!`)

---

## Recommendations

### 1. Shader uniform `.value` cluster — typed uniforms object

**Confidence: High** (mechanism), **Medium** (per-file effort)

**Files / lines (representative):**
- `src/components/experiments/basketball-replay-center/ScreenPanel.tsx:189,190,212,213,222,223,231`
- `src/components/experiments/basketball-replay-center/DistortionPass.tsx:163,165,175,180,199`
- `src/components/experiments/basketball-replay-center/usePreloaderTimeline.ts:64,66`
- `src/components/experiments/3d-crt-display/canvas/CRTMonitor.tsx:167,168,169,170`
- `src/components/experiments/cursor-depth-explorer/CursorDepthExplorer.tsx:106,107,163,165,209`
- `src/components/experiments/rabbithole-chat-gallery-explore/VisualiserLogic.ts:243,265,419–423,557,566,580,591,592`
- `src/components/experiments/rabbithole-chat-preloader/Gallery.ts:322,337,360,362,363`

**Root cause (verified):** `@types/three/src/renderers/shaders/UniformsLib.d.ts:6` →
```ts
export interface IUniform<TValue = any> { value: TValue }
```
`ShaderMaterial.uniforms: { [uniform: string]: IUniform }` therefore yields `any` on `.value`.

**Exact replacement:** Define the uniform shape once per material and **read/write through that typed object** (which these components already create with `useMemo`), rather than through `material.uniforms.*`. Two strong options:

```ts
import type { IUniform, Texture, Vector2 } from "three";

// Option A — name the shape, type each uniform's value:
interface ScreenUniforms {
  uTime: IUniform<number>;
  uTexture: IUniform<Texture | null>;
  uHasTexture: IUniform<number>;
  uBgColor: IUniform<Color>;
  uIsDark: IUniform<number>;
}
const uniforms = useMemo<ScreenUniforms>(() => ({ /* ... */ }), [deps]);
```
Then either keep a `useRef<ScreenUniforms>(uniforms)` and mutate `uniformsRef.current.uTime.value` (fully typed), **or** cast the material's bag at the boundary: `(materialRef.current.uniforms as ScreenUniforms).uTime.value`. Prefer the ref-to-the-object approach — it removes the `any` entirely and is the pattern in `.agents/rules/shaders.md` ("ShaderMaterial Pattern").

**Visual-validation note:** WebGL — agents cannot see output. These edits are type-only; verify the shaders still render (texture swap on `ScreenPanel`, distortion on `DistortionPass`, CRT scanlines) after the change, since a wrong value type (e.g. `Color` vs `Vector3`) could silently change `.set()` behavior.

---

### 2. `useThreeShader.ts` — CDN Three.js r89 `as any`

**Confidence: Medium** (this is the highest-count single file, but it's a genuine third-party/version-mismatch boundary)

**File / line:** `src/components/experiments/shader-landing/useThreeShader.ts:73` (`const THREE = window.THREE as any;`) — cascades to ~70 weak spots (73–136).

**Why `any` is _almost_ justified:** It deliberately loads **three r89 from a CDN** (`THREE_CDN_URL`, line 26) whose API (`PlaneBufferGeometry`, old `Camera`) does **not** match `@types/three@0.183`. A blanket bundled-`three` type would be _wrong_ here.

**Recommended replacement (typed wrapper, not blanket `any`):** declare a **minimal interface describing only the r89 subset used**, and type the global as that — turning ~70 `any` spots into a single typed surface:
```ts
interface CdnThree {
  Camera: new () => { position: { z: number } };
  Scene: new () => { add: (o: unknown) => void };
  PlaneBufferGeometry: new (w: number, h: number) => object;
  Vector2: new () => { x: number; y: number };
  ShaderMaterial: new (p: {
    uniforms: Record<string, { value: unknown }>;
    vertexShader: string;
    fragmentShader: string;
  }) => object;
  Mesh: new (g: object, m: object) => object;
  WebGLRenderer: new () => {
    setPixelRatio: (r: number) => void;
    setSize: (w: number, h: number) => void;
    domElement: HTMLCanvasElement;
    render: (s: object, c: object) => void;
    dispose: () => void;
  };
}
declare global { interface Window { THREE?: CdnThree } }
```
Then `const THREE = window.THREE; if (!THREE) return;` — no `as any`. **Better long-term:** migrate this experiment off the CDN to the bundled `three@0.182` it already depends on (dynamic import per AGENTS.md), which deletes the whole problem. Flag for the owner — that's a behavior change, not a type-only fix.

**Visual-validation note:** WebGL fullscreen shader — verify the landing shader still compiles and animates after either change.

---

### 3. `useWeather.ts` — typed API response

**Confidence: High**

**File / lines:** `src/hooks/useWeather.ts:45–49` (`const data = await res.json()` → `data.current.temperature_2m` etc., 9 weak spots).

**Exact replacement:** add an interface for the Open-Meteo shape and annotate the parse:
```ts
interface OpenMeteoCurrent {
  temperature_2m: number;
  weather_code: number;
  is_day: 0 | 1;
}
interface OpenMeteoResponse { current: OpenMeteoCurrent }
const data = (await res.json()) as OpenMeteoResponse;
```
(`res.json()` is `Promise<any>` in lib.dom — a single boundary cast is the correct, minimal fix.) The existing `catch (e: unknown)` (line 51) is already correct — keep it.

---

### 4. GSAP devtools refs — `useRef<any>` → `GSDevTools`

**Confidence: High**

**Files / lines:**
- `src/hooks/useGSAPDebug.ts:26` (`const instanceRef = useRef<any>(null)`) + `:52` (`animation: timeline!` non-null assertion)
- `src/components/dev/DebugOverlay.tsx:55` (`const instanceRef = useRef<any>(null)`)

**Verified type:** `node_modules/gsap/types/gs-dev-tools.d.ts:1` declares `class GSDevTools` with `static create(vars?): GSDevTools` and a `.kill()` method.

**Exact replacement:**
```ts
import type { GSDevTools } from "gsap/GSDevTools";
const instanceRef = useRef<GSDevTools | null>(null);
```
This makes `instanceRef.current?.kill()` type-safe. For the `timeline!` assertion on line 52, the surrounding guard `if (!(isDebug && timeline)) return;` already narrows — restructure so the closure captures the narrowed `timeline` (assign to a const before the async `init`) instead of asserting. The `gsap.core.Timeline` / `gsap.core.Tween` namespace types (`node_modules/gsap/types/animation.d.ts:1`) are already correctly used in the `timeline` param signature — keep them.

---

### 5. `R3FSceneInspector.tsx` — narrow Three.js subtypes (dev tool)

**Confidence: Medium** (dev-only, low blast radius, but cleanly fixable)

**File / lines:** `src/components/dev/R3FSceneInspector.tsx:19,41,47,85`

**Exact replacements (all types from `three`, already imported in this file):**
- `:19` `(geometry as any).parameters` → geometry param structs live on concrete subclasses. Narrow by `type`:
  ```ts
  import type { BoxGeometry, PlaneGeometry, SphereGeometry } from "three";
  if (geometry.type === "BoxGeometry") {
    const p = (geometry as BoxGeometry).parameters; // {width,height,depth,...}
  }
  ```
  (`BoxGeometry.parameters` etc. are typed in `@types/three`; `BufferGeometry` has no `parameters`, which is why the cast existed.)
- `:41` `(mat as any).color` → not all materials have `color`. Use an `in` guard:
  ```ts
  import type { MeshStandardMaterial } from "three";
  const color = "color" in mat ? (mat as MeshStandardMaterial).color : undefined;
  ```
- `:47` `(light as any).intensity` → `Light.intensity` **is** on the base `Light` type. Just drop the cast: `const intensity = light.intensity;`
- `:85` `(obj as any).isLight` → use `(obj as Light).isLight` (the `isLight` boolean flag is declared on `Light`), matching the existing `(obj as Mesh).isMesh` pattern two lines below.

**Visual-validation note:** Dev console output only; no on-screen change.

---

### 6. `CursorDepthExplorer.tsx` — iOS DeviceOrientation + scale tuple

**Confidence: High** (scale), **Medium** (iOS permission)

**File / lines:** `:250` (`scale as any`), `:307,308,346,350` (`DeviceOrientationEvent as any`), `:359` (`catch (e: any)`).

- **`:250` `<mesh scale={scale as any}>`** — `scale` is a `useMemo` returning `[w, h, 1]` where `w,h` are `let w, h;` (inferred `number | undefined`), so it widens and the `as any` papers over it. Fix: type the memo as a tuple and initialize:
  ```ts
  const scale = useMemo<[number, number, number]>(() => { /* ... */ return [w, h, 1]; }, deps);
  ```
  R3F's `scale` prop accepts `Vector3 | [number, number, number] | number` (`@react-three/fiber` `ThreeElements`), so a proper tuple removes the cast.
- **`:307–350` `DeviceOrientationEvent as any`** — the iOS 13+ `.requestPermission()` static is **not in lib.dom**; `any` here is a real gap. Replace with a typed augmentation instead of `any`:
  ```ts
  interface DeviceOrientationEventiOS {
    requestPermission?: () => Promise<"granted" | "denied">;
  }
  const dop = DeviceOrientationEvent as unknown as DeviceOrientationEventiOS;
  if (typeof dop.requestPermission === "function") { /* ... */ }
  ```
- **`:359` `catch (e: any)`** → `catch (e: unknown)` then narrow `e instanceof Error ? e.message : String(e)` (matches the correct pattern in `useWeather.ts`).

**Visual-validation note:** WebGL depth-paint experiment + device tilt — type-only, but confirm the plane still scales to cover/contain and tilt still drives the uniform on an actual iOS device.

---

### 7. JSON ingestion in `lib/` and worker messages

**Confidence: Medium**

- **`src/lib/articles.ts:69–89`** — `exp.tech`, `exp.poster`, `exp.status`, `exp.listing` resolve to `any` from upstream parse. Type the `exp` source against the existing `Experiment` interface (already defined in `lib/experiments.ts`) instead of leaving it inferred.
- **`src/lib/experiments.ts:141`** — `return obj as unknown as Experiment;` inside `validateExperiment`. This is an **acceptable boundary cast** after manual validation, but it would be stronger to build the object field-by-field (or use a schema validator) so the cast isn't needed. Low urgency — the function name documents intent. Keep `getRelatedSlugs(config: unknown)` / `validateExperiment(raw: unknown)` as-is (correct).
- **`src/lib/feed-utils.ts:25`** — `idx` inferred `any`; annotate the callback param.
- **Worker `onmessage` — `LifeSimulation.tsx`** (`game-of-life-shader/LifeSimulation.tsx:111,114` and `bugged-out-game-of-life-shader-experiment/LifeSimulation.tsx:109–120`): `e.data.type` / `e.data.grid` are `any`. Define a **discriminated union** for worker→main messages:
  ```ts
  type WorkerMessage =
    | { type: "UPDATE"; grid: Uint8Array; ageGrid?: Uint8Array;
        stats?: { density: number; activity: number; centroidX: number; centroidY: number } };
  workerRef.current.onmessage = (e: MessageEvent<WorkerMessage>) => { /* e.data.type narrows */ };
  ```

---

### 8. Lower-priority / acceptable-as-is

**Confidence: Low** (cosmetic or already reasonable)

- **`src/components/mdx/components.tsx:25`** `Record<string, React.ComponentType<any>>` → prefer the MDX `MDXComponents` type (`import type { MDXComponents } from "mdx/types"`) for the components map.
- **`src/components/mdx/InteractiveWidget.tsx:18,23`** `(Preview as unknown as Record<symbol, symbol>)[ROLE]` — symbol-tagging components is a legitimate pattern; the double cast is tolerable. Could use a small `type Tagged = { [k: symbol]: symbol }` to read more intentionally. Leave unless touched.
- **`src/components/collected/physics-tag-cloud/PhysicsTagCloud.tsx:152,154`** `@ts-expect-error` for Matter.js internals — **justified** (accessing undocumented internal scroll-passthrough props). Keep, but the `event: unknown` on line 166 is the correct pattern.
- **`src/components/collected/counter-flip-reveal/CounterFlipReveal.tsx:6`** `@ts-ignore` — **replace with `@ts-expect-error`** + a one-line reason so it fails loudly if the underlying issue is fixed (Biome/TS best practice).
- **`window` shims** (`DeferredAIWidget.tsx:16`, `LocationStatusEnhancer.tsx:14` `requestIdleCallback`; `ConsoleEasterEgg.tsx:45–85` `surpriseMe`/`_stopSurprise`) — replace `(window as any).x` with a `declare global { interface Window { requestIdleCallback?: ...; surpriseMe?: () => void } }` augmentation. `requestIdleCallback` actually has a standard signature worth declaring once in a shared `globals.d.ts`.
- **`src/components/experiments/404-not-found/useRibbons.ts:68,74`** `let backsideImage = null` infers `null` then gets a `Texture` assigned → widen explicitly: `let backsideImage: THREE.Texture | null = null;`.
- **`VisualiserLogic.ts:184` comment mentions `as any`** but the actual code (lines 164,171,185) already uses the safer `as { width: number; height: number }`. The `CanvasImageSource` union genuinely lacks `width/height` on all members; the narrow struct cast is the right call — just **delete the stale "we use 'as any'" comment** (line 184).
- **`TypographyDebugPanel.tsx:123`** `article.style as unknown as Record<string, string>` — reading arbitrary CSS custom props; `unknown`-bridged cast is acceptable for a dev panel.

---

## Summary

- **Type-safety is strong overall (99.39% coverage)**; debt is clustered, not systemic, and the AGENTS.md "`unknown` + narrow" rule is already followed in `lib/` and tests.
- **Two hotspots produce the bulk of the count:** `shader-landing/useThreeShader.ts` (~70 spots from one CDN-`three` `as any`) and the shader **uniform `.value`** pattern (~50+ spots) caused structurally by `@types/three`'s `IUniform<TValue = any>` — fixable by typing each material's uniform object and reading through it.
- **Weak constructs found:** ~21 `as any`, ~8 `: any`, ~10 `as unknown as`, 3 `@ts-ignore`/`@ts-expect-error`, plus ~13 _correct_ `: unknown` usages to preserve.
- **High-confidence quick wins:** `useWeather` API interface (9 spots), GSAP `useRef<GSDevTools>` (2 files), `CursorDepthExplorer` scale tuple + typed iOS `DeviceOrientationEvent`, and `R3FSceneInspector` Three.js narrowing (drop `light.intensity` cast entirely).
- **Leave alone / justified:** `physics-tag-cloud` Matter.js `@ts-expect-error`, `experiments.ts` validated boundary cast, all existing `catch (e: unknown)`, and the entire `announcing-v2` experiment (staged for deletion). All WebGL/shader edits need visual re-validation since agents cannot see render output.
