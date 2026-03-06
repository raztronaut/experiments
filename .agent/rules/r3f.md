---
trigger: file_match
file_patterns:
  - "src/components/experiments/**/*.tsx"
  - "src/components/experiments/**/*.ts"
description: Loads when editing R3F experiment components
---

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

## useFrame
- Use `delta` for frame-rate-independent animation: `ref.current.rotation.y += delta`
- **Never** call `setState` inside `useFrame` -- causes re-renders every frame
- Use refs for mutable state accessed in the render loop

## Dev Tooling
`r3f-perf` in dev only: `{process.env.NODE_ENV === 'development' && <Perf position="top-left" />}`

## Performance Budgets
| Tier | Triangles | Use Case |
|------|-----------|----------|
| Low-poly | <10K | Icons, UI elements, simple scenes |
| Medium | 10-50K | Standard scenes, product vis |
| High | 50-200K | Hero scenes, detailed models |
| Hero | 200K+ | Exceptional cases, justify the cost |

## Textures
Power-of-2 dimensions (512, 1024, 2048). Use KTX2/Basis compression for large textures. Load with `useTexture` or `useKTX2` from drei.
