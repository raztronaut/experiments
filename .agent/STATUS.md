# AI Coding Configuration -- Bootstrap

> Read this first. It tells you what exists, how the config layers work, and where to find details.

---

## What Is This

A creative coding lab built for AI-native development. Experiments are isolated Next.js route groups, each with its own `<html>`/`<body>`. The platform scaffolds, builds, and publishes experimental UI, shaders, 3D scenes, and interactive components.

**For architecture details**: read `contexts/architecture.md`
**For libraries, tools, and dev infrastructure**: read `contexts/toolkit.md`
**For content voice and article writing**: read `contexts/writing-voice.md`

---

## Current State

- **18 legacy experiments** (pre-V2, `legacy: true`, all `status: "shipped"`) -- untouchable, no modifications
- **1 V2 experiment** (`announcing-v2`, status: wip) -- showcase of the V2 platform with scrollytelling + R3F + shaders
- **2 published articles** (send-button, basketball-replay-center)
- **V2 infrastructure**: complete (AI config, toolkit, dev tools, templates, content pipeline, CI)
- **Agent docs improvement effort**: in progress -- gap analysis against darkroom.engineering, basement.studio, and tambo-ai reference implementations. Organized as 8 parallel domains (see `.cursor/plans/agent_docs_gap_analysis_*.plan.md`).
- **19 total experiments**, all valid

---

## How the Config Layers Work

The config loads progressively to minimize token overhead:

1. **AGENTS.md** -- loads automatically in any AGENTS.md-compatible tool. Portable coding standards.
2. **Rules** (6) -- path-conditioned. Cursor reads `file_patterns` frontmatter and loads rules when you edit matching files. `experiments.md` is always-on; `r3f.md`, `shaders.md`, `animations.md`, `scroll.md`, `performance.md` activate on experiment files.
3. **Profiles** (7) -- experiment-type behavioral modes. Read `experiment.json` -> find `"profile": "r3f-scene"` -> read `.agent/profiles/r3f-scene.md`. Profiles shape trade-off decisions, not just API usage. Includes `mixed.md` for experiments combining scroll + R3F + interaction.
4. **Skills** (8) -- on-demand technology references. Concise (<5K tokens each). Referenced when working with specific libraries.
5. **Workflows** (7) -- step-by-step procedures for scaffolding, developing, publishing, cleanup.
6. **Contexts** (3) -- background reference for architecture, toolkit inventory, and writing voice.

---

## Constraints

- **Legacy experiments are untouchable.** All 18 pre-V2 experiments stay exactly as they are. No layout migration, no code changes, no refactoring.
- **Biome is deliberately permissive.** 30+ rules disabled for legacy creative experiments. AGENTS.md defines stricter standards that AI agents enforce during development. `useExhaustiveDependencies` is enabled as `warn` with existing violations suppressed.
- **No cross-experiment imports.** Each experiment is fully isolated. Shared code lives in `@/components/ui/`, `@/lib/`, or `@/components/dev/`.
- **Generation scripts filter `wip`** -- `generate:registry`, `generate:posters`, and `generate:llms-txt` skip experiments with `status: "wip"` so test fixtures don't pollute production artifacts.

---

## Known Gaps (Explicitly Deferred)

- **MCP capture server** -- lightweight `window.__experimentMetrics` queryable surface exists; full MCP server not built
- **Lighthouse CI** -- needs deployed preview URLs
- **ArticleLayout TOC** -- commented out, needs scroll-spy + responsive design
- **Content for 16 experiments** -- only send-button and basketball-replay-center have articles
- **Registry V2** -- interactive docs pages with live demos not started
- **Dedicated `/writing` index page** -- homepage Writing section exists; standalone page deferred until article count exceeds ~6
- **Preview video recording is intentionally manual** -- developer records via QuickTime/OBS, places in `public/experiments/<slug>/preview.mp4`. `generate-posters.mjs` auto-extracts poster.jpg from video. `capture.mjs` handles screenshots only. This is not a gap to automate.
- **Agent docs gaps** -- identified via reference repo analysis (Domain 1-7 in gap analysis plan). Key areas: R3F Tempus binding, expanded GLSL utilities, motion vocabulary diversity, mixed-profile guidance, portable creative patterns skill. In progress.
- **Biome strictness** -- `useExhaustiveDependencies` warn-only, `noExplicitAny`/`noUnusedVariables` disabled, 7 a11y rules disabled. Deferred to dedicated linting tightening pass.
- **Cursor.tsx `getCursorColor` perf bug** -- acknowledged, deferred
