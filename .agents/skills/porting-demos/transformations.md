# Tech Stack Transformations

Before/after code examples for converting source patterns to experiment equivalents. Referenced from [SKILL.md](SKILL.md) Phase 3.

## Vanilla GSAP -> useGSAP

**Before** (vanilla):
```js
document.addEventListener("DOMContentLoaded", () => {
  const tl = gsap.timeline()
  tl.to(".hero", { opacity: 1, y: 0, duration: 0.8 })
    .to(".subtitle", { opacity: 1, duration: 0.4 }, "-=0.3")
})
```

**After** (experiment):
```tsx
const containerRef = useRef<HTMLDivElement>(null)

useGSAP(() => {
  const tl = gsap.timeline()
  tl.to(".hero", { opacity: 1, y: 0, duration: 0.8 })
    .to(".subtitle", { opacity: 1, duration: 0.4 }, "-=0.3")
}, { scope: containerRef })

return <div ref={containerRef}>...</div>
```

`useGSAP` auto-cleans all tweens/timelines on unmount. Scoped selectors only match within the container ref. See `.agents/skills/gsap-modern/SKILL.md`.

## DOMContentLoaded -> React Lifecycle

When refs must exist before animation runs, use the `dependencies` + delayed ready pattern:

```tsx
const [ready, setReady] = useState(false)
const containerRef = useRef<HTMLDivElement>(null)

useEffect(() => {
  requestAnimationFrame(() => setReady(true))
}, [])

useGSAP(() => {
  if (!containerRef.current) return
  // Safe to use refs, SplitText, measure DOM here
}, { scope: containerRef, dependencies: [ready] })
```

## Vanilla Lenis -> createUnifiedScroll

**Before** (vanilla):
```js
const lenis = new Lenis({ lerp: 0.1, smoothWheel: true })
gsap.ticker.add((time) => lenis.raf(time * 1000))
gsap.ticker.lagSmoothing(0)
```

**After** (experiment orchestrator):
```tsx
import { createUnifiedScroll } from "@/lib/toolkit/scroll"
import type { UnifiedScrollHandle } from "@/lib/toolkit/scroll"

useEffect(() => {
  const handle = createUnifiedScroll()
  ScrollTrigger.refresh()
  return () => handle.destroy()
}, [])
```

Remove all manual Lenis instantiation and GSAP ticker integration from the source. `createUnifiedScroll` handles Lenis (priority -1) + GSAP (priority 0) on Tempus RAF. See `.agents/skills/lenis-scroll/SKILL.md`.

## Vanilla Three.js -> R3F

Key transformations (Claude knows the vanilla Three.js boilerplate -- only the "after" pattern matters):

```tsx
import { ExperimentCanvas } from "@/lib/toolkit/r3f"
import { useGLTF } from "@react-three/drei"
import { useFrame } from "@react-three/fiber"

function Model() {
  const { scene } = useGLTF("/experiments/<name>/model.glb")
  return <primitive object={scene} />
}

export default function MyExperiment() {
  return (
    <ExperimentCanvas camera={{ position: [0, 0, 5], fov: 50 }}>
      <ambientLight intensity={0.5} />
      <Suspense fallback={null}>
        <Model />
      </Suspense>
    </ExperimentCanvas>
  )
}
```

- `new Scene()` + camera + renderer -> `<ExperimentCanvas>` (handles all three)
- `GLTFLoader.load()` -> `useGLTF()` (declarative, cached, Suspense-compatible)
- `requestAnimationFrame` loop -> `useFrame((state, delta) => { ... })` with delta clamping
- Global mouse listeners -> Zustand store, read via `getState()` in `useFrame`

See `.agents/skills/r3f-core/SKILL.md` for `useFrame` patterns, disposal, and state management.

## Vanilla Shaders -> R3F ShaderMaterial

Keep GLSL code verbatim. Wrap in TypeScript template strings:

```tsx
// shaders/myShader.ts
export const vertexShader = /* glsl */ `...`
export const fragmentShader = /* glsl */ `...`

// Component
const uniforms = useMemo(() => ({
  uTime: { value: 0 },
  uMouse: { value: new THREE.Vector2() },
}), [])

useFrame((state) => {
  uniforms.uTime.value = state.clock.elapsedTime
})

return (
  <mesh>
    <planeGeometry args={[2, 2]} />
    <shaderMaterial uniforms={uniforms} vertexShader={vertexShader} fragmentShader={fragmentShader} />
  </mesh>
)
```

See `.agents/skills/shader-authoring/SKILL.md` for GLSL utilities and the composable module pattern.

## Imperative DOM -> React Refs

Most DOM-to-React mappings are obvious (`querySelector` -> `useRef`, etc.). Non-obvious patterns:

| Vanilla Pattern | React Equivalent |
|---|---|
| `element.remove()` | `gsap.set(ref.current, { autoAlpha: 0 })` (React-safe, don't remove nodes) |
| `document.createElement("div")` in a loop | Keep imperative inside `useEffect` with cleanup if fundamentally procedural (grids, particles) |
| `counterContainer.remove()` after animation | `gsap.set(ref.current, { autoAlpha: 0 })` |

## Global CSS -> Scoped CSS

Two approaches, both requiring class name prefixing with `<slug>-`:

**Approach 1: CSS file** (preferred for large style sets):
```css
/* src/components/experiments/<name>/styles.css */
.<slug>-hero { position: relative; height: 100vh; }
.<slug>-hero-bg { position: absolute; inset: 0; z-index: 0; }
```
```tsx
import "./styles.css"
```

**Approach 2: `<style>` JSX** (useful for section components with self-contained styles):
```tsx
return (
  <>
    <style>{`
      .<slug>-hero { position: relative; height: 100vh; }
      .<slug>-hero-bg { position: absolute; inset: 0; z-index: 0; }
    `}</style>
    <section className="<slug>-hero">...</section>
  </>
)
```

Never use bare class names like `.hero`, `.container`, `.title`.
