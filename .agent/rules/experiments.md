---
trigger: always_on
---

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
Check `experiment.json` for a `profile` field. When present, activate the matching profile from `.agent/profiles/` to get experiment-type-specific behavioral guidance.

## Cleanup Discipline
- `useEffect` cleanups for event listeners, timers, animation contexts
- Dispose Three.js geometries, materials, textures on unmount
- Kill GSAP tweens/timelines in cleanup (`gsap.context()` or `useGSAP`)
- If abandoning an experiment: `npm run delete:experiment <name>`
