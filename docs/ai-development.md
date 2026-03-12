# AI-Assisted Development

This repo is set up for AI-assisted work, but the goal is not to hand control over to agents. The goal is to use Codex, Cursor, worktrees, and automations as force multipliers while keeping review, testing, and deploy decisions explicit.

Use this document as the human/operator guide. For the full agent instruction set, start with `AGENTS.md`. For day-to-day automation handling, use `.agents/workflows/automation-ops.md`.

## How To Use AI In This Repo

The core surfaces each have a distinct job:

| Surface | What it is for |
|---------|----------------|
| `AGENTS.md` | Canonical repo rules for AI agents: commands, guardrails, workflows, and domain references |
| `.agents/` | Deep internal guidance for agents: contexts, workflows, rules, profiles, and skills |
| `.cursor/` | Cursor-native rules, skills, and subagents that auto-inject or trigger in-editor |
| `memory.md` | Auto-maintained preferences and workspace facts that help agents avoid repeating mistakes |

Simple mental model:

- `AGENTS.md` tells an agent how not to get lost.
- `.agents/` tells an agent how to do domain work correctly.
- `.cursor/` makes Cursor behave more like a repo-aware teammate.
- `memory.md` preserves lessons learned from past sessions.

## Codex Automations In Practice

Codex automations are recurring tasks that run against a workspace and should leave either:

- a clear, reviewable code or docs diff
- or a concise report with exact next steps

Treat the output as a proposed work product, not as an auto-mergeable answer.

On this machine, the current examples include:

- `test-gap-detection`: usually produces code and tests in a worktree
- `update-changelog`: usually produces a small docs diff
- `automated-architectural-docs`: usually produces doc suggestions or small edits

Default review flow:

1. Inspect the result and classify it.
2. Review the worktree diff.
3. Run the normal repo checks.
4. Decide whether to continue there, open a PR, fold it into other work, backlog it, or discard it.

### Compact Checklist: Review An Automation Result

- [ ] Scope matches the automation prompt
- [ ] `git status` and `git diff` make sense
- [ ] No unrelated file churn
- [ ] Required checks passed
- [ ] Visual QA done if UI changed
- [ ] Result classified as mergeable, continue here, backlog, or discard

## Worktrees Without Fear

A worktree is just another checkout of the same repo attached to a branch. It gives you an isolated working directory without forcing you to stash or swap your main checkout.

Why that matters for AI runs:

- automations can work in isolation
- you can inspect or continue their output without disturbing your main checkout
- each worktree maps naturally to a branch and, if needed, a PR

Useful mental model:

- **branch** = line of history
- **worktree** = place on disk where you edit that branch
- **PR** = review and deploy surface for that branch

If an automation already made useful changes, continuing in that same worktree is often the simplest path. If the output is mostly diagnostic or the scope expanded, start fresh on a new branch/worktree instead.

## Recommended Hybrid Workflow

This repo should not be run in either extreme:

- not "PR everything even if it is a one-line changelog fix"
- not "let automations edit the repo and merge themselves"

The recommended hybrid model is:

1. Use automations to propose or prepare work.
2. Review the output like any other branch-sized unit of work.
3. Keep substantive or externally visible work on the normal branch/PR/preview path.
4. Allow tiny, low-risk maintenance changes to be integrated locally only when review is straightforward and no deploy-risking systems are involved.

This keeps AI useful without turning review into ceremony for every trivial change.

### Compact Checklist: PR Vs Direct Integration

- [ ] Is the change tiny and low-risk?
- [ ] Is it docs-only or trivial maintenance?
- [ ] Does it avoid config, deploy, registry, and generated-surface risk?
- [ ] Is a preview URL unnecessary?

If any answer is "no", use a PR.

## When To Trust Vs Verify Harder

Some AI-generated changes are cheap to validate. Others are not.

Lower-risk examples:

- changelog updates
- doc wording or cross-link fixes
- small architecture doc refreshes

Higher-risk examples:

- build, config, or deploy changes
- registry generation or URL-contract changes
- experiment behavior changes
- `announcing-v2` rollout work

Visual work always needs harder verification. If a change affects UI, motion, registry pages, or generated outputs, review it on a preview URL instead of trusting local static checks alone.

`announcing-v2` is the clearest example in this repo: even if an automation prepares most of the branch, it still needs PR review, preview validation, and visual QA before merge.

## Entry Points

| File | Audience | Purpose |
|------|----------|---------|
| `AGENTS.md` | AI agents (all tools) | Primary entry point. Full project rules, commands, tech stack, standards, guardrails, and reference table. |
| `CLAUDE.md` | Claude Code | Pointer to `AGENTS.md` and `memory.md` |
| `memory.md` | AI agents | Auto-maintained learned preferences and workspace facts |
| `.cursor/rules/` | Cursor | Auto-injecting context rules |
| `.cursor/skills/` | Cursor | Task-triggered workflow skills |
| `.cursor/agents/` | Cursor | Specialized subagent personas |

## Recommended Daily Operating Pattern

1. Start in your main checkout or a clean feature branch.
2. Let an automation or agent prepare work in a worktree when that helps.
3. Review the diff before trusting the output.
4. Run the repo checks before committing:
   - `npm run lint`
   - `npm run typecheck`
   - `npm test -- --run --project unit`
   - `npm run build`
5. Push and open a draft PR if the work is substantive or externally visible.
6. Use the preview URL for UI, motion, registry, and rollout validation.

This matches the repo's branch, CI, and deploy model rather than bypassing it.

## .agents/ Directory

```
.agents/
├── backlog/           # Pending work organized by theme (t1-t8)
├── contexts/          # Deep reference documents
│   ├── architecture.md    # Route groups, metadata schema, template system
│   ├── automation-system.md  # Codex automation model, prompt design, maintenance
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
| `automation-ops` | Operate | Review automation output, use worktrees safely, and decide PR vs direct integration |

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

## Where To Go Next

- Read [Deploy](deploy.md) for the human PR, preview, and merge playbook.
- Read `.agents/workflows/automation-ops.md` for the canonical automation/worktree operator workflow.
- Read `.agents/backlog/README.md` when automation findings should become deferred work.
