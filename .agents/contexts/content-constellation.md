---
description: Overview of the content constellation system -- 6-format content model, tooling, lifecycle, and agent integration
---

# Content Constellation

Each experiment can have a **content constellation** -- 6 formats targeting different audiences, generated via the publish workflow.

## The 6 Formats

| Format | File | Audience | Voice |
|--------|------|----------|-------|
| Article | `article/content.mdx` | Public (engineers, designers, creative coders) | RNDR Realm + Maxime Heckel (see `writing-voice.md`) |
| Lab Note | `docs/lab-note.md` | Internal (future self, collaborators) | Honest, reflective |
| Architecture | `docs/architecture.md` | Engineers | Terse, technical |
| Snippet | `docs/snippet.md` | Developers | Copy-paste ready |
| Social | `docs/social.md` | Twitter/X, Discord | Punchy, progressive reveal |
| Changelog | `docs/changelog.md` | Internal | Chronological, factual |

## Lifecycle

```
status: "shipped"  →  publish workflow (5 phases)  →  publishable: true
```

- `publishable` is the OUTPUT of the workflow, not an input gate
- Prerequisite: `status: "shipped"` and visual QA passed
- The `content` object in `experiment.json` tracks which formats exist (cross-checked by pre-commit validator)

## File Locations

Content lives inside the experiment route group:

```
src/app/experiments/(slug)/slug/
├── article/
│   ├── page.tsx           # MDX rendering, component wiring, JSON-LD
│   ├── content.mdx        # Article body (frontmatter + prose)
│   └── components.tsx     # "use client" interactive demos
└── docs/
    ├── lab-note.md
    ├── architecture.md
    ├── snippet.md
    ├── social.md
    └── changelog.md
```

## Scaffolding

```bash
npm run new:article              # creates 8 files, sets content.article: true (interactive)
npm run new:article:auto -- --name <slug>  # non-interactive equivalent for AI agents
npm run delete:article <slug> # removes article/ + docs/, resets content + publishable
```

## Key Technical Patterns

- **No `import` in MDX** -- `next-mdx-remote` doesn't support it. Build demos in `components.tsx`, import in `page.tsx`, spread into `components` prop.
- **Canvas 2D / CSS for article demos** -- avoid loading Three.js in article context. For shader experiments, recreate effects in Canvas 2D with parameter sliders.
- **Typography is CSS-first** -- `experiments.css` (Sylph port) handles all article typography. MDX component map does NOT override heading/paragraph styles.
- **Progressive demo pattern** -- for complex experiments, build a series of demos where each adds one technique layer (Step1Demo → Step2Demo → ... → LiveDemo at the end).

## Tooling Inventory

### Cursor-Native Tools (`.cursor/`)

**Rules** (auto-inject when matching files are open):

| Rule | Glob | Injects |
|------|------|---------|
| `experiment-metadata.mdc` | `**/experiment.json` | Schema, lifecycle, validation |
| `article-writing.mdc` | `**/article/content.mdx` | Voice, structure, MDX wiring, demo strategy |
| `experiment-components.mdc` | `src/components/experiments/**/*.tsx` | Size discipline, animation standards |
| `content-docs.mdc` | `src/app/experiments/**/docs/*.md` | Format templates |
| `generation-scripts.mdc` | `scripts/generate-*.mjs` | Pipeline architecture |
| `registry-curation.mdc` | `**/registry.config.json` | Config schema, downstream impact |

**Skills** (task-triggered workflows):

| Skill | Triggers on |
|-------|-------------|
| `publish-content` | "content constellation", "publish", "write article for" |
| `audit-content` | "content status", "coverage gaps", "what needs writing" |
| `run-generation` | "generate registry", "run generation", build pipeline |

**Subagents** (specialized personas):

| Agent | Purpose |
|-------|---------|
| `content-writer` | RNDR Realm + Maxime Heckel voice, progressive demo planning |
| `content-auditor` | Content coverage scanning, schema gap reporting |

### Agent Knowledge Base (`.agents/`)

| Doc | Role |
|-----|------|
| `workflows/publish-experiment.md` | Canonical 5-phase, 18-step publish procedure |
| `contexts/writing-voice.md` | Voice characteristics, anti-patterns, format templates |

### Generation Pipeline

Content feeds into these build-time generators (all skip `status: "wip"`):

| Command | Output |
|---------|--------|
| `npm run generate:registry` | `public/registry/*.json`, `content/registry/**/*.mdx` |
| `npm run generate:posters` | `public/experiments/*/poster.jpg` |
| `npm run generate:llms-txt` | `public/llms.txt`, `public/llms-full.txt` |

## Validation

The pre-commit validator (`scripts/validate-experiments.mjs`) cross-checks `content` flags in `experiment.json` against actual files on disk. If `content.article: true` but `article/content.mdx` doesn't exist, the commit fails.

Quick check: `npm run validate:experiments`

## Reference Implementation

**basketball-replay-center** and **404-not-found** -- the two experiments with all 6 content types complete. Study them before writing your first article:
- Progressive Canvas 2D demos reimplementing shader techniques with interactive sliders
- Full MDX wiring pattern with custom `components.tsx`
- All 5 docs formats populated with real content

## Current State

- 3/18 experiments have articles (`send-button`, `basketball-replay-center`, `404-not-found`)
- 15 experiments have `content: {}` -- the largest content gap
- `updated`, `inspiration`, `related` fields empty across most experiments
