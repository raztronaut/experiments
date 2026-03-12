---
name: README and Docs Overhaul
overview: Rewrite the stale V1-era README.md to reflect the current V2 platform, and create a comprehensive docs/ folder with 10 guides covering every major system in the codebase.
todos:
  - id: readme-rewrite
    content: "Rewrite README.md: modern intro, quick start, full tech stack, updated project structure, key concepts with docs/ links, full command table, deploy/contributing/AI sections"
    status: completed
  - id: docs-index
    content: Create docs/README.md as documentation index with links and descriptions
    status: completed
  - id: docs-architecture
    content: "Create docs/architecture.md: isolation model, route groups, three-location rule, data flow, mermaid diagram"
    status: completed
  - id: docs-getting-started
    content: "Create docs/getting-started.md: prerequisites, setup, first experiment walkthrough, file anatomy"
    status: completed
  - id: docs-experiments
    content: "Create docs/experiments.md: lifecycle, profiles, metadata truth table, /dev dashboard, full schema"
    status: completed
  - id: docs-content
    content: "Create docs/content-system.md: articles, content constellation, feeds, llms.txt, .mdx routes"
    status: completed
  - id: docs-registry
    content: "Create docs/registry.md: shadcn registry, pipeline, collected, Fumadocs, curation, installation"
    status: completed
  - id: docs-toolkit
    content: "Create docs/toolkit.md: GSAP, Motion, Lenis, Tempus, R3F, toolkit layer, priority chain"
    status: completed
  - id: docs-deploy
    content: "Create docs/deploy.md: CI, Vercel, lefthook, Entire.io, build pipeline, branching"
    status: completed
  - id: docs-scripts
    content: "Create docs/scripts.md: all 16 scripts documented with usage and flags"
    status: completed
  - id: docs-contributing
    content: "Create docs/contributing.md: code style, component discipline, Biome, testing, git conventions, a11y"
    status: completed
  - id: docs-ai
    content: "Create docs/ai-development.md: .agents/ overview, Cursor integration, MCP tools, skills, workflows, memory"
    status: completed
isProject: false
---

# README and Documentation Overhaul

## Problem

[README.md](README.md) was written during V1 and is significantly stale. It references `plop.js` as the scaffolding tool (now `create-experiment.mjs`), omits the entire animation stack (GSAP, Lenis, Tempus), the content/article system, RSS/JSON feeds, llms.txt, Fumadocs, the metadata truth table, the /dev dashboard, Biome linting, Entire.io, the toolkit layer, the deploy workflow, and more. Meanwhile, [AGENTS.md](AGENTS.md) is comprehensive but optimized for AI agents, not human readers.

No `docs/` folder exists at the project root. Per-experiment `docs/` folders exist (content constellation format) but there is no centralized project-level documentation.

## Approach

1. **Rewrite `README.md`** as a concise, modern entry point -- project identity, quick start, tech stack, project structure, key concepts, then links into `docs/` for deep dives.
2. **Create `docs/`** with 10 focused guides, each covering one major system. Written for human contributors (the `.agents/` tree remains the AI-agent reference).

## Source material

Primary source of truth for content: [AGENTS.md](AGENTS.md), `[.agents/contexts/architecture.md](.agents/contexts/architecture.md)`, `[.agents/contexts/toolkit.md](.agents/contexts/toolkit.md)`, `[.agents/contexts/content-constellation.md](.agents/contexts/content-constellation.md)`, `[.agents/workflows/deploy.md](.agents/workflows/deploy.md)`, `[memory.md](memory.md)`, `[package.json](package.json)` scripts section, `[lefthook.yml](lefthook.yml)`, `[.github/workflows/ci.yml](.github/workflows/ci.yml)`, `[source.config.ts](source.config.ts)`, and `[registry.config.json](registry.config.json)`.

---

## 1. README.md Rewrite

Replace the entire file. New structure:

- **Header**: "Razi's Experiments Lab" -- creative coding lab at razisyed.cv. One-line description.
- **Quick Start**: `npm install`, `npm run dev`, `npm run new:experiment`, visit localhost.
- **Tech Stack**: Full table matching AGENTS.md (Next.js 16, React 19, Tailwind 4, GSAP, Motion, Lenis, Tempus, Hamo, R3F, Drei, Three.js, Zustand, Biome, Vitest, Fumadocs).
- **Project Structure**: Updated tree showing `(experiment-name)/` route groups, `content/registry/`, `scripts/`, `src/lib/toolkit/`. Mention isolation model (own `<html>`/`<body>`).
- **Key Concepts** (3-4 sentences each with link to docs/):
  - Experiments (lifecycle, profiles, metadata)
  - Content System (articles, feeds, llms.txt)
  - Component Registry (shadcn, collected, Fumadocs)
  - Toolkit (animation stack, priority chain)
- **Commands**: Full table of all npm scripts (matching AGENTS.md).
- **Deploy**: One paragraph -- Vercel auto-deploys main, preview on PRs, 4-step build pipeline. Link to `docs/deploy.md`.
- **Contributing**: Brief -- conventional commits, lefthook pre-commit hooks, Biome. Link to `docs/contributing.md`.
- **AI-Assisted Development**: Brief -- `.agents/` directory, Cursor rules/skills. Link to `docs/ai-development.md`.
- **License**: MIT.

Remove stale V1 content: plop.js references, old "Available Workflows" table (those were V1 slash commands), old "What the AI Knows" section, old "Adding Previews" section (moved to docs/).

---

## 2. docs/ Folder

### `docs/README.md` -- Documentation Index

Table of contents with one-line descriptions linking to each guide.

### `docs/architecture.md` -- System Architecture

- Route group isolation model (each experiment gets own `<html>`/`<body>`)
- Three-location rule: `src/app/experiments/`, `src/components/experiments/`, `public/experiments/`
- Layout hierarchy: `(main)` layout vs experiment layouts vs `(registry)` layout
- Environment detection: `isDev`, `isPreview`, `showDevContent` from `[src/lib/env.ts](src/lib/env.ts)`
- Data flow: experiment.json -> getExperiments() -> surfaces (homepage, registry, feeds, llms.txt)
- Mermaid diagram showing the isolation model

### `docs/getting-started.md` -- Getting Started

- Prerequisites (Node 20+, npm 10+, ffmpeg for poster generation)
- Installation and dev server
- Creating your first experiment (`npm run new:experiment` interactive, `npm run new:experiment:auto` for automation)
- Experiment file anatomy (layout.tsx, experiment.json, page.tsx, error.tsx, component)
- Adding assets (preview video, images, models)
- Shipping: set `status: "shipped"` and choose `listing`

### `docs/experiments.md` -- Experiments

- Lifecycle: scaffold -> develop -> ship -> (optional) publish content -> (optional) delete
- Profiles: `blank`, `r3f-scene`, `r3f-shader`, `scrollytelling`, `interaction`, `web-audio`, `dom-effect`, `mixed` -- what each means and when to use it
- **Metadata system** (the truth table -- this is the big missing piece from the README):
  - `status`: `"wip"` | `"shipped"`
  - `listing`: `"public"` | `"dev"` | `"registry"`
  - `legacy`: boolean agent policy flag
  - Full truth table showing which surfaces each combination appears on
- `/dev` dashboard: what it shows, how to access it (dev/preview only)
- `experiment.json` full schema with all fields documented

### `docs/content-system.md` -- Content System

- Article system: `article/content.mdx` + `article/page.tsx` + `article/components.tsx`
- Content constellation: 6 formats (article, lab note, architecture, snippet, social, changelog) with file locations
- Article rendering: MDXRemote, rehype-pretty-code/Shiki, JSON-LD structured data
- Publishing workflow: `npm run new:article`, lens analysis (implementation/concept/exploration)
- Article data layer: `src/lib/articles.ts` (getArticles, getArticleContent, getAdjacentArticles)
- RSS feed: `/feed.xml` (RSS 2.0 with XSL stylesheet)
- JSON feed: `/feed.json` (JSON Feed v1.1)
- llms.txt: `public/llms.txt` + `public/llms-full.txt` (generated by `scripts/generate-llms-txt.mjs`)
- Dynamic .mdx routes: `/experiments/<slug>.mdx`, `/experiments/<slug>/article.mdx`

### `docs/registry.md` -- Component Registry

- Overview: shadcn-compatible registry at `/r/<slug>`
- 4-step generation pipeline: `generate-registry-json.mjs` -> `build-registry.mjs` -> `post-process-registry.mjs` -> `generate-registry-mdx.mjs`
- Categories: experiments, components, collected, hooks, utilities, mdx, styles
- Collected components: `src/components/collected/<name>/`, Mode A (ported) vs Mode B (indexed reference), `meta.json` vs `library.json`
- Collected component previews: `/collected/<slug>` via `(collected-preview)` route group
- Fumadocs integration: `source.config.ts`, `content/registry/` (generated MDX), registry docs at `/registry/docs`
- Curation: `registry.config.json` (featured, hidden, overrides, scan targets)
- Installation: `npx shadcn@latest add https://www.razisyed.cv/r/<slug>`
- CDN asset streaming for binary assets
- `razi-style` shared style item

### `docs/toolkit.md` -- Animation and 3D Toolkit

- Toolkit integration layer at `src/lib/toolkit/`:
  - `scroll.ts` -- `createUnifiedScroll()`: Lenis + GSAP + Tempus unified RAF
  - `raf.ts` -- Tempus re-export
  - `r3f.tsx` -- `ExperimentCanvas`: Canvas wrapper with Tempus render driver
- **Priority chain**: -1 (Lenis scroll), 0 (GSAP animations), 1 (Three.js render loop)
- GSAP: dynamic import pattern, `useGSAP` hook, ScrollTrigger integration
- Motion: `motion/react` import path, layout animations, springs, gestures
- Lenis: smooth scroll, `window.__lenis` debug access, MCP scroll helpers
- Tempus: unified RAF, pausable time, delta clamping
- R3F: `ExperimentCanvas`, `TempusFrameDriver`, Zustand for state (`getState()` in useFrame)
- `useDevControls`: leva wrapper that tree-shakes in production
- Animation standards: timing, easing, reduced motion, motion vocabulary diversity

### `docs/deploy.md` -- CI/CD and Deploy

- Branching: `main` = production, feature branches (`feat/`, `fix/`, `port/`, `experiment/`)
- Vercel: auto-deploy on merge to main, preview on PRs, identical build pipeline
- **Build pipeline** (4 steps): `generate:posters` -> `generate:registry` -> `generate:llms-txt` -> `next build`
- CI (`.github/workflows/ci.yml`): two parallel jobs (checks + build), concurrency cancellation
- Lefthook pre-commit hooks (parallel): lint-check, typecheck, validate-experiments
- Entire.io: post-commit/pre-push session capture, checkpoint metadata on `entire/checkpoints/v1` branch
- Hook ownership table (which tool owns which git hook)
- Draft PRs for preview URLs
- Admin bypass for hotfixes

### `docs/scripts.md` -- Automation Scripts

- Table of all 16 scripts in `scripts/` with purpose and usage
- `generate:posters` -- ffmpeg first-frame extraction, skips wip
- `generate:registry` -- 4-step pipeline, what each step does
- `generate:llms-txt` -- two output files, filtering logic
- `validate:experiments` -- schema validation
- `capture` -- Playwright screenshot capture
- `optimize:videos` -- video compression
- `create-experiment.mjs` / `create-article.mjs` / `create-collected.mjs` -- non-interactive scaffolding flags
- `delete-experiment.mjs` / `delete-article.mjs` -- cleanup

### `docs/contributing.md` -- Contributing

- Code style: TypeScript (no `any`), React (server components default), dynamic imports
- Component size discipline: 200-line target, 300-line hard limit, decomposition pattern
- Biome/ultracite: `npm run lint` (check), `npm run fix` (autofix), parenthesized path workaround
- Testing: Vitest + testing-library, colocated test files, `npm test`
- Git: conventional commits, no AI authorship lines, Entire.io trailers OK
- Accessibility: alt text, aria-labels, touch targets, contrast, `prefers-reduced-motion`
- UX standards: Fitts's Law, Hick's Law, Miller's Law, Doherty Threshold

### `docs/ai-development.md` -- AI-Assisted Development

- `.agents/` directory structure and purpose (contexts, profiles, rules, skills, workflows)
- `AGENTS.md` as the AI-agent entry point, `CLAUDE.md` as the Claude-specific pointer
- Cursor integration: `.cursor/rules/` (auto-inject), `.cursor/skills/`, `.cursor/agents/`
- MCP tools: pinchtab, browser-devtools, context7
- Profiles: which `.agents/profiles/<name>.md` to read based on experiment.json `profile` field
- Skills inventory (11 active skills)
- Workflows inventory (7 workflows)
- `memory.md` continual learning system
- Backlog: `.agents/backlog/README.md`

---

## What stays unchanged

- **AGENTS.md** -- remains the AI-agent entry point, no changes needed (it's already comprehensive and current)
- **CLAUDE.md** -- unchanged (pointer to AGENTS.md and memory.md)
- `**.agents/` tree** -- unchanged (AI-agent reference docs)
- **Per-experiment `docs/`** -- unchanged (content constellation docs within experiments)

