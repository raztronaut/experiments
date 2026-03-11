---
review_agents: [kieran-typescript-reviewer, code-simplicity-reviewer, security-sentinel, performance-oracle]
plan_review_agents: [kieran-typescript-reviewer, code-simplicity-reviewer]
---

# Review Context

Add project-specific review instructions here.
These notes are passed to all review agents during /workflows:review and /workflows:work.

- Next.js 16 App Router with React 19 -- experiments use isolated route groups with own `<html>`/`<body>`
- Heavy use of GSAP (dynamic import), Motion (framer-motion), Lenis smooth scroll, R3F for 3D scenes
- Biome (via ultracite) for linting -- deliberately permissive for creative code
- Each experiment is self-contained: no cross-experiment imports, no global state pollution
- Performance-critical: animations target 60fps, `prefers-reduced-motion` must always be respected
- Three locations per experiment: `src/app/experiments/(name)/`, `src/components/experiments/name/`, `public/experiments/name/`
- Shared infrastructure (`@/lib/toolkit`, `@/components/ui`) uses barrels; experiment components do not
