# Memory

Auto-maintained by the continual-learning skill. Do not edit manually.

## Learned User Preferences

- Plan files in `.cursor/plans/` are read-only during implementation -- never edit them, only implement from them
- Complete all todos before stopping a session -- no partial work
- Be exhaustively investigative before planning or acting -- adjacent systems, stale docs, best practices, caching; for perf work, capture baseline benchmarks BEFORE changes and measure AFTER
- Verify claims against actual code and filesystem, not assumptions or search tool results on binary files
- Fix systemic issues at root (templates, plop generators, rules), not individual instances
- Don't remove code that appears unused during active V2 development -- it may be newly created and not yet consumed
- Use MCP tools (browser-devtools, pinchtab, context7) for visual QA, console checks, and scroll testing instead of only code exploration
- Make granular, incremental commits -- not monolithic diffs
- AI agents must decompose files early: 200-line soft limit, 300-line hard limit per component
- Ask before assuming user intent; don't guess
- Reference `.agents/` docs (rules, profiles, skills) when working on experiments instead of relying on prior knowledge
- Never silently simplify, reword, or degrade content during migration -- diff old vs new character-by-character; LaTeX math, prose, and component usage must be preserved exactly

## Learned Workspace Facts

- Tempus priority chain: -1 (Lenis scroll), 0 (GSAP animations), 1 (Three.js render loop)
- 17 legacy experiments have `legacy: true` and are untouchable -- no refactors, no layout migration
- Lenis intercepts programmatic scroll from MCP tools; use `window.__lenis` / `window.__scrollToSection` / `window.__scrollToProgress` via eval-based scrolling
- Motion import path is `motion/react` (migrated from `framer-motion`); 24+ source files use this path
- `useDevControls` wraps leva's `useControls` and tree-shakes leva in production; opt-in with `{ production: true }` for showcase experiments
- Component decomposition pattern: `data.ts` for constants, `sections/` folder (one file per visual section owning its own `useGSAP` scope), thin orchestrator for lifecycle and composition
- Pre-commit hooks (lefthook) run in parallel: `ultracite check`, `tsc --noEmit`, `validate-experiments.mjs`; `tsc --noEmit` requires a prior build because it depends on `.source/` generated output
- `ScrollTrigger.refresh()` must be called after Lenis initialization; `createUnifiedScroll()` does not handle this internally
- In multi-section experiments, `position: fixed` elements in pinned sections are visible before ScrollTrigger activates -- always set initial animation states via `gsap.set` before `ScrollTrigger.create`
- Pre-commit runs `ultracite check` (full-project) to avoid Biome path bugs with parentheses in Next.js route groups
- `generate:all` is a node orchestrator (`scripts/generate-all.mjs`) running posters, registry (4-step), and llms-txt in parallel with per-phase timing
- All generation scripts use `scripts/lib/write-if-changed.mjs` to skip unchanged writes; `build-registry` uses smart stale deletion (only truly removed items); posters use mtime comparison
