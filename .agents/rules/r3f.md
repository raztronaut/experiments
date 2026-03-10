<!-- read_when: Editing R3F scenes, Canvas, useFrame, drei components -->

# React Three Fiber Rules

## Priority Ordering
1. **Frame rate** -- 60fps, 16.67ms budget, safe JS ~10ms
2. **Memory** -- dispose everything on unmount
3. **Correctness** -- visual matches intent
4. **Performance** -- minimize draw calls
5. **Responsiveness** -- adapt to device capabilities

## Disposal Pattern
```tsx
useEffect(() => {
  return () => {
    geometry.dispose()
    material.dispose()
    texture?.dispose()
  }
}, [])
```

## Instancing
Use `<Instances>`/`<Instance>` from drei for repeated objects. Never create individual meshes in a loop when they share geometry/material.

## DPR
Responsive device pixel ratio: `dpr={[1, 1.5]}` on mobile, `dpr={[1, 2]}` on desktop. Never hardcode `dpr={2}`.

## Tone Mapping & Color Space
- Default `ACESFilmicToneMapping` is fine for lit scenes
- When using `EffectComposer` with a `ToneMapping` effect, set `gl={{ toneMapping: THREE.NoToneMapping }}` on Canvas to avoid double tone mapping
- Use `<Canvas flat />` to disable R3F's color management when handling it manually in post-processing
- Use `<Canvas linear flat />` for fully linear workflow (custom post-processing pipelines)

## useFrame
- Use `delta` for frame-rate-independent animation: `ref.current.rotation.y += delta`
- **Clamp delta** to prevent physics explosions on frame drops: `const d = Math.min(delta, 1/15)`
- **Never** call `setState` inside `useFrame` -- causes re-renders every frame
- Use refs for mutable state accessed in the render loop
- Read Zustand stores via `useStore.getState()` -- not hooks -- inside `useFrame`

```tsx
// Good: direct state access, zero subscriptions
useFrame((_, delta) => {
  const { target } = useGameStore.getState()
  damp3(meshRef.current.position, target, 4, delta)
})
```

## External Frame Loop (`frameloop="never"`)
When using `frameloop="never"` (e.g., with Tempus via `ExperimentCanvas tempus`):
- Use `advance(timestamp)` to drive the frame loop -- never `gl.render()` directly
- `gl.render()` bypasses R3F's internal loop -- `useFrame` callbacks will not fire
- `advance()` is available via `useThree((s) => s.advance)` or as a global R3F export
- Timestamp must be in **seconds** (R3F clock convention); Tempus provides ms, so divide by 1000

## Dev Tooling
`r3f-perf` in dev only: `{process.env.NODE_ENV === 'development' && <Perf position="top-left" />}`

## Performance Budgets
| Tier | Triangles | Use Case |
|------|-----------|----------|
| Low-poly | <10K | Icons, UI elements, simple scenes |
| Medium | 10-50K | Standard scenes, product vis |
| High | 50-200K | Hero scenes, detailed models |
| Hero | 200K+ | Exceptional cases, justify the cost |

## Error Boundaries
Wrap `<Canvas>` in an error boundary for production experiments. WebGL can fail on unsupported devices/drivers. `ExperimentCanvas` supports an `errorFallback` prop for this.

## Adaptive Performance
Prefer `<AdaptiveDpr>` + `<AdaptiveEvents>` from drei over manual DPR logic. For mobile, gate expensive features (bloom, particle count, shadow resolution) behind `useDeviceCapabilities()` (see `r3f-core.md`).

## Textures
Power-of-2 dimensions (512, 1024, 2048). Use KTX2/Basis compression for large textures. Load with `useTexture` or `useKTX2` from drei.
