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
- Parallel domain-based agent execution is formalized in `.agents/skills/parallel-orchestration/SKILL.md` -- Task-tool-driven pipeline with domain briefs, structured handoffs (9 sections + status protocol), gating, and 4-subagent overview pass
- `ScrollTrigger.refresh()` must be called after Lenis initialization; `createUnifiedScroll()` does not handle this internally
- In multi-section experiments, `position: fixed` elements in pinned sections are visible before ScrollTrigger activates -- always set initial animation states via `gsap.set` before `ScrollTrigger.create`
- When porting scroll-driven animations, content block count determines animation phase breakpoints -- never change block count without recalibrating all progress thresholds
- Registry Lean architecture: 0 new deps, `(registry)` route group with own `<html>/<body>`, server components reading JSON from `public/registry/` via `fs.readFile` at build time, `generateStaticParams` for SSG
- Biome/ultracite can't lint paths with parentheses (Next.js route groups); `cd` into the directory and run `ultracite check .` instead
- `next/og` ImageResponse works without edge runtime -- Node.js runtime allows `fs.readFile` for reading data in OG image generation
- Registry index: `index-slim.json` (22KB, 57 items, grid page) vs `index.json` (37KB, stripped content) vs individual `{slug}.json` (full content for detail pages)
- Shared `registry:style` item (`razi-style.json`) eliminates ~120 lines of duplicated tailwind/cssVars per registry item via `registryDependencies: ["razi-style"]`
- Registry pipeline (3-step) must clean stale outputs from `public/registry/` before building -- items removed from manifest persist and pollute indexes
- Registry data field propagation: `registry.json` manifest puts `category` at item level but experiment metadata in `meta` sub-object -- downstream scripts must handle both locations
- Biome enforces non-interactive HTML elements (`<nav>`, `<header>`) cannot carry interactive ARIA roles like `tablist` -- use `<div>` for composite widgets
- Tailwind v4 uses `bg-linear-to-br` instead of `bg-gradient-to-br` -- Biome catches this automatically
- Shiki `codeToHtml` wraps each line in `<span class="line">` -- CSS line numbers via `counter-increment` work with zero JS
- Registry now catalogs 58+ items across 5 categories: experiments, components, collected, hooks, utilities + 1 shared style
- Collected components live in `src/components/collected/<name>/` with `meta.json` (ported code) or `library.json` (indexed external library)
- Library reference naming convention: `<library>--<component>` to avoid collisions with ported components
- `scanCollected()` in `generate-registry-json.mjs` handles both modes: folders with `.tsx` = ported components, folders with `library.json` = indexed references
- Quick-component skill (`.agents/skills/quick-component/SKILL.md`) is the lightweight alternative to porting-demos -- Mode A ports a single component, Mode B indexes a library
- Registry V2 is complete (2026-03-11): 7-phase build with Fumadocs, hybrid pipeline, MDX auto-gen, custom components, 58+ items across 5 categories. Curated Component Collection (s-tier plan) remains as a future improvement.
- Content constellation Cursor-native integration (2026-03-11): 6 rules in `.cursor/rules/` (auto-inject on experiment.json, content.mdx, docs/*.md, generate-*.mjs, registry.config.json, experiment components), 3 skills in `.cursor/skills/` (publish-content, audit-content, run-generation), 2 subagents in `.cursor/agents/` (content-writer, content-auditor). Overview doc at `.agents/contexts/content-constellation.md`.
