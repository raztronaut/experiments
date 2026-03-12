# AI-Assisted Development

This project has deep integration with AI coding assistants. The `.agents/` directory provides rules, profiles, skills, and workflows that give agents context about the codebase architecture and coding standards.

## Entry Points

| File | Audience | Purpose |
|------|----------|---------|
| `AGENTS.md` | AI agents (all tools) | Primary entry point. Full project rules, commands, tech stack, standards, guardrails, and reference table. |
| `CLAUDE.md` | Claude Code | Pointer to `AGENTS.md` and `memory.md` |
| `memory.md` | AI agents | Auto-maintained learned preferences and workspace facts |
| `.cursor/rules/` | Cursor | Auto-injecting context rules |
| `.cursor/skills/` | Cursor | Task-triggered workflow skills |
| `.cursor/agents/` | Cursor | Specialized subagent personas |

## .agents/ Directory

```
.agents/
├── backlog/           # Pending work organized by theme (t1-t8)
├── contexts/          # Deep reference documents
│   ├── architecture.md    # Route groups, metadata schema, template system
│   ├── content-constellation.md  # 6-format content model, tooling, lifecycle
│   ├── toolkit.md         # All libraries, versions, integration patterns
│   └── writing-voice.md   # Article voice, lenses, section building blocks
├── profiles/          # Per-profile behavioral guidance
│   ├── blank.md
│   ├── dom-effect.md
│   ├── interaction.md
│   ├── mixed.md
│   ├── r3f-scene.md
│   ├── r3f-shader.md
│   ├── scrollytelling.md
│   └── web-audio.md
├── rules/             # Domain-specific coding rules
│   ├── animations.md      # GSAP, Motion, timing, easing
│   ├── experiments.md     # General experiment rules
│   ├── performance.md     # Render, bundle, runtime optimization
│   ├── r3f.md             # React Three Fiber patterns
│   ├── scroll.md          # Lenis, ScrollTrigger, unified scroll
│   └── shaders.md         # GLSL authoring patterns
├── skills/            # Reusable agent skills (SKILL.md per skill)
└── workflows/         # Step-by-step procedures (one .md per workflow)
```

### Profiles

Each experiment's `experiment.json` has a `profile` field. Agents read the corresponding `.agents/profiles/<profile>.md` for profile-specific guidance: recommended patterns, common pitfalls, template explanations, and library-specific integration notes.

### Rules

Domain-specific rules that agents should read before working in that area:

| Rule | Read when |
|------|-----------|
| `animations.md` | Editing components with GSAP, Motion, or scroll-driven animation |
| `r3f.md` | Editing R3F scenes, Canvas, useFrame, drei components |
| `shaders.md` | Editing .glsl/.frag/.vert files or ShaderMaterial |
| `scroll.md` | Using Lenis, ScrollTrigger, or createUnifiedScroll |
| `performance.md` | Optimizing render, bundle, or runtime performance |
| `experiments.md` | Creating or modifying any experiment |

### Skills

Library-specific patterns and reusable workflows:

| Skill | Purpose |
|-------|---------|
| `gsap-modern` | Modern GSAP patterns with useGSAP, ScrollTrigger, Tempus, dynamic imports |
| `lenis-scroll` | Lenis smooth scroll with GSAP and Tempus integration |
| `motion-react` | Motion (Framer Motion) React patterns |
| `r3f-core` | React Three Fiber scene setup, useFrame, Zustand, drei |
| `shader-authoring` | GLSL patterns, composable utility library, ShaderMaterial setup |
| `tempus-raf` | Tempus unified RAF, priority system, R3F binding |
| `porting-demos` | Porting external demos into the experiments lab |
| `quick-component` | Porting components into the collected registry |
| `visual-qa` | 8-category structured visual QA using MCP tools |
| `vercel-react-best-practices` | React/Next.js performance optimization |

### Workflows

Step-by-step procedures for common operations:

| Workflow | Steps | Purpose |
|----------|-------|---------|
| `new-experiment` | Scaffold | Create a new experiment with all required files |
| `develop-experiment` | Develop | Work on an experiment with isolation guardrails |
| `publish-experiment` | 5 phases, 18 steps | Full content constellation from shipped experiment |
| `add-experiment-component` | Add | Add a new component within an experiment |
| `add-experiment-assets` | Add | Add images, 3D models, or other assets |
| `cleanup-experiment` | Remove | Safely remove an experiment and all files |
| `visual-qa` | Review | Structured visual QA with MCP tools |

## Cursor Integration

### Rules (.cursor/rules/)

Auto-inject context when matching files are open in the editor:

| Rule | Glob | Injects |
|------|------|---------|
| `experiment-metadata` | `**/experiment.json` | Schema, lifecycle, validation |
| `article-writing` | `**/article/content.mdx` | Voice, structure, MDX wiring, demo strategy |
| `experiment-components` | `src/components/experiments/**/*.tsx` | Size discipline, animation standards |
| `content-docs` | `src/app/experiments/**/docs/*.md` | Format templates |
| `generation-scripts` | `scripts/generate-*.mjs` | Pipeline architecture |
| `registry-curation` | `**/registry.config.json` | Config schema, downstream impact |

### Skills (.cursor/skills/)

Task-triggered workflows discoverable in Cursor:

| Skill | Triggers on |
|-------|-------------|
| `publish-content` | "content constellation", "publish", "write article for" |
| `audit-content` | "content status", "coverage gaps", "what needs writing" |
| `run-generation` | "generate registry", "run generation", build pipeline |
| `continual-learning` | Plugin-provided hook + workspace skill override; mines transcripts to update `memory.md` |

### Subagents (.cursor/agents/)

Specialized personas for content workflows:

| Agent | Purpose |
|-------|---------|
| `content-writer` | Lens analysis, article brief collaboration, writing in the project's voice |
| `content-auditor` | Content coverage scanning, schema gap reporting, prioritization |

## MCP Tools

Configured in `.cursor/mcp.json`:

| Tool | Purpose |
|------|---------|
| **pinchtab** | AI-optimized browser automation. Token-efficient (~800 tokens/page). Primary tool for visual QA. |
| **Browser DevTools MCP** | React DevTools, console capture, network monitoring, Web Vitals, annotated screenshots |
| **context7** | Library documentation lookup. Resolve library ID, then query for up-to-date docs and code examples. |
| **basement mcp-three** | GLTF/GLB to R3F JSX conversion + model structure analysis |

### Queryable Metrics

All dev metrics are written to `window.__experimentMetrics` in development. Agents using pinchtab or browser-devtools can query:

```js
eval("JSON.stringify(window.__experimentMetrics)")
```

Returns structured JSON with `fps`, `fpsMin`, `heap`, `cls`, `gsapTweens`, `r3f`, `scene`, `timestamp`.

## memory.md

Auto-maintained by the `continual-learning` Cursor plugin (stop hook triggers mining) with a workspace skill override at `.cursor/skills/continual-learning/SKILL.md` that targets `memory.md` instead of the plugin's default `AGENTS.md`. Contains two sections:

- **Learned User Preferences**: coding style preferences, workflow conventions, decision patterns extracted from past conversations (max 12 bullets)
- **Learned Workspace Facts**: technical details about the codebase discovered during development -- priority chain values, component counts, library quirks, etc. (max 12 bullets)

The plugin's stop hook counts completed agent turns and triggers mining after 10 turns and 120 minutes. The skill uses incremental transcript processing (`.cursor/hooks/state/continual-learning-index.json`) to avoid re-reading already-processed transcripts. Agents read `memory.md` at the start of every session to avoid repeating past mistakes and to respect established conventions.

## Backlog

`.agents/backlog/README.md` is the canonical running list of all pending work, organized by theme:

| Theme | File | Scope |
|-------|------|-------|
| t1 | `t1-infrastructure.md` | Infrastructure improvements |
| t2 | `t2-content-registry.md` | Content and registry work |
| t3 | `t3-agent-docs.md` | Agent documentation |
| t4 | `t4-announcing-v2.md` | V2 announcement experiment |
| t5 | `t5-toolkit-platform.md` | Toolkit and platform |
| t6 | `t6-deferred.md` | Deferred items (don't attempt) |
| t7 | `t7-nice-to-have.md` | Nice-to-have improvements |
| t8 | `t8-architecture-restructuring.md` | Architecture restructuring |

`completed.md` tracks finished items. Agents should read the backlog when planning or starting a new session.

## Guardrails

AI agents follow these safety rules (enforced via AGENTS.md):

- **2-Iteration Limit**: if an approach fails twice, stop, summarize, and present alternatives
- **Visual/Spatial Honesty**: for WebGL, shaders, physics -- acknowledge inability to see output, provide best-effort with clear TODOs
- **Pre-Commit Verification**: `tsc --noEmit` must pass before any commit
- **Bug Fix Scope**: stay confined to files directly related to the bug, no drive-by refactors
- **Context Hygiene**: write large tool outputs to scratch files, return summaries
