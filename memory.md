# Memory

Auto-maintained by the continual-learning skill. Do not edit manually.

## Learned User Preferences

- Plan files in `.cursor/plans/` are read-only during implementation -- never edit them, only implement from them
- Complete all todos before stopping a session -- no partial work
- Be exhaustively investigative before planning or acting; use subagents for thoroughness
- Verify claims against actual code and filesystem, not assumptions or search tool results on binary files
- Fix systemic issues at root (templates, plop generators, rules), not individual instances
- Don't remove code that appears unused during active V2 development -- it may be newly created and not yet consumed
- Use MCP tools (browser-devtools, pinchtab, context7) for visual QA, console checks, and scroll testing instead of only code exploration
- Make granular, incremental commits -- not monolithic diffs
- AI agents must decompose files early: 200-line soft limit, 300-line hard limit per component
- Ask before assuming user intent; don't guess
- Reference `.agents/` docs (rules, profiles, skills) when working on experiments instead of relying on prior knowledge

## Learned Workspace Facts

- Tempus priority chain: -1 (Lenis scroll), 0 (GSAP animations), 1 (Three.js render loop)
- 18 legacy experiments have `legacy: true, status: "shipped"` and are untouchable -- no refactors, no layout migration
- Lenis intercepts programmatic scroll from MCP tools; use `window.__lenis` / `window.__scrollToSection` / `window.__scrollToProgress` via eval-based scrolling
- Motion import path is `motion/react` (migrated from `framer-motion`); 24+ source files use this path
- GSAP is free now -- no license needed; GSDevTools can be used directly
- `useDevControls` wraps leva's `useControls` and tree-shakes leva in production; opt-in with `{ production: true }` for showcase experiments
- Component decomposition pattern: `data.ts` for constants, `sections/` folder (one file per visual section owning its own `useGSAP` scope), thin orchestrator for lifecycle and composition
- Pre-commit hooks (lefthook) run in parallel: `ultracite fix`, `tsc --noEmit`, `validate-experiments.mjs`
- Parallel domain-based agent execution uses structured Domain Handoff Summary format (8 sections: Completed, Extra Discoveries, Extra Changes, Intentional Skips, Judgment Calls, Cross-Domain Dependencies, Open Concerns, Files Touched)
- `ScrollTrigger.refresh()` must be called after Lenis initialization; `createUnifiedScroll()` does not handle this internally
- In multi-section experiments, `position: fixed` elements in pinned sections are visible before ScrollTrigger activates -- always set initial animation states via `gsap.set` before `ScrollTrigger.create`
- When porting scroll-driven animations, content block count determines animation phase breakpoints -- never change block count without recalibrating all progress thresholds
