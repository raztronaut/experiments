<!-- read_when: Creating or modifying any experiment (always read) -->

# Experiment Isolation Rules

## Scaffolding
Always use `npm run new:experiment` to create experiments. Never manually create initial experiment files. The generator handles route groups, layouts, metadata, components, and tests.

## Three-Location Rule
Experiment code belongs ONLY in:
1. `src/app/experiments/(experiment-name)/` -- route files, layout, metadata
2. `src/components/experiments/experiment-name/` -- components, hooks, utils
3. `public/experiments/experiment-name/` -- assets (images, video, models, fonts)

Never modify `src/app/(main)/` for experiment-specific code. Never add experiment utilities to `src/lib/utils.ts`.

## Isolation Guarantees
- No cross-experiment imports (importing from another experiment's component directory is forbidden)
- No experiment-specific state in global stores
- Shared UI (`src/components/ui/`) is read-only for experiments -- use but don't modify
- Each experiment layout renders its own `<html>`/`<body>` for complete CSS/JS isolation

## Profile Detection
Check `experiment.json` for a `profile` field. When present, activate the matching profile from `.agents/profiles/` to get experiment-type-specific behavioral guidance.

## Component Decomposition

### File Budget (lines)
| File Type | Target | Hard Limit |
|-----------|--------|------------|
| Orchestrator component | ~120 | 200 |
| Section component | ~60-90 | 150 |
| Data constants | ~100 | 150 |
| Hook | ~30-50 | 80 |

### When to Decompose
When the main component exceeds ~200 lines or contains 3+ distinct visual sections, split into:

```
src/components/experiments/experiment-name/
  ExperimentName.tsx          Orchestrator (lifecycle, shared state, composition)
  data.ts                     All constants and configuration
  sections/
    SectionName.tsx           Each visual section owns its own animation scope
  [hooks, shaders, etc.]
```

### Section Pattern
Each section is a self-contained component:
- Own `useRef` for root element
- Own `useGSAP({ scope: sectionRef, dependencies: [...] })` or equivalent animation hook
- Own `prefers-reduced-motion` handling (never leave `opacity-0` elements invisible)
- Receives shared config via props (not global state)

### Orchestrator Pattern
The main component stays thin:
- Lenis/scroll setup and cleanup
- Shared controls (`useDevControls`)
- Shared refs (scroll progress, debug state)
- Composes `<Section />` components with props
- No direct DOM animation code

## Cleanup Discipline
- `useEffect` cleanups for event listeners, timers, animation contexts
- Dispose Three.js geometries, materials, textures on unmount
- Kill GSAP tweens/timelines in cleanup (`gsap.context()` or `useGSAP`)
- If abandoning an experiment: `npm run delete:experiment <name>`
