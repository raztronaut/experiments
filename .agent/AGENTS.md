# Razi's Experiments Lab

> Coding standards for AI-assisted creative engineering.
> Works with Claude Code, Codex, Cursor, Copilot, Windsurf, and any AGENTS.md-compatible tool.

---

## Philosophy

This is a creative coding lab. Every experiment should be close to publishable -- as an article, a package, or a client deliverable. Tooling enables creativity, never limits it. Fight entropy. Leave the codebase better than you found it.

---

## Guardrails

### 2-Iteration Limit
If an approach fails after **2 attempts**, STOP:
1. Summarize what you tried and why it failed
2. Present **2-3 alternative approaches** with trade-offs
3. Ask which direction to take

### Visual/Spatial Honesty
For WebGL, shaders, physics, animations, canvas -- acknowledge you cannot see the output. Provide best-effort with clear TODOs. Suggest the user validate visually. Use the visual-qa workflow when available.

### Pre-Commit Verification
Before ANY commit: `tsc --noEmit` + build must pass. Never commit code that doesn't build.

### Bug Fix Scope
Stay confined to files directly related to the bug. No drive-by refactors, no dependency upgrades in bug fix PRs.

### Context Hygiene
When tool output exceeds ~2K tokens, write it to a scratch file and return a summary with the file path. Prevents context bloat.

### Component Size Discipline
No single component file should exceed **200 lines**. When approaching this limit, decompose:
1. Extract data constants to `data.ts`
2. Extract reusable hooks to dedicated files
3. Split visual sections into `sections/SectionName.tsx` -- each owns its own `useGSAP`/animation scope
4. The main component becomes a thin orchestrator: lifecycle setup, shared state, section composition

**Hard limit**: 300 lines triggers mandatory decomposition before continuing. Stop and split.

### Stealth Mode
No AI fingerprints in git history or PR descriptions. No `Co-Authored-By` AI lines, no "Generated with" language. Conventional commits only.

---

## Tech Stack

- **Next.js 16+** App Router, React 19+, TypeScript strict
- **Tailwind CSS** with shadcn/ui components
- **GSAP** -- scroll-driven animation, timelines (always dynamic import, no SSR)
- **Motion** -- React layout animations, gestures, springs (`motion/react`)
- **Lenis** -- smooth scroll (`lenis`, `lenis/react`)
- **Tempus** -- unified RAF management with priority system
- **Hamo** -- performance hooks (`useRect`, `useWindowSize`, `useResizeObserver`)
- **R3F** (@react-three/fiber + drei) -- 3D scenes
- **npm** as package manager

---

## Experiment Architecture

Experiments use **route group isolation** -- each gets its own `<html>`/`<body>`:

- `src/app/experiments/(name)/` -- route files, layout, experiment.json
- `src/components/experiments/name/` -- components and tests
- `public/experiments/name/` -- assets (images, video, models)

**Hard rules**: no cross-experiment imports, no global state pollution, shared UI is read-only. Always scaffold with `npm run new:experiment`.

---

## Coding Standards

- **TypeScript**: No `any` -- use `unknown` and narrow. Prefer `interface` for objects.
- **React**: Server Components by default. `'use client'` only when needed.
- **Imports**: No barrel imports from experiment components. Shared infrastructure (`@/components/mdx`, `@/lib/toolkit`) may use barrels for public API surfaces. Dynamic import heavy deps (Three.js, GSAP).
- **Performance**: `Promise.all` for parallel fetches. Animate only `transform`/`opacity`.
- **Accessibility**: `alt` text on images, `aria-label` on icon buttons, 44x44px touch targets minimum, color contrast 4.5:1.
- **Git**: Conventional commits (`feat:`, `fix:`, `refactor:`, `docs:`, `chore:`).

---

## Animation Standards

Drawn from the 12 Principles of Animation:

- **Timing**: interaction feedback <200ms, transitions 200-500ms, complex choreography up to 800ms. Doherty threshold: under 400ms feels instant.
- **Easing**: ease-out for entrances (snappy), ease-in for exits, ease-in-out for state changes. Never `linear` for UI motion.
- **Follow-through**: stagger child elements, spring overshoot for physicality.
- **Anticipation**: subtle cue before major actions (wiggle, scale-down before scale-up).
- **Exaggeration**: amplify feedback for emphasis -- error shakes, success bounces. Sparingly.
- **`prefers-reduced-motion`**: always respected. Provide reduced-motion fallbacks.

---

## UX Standards

From Laws of UX:

- **Fitts's Law**: generous hit areas. Use `::before` pseudo-elements to expand clickable regions. Every pixel of padding is a usability decision.
- **Hick's Law**: progressive disclosure. Show what matters now, reveal complexity when needed.
- **Miller's Law**: chunk data. Format numbers, break long content into digestible groups.
- **Doherty Threshold**: under 400ms response. If slow, use optimistic UI / skeleton screens.
- **Postel's Law**: accept messy input, output clean data. Validate generously, format strictly.
