# Contributing

## Code Style

### TypeScript

- **Strict mode** enabled. No `any` -- use `unknown` and narrow with type guards.
- Prefer `interface` for object shapes, `type` for unions and utility types.
- All files are `.ts` or `.tsx` (no plain JS in source).

### React

- **Server Components by default**. Add `'use client'` only when the component needs browser APIs, hooks, or event handlers.
- Dynamic import heavy dependencies (Three.js, GSAP) to keep them out of experiments that don't use them.
- No barrel imports from experiment components. Shared infrastructure (`@/lib/toolkit`, `@/components/ui`) may use barrels.

### Imports

```tsx
// Allowed
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { ExperimentCanvas } from '@/lib/toolkit/r3f'

// Forbidden
import X from '@/components/experiments/other-experiment/X'  // cross-experiment
```

### Performance

- `Promise.all` for parallel async operations
- Animate only `transform` and `opacity` (composited properties) for 60fps
- Dynamic import `gsap`, `three`, and other heavy libraries

## Component Size Discipline

Target **200 lines** per component. Hard limit **300 lines** -- exceeding triggers mandatory decomposition:

1. Extract constants and content to `data.ts`
2. Extract hooks to dedicated files in `hooks/`
3. Split visual sections into `sections/SectionName.tsx` -- each owns its own `useGSAP` scope
4. Main component becomes a thin orchestrator: lifecycle, shared state, section composition

```
src/components/experiments/name/
├── ExperimentName.tsx      # ~120 lines, orchestrator
├── data.ts                 # Constants
├── sections/
│   ├── HeroSection.tsx     # Own animation scope
│   └── ContentSection.tsx  # Own animation scope
└── hooks/
    └── useMyHook.ts
```

## Linting and Formatting

**Biome** (via ultracite) handles all linting and formatting. ESLint and Prettier have been removed.

```bash
npm run lint    # ultracite check (read-only, fails on violations)
npm run fix     # ultracite fix (autofix)
```

Configuration: `biome.jsonc` extends `ultracite/biome/core`, `ultracite/biome/react`, `ultracite/biome/next`.

Biome is deliberately permissive (30+ rules disabled) to accommodate legacy creative code. AGENTS.md defines stricter standards for new code.

Pre-commit runs `ultracite check` on the full project (no file list), so files under parenthesized route groups (e.g. `(experiment-name)`) are linted without path-handling issues.

## Testing

- **Framework**: Vitest + `@testing-library/react`, JSDOM environment
- **Location**: colocated with components as `ExperimentName.test.tsx`
- **Run**: `npm test` (watch mode) or `npm test -- --run --project unit` (CI/single run)

```bash
npm test                          # watch mode
npm test -- --run                 # single run
npm test -- --run --project unit  # CI mode
```

## Git Conventions

### Commit Messages

Keep commit messages short and descriptive. Conventional Commit prefixes are a good pattern if they help, but they are not required.

### Commit Voice

- No `Co-Authored-By` AI lines
- No "Generated with" or "Created by AI" language
- Entire.io tool trailers (`Entire-Checkpoint`, `Entire-Attribution`) are acceptable -- structured metadata, not authorship copy

### Pre-Commit Hooks

Lefthook runs three checks in parallel before every commit:

| Check | Command | Fails on |
|-------|---------|----------|
| Lint | `npx ultracite check` | Any lint/format violation |
| Typecheck | `npx tsc --noEmit` | Any type error |
| Validate | `node scripts/validate-experiments.mjs` | Invalid experiment.json |

Fix lint issues with `npm run fix`, then re-stage and re-commit.

### Pre-Commit Verification

Before any commit: `tsc --noEmit` must pass. Never commit code that doesn't build. If using AI agents, they should run typecheck before committing.

## Accessibility

Every experiment must meet baseline accessibility standards:

- **`alt` on images**: descriptive text for all `<img>` elements
- **`aria-label` on icon buttons**: every button without visible text needs a label
- **Touch targets**: minimum 44x44px for interactive elements
- **Color contrast**: 4.5:1 minimum ratio for text
- **`prefers-reduced-motion`**: always respected. Use `gsap.set()` for instant-state fallbacks (not early returns -- the final visual state must be correct). Motion's `useReducedMotion()` hook is available for React-level checks.

## UX Standards

Informed by Laws of UX:

| Law | Application |
|-----|-------------|
| **Fitts's Law** | Generous hit areas. Use `::before` pseudo-elements to expand clickable regions. |
| **Hick's Law** | Progressive disclosure. Show what matters now, reveal complexity on demand. |
| **Miller's Law** | Chunk data. Format numbers, break long content into digestible groups. |
| **Doherty Threshold** | <400ms response time. If slow, use optimistic UI or skeleton screens. |
| **Postel's Law** | Accept messy input, output clean data. |

## Boundaries

### Always do

- Scaffold experiments with `npm run new:experiment`
- Run `tsc --noEmit` before commits
- Respect `prefers-reduced-motion`
- Dispose Three.js resources on unmount
- Clean up effects (listeners, timers, animation contexts)

### Ask first

- Adding new production dependencies
- Modifying shared UI (`src/components/ui/`)
- Changing the toolkit integration layer (`src/lib/toolkit/`)
- Modifying CI/CD configuration

### Never do

- Import from another experiment's component directory
- Modify legacy experiments (`legacy: true` in experiment.json) without permission
- Commit secrets, API keys, or `.env` files
- Add experiment-specific state to global stores
- Modify `src/app/(main)/` for experiment-specific code
